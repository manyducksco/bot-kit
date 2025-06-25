# @manyducks.co/bot-kit

BotKit is a simple toolkit for building [🦆Chat](https://chat.manyducks.co) Bots. Bots are comprised of a webhook handler and an API for interacting with chat. This library abstracts away the gnarly details of handling webhooks and lets you focus on responding to events.

```js
import { Bot } from "@manyducks.co/bot-kit";

// Define your bot.
const bot = new Bot({
  apiKey: process.env.BOT_API_KEY,
  webhookSecret: process.env.BOT_WEBHOOK_SECRET,
  userAgent: "MyBot/1.0"
});

// Handle events sent via webhook.
bot.webhook.on("botMentioned", async (data, api) => {
  // Use the Bot API to respond to messages.
  await api.messages.create({
    roomId: data.room.id,
    replyToMessageId: data.message.id,
    markdown: "You called?"
  });
});

export default {
  fetch(req) {
    // Handler takes a `Request` and returns a `Promise<Response>`.
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
import { handleWebhook } from "@manyducks.co/bot-kit/hono";

// ... bot setup ...

const app = new Hono();

app.use(handleWebhook(bot, { path: "/webhook" }));

// ... other routes ...

export default app;
```

## Handling Webhooks

Bots can respond to events that occur in rooms they're in. You create handlers for these events using the `.webhook.on` method on the Bot instance.

```js
bot.webhook.on("<eventName>", async (data, api) => {
  // Handle <eventName>
});
````

Event handlers take two arguments; the event data object and a Bot API client. The `data` object includes info about the room and message, and you can use the `api` to respond to these events.

### Events

This section lists the event types you can listen for. Each event type must be enabled in the Bot's settings within the Chat app in order to be received.

#### `messageSent`

Emitted when a message is sent to a room the bot is in.

##### Data

```jsonc
{
  "room": {
    "id": "<uuid>",
    "emoji": "",
    "name": "Room Name",
    "description": "Description of a room."
  },
  "message": {
    "id": "<uuid>",
    "author": {
      "type": "user", // or "bot"
      "id": "<uuid>",
      "name": "User/Bot Name",
      "hue": 172, // User or bot's accent color in OKLCH hue (0 to 360)
    },
    "text": "The message body in plain text. If it includes mentions they will look like @[this](mention://<type>/<uuid>).",
    "attachments": [
      // TODO: Define this.
    ]
  }
}
```

#### `botMentioned`

Emitted when a message is sent in a room this bot is in, and that message explicitly mentions this bot.

If your bot is also set up to receive `messageSent` you will get both a `messageSent` and a `botMentioned` for one message that mentions the bot.

##### Data

> Same as `messageSent`

## API

The API is accessible in two ways; on the `Bot` instance, and passed as the second argument to webhook handlers.

If your bot doesn't use webhooks, or if you want to send a message unprompted by a webhook, the API methods are accessible on the `api` property of a Bot instance.

```js
const bot = new Bot({ /* settings */ });

bot.api.messages.create({
  roomId: "...",
  markdown: "HELLO!"
});
````

If you want to make API calls in response to a webhook event, you can use the `api` object passed to the webhook handler. Calling the API this way will associate those calls with the webhook that triggered them, which you will be able to see this in the event log on the Bot settings page in Chat.

```js
bot.webhook.on("messageSent", async (data, api) => {
  return api.messages.create({
    roomId: "...",
    markdown: "HELLO!"
  })
});
````

### Messages API

```
.messages.create({
  roomId: string,
  markdown: string,
  replyToMessageId?: string
})
```
