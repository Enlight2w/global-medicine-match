import type { Express, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { inventoryFeedConnections } from "../drizzle/schema";
import { getDb, ingestInventoryEvent } from "./db";
import { allowRateLimitedRequest, inboundFeedEventSchema } from "./security";
import { sdk } from "./_core/sdk";

export function registerInventorySyncRoutes(app: Express) {
  app.post("/api/inventory-feeds/:feedId/events", async (req: Request, res: Response) => {
    const feedId = Number(req.params.feedId);
    const secret = typeof req.headers["x-feed-secret"] === "string" ? req.headers["x-feed-secret"] : "";
    const payload = inboundFeedEventSchema.safeParse(req.body);
    if (!Number.isInteger(feedId) || feedId < 1 || secret.length < 16 || secret.length > 256 || !payload.success) return res.status(400).json({ error: "invalid-feed-event" });
    const source = req.ip || req.socket.remoteAddress || "unknown";
    if (!allowRateLimitedRequest(`feed-event:${feedId}:${source}`, 60, 60_000)) return res.status(429).json({ error: "feed-rate-limit" });
    try {
      const result = await ingestInventoryEvent(feedId, secret, payload.data.eventId, payload.data.records);
      if (!result.accepted) return res.status(result.reason === "invalid-feed-auth" ? 401 : 409).json(result);
      return res.status(202).json(result);
    } catch {
      return res.status(500).json({ error: "feed-event-failed" });
    }
  });
  app.post("/api/scheduled/inventory-sync", async (req: Request, res: Response) => {
    let user;
    try {
      user = await sdk.authenticateRequest(req);
    } catch {
      return res.status(403).json({ error: "cron-only" });
    }
    try {
      if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
      const db = await getDb();
      if (!db) return res.status(503).json({ error: "database-unavailable" });
      const feed = (await db.select().from(inventoryFeedConnections).where(eq(inventoryFeedConnections.scheduleCronTaskUid, user.taskUid)).limit(1))[0];
      if (!feed) return res.json({ ok: true, skipped: "orphaned-feed" });
      if (feed.syncStatus !== "ready") return res.json({ ok: true, skipped: "feed-not-activated" });
      // Vendor transport is deliberately not invoked until a reviewed credential binding is attached.
      // This keeps the scheduled callback idempotent and prevents accidental unauthenticated pulls.
      return res.json({ ok: true, skipped: "awaiting-reviewed-provider-transport", feedId: feed.id });
    } catch (error) {
      return res.status(500).json({ error: "inventory-sync-failed", detail: error instanceof Error ? error.message : "unknown", timestamp: new Date().toISOString() });
    }
  });
}
