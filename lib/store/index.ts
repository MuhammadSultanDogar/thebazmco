import { mkdir, readFile, writeFile } from "fs/promises"
import path from "path"
import type { SiteData, StorageBackend, StorageInfo } from "@/lib/types/site-data"
import { createDefaultSiteData, normalizeSiteData } from "@/lib/store/defaults"
import {
  getRedis,
  getRedisAuthLabel,
  isRedisConfigured,
  REDIS_KEY,
  testRedisConnection,
} from "@/lib/store/redis-client"

const LOCAL_DATA_PATH = path.join(process.cwd(), ".data", "site-data.json")

let memoryStore: SiteData | null = null
let memoryLoaded = false
let lastBackend: StorageBackend = "memory"
let lastDataSizeBytes: number | null = null

async function readFromRedis(): Promise<SiteData | null> {
  const redis = getRedis()
  if (!redis) return null

  try {
    const stored = await redis.get<SiteData>(REDIS_KEY)
    if (!stored) return null

    const parsed = normalizeSiteData(stored)
    lastBackend = "upstash-redis"
    lastDataSizeBytes = Buffer.byteLength(JSON.stringify(stored), "utf-8")
    return parsed
  } catch (error) {
    console.error("Redis read failed:", error)
    return null
  }
}

async function redisHasData(): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return false

  try {
    return (await redis.exists(REDIS_KEY)) === 1
  } catch {
    return false
  }
}

async function writeToRedis(data: SiteData) {
  const redis = getRedis()
  if (!redis) throw new Error("Redis not configured")

  const payload = JSON.stringify(data)
  await redis.set(REDIS_KEY, data)
  lastBackend = "upstash-redis"
  lastDataSizeBytes = Buffer.byteLength(payload, "utf-8")
}

async function readFromLocalFile(): Promise<SiteData | null> {
  try {
    const raw = await readFile(LOCAL_DATA_PATH, "utf-8")
    const parsed = normalizeSiteData(JSON.parse(raw) as Partial<SiteData>)
    lastBackend = "local-file"
    lastDataSizeBytes = Buffer.byteLength(raw, "utf-8")
    return parsed
  } catch {
    return null
  }
}

async function writeToLocalFile(data: SiteData) {
  await mkdir(path.dirname(LOCAL_DATA_PATH), { recursive: true })
  const payload = JSON.stringify(data, null, 2)
  await writeFile(LOCAL_DATA_PATH, payload, "utf-8")
  lastBackend = "local-file"
  lastDataSizeBytes = Buffer.byteLength(payload, "utf-8")
}

async function persist(data: SiteData) {
  const next = {
    ...data,
    updatedAt: new Date().toISOString(),
  }

  if (isRedisConfigured()) {
    await writeToRedis(next)
    return next
  }

  if (process.env.NODE_ENV !== "production") {
    await writeToLocalFile(next)
    return next
  }

  lastBackend = "memory"
  return next
}

export async function loadSiteData(): Promise<SiteData> {
  if (memoryStore && memoryLoaded) {
    return structuredClone(memoryStore)
  }

  if (isRedisConfigured()) {
    const stored = await readFromRedis()
    if (stored) {
      memoryStore = stored
      memoryLoaded = true
      return structuredClone(stored)
    }

    if (!(await redisHasData())) {
      const defaults = await persist(createDefaultSiteData())
      memoryStore = defaults
      memoryLoaded = true
      return structuredClone(defaults)
    }

    console.error("Site data key exists but could not be read")
  } else if (process.env.NODE_ENV !== "production") {
    const local = await readFromLocalFile()
    if (local) {
      memoryStore = local
      memoryLoaded = true
      return structuredClone(local)
    }

    const defaults = await persist(createDefaultSiteData())
    memoryStore = defaults
    memoryLoaded = true
    return structuredClone(defaults)
  }

  memoryStore = createDefaultSiteData()
  memoryLoaded = true
  lastBackend = "memory"
  return structuredClone(memoryStore)
}

