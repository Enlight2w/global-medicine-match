import { decideFeedEvent, type FeedSyncStatus } from "./feedEventPolicy";

export type FeedRecord = { id: number; organizationId: number; syncStatus: FeedSyncStatus; lastEventId: string | null; webhookSecretHash: string | null };
export type InboundFeedRecord = { externalSourceId: string; medicineName: string; dosage: string; quantity: number; quantityUnit?: string; expiryDate: string; traceabilityId: string; storageHistory: string; sealed: boolean; controlled: boolean; recalled: boolean; nonRefrigerated: boolean; countryCode: string };
export type FeedIngestionStore = {
  findFeed: (feedId: number) => Promise<FeedRecord | undefined>;
  isSecretValid: (secret: string, hash: string | null) => boolean;
  upsertListing: (organizationId: number, record: InboundFeedRecord) => Promise<void>;
  markProcessed: (feedId: number, eventId: string) => Promise<void>;
};

export async function processInboundFeedEvent(store: FeedIngestionStore, input: { feedId: number; secret: string; eventId: string; records: InboundFeedRecord[] }) {
  const feed = await store.findFeed(input.feedId);
  const decision = decideFeedEvent({ secretValid: Boolean(feed && store.isSecretValid(input.secret, feed.webhookSecretHash)), syncStatus: feed?.syncStatus ?? "error", duplicate: feed?.lastEventId === input.eventId });
  if (!decision.accepted || decision.reason === "duplicate-event") return { ...decision, processed: 0 };
  for (const record of input.records) await store.upsertListing(feed!.organizationId, record);
  await store.markProcessed(feed!.id, input.eventId);
  return { accepted: true as const, reason: "processed" as const, processed: input.records.length };
}
