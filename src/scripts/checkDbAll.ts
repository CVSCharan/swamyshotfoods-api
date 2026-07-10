import mongoose from "mongoose";
import connectDB from "../config/database";
import dotenv from "dotenv";
import Menu from "../models/Menu";

dotenv.config();

const checkDbAll = async () => {
  await connectDB();
  
  const menus = await Menu.find({});
  menus.forEach(m => {
    const json = JSON.stringify(m);
    if (json.includes('%0A') || json.includes('\\n')) {
      console.log('Found newline in menu:', m._id);
    }
  });

  console.log("Done checking all fields");
  process.exit(0);
};

checkDbAll();
