import { BotAPI } from "./api/index.ts";
import type { BotOptions } from "./types.ts";
import { BotWebhook } from "./webhook.ts";

export class Bot {
  readonly webhook;
  readonly api;

  constructor(options: BotOptions) {
    if (!options.apiKey) {
      throw new Error(`Expected 'apiKey' but received: ${options.apiKey}`);
    }

    this.webhook = new BotWebhook(options);
    this.api = new BotAPI(options);
  }
}
