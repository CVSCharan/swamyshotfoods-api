import StoreConfig, { IStoreConfig } from "../models/StoreConfig";

export class StoreConfigRepository {
  async getConfig(): Promise<IStoreConfig> {
    let config = await StoreConfig.findOne();
    if (!config) {
      config = await StoreConfig.create({});
    }
    return config;
  }

  async updateConfig(update: Partial<IStoreConfig>): Promise<IStoreConfig> {
    let config = await StoreConfig.findOne();
    if (!config) {
      config = await StoreConfig.create(update);
    } else {
      Object.assign(config, update);
      await config.save();
    }
    return config;
  }
}
