import { parsePrice } from "@/lib/constants/payment"
import type { MascotCategory } from "@/lib/types/mascot"
import { DEFAULT_SHIPPING_SETTINGS } from "@/lib/types/shipping-settings"

export type OrderLine = {
  product: { price: string; shipping: string; category?: MascotCategory }
  quantity: number
}

export function cartHasMascot(items: OrderLine[]): boolean {
  return items.some((item) => (item.product.category || "mascot") === "mascot")
}

export function calculateLineShipping(items: OrderLine[]): number {
  return items.reduce(
    (sum, item) => sum + parsePrice(item.product.shipping) * item.quantity,
    0,
  )
}

export function calculateOrderTotals(
  items: OrderLine[],
  _freeShippingMinimum = DEFAULT_SHIPPING_SETTINGS.freeShippingMinimum,
) {
  const subtotal = items.reduce(
    (sum, item) => sum + parsePrice(item.product.price) * item.quantity,
    0,
  )

  if (cartHasMascot(items)) {
    return {
      subtotal,
      shipping: 0,
      total: subtotal,
      freeShipping: true,
      lineShipping: 0,
    }
  }

  const lineShipping = calculateLineShipping(items)
  const shipping = lineShipping
  const total = subtotal + shipping

  return {
    subtotal,
    shipping,
    total,
    freeShipping: false,
    lineShipping,
  }
}
