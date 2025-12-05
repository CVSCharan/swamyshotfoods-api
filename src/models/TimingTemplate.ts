import mongoose, { Schema, Document } from "mongoose";

interface ITimingSlot {
  startTime: string;
  endTime: string;
}

export interface ITimingTemplate extends Document {
  name: string;
  key: string;
  morningTimings?: ITimingSlot;
  eveningTimings?: ITimingSlot;
  isActive: boolean;
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

const timingTemplateSchema = new Schema(
  {
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    morningTimings: { type: timingSlotSchema, default: null },
    eveningTimings: { type: timingSlotSchema, default: null },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITimingTemplate>(
  "TimingTemplate",
  timingTemplateSchema
);
