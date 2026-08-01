"use client"

import Image from "next/image"
import useSWR from "swr"
import { Plus, Sparkles, Zap } from "lucide-react"
import type { MascotProduct } from "@/lib/types/mascot"
import { DEFAULT_PRODUCTS } from "@/lib/constants/products"
import { getProductPrimaryImage } from "@/lib/utils/product-images"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function CheckoutAccessoryUpsell() {
  const { items, addItem } = useCart()
  const { data: products } = useSWR<MascotProduct[]>("/api/mascots", fetcher, {
    fallbackData: DEFAULT_PRODUCTS,
    revalidateOnFocus: false,
  })

  const list = products ?? DEFAULT_PRODUCTS
  const cartIds = new Set(items.map((i) => i.product.id))
  const hasMascot = items.some((i) => (i.product.category || "mascot") === "mascot")

  const suggestions = list.filter(
    (p) =>
      p.active &&
      p.category === "accessory" &&
      !cartIds.has(p.id),
  )

  if (!hasMascot || suggestions.length === 0) return null

  return (
    <div className="p-4 rounded-xl bg-secondary border border-primary/15 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <p className="font-bold text-sm text-foreground">Complete your setup</p>
          <p className="text-xs text-muted-foreground">
            Add batteries, chargers & connectors before checkout
          </p>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        {suggestions.map((product) => {
          const image = getProductPrimaryImage(product)
          return (
            <div
              key={product.id}
              className="shrink-0 w-[140px] rounded-xl border border-primary/15 bg-white overflow-hidden"
            >
              <div className="relative aspect-square bg-secondary">
                {image ? (
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    unoptimized={image.startsWith("data:image/")}
                    className="object-cover"
                    sizes="140px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-2xl">
                    ⚡
                  </div>
                )}
                {product.featured && (
                  <Sparkles className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-primary" />
                )}
              </div>
              <div className="p-2.5 space-y-2">
                <p className="text-xs font-semibold leading-tight line-clamp-2 min-h-[2rem]">
                  {product.name}
                </p>
                <p className="text-xs font-bold text-primary">PKR {product.price}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full h-8 text-xs font-bold rounded-lg gap-1"
                  onClick={() => addItem(product)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
