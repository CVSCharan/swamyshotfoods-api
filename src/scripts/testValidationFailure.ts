import app from "../app";
import connectDB from "../config/database";
import User from "../models/User";
import Menu from "../models/Menu";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Server } from "http";

dotenv.config();

const PORT = 5002;
const BASE_URL = `http://localhost:${PORT}/api`;

const run = async () => {
  let server: Server | null = null;
  try {
    await connectDB();
    console.log("Connected to MongoDB.");

    server = app.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
    });

    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      throw new Error("No admin user found.");
    }
    const token = jwt.sign(
      { id: adminUser._id, role: adminUser.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    // Fetch the target item from the database
    const targetItem = await Menu.findOne({ name: /Idly with chutney/i });
    if (!targetItem) {
      throw new Error("Target item not found in DB.");
    }
    console.log("Target item from DB:", targetItem.toObject());

    // Construct payload exactly like PWA does
    const basePayload = JSON.parse(JSON.stringify(targetItem.toObject()));
    
    // Variation 1: morningTimings/eveningTimings set to null (common if Custom Timings is not active)
    const payload1 = {
      ...basePayload,
      morningTimings: null,
      eveningTimings: null,
    };

    // Variation 2: morningTimings/eveningTimings having empty strings or partial values
    const payload2 = {
      ...basePayload,
      morningTimings: { startTime: "", endTime: "" },
      eveningTimings: { startTime: "", endTime: "" },
    };

    // Variation 3: timingTemplate is empty string "" (resetForm sets timingTemplate: "")
    const payload3 = {
      ...basePayload,
      timingTemplate: "",
    };

    // Variation 4: allergens/dietaryLabels contains null or empty arrays
    const payload4 = {
      ...basePayload,
      allergens: null,
      dietaryLabels: null,
    };

    const payloads = [
      { name: "Timings are null", data: payload1 },
      { name: "Timings have empty strings", data: payload2 },
      { name: "timingTemplate is empty string", data: payload3 },
      { name: "allergens/dietaryLabels are null", data: payload4 }
    ];

    for (const test of payloads) {
      console.log(`\nTesting payload variation: ${test.name}`);
      const response = await fetch(`${BASE_URL}/menu/${basePayload._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(test.data),
      });

      console.log(`Status: ${response.status}`);
      const body = await response.json();
      console.log("Body:", JSON.stringify(body, null, 2));
    }

  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    if (server) {
      server.close(() => {
        console.log("Test server stopped.");
        process.exit();
      });
    } else {
      process.exit();
    }
  }
};

run();
