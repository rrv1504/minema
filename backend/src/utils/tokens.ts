import jwt from "jsonwebtoken";
import type { IUser } from "../models/User.js";

type TokenPayload = { sub: string; role: IUser["role"]; type: "access" | "refresh" };

function getSecret(name: "JWT_SECRET" | "JWT_REFRESH_SECRET"): string {
  const value = process.env[name];
  if (!value) throw new Error(name + " is required");
  return value;
}

export function createAccessToken(user: { _id: unknown; role: IUser["role"] }): string {
  return jwt.sign({ sub: String(user._id), role: user.role, type: "access" }, getSecret("JWT_SECRET"), { expiresIn: "15m" });
}

export function createRefreshToken(user: { _id: unknown; role: IUser["role"] }): string {
  return jwt.sign({ sub: String(user._id), role: user.role, type: "refresh" }, getSecret("JWT_REFRESH_SECRET"), { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, getSecret("JWT_SECRET")) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, getSecret("JWT_REFRESH_SECRET")) as TokenPayload;
}
