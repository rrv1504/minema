import type { RequestHandler } from "express";
import { Booking } from "../models/Booking.js";
import { Hall } from "../models/Hall.js";
import { Movie } from "../models/Movie.js";
import { Snack } from "../models/Snack.js";
import { User } from "../models/User.js";
import { assertBookingAvailability } from "../services/availabilityService.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createBooking: RequestHandler = asyncHandler(async (req, res) => {
  const { movieId, hallId, selectedDate, timeSlot, groupSize, snacks = [] } = req.body;
  if (![movieId, hallId, selectedDate, timeSlot].every((value) => typeof value === "string") || !Number.isInteger(groupSize) || groupSize < 1) {
    throw new AppError("movieId, hallId, selectedDate, timeSlot, and a positive integer groupSize are required");
  }
  if (!Array.isArray(snacks) || snacks.some((item) => typeof item !== "object" || typeof item.name !== "string")) {
    throw new AppError("snacks must be an array of snack selections");
  }
  const [movie, hall] = await Promise.all([Movie.findById(movieId), Hall.findById(hallId)]);
  if (!movie?.isActive) throw new AppError("Movie is unavailable", 404);
  if (!hall?.isActive) throw new AppError("Hall is unavailable", 404);
  await assertBookingAvailability(hallId, selectedDate, timeSlot, groupSize);
  const names = snacks.map((item: { name: string }) => item.name);
  const snackDocs = names.length ? await Snack.find({ name: { $in: names }, isActive: true }) : [];
  if (snackDocs.length !== names.length) throw new AppError("One or more snacks are unavailable");
  const snackMap = new Map(snackDocs.map((snack) => [snack.name, snack]));
  const selectedSnacks = names.map((name: string) => ({ name, price: snackMap.get(name)!.price }));
  const hallPrice = movie.pricePerPerson * groupSize;
  const snacksTotal = selectedSnacks.reduce((total, snack) => total + snack.price, 0);
  try {
    const booking = await Booking.create({
      userId: req.user!._id, movieId, hallId, selectedDate, timeSlot, groupSize, hallPrice,
      snacks: selectedSnacks, snacksTotal, grandTotal: hallPrice + snacksTotal
    });
    await Promise.all([
      Movie.updateOne({ _id: movieId }, { $inc: { totalBookings: 1 } }),
      User.updateOne({ _id: req.user!._id }, { $addToSet: { bookingHistory: booking._id, preferredGenres: movie.genre } })
    ]);
    res.status(201).json(booking);
  } catch (error: any) {
    if (error?.code === 11000) throw new AppError("This hall was just booked for that time slot", 409);
    throw error;
  }
});

export const myBookings: RequestHandler = asyncHandler(async (req, res) => {
  res.json(await Booking.find({ userId: req.user!._id }).populate("movieId", "title imageUrl durationMinutes genre").populate("hallId", "name capacity").sort({ selectedDate: -1, bookingDate: -1 }));
});

export const getBooking: RequestHandler = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("movieId", "title imageUrl durationMinutes genre").populate("hallId", "name capacity").populate("userId", "name email phone");
  if (!booking) throw new AppError("Booking not found", 404);
  const ownerId = String((booking.userId as any)._id || booking.userId);
  if (req.user!.role !== "admin" && ownerId !== String(req.user!._id)) throw new AppError("You cannot access this booking", 403);
  res.json(booking);
});

export const cancelBooking: RequestHandler = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new AppError("Booking not found", 404);
  if (req.user!.role !== "admin" && String(booking.userId) !== String(req.user!._id)) throw new AppError("You cannot cancel this booking", 403);
  if (booking.status === "cancelled") throw new AppError("Booking is already cancelled");
  booking.status = "cancelled";
  booking.cancellationReason = typeof req.body.cancellationReason === "string" ? req.body.cancellationReason.trim() : undefined;
  await booking.save();
  await Movie.updateOne({ _id: booking.movieId, totalBookings: { $gt: 0 } }, { $inc: { totalBookings: -1 } });
  res.json(booking);
});

export const listBookings: RequestHandler = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = {};
  for (const key of ["status", "hallId", "movieId", "userId", "selectedDate"]) if (typeof req.query[key] === "string") filter[key] = req.query[key];
  if (typeof req.query.from === "string" || typeof req.query.to === "string") {
    filter.selectedDate = { ...(typeof req.query.from === "string" ? { $gte: req.query.from } : {}), ...(typeof req.query.to === "string" ? { $lte: req.query.to } : {}) };
  }
  res.json(await Booking.find(filter).populate("movieId", "title imageUrl genre").populate("hallId", "name capacity").populate("userId", "name email phone").sort({ selectedDate: -1, bookingDate: -1 }));
});
