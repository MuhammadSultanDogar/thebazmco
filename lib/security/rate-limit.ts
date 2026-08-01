import { getRedis, isRedisConfigured } from "@/lib/store/redis-client"

type RateLimitOptions = {
  limit: number
  windowSeconds: number
}

const devCounters = new Map<string, { count: number; resetAt: number }>()

export async function checkRateLimit(
  key: string,
  { limit, windowSeconds }: RateLimitOptions,
): Promise<{ allowed: boolean; remaining: number }> {
  if (isRedisConfigured()) {
    const redis = getRedis()
    if (!redis) return { allowed: true, remaining: limit }

    const redisKey = `ratelimit:${key}`
    const count = await redis.incr(redisKey)
    if (count === 1) {
      await redis.expire(redisKey, windowSeconds)
    }

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
    }
  }

  const now = Date.now()
  const entry = devCounters.get(key)
  if (!entry || now > entry.resetAt) {
    devCounters.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
    return { allowed: true, remaining: limit - 1 }
  }

  entry.count += 1
  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
  }
}

export async function enforceRateLimit(
  key: string,
  options: RateLimitOptions,
): Promise<boolean> {
  const result = await checkRateLimit(key, options)
  return result.allowed
}
