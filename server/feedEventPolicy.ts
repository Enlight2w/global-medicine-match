export type FeedSyncStatus = "awaiting_credentials" | "ready" | "paused" | "error";

export function decideFeedEvent(input: { secretValid: boolean; syncStatus: FeedSyncStatus; duplicate: boolean }) {
  if (!input.secretValid) return { accepted: false as const, reason: "invalid-feed-auth" as const };
  if (input.syncStatus !== "ready") return { accepted: false as const, reason: "feed-not-ready" as const };
  if (input.duplicate) return { accepted: true as const, reason: "duplicate-event" as const };
  return { accepted: true as const, reason: "processed" as const };
}
