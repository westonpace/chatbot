import { PersistentConfigService } from "../persistent-config-service";

export const PREFIX_CONFIG_KEY = 'chatbot-base:prefix';

export class PrefixService {

  private prefix: string | null = null;
  private defaultPrefix: string;

  constructor(private configService: PersistentConfigService, defaultPrefix: string) {
    this.defaultPrefix = defaultPrefix;
  }

  async getPrefix() {
    if (this.prefix === null) {
      const savedPrefix = await this.configService.load(PREFIX_CONFIG_KEY);
      return savedPrefix as string || this.defaultPrefix;
    }
    return this.prefix;
  }

  async setPrefix(prefix: string) {
    this.prefix = prefix;
    await this.configService.save(PREFIX_CONFIG_KEY, prefix);
  }

}