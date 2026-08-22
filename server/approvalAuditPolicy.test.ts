import { describe, expect, it } from "vitest";
import { buildOrganizationApprovalAudit } from "./approvalAuditPolicy";

describe("organization approval audit policy", () => {
  it("creates an approval audit row that assigns the verified partner role", () => {
    expect(buildOrganizationApprovalAudit({ organizationId: 9, reviewerUserId: 3, decision: "approved", notes: "License checked." })).toEqual({ organizationId: 9, reviewerUserId: 3, decision: "approved", notes: "License checked.", assignedRole: "partner" });
  });

  it("retains a non-partner role for hold and rejection decisions", () => {
    expect(buildOrganizationApprovalAudit({ organizationId: 9, reviewerUserId: 3, decision: "hold", notes: "Need service details." }).assignedRole).toBe("user");
    expect(buildOrganizationApprovalAudit({ organizationId: 9, reviewerUserId: 3, decision: "rejected", notes: "License invalid." }).assignedRole).toBe("user");
  });
});
