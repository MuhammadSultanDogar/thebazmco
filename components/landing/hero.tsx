"use client"

import Image from "next/image"
import Link from "next/link"
import { MessageCircle, Instagram, ShoppingBag, Sparkles, Play } from "lucide-react"
import { INSTAGRAM_REELS } from "@/lib/constants/instagram"

const HOOK_REEL = INSTAGRAM_REELS[0]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white lg:min-h-[90vh] lg:flex lg:items-center">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5f0ff] via-white to-white lg:from-secondary/50" />
        <div className="absolute top-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-[4.5rem] pb-6 lg:pt-24 lg:pb-16">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className="flex items-start justify-between gap-3 lg:block">
              <div className="flex-1 min-w-0">
                <p className="inline-flex items-center gap-1.5 text-primary text-[10px] sm:text-xs font-semibold tracking-wide uppercase mb-3 px-3 py-1.5 rounded-full bg-white border border-primary/15 shadow-sm">
                  <ShoppingBag className="w-3 h-3" />
                  Shop · Perform
                </p>

                <h1 className="headline-display text-[1.75rem] leading-tight sm:text-5xl md:text-6xl lg:text-[4rem] mb-3 lg:mb-5">
                  <span className="block text-primary lg:inline lg:mr-2">Inflatable</span>
                  <span className="block text-foreground lg:inline">Mascots</span>
                  <span className="hidden lg:block text-muted-foreground text-3xl sm:text-4xl md:text-[2.75rem] mt-1 font-semibold">
                    & Gorilla Shows
                  </span>
                  <span className="lg:hidden block text-muted-foreground text-lg font-semibold mt-0.5">
                    & Gorilla Shows
                  </span>
                </h1>
              </div>

              <Link
                href={HOOK_REEL.url}
                target="_blank"
                rel="noopener noreferrer"
                className="lg:hidden relative shrink-0 w-[4.5rem] aspect-[9/14] rounded-xl overflow-hidden border-2 border-primary/20 shadow-md shadow-primary/10"
                aria-label="Watch our story on Instagram"
              >
                <Image
                  src={`/api/instagram/thumbnail/${HOOK_REEL.id}`}
                  alt="TheBazm reel"
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="72px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-white/95 flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 fill-primary text-primary ml-px" />
                </span>
              </Link>
            </div>

            <p className="hidden sm:block text-base sm:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-6 lg:mb-8 leading-relaxed">
              Buy premium inflatable mascots or book live gorilla performances —
              delivered across all cities in Pakistan.
            </p>

            <div className="flex flex-row gap-2 sm:gap-3 justify-center lg:justify-start mb-4 lg:mb-8">
              <a
                href="#mascots"
                className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 sm:px-7 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-full shadow-md shadow-primary/20 hover:brightness-105 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                Shop
              </a>
              <a
                href="#performance"
                className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 sm:px-7 py-3 bg-white text-primary text-sm font-bold rounded-full border-2 border-primary/25 hover:bg-secondary transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Book
              </a>
            </div>

            <div className="hidden sm:flex flex-wrap gap-5 justify-center lg:justify-start text-sm">
              <a
                href="https://wa.me/923255105062"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-medium transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                +92 325 5105062
              </a>
              <a
                href="https://instagram.com/thebazm.co"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-medium transition-colors"
              >
                <Instagram className="w-4 h-4" />
                @thebazm.co
              </a>
            </div>
          </div>

          <div className="relative hidden lg:flex justify-center">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 animate-float">
              <div className="absolute inset-0 rounded-3xl bg-white border-2 border-primary/15 shadow-xl shadow-primary/10" />
              <div className="absolute inset-4 rounded-2xl overflow-hidden bg-secondary/50">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO%20SET%20%28THEBAZM.CO%29%20%281%29-Vyn5qZbbAAo85GDoYBp77NHmq9hJWu.png"
                  alt="TheBazm Logo"
                  fill
                  className="object-contain p-5"
                  priority
                />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-5 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-full whitespace-nowrap shadow-md">
                Nationwide Delivery
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
