import { describe, expect, it } from "vitest";
import { allowRateLimitedRequest, sanitizeSearchQuery } from "./security";

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
});
