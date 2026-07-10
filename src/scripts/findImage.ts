import mongoose from "mongoose";
import connectDB from "../config/database";
import dotenv from "dotenv";
import Menu from "../models/Menu";
import StoreConfig from "../models/StoreConfig";

dotenv.config();

const findImage = async () => {
  await connectDB();
  
  const menus = await Menu.find({});
  menus.forEach(m => {
    const json = JSON.stringify(m);
    if (json.includes('IMG-20250107-WA0054_sn0ne1')) {
      console.log('Found in menu:', m._id, json);
    }
  });

  const configs = await StoreConfig.find({});
  configs.forEach(c => {
    const json = JSON.stringify(c);
    if (json.includes('IMG-20250107-WA0054_sn0ne1')) {
      console.log('Found in config:', c._id, json);
    }
  });

  console.log("Done checking");
  process.exit(0);
};

findImage();
