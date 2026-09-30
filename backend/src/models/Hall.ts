import { Schema, model } from "mongoose";

export interface IHall {
  name: string;
  capacity: number;
  isActive: boolean;
  imageUrl: string;
  description?: string;
}

const hallSchema = new Schema<IHall>(
  {
    name: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true },
    imageUrl: { type: String, required: true, trim: true },
    description: { type: String, trim: true }
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

hallSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const output = ret as any;
    output.id = output._id.toString();
    delete output._id;
    delete output.__v;
    return output;
  }
});

export const Hall = model<IHall>("Hall", hallSchema);
