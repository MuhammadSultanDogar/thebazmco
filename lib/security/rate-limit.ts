import { getRedis, isRedisConfigured } from "@/lib/store/redis-client"

type RateLimitOptions = {
  limit: number
  windowSeconds: number
}

const devCounters = new Map<string, { count: number; resetAt: number }>()

export async function isRateLimited(
  key: string,
  { limit }: RateLimitOptions,
): Promise<boolean> {
  if (isRedisConfigured()) {
    const redis = getRedis()
    if (!redis) return false

    const count = (await redis.get<number>(`ratelimit:${key}`)) ?? 0
    return count >= limit
  }

  const entry = devCounters.get(key)
  if (!entry || Date.now() > entry.resetAt) return false
  return entry.count >= limit
}

export async function recordRateLimitFailure(
  key: string,
  { windowSeconds }: Pick<RateLimitOptions, "windowSeconds">,
) {
  if (isRedisConfigured()) {
    const redis = getRedis()
    if (!redis) return

    const redisKey = `ratelimit:${key}`
    const count = await redis.incr(redisKey)
    if (count === 1) {
      await redis.expire(redisKey, windowSeconds)
    }
    return
  }

  const now = Date.now()
  const entry = devCounters.get(key)
  if (!entry || now > entry.resetAt) {
    devCounters.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
    return
  }
  entry.count += 1
}

export async function clearRateLimit(key: string) {
  if (isRedisConfigured()) {
    const redis = getRedis()
    if (!redis) return
    await redis.del(`ratelimit:${key}`)
    return
  }
  devCounters.delete(key)
}

export async function enforceRateLimit(
  key: string,
  { limit, windowSeconds }: RateLimitOptions,
): Promise<boolean> {
  if (isRedisConfigured()) {
    const redis = getRedis()
    if (!redis) return true

    const redisKey = `ratelimit:${key}`
    const count = await redis.incr(redisKey)
    if (count === 1) {
      await redis.expire(redisKey, windowSeconds)
    }
    return count <= limit
  }

  const now = Date.now()
  const entry = devCounters.get(key)
  if (!entry || now > entry.resetAt) {
    devCounters.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
    return true
  }

  entry.count += 1
  return entry.count <= limit
}
