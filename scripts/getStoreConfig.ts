import mongoose from "mongoose";
import dotenv from "dotenv";
import StoreConfig, { IStoreConfig } from "../src/models/StoreConfig";
import Logger from "../src/config/logger";

dotenv.config();

const getStoreConfig = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/swamyshotfoods"
    );
    Logger.info("MongoDB Connected");

    const config = await StoreConfig.findOne();

    if (!config) {
      console.log("No store configuration found.");
    } else {
      console.log("\n--- Store Configuration ---");
      console.log(`
ID: ${config._id}
Shop Open: ${config.isShopOpen}
Cooking: ${config.isCooking}
Holiday: ${config.isHoliday}
Holiday Message: ${config.holidayMessage}
Notice Active: ${config.isNoticeActive}
Notice Message: ${config.noticeMessage}
Description: ${config.description}
Updated At: ${config.updatedAt}
-------------------`);
    }

    await mongoose.connection.close();
    Logger.info("Connection Closed");
    process.exit(0);
  } catch (error) {
    Logger.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

getStoreConfig();
