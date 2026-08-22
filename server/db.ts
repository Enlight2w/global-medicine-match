import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, medicineListings, medicineMatches, organizations, recipientRequests, statusUpdates, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

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
