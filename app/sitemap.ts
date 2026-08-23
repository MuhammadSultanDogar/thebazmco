import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo/site"
import { loadSiteData } from "@/lib/store"
import { getProductPath } from "@/lib/utils/product-slug"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/#mascots`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/#faq`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ]

  try {
    const data = await loadSiteData()
    const productEntries: MetadataRoute.Sitemap = data.mascots
      .filter((product) => product.active !== false)
      .map((product) => ({
        url: `${SITE_URL.replace(/\/$/, "")}${getProductPath(product)}`,
        lastModified: new Date(data.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }))

    return [...baseEntries, ...productEntries]
  } catch {
    return baseEntries
  }
}
