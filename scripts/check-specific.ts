import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function checkSpecificDoc() {
  try {
    await mongoose.connect(MONGO_URI as string);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    const menusCollection = db.collection("menus");
    
    const doc = await menusCollection.findOne({ _id: new mongoose.Types.ObjectId("678a1c759108930d7e39ec78") });
    console.log("Doc:", JSON.stringify(doc, null, 2));
    
    // Check type of ingredients explicitly using aggregation
    const aggResult = await menusCollection.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId("678a1c759108930d7e39ec78") } },
      { $project: { typeOfIngredients: { $type: "$ingredients" } } }
    ]).toArray();
    console.log("Type of ingredients via aggregation:", aggResult[0]?.typeOfIngredients);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

checkSpecificDoc();
