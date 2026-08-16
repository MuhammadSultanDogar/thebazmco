"use client"

import {
  createContext,
  useContext,
  type ReactNode,
} from "react"
import useSWR from "swr"
import type { PreOrderSettings } from "@/lib/types/pre-order"
import { DEFAULT_PRE_ORDER } from "@/lib/types/pre-order"
import type { ShippingSettings } from "@/lib/types/shipping-settings"
import { DEFAULT_SHIPPING_SETTINGS } from "@/lib/types/shipping-settings"

type ShopSettingsContextValue = {
  preOrder: PreOrderSettings
  shippingSettings: ShippingSettings
  freeShippingMinimum: number
  isReady: boolean
  refresh: () => void
}

const ShopSettingsContext = createContext<ShopSettingsContextValue | null>(null)

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ShopSettingsProvider({
  initialPreOrder,
  initialShippingSettings,
  children,
}: {
  initialPreOrder: PreOrderSettings
  initialShippingSettings: ShippingSettings
  children: ReactNode
}) {
  const { data, mutate } = useSWR<{
    preOrder: PreOrderSettings
    shippingSettings: ShippingSettings
  }>("/api/shop-settings", fetcher, {
    fallbackData: {
      preOrder: initialPreOrder,
      shippingSettings: initialShippingSettings,
    },
    revalidateOnFocus: true,
    keepPreviousData: true,
  })

  const preOrder = data?.preOrder ?? initialPreOrder
  const shippingSettings = data?.shippingSettings ?? initialShippingSettings

  return (
    <ShopSettingsContext.Provider
      value={{
        preOrder,
        shippingSettings,
        freeShippingMinimum: shippingSettings.freeShippingMinimum,
        isReady: true,
        refresh: () => void mutate(),
      }}
    >
      {children}
    </ShopSettingsContext.Provider>
  )
}

export function useShopSettings() {
  const ctx = useContext(ShopSettingsContext)
  if (!ctx) {
    return {
      preOrder: { ...DEFAULT_PRE_ORDER, enabled: false },
      shippingSettings: { ...DEFAULT_SHIPPING_SETTINGS },
      freeShippingMinimum: DEFAULT_SHIPPING_SETTINGS.freeShippingMinimum,
      isReady: false,
      refresh: () => {},
    }
  }
  return ctx
}
