import type { ErrorRequestHandler, RequestHandler } from "express";
import { AppError } from "../utils/AppError.js";

export const notFound: RequestHandler = (req, _res, next) =>
  next(new AppError("Route " + req.method + " " + req.originalUrl + " not found", 404));

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error?.code === 11000) return res.status(409).json({ message: "A record with those values already exists" });
  if (error?.name === "ValidationError") return res.status(400).json({ message: error.message });
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  if (statusCode === 500) console.error(error);
  return res.status(statusCode).json({ message: error.message || "Internal server error" });
};
