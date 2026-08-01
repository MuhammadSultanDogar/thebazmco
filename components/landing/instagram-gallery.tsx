import Image from "next/image"
import { Instagram, Play } from "lucide-react"
import type { ReelPreview } from "@/lib/instagram/reels"

type InstagramGalleryProps = {
  reels: ReelPreview[]
}

export function InstagramGallery({ reels }: InstagramGalleryProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
      {reels.map((reel) => (
        <div
          key={reel.id}
          className="reel-card group rounded-2xl overflow-hidden bg-white border border-primary/15 shadow-sm hover:shadow-md hover:shadow-primary/10 transition-shadow"
        >
          <a
            href={reel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative aspect-[9/16] bg-secondary overflow-hidden"
            aria-label={`Watch reel: ${reel.caption}`}
          >
            <Image
              src={reel.thumbnailUrl}
              alt={reel.caption}
              fill
              unoptimized
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5 pointer-events-none" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="flex items-center justify-center w-11 h-11 rounded-full bg-white/95 text-primary shadow-lg group-hover:scale-105 transition-transform">
                <Play className="w-5 h-5 fill-primary ml-0.5" />
              </span>
            </div>
          </a>
          <a
            href={reel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 bg-white border-t border-primary/10 text-xs font-semibold text-primary hover:bg-secondary transition-colors"
          >
            <Instagram className="w-3.5 h-3.5" />
            View on Instagram
          </a>
        </div>
      ))}
    </div>
  )
}
