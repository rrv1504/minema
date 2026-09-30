import { Schema, model, type HydratedDocument } from "mongoose";

export interface IMovie {
  title: string;
  duration: string;
  durationMinutes: number;
  pricePerPerson: number;
  imageUrl: string;
  genre: string;
  rating: string;
  description?: string;
  isActive: boolean;
  totalBookings: number;
}

const movieSchema = new Schema<IMovie>(
  {
    title: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    pricePerPerson: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true },
    rating: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    totalBookings: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

movieSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const output = ret as any;
    output.id = output._id.toString();
    delete output._id;
    delete output.__v;
    return output;
  }
});

export type MovieDocument = HydratedDocument<IMovie>;
export const Movie = model<IMovie>("Movie", movieSchema);
