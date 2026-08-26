import { headers } from "next/headers"

type Bucket = { count: number; resetAt: number }

export async function getRequestKey(): Promise<string> {
  const headerList = await headers()
  return (
    headerList.get("x-forwarded-for")?.split(",")[0].trim() ??
    headerList.get("x-real-ip") ??
    "unknown"
  )
}

const buckets = new Map<string, Bucket>()

// In-memory, single-instance limiter. Good enough for a single Next.js server;
// swap for @upstash/ratelimit (Redis-backed) before scaling to multiple instances.
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
