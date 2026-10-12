import { boolean, date, int, json, mysqlEnum, mysqlTable, text, timestamp, unique, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "partner", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId"),
  name: varchar("name", { length: 200 }).notNull(),
  role: mysqlEnum("role", ["pharmacy", "hospital", "manufacturer", "clinic", "ngo"]).notNull(),
  licenseNumber: varchar("licenseNumber", { length: 120 }).notNull(),
  countryCode: varchar("countryCode", { length: 2 }).notNull(),
  serviceArea: varchar("serviceArea", { length: 180 }).notNull(),
  contactEmail: varchar("contactEmail", { length: 320 }).notNull(),
  reviewStatus: mysqlEnum("reviewStatus", ["pending", "approved", "hold", "rejected"]).default("pending").notNull(),
  reviewNotes: text("reviewNotes"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const medicineListings = mysqlTable("medicineListings", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  medicineName: varchar("medicineName", { length: 200 }).notNull(),
  dosage: varchar("dosage", { length: 100 }).notNull(),
  quantity: int("quantity").notNull(),
  quantityUnit: varchar("quantityUnit", { length: 40 }).default("packs").notNull(),
  expiryDate: date("expiryDate").notNull(),
  traceabilityId: varchar("traceabilityId", { length: 160 }).notNull(),
  storageHistory: text("storageHistory").notNull(),
  sealed: boolean("sealed").notNull(),
  controlled: boolean("controlled").notNull(),
  recalled: boolean("recalled").notNull(),
  nonRefrigerated: boolean("nonRefrigerated").notNull(),
  countryCode: varchar("countryCode", { length: 2 }).notNull(),
  reviewStatus: mysqlEnum("reviewStatus", ["pending", "approved", "hold", "rejected"]).default("pending").notNull(),
  reviewNotes: text("reviewNotes"),
  externalSourceId: varchar("externalSourceId", { length: 180 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const recipientRequests = mysqlTable("recipientRequests", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  medicineName: varchar("medicineName", { length: 200 }).notNull(),
  dosage: varchar("dosage", { length: 100 }).notNull(),
  quantityNeeded: int("quantityNeeded").notNull(),
  urgency: mysqlEnum("urgency", ["routine", "priority", "urgent"]).default("routine").notNull(),
  countryCode: varchar("countryCode", { length: 2 }).notNull(),
  patientPopulation: text("patientPopulation").notNull(),
  reviewStatus: mysqlEnum("reviewStatus", ["pending", "approved", "hold", "rejected"]).default("pending").notNull(),
  reviewNotes: text("reviewNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const complianceProfiles = mysqlTable("complianceProfiles", {
  id: int("id").autoincrement().primaryKey(),
  countryCode: varchar("countryCode", { length: 2 }).notNull().unique(),
  countryName: varchar("countryName", { length: 120 }).notNull(),
  marketStatus: mysqlEnum("marketStatus", ["pilot_ready", "review_required", "research_queue"]).notNull(),
  requirements: json("requirements").$type<string[]>().notNull(),
  restrictions: json("restrictions").$type<string[]>().notNull(),
  reviewerNote: text("reviewerNote").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const medicineMatches = mysqlTable("medicineMatches", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  requestId: int("requestId").notNull(),
  complianceStatus: mysqlEnum("complianceStatus", ["not_checked", "ready_for_review", "blocked"]).default("not_checked").notNull(),
  matchStatus: mysqlEnum("matchStatus", ["suggested", "approved", "hold", "rejected", "completed"]).default("suggested").notNull(),
  reviewNotes: text("reviewNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const statusUpdates = mysqlTable("statusUpdates", {
  id: int("id").autoincrement().primaryKey(),
  entityType: mysqlEnum("entityType", ["organization", "listing", "request", "match"]).notNull(),
  entityId: int("entityId").notNull(),
  previousStatus: varchar("previousStatus", { length: 40 }),
  nextStatus: varchar("nextStatus", { length: 40 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const complianceAssessments = mysqlTable("complianceAssessments", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId"),
  listingId: int("listingId"),
  countryCode: varchar("countryCode", { length: 2 }).notNull(),
  recommendation: mysqlEnum("recommendation", ["human_review", "hold", "block"]).notNull(),
  rationale: text("rationale").notNull(),
  requiredChecks: json("requiredChecks").$type<string[]>().notNull(),
  flags: json("flags").$type<string[]>().notNull(),
  reviewerRequired: boolean("reviewerRequired").default(true).notNull(),
  source: mysqlEnum("source", ["deterministic", "ai_assisted"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const inventoryFeedConnections = mysqlTable("inventoryFeedConnections", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  providerName: varchar("providerName", { length: 160 }).notNull(),
  connectionMode: mysqlEnum("connectionMode", ["webhook", "scheduled_pull"]).notNull(),
  endpoint: varchar("endpoint", { length: 1000 }).notNull(),
  credentialReference: varchar("credentialReference", { length: 160 }),
  syncStatus: mysqlEnum("syncStatus", ["awaiting_credentials", "ready", "paused", "error"]).default("awaiting_credentials").notNull(),
  lastSyncedAt: timestamp("lastSyncedAt"),
  scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }),
  webhookSecretHash: varchar("webhookSecretHash", { length: 128 }),
  lastEventId: varchar("lastEventId", { length: 180 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const inventoryFeedEvents = mysqlTable("inventoryFeedEvents", {
  id: int("id").autoincrement().primaryKey(),
  feedId: int("feedId").notNull(),
  eventId: varchar("eventId", { length: 180 }).notNull(),
  status: mysqlEnum("status", ["processing", "processed"]).default("processing").notNull(),
  receivedAt: timestamp("receivedAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
}, table => ({ feedEventUnique: unique("inventoryFeedEvents_feedId_eventId_unique").on(table.feedId, table.eventId) }));

export const inventoryFeedActivationAudit = mysqlTable("inventoryFeedActivationAudit", {
  id: int("id").autoincrement().primaryKey(),
  feedId: int("feedId").notNull(),
  actorUserId: int("actorUserId").notNull(),
  previousStatus: mysqlEnum("previousStatus", ["awaiting_credentials", "ready", "paused", "error"]).notNull(),
  nextStatus: mysqlEnum("nextStatus", ["awaiting_credentials", "ready", "paused", "error"]).notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const organizationApprovalAudit = mysqlTable("organizationApprovalAudit", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  reviewerUserId: int("reviewerUserId").notNull(),
  decision: mysqlEnum("decision", ["approved", "hold", "rejected"]).notNull(),
  assignedRole: mysqlEnum("assignedRole", ["user", "partner", "admin"]).notNull(),
  notes: text("notes").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
