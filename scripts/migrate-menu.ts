import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function runMigration() {
  try {
    await mongoose.connect(MONGO_URI as string);
    console.log("Connected to MongoDB for Migration");

    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    const menusCollection = db.collection("menus");
    
    // Find all documents
    const allMenus = await menusCollection.find({}).toArray();
    let updatedCount = 0;

    for (const menu of allMenus) {
      let needsUpdate = false;
      const updateDoc: any = { $set: {}, $unset: {} };

      // 1. Fix 'ingredients' if it's a string
      if (typeof menu.ingredients === "string") {
        let newIngredientsArray: string[] = [];
        
        const trimmed = menu.ingredients.trim();
        if (trimmed) {
          // If the string contains commas, split by comma, else it's just one item
          if (trimmed.includes(",")) {
            newIngredientsArray = trimmed.split(",").map(i => i.trim()).filter(i => i);
          } else {
            newIngredientsArray = [trimmed];
          }
        }

        updateDoc.$set.ingredients = newIngredientsArray;
        needsUpdate = true;
      }

      // 2. Remove misspelled 'ingridents'
      if (menu.ingridents !== undefined) {
        updateDoc.$unset.ingridents = "";
        needsUpdate = true;
      }

      // Perform update if needed
      if (needsUpdate) {
        // Clean up empty $set or $unset
        if (Object.keys(updateDoc.$set).length === 0) delete updateDoc.$set;
        if (Object.keys(updateDoc.$unset).length === 0) delete updateDoc.$unset;

        await menusCollection.updateOne({ _id: menu._id }, updateDoc);
        updatedCount++;
        console.log(`Updated Menu ID: ${menu._id}`);
      }
    }

    console.log(`\nMigration complete! Successfully updated ${updatedCount} documents.`);

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

runMigration();
