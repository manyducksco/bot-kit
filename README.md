# @manyducks.co/chatbot

Create bots for [🦆Chat](https://chat.manyducks.co). Bots are comprised of a webhook handler and an API for interacting with chat. This library abstracts away the gnarly details of handling webhooks and lets you focus on responding to events.

```js
import { Hono } from "hono";
import { Bot } from "@manyducks.co/chatbot";

// Define your bot.
const bot = new Bot({
  apiKey: process.env.BOT_API_KEY,
  webhookSecret: process.env.BOT_WEBHOOK_SECRET,
  userAgent: "MyBot/1.0"
});

// Handle a `botMentioned` event via webhook.
bot.webhook.on("botMentioned", async (data, api) => {
  // Send a message in response via the Bot API.
  await api.messages.create({
    roomId: data.room.id,
    replyToMessageId: data.message.id,
    markdown: "You called?"
  });
});

export default {
  fetch(req) {
    // Handler takes a `Request` and returns a Promise which resolves to a `Response`.
    return bot.webhook.handle(req);
  }
}
```

This library should run on any modern JavaScript runtime that supports WebCrypto and `fetch`:

- Node 18+
- Deno 1.11+
- Bun
- Cloudflare Workers
- Supabase Edge Functions

## Hono Adapter

A Hono middleware is included so you can mount a bot in an existing Hono app.

```js
import { Hono } from "hono";
import { handleWebhook } from "@manyducks.co/dolla/hono";

// ... bot setup ...

const app = new Hono();

app.use(handleWebhook(bot, { path: "/webhook" }));

// ... other routes ...

export default app;
```
