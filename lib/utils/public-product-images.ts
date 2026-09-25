import type { MascotProduct } from "@/lib/types/mascot"
import { getProductImages, normalizeMascotProduct } from "@/lib/utils/product-images"
import { isDataUrl } from "@/lib/utils/compress-image"

export function productImageApiUrl(productId: string, index = 0): string {
  return `/api/product-image/${encodeURIComponent(productId)}?i=${index}`
}

export function resolvePublicImageSrc(productId: string, src: string, index: number): string {
  if (!src) return ""
  if (isDataUrl(src)) return productImageApiUrl(productId, index)
  return src
}

/** Strip inline base64 from API/page payloads — images load via cached /api/product-image instead. */
export function sanitizeProductForPublic(product: MascotProduct): MascotProduct {
  const normalized = normalizeMascotProduct(product)
  const images = getProductImages(normalized).map((src, index) =>
    resolvePublicImageSrc(normalized.id, src, index),
  )

  return {
    ...normalized,
    images,
    image: images[0] ?? "",
  }
}

export function sanitizeProductsForPublic(products: MascotProduct[]): MascotProduct[] {
  return products.map(sanitizeProductForPublic)
}
