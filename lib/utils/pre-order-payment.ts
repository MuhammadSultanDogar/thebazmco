import type { MascotProduct } from "@/lib/types/mascot"
import type { PreOrderSettings } from "@/lib/types/pre-order"

type CartLine = {
  product: Pick<MascotProduct, "category">
  quantity: number
}

export function countMascotUnits(items: CartLine[]): number {
  return items.reduce((sum, item) => {
    if ((item.product.category || "mascot") === "mascot") {
      return sum + item.quantity
    }
    return sum
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

  const mascotUnits = countMascotUnits(items)

  if (mascotUnits === 0) {
    return {
      isPreOrder: false,
      mascotUnits: 0,
      amountDueNow: orderTotal,
      balanceDue: 0,
    }
  }

  const amountDueNow = mascotUnits * preOrder.advanceAmount
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
    return `PKR ${advanceAmount.toLocaleString("en-PK")} per mascot`
  }
  return `PKR ${advanceAmount.toLocaleString("en-PK")} × ${mascotUnits} mascots = PKR ${(mascotUnits * advanceAmount).toLocaleString("en-PK")}`
}
