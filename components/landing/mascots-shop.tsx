"use client"

import Image from "next/image"
import { ShoppingCart, Sparkles, Package, Zap, Truck, CreditCard } from "lucide-react"
import useSWR from "swr"
import type { MascotProduct } from "@/lib/types/mascot"
import { DEFAULT_PRODUCTS, getProductEmoji } from "@/lib/constants/products"
import { FREE_SHIPPING_THRESHOLD, formatPrice, PAYMENT_DETAILS } from "@/lib/constants/payment"
import { CONTACT_EMAIL } from "@/lib/constants/contact"
import { ScrollReveal } from "@/components/landing/scroll-reveal"
import { useCart } from "@/hooks/use-cart"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function ProductCard({ product }: { product: MascotProduct }) {
  const { addItem } = useCart()
  const emoji = getProductEmoji(product.id, product.category)

  return (
    <article
      className={`group flex flex-col rounded-2xl overflow-hidden bg-white border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        product.featured
          ? "border-primary shadow-lg shadow-primary/15"
          : "border-primary/10 hover:border-primary/40 hover:shadow-primary/10"
      }`}
    >
      <div className="h-1.5 bg-primary w-full" />

      {product.featured && (
        <div className="px-4 pt-3">
          <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            <Sparkles className="w-3 h-3" />
            Best Seller
          </span>
        </div>
      )}

      <div className="relative aspect-[4/3] bg-secondary mx-4 mt-3 rounded-xl overflow-hidden border border-primary/10">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            unoptimized={product.image.startsWith("data:image/")}
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span className="text-5xl sm:text-6xl drop-shadow-sm">{emoji}</span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
              @thebazm.co
            </span>
          </div>
        )}
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
              Price
            </p>
            <p className="font-display text-xl sm:text-2xl font-bold text-primary">
              {product.price} <span className="text-sm font-semibold text-muted-foreground">PKR</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => addItem(product)}
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:brightness-105 transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </article>
  )
}

function ProductGrid({
  title,
  subtitle,
  products,
  icon: Icon,
}: {
  title: string
  subtitle: string
  products: MascotProduct[]
  icon: typeof ShoppingCart
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
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

export function MascotsShop() {
  const { data: products } = useSWR<MascotProduct[]>("/api/mascots", fetcher, {
    fallbackData: DEFAULT_PRODUCTS,
    revalidateOnFocus: false,
  })

  const list = products ?? DEFAULT_PRODUCTS
  const mascots = list.filter((p) => (p.category || "mascot") === "mascot")
  const accessories = list.filter((p) => p.category === "accessory")

  return (
    <section id="mascots" className="py-8 sm:py-16 lg:py-24 bg-secondary/50 border-b border-primary/10 scroll-mt-20 sm:scroll-mt-24">
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
                <span>Free shipping on orders <strong>above PKR {formatPrice(FREE_SHIPPING_THRESHOLD)}</strong></span>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-medium">
                <CreditCard className="w-4 h-4 shrink-0" />
                <span>100% advance payment required</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ProductGrid
          title="Inflatable Mascots"
          subtitle="Gorillas, pandas, teddies & more"
          products={mascots}
          icon={ShoppingCart}
        />

        <ProductGrid
          title="Accessories"
          subtitle="Batteries, chargers & connectors"
          products={accessories}
          icon={Zap}
        />

        <ScrollReveal className="mt-8 p-5 rounded-2xl bg-white border-2 border-primary/15">
          <p className="text-sm font-bold text-primary mb-2">Payment & Contact</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {PAYMENT_DETAILS.accountName}</p>
            <p><span className="text-muted-foreground">Bank:</span> UBL</p>
            <p><span className="text-muted-foreground">Account:</span> <strong className="text-primary">{PAYMENT_DETAILS.accountNumber}</strong></p>
            <p>
              <span className="text-muted-foreground">Email:</span>{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary font-medium hover:underline">{CONTACT_EMAIL}</a>
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
