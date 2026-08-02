"use client"

import type { MascotProduct } from "@/lib/types/mascot"
import { useShopSettings } from "@/hooks/use-shop-settings"

export function ProductPrice({
  product,
  size = "md",
}: {
  product: Pick<MascotProduct, "price" | "originalPrice">
  size?: "sm" | "md" | "lg"
}) {
  const { preOrder } = useShopSettings()
  const showCompare =
    preOrder.enabled && product.originalPrice && product.originalPrice !== product.price

  const priceClass =
    size === "lg"
      ? "font-display text-3xl font-bold text-primary"
      : size === "sm"
        ? "font-display text-xl sm:text-2xl font-bold text-primary"
        : "font-display text-xl sm:text-2xl font-bold text-primary"

  const compareClass =
    size === "lg" ? "text-base line-through text-muted-foreground" : "text-sm line-through text-muted-foreground"

  return (
    <div>
      {showCompare && (
        <p className={`${compareClass} mb-0.5`}>
          PKR {product.originalPrice}
        </p>
      )}
      <p className={priceClass}>
        {product.price}{" "}
        <span className="text-sm font-semibold text-muted-foreground">PKR</span>
      </p>
      {showCompare && (
        <p className="text-[10px] uppercase tracking-wider text-primary font-bold mt-1">
          Pre-order price
        </p>
      )}
    </div>
  )
}
