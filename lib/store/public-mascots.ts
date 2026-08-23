import type { MascotProduct } from "@/lib/types/mascot"
import { loadSiteData } from "@/lib/store"
import { normalizeMascotProduct } from "@/lib/utils/product-images"

export async function getPublicMascots(): Promise<MascotProduct[]> {
  try {
    const data = await loadSiteData()
    return data.mascots
      .filter((m) => m.active)
      .map((m) => {
        const normalized = normalizeMascotProduct(m)
        return {
          id: normalized.id,
          name: normalized.name,
          description: normalized.description,
          price: normalized.price,
          image: normalized.image,
          images: normalized.images,
          shipping: normalized.shipping,
          accessories: normalized.accessories,
          category: normalized.category || "mascot",
          featured: normalized.featured,
          active: normalized.active,
          soldOut: normalized.soldOut,
          preOrder: normalized.preOrder,
          originalPrice: normalized.originalPrice,
          sortOrder: normalized.sortOrder,
        }
      })
      .sort((a, b) => a.sortOrder - b.sortOrder)
  } catch {
    return []
  }
}
