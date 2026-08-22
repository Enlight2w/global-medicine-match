import { complianceDirectory } from "../shared/complianceDirectory";
import { evaluateListingEligibility, type ListingEligibilityInput } from "./eligibility";
import { invokeLLM } from "./_core/llm";

export type ComplianceRecommendation = {
  recommendation: "human_review" | "hold" | "block";
  rationale: string;
  requiredChecks: string[];
  flags: string[];
  reviewerRequired: true;
  source: "deterministic" | "ai_assisted";
};

export async function assessDonationCompliance(input: ListingEligibilityInput & { countryCode: string; medicineName: string }) : Promise<ComplianceRecommendation> {
  const profile = complianceDirectory.find(item => item.countryCode === input.countryCode);
  const eligibility = evaluateListingEligibility(input);
  if (!profile || !eligibility.eligible) {
    return { recommendation: "block", rationale: profile ? "The proposed donation does not satisfy the platform’s baseline eligibility gate." : "No country screening profile is available for this proposed route.", requiredChecks: eligibility.conditions.filter(item => !item.passed).map(item => item.label), flags: profile ? ["Eligibility gate failed"] : ["Country profile unavailable"], reviewerRequired: true, source: "deterministic" };
  }

  const response = await invokeLLM({
    model: "gpt-5-mini",
    maxTokens: 900,
    messages: [
      { role: "system", content: "You are a compliance decision-support assistant for a medicine donation platform. You never provide legal advice, never authorize a transfer, and always require a qualified human reviewer. Use only the supplied country profile and donation data. Be precise and conservative." },
      { role: "user", content: JSON.stringify({ countryProfile: profile, proposedDonation: { medicineName: input.medicineName, countryCode: input.countryCode, expiryDate: input.expiryDate, sealed: input.sealed, controlled: input.controlled, recalled: input.recalled, nonRefrigerated: input.nonRefrigerated, traceabilityId: input.traceabilityId } }) },
    ],
    response_format: { type: "json_schema", json_schema: { name: "compliance_recommendation", strict: true, schema: { type: "object", properties: { recommendation: { type: "string", enum: ["human_review", "hold", "block"] }, rationale: { type: "string" }, requiredChecks: { type: "array", items: { type: "string" } }, flags: { type: "array", items: { type: "string" } }, reviewerRequired: { type: "boolean" } }, required: ["recommendation", "rationale", "requiredChecks", "flags", "reviewerRequired"], additionalProperties: false } } },
  });
  const content = response.choices[0]?.message.content;
  const parsed = typeof content === "string" ? JSON.parse(content) as Omit<ComplianceRecommendation, "reviewerRequired" | "source"> : null;
  if (!parsed) throw new Error("The compliance recommendation could not be parsed.");
  return { ...parsed, reviewerRequired: true, source: "ai_assisted" };
}
