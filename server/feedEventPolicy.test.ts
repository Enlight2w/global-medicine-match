import { describe, expect, it } from "vitest";
import { decideFeedEvent } from "./feedEventPolicy";

describe("feed event policy", () => {
  it("accepts valid events only for an activated feed", () => {
    expect(decideFeedEvent({ secretValid: true, syncStatus: "ready", duplicate: false })).toEqual({ accepted: true, reason: "processed" });
    expect(decideFeedEvent({ secretValid: true, syncStatus: "awaiting_credentials", duplicate: false })).toEqual({ accepted: false, reason: "feed-not-ready" });
  });

  it("rejects an invalid secret and makes duplicate events idempotent", () => {
    expect(decideFeedEvent({ secretValid: false, syncStatus: "ready", duplicate: false })).toEqual({ accepted: false, reason: "invalid-feed-auth" });
    expect(decideFeedEvent({ secretValid: true, syncStatus: "ready", duplicate: true })).toEqual({ accepted: true, reason: "duplicate-event" });
  });
});
