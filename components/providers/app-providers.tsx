"use client"

import { CartProvider } from "@/hooks/use-cart"
import { CartDrawer } from "@/components/shop/cart-drawer"
import { CheckoutDialog } from "@/components/shop/checkout-dialog"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
      <CheckoutDialog />
    </CartProvider>
  )
}
