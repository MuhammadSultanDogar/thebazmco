import { Instagram } from "lucide-react"
import { InstagramGallery } from "@/components/landing/instagram-gallery"
import { ScrollReveal } from "@/components/landing/scroll-reveal"
import { fetchReelPreviews } from "@/lib/instagram/reels"

export function Gallery() {
  const reels = fetchReelPreviews()

  return (
    <div id="reels" className="py-16 sm:py-20 bg-white border-t border-primary/10 scroll-mt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-2">
              @thebazm.co
            </p>
            <h3 className="headline-display text-2xl sm:text-3xl md:text-4xl">
              Performance Reels
            </h3>
            <div className="line-accent max-w-[60px] mt-3" />
          </div>
          <a
            href="https://instagram.com/thebazm.co"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline shrink-0"
          >
            <Instagram className="w-4 h-4" />
            Follow for more
          </a>
        </ScrollReveal>

        <InstagramGallery reels={reels} />
      </div>
    </div>
  )
}
