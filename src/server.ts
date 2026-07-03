import dotenv from "dotenv";
import app from "./app";
import connectDB from "./config/database";
import Logger from "./config/logger";
import { EventBroadcast } from "./config/eventBroadcast";

dotenv.config();

const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0"; // Listen on all network interfaces

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Initialize Change Streams for real-time SSE broadcasts across instances
  EventBroadcast.initChangeStream();

  app.listen(Number(PORT), HOST, () => {
    Logger.info(`Server running on http://${HOST}:${PORT}`);
    Logger.info(`Network access: http://10.40.149.228:${PORT}`);
  });
};

startServer();
