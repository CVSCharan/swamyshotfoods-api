import dotenv from "dotenv";
import app from "./app";
import connectDB from "./config/database";
import Logger from "./config/logger";

dotenv.config();

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  Logger.info(`Server running on port ${PORT}`);
});
