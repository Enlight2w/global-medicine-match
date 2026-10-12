import { describe, expect, it } from "vitest";
import { allowRateLimitedRequest, inboundFeedEventSchema, isSafeProviderEndpoint, isSameOriginRequest, sanitizeSearchQuery } from "./security";

describe("security helpers", () => {
  it("normalizes dangerous or excessively long search text", () => {
    expect(sanitizeSearchQuery("  <script> Metformin\n  ")).toBe("script Metformin");
    expect(sanitizeSearchQuery("x".repeat(120))).toHaveLength(80);
  });

  it("limits repeated anonymous discovery requests within a time window", () => {
    const now = 1_000;
    expect(allowRateLimitedRequest("test-rate-limit", 2, 1_000, now)).toBe(true);
    expect(allowRateLimitedRequest("test-rate-limit", 2, 1_000, now)).toBe(true);
    expect(allowRateLimitedRequest("test-rate-limit", 2, 1_000, now)).toBe(false);
    expect(allowRateLimitedRequest("test-rate-limit", 2, 1_000, now + 1_001)).toBe(true);
  });

  it("accepts only public HTTPS provider endpoints", () => {
    expect(isSafeProviderEndpoint("https://pharmacy.example.com/inventory")).toBe(true);
    expect(isSafeProviderEndpoint("http://pharmacy.example.com/inventory")).toBe(false);
    expect(isSafeProviderEndpoint("https://127.0.0.1/inventory")).toBe(false);
    expect(isSafeProviderEndpoint("https://169.254.169.254/latest/meta-data")).toBe(false);
    expect(isSafeProviderEndpoint("https://user:secret@pharmacy.example.com/inventory#token")).toBe(false);
  });

  it("rejects malformed or oversized feed events before ingestion", () => {
    const valid = { eventId: "event-1", records: [{ externalSourceId: "vendor-1", medicineName: "Metformin", dosage: "500 mg", quantity: 10, expiryDate: "2030-01-01", traceabilityId: "LOT-1", storageHistory: "Ambient", sealed: true, controlled: false, recalled: false, nonRefrigerated: true, countryCode: "US" }] };
    expect(inboundFeedEventSchema.safeParse(valid).success).toBe(true);
    expect(inboundFeedEventSchema.safeParse({ ...valid, eventId: "event id with spaces" }).success).toBe(false);
    expect(inboundFeedEventSchema.safeParse({ ...valid, records: [{ ...valid.records[0], quantity: 0 }] }).success).toBe(false);
    expect(inboundFeedEventSchema.safeParse({ ...valid, records: Array.from({ length: 251 }, () => valid.records[0]) }).success).toBe(false);
  });

  it("allows same-origin or headerless requests but rejects a foreign origin", () => {
    expect(isSameOriginRequest(undefined, "https://app.example.com")).toBe(true);
    expect(isSameOriginRequest("https://app.example.com", "https://app.example.com")).toBe(true);
    expect(isSameOriginRequest("https://evil.example", "https://app.example.com")).toBe(false);
  });
});
