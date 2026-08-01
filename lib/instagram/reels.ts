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

export function fetchReelPreviews(): ReelPreview[] {
  return INSTAGRAM_REELS.map((reel) => ({
    id: reel.id,
    url: reel.url,
    embed: reel.embed,
    caption: reel.caption,
    thumbnailUrl: `/api/instagram/thumbnail/${reel.id}`,
    title: reel.caption,
    authorName: null,
  }))
}
