import { EventEmitter } from "events";
import Logger from "./logger";
import { IStoreConfig } from "../models/StoreConfig";

/**
 * Singleton Event Broadcast Service
 * Used for broadcasting events across the application, particularly for SSE connections
 */
class EventBroadcastService extends EventEmitter {
  private static instance: EventBroadcastService;

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
   * Emit a store config update event
   * @param config - The updated store configuration
   */
  emitStoreConfigUpdate(config: IStoreConfig): void {
    Logger.info("Broadcasting storeConfig:updated event");
    this.emit("storeConfig:updated", config);
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
}

// Export singleton instance
export const EventBroadcast = EventBroadcastService.getInstance();

