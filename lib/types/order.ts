import type { MascotProduct } from "@/lib/types/mascot"

export type OrderStatus = "pending_review" | "approved" | "dispatched" | "rejected"

export interface OrderLineItem {
  productId: string
  name: string
  price: string
  quantity: number
}

export type ShopOrderType = "standard" | "pre_order"

export interface ShopOrder {
  id: string
  orderNumber: string
  createdAt: string
  customerPhone: string
  customerAddress: string
  items: OrderLineItem[]
  subtotal: number
  shipping: number
  total: number
  freeShipping: boolean
  paymentImage: string
  status: OrderStatus
  orderType?: ShopOrderType
  /** Amount paid at checkout (full total or pre-order advance) */
  amountDueNow?: number
  /** Remaining balance before dispatch (pre-orders only) */
  balanceDue?: number
}

export interface CartItem {
  product: MascotProduct
  quantity: number
}
