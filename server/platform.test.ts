import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function contextFor(openId?: string, role: "user" | "partner" | "admin" = "user"): TrpcContext {
  return {
    user: openId ? { id: 1, openId, email: "partner@example.com", name: "Partner User", loginMethod: "manus", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() } : null,
    req: { ip: openId ? `test-${openId}` : "test-anonymous", protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("platform procedures", () => {
  it("exposes public verified coverage but requires sign-in for partner dashboard data", async () => {
    const publicCaller = appRouter.createCaller(contextFor());
    await expect(publicCaller.platform.coverage()).resolves.toHaveLength(4);
    await expect(publicCaller.platform.partnerDashboard()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    const nonPartnerCaller = appRouter.createCaller(contextFor("non-partner-dashboard-test"));
    await expect(nonPartnerCaller.platform.partnerDashboard()).rejects.toMatchObject({ code: "FORBIDDEN" });
    const partnerCaller = appRouter.createCaller(contextFor("partner-dashboard-test", "partner"));
    await expect(partnerCaller.platform.partnerDashboard()).resolves.toMatchObject({ impact: { donationsAccepted: 48 } });
  });

  it("filters discovery results and rate-limits repeated anonymous queries", async () => {
    const filterCaller = appRouter.createCaller(contextFor("filter-test"));
    const matches = await filterCaller.platform.discoverMedicines({ query: "<Salbutamol>", category: "all", countryCode: "all", urgency: "all" });
    expect(matches).toHaveLength(1);
    expect(matches[0]?.medicine).toBe("Salbutamol inhaler");
    const limitedCaller = appRouter.createCaller(contextFor("rate-test"));
    for (let index = 0; index < 30; index += 1) await limitedCaller.platform.discoverMedicines({ query: "", category: "all", countryCode: "all", urgency: "all" });
    await expect(limitedCaller.platform.discoverMedicines({ query: "", category: "all", countryCode: "all", urgency: "all" })).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
  });

  it("keeps inventory registration and organization decisions behind partner and administrator boundaries", async () => {
    const userCaller = appRouter.createCaller(contextFor("regular-user"));
    await expect(userCaller.platform.connectInventoryFeed({ organizationId: 1, providerName: "Example", connectionMode: "webhook", endpoint: "https://example.com/feed" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(userCaller.platform.adminOrganizationQueue()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(userCaller.platform.decideOrganizationRole({ organizationId: 1, decision: "approved", notes: "Reviewed." })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(userCaller.platform.recordStatusUpdate({ entityType: "listing", entityId: "LOT-1", nextStatus: "approved" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
