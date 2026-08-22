import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { complianceDirectory } from "../shared/complianceDirectory";
import { filterMedicineAvailability, partnerDashboardSnapshot, partnerLocations } from "../shared/discoveryData";
import { assessDonationCompliance } from "./complianceAssistant";
import { activateInventoryFeed, assertOrganizationOwner, createInventoryFeedConnection, createOrganizationRequest, decideOrganizationRole, getPlatformOverview, listInventoryFeedConnections, listPendingOrganizations, recordComplianceAssessment } from "./db";
import { evaluateListingEligibility } from "./eligibility";
import { canTransitionReviewStatus } from "./reviewStatus";
import { allowRateLimitedRequest, sanitizeSearchQuery } from "./security";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, partnerProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";

const listingEligibilityInput = z.object({ sealed: z.boolean(), controlled: z.boolean(), recalled: z.boolean(), nonRefrigerated: z.boolean(), expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), traceabilityId: z.string().max(160) });
const reviewStatus = z.enum(["pending", "approved", "hold", "rejected"]);
const discoveryInput = z.object({ query: z.string().max(200).default(""), category: z.string().max(40).default("all"), countryCode: z.string().max(4).default("all"), urgency: z.string().max(20).default("all") });
const complianceInput = listingEligibilityInput.extend({ countryCode: z.string().length(2), medicineName: z.string().min(2).max(200) });

export const appRouter = router({
  system: systemRouter,
  auth: router({ me: publicProcedure.query(opts => opts.ctx.user), logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }) }),
  platform: router({
    complianceDirectory: publicProcedure.query(() => complianceDirectory),
    overview: protectedProcedure.query(() => getPlatformOverview()),
    coverage: publicProcedure.query(() => partnerLocations),
    partnerDashboard: partnerProcedure.query(() => partnerDashboardSnapshot),
    discoverMedicines: publicProcedure.input(discoveryInput).query(({ input, ctx }) => { const identity = ctx.user?.openId ?? ctx.req.ip ?? "anonymous"; if (!allowRateLimitedRequest(`discovery:${identity}`)) throw new TRPCError({ code: "TOO_MANY_REQUESTS" }); return filterMedicineAvailability({ ...input, query: sanitizeSearchQuery(input.query) }); }),
    checkEligibility: publicProcedure.input(listingEligibilityInput).mutation(({ input }) => evaluateListingEligibility(input)),
    assessDonationCompliance: partnerProcedure.input(complianceInput).mutation(async ({ input, ctx }) => {
      if (!allowRateLimitedRequest(`ai-compliance:${ctx.user.openId}`, 8, 60_000)) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      const assessment = await assessDonationCompliance(input);
      await recordComplianceAssessment({ ...assessment, countryCode: input.countryCode });
      return assessment;
    }),
    inventoryFeeds: partnerProcedure.query(() => listInventoryFeedConnections()),
    connectInventoryFeed: partnerProcedure.input(z.object({ organizationId: z.number().int().positive(), providerName: z.string().min(2).max(160), connectionMode: z.enum(["webhook", "scheduled_pull"]), endpoint: z.string().url().max(1000), credentialReference: z.string().max(160).optional() })).mutation(async ({ input, ctx }) => {
      await assertOrganizationOwner(input.organizationId, ctx.user.id, ctx.user.role === "admin");
      return createInventoryFeedConnection(input);
    }),
    activateInventoryFeed: adminProcedure.input(z.object({ feedId: z.number().int().positive() })).mutation(({ input }) => activateInventoryFeed(input.feedId)),
    adminOrganizationQueue: adminProcedure.query(() => listPendingOrganizations()),
    decideOrganizationRole: adminProcedure.input(z.object({ organizationId: z.number().int().positive(), decision: z.enum(["approved", "hold", "rejected"]), notes: z.string().min(3).max(1000) })).mutation(({ input, ctx }) => decideOrganizationRole({ ...input, reviewerUserId: ctx.user.id })),
    submitOrganization: protectedProcedure.input(z.object({ name: z.string().min(2).max(200), role: z.enum(["pharmacy", "hospital", "manufacturer", "clinic", "ngo"]), licenseNumber: z.string().min(4).max(120), countryCode: z.string().length(2), serviceArea: z.string().min(2).max(180) })).mutation(async ({ input, ctx }) => {
      const contactEmail = ctx.user.email ?? `unverified-${ctx.user.id}@globalmedmatch.invalid`;
      const request = await createOrganizationRequest({ ...input, ownerUserId: ctx.user.id, contactEmail });
      return { ...input, ...request, message: "Organization submitted for license and service-pathway review." };
    }),
    recordStatusUpdate: protectedProcedure.input(z.object({ entityType: z.enum(["organization", "listing", "request", "match"]), entityId: z.string().min(1).max(40), currentStatus: reviewStatus.default("pending"), nextStatus: reviewStatus })).mutation(({ input }) => { if (!canTransitionReviewStatus(input.currentStatus, input.nextStatus)) throw new TRPCError({ code: "BAD_REQUEST" }); return { ...input, createdAt: new Date().toISOString(), message: `Review status updated to ${input.nextStatus}.` }; }),
  }),
});

export type AppRouter = typeof appRouter;
