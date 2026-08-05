import type { ShopOrder } from "@/lib/types/order"
import { formatPrice } from "@/lib/constants/payment"
import { SITE_URL } from "@/lib/seo/site"

export function buildOrderNotificationText(order: ShopOrder): string {
  const isPreOrder = order.orderType === "pre_order"
  const paidNow = order.amountDueNow ?? order.total
  const balance = order.balanceDue ?? 0

  const lines = [
    `New ${isPreOrder ? "pre-order" : "order"}: ${order.orderNumber}`,
    "",
    ...order.items.map((i) => `- ${i.name} x${i.quantity} — PKR ${i.price}`),
    "",
    `Subtotal: PKR ${formatPrice(order.subtotal)}`,
    order.freeShipping
      ? "Shipping: FREE"
      : `Shipping: PKR ${formatPrice(order.shipping)}`,
    `Order total: PKR ${formatPrice(order.total)}`,
    `Due now: PKR ${formatPrice(paidNow)}`,
    ...(isPreOrder && balance > 0
      ? [`Balance before dispatch: PKR ${formatPrice(balance)}`]
      : []),
    "",
    `Phone: ${order.customerPhone}`,
    `Address: ${order.customerAddress}`,
    "",
    `Review in manager: ${SITE_URL}/manager`,
  ]

  return lines.join("\n")
}

/** FormSubmit only works from a browser — not from Vercel/server. */
export async function sendOrderAlertViaFormSubmit(
  order: ShopOrder,
  toEmail: string,
): Promise<boolean> {
  const subject = `New order ${order.orderNumber} — PKR ${formatPrice(order.amountDueNow ?? order.total)}`

  try {
    const res = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(toEmail)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: subject,
          message: buildOrderNotificationText(order),
          order_number: order.orderNumber,
          customer_phone: order.customerPhone,
          amount_due: `PKR ${formatPrice(order.amountDueNow ?? order.total)}`,
          _captcha: false,
        }),
      },
    )

    const data = (await res.json().catch(() => null)) as {
      success?: boolean | string
      message?: string
    } | null

    return data?.success === true || data?.success === "true"
  } catch {
    return false
  }
}
