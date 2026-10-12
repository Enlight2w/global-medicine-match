import { isIP } from "node:net";
import { z } from "zod";

type RateBucket = { count: number; resetsAt: number };
const requestBuckets = new Map<string, RateBucket>();

export function sanitizeSearchQuery(value: string) {
  return value.replace(/[<>]/g, "").replace(/[\u0000-\u001F]/g, "").replace(/\s+/g, " ").trim().slice(0, 80);
}

export function allowRateLimitedRequest(key: string, limit = 30, windowMs = 60_000, now = Date.now()) {
  const bucket = requestBuckets.get(key);
  if (!bucket || bucket.resetsAt <= now) {
    requestBuckets.set(key, { count: 1, resetsAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function isSameOriginRequest(origin: string | undefined, requestOrigin: string) {
  return !origin || origin === requestOrigin;
}

function isPrivateIpv4(hostname: string) {
  const octets = hostname.split(".").map(Number);
  if (octets.length !== 4 || octets.some(octet => !Number.isInteger(octet) || octet < 0 || octet > 255)) return false;
  const [a, b] = octets;
  return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 0) || (a === 192 && b === 168) || (a === 198 && b >= 18 && b <= 19) || a >= 224;
}

function isPrivateIpv6(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return normalized === "::1" || normalized === "::" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:") || normalized.startsWith("::ffff:127.") || normalized.startsWith("::ffff:10.") || normalized.startsWith("::ffff:192.168.");
}

export function isSafeProviderEndpoint(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || !hostname || url.username || url.password || url.hash) return false;
    if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname.endsWith(".internal") || hostname === "metadata.google.internal") return false;
    if ((isIP(hostname) === 4 && isPrivateIpv4(hostname)) || (isIP(hostname) === 6 && isPrivateIpv6(hostname))) return false;
    return hostname.includes(".");
  } catch {
    return false;
  }
}

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}, "must be a real calendar date");

const inboundFeedRecordSchema = z.object({
  externalSourceId: z.string().trim().min(1).max(180),
  medicineName: z.string().trim().min(2).max(200),
  dosage: z.string().trim().min(1).max(100),
  quantity: z.number().int().positive().max(1_000_000_000),
  quantityUnit: z.string().trim().min(1).max(40).optional(),
  expiryDate: isoDate,
  traceabilityId: z.string().trim().min(1).max(160),
  storageHistory: z.string().trim().min(1).max(2_000),
  sealed: z.boolean(),
  controlled: z.boolean(),
  recalled: z.boolean(),
  nonRefrigerated: z.boolean(),
  countryCode: z.string().regex(/^[A-Z]{2}$/),
}).strict();

export const inboundFeedEventSchema = z.object({
  eventId: z.string().trim().min(1).max(180).regex(/^[A-Za-z0-9._:-]+$/),
  records: z.array(inboundFeedRecordSchema).min(1).max(250),
}).strict();

export type InboundFeedEvent = z.infer<typeof inboundFeedEventSchema>;
