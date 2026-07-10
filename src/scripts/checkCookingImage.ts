import mongoose from "mongoose";
import connectDB from "../config/database";
import dotenv from "dotenv";
import StoreConfig from "../models/StoreConfig";

dotenv.config();

const run = async () => {
  await connectDB();
  const config = await StoreConfig.findOne({});
  if (config) {
    console.log("Cooking Image URL:", JSON.stringify(config.cookingImageUrl));
  }
  process.exit(0);
};

run();
