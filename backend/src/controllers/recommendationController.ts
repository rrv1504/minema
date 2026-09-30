import type { RequestHandler } from "express";
import { Booking } from "../models/Booking.js";
import { Movie } from "../models/Movie.js";
import { User } from "../models/User.js";
import { getRecommendations } from "../services/recommendationService.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const moodKeys = ["pumped", "romantic", "mysterious", "adventurous", "chill", "epic"] as const;

export const recommend: RequestHandler = asyncHandler(async (req, res) => {
  const { groupSize, moodDistribution } = req.body;
  if (!Number.isInteger(groupSize) || groupSize < 1) throw new AppError("groupSize must be a positive integer");
  if (!moodDistribution || typeof moodDistribution !== "object") throw new AppError("moodDistribution is required");
  const normalizedMoods = Object.fromEntries(moodKeys.map((key) => [key, Number.isFinite(moodDistribution[key]) && moodDistribution[key] >= 0 ? moodDistribution[key] : 0]));
  if (Object.values(normalizedMoods).reduce((total, value) => total + value, 0) === 0) throw new AppError("At least one mood count must be positive");
  const [movies, bookings] = await Promise.all([
    Movie.find({ isActive: true }).lean(),
    Booking.find({ userId: req.user!._id, status: "confirmed" }).populate("movieId", "genre").lean()
  ]);
  if (!movies.length) throw new AppError("No active movies are available", 404);
  const userBookingGenres = bookings.map((booking: any) => booking.movieId?.genre).filter((genre: unknown): genre is string => typeof genre === "string");
  const result = await getRecommendations({
    userId: String(req.user!._id),
    groupSize,
    moodDistribution: normalizedMoods,
    movies: movies.map((movie) => ({ id: String(movie._id), title: movie.title, genre: movie.genre, rating: movie.rating, totalBookings: movie.totalBookings })),
    userBookingGenres
  });
  await User.updateOne({ _id: req.user!._id }, { $push: { moodHistory: { mood: result.dominantMood, timestamp: new Date() } } });
  res.json(result);
});
