import { assignedRoleForOrganizationDecision, type OrganizationDecision } from "./approvalPolicy";

export function buildOrganizationApprovalAudit(input: { organizationId: number; reviewerUserId: number; decision: OrganizationDecision; notes: string }) {
  return { ...input, assignedRole: assignedRoleForOrganizationDecision(input.decision) };
}
