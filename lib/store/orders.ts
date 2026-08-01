import type { ShopOrder, OrderStatus } from "@/lib/types/order"
import type { SiteData } from "@/lib/types/site-data"
import { getRedis, isRedisConfigured, ORDERS_KEY } from "@/lib/store/redis-client"
import { readFromLocalFile, writeToLocalFile } from "@/lib/store/local-file"

export async function loadOrdersFromStore(): Promise<ShopOrder[]> {
  if (isRedisConfigured()) {
    const redis = getRedis()
    if (!redis) return []

    try {
      const orders = await redis.get<ShopOrder[]>(ORDERS_KEY)
      if (Array.isArray(orders)) return orders
    } catch (error) {
      console.error("Redis orders read failed:", error)
    }

    return []
  }

  if (process.env.NODE_ENV !== "production") {
    const local = await readFromLocalFile()
    return local?.orders ?? []
  }

  return []
}

async function saveOrdersToRedis(orders: ShopOrder[]) {
  const redis = getRedis()
  if (!redis) throw new Error("Redis not configured")
  await redis.set(ORDERS_KEY, orders)
}

async function saveOrdersLocally(allData: SiteData) {
  await writeToLocalFile(allData)
}

export async function saveOrders(orders: ShopOrder[], siteConfig?: Omit<SiteData, "orders">) {
  if (isRedisConfigured()) {
    await saveOrdersToRedis(orders)
    return
  }

  if (process.env.NODE_ENV !== "production" && siteConfig) {
    await saveOrdersLocally({ ...siteConfig, orders })
  }
}

export async function appendOrder(
  order: ShopOrder,
  siteConfig: Omit<SiteData, "orders">,
): Promise<ShopOrder[]> {
  const orders = await loadOrdersFromStore()
  const next = [order, ...orders]
  await saveOrders(next, siteConfig)
  return next
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  siteConfig: Omit<SiteData, "orders">,
): Promise<ShopOrder> {
  const orders = await loadOrdersFromStore()
  const index = orders.findIndex((o) => o.id === id)
  if (index === -1) throw new Error("NOT_FOUND")

  orders[index] = { ...orders[index], status }
  await saveOrders(orders, siteConfig)
  return orders[index]
}

export async function removeOrder(id: string, siteConfig: Omit<SiteData, "orders">) {
  const orders = await loadOrdersFromStore()
  const next = orders.filter((o) => o.id !== id)
  await saveOrders(next, siteConfig)
  return next
}

export async function migrateLegacyOrdersIfNeeded(
  legacyOrders: ShopOrder[],
): Promise<ShopOrder[]> {
  if (!isRedisConfigured() || legacyOrders.length === 0) {
    return loadOrdersFromStore()
  }

  const current = await loadOrdersFromStore()
  if (current.length > 0) return current

  await saveOrdersToRedis(legacyOrders)
  return legacyOrders
}
