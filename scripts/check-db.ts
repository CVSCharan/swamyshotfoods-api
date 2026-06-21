import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function checkDatabase() {
  try {
    await mongoose.connect(MONGO_URI as string);
    console.log("Connected to MongoDB");

    // We will look at the raw collection data directly to bypass mongoose schema casting.
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    const menusCollection = db.collection("menus");
    
    // Get the oldest 2 documents
    const oldestMenus = await menusCollection.find().sort({ createdAt: 1 }).limit(2).toArray();
    console.log("\n--- OLDEST MENU DOCUMENTS (Old Schema) ---");
    console.log(JSON.stringify(oldestMenus, null, 2));

    // Get the newest 2 documents
    const newestMenus = await menusCollection.find().sort({ createdAt: -1 }).limit(2).toArray();
    console.log("\n--- NEWEST MENU DOCUMENTS (Potentially New Schema) ---");
    console.log(JSON.stringify(newestMenus, null, 2));

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

checkDatabase();
