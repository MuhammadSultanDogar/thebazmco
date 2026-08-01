export const PAYMENT_DETAILS = {
  accountName: "Muhammad Hasaan Dogar",
  bank: "UBL (United Bank Limited)",
  accountNumber: "0711367881131",
  note: "100% advance payment required before dispatch. Upload your transfer screenshot at checkout.",
}

export const FREE_SHIPPING_THRESHOLD = 10000
export const WHATSAPP_NUMBER = "923255105062"

export function parsePrice(value: string): number {
  return parseFloat(value.replace(/,/g, "")) || 0
}

export function formatPrice(amount: number): string {
  return amount.toLocaleString("en-PK")
}

export function calculateOrderTotals(items: { product: { price: string; shipping: string }; quantity: number }[]) {
  const subtotal = items.reduce(
    (sum, item) => sum + parsePrice(item.product.price) * item.quantity,
    0
  )

  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
  const shipping = freeShipping
    ? 0
    : items.reduce((max, item) => {
        const ship = parsePrice(item.product.shipping)
        return Math.max(max, ship)
      }, 0)

  const total = subtotal + shipping

  return { subtotal, shipping, total, freeShipping }
}

export function buildWhatsAppOrderMessage(order: {
  orderNumber: string
  customerPhone: string
  customerAddress: string
  items: { name: string; price: string; quantity: number }[]
  subtotal: number
  shipping: number
  total: number
  freeShipping: boolean
}) {
  const lines = [
    `Hi TheBazm! I just placed order ${order.orderNumber}.`,
    "",
    "*Items:*",
    ...order.items.map((i) => `• ${i.name} x${i.quantity} — PKR ${i.price}`),
    "",
    `Subtotal: PKR ${formatPrice(order.subtotal)}`,
    order.freeShipping
      ? "Shipping: FREE (order above PKR 10,000)"
      : `Shipping: PKR ${formatPrice(order.shipping)}`,
    `*Total Paid (Advance): PKR ${formatPrice(order.total)}*`,
    "",
    `Phone: ${order.customerPhone}`,
    `Address: ${order.customerAddress}`,
    "",
    "Payment screenshot submitted on website. Please confirm and dispatch.",
  ]
  return lines.join("\n")
}
