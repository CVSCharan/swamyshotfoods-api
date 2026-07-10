import mongoose from "mongoose";
import connectDB from "../config/database";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/User";
import fs from "fs";

dotenv.config();

const testPut = async () => {
  await connectDB();
  const user = await User.findOne({});
  if (!user) { console.log("User not found"); process.exit(1); }
  
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
  
  const payload = JSON.parse(fs.readFileSync('item.json', 'utf8'));
  
  const response = await fetch(`https://api.swamyshotfoods.in/api/menu/${payload._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  
  console.log(`Status: ${response.status}`);
  console.log(await response.text());
  process.exit(0);
};

testPut();
