import mongoose from 'mongoose';
import dotenv from 'dotenv';
import StoreConfig from '../models/StoreConfig';

dotenv.config();

async function setHeaderMessage() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    const config = await StoreConfig.findOne();
    if (config) {
      config.menuHeaderMessage = "✨ Welcome to Swamy's Hot Foods! This is a placeholder for your Menu Header Message. You can change or remove this in the Admin Panel.";
      await config.save();
      console.log("Updated menu header message!");
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

setHeaderMessage();
