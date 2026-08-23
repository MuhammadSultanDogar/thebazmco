import type { Metadata } from "next"
import { loadSiteData } from "@/lib/store"
import { SITE_NAME, SITE_URL } from "@/lib/seo/site"
import {
  findProductBySlug,
  getProductAbsoluteUrl,
  type ProductCategoryPath,
} from "@/lib/utils/product-slug"

export async function buildProductMetadata(
  categoryPath: ProductCategoryPath,
  slug: string,
): Promise<Metadata> {
  try {
    const data = await loadSiteData()
    const product = findProductBySlug(data.mascots, categoryPath, slug)

    if (!product) {
      return { title: "Product Not Found" }
    }

    const url = getProductAbsoluteUrl(product, SITE_URL)
    const title = `${product.name} | ${SITE_NAME}`
    const description =
      product.description?.trim() ||
      `Buy ${product.name} from ${SITE_NAME}. Nationwide delivery across Pakistan.`

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        type: "website",
        siteName: SITE_NAME,
        ...(product.image ? { images: [{ url: product.image }] } : {}),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    }
  } catch {
    return { title: SITE_NAME }
  }
}
