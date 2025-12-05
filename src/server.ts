import dotenv from "dotenv";
import app from "./app";
import connectDB from "./config/database";
import Logger from "./config/logger";

dotenv.config();

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0"; // Listen on all network interfaces

app.listen(Number(PORT), HOST, () => {
  Logger.info(`Server running on http://${HOST}:${PORT}`);
  Logger.info(`Network access: http://10.40.149.228:${PORT}`);
});
