import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../src/models/User";
import Logger from "../src/config/logger";

dotenv.config();

/**
 * Script to reset user passwords to known values for development
 * 
 * Usage:
 * npx ts-node scripts/resetPasswords.ts
 * 
 * This will reset all user passwords to: swamyshotfoods@Admin
 */

const resetPasswords = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/swamyshotfoods"
    );
    Logger.info("MongoDB Connected");

    const newPassword = "swamyshotfoods@Admin";
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const users = await User.find({});

    if (users.length === 0) {
      console.log("\n❌ No users found in database\n");
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
    console.log(`║ Password Reset Script                                         ║`);
    console.log(`╠═══════════════════════════════════════════════════════════════╣`);
    console.log(`║ New Password: ${newPassword.padEnd(45)} ║`);
    console.log(`║ Total Users:  ${users.length.toString().padEnd(45)} ║`);
    console.log(`╚═══════════════════════════════════════════════════════════════╝\n`);

    console.log("Resetting passwords...\n");

    for (const user of users) {
      await User.updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword } }
      );

      console.log(`✅ Reset password for: ${user.username} (${user.role})`);
    }

    console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
    console.log(`║ ✅ Password Reset Complete                                    ║`);
    console.log(`╠═══════════════════════════════════════════════════════════════╣`);
    console.log(`║ All users can now login with:                                 ║`);
    console.log(`║ Password: ${newPassword.padEnd(49)} ║`);
    console.log(`╠═══════════════════════════════════════════════════════════════╣`);
    console.log(`║ Users updated:                                                ║`);
    
    for (const user of users) {
      console.log(`║ - ${user.username.padEnd(59)} ║`);
    }
    
    console.log(`╚═══════════════════════════════════════════════════════════════╝\n`);

    await mongoose.connection.close();
    Logger.info("Connection Closed");
    process.exit(0);
  } catch (error) {
    Logger.error(`Error: ${(error as Error).message}`);
    console.error("\n❌ Failed to reset passwords\n");
    process.exit(1);
  }
};

resetPasswords();
