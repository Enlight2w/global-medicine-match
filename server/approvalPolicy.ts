export type OrganizationDecision = "approved" | "hold" | "rejected";

export function assignedRoleForOrganizationDecision(decision: OrganizationDecision) {
  return decision === "approved" ? "partner" as const : "user" as const;
}
