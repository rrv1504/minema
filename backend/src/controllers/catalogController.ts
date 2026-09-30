import type { RequestHandler } from "express";
import { Hall } from "../models/Hall.js";
import { Movie } from "../models/Movie.js";
import { Snack } from "../models/Snack.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function makeCatalogController(Model: any, label: string) {
  const list: RequestHandler = asyncHandler(async (req, res) => {
    const filter = req.user?.role === "admin" && req.query.includeInactive === "true" ? {} : { isActive: true };
    res.json(await Model.find(filter).sort({ createdAt: -1 }));
  });
  const getOne: RequestHandler = asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item || (!item.isActive && req.user?.role !== "admin")) throw new AppError(label + " not found", 404);
    res.json(item);
  });
  const create: RequestHandler = asyncHandler(async (req, res) => res.status(201).json(await Model.create(req.body)));
  const update: RequestHandler = asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) throw new AppError(label + " not found", 404);
    res.json(item);
  });
  const remove: RequestHandler = asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!item) throw new AppError(label + " not found", 404);
    res.status(204).send();
  });
  return { list, getOne, create, update, remove };
}

export const movies = makeCatalogController(Movie, "Movie");
export const halls = makeCatalogController(Hall, "Hall");
export const snacks = makeCatalogController(Snack, "Snack");
