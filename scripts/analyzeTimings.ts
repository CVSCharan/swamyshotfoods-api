import mongoose from "mongoose";
import dotenv from "dotenv";
import Menu from "../src/models/Menu";
import Logger from "../src/config/logger";

dotenv.config();

const extractTimings = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/swamyshotfoods"
    );
    Logger.info("MongoDB Connected");

    const menuItems = await Menu.find({}).sort({ priority: 1 });

    console.log("\n=== TIMING STRINGS ANALYSIS ===\n");
    console.log(`Total items: ${menuItems.length}\n`);

    const timingPatterns = new Map<string, string[]>();

    menuItems.forEach((item) => {
      const itemData = item.toObject();
      const timingStr = itemData.timings || "NO TIMING FIELD";
      const priority = itemData.priority;
      const name = itemData.name;

      console.log(`[${priority}] ${name}`);
      console.log(`    Timings: ${timingStr}`);
      console.log("");

      // Group by timing pattern
      if (!timingPatterns.has(timingStr)) {
        timingPatterns.set(timingStr, []);
      }
      timingPatterns.get(timingStr)!.push(`${priority}: ${name}`);
    });

    console.log("\n=== GROUPED BY TIMING PATTERN ===\n");
    let patternNum = 1;
    timingPatterns.forEach((items, pattern) => {
      console.log(`\nPattern ${patternNum}:`);
      console.log(`Timing String: ${pattern}`);
      console.log(`Items (${items.length}):`);
      items.forEach((item) => console.log(`  - ${item}`));
      patternNum++;
    });

    await mongoose.connection.close();
    Logger.info("Connection Closed");
    process.exit(0);
  } catch (error) {
    Logger.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

extractTimings();
