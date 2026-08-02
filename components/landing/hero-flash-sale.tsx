"use client"

import Link from "next/link"
import { Flame, Timer, ArrowRight } from "lucide-react"
import { formatPrice } from "@/lib/constants/payment"
import { useShopSettings } from "@/hooks/use-shop-settings"

export function HeroFlashSale() {
  const { preOrder, isReady } = useShopSettings()

  if (!isReady || !preOrder.enabled) return null

  return (
    <Link
      href="#mascots"
      className="group block mb-4 sm:mb-5 rounded-2xl border-2 border-amber-400/80 bg-gradient-to-r from-amber-500 via-orange-500 to-primary p-[2px] shadow-lg shadow-amber-500/25 animate-pulse hover:animate-none transition-all"
    >
      <div className="rounded-[14px] bg-gradient-to-br from-amber-50 via-white to-primary/5 px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-primary flex items-center justify-center shrink-0 shadow-md">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="font-display font-black text-sm sm:text-base uppercase tracking-wide text-amber-900">
                Flash Pre-order Sale
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-full">
                <Timer className="w-3 h-3" />
                ~{preOrder.etaDays} days left
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-foreground leading-snug">
              Reserve your mascot now — only{" "}
              <span className="text-primary">PKR {formatPrice(preOrder.advanceAmount)} each</span>
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
              Special pre-order prices · Pay PKR {formatPrice(preOrder.advanceAmount)} advance per mascot ·
              We hold your piece until stock lands
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-primary shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
