import { notFound } from "next/navigation"
import { HomePage } from "@/components/landing/home-page"
import { buildProductMetadata } from "@/lib/seo/product-metadata"
import { getPublicMascots } from "@/lib/store/public-mascots"
import { findProductBySlug } from "@/lib/utils/product-slug"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  return buildProductMetadata("mascots", slug)
}

export default async function MascotProductPage({ params }: PageProps) {
  const { slug } = await params
  const initialProducts = await getPublicMascots()
  const product = findProductBySlug(initialProducts, "mascots", slug)

  if (!product) notFound()

  return (
    <HomePage initialProducts={initialProducts} initialOpenProduct={product} />
  )
}
