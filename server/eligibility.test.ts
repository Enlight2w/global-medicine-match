import { describe, expect, it } from "vitest";
import { evaluateListingEligibility } from "./eligibility";

describe("evaluateListingEligibility", () => {
  it("allows a sealed, traceable, non-controlled item with sufficient shelf life into review", () => {
    const result = evaluateListingEligibility({ sealed: true, controlled: false, recalled: false, nonRefrigerated: true, expiryDate: "2030-06-01", traceabilityId: "LOT-9822" });
    expect(result).toMatchObject({ eligible: true, decision: "ready_for_review" });
    expect(result.conditions.every(condition => condition.passed)).toBe(true);
  });

  it("blocks opened, recalled, cold-chain, or untraceable medicine", () => {
    const result = evaluateListingEligibility({ sealed: false, controlled: false, recalled: true, nonRefrigerated: false, expiryDate: "2030-06-01", traceabilityId: "" });
    expect(result.eligible).toBe(false);
    expect(result.decision).toBe("blocked");
    expect(result.conditions.filter(condition => !condition.passed)).toHaveLength(4);
  });
});
