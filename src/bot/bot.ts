import { BotAPI } from "./api/index.ts";
import type { BotOptions } from "./types.ts";
import { BotWebhook } from "./webhook.ts";

export class Bot {
  readonly webhook;
  readonly api;

  constructor(options?: BotOptions) {
    const settings = { ...options };

    if (!settings.apiKey) {
      settings.apiKey = process.env.BOT_API_KEY;
    }
    if (!settings.webhookSecret) {
      settings.webhookSecret = process.env.BOT_WEBHOOK_SECRET;
    }
    if (!settings.userAgent) {
      settings.userAgent = process.env.BOT_USER_AGENT;
    }

    if (!settings.apiKey) {
      throw new Error(
        `You must pass 'apiKey' or define a 'BOT_API_KEY' environment variable.`,
      );
    }

    this.webhook = new BotWebhook(settings);
    this.api = new BotAPI(settings);
  }
}
