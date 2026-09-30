import { Schema, model, type HydratedDocument, type Types } from "mongoose";

export type UserRole = "user" | "admin";

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone: string;
  bookingHistory: Types.ObjectId[];
  preferredGenres: string[];
  moodHistory: Array<{ mood: string; timestamp: Date }>;
  refreshTokenHash?: string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    phone: { type: String, required: true, trim: true },
    bookingHistory: [{ type: Schema.Types.ObjectId, ref: "Booking" }],
    preferredGenres: [{ type: String, trim: true }],
    moodHistory: [{ mood: { type: String, required: true }, timestamp: { type: Date, default: Date.now } }],
    refreshTokenHash: { type: String, select: false }
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const output = ret as any;
    output.id = output._id.toString();
    delete output._id;
    delete output.__v;
    delete output.passwordHash;
    delete output.refreshTokenHash;
    return output;
  }
});

export type UserDocument = HydratedDocument<IUser>;
export const User = model<IUser>("User", userSchema);
