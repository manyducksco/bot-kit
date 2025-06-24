import { beforeEach, describe, test, expect, mock, Mock } from "bun:test";
import { MessagesAPI } from "./messages";

beforeEach(() => {
  global.fetch = mock() as any as typeof fetch;
});

describe("create", () => {
  test("includes expected headers", async () => {
    const api = new MessagesAPI({ apiKey: "asdf" }, { requestId: "TEST" });
    const body = { roomId: "room.id", markdown: "Yo" };
    await api.create(body);
    expect(global.fetch).toBeCalledTimes(1);
    const [url, init] = (global.fetch as unknown as Mock<any>).mock
      .calls[0] as [URL, RequestInit];

    const headers = init.headers as Headers;

    // Includes auth token as bearer auth header.
    expect(headers.get("authorization")).toBe("Bearer asdf");

    // Includes request ID from context.
    expect(headers.get("x-chat-request-id")).toBe("TEST");
  });
});
