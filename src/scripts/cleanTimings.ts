import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root of api project
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function convertTo24Hour(timeStr: string): string {
  if (!timeStr) return timeStr;
  const str = timeStr.trim().toLowerCase();
  
  if (!str.includes('am') && !str.includes('pm')) {
    return timeStr;
  }
  
  const match = str.match(/(\d+):?(\d*)\s*(am|pm)/);
  if (!match) return timeStr;
  
  let hours = parseInt(match[1]);
  const period = match[3];
  
  if (hours === 12) {
    hours = period === 'am' ? 0 : 12;
  } else if (hours === 0 && period === 'pm') {
    hours = 12;
  } else if (period === 'pm') {
    hours += 12;
  }
  
  const formattedHours = hours.toString().padStart(2, '0');
  const minsStr = (match[2] || "0").padEnd(2, '0').slice(0, 2);
  
  return `${formattedHours}:${minsStr}`;
}

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGO_URI is not defined in .env");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for data cleanup.");
    
    // Access the native MongoDB driver collection to bypass Mongoose schema validation rules
    const collection = mongoose.connection.db?.collection('menus');
    if (!collection) throw new Error("Could not connect to menus collection");

    const menus = await collection.find({}).toArray();
    let updatedCount = 0;
    
    for (const menu of menus) {
      let isUpdated = false;
      const updateDoc: any = {};
      
      // Fix Ingredients Array issue
      if (Array.isArray(menu.ingredients)) {
        updateDoc.ingredients = menu.ingredients.join(', ');
        isUpdated = true;
      }
      
      // Fix Morning Timings
      if (menu.morningTimings && menu.morningTimings.startTime) {
        const newStart = convertTo24Hour(menu.morningTimings.startTime);
        const newEnd = convertTo24Hour(menu.morningTimings.endTime);
        if (newStart !== menu.morningTimings.startTime || newEnd !== menu.morningTimings.endTime) {
          updateDoc.morningTimings = {
            ...menu.morningTimings,
            startTime: newStart,
            endTime: newEnd
          };
          isUpdated = true;
        }
      }
      
      // Fix Evening Timings
      if (menu.eveningTimings && menu.eveningTimings.startTime) {
        const newStart = convertTo24Hour(menu.eveningTimings.startTime);
        const newEnd = convertTo24Hour(menu.eveningTimings.endTime);
        if (newStart !== menu.eveningTimings.startTime || newEnd !== menu.eveningTimings.endTime) {
          updateDoc.eveningTimings = {
            ...menu.eveningTimings,
            startTime: newStart,
            endTime: newEnd
          };
          isUpdated = true;
        }
      }
      
      if (isUpdated) {
        await collection.updateOne({ _id: menu._id }, { $set: updateDoc });
        updatedCount++;
        console.log(`Updated data for: ${menu.name}`);
      }
    }
    
    console.log(`Completed. Fixed bad data for ${updatedCount} menu items.`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

run();
