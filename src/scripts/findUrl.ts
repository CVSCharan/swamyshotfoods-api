import mongoose from "mongoose";
import connectDB from "../config/database";
import dotenv from "dotenv";

dotenv.config();

const findString = async (searchStr: string) => {
  await connectDB();
  const db = mongoose.connection.db;
  if (!db) {
    console.log("No db connection");
    process.exit(1);
  }
  const collections = await db.collections();
  for (const collection of collections) {
    const docs = await collection.find({}).toArray();
    for (const doc of docs) {
      const json = JSON.stringify(doc);
      if (json.includes(searchStr)) {
        console.log(`Found in collection ${collection.collectionName}, document ID: ${doc._id}`);
        // Let's print the specific field that matches
        for (const [key, value] of Object.entries(doc)) {
          if (typeof value === 'string' && value.includes(searchStr)) {
             console.log(`Field: ${key}, Value: ${JSON.stringify(value)}`);
          } else if (typeof value === 'object' && value !== null) {
             const valJson = JSON.stringify(value);
             if (valJson.includes(searchStr)) {
                console.log(`Field: ${key} contains the string`);
             }
          }
        }
      }
    }
  }
  console.log("Done searching");
  process.exit(0);
};

findString("sn0ne1");
