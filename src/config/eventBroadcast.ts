import { EventEmitter } from "events";
import Logger from "./logger";
import { IStoreConfig } from "../models/StoreConfig";
import StoreConfig from "../models/StoreConfig";
import Menu from "../models/Menu";

/**
 * Singleton Event Broadcast Service
 * Used for broadcasting events across the application, particularly for SSE connections
 */
class EventBroadcastService extends EventEmitter {
  private static instance: EventBroadcastService;
  private hasChangeStream: boolean = false;

  private constructor() {
    super();
    // Increase max listeners to handle multiple SSE connections
    this.setMaxListeners(100);
  }

  /**
   * Get the singleton instance of EventBroadcastService
   */
  static getInstance(): EventBroadcastService {
    if (!EventBroadcastService.instance) {
      EventBroadcastService.instance = new EventBroadcastService();
      Logger.info("EventBroadcast service initialized");
    }
    return EventBroadcastService.instance;
  }

  /**
   * Initialize MongoDB Change Stream to listen for StoreConfig updates
   * This guarantees that updates from ANY instance (or manual DB edits)
   * are broadcast to SSE clients connected to this specific instance.
   */
  initChangeStream(): void {
    Logger.info("Initializing MongoDB Change Stream for StoreConfig...");
    try {
      const changeStream = StoreConfig.watch();

      changeStream.on("change", async (change) => {
        if (
          change.operationType === "update" ||
          change.operationType === "replace" ||
          change.operationType === "insert"
        ) {
          Logger.info(`StoreConfig modified in DB (${change.operationType}). Broadcasting to SSE clients.`);
          
          // Fetch the latest full document
          const latestConfig = await StoreConfig.findOne();
          if (latestConfig) {
            this.emit("storeConfig:updated", latestConfig);
          }
        }
      });

      this.hasChangeStream = true;

      changeStream.on("error", (error) => {
        Logger.error("MongoDB Change Stream Error:", error);
        this.hasChangeStream = false;
      });

      // Also watch Menu collection
      const menuChangeStream = Menu.watch();
      menuChangeStream.on("change", async (change) => {
        if (
          change.operationType === "update" ||
          change.operationType === "replace" ||
          change.operationType === "insert" ||
          change.operationType === "delete"
        ) {
          Logger.info(`Menu modified in DB (${change.operationType}). Broadcasting to SSE clients.`);
          this.emit("menu:updated");
        }
      });
      menuChangeStream.on("error", (error) => {
        Logger.error("MongoDB Menu Change Stream Error:", error);
      });

    } catch (error) {
      Logger.error("Failed to initialize MongoDB Change Stream. Falling back to local events:", error);
      this.hasChangeStream = false;
    }
  }

  /**
   * Emit a store config update event (Legacy, mainly used internally now)
   * @param config - The updated store configuration
   */
  emitStoreConfigUpdate(config: IStoreConfig): void {
    // If change streams are active, we don't need to manually emit, as the watch() will catch it.
    // We only emit locally if change streams failed to initialize (e.g., local standalone MongoDB).
    if (!this.hasChangeStream) {
      Logger.info("Broadcasting storeConfig:updated event (Local Fallback)");
      this.emit("storeConfig:updated", config);
    } else {
      Logger.info("Skipping local emit; relying on MongoDB Change Stream");
    }
  }

  /**
   * Listen for store config updates
   * @param listener - Callback function to handle updates
   */
  onStoreConfigUpdate(listener: (config: IStoreConfig) => void | Promise<void>): void {
    this.on("storeConfig:updated", listener);
  }

  /**
   * Remove store config update listener
   * @param listener - Callback function to remove
   */
  offStoreConfigUpdate(listener: (config: IStoreConfig) => void | Promise<void>): void {
    this.off("storeConfig:updated", listener);
  }

  /**
   * Listen for menu updates
   * @param listener - Callback function to handle updates
   */
  onMenuUpdate(listener: () => void | Promise<void>): void {
    this.on("menu:updated", listener);
  }

  /**
   * Remove menu update listener
   * @param listener - Callback function to remove
   */
  offMenuUpdate(listener: () => void | Promise<void>): void {
    this.off("menu:updated", listener);
  }
}

// Export singleton instance
export const EventBroadcast = EventBroadcastService.getInstance();

