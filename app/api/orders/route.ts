import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { ShopOrder, OrderStatus } from "@/lib/types/order"
import { loadSiteConfig, saveSiteConfig } from "@/lib/store"
import {
  appendOrder,
  loadOrdersFromStore,
  removeOrder,
  updateOrderStatus,
} from "@/lib/store/orders"

export const dynamic = "force-dynamic"

async function isAuthenticated() {
  const cookieStore = await cookies()
  const session = cookieStore.get("manager_session")
  return session?.value === "authenticated"
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const showAll = searchParams.get("all") === "true"
  const status = searchParams.get("status")

  if (!showAll || !(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let orders = await loadOrdersFromStore()

  if (status && status !== "all") {
    orders = orders.filter((o) => o.status === status)
  }

  orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return NextResponse.json(orders, {
    headers: { "Cache-Control": "no-store" },
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.customerPhone || !body.customerAddress || !body.paymentImage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!body.items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    const config = await loadSiteConfig()
    const order: ShopOrder = {
      id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      orderNumber: `TBZ-SHOP-${new Date().getFullYear()}-${String(config.orderCounter).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
      customerPhone: body.customerPhone,
      customerAddress: body.customerAddress,
      items: body.items,
      subtotal: body.subtotal,
      shipping: body.shipping,
      total: body.total,
      freeShipping: body.freeShipping ?? false,
      paymentImage: body.paymentImage,
      status: "pending_review",
    }

    const nextConfig = {
      ...config,
      orderCounter: config.orderCounter + 1,
      updatedAt: new Date().toISOString(),
    }

    await appendOrder(order, nextConfig)
    await saveSiteConfig(nextConfig)

    return NextResponse.json(order)
  } catch (error) {
    console.error("Order create failed:", error)
    return NextResponse.json({ error: "Failed to save order" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const config = await loadSiteConfig()
    const updated = await updateOrderStatus(body.id, body.status as OrderStatus, config)
    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const config = await loadSiteConfig()
  await removeOrder(id, config)

  return NextResponse.json({ success: true })
}
