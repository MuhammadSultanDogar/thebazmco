"use client"

import Link from "next/link"
import { MessageCircle, ShoppingBag, Sparkles, Theater } from "lucide-react"
import { WHATSAPP_NUMBER } from "@/lib/constants/contact"
import { HeroFlashSale } from "@/components/landing/hero-flash-sale"

type HeroContentProps = {
  layout: "desktop" | "tablet" | "mobile"
}

export function HeroContent({ layout }: HeroContentProps) {
  const isMobile = layout === "mobile"
  const isDesktop = layout === "desktop"

  return (
    <div
      className={`relative z-20 ${
        isMobile
          ? "px-4 pb-5 pt-[5.5rem] sm:px-6"
          : isDesktop
            ? "max-w-xl px-4 sm:px-6 lg:px-8"
            : "max-w-2xl px-6 pt-28"
      }`}
    >
      <HeroFlashSale />

      <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-primary shadow-sm backdrop-blur-sm sm:text-xs">
        <Sparkles className="h-3 w-3" />
        One Stop Solution
      </p>

      <h1 className="headline-display mb-2 text-[2rem] leading-[0.98] sm:text-[2.35rem] lg:text-[3.6rem] xl:text-[4rem]">
        <span className="block font-extrabold tracking-tight text-foreground">THE BAZM.CO</span>
        <span className="mt-2 block text-lg font-semibold tracking-[0.08em] text-primary sm:text-xl lg:text-2xl">
          WE PERFORM &amp; WE SELL
        </span>
      </h1>

      <p
        className={`mb-5 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-lg ${
          isMobile ? "mb-4" : "mb-6"
        }`}
      >
        Premium inflatable mascots, live performances, and nationwide delivery across Pakistan.
        Shop online or book our team for your next event.
      </p>

      <div
        className={`flex flex-wrap gap-2 sm:gap-3 ${
          isMobile ? "mb-4 flex-col" : "mb-6"
        }`}
      >
        <a
          href="#mascots"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:brightness-105 sm:px-6"
        >
          <ShoppingBag className="h-4 w-4" />
          Shop Mascots
        </a>
        <Link
          href="#performance"
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary/20 bg-white/90 px-5 py-3.5 text-sm font-bold text-primary backdrop-blur-sm transition-all hover:bg-white sm:px-6"
        >
          <Theater className="h-4 w-4" />
          Performance
        </Link>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi The Bazm! I'd like to enquire about custom rates.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary/15 bg-white/80 px-5 py-3.5 text-sm font-bold text-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:text-primary sm:px-6"
        >
          <MessageCircle className="h-4 w-4" />
          Custom Rates
        </a>
      </div>

      {!isMobile && (
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground sm:text-sm">
          <span>Premium Mascot Sales</span>
          <span>Event Performances</span>
          <span>Nationwide Delivery</span>
          <span>Custom Characters</span>
        </div>
      )}
    </div>
  )
}
