import mongoose from "mongoose";
import dotenv from "dotenv";
import Menu from "../src/models/Menu";
import Logger from "../src/config/logger";

dotenv.config();

const getMenu = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/swamyshotfoods"
    );
    Logger.info("MongoDB Connected");

    const menuItems = await Menu.find({});

    if (menuItems.length === 0) {
      console.log("No menu items found.");
    } else {
      console.log("\n--- Menu Items ---");
      menuItems.forEach((item) => {
        console.log(`
ID: ${item._id}
Name: ${item.name}
Price: ${item.price}
Desc: ${item.desc}
Morning: ${
          item.morningTimings
            ? `${item.morningTimings.startTime} - ${item.morningTimings.endTime}`
            : "Not Available"
        }
Evening: ${
          item.eveningTimings
            ? `${item.eveningTimings.startTime} - ${item.eveningTimings.endTime}`
            : "Not Available"
        }
Priority: ${item.priority}
-------------------`);
      });
    }

    await mongoose.connection.close();
    Logger.info("Connection Closed");
    process.exit(0);
  } catch (error) {
    Logger.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

getMenu();
