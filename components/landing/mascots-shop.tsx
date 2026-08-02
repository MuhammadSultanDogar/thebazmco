"use client"

import { useState } from "react"
import { ShoppingCart, Sparkles, Zap, Truck, CreditCard, CalendarClock } from "lucide-react"
import useSWR from "swr"
import type { MascotProduct } from "@/lib/types/mascot"
import { DEFAULT_PRODUCTS, getProductEmoji } from "@/lib/constants/products"
import { FREE_SHIPPING_THRESHOLD, formatPrice, PAYMENT_DETAILS } from "@/lib/constants/payment"
import { CONTACT_EMAIL } from "@/lib/constants/contact"
import { getProductImages, getProductPrimaryImage } from "@/lib/utils/product-images"
import { isProductSoldOut } from "@/lib/utils/product-availability"
import { SmartProductImage } from "@/components/shop/smart-product-image"
import { ScrollReveal } from "@/components/landing/scroll-reveal"
import { ProductDetailModal } from "@/components/shop/product-detail-modal"
import { PreOrderBanner } from "@/components/shop/pre-order-banner"
import { ProductPrice } from "@/components/shop/product-price"
import { useShopSettings } from "@/hooks/use-shop-settings"
import { useCart } from "@/hooks/use-cart"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function ProductImage({
  product,
  className = "",
}: {
  product: MascotProduct
  className?: string
}) {
  const image = getProductPrimaryImage(product)
  const emoji = getProductEmoji(product.id, product.category)
  const imageCount = getProductImages(product).length

  if (!image) {
    return (
      <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 bg-secondary ${className}`}>
        <span className="text-5xl sm:text-6xl drop-shadow-sm">{emoji}</span>
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
          @thebazm.co
        </span>
      </div>
    )
  }

  return (
    <div className={`absolute inset-0 ${className}`}>
      <SmartProductImage
        src={image}
        alt={product.name}
        sizes="(max-width: 768px) 50vw, 25vw"
        containerAspect={4 / 3}
      />
      {imageCount > 1 && (
        <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/55 text-white px-2 py-0.5 rounded-full">
          +{imageCount - 1}
        </span>
      )}
    </div>
  )
}

function ProductCard({
  product,
  onOpen,
}: {
  product: MascotProduct
  onOpen: (product: MascotProduct) => void
}) {
  const { addItem } = useCart()
  const { preOrder } = useShopSettings()
  const soldOut = isProductSoldOut(product)

  return (
    <article
      className={`group flex flex-col rounded-2xl overflow-hidden bg-white border-2 transition-all duration-300 ${
        soldOut
          ? "border-muted opacity-90 cursor-default"
          : "hover:-translate-y-1 hover:shadow-xl cursor-pointer"
      } ${
        !soldOut && product.featured
          ? "border-primary shadow-lg shadow-primary/15"
          : !soldOut
            ? "border-primary/10 hover:border-primary/40 hover:shadow-primary/10"
            : "border-primary/10"
      }`}
      onClick={() => !soldOut && onOpen(product)}
      onKeyDown={(e) => {
        if (soldOut) return
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onOpen(product)
        }
      }}
      role="button"
      tabIndex={soldOut ? -1 : 0}
      aria-disabled={soldOut}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
        {soldOut && (
          <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 bg-foreground/85 text-background text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shadow">
            Sold Out
          </span>
        )}
        {!soldOut && product.featured && (
          <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shadow">
            <Sparkles className="w-3 h-3" />
            Best Seller
          </span>
        )}
        {!soldOut && preOrder.enabled && (
          <span className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shadow">
            <CalendarClock className="w-3 h-3" />
            Pre-order
          </span>
        )}
        <ProductImage product={product} className={soldOut ? "opacity-60 grayscale-[0.35]" : ""} />
      </div>

      <div className="flex flex-col flex-1 p-4 sm:p-5">
        <h3 className="font-display text-base sm:text-lg font-bold mb-1 leading-tight">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-4 flex-1 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-end justify-between gap-2 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
              {preOrder.enabled && !soldOut ? "Pre-order price" : "Price"}
            </p>
            <ProductPrice product={product} size="sm" />
          </div>
        </div>

        {soldOut ? (
          <div className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-muted text-muted-foreground text-sm font-bold rounded-xl border border-border">
            Currently unavailable
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              addItem(product)
            }}
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:brightness-105 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            {preOrder.enabled ? "Pre-order" : "Add to Cart"}
          </button>
        )}
      </div>
    </article>
  )
}

function ProductGrid({
  title,
  subtitle,
  products,
  icon: Icon,
  onOpenProduct,
}: {
  title: string
  subtitle: string
  products: MascotProduct[]
  icon: typeof ShoppingCart
  onOpenProduct: (product: MascotProduct) => void
}) {
  if (products.length === 0) return null

  return (
    <div className="mb-14 last:mb-0">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-primary/10">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-display text-lg sm:text-xl font-bold">{title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <span className="ml-auto text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
          {products.length} items
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onOpen={onOpenProduct} />
        ))}
      </div>
    </div>
  )
}

export function MascotsShop() {
  const [detailProduct, setDetailProduct] = useState<MascotProduct | null>(null)
  const { addItem } = useCart()
  const { preOrder } = useShopSettings()

  const { data: products } = useSWR<MascotProduct[]>("/api/mascots", fetcher, {
    fallbackData: DEFAULT_PRODUCTS,
    revalidateOnFocus: false,
  })

  const list = products ?? DEFAULT_PRODUCTS
  const mascots = list.filter((p) => (p.category || "mascot") === "mascot")
  const accessories = list.filter((p) => p.category === "accessory")

  return (
    <>
      <section id="mascots" className="py-6 sm:py-16 lg:py-24 bg-secondary/50 border-b border-primary/10 scroll-mt-20 sm:scroll-mt-24 -mt-px lg:mt-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="mb-6 lg:mb-10">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-2">
                  01 — Shop
                </p>
                <h2 className="headline-display text-3xl sm:text-4xl md:text-5xl">
                  Mascots & Accessories
                </h2>
                <div className="line-accent max-w-[80px] mt-4" />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-primary/15 text-sm">
                  <Truck className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    Free shipping on orders{" "}
                    <strong>above PKR {formatPrice(FREE_SHIPPING_THRESHOLD)}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-medium">
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>
                    {preOrder.enabled
                      ? `Pre-order: PKR ${formatPrice(preOrder.advanceAmount)} advance to reserve`
                      : "100% advance payment required"}
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <PreOrderBanner />

          <ProductGrid
            title="Inflatable Mascots"
            subtitle="Gorillas, pandas, teddies & more"
            products={mascots}
            icon={ShoppingCart}
            onOpenProduct={setDetailProduct}
          />

          <ProductGrid
            title="Accessories"
            subtitle="Batteries, chargers & connectors"
            products={accessories}
            icon={Zap}
            onOpenProduct={setDetailProduct}
          />

          <ScrollReveal className="mt-8 p-5 rounded-2xl bg-white border-2 border-primary/15">
            <p className="text-sm font-bold text-primary mb-2">Payment & Contact</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
              <p>
                <span className="text-muted-foreground">Name:</span> {PAYMENT_DETAILS.accountName}
              </p>
              <p>
                <span className="text-muted-foreground">Bank:</span> UBL
              </p>
              <p>
                <span className="text-muted-foreground">Account:</span>{" "}
                <strong className="text-primary">{PAYMENT_DETAILS.accountNumber}</strong>
              </p>
              <p>
                <span className="text-muted-foreground">Email:</span>{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-primary font-medium hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <ProductDetailModal
        product={detailProduct}
        open={Boolean(detailProduct)}
        onClose={() => setDetailProduct(null)}
        onAddToCart={addItem}
      />
    </>
  )
}
