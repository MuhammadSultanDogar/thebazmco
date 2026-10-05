import { unstable_cache, revalidateTag } from "next/cache"
import type { SiteData } from "@/lib/types/site-data"
import { normalizeSiteData } from "@/lib/store/defaults"
import { getRedis, SITE_DATA_KEY } from "@/lib/store/redis-client"
import { splitMascotImagesForStorage } from "@/lib/store/mascot-image-store"

export const SITE_CONFIG_CACHE_TAG = "thebazm-site-config"

type SiteConfig = Omit<SiteData, "orders">

/** Cross-request cache (Vercel data cache) — cuts repeated full Redis downloads. */
export const loadSiteConfigCached = unstable_cache(
  async (): Promise<SiteConfig | null> => {
    const redis = getRedis()
    if (!redis) return null

    const stored = await redis.get<Partial<SiteData>>(SITE_DATA_KEY)
    if (!stored) return null

    const normalized = normalizeSiteData(stored)
    const { orders: _orders, ...config } = normalized

    const { mascots, changed } = await splitMascotImagesForStorage(config.mascots)
    const nextConfig = changed ? { ...config, mascots } : config

    if (changed) {
      const payload = { ...nextConfig, orders: [] }
      await redis.set(SITE_DATA_KEY, payload)
      revalidateTag(SITE_CONFIG_CACHE_TAG)
    }

    return nextConfig
  },
  ["thebazm-site-config-v2"],
  { revalidate: 600, tags: [SITE_CONFIG_CACHE_TAG] },
)

export function bustSiteConfigCache() {
  revalidateTag(SITE_CONFIG_CACHE_TAG)
}
