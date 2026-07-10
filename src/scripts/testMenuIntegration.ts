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

const runTests = async () => {
  let server: Server | null = null;
  try {
    // 1. Connect to Database
    await connectDB();
    console.log("Connected to MongoDB.");

    // 2. Start the local Express server on port 5002
    server = app.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
    });

    // 3. Find an admin user to sign a token
    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      throw new Error("No admin user found in database. Run resetAdmin script first.");
    }
    console.log(`Found admin user: ${adminUser.username}`);

    const token = jwt.sign(
      { id: adminUser._id, role: adminUser.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );
    console.log("Generated JWT Token.");

    // 4. Test POST /menu (Create item with popular: true, chefSpecial: true)
    console.log("\nTesting POST /menu...");
    const createPayload = {
      name: "Test Integration Item",
      price: 150,
      desc: "Delicious integration test dish.",
      ingredients: "love, care, unit tests",
      priority: 100,
      imgSrc: "https://example.com/test-dish.jpg",
      popular: true,
      chefSpecial: true,
      dosaSpecial: true,
      morningSpecial: false,
      eveningSpecial: false,
    };

    const postResponse = await fetch(`${BASE_URL}/menu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(createPayload),
    });

    console.log(`POST response status: ${postResponse.status}`);
    if (postResponse.status !== 201) {
      throw new Error(`Failed to create item. Status: ${postResponse.status}. Body: ${await postResponse.text()}`);
    }

    const createdItem = await postResponse.json();
    console.log("Successfully created item:", createdItem);
    if (!createdItem.popular || !createdItem.chefSpecial || !createdItem.dosaSpecial) {
      throw new Error("New tags (popular, chefSpecial, dosaSpecial) were not returned correctly!");
    }
    console.log("✅ POST verification passed.");

    const itemId = createdItem._id;

    // 5. Test GET /menu (Verify item is in list with tags)
    console.log("\nTesting GET /menu...");
    const getResponse = await fetch(`${BASE_URL}/menu`);
    console.log(`GET response status: ${getResponse.status}`);
    if (getResponse.status !== 200) {
      throw new Error(`Failed to get menu. Status: ${getResponse.status}`);
    }

    const allItems = await getResponse.json();
    const fetchedItem = allItems.find((item: any) => item._id === itemId);
    if (!fetchedItem) {
      throw new Error("Created item was not found in the list returned by GET /menu!");
    }
    console.log("Fetched item:", fetchedItem);
    if (!fetchedItem.popular || !fetchedItem.chefSpecial || !fetchedItem.dosaSpecial) {
      throw new Error("Fetched item is missing the new tags in the GET response!");
    }
    console.log("✅ GET verification passed.");

    // 6. Test PUT /menu/:id (Update tags: set popular to false, chefSpecial to true)
    console.log("\nTesting PUT /menu/:id...");
    const updatePayload = {
      ...createPayload,
      popular: false,
      chefSpecial: true,
      dosaSpecial: false,
    };

    const putResponse = await fetch(`${BASE_URL}/menu/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatePayload),
    });

    console.log(`PUT response status: ${putResponse.status}`);
    if (putResponse.status !== 200) {
      throw new Error(`Failed to update item. Status: ${putResponse.status}. Body: ${await putResponse.text()}`);
    }

    const updatedItem = await putResponse.json();
    console.log("Updated item returned:", updatedItem);
    if (updatedItem.popular !== false || updatedItem.chefSpecial !== true || updatedItem.dosaSpecial !== false) {
      throw new Error("Updated tags did not match update payload!");
    }
    console.log("✅ PUT verification passed.");

    // 7. Test DELETE /menu/:id (Clean up)
    console.log("\nTesting DELETE /menu/:id...");
    const deleteResponse = await fetch(`${BASE_URL}/menu/${itemId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`DELETE response status: ${deleteResponse.status}`);
    if (deleteResponse.status !== 204) {
      throw new Error(`Failed to delete item. Status: ${deleteResponse.status}`);
    }
    console.log("✅ DELETE verification passed.");

    // 8. Verify the item is gone
    const verifyResponse = await fetch(`${BASE_URL}/menu/${itemId}`);
    console.log(`GET deleted item status: ${verifyResponse.status}`);
    if (verifyResponse.status !== 404) {
      throw new Error(`Item was not deleted! Expected 404, got ${verifyResponse.status}`);
    }
    console.log("✅ Deletion double-check passed.");

    console.log("\n🎉 ALL MENU ENDPOINT INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉");

  } catch (error) {
    console.error("❌ Test run failed:", error);
    process.exitCode = 1;
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

runTests();
