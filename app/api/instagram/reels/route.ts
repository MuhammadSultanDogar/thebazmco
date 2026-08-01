import { NextResponse } from "next/server"
import { INSTAGRAM_REELS } from "@/lib/constants/instagram"

export const dynamic = "force-dynamic"

type OEmbedResponse = {
  thumbnail_url?: string
  title?: string
  author_name?: string
}

async function fetchReelMeta(url: string): Promise<OEmbedResponse | null> {
  try {
    const oembedUrl = `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(url)}`
    const res = await fetch(oembedUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TheBazm/1.0)" },
      cache: "no-store",
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function GET() {
  const reels = await Promise.all(
    INSTAGRAM_REELS.map(async (reel) => {
      const meta = await fetchReelMeta(reel.url)
      return {
        id: reel.id,
        url: reel.url,
        embed: reel.embed,
        caption: reel.caption,
        thumbnailUrl: `/api/instagram/thumbnail/${reel.id}`,
        title: meta?.title ?? reel.caption,
        authorName: meta?.author_name ?? null,
      }
    }),
  )

  return NextResponse.json(reels)
}
