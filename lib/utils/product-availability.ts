import type { MascotProduct } from "@/lib/types/mascot"

export function isProductSoldOut(product: Pick<MascotProduct, "soldOut">): boolean {
  return product.soldOut === true
}

export function isProductAvailable(product: MascotProduct): boolean {
  return product.active !== false && !isProductSoldOut(product)
}
