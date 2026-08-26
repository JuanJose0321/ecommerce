type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

// In-memory, single-instance limiter. Good enough for one Medusa server;
// swap for a Redis-backed limiter before scaling to multiple instances.
export function isRateLimited(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): boolean {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }

  bucket.count += 1
  return bucket.count > limit
}

export function getRequestIp(req: { headers: Record<string, unknown>; ip?: string }): string {
  const forwarded = req.headers["x-forwarded-for"]
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim()
  return req.ip ?? "unknown"
}
