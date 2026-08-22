import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { complianceDirectory } from "../shared/complianceDirectory";
import { getPlatformOverview } from "./db";
import { evaluateListingEligibility } from "./eligibility";
import { canTransitionReviewStatus } from "./reviewStatus";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const listingEligibilityInput = z.object({ sealed: z.boolean(), controlled: z.boolean(), recalled: z.boolean(), nonRefrigerated: z.boolean(), expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), traceabilityId: z.string() });
const reviewStatus = z.enum(["pending", "approved", "hold", "rejected"]);

export const appRouter = router({
  system: systemRouter,
  auth: router({ me: publicProcedure.query(opts => opts.ctx.user), logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }) }),
  platform: router({
    complianceDirectory: publicProcedure.query(() => complianceDirectory),
    overview: publicProcedure.query(() => getPlatformOverview()),
    checkEligibility: publicProcedure.input(listingEligibilityInput).mutation(({ input }) => evaluateListingEligibility(input)),
    submitOrganization: publicProcedure.input(z.object({ name: z.string().min(2), role: z.enum(["pharmacy", "hospital", "manufacturer", "clinic", "ngo"]), licenseNumber: z.string().min(4), countryCode: z.string().length(2), serviceArea: z.string().min(2) })).mutation(({ input }) => ({ ...input, reviewStatus: "pending" as const, message: "Organization submitted for license and service-pathway review." })),
    recordStatusUpdate: publicProcedure.input(z.object({ entityType: z.enum(["organization", "listing", "request", "match"]), entityId: z.string().min(1), currentStatus: reviewStatus.default("pending"), nextStatus: reviewStatus })).mutation(({ input }) => {
      if (!canTransitionReviewStatus(input.currentStatus, input.nextStatus)) throw new TRPCError({ code: "BAD_REQUEST", message: "This review-state transition is not allowed." });
      return { ...input, createdAt: new Date().toISOString(), message: `Review status updated to ${input.nextStatus}.` };
    }),
  }),
});

export type AppRouter = typeof appRouter;
