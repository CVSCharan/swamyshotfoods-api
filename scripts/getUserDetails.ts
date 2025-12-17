import mongoose from "mongoose";
import dotenv from "dotenv";
import User, { IUser } from "../src/models/User";
import Logger from "../src/config/logger";

dotenv.config();

/**
 * Script to retrieve and display user details from the database
 * 
 * Usage:
 * - Get all users: npm run script scripts/getUserDetails.ts
 * - Get specific user by ID: npm run script scripts/getUserDetails.ts <userId>
 * - Get user by username: npm run script scripts/getUserDetails.ts --username <username>
 * - Get users by role: npm run script scripts/getUserDetails.ts --role <admin|staff|user>
 */

interface QueryOptions {
  userId?: string;
  username?: string;
  role?: "user" | "admin" | "staff";
}

const parseArguments = (): QueryOptions => {
  const args = process.argv.slice(2);
  const options: QueryOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === "--username" && args[i + 1]) {
      options.username = args[i + 1];
      i++;
    } else if (arg === "--role" && args[i + 1]) {
      const role = args[i + 1];
      if (role === "user" || role === "admin" || role === "staff") {
        options.role = role;
      } else {
        console.error(`Invalid role: ${role}. Must be one of: user, admin, staff`);
        process.exit(1);
      }
      i++;
    } else if (!arg.startsWith("--")) {
      // Assume it's a user ID
      options.userId = arg;
    }
  }

  return options;
};

const displayUser = (user: IUser, index?: number) => {
  const header = index !== undefined ? `User #${index + 1}` : "User Details";
  const passwordHash = user.password || "N/A";
  
  console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
  console.log(`║ ${header.padEnd(61)} ║`);
  console.log(`╠═══════════════════════════════════════════════════════════════╣`);
  console.log(`║ ID:         ${user._id.toString().padEnd(49)} ║`);
  console.log(`║ Username:   ${user.username.padEnd(49)} ║`);
  console.log(`║ Role:       ${user.role.padEnd(49)} ║`);
  console.log(`║ Picture:    ${(user.pic || "Default").padEnd(49)} ║`);
  console.log(`║ Created:    ${user.createdAt.toISOString().padEnd(49)} ║`);
  console.log(`║ Updated:    ${user.updatedAt.toISOString().padEnd(49)} ║`);
  console.log(`╠═══════════════════════════════════════════════════════════════╣`);
  console.log(`║ 🔐 Password Hash (Dev Only):                                 ║`);
  console.log(`║ ${passwordHash.substring(0, 61).padEnd(61)} ║`);
  if (passwordHash.length > 61) {
    console.log(`║ ${passwordHash.substring(61).padEnd(61)} ║`);
  }
  console.log(`╚═══════════════════════════════════════════════════════════════╝`);
};

const displayUsersSummary = (users: IUser[]) => {
  console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
  console.log(`║ Users Summary                                                 ║`);
  console.log(`╠═══════════════════════════════════════════════════════════════╣`);
  console.log(`║ Total Users: ${users.length.toString().padEnd(48)} ║`);
  
  const roleCount = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log(`║ Admins:      ${(roleCount.admin || 0).toString().padEnd(48)} ║`);
  console.log(`║ Staff:       ${(roleCount.staff || 0).toString().padEnd(48)} ║`);
  console.log(`║ Users:       ${(roleCount.user || 0).toString().padEnd(48)} ║`);
  console.log(`╚═══════════════════════════════════════════════════════════════╝\n`);
};

const getUserDetails = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/swamyshotfoods"
    );
    Logger.info("MongoDB Connected");

    const options = parseArguments();
    let query: any = {};

    // Build query based on options
    if (options.userId) {
      if (!mongoose.Types.ObjectId.isValid(options.userId)) {
        console.error(`Invalid user ID format: ${options.userId}`);
        process.exit(1);
      }
      query._id = options.userId;
    }

    if (options.username) {
      query.username = new RegExp(options.username, "i"); // Case-insensitive search
    }

    if (options.role) {
      query.role = options.role;
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    if (users.length === 0) {
      console.log("\n❌ No users found matching the criteria.");
      
      if (Object.keys(query).length > 0) {
        console.log("\nSearch criteria:");
        if (options.userId) console.log(`  - User ID: ${options.userId}`);
        if (options.username) console.log(`  - Username: ${options.username}`);
        if (options.role) console.log(`  - Role: ${options.role}`);
      }
    } else {
      // Display summary if multiple users
      if (users.length > 1) {
        displayUsersSummary(users);
      }

      // Display each user
      users.forEach((user: IUser, index: number) => {
        displayUser(user, users.length > 1 ? index : undefined);
      });

      console.log(`\n✅ Found ${users.length} user(s)\n`);
    }

    await mongoose.connection.close();
    Logger.info("Connection Closed");
    process.exit(0);
  } catch (error) {
    Logger.error(`Error: ${(error as Error).message}`);
    console.error("\n❌ Failed to retrieve user details");
    process.exit(1);
  }
};

getUserDetails();
