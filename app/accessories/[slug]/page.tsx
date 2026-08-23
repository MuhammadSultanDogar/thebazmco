import { notFound } from "next/navigation"
import { HomePage } from "@/components/landing/home-page"
import { buildProductMetadata } from "@/lib/seo/product-metadata"
import { loadSiteData } from "@/lib/store"
import { findProductBySlug } from "@/lib/utils/product-slug"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  return buildProductMetadata("accessories", slug)
}

export default async function AccessoryProductPage({ params }: PageProps) {
  const { slug } = await params

  try {
    const data = await loadSiteData()
    const product = findProductBySlug(data.mascots, "accessories", slug)
    if (!product) notFound()
  } catch {
    notFound()
  }

  return <HomePage />
}
