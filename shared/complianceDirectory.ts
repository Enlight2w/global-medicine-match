export type ComplianceProfile = {
  countryCode: string;
  country: string;
  region: string;
  marketStatus: "Pilot ready" | "Review required" | "Research queue";
  requirements: string[];
  restrictions: string[];
  reviewerNote: string;
};

export const complianceDirectory: ComplianceProfile[] = [
  {
    countryCode: "US",
    country: "United States",
    region: "North America",
    marketStatus: "Pilot ready",
    requirements: ["Licensed donor and recipient organizations", "Manufacturer-sealed, unopened medicine", "Traceability and storage records attached"],
    restrictions: ["No direct patient-to-patient transfers", "No controlled or recalled medicine", "Local repository program confirmation required"],
    reviewerNote: "State and program requirements must be confirmed before transfer.",
  },
  {
    countryCode: "GB",
    country: "United Kingdom",
    region: "Europe",
    marketStatus: "Review required",
    requirements: ["Recipient service and dispensing pathway verified", "Sealed pack integrity documented", "Named compliance reviewer assigned"],
    restrictions: ["No patient-facing handoff outside an approved channel", "Temperature-sensitive stock is excluded from the pilot", "Country-specific policy validation is required"],
    reviewerNote: "Policy review is required before the country can accept a match.",
  },
  {
    countryCode: "KE",
    country: "Kenya",
    region: "East Africa",
    marketStatus: "Research queue",
    requirements: ["Partner pharmacy or clinic verification", "Recipient need and dispensing capacity documented", "Donation route reviewed with local experts"],
    restrictions: ["No listing or transfer is authorized by this directory entry", "Cross-border movement needs an approved legal pathway", "Cold-chain products remain out of scope"],
    reviewerNote: "The platform uses this profile for discovery only until a regulated pilot is approved.",
  },
];
