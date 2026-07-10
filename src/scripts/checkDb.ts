import mongoose from "mongoose";
import connectDB from "../config/database";
import dotenv from "dotenv";
import Menu from "../models/Menu";

dotenv.config();

const checkDb = async () => {
  await connectDB();
  
  const menus = await Menu.find({});
  menus.forEach(m => {
    console.log(`Menu: ${m.name}`);
    console.log(`  timingTemplate: ${JSON.stringify(m.timingTemplate)}`);
    console.log(`  morningTimings: ${JSON.stringify(m.morningTimings)}`);
    console.log(`  eveningTimings: ${JSON.stringify(m.eveningTimings)}`);
  });

  console.log("Done checking");
  process.exit(0);
};

checkDb();
