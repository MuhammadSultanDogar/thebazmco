import type { ShopOrder } from "@/lib/types/order"

type CacheEntry = {
  value: ShopOrder[]
  expiresAt: number
}

const TTL_MS = 120_000

let ordersCache: CacheEntry | null = null
let inflight: Promise<ShopOrder[]> | null = null

function isFresh(entry: CacheEntry | null): entry is CacheEntry {
  return entry !== null && Date.now() < entry.expiresAt
}

export function getCachedOrders(): ShopOrder[] | undefined {
  if (isFresh(ordersCache)) return ordersCache.value
  return undefined
}

export function setCachedOrders(value: ShopOrder[]) {
  ordersCache = { value, expiresAt: Date.now() + TTL_MS }
}

export function invalidateOrdersCache() {
  ordersCache = null
  inflight = null
}

export function readOrdersInflight(fetcher: () => Promise<ShopOrder[]>): Promise<ShopOrder[]> {
  const cached = getCachedOrders()
  if (cached) return Promise.resolve(cached)

  if (inflight) return inflight

  inflight = fetcher().finally(() => {
    inflight = null
  })

  return inflight
}
