import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { complianceDirectory } from "../shared/complianceDirectory";
import { filterMedicineAvailability, partnerDashboardSnapshot, partnerLocations } from "../shared/discoveryData";
import { getPlatformOverview } from "./db";
import { evaluateListingEligibility } from "./eligibility";
import { canTransitionReviewStatus } from "./reviewStatus";
import { allowRateLimitedRequest, sanitizeSearchQuery } from "./security";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { partnerProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";

const listingEligibilityInput = z.object({ sealed: z.boolean(), controlled: z.boolean(), recalled: z.boolean(), nonRefrigerated: z.boolean(), expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), traceabilityId: z.string().max(160) });
const reviewStatus = z.enum(["pending", "approved", "hold", "rejected"]);
const discoveryInput = z.object({ query: z.string().max(200).default(""), category: z.string().max(40).default("all"), countryCode: z.string().max(4).default("all"), urgency: z.string().max(20).default("all") });

export const appRouter = router({
  system: systemRouter,
  auth: router({ me: publicProcedure.query(opts => opts.ctx.user), logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }) }),
  platform: router({
    complianceDirectory: publicProcedure.query(() => complianceDirectory),
    overview: protectedProcedure.query(() => getPlatformOverview()),
    coverage: publicProcedure.query(() => partnerLocations),
    partnerDashboard: partnerProcedure.query(() => partnerDashboardSnapshot),
    discoverMedicines: publicProcedure.input(discoveryInput).query(({ input, ctx }) => {
      const identity = ctx.user?.openId ?? ctx.req.ip ?? "anonymous";
      if (!allowRateLimitedRequest(`discovery:${identity}`)) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      return filterMedicineAvailability({ ...input, query: sanitizeSearchQuery(input.query) });
    }),
    checkEligibility: publicProcedure.input(listingEligibilityInput).mutation(({ input }) => evaluateListingEligibility(input)),
    submitOrganization: publicProcedure.input(z.object({ name: z.string().min(2).max(200), role: z.enum(["pharmacy", "hospital", "manufacturer", "clinic", "ngo"]), licenseNumber: z.string().min(4).max(120), countryCode: z.string().length(2), serviceArea: z.string().min(2).max(180) })).mutation(({ input }) => ({ ...input, reviewStatus: "pending" as const, message: "Organization submitted for license and service-pathway review." })),
    recordStatusUpdate: protectedProcedure.input(z.object({ entityType: z.enum(["organization", "listing", "request", "match"]), entityId: z.string().min(1).max(40), currentStatus: reviewStatus.default("pending"), nextStatus: reviewStatus })).mutation(({ input }) => {
      if (!canTransitionReviewStatus(input.currentStatus, input.nextStatus)) throw new TRPCError({ code: "BAD_REQUEST" });
      return { ...input, createdAt: new Date().toISOString(), message: `Review status updated to ${input.nextStatus}.` };
    }),
  }),
});

export type AppRouter = typeof appRouter;
