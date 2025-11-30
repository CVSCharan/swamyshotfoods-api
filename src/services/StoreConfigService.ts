import { IStoreConfig } from "../models/StoreConfig";
import { StoreConfigRepository } from "../repositories/StoreConfigRepository";
import { EventEmitter } from "events";

export class StoreConfigService extends EventEmitter {
  private repository: StoreConfigRepository;

  constructor(repository: StoreConfigRepository) {
    super();
    this.repository = repository;
  }

  async getConfig(): Promise<IStoreConfig> {
    return await this.repository.getConfig();
  }

  async updateConfig(update: Partial<IStoreConfig>): Promise<IStoreConfig> {
    // Logic from legacy code:
    // If shopStatus (isShopOpen) is being set to true and cooking is already true -> cooking = false
    // If cooking (isCooking) is being set to true and shopStatus is already true -> shopStatus = false

    const currentConfig = await this.repository.getConfig();

    if (update.isShopOpen === true && currentConfig.isCooking === true) {
      update.isCooking = false;
    }

    if (update.isCooking === true && currentConfig.isShopOpen === true) {
      update.isShopOpen = false;
    }

    const newConfig = await this.repository.updateConfig(update);

    // Emit event for SSE
    this.emit("updated", newConfig);

    return newConfig;
  }

  getShopMessage(config: IStoreConfig): string {
    // Convert server time to Indian Standard Time (IST)
    const now = new Date();
    const utcOffsetMinutes = now.getTimezoneOffset();
    const istOffsetMinutes = 330; // IST is UTC+5:30
    const istTime = new Date(
      now.getTime() + (istOffsetMinutes - utcOffsetMinutes) * 60 * 1000
    );

    const currentDay = istTime.getDay(); // 0 (Sunday) to 6 (Saturday)
    const currentHours = istTime.getHours();
    const currentMinutes = istTime.getMinutes();
    const currentTime = currentHours * 60 + currentMinutes;

    const morningOpen = 5 * 60;
    const morningClose = 11 * 60 + 59;
    const eveningOpen = 16 * 60 + 30;
    const eveningClose = 21 * 60 + 30;

    const morningClosingSoon = 10 * 60 + 45;
    const eveningClosingSoon = 20 * 60 + 45;

    let message = "";

    if (currentDay === 6 && currentTime > eveningClosingSoon) {
      return "☀️ Sunday's Holiday";
    }

    if (currentDay === 0 && currentTime > eveningClose) {
      return "Shop Opens at 5:30 AM";
    }

    if (currentDay === 0) {
      return "☀️ Sunday's Holiday";
    }

    if (config.isShopOpen) {
      if (
        (currentTime >= morningClosingSoon && currentTime <= morningClose) ||
        (currentTime >= eveningClosingSoon && currentTime <= eveningClose)
      ) {
        message = "Closing soon..!";
      }
    } else {
      if (currentTime > morningClose && currentTime < eveningOpen) {
        message = "Shop opens at 4:30 PM";
      } else if (
        (currentTime > eveningClose && currentTime < 24 * 60) ||
        (currentTime >= 0 && currentTime < morningOpen)
      ) {
        message = "Shop opens at 5:30 AM";
      }
    }

    return message;
  }
}
