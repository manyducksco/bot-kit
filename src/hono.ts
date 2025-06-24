import type { MiddlewareHandler } from "hono";
import type { Bot } from "./bot/bot.ts";

interface HandleWebhookOptions {
  /**
   * Path at which to mount webhook handler. Defaults to '/'.
   */
  path?: string;
}

export function handleWebhook(bot: Bot, options?: HandleWebhookOptions) {
  const path = options?.path ?? "/";
  const fn: MiddlewareHandler = async (c, next) => {
    if (c.req.path === path) {
      return bot.webhook.handle(c.req.raw);
    } else {
      return next();
    }
  };
  return fn;
}
