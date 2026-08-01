import type { MascotProduct } from "@/lib/types/mascot"

export type OrderStatus = "pending_review" | "approved" | "dispatched" | "rejected"

export interface OrderLineItem {
  productId: string
  name: string
  price: string
  quantity: number
}

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
}

export interface CartItem {
  product: MascotProduct
  quantity: number
}
