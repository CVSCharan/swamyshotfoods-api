import mongoose, { Schema, Document } from "mongoose";

interface ITimingSlot {
  startTime: string;
  endTime: string;
}

export interface IMenu extends Document {
  name: string;
  price: number;
  desc: string;
  morningTimings?: ITimingSlot;
  eveningTimings?: ITimingSlot;
  ingredients: string;
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
    morningTimings: { type: timingSlotSchema, default: null },
    eveningTimings: { type: timingSlotSchema, default: null },
    ingredients: { type: String, required: true },
    priority: { type: Number, required: true },
    imgSrc: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMenu>("Menu", menuSchema);
