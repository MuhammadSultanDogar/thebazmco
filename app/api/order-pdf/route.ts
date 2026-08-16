import { NextResponse } from "next/server"
import type { ShopOrder } from "@/lib/types/order"
import { loadOrdersFromStore } from "@/lib/store/orders"
import {
  assertSameOrigin,
  getClientIp,
  requireManagerAuth,
  tooManyRequestsResponse,
} from "@/lib/auth/manager"
import { enforceRateLimit } from "@/lib/security/rate-limit"
import { secureJson } from "@/lib/security/headers"
import { renderShopOrderInvoicePdf } from "@/lib/pdf/shop-order-invoice-pdf"
import type { ShopOrderInvoiceData } from "@/lib/utils/shop-order-invoice"

export const dynamic = "force-dynamic"

function toInvoiceData(order: ShopOrder): ShopOrderInvoiceData {
  return {
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress,
    items: order.items,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    freeShipping: order.freeShipping,
    status: order.status,
    orderType: order.orderType,
    amountDueNow: order.amountDueNow,
    balanceDue: order.balanceDue,
  }
}

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 })
  }

  const ip = getClientIp(request)
  const allowed = await enforceRateLimit(`order-pdf:${ip}`, {
    limit: 30,
    windowSeconds: 60 * 60,
  })
  if (!allowed) return tooManyRequestsResponse()

  try {
    const body = await request.json()
    const orderId = body.orderId as string | undefined
    const token = body.token as string | undefined

    if (!orderId) {
      return secureJson({ error: "Missing order id" }, { status: 400 })
    }

    const orders = await loadOrdersFromStore()
    const order = orders.find((o) => o.id === orderId)
    if (!order) {
      return secureJson({ error: "Order not found" }, { status: 404 })
    }

    const managerAuth = await requireManagerAuth()
    const isManager = !managerAuth

    if (!isManager) {
      if (!token || !order.invoiceToken || token !== order.invoiceToken) {
        return secureJson({ error: "Invalid invoice access" }, { status: 403 })
      }
    }

    const pdfBuffer = await renderShopOrderInvoicePdf(toInvoiceData(order))

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Order-${order.orderNumber}.pdf"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Order PDF generation error:", error)
    return secureJson({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
