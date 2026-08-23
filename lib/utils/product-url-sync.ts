import type { MascotProduct } from "@/lib/types/mascot"
import {
  findProductBySlug,
  getProductPath,
  parseProductPath,
} from "@/lib/utils/product-slug"

function scrollToShop() {
  requestAnimationFrame(() => {
    document.getElementById("mascots")?.scrollIntoView({ behavior: "auto", block: "start" })
  })
}

export function syncProductFromBrowserUrl(
  products: MascotProduct[],
): MascotProduct | null {
  const parsed = parseProductPath(window.location.pathname)
  if (!parsed) return null
  return findProductBySlug(products, parsed.category, parsed.slug) ?? null
}

export function pushProductUrl(product: MascotProduct) {
  const path = getProductPath(product)
  if (window.location.pathname === path) return
  window.history.pushState({ productModal: true }, "", path)
}

export function closeProductUrl(clientOpened: boolean) {
  if (clientOpened) {
    window.history.back()
    return
  }

  if (parseProductPath(window.location.pathname)) {
    window.history.replaceState(null, "", "/")
  }
}

export { scrollToShop }
