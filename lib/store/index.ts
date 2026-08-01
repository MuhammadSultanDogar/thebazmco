import type { SiteData, StorageBackend, StorageInfo } from "@/lib/types/site-data"
import { createDefaultSiteData, normalizeSiteData } from "@/lib/store/defaults"
import { readFromLocalFile, writeToLocalFile } from "@/lib/store/local-file"
import {
  loadOrdersFromStore,
  migrateLegacyOrdersIfNeeded,
  saveOrders,
} from "@/lib/store/orders"
import {
  getRedis,
  getRedisAuthLabel,
  isRedisConfigured,
  ORDERS_KEY,
  SITE_DATA_KEY,
  testRedisConnection,
} from "@/lib/store/redis-client"

type SiteConfig = Omit<SiteData, "orders">

let lastBackend: StorageBackend = "memory"
let lastDataSizeBytes: number | null = null

async function readRawFromRedis(): Promise<Partial<SiteData> | null> {
  const redis = getRedis()
  if (!redis) return null

  try {
    return await redis.get<Partial<SiteData>>(SITE_DATA_KEY)
  } catch (error) {
    console.error("Redis raw read failed:", error)
    return null
  }
}

async function readConfigFromRedis(): Promise<SiteConfig | null> {
  const stored = await readRawFromRedis()
  if (!stored) return null

  const normalized = normalizeSiteData(stored)
  const { orders: _orders, ...config } = normalized
  return config
}

async function writeConfigToRedis(config: SiteConfig) {
  const redis = getRedis()
  if (!redis) throw new Error("Redis not configured")

  const payload = { ...config, orders: [] }
  await redis.set(SITE_DATA_KEY, payload)
  lastBackend = "upstash-redis"
  lastDataSizeBytes = Buffer.byteLength(JSON.stringify(payload), "utf-8")
}

async function redisHasAnyData(): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return false

  try {
    const [siteExists, ordersExist] = await Promise.all([
      redis.exists(SITE_DATA_KEY),
      redis.exists(ORDERS_KEY),
    ])
    return siteExists === 1 || ordersExist === 1
  } catch {
    return false
  }
}

async function persistConfig(config: SiteConfig) {
  const next = {
    ...config,
    updatedAt: new Date().toISOString(),
  }

  if (isRedisConfigured()) {
    await writeConfigToRedis(next)
    return next
  }

  if (process.env.NODE_ENV !== "production") {
    const orders = await loadOrdersFromStore()
    await writeToLocalFile({ ...next, orders })
    lastBackend = "local-file"
    return next
  }

  lastBackend = "memory"
  return next
}

async function loadConfig(): Promise<SiteConfig> {
  if (isRedisConfigured()) {
    const stored = await readConfigFromRedis()
    if (stored) {
      lastBackend = "upstash-redis"
      return stored
    }

    if (!(await redisHasAnyData())) {
      const defaults = createDefaultSiteData()
      const { orders: _orders, ...config } = defaults
      return persistConfig(config)
    }

    console.error("Site config key exists but could not be read")
  } else if (process.env.NODE_ENV !== "production") {
    const local = await readFromLocalFile()
    if (local) {
      lastBackend = "local-file"
      const { orders: _orders, ...config } = local
      return config
    }

    const defaults = createDefaultSiteData()
    const { orders: _orders, ...config } = defaults
    await persistConfig(config)
    return config
  }

  lastBackend = "memory"
  const { orders: _orders, ...config } = createDefaultSiteData()
  return config
}

export async function loadSiteData(): Promise<SiteData> {
  const config = await loadConfig()
  let orders = await loadOrdersFromStore()

  if (isRedisConfigured() && orders.length === 0) {
    const raw = await readRawFromRedis()
    const legacyOrders = Array.isArray(raw?.orders) ? raw.orders : []
    if (legacyOrders.length > 0) {
      orders = await migrateLegacyOrdersIfNeeded(legacyOrders)
    }
  }

  return normalizeSiteData({ ...config, orders })
}

export async function loadSiteConfig(): Promise<SiteConfig> {
  return loadConfig()
}

export async function saveSiteConfig(config: SiteConfig): Promise<SiteConfig> {
  return persistConfig(config)
}

export async function saveSiteData(data: SiteData): Promise<SiteData> {
  const normalized = normalizeSiteData(data)
  const { orders, ...config } = normalized
  const savedConfig = await persistConfig(config)
  await saveOrders(orders, savedConfig)

  const saved = { ...savedConfig, orders }
  lastDataSizeBytes = Buffer.byteLength(JSON.stringify(saved), "utf-8")
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
    "Vercel adds KV_REST_API_URL and KV_REST_API_TOKEN automatically.",
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
    const exists = await redisHasAnyData()
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
