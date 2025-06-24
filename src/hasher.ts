export type HasherOptions = { secret: string };

/**
 * Signs and/or verifies a payload using HMAC SHA-256.
 */
export class Hasher {
  #options;
  #algorithm = { name: "HMAC", hash: { name: "SHA-256" } };
  #encoder = new TextEncoder();
  #key?: CryptoKey;

  async #getKey(): Promise<CryptoKey> {
    if (!this.#key) {
      this.#key = await crypto.subtle.importKey(
        "raw",
        this.#encoder.encode(this.#options.secret),
        this.#algorithm,
        false,
        ["sign", "verify"],
      );
    }
    return this.#key!;
  }

  constructor(options: HasherOptions) {
    this.#options = options;
  }

  async sign(data: string): Promise<string> {
    const key = await this.#getKey();
    const signature = await crypto.subtle.sign(
      this.#algorithm,
      key,
      this.#encoder.encode(data),
    );

    // convert buffer to byte array
    const hashArray = Array.from(new Uint8Array(signature));

    // convert bytes to hex string
    const digest = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return `sha256=${digest}`;
  }

  async verify(signature: string, data: string): Promise<boolean> {
    if (signature.startsWith("sha256=")) {
      signature = signature.replace("sha256=", "");
    }
    const sigBuffer = Uint8Array.from(
      signature.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
    );
    const key = await this.#getKey();
    return crypto.subtle.verify(
      this.#algorithm,
      key,
      sigBuffer,
      this.#encoder.encode(data),
    );
  }
}
