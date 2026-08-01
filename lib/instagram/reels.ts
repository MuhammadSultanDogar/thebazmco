import { INSTAGRAM_REELS } from "@/lib/constants/instagram"

export type ReelPreview = {
  id: string
  url: string
  embed: string
  caption: string
  thumbnailUrl: string
  title: string
  authorName: string | null
}

type OEmbedResponse = {
  thumbnail_url?: string
  title?: string
  author_name?: string
}

async function fetchReelMeta(url: string): Promise<OEmbedResponse | null> {
  const oembedUrl = `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(url)}`
  const res = await fetch(oembedUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; TheBazm/1.0)" },
    next: { revalidate: 3600 },
  })
  if (!res.ok) return null
  return res.json()
}

export async function fetchReelPreviews(): Promise<ReelPreview[]> {
  return Promise.all(
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
}
