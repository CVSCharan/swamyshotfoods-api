import mongoose from 'mongoose';
import dotenv from 'dotenv';
import StoreConfig from '../models/StoreConfig';

dotenv.config();

async function testUpload() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    const config = await StoreConfig.findOne();
    if (config) {
      console.log('Found config, length of cookingImageUrl:', config.cookingImageUrl?.length);
      
      const hugeString = "data:image/gif;base64," + "a".repeat(1.5 * 1024 * 1024);
      config.cookingImageUrl = hugeString;
      await config.save();
      
      console.log("Successfully saved huge string to cookingImageUrl!");
    }
    process.exit(0);
  } catch (err) {
    console.error("Error saving:", err);
    process.exit(1);
  }
}

testUpload();
