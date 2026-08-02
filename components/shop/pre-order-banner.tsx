"use client"

import { CalendarClock, Sparkles } from "lucide-react"
import { formatPrice } from "@/lib/constants/payment"
import { useShopSettings } from "@/hooks/use-shop-settings"
import { formatPreOrderAdvanceLabel } from "@/lib/utils/pre-order-payment"

export function PreOrderBanner() {
  const { preOrder, isReady } = useShopSettings()

  if (!isReady || !preOrder.enabled) return null

  return (
    <div className="mb-6 lg:mb-8 rounded-2xl border-2 border-primary/25 bg-gradient-to-r from-primary/10 via-white to-primary/5 p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <CalendarClock className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="font-display font-bold text-base sm:text-lg text-foreground">
              {preOrder.headline}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              Pre-order
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{preOrder.details}</p>
          <p className="mt-2 text-sm font-semibold text-primary">
            {formatPreOrderAdvanceLabel(1, preOrder.advanceAmount)} advance · Stock in ~{preOrder.etaDays} days · +PKR {formatPrice(preOrder.advanceAmount)} for each extra mascot
          </p>
        </div>
      </div>
    </div>
  )
}
