import type { BotOptions, WebhookContext } from "../types";

interface MessageCreateOptions {
  /**
   * The room ID to send the message in.
   */
  roomId: string;

  /**
   * Message content in Markdown format.
   */
  markdown: string;

  /**
   * (Optional) ID of a message to reply to.
   */
  replyToMessageId?: string;
}

export class MessagesAPI {
  #options;
  #context;

  constructor(options: BotOptions, context?: WebhookContext) {
    this.#options = options;
    this.#context = context;
  }

  /**
   * Send a new message.
   */
  async create(options: MessageCreateOptions): Promise<Response> {
    const url = new URL("/api/bot/v1/messages", "https://chat.manyducks.co");
    const headers = new Headers([
      ["Content-Type", "application/json"],
      ["Authorization", `Bearer ${this.#options.apiKey}`],
    ]);
    if (this.#options?.userAgent) {
      headers.set("User-Agent", this.#options.userAgent);
    }
    if (this.#context) {
      headers.set("X-Chat-Request-ID", this.#context.requestId);
    }
    return fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(options),
    });
  }
}
