import { NextResponse } from "next/server"
import { INSTAGRAM_REELS } from "@/lib/constants/instagram"
import { getClientIp, tooManyRequestsResponse } from "@/lib/auth/manager"
import { enforceRateLimit } from "@/lib/security/rate-limit"

export const revalidate = 86400

async function getThumbnailUrl(reelUrl: string): Promise<string | null> {
  const oembedUrl = `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(reelUrl)}`
  const res = await fetch(oembedUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; TheBazm/1.0)" },
    next: { revalidate: 86400 },
  })
  if (!res.ok) return null
  const data = (await res.json()) as { thumbnail_url?: string }
  return data.thumbnail_url ?? null
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ip = getClientIp(request)
  const allowed = await enforceRateLimit(`instagram:thumb:${ip}`, {
    limit: 60,
    windowSeconds: 60 * 60,
  })
  if (!allowed) return tooManyRequestsResponse()

  const { id } = await params
  const reel = INSTAGRAM_REELS.find((item) => item.id === id)
  if (!reel) {
    return new NextResponse("Not found", { status: 404 })
  }

  const thumbnailUrl = await getThumbnailUrl(reel.url)
  if (!thumbnailUrl) {
    return new NextResponse("Thumbnail unavailable", { status: 502 })
  }

  // Redirect to Instagram CDN instead of proxying image bytes through our origin.
  return NextResponse.redirect(thumbnailUrl, {
    status: 307,
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
    },
  })
}
