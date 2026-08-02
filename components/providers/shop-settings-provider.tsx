"use client"

import {
  createContext,
  useContext,
  type ReactNode,
} from "react"
import useSWR from "swr"
import type { PreOrderSettings } from "@/lib/types/pre-order"
import { DEFAULT_PRE_ORDER } from "@/lib/types/pre-order"

type ShopSettingsContextValue = {
  preOrder: PreOrderSettings
  isReady: boolean
  refresh: () => void
}

const ShopSettingsContext = createContext<ShopSettingsContextValue | null>(null)

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ShopSettingsProvider({
  initialPreOrder,
  children,
}: {
  initialPreOrder: PreOrderSettings
  children: ReactNode
}) {
  const { data, mutate } = useSWR<{ preOrder: PreOrderSettings }>(
    "/api/shop-settings",
    fetcher,
    {
      fallbackData: { preOrder: initialPreOrder },
      revalidateOnFocus: true,
      keepPreviousData: true,
    },
  )

  const preOrder = data?.preOrder ?? initialPreOrder

  return (
    <ShopSettingsContext.Provider
      value={{
        preOrder,
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
      isReady: false,
      refresh: () => {},
    }
  }
  return ctx
}
