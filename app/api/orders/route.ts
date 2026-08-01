import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { ShopOrder, OrderStatus } from "@/lib/types/order"
import { loadSiteData, updateSiteData } from "@/lib/store"

async function isAuthenticated() {
  const cookieStore = await cookies()
  const session = cookieStore.get("manager_session")
  return session?.value === "authenticated"
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const showAll = searchParams.get("all") === "true"

  if (showAll && (await isAuthenticated())) {
    const data = await loadSiteData()
    return NextResponse.json(
      [...data.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    )
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    let created: ShopOrder | null = null
    await updateSiteData((site) => {
      const order: ShopOrder = {
        id: `order-${Date.now()}`,
        orderNumber: `TBZ-SHOP-${new Date().getFullYear()}-${String(site.orderCounter++).padStart(3, "0")}`,
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
      site.orders.unshift(order)
      created = order
    })

    return NextResponse.json(created)
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    let updated: ShopOrder | null = null

    await updateSiteData((site) => {
      const index = site.orders.findIndex((o) => o.id === body.id)
      if (index === -1) throw new Error("NOT_FOUND")
      site.orders[index] = {
        ...site.orders[index],
        status: body.status as OrderStatus,
      }
      updated = site.orders[index]
    })

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

  await updateSiteData((site) => {
    site.orders = site.orders.filter((o) => o.id !== id)
  })

  return NextResponse.json({ success: true })
}
