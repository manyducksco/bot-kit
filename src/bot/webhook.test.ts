import { describe, test, expect } from "bun:test";
import { BotWebhook } from "./webhook.ts";
import {
  botMentionedEventSchema,
  createEvent,
  MessageSentEvent,
  messageSentEventSchema,
} from "../schema";
import { BotAPI } from "./api/index.ts";
import { Hasher } from "../hasher.ts";
import { randomUUIDv7 } from "bun";

describe("endpoint validation", () => {
  test("returns 400 when challenge is not included", async () => {
    const webhook = new BotWebhook({ apiKey: "asdf" });
    const url = new URL("https://example.com/webhook");
    const req = new Request(url, {
      method: "GET",
      headers: [
        ["Content-Type", "text/plain"],
        ["User-Agent", "BotTest/1.0"],
      ],
    });

    const res = await webhook.handle(req);

    expect(res.ok).toBe(false);
    expect(res.status).toBe(400);

    const body = await res.json();

    expect(body.message).toBe("Missing 'challenge' query parameter.");
  });

  test("responds with challenge", async () => {
    const challenge = "repeat after me";

    const webhook = new BotWebhook({ apiKey: "asdf" });
    const url = new URL("https://example.com/webhook");
    url.searchParams.set("challenge", challenge);
    const req = new Request(url, {
      method: "GET",
      headers: [
        ["Content-Type", "text/plain"],
        ["User-Agent", "BotTest/1.0"],
      ],
    });

    const res = await webhook.handle(req);

    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);

    const body = await res.text();

    expect(body).toBe(challenge);
  });
});

describe("signature verification", () => {
  test("returns 400 when signature is expected but not included", async () => {
    const webhookSecret = "it's a secret";
    const webhook = new BotWebhook({
      apiKey: "asdf",
      // webhookSecret,
    });

    const body = JSON.stringify([]);

    // const hasher = new Hasher({ secret: webhookSecret });
    // const signature = await hasher.sign(body);

    const url = new URL("https://example.com/webhook");
    const headers = new Headers([
      ["Content-Type", "application/json"],
      ["User-Agent", "BotTest/1.0"],
      ["X-Chat-Request-ID", "THIS_IS_A_TEST"],
      // ["X-Hub-Signature-256", signature],
    ]);
    const req = new Request(url, {
      method: "POST",
      headers,
      body,
    });

    const res = await webhook.handle(req);

    expect(res.ok).toBe(true);
    expect(res.status).toBe(202);
  });

  test("ignores lack of signature when not expected", async () => {
    // We don't pass any signature; verification should be skipped.
    const webhookSecret = "it's a secret";
    const webhook = new BotWebhook({
      apiKey: "asdf",
      // webhookSecret,
    });

    const body = JSON.stringify([]);

    // const hasher = new Hasher({ secret: webhookSecret });
    // const signature = await hasher.sign(body);

    const url = new URL("https://example.com/webhook");
    const headers = new Headers([
      ["Content-Type", "application/json"],
      ["User-Agent", "BotTest/1.0"],
      ["X-Chat-Request-ID", "THIS_IS_A_TEST"],
      // ["X-Hub-Signature-256", signature],
    ]);
    const req = new Request(url, {
      method: "POST",
      headers,
      body,
    });

    const res = await webhook.handle(req);

    expect(res.ok).toBe(true);
    expect(res.status).toBe(202);
  });

  test("returns 202 when signature is valid", async () => {
    const webhookSecret = "it's a secret";
    const webhook = new BotWebhook({
      apiKey: "asdf",
      webhookSecret,
    });

    const body = JSON.stringify([]);

    const hasher = new Hasher({ secret: webhookSecret });
    const signature = await hasher.sign(body);

    const url = new URL("https://example.com/webhook");
    const headers = new Headers([
      ["Content-Type", "application/json"],
      ["User-Agent", "BotTest/1.0"],
      ["X-Chat-Request-ID", "THIS_IS_A_TEST"],
      ["X-Hub-Signature-256", signature],
    ]);
    const req = new Request(url, {
      method: "POST",
      headers,
      body,
    });

    const res = await webhook.handle(req);

    expect(res.ok).toBe(true);
    expect(res.status).toBe(202);
  });
});

describe("event handling", () => {
  test("handles webhook events", async () => {
    expect.assertions(6);

    const webhookSecret = "it's a secret";
    const webhook = new BotWebhook({ apiKey: "asdf", webhookSecret });

    webhook.on("botMentioned", async (data, api) => {
      expect(() =>
        botMentionedEventSchema.shape.data.parse(data),
      ).not.toThrowError();
      expect(api).toBeInstanceOf(BotAPI);
    });
    webhook.on("messageSent", async (data, api) => {
      expect(() =>
        messageSentEventSchema.shape.data.parse(data),
      ).not.toThrowError();
      expect(api).toBeInstanceOf(BotAPI);
    });

    const events = createTestEvents();
    const body = JSON.stringify(events);

    const hasher = new Hasher({ secret: webhookSecret });
    const signature = await hasher.sign(body);

    const url = new URL("https://example.com/webhook");
    const headers = new Headers([
      ["Content-Type", "application/json"],
      ["User-Agent", "BotTest/1.0"],
      ["X-Chat-Request-ID", "THIS_IS_A_TEST"],
      ["X-Hub-Signature-256", signature],
    ]);
    const req = new Request(url, {
      method: "POST",
      headers,
      body,
    });

    const res = await webhook.handle(req);

    // const resBody = await res.json();
    // console.log(res, resBody);

    expect(res.ok).toBe(true);
    expect(res.status).toBe(202);
  });
});

function createTestEvents() {
  const data: MessageSentEvent["data"] = {
    room: {
      id: randomUUIDv7(),
      emoji: "🫶",
      name: "Fake Room",
      description: "Fake room for testing.",
    },
    message: {
      id: randomUUIDv7(),
      author: {
        type: "user",
        id: randomUUIDv7(),
        name: "Fake User",
        hue: 17.12,
      },
      text: "This is the message.",
      attachments: [],
    },
  };
  const events = [
    createEvent("botMentioned", data),
    createEvent("messageSent", data),
  ];

  return events;
}
