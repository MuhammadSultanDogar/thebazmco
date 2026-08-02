import { NextResponse } from "next/server"
import type { ShopOrder, OrderStatus } from "@/lib/types/order"
import { loadSiteConfig, loadSiteData, saveSiteConfig } from "@/lib/store"
import {
  appendOrder,
  loadOrdersFromStore,
  removeOrder,
  updateOrderStatus,
} from "@/lib/store/orders"
import {
  assertSameOrigin,
  getClientIp,
  noStoreJson,
  requireManagerAuth,
  tooManyRequestsResponse,
} from "@/lib/auth/manager"
import { enforceRateLimit } from "@/lib/security/rate-limit"
import { validateOrderPayload } from "@/lib/security/validate-order"
import { secureJson } from "@/lib/security/headers"

export const dynamic = "force-dynamic"

const VALID_STATUSES: OrderStatus[] = [
  "pending_review",
  "approved",
  "dispatched",
  "rejected",
]

export async function GET(request: Request) {
  const authError = await requireManagerAuth()
  if (authError) return authError

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")

  let orders = await loadOrdersFromStore()

  if (status && status !== "all" && VALID_STATUSES.includes(status as OrderStatus)) {
    orders = orders.filter((o) => o.status === status)
  }

  orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return noStoreJson(orders)
}

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 })
  }

  const ip = getClientIp(request)
  const allowed = await enforceRateLimit(`orders:create:${ip}`, {
    limit: 5,
    windowSeconds: 60 * 60,
  })
  if (!allowed) return tooManyRequestsResponse()

  try {
    const body = await request.json()
    const site = await loadSiteData()
    const validation = validateOrderPayload(body, site.mascots, site.preOrder)

    if (!validation.ok) {
      return secureJson({ error: validation.error }, { status: 400 })
    }

    const data = validation.data
    const config = await loadSiteConfig()

    const order: ShopOrder = {
      id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      orderNumber: `TBZ-SHOP-${new Date().getFullYear()}-${String(config.orderCounter).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
      customerPhone: data.customerPhone,
      customerAddress: data.customerAddress,
      items: data.items,
      subtotal: data.subtotal,
      shipping: data.shipping,
      total: data.total,
      freeShipping: data.freeShipping,
      paymentImage: data.paymentImage,
      status: "pending_review",
      orderType: data.orderType,
      amountDueNow: data.amountDueNow,
      balanceDue: data.balanceDue,
    }

    const nextConfig = {
      ...config,
      orderCounter: config.orderCounter + 1,
      updatedAt: new Date().toISOString(),
    }

    await appendOrder(order, nextConfig)
    await saveSiteConfig(nextConfig)

    return secureJson(order)
  } catch (error) {
    console.error("Order create failed:", error)
    return secureJson({ error: "Failed to save order" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const authError = await requireManagerAuth()
  if (authError) return authError

  if (!assertSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    if (!body.id || !VALID_STATUSES.includes(body.status)) {
      return secureJson({ error: "Invalid request" }, { status: 400 })
    }

    const config = await loadSiteConfig()
    const updated = await updateOrderStatus(body.id, body.status as OrderStatus, config)
    return noStoreJson(updated)
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return secureJson({ error: "Order not found" }, { status: 404 })
    }
    return secureJson({ error: "Invalid request" }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  const authError = await requireManagerAuth()
  if (authError) return authError

  if (!assertSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return secureJson({ error: "Missing id" }, { status: 400 })

  const config = await loadSiteConfig()
  await removeOrder(id, config)

  return secureJson({ success: true })
}
