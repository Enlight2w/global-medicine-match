import { describe, expect, it } from "vitest";
import { hashFeedSecret, verifyFeedSecret } from "./db";

describe("inventory feed secret verification", () => {
  it("accepts the generated secret and rejects an altered value", () => {
    const secret = "a-secure-partner-feed-secret";
    const hash = hashFeedSecret(secret);
    expect(verifyFeedSecret(secret, hash)).toBe(true);
    expect(verifyFeedSecret(`${secret}-changed`, hash)).toBe(false);
  });

  it("rejects feeds without a configured secret hash", () => {
    expect(verifyFeedSecret("anything", null)).toBe(false);
  });
});

