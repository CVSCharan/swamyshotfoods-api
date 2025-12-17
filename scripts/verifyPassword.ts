import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../src/models/User";
import Logger from "../src/config/logger";

dotenv.config();

/**
 * Script to verify if a password matches a user's stored hash
 * 
 * Usage:
 * npx ts-node scripts/verifyPassword.ts <username> <password>
 * 
 * Example:
 * npx ts-node scripts/verifyPassword.ts CVS swamyshotfoods@Admin
 */

const verifyPassword = async () => {
  try {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
      console.error("\n❌ Error: Missing arguments");
      console.log("\nUsage: npx ts-node scripts/verifyPassword.ts <username> <password>");
      console.log("Example: npx ts-node scripts/verifyPassword.ts CVS swamyshotfoods@Admin\n");
      process.exit(1);
    }

    const [username, password] = args;

    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/swamyshotfoods"
    );
    Logger.info("MongoDB Connected");

    // Find user by username (case-insensitive)
    const user = await User.findOne({ 
      username: new RegExp(`^${username}$`, "i") 
    });

    if (!user) {
      console.log(`\n❌ User "${username}" not found in database\n`);
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
    console.log(`║ Password Verification Test                                    ║`);
    console.log(`╠═══════════════════════════════════════════════════════════════╣`);
    console.log(`║ Username:   ${user.username.padEnd(49)} ║`);
    console.log(`║ Role:       ${user.role.padEnd(49)} ║`);
    console.log(`╠═══════════════════════════════════════════════════════════════╣`);

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password || "");

    if (isMatch) {
      console.log(`║ ✅ Password: CORRECT                                         ║`);
      console.log(`║                                                               ║`);
      console.log(`║ The password "${password.padEnd(37)}" ║`);
      console.log(`║ matches the stored hash for user "${user.username.padEnd(29)}" ║`);
    } else {
      console.log(`║ ❌ Password: INCORRECT                                       ║`);
      console.log(`║                                                               ║`);
      console.log(`║ The password "${password.padEnd(37)}" ║`);
      console.log(`║ does NOT match the stored hash for "${user.username.padEnd(25)}" ║`);
    }

    console.log(`╠═══════════════════════════════════════════════════════════════╣`);
    console.log(`║ Stored Hash:                                                  ║`);
    const hash = user.password || "N/A";
    console.log(`║ ${hash.substring(0, 61).padEnd(61)} ║`);
    if (hash.length > 61) {
      console.log(`║ ${hash.substring(61).padEnd(61)} ║`);
    }
    console.log(`╚═══════════════════════════════════════════════════════════════╝\n`);

    await mongoose.connection.close();
    Logger.info("Connection Closed");
    process.exit(isMatch ? 0 : 1);
  } catch (error) {
    Logger.error(`Error: ${(error as Error).message}`);
    console.error("\n❌ Failed to verify password\n");
    process.exit(1);
  }
};

verifyPassword();
