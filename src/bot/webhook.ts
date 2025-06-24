import { fromZodError } from "zod-validation-error";
import { Hasher } from "../hasher";
import { eventListSchema, type EventList } from "../schema";
import { BotAPI } from "./api";
import type { BotOptions, WebhookContext, WebhookEvents } from "./types.ts";

export type WebhookEventHandler<T> = (data: T, api: BotAPI) => any;

export class BotWebhook {
  #handlers = new Map<keyof WebhookEvents, Set<WebhookEventHandler<any>>>();
  #options;
  #hasher;

  constructor(options: BotOptions) {
    this.#options = options;
    if (options.webhookSecret) {
      this.#hasher = new Hasher({ secret: options.webhookSecret });
    }
  }

  /**
   * Listens for a webhook event.
   */
  on<E extends keyof WebhookEvents>(
    event: E,
    handler: WebhookEventHandler<WebhookEvents[E]>,
  ) {
    const handlers = this.#handlers.get(event);
    if (!handlers) {
      this.#handlers.set(event, new Set([handler]));
    } else {
      handlers.add(handler);
    }
    return this;
  }

  /**
   * Handles a webhook request.
   */
  async handle(req: Request): Promise<Response> {
    const method = req.method.toUpperCase();

    if (method === "GET") {
      // Do verification dance.
      const url = new URL(req.url);
      const challenge = url.searchParams.get("challenge");
      if (!challenge) {
        return _createResponse(400, {
          message: "Missing 'challenge' query parameter.",
        });
      }
      return new Response(challenge, {
        status: 200,
        headers: [["content-type", "text/plain; charset=utf-8"]],
      });
    } else if (method === "POST") {
      const requestId = req.headers.get("x-chat-request-id")!;

      let json: any;

      if (this.#hasher) {
        const signature = req.headers.get("x-hub-signature-256");
        if (!signature) {
          return _createResponse(400, {
            message: "Missing 'X-Hub-Signature-256' header.",
          });
        }
        const data = await req.text();
        const verified = await this.#hasher.verify(signature, data);
        if (!verified) {
          return _createResponse(400, {
            message: "Request signature mismatch.",
          });
        }
        try {
          json = JSON.parse(data); // This should succeed if signature matches.
        } catch (error) {
          return _createResponse(400, {
            message: "Failed to parse request body.",
            error: (error as any)?.message,
          });
        }
      } else {
        // Skip verifying signature because none was provided.
        try {
          json = await req.json();
        } catch (error) {
          return _createResponse(400, {
            message: "Failed to parse request body.",
            error: (error as any)?.message,
          });
        }
      }

      // json is defined by this point.
      const {
        success,
        error,
        data: events,
      } = await eventListSchema.safeParseAsync(json);

      if (!success) {
        return _createResponse(400, {
          message: "Failed to parse request body.",
          error: fromZodError(error).toString(),
        });
      }

      // Everything looks good. Schedule handlers to run, then return a quick response.
      queueMicrotask(() => {
        this.#dispatch(events, { requestId });
      });

      return new Response("202 Accepted", {
        status: 202,
        statusText: "Accepted",
      });
    } else {
      return _createResponse(400, {
        message: `Unsupported method '${req.method.toUpperCase()}'.`,
      });
    }
  }

  async #dispatch(events: EventList, context: WebhookContext) {
    const api = new BotAPI(this.#options, context);

    for (const event of events) {
      const handlers = this.#handlers.get(event.type);
      if (handlers) {
        for (const handler of handlers) {
          try {
            await handler(event.data, api);
          } catch (error) {
            // TODO: Handle crash in listener.
            console.error("Error thrown in listener", error);
          }
        }
      }
    }
  }
}

function _createResponse(status: number, json: Record<any, any>) {
  return new Response(JSON.stringify(json), {
    status,
    headers: [["content-type", "application/json"]],
  });
}
