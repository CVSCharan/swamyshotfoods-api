import axios from "axios";

const run = async () => {
  try {
    const loginRes = await axios.post("https://api.swamyshotfoods.in/api/auth/login", {
      username: "cvs@swamyshotfoods.com",
      password: "Password@123"
    });
    const token = loginRes.data.token;
    console.log("Logged in");

    const putRes = await axios.put("https://api.swamyshotfoods.in/api/store-config", {
      menuHeaderMessage: "Testing new header message!"
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("PUT Response:", putRes.data);
  } catch (err: any) {
    console.error("Error:", err.response?.data || err.message);
  }
};

run();
