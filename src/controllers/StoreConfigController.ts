import { Request, Response } from "express";
import { StoreConfigService } from "../services/StoreConfigService";

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
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const sendUpdate = async () => {
      const config = await this.service.getConfig();
      const message = this.service.getShopMessage(config);
      const data = JSON.stringify({
        ...config.toObject(),
        currentStatusMsg: message,
      });
      res.write(`data: ${data}\n\n`);
    };

    // Send initial data
    await sendUpdate();

    // Listen for updates
    const listener = async () => {
      await sendUpdate();
    };

    this.service.on("updated", listener);

    // Cleanup on disconnect
    req.on("close", () => {
      this.service.off("updated", listener);
    });
  };
}
