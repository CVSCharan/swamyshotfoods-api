import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  password?: string;
  role: "user" | "admin" | "staff";
  pic?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin", "staff"], default: "user" },
    pic: { type: String, default: "https://via.placeholder.com/150" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", userSchema);
