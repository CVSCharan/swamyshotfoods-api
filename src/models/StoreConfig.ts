import mongoose, { Schema, Document } from "mongoose";

export interface IStoreConfig extends Document {
  isShopOpen: boolean;
  isCooking: boolean;
  isHoliday: boolean;
  holidayMessage: string;
  isNoticeActive: boolean;
  noticeMessage: string;
  description: string;
  updatedAt: Date;
}

const storeConfigSchema = new Schema(
  {
    isShopOpen: { type: Boolean, default: false },
    isCooking: { type: Boolean, default: false },
    isHoliday: { type: Boolean, default: false },
    holidayMessage: { type: String, default: "Enter Holiday Text..!" },
    isNoticeActive: { type: Boolean, default: false },
    noticeMessage: { type: String, default: "Enter Notice Board Text..!" },
    description: {
      type: String,
      default: "Swamy's Hot Foods is a pure veg destination.",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IStoreConfig>("StoreConfig", storeConfigSchema);
