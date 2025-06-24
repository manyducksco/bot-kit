import { BotAPI } from "./api";
import type { BotOptions } from "./types";
import { BotWebhook } from "./webhook";

export class Bot {
  readonly webhook;
  readonly api;

  constructor(options: BotOptions) {
    this.webhook = new BotWebhook(options);
    this.api = new BotAPI(options);
  }
}
