import type { ShopOrder, OrderStatus } from "@/lib/types/order"

/** List / CSV / alerts — omits heavy payment screenshot payload. */
export type ShopOrderSummary = Omit<ShopOrder, "paymentImage">

export function toOrderSummary(order: ShopOrder): ShopOrderSummary {
  const { paymentImage: _paymentImage, ...summary } = order
  return summary
}

export function countOrdersByStatusAll(orders: ShopOrder[]): Record<OrderStatus, number> {
  return {
    pending_review: orders.filter((o) => o.status === "pending_review").length,
    approved: orders.filter((o) => o.status === "approved").length,
    dispatched: orders.filter((o) => o.status === "dispatched").length,
    rejected: orders.filter((o) => o.status === "rejected").length,
  }
}
