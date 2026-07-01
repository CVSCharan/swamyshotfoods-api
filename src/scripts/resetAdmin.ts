import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

// Adjust path as needed depending on where this is run
dotenv.config({ path: path.join(__dirname, "../../.env") });

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin", "staff"], default: "user" },
    pic: { type: String, default: "" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

async function resetAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const email = "cvs@swamyshotfoods.in";
    const password = "Password@123";

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user = await User.findOne({ username: email });

    if (user) {
      user.password = hashedPassword;
      user.role = "admin";
      await user.save();
      console.log(`Updated existing user ${email}.`);
    } else {
      user = await User.create({
        username: email,
        password: hashedPassword,
        role: "admin",
      });
      console.log(`Created new admin user ${email}.`);
    }

    console.log("Credentials:");
    console.log(`Username: ${email}`);
    console.log(`Password: ${password}`);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

resetAdmin();
