"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ShoppingCart, Sparkles, X } from "lucide-react"
import type { MascotProduct } from "@/lib/types/mascot"
import { getProductEmoji } from "@/lib/constants/products"
import { getProductImages } from "@/lib/utils/product-images"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type ProductDetailModalProps = {
  product: MascotProduct | null
  open: boolean
  onClose: () => void
  onAddToCart: (product: MascotProduct) => void
}

export function ProductDetailModal({
  product,
  open,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!product) return null

  const images = getProductImages(product)
  const emoji = getProductEmoji(product.id, product.category)
  const hasImages = images.length > 0
  const safeIndex = hasImages ? Math.min(activeIndex, images.length - 1) : 0

  const goPrev = () => {
    if (!hasImages) return
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  }

  const goNext = () => {
    if (!hasImages) return
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1))
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose()
          setActiveIndex(0)
        }
      }}
    >
      <DialogContent className="max-w-3xl w-[calc(100%-1.5rem)] p-0 gap-0 overflow-hidden rounded-2xl">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>

        <div className="relative bg-secondary">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/95 shadow-md border border-primary/10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden bg-secondary">
            {hasImages ? (
              <>
                <Image
                  src={images[safeIndex]}
                  alt={`${product.name} photo ${safeIndex + 1}`}
                  fill
                  unoptimized={images[safeIndex].startsWith("data:image/")}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                />
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow border border-primary/10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow border border-primary/10"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveIndex(i)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            i === safeIndex ? "bg-primary w-5" : "bg-white/80"
                          }`}
                          aria-label={`View image ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <span className="text-7xl">{emoji}</span>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">
                  @thebazm.co
                </span>
              </div>
            )}

            {product.featured && (
              <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
                <Sparkles className="w-3 h-3" />
                Best Seller
              </span>
            )}
          </div>

          {hasImages && images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto border-t border-primary/10 bg-white/80">
              {images.map((src, i) => (
                <button
                  key={`${src.slice(0, 24)}-${i}`}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    i === safeIndex ? "border-primary shadow-md" : "border-transparent opacity-70"
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    unoptimized={src.startsWith("data:image/")}
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
              {product.category === "accessory" ? "Accessory" : "Inflatable Mascot"}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">{product.name}</h2>
          </div>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-end justify-between gap-4 pt-2 border-t border-primary/10">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
                Price
              </p>
              <p className="font-display text-3xl font-bold text-primary">
                {product.price}{" "}
                <span className="text-base font-semibold text-muted-foreground">PKR</span>
              </p>
              {product.shipping && product.shipping !== "0" && (
                <p className="text-xs text-muted-foreground mt-1">
                  + PKR {product.shipping} shipping
                </p>
              )}
            </div>
            <Button
              size="lg"
              className="rounded-xl font-bold gap-2 shrink-0"
              onClick={() => {
                onAddToCart(product)
                onClose()
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
