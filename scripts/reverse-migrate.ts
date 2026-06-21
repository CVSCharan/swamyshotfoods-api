import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function runReverseMigration() {
  try {
    await mongoose.connect(MONGO_URI as string);
    console.log("Connected to MongoDB for Reverse Migration");

    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    const menusCollection = db.collection("menus");
    
    // Find all documents
    const allMenus = await menusCollection.find({}).toArray();
    let updatedCount = 0;

    for (const menu of allMenus) {
      // If ingredients is an array, join it back into a string
      if (Array.isArray(menu.ingredients)) {
        const newIngredientsString = menu.ingredients.join(", ");
        await menusCollection.updateOne(
          { _id: menu._id },
          { $set: { ingredients: newIngredientsString } }
        );
        updatedCount++;
        console.log(`Reverted Menu ID: ${menu._id}`);
      }
    }

    console.log(`\nReverse migration complete! Successfully reverted ${updatedCount} documents.`);

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

runReverseMigration();
