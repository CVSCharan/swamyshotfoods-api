import mongoose from "mongoose";
import connectDB from "../config/database";
import dotenv from "dotenv";
import Menu from "../models/Menu";
import StoreConfig from "../models/StoreConfig";

dotenv.config();

const checkUrls = async () => {
  await connectDB();
  
  const menus = await Menu.find({});
  let found = false;
  for (const menu of menus) {
    if (menu.imgSrc && typeof menu.imgSrc === 'string' && menu.imgSrc.includes('\n')) {
      console.log(`Menu [${menu.name}] has newline in imgSrc: ${JSON.stringify(menu.imgSrc)}`);
      found = true;
    }
  }

  const configs = await StoreConfig.find({});
  for (const config of configs) {
    if (config.ownerAvatarUrl && typeof config.ownerAvatarUrl === 'string' && config.ownerAvatarUrl.includes('\n')) {
      console.log(`StoreConfig ownerAvatarUrl has newline: ${JSON.stringify(config.ownerAvatarUrl)}`);
      found = true;
    }
    if (config.cookingImageUrl && typeof config.cookingImageUrl === 'string' && config.cookingImageUrl.includes('\n')) {
      console.log(`StoreConfig cookingImageUrl has newline: ${JSON.stringify(config.cookingImageUrl)}`);
      found = true;
    }
  }

  if (!found) {
    console.log("No newlines found in any URL fields.");
  }
  process.exit(0);
};

checkUrls();
