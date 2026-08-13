import type { MascotProduct } from "@/lib/types/mascot"
import type { PreOrderSettings } from "@/lib/types/pre-order"

export function isProductPreOrder(
  product: Pick<MascotProduct, "category" | "preOrder">,
  preOrder: PreOrderSettings,
): boolean {
  if (!preOrder.enabled) return false
  if ((product.category || "mascot") !== "mascot") return false
  return product.preOrder === true
}

export function hasPreOrderProducts(
  products: Pick<MascotProduct, "category" | "preOrder" | "active">[],
  preOrder: PreOrderSettings,
): boolean {
  if (!preOrder.enabled) return false
  return products.some(
    (product) => product.active !== false && isProductPreOrder(product, preOrder),
  )
}
