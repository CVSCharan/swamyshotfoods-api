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
    const config = await StoreConfig.findOneAndUpdate({}, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });
    return config;
  }
}
