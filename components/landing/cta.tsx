"use client"

import { MessageCircle } from "lucide-react"
import { ScrollReveal } from "@/components/landing/scroll-reveal"

export function CTA() {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-br from-primary to-[#7e22ce] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal className="max-w-3xl mx-auto text-center">
          <h2 className="headline-display text-3xl sm:text-4xl md:text-5xl mb-6 text-primary-foreground text-balance">
            Ready to Make Your Event Unforgettable?
          </h2>

          <p className="text-lg text-primary-foreground/80 mb-10 max-w-xl mx-auto text-pretty">
            Book a gorilla performance or order an inflatable mascot — we&apos;re one WhatsApp message away.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/923255105062"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-primary font-semibold text-lg rounded-full transition-all duration-200 hover:scale-[1.02] shadow-xl"
            >
              <MessageCircle className="w-6 h-6" />
              Chat on WhatsApp
            </a>
            <a
              href="#mascots"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/15 text-primary-foreground font-semibold text-lg rounded-xl border-2 border-white/30 transition-all duration-200 hover:bg-white/25"
            >
              Browse Mascots
            </a>
          </div>

          <p className="mt-8 text-sm text-primary-foreground/60">
            Typically responds within 1 hour
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
