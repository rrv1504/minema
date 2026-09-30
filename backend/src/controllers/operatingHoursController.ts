import type { RequestHandler } from "express";
import { OperatingHours } from "../models/OperatingHours.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseTimeToMinutes } from "../utils/dateTime.js";

export const listOperatingHours: RequestHandler = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = {};
  if (typeof req.query.from === "string" || typeof req.query.to === "string") {
    filter.date = { ...(typeof req.query.from === "string" ? { $gte: req.query.from } : {}), ...(typeof req.query.to === "string" ? { $lte: req.query.to } : {}) };
  }
  res.json(await OperatingHours.find(filter).sort({ date: 1 }));
});

export const updateOperatingHours: RequestHandler = asyncHandler(async (req, res) => {
  const date = String(req.params.date);
  const { startTime, endTime } = req.body;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || typeof startTime !== "string" || typeof endTime !== "string") throw new AppError("A YYYY-MM-DD date, startTime, and endTime are required");
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start === null || end === null || end <= start) throw new AppError("Operating hours are invalid");
  res.json(await OperatingHours.findOneAndUpdate({ date }, { date, startTime, endTime }, { upsert: true, new: true, runValidators: true }));
});
