"use client"

import useSWR from "swr"
import type { MascotProduct } from "@/lib/types/mascot"
import { DEFAULT_PRODUCTS } from "@/lib/constants/products"
import { useShopSettings } from "@/hooks/use-shop-settings"
import { hasPreOrderProducts } from "@/lib/utils/pre-order"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function StatsStrip() {
  const { preOrder } = useShopSettings()
  const { data: products } = useSWR<MascotProduct[]>("/api/mascots", fetcher, {
    fallbackData: DEFAULT_PRODUCTS,
    revalidateOnFocus: false,
  })

  const list = products ?? DEFAULT_PRODUCTS
  const showPreOrderStat = hasPreOrderProducts(list, preOrder)

  const stats = [
    { value: "Nationwide", label: "Delivery Across Pakistan" },
    { value: "Shop", label: "Inflatable Mascots & Accessories" },
    showPreOrderStat
      ? {
          value: preOrder.advanceAmount >= 1000 ? `${preOrder.advanceAmount / 1000}k` : String(preOrder.advanceAmount),
          label: "Pre-order Advance Per Mascot",
        }
      : { value: "100%", label: "Advance Before Dispatch" },
    { value: "24/7", label: "WhatsApp Order Support" },
  ]

  return (
    <div className="hidden md:block border-y border-primary/15 bg-secondary py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-4 rounded-2xl bg-white border border-primary/10 shadow-sm"
            >
              <p className="font-display text-2xl sm:text-3xl font-bold text-primary mb-1">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
