import type { MascotProduct } from "@/lib/types/mascot"

export function getProductImages(product: Pick<MascotProduct, "image" | "images">): string[] {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images.filter(Boolean)
  }
  if (product.image) return [product.image]
  return []
}

export function getProductPrimaryImage(product: Pick<MascotProduct, "image" | "images">): string {
  return getProductImages(product)[0] ?? ""
}

export function normalizeMascotProduct(product: MascotProduct): MascotProduct {
  const images = getProductImages(product)
  return {
    ...product,
    images,
    image: images[0] ?? "",
    soldOut: product.soldOut === true,
    accessories: (product.accessories ?? []).map((acc) => ({
      ...acc,
      soldOut: acc.soldOut === true,
    })),
  }
}

export function normalizeMascotList(products: MascotProduct[]): MascotProduct[] {
  return products.map(normalizeMascotProduct)
}
