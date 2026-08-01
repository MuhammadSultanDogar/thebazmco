import { NextResponse } from "next/server"
import { INSTAGRAM_REELS } from "@/lib/constants/instagram"

export const revalidate = 3600

async function getThumbnailUrl(reelUrl: string): Promise<string | null> {
  const oembedUrl = `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(reelUrl)}`
  const res = await fetch(oembedUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; TheBazm/1.0)" },
    next: { revalidate: 3600 },
  })
  if (!res.ok) return null
  const data = (await res.json()) as { thumbnail_url?: string }
  return data.thumbnail_url ?? null
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const reel = INSTAGRAM_REELS.find((item) => item.id === id)
  if (!reel) {
    return new NextResponse("Not found", { status: 404 })
  }

  const thumbnailUrl = await getThumbnailUrl(reel.url)
  if (!thumbnailUrl) {
    return new NextResponse("Thumbnail unavailable", { status: 502 })
  }

  const imageRes = await fetch(thumbnailUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; TheBazm/1.0)",
      Referer: "https://www.instagram.com/",
    },
    next: { revalidate: 3600 },
  })

  if (!imageRes.ok) {
    return new NextResponse("Failed to fetch thumbnail", { status: 502 })
  }

  const buffer = await imageRes.arrayBuffer()
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": imageRes.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
