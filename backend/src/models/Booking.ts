import { Schema, model, type Types } from "mongoose";

export type BookingStatus = "confirmed" | "cancelled";

export interface IBooking {
  userId: Types.ObjectId;
  movieId: Types.ObjectId;
  hallId: Types.ObjectId;
  selectedDate: string;
  timeSlot: string;
  groupSize: number;
  hallPrice: number;
  snacks: Array<{ name: string; price: number }>;
  snacksTotal: number;
  grandTotal: number;
  status: BookingStatus;
  bookingDate: Date;
  cancellationReason?: string;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    movieId: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
    hallId: { type: Schema.Types.ObjectId, ref: "Hall", required: true },
    selectedDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    timeSlot: { type: String, required: true, trim: true },
    groupSize: { type: Number, required: true, min: 1 },
    hallPrice: { type: Number, required: true, min: 0 },
    snacks: [{ name: { type: String, required: true }, price: { type: Number, required: true, min: 0 } }],
    snacksTotal: { type: Number, required: true, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
    bookingDate: { type: Date, default: Date.now },
    cancellationReason: { type: String, trim: true }
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

bookingSchema.index(
  { hallId: 1, selectedDate: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: "confirmed" } }
);

bookingSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const output = ret as any;
    output.id = output._id.toString();
    delete output._id;
    delete output.__v;
    return output;
  }
});

export const Booking = model<IBooking>("Booking", bookingSchema);
