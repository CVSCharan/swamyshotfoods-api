import axios from "axios";

const API_URL = "http://localhost:5001/api";
let token = "";
let menuId = "";

const runVerification = async () => {
  try {
    console.log("--- Starting Verification ---");

    // 1. Register
    console.log("\n1. Registering User...");
    try {
      const registerRes = await axios.post(`${API_URL}/auth/register`, {
        username: "testuser_" + Date.now(),
        password: "password123",
      });
      console.log("✅ Register Success:", registerRes.data.username);
    } catch (error: any) {
      console.error(
        "❌ Register Failed:",
        error.response?.data || error.message
      );
    }

    // 2. Login
    console.log("\n2. Logging in...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      username: "testuser", // Assuming we might run this multiple times, but let's use the one we just created if we stored it.
      // Actually, let's just create a fresh user every time or handle the error if exists.
      // For simplicity, I'll just use the one I just created.
    });
    // Wait, I didn't save the username from register. Let's fix that flow.
    // Re-doing the flow properly below.
  } catch (error) {
    // ignore
  }
};

const main = async () => {
  const username = "user_" + Date.now();
  const password = "password123";

  try {
    // 1. Register
    console.log("1. Registering...");
    await axios.post(`${API_URL}/auth/register`, { username, password });
    console.log("✅ Registered");

    // 2. Login
    console.log("2. Logging in...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      username,
      password,
    });
    token = loginRes.data.token;
    console.log("✅ Logged in. Token received.");

    // 3. Create Menu
    console.log("3. Creating Menu Item...");
    const menuRes = await axios.post(
      `${API_URL}/menu`,
      {
        name: "Idli",
        price: 50,
        desc: "Steamed rice cakes",
        timings: "Morning",
        ingredients: "Rice, Urad Dal",
        priority: 1,
        imgSrc: "http://example.com/idli.jpg",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    menuId = menuRes.data._id;
    console.log("✅ Menu Created:", menuRes.data.name);

    // 4. Get All Menus
    console.log("4. Getting All Menus...");
    const getAllRes = await axios.get(`${API_URL}/menu`);
    console.log("✅ Menus found:", getAllRes.data.length);

    // 5. Get Menu By ID
    console.log("5. Getting Menu By ID...");
    const getByIdRes = await axios.get(`${API_URL}/menu/${menuId}`);
    console.log("✅ Menu Found:", getByIdRes.data.name);

    // 6. Update Menu
    console.log("6. Updating Menu...");
    const updateRes = await axios.put(
      `${API_URL}/menu/${menuId}`,
      { price: 60 },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("✅ Menu Updated. New Price:", updateRes.data.price);

    // 7. Delete Menu
    console.log("7. Deleting Menu...");
    await axios.delete(`${API_URL}/menu/${menuId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ Menu Deleted");

    // 8. Verify Deletion
    console.log("8. Verifying Deletion...");
    try {
      await axios.get(`${API_URL}/menu/${menuId}`);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.log("✅ Menu correctly not found (404)");
      } else {
        console.error("❌ Unexpected error:", error.message);
      }
    }

    console.log("\n--- Verification Complete ---");
  } catch (error: any) {
    console.error(
      "❌ Verification Failed:",
      error.response?.data || error.message
    );
    process.exit(1);
  }
};

main();
