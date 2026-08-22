export type ListingEligibilityInput = {
  sealed: boolean;
  controlled: boolean;
  recalled: boolean;
  nonRefrigerated: boolean;
  expiryDate: string;
  traceabilityId: string;
};

export type EligibilityResult = {
  eligible: boolean;
  conditions: Array<{ label: string; passed: boolean }>;
  decision: "ready_for_review" | "blocked";
};

function daysUntilExpiry(expiryDate: string) {
  const expiry = new Date(`${expiryDate}T00:00:00Z`).getTime();
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((expiry - today) / 86_400_000);
}

export function evaluateListingEligibility(input: ListingEligibilityInput): EligibilityResult {
  const conditions = [
    { label: "Medicine is manufacturer-sealed and unopened", passed: input.sealed },
    { label: "Medicine has at least 90 days before expiry", passed: daysUntilExpiry(input.expiryDate) >= 90 },
    { label: "Medicine is not controlled or subject to recall", passed: !input.controlled && !input.recalled },
    { label: "Medicine is within the non-refrigerated pilot scope", passed: input.nonRefrigerated },
    { label: "Traceability reference is provided", passed: input.traceabilityId.trim().length >= 4 },
  ];
  const eligible = conditions.every(condition => condition.passed);
  return { eligible, conditions, decision: eligible ? "ready_for_review" : "blocked" };
}
