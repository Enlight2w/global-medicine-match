import { describe, expect, it } from "vitest";
import { assignedRoleForOrganizationDecision } from "./approvalPolicy";

describe("organization approval policy", () => {
  it("grants the verified partner role only after approval", () => {
    expect(assignedRoleForOrganizationDecision("approved")).toBe("partner");
    expect(assignedRoleForOrganizationDecision("hold")).toBe("user");
    expect(assignedRoleForOrganizationDecision("rejected")).toBe("user");
  });
});
