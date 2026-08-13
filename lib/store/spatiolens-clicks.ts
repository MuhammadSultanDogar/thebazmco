import { mkdir, readFile, writeFile } from "fs/promises"
import path from "path"
import {
  SPATIOLENS_CLICKS_TOTAL_KEY,
  SPATIOLENS_CLICKS_UNIQUE_KEY,
} from "@/lib/store/redis-keys"
import { getRedis, isRedisConfigured } from "@/lib/store/redis-client"

export type SpatiolensClickStats = {
  totalClicks: number
  uniqueClicks: number
}

const LOCAL_PATH = path.join(process.cwd(), ".data", "spatiolens-clicks.json")

type LocalStats = {
  totalClicks: number
  uniqueIds: string[]
}

async function readLocalStats(): Promise<LocalStats> {
  try {
    const raw = await readFile(LOCAL_PATH, "utf-8")
    const parsed = JSON.parse(raw) as Partial<LocalStats>
    return {
      totalClicks: parsed.totalClicks ?? 0,
      uniqueIds: Array.isArray(parsed.uniqueIds) ? parsed.uniqueIds : [],
    }
  } catch {
    return { totalClicks: 0, uniqueIds: [] }
  }
}

async function writeLocalStats(stats: LocalStats) {
  await mkdir(path.dirname(LOCAL_PATH), { recursive: true })
  await writeFile(LOCAL_PATH, JSON.stringify(stats, null, 2), "utf-8")
}

export async function getSpatiolensClickStats(): Promise<SpatiolensClickStats> {
  const redis = getRedis()
  if (redis) {
    const [totalClicks, uniqueClicks] = await Promise.all([
      redis.get<number>(SPATIOLENS_CLICKS_TOTAL_KEY),
      redis.scard(SPATIOLENS_CLICKS_UNIQUE_KEY),
    ])
    return {
      totalClicks: totalClicks ?? 0,
      uniqueClicks: uniqueClicks ?? 0,
    }
  }

  if (process.env.NODE_ENV !== "production" || !isRedisConfigured()) {
    const local = await readLocalStats()
    return {
      totalClicks: local.totalClicks,
      uniqueClicks: local.uniqueIds.length,
    }
  }

  return { totalClicks: 0, uniqueClicks: 0 }
}

export async function recordSpatiolensClick(
  visitorId: string,
): Promise<SpatiolensClickStats> {
  const redis = getRedis()
  if (redis) {
    await Promise.all([
      redis.incr(SPATIOLENS_CLICKS_TOTAL_KEY),
      redis.sadd(SPATIOLENS_CLICKS_UNIQUE_KEY, visitorId),
    ])
    return getSpatiolensClickStats()
  }

  const local = await readLocalStats()
  local.totalClicks += 1
  if (!local.uniqueIds.includes(visitorId)) {
    local.uniqueIds.push(visitorId)
  }
  await writeLocalStats(local)
  return {
    totalClicks: local.totalClicks,
    uniqueClicks: local.uniqueIds.length,
  }
}
