import type { ShopOrder, OrderStatus } from "@/lib/types/order"
import { formatPrice, parsePrice } from "@/lib/constants/payment"
import { SHOP_INVOICE_TERMS } from "@/lib/constants/shop-invoice"

export type ShopOrderInvoiceData = Pick<
  ShopOrder,
  | "orderNumber"
  | "createdAt"
  | "customerPhone"
  | "customerAddress"
  | "items"
  | "subtotal"
  | "shipping"
  | "total"
  | "freeShipping"
  | "status"
  | "orderType"
  | "amountDueNow"
  | "balanceDue"
>

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending_review: "Payment Pending Review",
  approved: "Confirmed",
  dispatched: "Dispatched",
  rejected: "Rejected",
}

export function formatInvoiceDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function lineItemTotal(price: string, quantity: number): number {
  return parsePrice(price) * quantity
}

export function orderInvoiceSummary(order: ShopOrderInvoiceData) {
  const isPreOrder = order.orderType === "pre_order"
  const paidNow = order.amountDueNow ?? order.total
  const balance = order.balanceDue ?? 0

  return { isPreOrder, paidNow, balance }
}

export { SHOP_INVOICE_TERMS, formatPrice }
