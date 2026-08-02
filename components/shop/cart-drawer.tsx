"use client"

import Image from "next/image"
import { Minus, Plus, ShoppingCart, Trash2, Truck, X } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { getProductPrimaryImage } from "@/lib/utils/product-images"
import { getProductEmoji } from "@/lib/constants/products"
import { formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/constants/payment"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    shipping,
    total,
    freeShipping,
    amountToFreeShipping,
    isPreOrder,
    amountDueNow,
    balanceDue,
    isOpen,
    closeCart,
    openCheckout,
    removeItem,
    updateQuantity,
  } = useCart()

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-5 border-b border-primary/10">
          <SheetTitle className="flex items-center gap-2 font-display">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Your Cart ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="font-medium text-muted-foreground">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mt-1">Add mascots or accessories to get started</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.map(({ product, quantity }) => {
                const image = getProductPrimaryImage(product)
                const emoji = getProductEmoji(product.id, product.category)
                return (
                <div
                  key={product.id}
                  className="flex gap-3 p-3 rounded-xl bg-secondary/60 border border-primary/10"
                >
                  <div className="relative w-14 h-14 rounded-lg bg-white border border-primary/10 overflow-hidden shrink-0">
                    {image ? (
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        unoptimized={image.startsWith("data:image/")}
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xl">
                        {emoji}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{product.name}</p>
                    <p className="text-primary font-bold text-sm">PKR {product.price}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-7 h-7 rounded-lg border border-primary/20 flex items-center justify-center hover:bg-primary/10"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold w-6 text-center">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-7 h-7 rounded-lg border border-primary/20 flex items-center justify-center hover:bg-primary/10"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(product.id)}
                        className="ml-auto p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )})}

              <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 text-sm">
                <div className="flex items-center gap-2 text-primary font-semibold mb-1">
                  <Truck className="w-4 h-4" />
                  {freeShipping ? (
                    <span>Free shipping applied!</span>
                  ) : (
                    <span>
                      Add PKR {formatPrice(amountToFreeShipping)} more for free shipping
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Free delivery on orders above PKR {formatPrice(FREE_SHIPPING_THRESHOLD)}
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-primary/10 space-y-3 bg-white">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">PKR {formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {freeShipping ? (
                      <span className="text-primary">FREE</span>
                    ) : (
                      `PKR ${formatPrice(shipping)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold pt-1 border-t border-primary/10">
                  <span>{isPreOrder ? "Due now (advance)" : "Total (100% Advance)"}</span>
                  <span className="text-primary">PKR {formatPrice(amountDueNow)}</span>
                </div>
                {isPreOrder && balanceDue > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Balance before dispatch</span>
                    <span>PKR {formatPrice(balanceDue)}</span>
                  </div>
                )}
                {isPreOrder && (
                  <p className="text-xs text-primary font-medium">
                    Pre-order total: PKR {formatPrice(total)} (incl. shipping when applicable)
                  </p>
                )}
              </div>
              <Button onClick={openCheckout} className="w-full h-12 font-bold rounded-xl">
                {isPreOrder ? "Reserve with Advance" : "Proceed to Checkout"}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
