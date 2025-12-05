import mongoose from "mongoose";
import dotenv from "dotenv";
import User, { IUser } from "../src/models/User";
import Logger from "../src/config/logger";

dotenv.config();

const getUsers = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/swamyshotfoods"
    );
    Logger.info("MongoDB Connected");

    const users = await User.find({});

    if (users.length === 0) {
      console.log("No users found.");
    } else {
      console.log("\n--- Users ---");
      users.forEach((user: IUser) => {
        console.log(`
ID: ${user._id}
Username: ${user.username}
Role: ${user.role}
Pic: ${user.pic || "Default"}
Created At: ${user.createdAt}
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

getUsers();
