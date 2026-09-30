import bcrypt from "bcryptjs";
import type { RequestHandler } from "express";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "../utils/tokens.js";

async function issueTokens(user: { _id: unknown; role: "user" | "admin" }) {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  await User.updateOne({ _id: user._id }, { refreshTokenHash: await bcrypt.hash(refreshToken, 12) });
  return { accessToken, refreshToken };
}

export const signup: RequestHandler = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (![name, email, phone, password].every((value) => typeof value === "string" && value.trim())) {
    throw new AppError("name, email, phone, and password are required");
  }
  if (password.length < 8) throw new AppError("Password must be at least 8 characters");
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) throw new AppError("Email is already registered", 409);
  const user = await User.create({ name: name.trim(), email: normalizedEmail, phone: phone.trim(), passwordHash: await bcrypt.hash(password, 12) });
  res.status(201).json({ user: user.toJSON(), ...(await issueTokens(user)) });
});

export const login: RequestHandler = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== "string" || typeof password !== "string") throw new AppError("Email and password are required");
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new AppError("Invalid email or password", 401);
  res.json({ user: user.toJSON(), ...(await issueTokens(user)) });
});

export const refresh: RequestHandler = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (typeof refreshToken !== "string") throw new AppError("refreshToken is required", 401);
  try {
    const payload = verifyRefreshToken(refreshToken);
    if (payload.type !== "refresh") throw new Error("Wrong token type");
    const user = await User.findById(payload.sub).select("+refreshTokenHash");
    if (!user?.refreshTokenHash || !(await bcrypt.compare(refreshToken, user.refreshTokenHash))) {
      throw new AppError("Refresh token is invalid", 401);
    }
    res.json(await issueTokens(user));
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Refresh token is invalid or expired", 401);
  }
});

export const logout: RequestHandler = asyncHandler(async (req, res) => {
  if (req.user) await User.updateOne({ _id: req.user._id }, { $unset: { refreshTokenHash: 1 } });
  res.status(204).send();
});
