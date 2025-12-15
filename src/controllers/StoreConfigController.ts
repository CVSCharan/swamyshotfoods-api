import { Request, Response } from "express";
import { StoreConfigService } from "../services/StoreConfigService";
import { EventBroadcast } from "../config/eventBroadcast";
import { IStoreConfig } from "../models/StoreConfig";
import Logger from "../config/logger";

export class StoreConfigController {
  private service: StoreConfigService;

  constructor(service: StoreConfigService) {
    this.service = service;
  }

  getConfig = async (req: Request, res: Response): Promise<void> => {
    try {
      const config = await this.service.getConfig();
      const message = this.service.getShopMessage(config);
      res.status(200).json({ ...config.toObject(), currentStatusMsg: message });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  updateConfig = async (req: Request, res: Response): Promise<void> => {
    try {
      const config = await this.service.updateConfig(req.body);
      const message = this.service.getShopMessage(config);
      res.status(200).json({ ...config.toObject(), currentStatusMsg: message });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  sse = async (req: Request, res: Response): Promise<void> => {
    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
    res.flushHeaders();

    Logger.info("New SSE connection established");

    const sendUpdate = async (config: IStoreConfig) => {
      const message = this.service.getShopMessage(config);
      const data = JSON.stringify({
        ...config.toObject(),
        currentStatusMsg: message,
      });
      res.write(`data: ${data}\n\n`);
    };

    try {
      // Send initial data immediately
      const initialConfig = await this.service.getConfig();
      await sendUpdate(initialConfig);
      Logger.info("Initial SSE data sent");

      // Listen for updates from global EventBroadcast
      const listener = async (config: IStoreConfig) => {
        try {
          await sendUpdate(config);
          Logger.info("SSE update sent to client");
        } catch (error) {
          Logger.error("Error sending SSE update:", error);
        }
      };

      EventBroadcast.onStoreConfigUpdate(listener);

      // Heartbeat to keep connection alive (every 30 seconds)
      const heartbeat = setInterval(() => {
        res.write(": heartbeat\n\n");
      }, 30000);

      // Cleanup on disconnect
      req.on("close", () => {
        clearInterval(heartbeat);
        EventBroadcast.offStoreConfigUpdate(listener);
        Logger.info("SSE connection closed");
      });
    } catch (error) {
      Logger.error("Error in SSE endpoint:", error);
      res.end();
    }
  };
}
