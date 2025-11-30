import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import Logger from "./config/logger";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

// Logging Middleware
const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  {
    stream: {
      write: (message) => Logger.http(message.trim()),
    },
  }
);

app.use(morganMiddleware);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger";

// Routes
app.use("/api", routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Health Check
app.get("/", (req, res) => {
  res.send("Swamy Hot Foods API is running");
});

// Global Error Handler (must be last)
app.use(errorHandler);

export default app;
