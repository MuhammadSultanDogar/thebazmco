"use client"

import Image from "next/image"
import Link from "next/link"
import { MessageCircle, Instagram, Sparkles, Play, Mail, ShoppingBag } from "lucide-react"
import { INSTAGRAM_REELS } from "@/lib/constants/instagram"
import {
  CONTACT_EMAIL,
  WHATSAPP_DISPLAY,
  WHATSAPP_NUMBER,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
} from "@/lib/constants/contact"
import { HeroMobileScene } from "@/components/landing/hero-mobile-scene"
import { HeroMobileTicker } from "@/components/landing/hero-mobile-ticker"

const HOOK_REEL = INSTAGRAM_REELS[0]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* ── Mobile: artistic performance-first hero (no shop) ── */}
      <div className="lg:hidden flex flex-col bg-white">
        <div className="relative shrink-0 h-[36vh] min-h-[210px] max-h-[300px] w-full overflow-hidden pt-[4.5rem]">
          <HeroMobileScene />
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-white pointer-events-none z-[1]" />
        </div>

        <div className="relative z-10 flex flex-col px-4 sm:px-6 pb-5 pt-1 bg-white">
          <p className="inline-flex items-center gap-1.5 self-start text-primary text-[10px] font-semibold tracking-[0.18em] uppercase mb-3 px-3 py-1.5 rounded-full bg-white/90 border border-primary/15 shadow-sm backdrop-blur-sm">
            <Sparkles className="w-3 h-3" />
            Live Event Energy
          </p>

          <h1 className="headline-display text-[1.9rem] leading-[1.06] sm:text-[2.1rem] mb-3">
            <span className="block text-primary">Inflatable Mascots</span>
            <span className="block text-muted-foreground text-xl font-semibold mt-0.5">
              & Gorilla Shows
            </span>
          </h1>

          <HeroMobileTicker />

          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Book live performances and shop premium inflatables, delivered across all cities in Pakistan.
          </p>

          <div className="flex flex-col gap-2 mb-3">
            <a
              href="#performance"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-primary text-primary-foreground text-sm font-bold rounded-full shadow-lg shadow-primary/25"
            >
              <Sparkles className="w-4 h-4" />
              Book a Performance
            </a>
            <Link
              href={HOOK_REEL.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white/90 text-primary text-sm font-bold rounded-full border-2 border-primary/20 backdrop-blur-sm"
            >
              <Play className="w-4 h-4 fill-primary" />
              Watch Our Reels
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {WHATSAPP_DISPLAY}
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              Email
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
              @{INSTAGRAM_HANDLE}
            </a>
          </div>
        </div>
      </div>

      {/* ── Desktop: unchanged ── */}
      <div className="hidden lg:block relative lg:min-h-[90vh] lg:flex lg:items-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 via-white to-white" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-left">
              <p className="inline-flex items-center gap-1.5 text-primary text-xs font-semibold tracking-wide uppercase mb-3 px-3 py-1.5 rounded-full bg-white border border-primary/15 shadow-sm">
                <Sparkles className="w-3 h-3" />
                Shop · Perform
              </p>

              <h1 className="headline-display text-[4rem] mb-5">
                <span className="text-primary mr-2">Inflatable</span>
                <span className="text-foreground">Mascots</span>
                <span className="block text-muted-foreground text-[2.75rem] mt-1 font-semibold">
                  & Gorilla Shows
                </span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
                Buy premium inflatable mascots or book live gorilla performances —
                delivered across all cities in Pakistan.
              </p>

              <div className="flex flex-row gap-3 justify-start mb-8">
                <a
                  href="#mascots"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-full shadow-md shadow-primary/20 hover:brightness-105 transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Shop
                </a>
                <a
                  href="#performance"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-white text-primary text-sm font-bold rounded-full border-2 border-primary/25 hover:bg-secondary transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Book
                </a>
              </div>

              <div className="flex flex-wrap gap-5 justify-start text-sm">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  {WHATSAPP_DISPLAY}
                </a>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-medium transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {CONTACT_EMAIL}
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-medium transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  @{INSTAGRAM_HANDLE}
                </a>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="relative w-80 h-80 animate-float">
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
      </div>
    </section>
  )
}
