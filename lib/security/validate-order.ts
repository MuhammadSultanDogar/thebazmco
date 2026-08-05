import type { MascotProduct } from "@/lib/types/mascot"
import type { OrderLineItem } from "@/lib/types/order"
import type { PreOrderSettings } from "@/lib/types/pre-order"
import { FREE_SHIPPING_THRESHOLD, parsePrice } from "@/lib/constants/payment"
import { isProductSoldOut } from "@/lib/utils/product-availability"
import { calculatePreOrderPayment } from "@/lib/utils/pre-order-payment"
import { isDataUrl } from "@/lib/utils/compress-image"
import {
  validateDeliveryAddress,
  validatePakistaniPhone,
} from "@/lib/utils/validate-customer"

type OrderPayload = {
  customerPhone?: string
  customerAddress?: string
  paymentImage?: string
  orderType?: "standard" | "pre_order"
  amountDueNow?: number
  items?: {
    productId?: string
    name?: string
    price?: string
    quantity?: number
  }[]
  subtotal?: number
  shipping?: number
  total?: number
  freeShipping?: boolean
}

export type ValidatedOrderInput = {
  customerPhone: string
  customerAddress: string
  paymentImage: string
  items: OrderLineItem[]
  subtotal: number
  shipping: number
  total: number
  freeShipping: boolean
  orderType: "standard" | "pre_order"
  amountDueNow: number
  balanceDue: number
}

const MAX_ITEMS = 20
const MAX_ITEM_QTY = 10
const MAX_PAYMENT_IMAGE_BYTES = 2_500_000

function calculateTotals(
  items: { product: MascotProduct; quantity: number }[],
) {
  const subtotal = items.reduce(
    (sum, item) => sum + parsePrice(item.product.price) * item.quantity,
    0,
  )

  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
  const shipping = freeShipping
    ? 0
    : items.reduce((max, item) => {
        const ship = parsePrice(item.product.shipping)
        return Math.max(max, ship)
      }, 0)

  return { subtotal, shipping, total: subtotal + shipping, freeShipping }
}

export function validateOrderPayload(
  body: OrderPayload,
  mascots: MascotProduct[],
  preOrder: PreOrderSettings,
): { ok: true; data: ValidatedOrderInput } | { ok: false; error: string } {
  const phoneResult = validatePakistaniPhone(body.customerPhone ?? "")
  if (!phoneResult.ok) {
    return { ok: false, error: phoneResult.error }
  }

  const addressResult = validateDeliveryAddress(body.customerAddress ?? "")
  if (!addressResult.ok) {
    return { ok: false, error: addressResult.error }
  }

  const phone = phoneResult.phone
  const address = addressResult.address
  const paymentImage = body.paymentImage

  if (!paymentImage || !isDataUrl(paymentImage)) {
    return { ok: false, error: "Payment screenshot is required" }
  }

  if (Buffer.byteLength(paymentImage, "utf-8") > MAX_PAYMENT_IMAGE_BYTES) {
    return { ok: false, error: "Payment screenshot is too large" }
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return { ok: false, error: "Cart is empty" }
  }

  if (body.items.length > MAX_ITEMS) {
    return { ok: false, error: "Too many items in cart" }
  }

  const activeById = new Map(
    mascots.filter((m) => m.active).map((m) => [m.id, m]),
  )

  const resolvedItems: { product: MascotProduct; quantity: number }[] = []

  for (const item of body.items) {
    if (!item.productId || !item.quantity) {
      return { ok: false, error: "Invalid cart item" }
    }

    const quantity = Math.floor(item.quantity)
    if (quantity < 1 || quantity > MAX_ITEM_QTY) {
      return { ok: false, error: "Invalid item quantity" }
    }

    const product = activeById.get(item.productId)
    if (!product) {
      return { ok: false, error: "Product unavailable" }
    }

    if (isProductSoldOut(product)) {
      return { ok: false, error: `${product.name} is sold out` }
    }

    if (item.price && item.price !== product.price) {
      return { ok: false, error: "Price mismatch — refresh and try again" }
    }

    resolvedItems.push({ product, quantity })
  }

  const totals = calculateTotals(resolvedItems)
  const preOrderPayment = calculatePreOrderPayment(resolvedItems, preOrder, totals.total)
  const { isPreOrder, amountDueNow, balanceDue } = preOrderPayment

  if (body.subtotal !== undefined && body.subtotal !== totals.subtotal) {
    return { ok: false, error: "Subtotal mismatch — refresh and try again" }
  }

  if (body.total !== undefined && body.total !== totals.total) {
    return { ok: false, error: "Total mismatch — refresh and try again" }
  }

  if (body.amountDueNow !== undefined && body.amountDueNow !== amountDueNow) {
    return { ok: false, error: "Payment amount mismatch — refresh and try again" }
  }

  const lineItems: OrderLineItem[] = resolvedItems.map(({ product, quantity }) => ({
    productId: product.id,
    name: product.name,
    price: product.price,
    quantity,
  }))

  return {
    ok: true,
    data: {
      customerPhone: phone,
      customerAddress: address,
      paymentImage,
      items: lineItems,
      ...totals,
      orderType: isPreOrder ? "pre_order" : "standard",
      amountDueNow,
      balanceDue,
    },
  }
}
