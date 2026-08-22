import { and, desc, eq } from "drizzle-orm";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { drizzle } from "drizzle-orm/mysql2";
import { complianceAssessments, InsertUser, inventoryFeedConnections, medicineListings, medicineMatches, organizationApprovalAudit, organizations, recipientRequests, statusUpdates, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { assignedRoleForOrganizationDecision } from "./approvalPolicy";
import { buildOrganizationApprovalAudit } from "./approvalAuditPolicy";
import { decideFeedEvent } from "./feedEventPolicy";
import { applyOrganizationApproval } from "./organizationApprovalService";
import { processInboundFeedEvent } from "./feedIngestionService";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  (["name", "email", "loginMethod"] as const).forEach(field => { if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; } });
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getPlatformOverview() {
  const db = await getDb();
  if (!db) return { organizations: [], listings: [], requests: [], matches: [], updates: [] };
  const [organizationRows, listingRows, requestRows, matchRows, updateRows] = await Promise.all([
    db.select().from(organizations).orderBy(desc(organizations.updatedAt)).limit(30),
    db.select().from(medicineListings).orderBy(desc(medicineListings.updatedAt)).limit(30),
    db.select().from(recipientRequests).orderBy(desc(recipientRequests.updatedAt)).limit(30),
    db.select().from(medicineMatches).orderBy(desc(medicineMatches.updatedAt)).limit(30),
    db.select().from(statusUpdates).orderBy(desc(statusUpdates.createdAt)).limit(40),
  ]);
  return { organizations: organizationRows, listings: listingRows, requests: requestRows, matches: matchRows, updates: updateRows };
}

export async function createOrganizationRequest(input: { ownerUserId: number; name: string; role: "pharmacy" | "hospital" | "manufacturer" | "clinic" | "ngo"; licenseNumber: string; countryCode: string; serviceArea: string; contactEmail: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(organizations).values({ ...input, reviewStatus: "pending" });
  return { id: Number(result[0].insertId), reviewStatus: "pending" as const };
}

export async function listPendingOrganizations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(organizations).where(eq(organizations.reviewStatus, "pending")).orderBy(desc(organizations.createdAt));
}

export async function decideOrganizationRole(input: { organizationId: number; reviewerUserId: number; decision: "approved" | "hold" | "rejected"; notes: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const audit = await applyOrganizationApproval({ findOrganization: async id => (await db.select().from(organizations).where(eq(organizations.id, id)).limit(1))[0], updateOrganization: async (id, decision, notes) => { await db.update(organizations).set({ reviewStatus: decision, reviewNotes: notes, reviewedAt: new Date() }).where(eq(organizations.id, id)); }, setUserRole: async (id, role) => { await db.update(users).set({ role }).where(eq(users.id, id)); }, appendAudit: async row => { await db.insert(organizationApprovalAudit).values(row); } }, input);
  return { organizationId: input.organizationId, decision: input.decision, assignedRole: audit.assignedRole };
}

export async function listInventoryFeedConnections() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inventoryFeedConnections).orderBy(desc(inventoryFeedConnections.updatedAt));
}

export async function createInventoryFeedConnection(input: { organizationId: number; providerName: string; connectionMode: "webhook" | "scheduled_pull"; endpoint: string; credentialReference?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const webhookSecret = randomBytes(24).toString("hex");
  const result = await db.insert(inventoryFeedConnections).values({ ...input, credentialReference: input.credentialReference ?? null, webhookSecretHash: hashFeedSecret(webhookSecret), syncStatus: "awaiting_credentials" });
  return { id: Number(result[0].insertId), syncStatus: "awaiting_credentials" as const, webhookSecret };
}

export function hashFeedSecret(secret: string) { return createHash("sha256").update(secret).digest("hex"); }
export function verifyFeedSecret(secret: string, expectedHash: string | null) {
  if (!expectedHash) return false;
  const actual = Buffer.from(hashFeedSecret(secret), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function activateInventoryFeed(feedId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(inventoryFeedConnections).set({ syncStatus: "ready" }).where(eq(inventoryFeedConnections.id, feedId));
}

export type InboundInventoryRecord = { externalSourceId: string; medicineName: string; dosage: string; quantity: number; quantityUnit?: string; expiryDate: string; traceabilityId: string; storageHistory: string; sealed: boolean; controlled: boolean; recalled: boolean; nonRefrigerated: boolean; countryCode: string };
export async function ingestInventoryEvent(feedId: number, secret: string, eventId: string, records: InboundInventoryRecord[]) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return processInboundFeedEvent({ findFeed: async id => (await db.select().from(inventoryFeedConnections).where(eq(inventoryFeedConnections.id, id)).limit(1))[0], isSecretValid: verifyFeedSecret, upsertListing: async (organizationId, record) => { const values = { organizationId, medicineName: record.medicineName, dosage: record.dosage, quantity: record.quantity, quantityUnit: record.quantityUnit ?? "packs", expiryDate: new Date(record.expiryDate), traceabilityId: record.traceabilityId, storageHistory: record.storageHistory, sealed: record.sealed, controlled: record.controlled, recalled: record.recalled, nonRefrigerated: record.nonRefrigerated, countryCode: record.countryCode, externalSourceId: record.externalSourceId, reviewStatus: "pending" as const }; const existing = (await db.select().from(medicineListings).where(and(eq(medicineListings.organizationId, organizationId), eq(medicineListings.externalSourceId, record.externalSourceId))).limit(1))[0]; if (existing) await db.update(medicineListings).set(values).where(eq(medicineListings.id, existing.id)); else await db.insert(medicineListings).values(values); }, markProcessed: async (id, event) => { await db.update(inventoryFeedConnections).set({ lastEventId: event, lastSyncedAt: new Date() }).where(eq(inventoryFeedConnections.id, id)); } }, { feedId, secret, eventId, records });
}

export async function assertOrganizationOwner(organizationId: number, userId: number, isAdmin: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const organization = (await db.select().from(organizations).where(eq(organizations.id, organizationId)).limit(1))[0];
  if (!organization) throw new Error("Organization not found");
  if (!isAdmin && organization.ownerUserId !== userId) throw new Error("Organization access denied");
  return organization;
}

export async function recordComplianceAssessment(input: { countryCode: string; recommendation: "human_review" | "hold" | "block"; rationale: string; requiredChecks: string[]; flags: string[]; source: "deterministic" | "ai_assisted" }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(complianceAssessments).values({ ...input, reviewerRequired: true });
}
