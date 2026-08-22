import { describe, expect, it } from "vitest";
import { canTransitionReviewStatus } from "./reviewStatus";

describe("canTransitionReviewStatus", () => {
  it("allows a reviewer to approve, hold, or reject a pending record", () => {
    expect(canTransitionReviewStatus("pending", "approved")).toBe(true);
    expect(canTransitionReviewStatus("pending", "hold")).toBe(true);
    expect(canTransitionReviewStatus("pending", "rejected")).toBe(true);
  });

  it("does not allow a rejected record to be silently reinstated", () => {
    expect(canTransitionReviewStatus("rejected", "approved")).toBe(false);
    expect(canTransitionReviewStatus("approved", "approved")).toBe(false);
  });
});
