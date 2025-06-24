import { test, expect } from "bun:test";
import { Hasher } from "./hasher.ts";

test("signing and verification both work", async () => {
  const hasher = new Hasher({ secret: "ABCD" });
  const data = JSON.stringify({ success: true });

  const signature = await hasher.sign(data);
  const verified = await hasher.verify(signature, data);
  const unverified = await hasher.verify("not the signature", data);

  expect(verified).toBe(true);
  expect(unverified).toBe(false);
});
