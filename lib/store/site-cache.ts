import type { SiteData } from "@/lib/types/site-data"

type SiteConfig = Omit<SiteData, "orders">

type CacheEntry<T> = {
  value: T
  expiresAt: number
}

const TTL_MS = 120_000

let rawSiteCache: CacheEntry<Partial<SiteData> | null> | null = null
let configCache: CacheEntry<SiteConfig> | null = null

function isFresh<T>(entry: CacheEntry<T> | null): entry is CacheEntry<T> {
  return entry !== null && Date.now() < entry.expiresAt
}

export function getCachedRawSiteData(): Partial<SiteData> | null | undefined {
  if (isFresh(rawSiteCache)) return rawSiteCache.value
  return undefined
}

export function setCachedRawSiteData(value: Partial<SiteData> | null) {
  rawSiteCache = { value, expiresAt: Date.now() + TTL_MS }
  configCache = null
}

export function getCachedSiteConfig(): SiteConfig | undefined {
  if (isFresh(configCache)) return configCache.value
  return undefined
}

export function setCachedSiteConfig(value: SiteConfig) {
  configCache = { value, expiresAt: Date.now() + TTL_MS }
}

export function invalidateSiteCache() {
  rawSiteCache = null
  configCache = null
}
