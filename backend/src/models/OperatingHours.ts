import { Schema, model } from "mongoose";

export interface IOperatingHours {
  date: string;
  startTime: string;
  endTime: string;
}

const operatingHoursSchema = new Schema<IOperatingHours>(
  {
    date: { type: String, required: true, unique: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

operatingHoursSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const output = ret as any;
    output.id = output._id.toString();
    delete output._id;
    delete output.__v;
    return output;
  }
});

export const OperatingHours = model<IOperatingHours>("OperatingHours", operatingHoursSchema);
