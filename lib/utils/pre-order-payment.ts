import type { MascotProduct } from "@/lib/types/mascot"
import type { PreOrderSettings } from "@/lib/types/pre-order"
import { parsePrice } from "@/lib/constants/payment"
import { isProductPreOrder } from "@/lib/utils/pre-order"

type CartLine = {
  product: Pick<MascotProduct, "category" | "price" | "preOrder">
  quantity: number
}

export function countPreOrderMascotUnits(
  items: CartLine[],
  preOrder: PreOrderSettings,
): number {
  return items.reduce((sum, item) => {
    if (isProductPreOrder(item.product, preOrder)) {
      return sum + item.quantity
    }
    return sum
  }, 0)
}

/** @deprecated Use countPreOrderMascotUnits */
export function countMascotUnits(items: CartLine[], preOrder?: PreOrderSettings): number {
  if (preOrder) return countPreOrderMascotUnits(items, preOrder)
  return items.reduce((sum, item) => {
    if ((item.product.category || "mascot") === "mascot") {
      return sum + item.quantity
    }
    return sum
  }, 0)
}

function sumStandardLineTotals(items: CartLine[], preOrder: PreOrderSettings): number {
  return items.reduce((sum, item) => {
    if (isProductPreOrder(item.product, preOrder)) return sum
    return sum + parsePrice(item.product.price) * item.quantity
  }, 0)
}

export function calculatePreOrderPayment(
  items: CartLine[],
  preOrder: PreOrderSettings,
  orderTotal: number,
) {
  if (!preOrder.enabled) {
    return {
      isPreOrder: false,
      mascotUnits: 0,
      amountDueNow: orderTotal,
      balanceDue: 0,
    }
  }

  const mascotUnits = countPreOrderMascotUnits(items, preOrder)

  if (mascotUnits === 0) {
    return {
      isPreOrder: false,
      mascotUnits: 0,
      amountDueNow: orderTotal,
      balanceDue: 0,
    }
  }

  const preOrderAdvance = mascotUnits * preOrder.advanceAmount
  const standardLineTotal = sumStandardLineTotals(items, preOrder)
  const amountDueNow = preOrderAdvance + standardLineTotal
  const balanceDue = Math.max(0, orderTotal - amountDueNow)

  return {
    isPreOrder: true,
    mascotUnits,
    amountDueNow,
    balanceDue,
  }
}

export function formatPreOrderAdvanceLabel(
  mascotUnits: number,
  advanceAmount: number,
): string {
  if (mascotUnits <= 1) {
    return `PKR ${advanceAmount.toLocaleString("en-PK")} per pre-order mascot`
  }
  return `PKR ${advanceAmount.toLocaleString("en-PK")} × ${mascotUnits} pre-order mascots = PKR ${(mascotUnits * advanceAmount).toLocaleString("en-PK")}`
}
