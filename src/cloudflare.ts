import type { Bot } from "./bot";

export interface WorkerContextLike {
  waitUntil(promise: Promise<any>): any;
}

/**
 * Handles a webhook, ensuring that all events are processed before the worker suspends.
 */
export function handleWebhook(
  bot: Bot,
  request: Request,
  context: WorkerContextLike,
) {
  let resolve: any;
  const promise = new Promise((_resolve) => {
    resolve = _resolve;
  });
  context.waitUntil(promise);

  return bot.webhook.handle(request, resolve);
}
