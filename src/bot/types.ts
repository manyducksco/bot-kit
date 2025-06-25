import type { Event } from "../schema.ts";

export interface BotOptions {
  /**
   * An API key for this bot. Defaults to `process.env['BOT_API_KEY']`.
   */
  apiKey?: string;

  /**
   * (Optional) A string to identify this bot for API calls. Defaults to `process.env['BOT_USER_AGENT']`.
   */
  userAgent?: string;

  /**
   * (Optional) If present the bot will only handle incoming webhook requests signed with this secret.
   * Defaults to `process.env['BOT_WEBHOOK_SECRET']`.
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
