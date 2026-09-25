import { NextResponse } from "next/server"
import { loadSiteData } from "@/lib/store"
import { getProductImages } from "@/lib/utils/product-images"
import { isDataUrl } from "@/lib/utils/compress-image"

const IMAGE_CACHE =
  "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params
  const { searchParams } = new URL(request.url)
  const index = Math.max(0, Number(searchParams.get("i") ?? "0") || 0)

  const data = await loadSiteData()
  const product = data.mascots.find((m) => m.id === productId)
  if (!product) {
    return new NextResponse("Not found", { status: 404 })
  }

  const images = getProductImages(product)
  const src = images[index] ?? images[0]
  if (!src) {
    return new NextResponse("No image", { status: 404 })
  }

  if (isDataUrl(src)) {
    const comma = src.indexOf(",")
    if (comma === -1) {
      return new NextResponse("Invalid image", { status: 400 })
    }

    const header = src.slice(0, comma)
    const base64 = src.slice(comma + 1)
    const mime = header.match(/data:(.*?);/)?.[1] ?? "image/jpeg"
    const buffer = Buffer.from(base64, "base64")

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": IMAGE_CACHE,
      },
    })
  }

  if (src.startsWith("http://") || src.startsWith("https://")) {
    return NextResponse.redirect(src, {
      status: 307,
      headers: { "Cache-Control": IMAGE_CACHE },
    })
  }

  return new NextResponse("Unsupported image source", { status: 400 })
}
