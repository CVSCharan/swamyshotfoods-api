import mongoose from "mongoose";
import connectDB from "../config/database";
import dotenv from "dotenv";
import Menu from "../models/Menu";

dotenv.config();

const fixTimes = async () => {
  await connectDB();
  
  const menus = await Menu.find({});
  let count = 0;
  for (const menu of menus) {
    let updated = false;
    
    if (menu.morningTimings) {
      if (menu.morningTimings.startTime && menu.morningTimings.startTime.includes('.')) {
        menu.morningTimings.startTime = menu.morningTimings.startTime.replace('.', ':');
        updated = true;
      }
      if (menu.morningTimings.endTime && menu.morningTimings.endTime.includes('.')) {
        menu.morningTimings.endTime = menu.morningTimings.endTime.replace('.', ':');
        updated = true;
      }
    }
    
    if (menu.eveningTimings) {
      if (menu.eveningTimings.startTime && menu.eveningTimings.startTime.includes('.')) {
        menu.eveningTimings.startTime = menu.eveningTimings.startTime.replace('.', ':');
        updated = true;
      }
      if (menu.eveningTimings.endTime && menu.eveningTimings.endTime.includes('.')) {
        menu.eveningTimings.endTime = menu.eveningTimings.endTime.replace('.', ':');
        updated = true;
      }
    }

    if (updated) {
      await Menu.updateOne({ _id: menu._id }, { $set: { morningTimings: menu.morningTimings, eveningTimings: menu.eveningTimings } });
      console.log('Fixed timings for menu:', menu.name);
      count++;
    }
  }

  console.log(`Done fixing timings. Updated ${count} items.`);
  process.exit(0);
};

fixTimes();
