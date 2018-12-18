import { Collection } from "mongodb";

export interface PersistentConfigService {
  load(key: string): Promise<any | null>;
  save(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
}

export class InMemoryPersistentConfigService implements PersistentConfigService {

  private map = new Map<string, any>();

  async load(key: string) {
    return this.map.get(key) || null;
  }

  async save(key: string, value: any) {
    this.map.set(key, value);
  }

  async delete(key: string) {
    this.map.delete(key);
  }

}

export class MongoPersistentConfigService implements PersistentConfigService {

  constructor (private collection: Collection) {

  }

  async initialize() {
    const existing = await this.collection.findOne({});
    if (!existing) {
      await this.collection.insertOne({});
    }
  }

  private async getConfig() {
    return this.collection.findOne({});
  }

  private async updateConfig(newValue: any) {
    return this.collection.replaceOne({}, newValue);
  }

  async load(key: string) {
    const config = await this.getConfig();
    return config[key];
  }

  async save(key: string, value: any) {
    const config = await this.getConfig();
    config[key] = value;
    return this.updateConfig(config).then(() => {});
  }

  async delete(key: string) {
    const config = await this.getConfig();
    delete config[key];
    return this.updateConfig(config).then(() => {});
  }

}