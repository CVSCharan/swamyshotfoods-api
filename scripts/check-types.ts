import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function checkDatabase() {
  try {
    await mongoose.connect(MONGO_URI as string);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    const menusCollection = db.collection("menus");
    
    // Count docs where ingredients is a string (BSON type 2)
    const stringIngredientsCount = await menusCollection.countDocuments({ ingredients: { $type: 2 } });
    console.log(`\nDocuments with 'ingredients' as String: ${stringIngredientsCount}`);

    // Count docs where ingredients is an array (BSON type 4)
    const arrayIngredientsCount = await menusCollection.countDocuments({ ingredients: { $type: 4 } });
    console.log(`Documents with 'ingredients' as Array: ${arrayIngredientsCount}`);

    // Count docs missing allergens
    const missingAllergensCount = await menusCollection.countDocuments({ allergens: { $exists: false } });
    console.log(`Documents missing 'allergens' field: ${missingAllergensCount}`);

    // Count docs with old 'ingridents' field
    const oldIngridentsCount = await menusCollection.countDocuments({ ingridents: { $exists: true } });
    console.log(`Documents with misspelled 'ingridents' field: ${oldIngridentsCount}`);

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

checkDatabase();