export async function saveSiteData(data: SiteData): Promise<SiteData> {
  const saved = await persist(data)
  memoryStore = structuredClone(saved)
  memoryLoaded = true
  return structuredClone(saved)
}

export async function updateSiteData(
  updater: (data: SiteData) => SiteData | void,
): Promise<SiteData> {
  const current = await loadSiteData()
  const draft = structuredClone(current)
  const result = updater(draft)
  const next = (result ?? draft) as SiteData
  return saveSiteData(next)
}

export async function replaceSiteData(raw: Partial<SiteData>): Promise<SiteData> {
  const current = await loadSiteData()
  const merged = normalizeSiteData({ ...current, ...raw })
  return saveSiteData(merged)
}

function buildHelpSteps(redisReachable: boolean): string[] {
  if (isRedisConfigured() && redisReachable) {
    return ["Storage is working. Download a backup occasionally for extra safety."]
  }

  return [
    "In Vercel: open your project → Storage → Create → Upstash Redis (or KV).",
    "Connect the database to this project (Production + Preview).",
    "Vercel adds UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN automatically.",
    "Redeploy, then refresh this tab — Database reachable should show Yes.",
  ]
}

export async function getStorageInfo(): Promise<StorageInfo> {
  const data = await loadSiteData()
  const authLabel = getRedisAuthLabel()
  const hasRedis = isRedisConfigured()
  const redisTest = hasRedis ? await testRedisConnection() : { ok: false as const }
  const vercelEnv = process.env.VERCEL_ENV ?? null

  const counts = {
    mascots: data.mascots.length,
    activeMascots: data.mascots.filter((m) => m.active).length,
    orders: data.orders.length,
    invoices: data.invoices.length,
  }

  if (hasRedis && redisTest.ok) {
    const exists = await redisHasData()
    return {
      backend: "upstash-redis",
      persistent: true,
      configured: true,
      updatedAt: data.updatedAt ?? null,
      dataSizeBytes: lastDataSizeBytes,
      connectionLabel: authLabel,
      databaseReachable: true,
      vercelEnv,
      counts,
      message: exists
        ? `Redis connected (${authLabel}). Data persists across deploys.`
        : "Redis connected. Save a product or rate to create the storage record.",
      helpSteps: buildHelpSteps(true),
    }
  }

  if (hasRedis && !redisTest.ok) {
    return {
      backend: "upstash-redis",
      persistent: false,
      configured: true,
      updatedAt: data.updatedAt ?? null,
      dataSizeBytes: lastDataSizeBytes,
      connectionLabel: authLabel,
      databaseReachable: false,
      vercelEnv,
      counts,
      message: `Redis configured (${authLabel}) but connection failed: ${redisTest.error}`,
      helpSteps: buildHelpSteps(false),
    }
  }

  if (process.env.NODE_ENV !== "production") {
    return {
      backend: "local-file",
      persistent: true,
      configured: true,
      updatedAt: data.updatedAt ?? null,
      dataSizeBytes: lastDataSizeBytes,
      connectionLabel: authLabel,
      databaseReachable: false,
      vercelEnv,
      counts,
      message: "Using local .data/site-data.json (dev only).",
      helpSteps: [
        "For production, add Upstash Redis via Vercel Storage and redeploy.",
      ],
    }
  }

  return {
    backend: "memory",
    persistent: false,
    configured: false,
    updatedAt: data.updatedAt ?? null,
    dataSizeBytes: null,
    connectionLabel: authLabel,
    databaseReachable: false,
    vercelEnv,
    counts,
    message: "NOT PERSISTENT — add Upstash Redis in Vercel Storage, then redeploy.",
    helpSteps: buildHelpSteps(false),
  }
}

export async function exportSiteData(): Promise<SiteData> {
  return loadSiteData()
}
