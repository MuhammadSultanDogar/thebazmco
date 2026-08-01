"use client"

import Image from "next/image"
import { MessageCircle, Instagram, ArrowDown, ShoppingBag, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-b from-secondary/80 via-white to-white">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <p className="inline-flex items-center gap-2 text-primary text-xs sm:text-sm font-semibold tracking-wide uppercase mb-5 px-4 py-2 rounded-full bg-white border border-primary/20 shadow-sm">
              <ShoppingBag className="w-3.5 h-3.5" />
              Shop · Perform · Entertain
            </p>

            <h1 className="headline-display text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] mb-5">
              <span className="block text-primary">Inflatable</span>
              <span className="block text-foreground">Mascots</span>
              <span className="block text-muted-foreground text-3xl sm:text-4xl md:text-[2.75rem] mt-1 font-semibold">
                & Gorilla Shows
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
              Buy premium inflatable mascots or book live gorilla performances —
              delivered across all cities in Pakistan.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
              <a
                href="#mascots"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary text-primary-foreground font-bold rounded-full shadow-md shadow-primary/25 hover:brightness-105 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                Shop Mascots
              </a>
              <a
                href="#performance"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-primary font-bold rounded-full border-2 border-primary/30 hover:bg-secondary transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Book Performance
              </a>
            </div>

            <div className="flex flex-wrap gap-5 justify-center lg:justify-start text-sm">
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

          <div className="relative flex justify-center">
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

      <a
        href="#mascots"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-primary/70 hover:text-primary transition-colors"
        aria-label="Scroll to shop"
      >
        <span className="text-[10px] tracking-widest uppercase font-semibold">Shop</span>
        <ArrowDown className="w-4 h-4 animate-bounce" />
      </a>
    </section>
  )
}
