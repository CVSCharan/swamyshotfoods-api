import mongoose from "mongoose";
import connectDB from "../config/database";
import dotenv from "dotenv";
import Menu from "../models/Menu";
import StoreConfig from "../models/StoreConfig";

dotenv.config();

const trimUrls = async () => {
  await connectDB();
  
  const menus = await Menu.find({});
  for (const menu of menus) {
    if (menu.imgSrc && typeof menu.imgSrc === 'string' && menu.imgSrc.match(/\n|\r|\s$/)) {
      await Menu.updateOne({ _id: menu._id }, { $set: { imgSrc: menu.imgSrc.trim() } });
      console.log(`Trimmed imgSrc for menu: ${menu.name}`);
    }
  }

  const configs = await StoreConfig.find({});
  for (const config of configs) {
    let update: any = {};
    if (config.ownerAvatarUrl && typeof config.ownerAvatarUrl === 'string' && config.ownerAvatarUrl.match(/\n|\r|\s$/)) {
      update.ownerAvatarUrl = config.ownerAvatarUrl.trim();
    }
    if (config.cookingImageUrl && typeof config.cookingImageUrl === 'string' && config.cookingImageUrl.match(/\n|\r|\s$/)) {
      update.cookingImageUrl = config.cookingImageUrl.trim();
    }
    if (Object.keys(update).length > 0) {
      await StoreConfig.updateOne({ _id: config._id }, { $set: update });
      console.log('Trimmed StoreConfig URLs');
    }
  }

  console.log("Finished trimming URLs");
  process.exit(0);
};

trimUrls();
