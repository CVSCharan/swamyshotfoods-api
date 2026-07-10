import connectDB from "../config/database";
import dotenv from "dotenv";
import Menu from "../models/Menu";

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB for migration.");

    const menus = await Menu.find({});
    console.log(`Found ${menus.length} menu items. Migrating...`);

    // Initialize all to false
    const initRes = await Menu.collection.updateMany(
      {},
      { $set: { popular: false, chefSpecial: false } }
    );
    console.log(`Initialized tags on ${initRes.modifiedCount} / ${initRes.matchedCount} documents.`);

    // Set popular to true for priority < 2
    const popularRes = await Menu.collection.updateMany(
      { priority: { $lt: 2 } },
      { $set: { popular: true } }
    );
    console.log(`Set popular: true on ${popularRes.modifiedCount} documents with priority < 2.`);

    console.log("Successfully completed migration.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
};

run();
