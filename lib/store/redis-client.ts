import { Redis } from "@upstash/redis"
import { ORDERS_KEY, SITE_DATA_KEY } from "@/lib/store/redis-keys"

export { ORDERS_KEY, SITE_DATA_KEY }

export function isRedisConfigured() {
  const hasUpstash =
    Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
    Boolean(process.env.UPSTASH_REDIS_REST_TOKEN)
  const hasVercelKv =
    Boolean(process.env.KV_REST_API_URL) && Boolean(process.env.KV_REST_API_TOKEN)
  return hasUpstash || hasVercelKv
}

export function getRedisAuthLabel(): string {
  if (process.env.KV_REST_API_URL) return "Vercel KV (Upstash Redis)"
  if (process.env.UPSTASH_REDIS_REST_URL) return "Upstash Redis"
  return "Not configured"
}

let client: Redis | null = null

export function getRedis(): Redis | null {
  if (!isRedisConfigured()) return null
  if (!client) {
    client = Redis.fromEnv()
  }
  return client
}

export async function testRedisConnection(): Promise<{ ok: boolean; error?: string }> {
  const redis = getRedis()
  if (!redis) {
    return { ok: false, error: "No Redis credentials on this deployment" }
  }

  try {
    await redis.ping()
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Redis connection failed",
    }
  }
}
