import mongoose from "mongoose";
import dotenv from "dotenv";
import TimingTemplate from "../src/models/TimingTemplate";
import Logger from "../src/config/logger";

dotenv.config();

const INITIAL_TEMPLATES = [
  {
    name: "All Day",
    key: "ALL_DAY",
    morningTimings: { startTime: "5:30am", endTime: "10:00am" },
    eveningTimings: { startTime: "4:30pm", endTime: "8:30pm" },
    isActive: true,
  },
  {
    name: "Breakfast Special",
    key: "BREAKFAST_SPECIAL",
    morningTimings: { startTime: "5:45am", endTime: "9:30am" },
    eveningTimings: { startTime: "4:45pm", endTime: "7:30pm" },
    isActive: true,
  },
  {
    name: "Extended Morning",
    key: "EXTENDED_MORNING",
    morningTimings: { startTime: "5:45am", endTime: "10:00am" },
    eveningTimings: { startTime: "4:45pm", endTime: "7:30pm" },
    isActive: true,
  },
  {
    name: "Late Start",
    key: "LATE_START",
    morningTimings: { startTime: "6:45am", endTime: "9:45am" },
    eveningTimings: { startTime: "5:30pm", endTime: "7:45pm" },
    isActive: true,
  },
  {
    name: "Dosa Special",
    key: "DOSA_SPECIAL",
    morningTimings: { startTime: "8:00am", endTime: "10:00am" },
    eveningTimings: { startTime: "5:45pm", endTime: "8:30pm" },
    isActive: true,
  },
  {
    name: "Morning Only",
    key: "MORNING_ONLY",
    morningTimings: { startTime: "5:30am", endTime: "10:00am" },
    eveningTimings: undefined,
    isActive: true,
  },
  {
    name: "Evening Only",
    key: "EVENING_ONLY",
    morningTimings: undefined,
    eveningTimings: { startTime: "4:45pm", endTime: "7:30pm" },
    isActive: true,
  },
];

const seedTimingTemplates = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/swamyshotfoods"
    );
    Logger.info("MongoDB Connected");

    // Clear existing templates
    await TimingTemplate.deleteMany({});
    Logger.info("Cleared existing timing templates");

    // Insert new templates
    const templates = await TimingTemplate.insertMany(INITIAL_TEMPLATES);
    Logger.info(`Created ${templates.length} timing templates`);

    console.log("\n=== Created Timing Templates ===\n");
    templates.forEach((template) => {
      console.log(`✓ ${template.name} (${template.key})`);
      if (template.morningTimings) {
        console.log(
          `  Morning: ${template.morningTimings.startTime} - ${template.morningTimings.endTime}`
        );
      }
      if (template.eveningTimings) {
        console.log(
          `  Evening: ${template.eveningTimings.startTime} - ${template.eveningTimings.endTime}`
        );
      }
      console.log("");
    });

    await mongoose.connection.close();
    Logger.info("Connection Closed");
    process.exit(0);
  } catch (error) {
    Logger.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

seedTimingTemplates();
