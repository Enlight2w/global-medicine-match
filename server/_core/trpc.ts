import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "@shared/const";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const safeMessages: Partial<Record<TRPCError["code"], string>> = {
  UNAUTHORIZED: UNAUTHED_ERR_MSG,
  FORBIDDEN: NOT_ADMIN_ERR_MSG,
  TOO_MANY_REQUESTS: "Please wait a moment before trying again.",
  BAD_REQUEST: "The submitted information could not be accepted.",
};

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    const exposed = safeMessages[error.code] ?? "The request could not be completed.";
    return { ...shape, message: exposed, data: { ...shape.data, stack: process.env.NODE_ENV === "development" ? shape.data.stack : undefined } };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const protectedProcedure = t.procedure.use(requireUser);
export const partnerProcedure = protectedProcedure.use(t.middleware(async opts => {
  const { ctx, next } = opts;
  const user = ctx.user;
  if (!user || (user.role !== "partner" && user.role !== "admin")) throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
  return next({ ctx: { ...ctx, user } });
}));
export const adminProcedure = t.procedure.use(t.middleware(async opts => {
  const { ctx, next } = opts;
  if (!ctx.user || ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
  return next({ ctx: { ...ctx, user: ctx.user } });
}));
