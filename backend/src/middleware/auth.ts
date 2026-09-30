import type { RequestHandler } from "express";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/tokens.js";

export const requireAuth: RequestHandler = asyncHandler(async (req, _res, next) => {
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new AppError("Authentication required", 401);
  try {
    const payload = verifyAccessToken(token);
    if (payload.type !== "access") throw new Error("Wrong token type");
    const user = await User.findById(payload.sub);
    if (!user) throw new AppError("User no longer exists", 401);
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Invalid or expired access token", 401);
  }
});

export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (req.user?.role !== "admin") return next(new AppError("Admin access required", 403));
  next();
};
