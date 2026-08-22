import { describe, expect, it } from "vitest";
import { assessDonationCompliance } from "./complianceAssistant";

describe("assessDonationCompliance", () => {
  it("blocks a proposal that fails baseline safety checks without treating AI output as approval", async () => {
    const result = await assessDonationCompliance({ medicineName: "Test medicine", countryCode: "US", sealed: false, controlled: false, recalled: false, nonRefrigerated: true, expiryDate: "2030-01-01", traceabilityId: "LOT-1" });
    expect(result).toMatchObject({ recommendation: "block", reviewerRequired: true, source: "deterministic" });
    expect(result.requiredChecks).toContain("Medicine is manufacturer-sealed and unopened");
  });

  it("blocks a proposal where no country screening profile is available", async () => {
    const result = await assessDonationCompliance({ medicineName: "Test medicine", countryCode: "ZZ", sealed: true, controlled: false, recalled: false, nonRefrigerated: true, expiryDate: "2030-01-01", traceabilityId: "LOT-1" });
    expect(result).toMatchObject({ recommendation: "block", reviewerRequired: true, source: "deterministic" });
    expect(result.flags).toContain("Country profile unavailable");
  });
});
