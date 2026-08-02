"use client"

import type { ReactNode } from "react"
import type { PreOrderSettings } from "@/lib/types/pre-order"
import { CartProvider } from "@/hooks/use-cart"
import { ShopSettingsProvider } from "@/components/providers/shop-settings-provider"
import { CartDrawer } from "@/components/shop/cart-drawer"
import { CheckoutDialog } from "@/components/shop/checkout-dialog"

export function AppProviders({
  initialPreOrder,
  children,
}: {
  initialPreOrder: PreOrderSettings
  children: ReactNode
}) {
  return (
    <ShopSettingsProvider initialPreOrder={initialPreOrder}>
      <CartProvider>
        {children}
        <CartDrawer />
        <CheckoutDialog />
      </CartProvider>
    </ShopSettingsProvider>
  )
}
