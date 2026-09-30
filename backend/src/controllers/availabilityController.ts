import type { RequestHandler } from "express";
import { getAvailability } from "../services/availabilityService.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const availability: RequestHandler = asyncHandler(async (req, res) => {
  const hallId = typeof req.query.hallId === "string" ? req.query.hallId : "";
  const date = typeof req.query.date === "string" ? req.query.date : "";
  if (!hallId || !date) throw new AppError("hallId and date are required");
  res.json(await getAvailability(hallId, date));
});
