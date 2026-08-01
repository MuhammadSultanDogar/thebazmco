import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { ShopOrder, OrderStatus } from "@/lib/types/order"

let orders: ShopOrder[] = []
let orderCounter = 1

async function isAuthenticated() {
  const cookieStore = await cookies()
  const session = cookieStore.get("manager_session")
  return session?.value === "authenticated"
}

function generateOrderNumber() {
  const num = String(orderCounter++).padStart(3, "0")
  const year = new Date().getFullYear()
  return `TBZ-SHOP-${year}-${num}`
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const showAll = searchParams.get("all") === "true"

  if (showAll && (await isAuthenticated())) {
    return NextResponse.json([...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
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

    const order: ShopOrder = {
      id: `order-${Date.now()}`,
      orderNumber: generateOrderNumber(),
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

    orders.unshift(order)
    return NextResponse.json(order)
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
    const index = orders.findIndex((o) => o.id === body.id)
    if (index === -1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    orders[index] = {
      ...orders[index],
      status: body.status as OrderStatus,
    }
    return NextResponse.json(orders[index])
  } catch {
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

  orders = orders.filter((o) => o.id !== id)
  return NextResponse.json({ success: true })
}
