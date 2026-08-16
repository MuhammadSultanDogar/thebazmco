import { parsePrice } from "@/lib/constants/payment"
import { DEFAULT_SHIPPING_SETTINGS } from "@/lib/types/shipping-settings"

export type OrderLine = {
  product: { price: string; shipping: string }
  quantity: number
}

export function calculateLineShipping(items: OrderLine[]): number {
  return items.reduce(
    (sum, item) => sum + parsePrice(item.product.shipping) * item.quantity,
    0,
  )
}

export function calculateOrderTotals(
  items: OrderLine[],
  freeShippingMinimum = DEFAULT_SHIPPING_SETTINGS.freeShippingMinimum,
) {
  const subtotal = items.reduce(
    (sum, item) => sum + parsePrice(item.product.price) * item.quantity,
    0,
  )

  const lineShipping = calculateLineShipping(items)
  const freeShipping = subtotal >= freeShippingMinimum
  const shipping = freeShipping ? 0 : lineShipping
  const total = subtotal + shipping

  return { subtotal, shipping, total, freeShipping, lineShipping }
}
