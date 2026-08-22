import { buildOrganizationApprovalAudit } from "./approvalAuditPolicy";
import type { OrganizationDecision } from "./approvalPolicy";

export type ApprovalOrganization = { id: number; ownerUserId: number | null; reviewStatus: "pending" | "approved" | "hold" | "rejected" };
export type OrganizationApprovalStore = { findOrganization: (id: number) => Promise<ApprovalOrganization | undefined>; updateOrganization: (id: number, decision: OrganizationDecision, notes: string) => Promise<void>; setUserRole: (userId: number, role: "partner") => Promise<void>; appendAudit: (audit: ReturnType<typeof buildOrganizationApprovalAudit>) => Promise<void> };
export async function applyOrganizationApproval(store: OrganizationApprovalStore, input: { organizationId: number; reviewerUserId: number; decision: OrganizationDecision; notes: string }) {
  const organization = await store.findOrganization(input.organizationId);
  if (!organization) throw new Error("Organization not found");
  const audit = buildOrganizationApprovalAudit(input);
  await store.updateOrganization(organization.id, input.decision, input.notes);
  if (organization.ownerUserId && audit.assignedRole === "partner") await store.setUserRole(organization.ownerUserId, "partner");
  await store.appendAudit(audit);
  return audit;
}
