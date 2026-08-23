import type { MascotCategory, MascotProduct } from "@/lib/types/mascot"

export type ProductCategoryPath = "mascots" | "accessories"

export function productSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "")
}

export function categoryToPath(category: MascotCategory | undefined): ProductCategoryPath {
  return category === "accessory" ? "accessories" : "mascots"
}

export function pathToCategory(path: ProductCategoryPath): MascotCategory {
  return path === "accessories" ? "accessory" : "mascot"
}

export function getProductPath(product: Pick<MascotProduct, "name" | "category">): string {
  return `/${categoryToPath(product.category)}/${productSlug(product.name)}`
}

export function getProductAbsoluteUrl(
  product: Pick<MascotProduct, "name" | "category">,
  siteUrl: string,
): string {
  return `${siteUrl.replace(/\/$/, "")}${getProductPath(product)}`
}

export function parseProductPath(pathname: string): {
  category: ProductCategoryPath
  slug: string
} | null {
  const match = pathname.match(/^\/(mascots|accessories)\/([^/]+)\/?$/)
  if (!match) return null

  return {
    category: match[1] as ProductCategoryPath,
    slug: decodeURIComponent(match[2]),
  }
}

export function findProductBySlug(
  products: MascotProduct[],
  categoryPath: ProductCategoryPath,
  slug: string,
): MascotProduct | undefined {
  const category = pathToCategory(categoryPath)
  const normalizedSlug = slug.toLowerCase()

  return products.find((product) => {
    if ((product.category || "mascot") !== category) return false
    if (product.active === false) return false
    return productSlug(product.name) === normalizedSlug
  })
}
