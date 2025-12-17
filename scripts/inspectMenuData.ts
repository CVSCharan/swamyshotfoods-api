import mongoose from "mongoose";
import dotenv from "dotenv";
import Menu from "../src/models/Menu";
import Logger from "../src/config/logger";

dotenv.config();

const inspectMenuData = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/swamyshotfoods"
    );
    Logger.info("MongoDB Connected");

    const menuItems = await Menu.find({}).limit(3); // Get first 3 items for inspection

    if (menuItems.length === 0) {
      console.log("No menu items found.");
    } else {
      console.log("\n=== RAW MENU DATA INSPECTION ===\n");
      console.log(`Total items in collection: ${await Menu.countDocuments()}`);
      console.log("\n--- Sample Items (First 3) ---\n");

      menuItems.forEach((item, index) => {
        console.log(`\n[Item ${index + 1}]`);
        console.log(JSON.stringify(item.toObject(), null, 2));
        console.log("\n" + "=".repeat(80));
      });

      // Also get one complete item to see all fields
      console.log("\n--- Complete First Item (All Fields) ---\n");
      const firstItem = menuItems[0].toObject() as Record<string, any>;
      console.log("Fields present in document:");
      Object.keys(firstItem).forEach((key) => {
        console.log(
          `  - ${key}: ${typeof firstItem[key]} = ${JSON.stringify(
            firstItem[key]
          )}`
        );
      });
    }

    await mongoose.connection.close();
    Logger.info("Connection Closed");
    process.exit(0);
  } catch (error) {
    Logger.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

inspectMenuData();
