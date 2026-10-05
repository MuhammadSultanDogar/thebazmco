import type { MascotProduct } from "@/lib/types/mascot"
import { loadSiteConfig } from "@/lib/store"
import { sanitizeProductsForPublic } from "@/lib/utils/public-product-images"

export async function getPublicMascots(): Promise<MascotProduct[]> {
  try {
    const config = await loadSiteConfig()
    const active = config.mascots
      .filter((m) => m.active)
      .map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        price: m.price,
        image: m.image,
        images: m.images,
        shipping: m.shipping,
        accessories: m.accessories,
        category: m.category || "mascot",
        featured: m.featured,
        active: m.active,
        soldOut: m.soldOut,
        preOrder: m.preOrder,
        originalPrice: m.originalPrice,
        sortOrder: m.sortOrder,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder)

    return sanitizeProductsForPublic(active)
  } catch {
    return []
  }
}
