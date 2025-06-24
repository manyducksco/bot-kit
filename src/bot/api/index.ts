import type { BotOptions, WebhookContext } from "../types";
import { MessagesAPI } from "./messages";

export { MessagesAPI as BotMessages } from "./messages";

/**
 * API object passed to webhook handlers. All API calls made through this object
 * return the `x-chat-request-id` header from the webhook in order to link these to the webhook that spawned them.
 */
export class BotAPI {
  readonly messages: MessagesAPI;

  constructor(options: BotOptions, context?: WebhookContext) {
    this.messages = new MessagesAPI(options, context);
  }
}
