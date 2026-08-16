"use client"

import type { ReactNode } from "react"
import type { PreOrderSettings } from "@/lib/types/pre-order"
import type { ShippingSettings } from "@/lib/types/shipping-settings"
import { CartProvider } from "@/hooks/use-cart"
import { ShopSettingsProvider } from "@/components/providers/shop-settings-provider"
import { CartDrawer } from "@/components/shop/cart-drawer"
import { CheckoutDialog } from "@/components/shop/checkout-dialog"

export function AppProviders({
  initialPreOrder,
  initialShippingSettings,
  children,
}: {
  initialPreOrder: PreOrderSettings
  initialShippingSettings: ShippingSettings
  children: ReactNode
}) {
  return (
    <ShopSettingsProvider
      initialPreOrder={initialPreOrder}
      initialShippingSettings={initialShippingSettings}
    >
      <CartProvider>
        {children}
        <CartDrawer />
        <CheckoutDialog />
      </CartProvider>
    </ShopSettingsProvider>
  )
}
