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
