import mongoose, { Schema, Document } from "mongoose";

interface ITimingSlot {
  startTime: string;
  endTime: string;
}

export interface IMenu extends Document {
  name: string;
  price: number;
  desc: string;
  timingTemplate?: string; // References TimingTemplate.key
  morningTimings?: ITimingSlot;
  eveningTimings?: ITimingSlot;
  ingredients: string[];
  allergens?: string[];
  dietaryLabels: string[];
  priority: number;
  imgSrc: string;
  createdAt: Date;
  updatedAt: Date;
}

const timingSlotSchema = new Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const menuSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    desc: { type: String, required: true },
    timingTemplate: { type: String, default: null },
    morningTimings: { type: timingSlotSchema, default: null },
    eveningTimings: { type: timingSlotSchema, default: null },
    ingredients: { type: [String], required: true, default: [] },
    allergens: { type: [String], default: [] },
    dietaryLabels: { type: [String], default: ["vegetarian"] },
    priority: { type: Number, required: true },
    imgSrc: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMenu>("Menu", menuSchema);
