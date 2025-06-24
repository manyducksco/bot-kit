import type { Event } from "../schema.ts";

export interface BotOptions {
  /**
   * A valid Bot API key. The bot will use this to make API calls to send messages.
   */
  apiKey: string;

  /**
   * A string to identify this bot. Used for API calls.
   */
  userAgent?: string;

  /**
   * A webhook secret. This is configured in the Bot settings in Chat.
   * If present the bot will only handle incoming webhook requests signed with this secret.
   */
  webhookSecret?: string;
}

export interface WebhookContext {
  requestId: string;
}

/**
 * A mapping of event names to their `data` object type.
 */
export type WebhookEvents = {
  [K in Event["type"]]: Extract<Event, { type: K }>["data"];
};
