import { Schema, model } from "mongoose";

export interface ISnack {
  name: string;
  price: number;
  isActive: boolean;
  imageUrl: string;
}

const snackSchema = new Schema<ISnack>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
    imageUrl: { type: String, required: true, trim: true }
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

snackSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const output = ret as any;
    output.id = output._id.toString();
    delete output._id;
    delete output.__v;
    return output;
  }
});

export const Snack = model<ISnack>("Snack", snackSchema);
