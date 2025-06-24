import { z } from "zod";

/*=====================================*\
||          Event Data Parts           ||
\*=====================================*/

const roomSchema = z.object({
  id: z.string().uuid(),
  emoji: z.string(),
  name: z.string(),
  description: z.string(),
});

const messageAuthorSchema = z.object({
  type: z.enum(["user", "bot"]),
  id: z.string().uuid(),
  name: z.string(),
  hue: z.number().min(0).max(360),
});

const messageAttachmentSchema = z.object({});

const messageSchema = z
  .object({
    id: z.string().uuid(),
    text: z.string().nullable(),
    author: messageAuthorSchema,
    attachments: z.array(messageAttachmentSchema),
  })
  .refine((data) => !(data.text == null && data.attachments.length === 0), {
    message: "Message must have text or at least one attachment.",
  });

/*=====================================*\
||               Events                ||
\*=====================================*/

const baseEventSchema = z.object({
  type: z.string(),
  data: z.object({}),
});

/**
 * Emitted when any message is sent in a room where the bot is a member.
 */
export type MessageSentEvent = z.infer<typeof messageSentEventSchema>;
export const messageSentEventSchema = baseEventSchema.extend({
  type: z.literal("messageSent"),
  data: z.object({
    room: roomSchema,
    message: messageSchema,
  }),
});

/**
 * Emitted when this bot is mentioned in a message.
 */
export type BotMentionedEvent = z.infer<typeof messageSentEventSchema>;
export const botMentionedEventSchema = baseEventSchema.extend({
  type: z.literal("botMentioned"),
  data: z.object({
    room: roomSchema,
    message: messageSchema,
  }),
});

export type Event = z.infer<typeof eventSchema>;
export const eventSchema = z.discriminatedUnion("type", [
  messageSentEventSchema,
  botMentionedEventSchema,
]);

export type EventList = z.infer<typeof eventListSchema>;
export const eventListSchema = z.array(eventSchema);

/**
 * Creates a type-safe event object.
 *
 * @param type - Event type
 * @param data - Event data
 */
export function createEvent<T extends Event["type"]>(
  type: T,
  data: Extract<Event, { type: T }>["data"],
): Event {
  return { type, data };
}
