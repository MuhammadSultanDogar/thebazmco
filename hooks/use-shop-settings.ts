"use client"

import useSWR from "swr"
import type { PreOrderSettings } from "@/lib/types/pre-order"
import { DEFAULT_PRE_ORDER } from "@/lib/types/pre-order"

type ShopSettingsResponse = {
  preOrder: PreOrderSettings
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useShopSettings() {
  const { data, mutate } = useSWR<ShopSettingsResponse>("/api/shop-settings", fetcher, {
    fallbackData: { preOrder: DEFAULT_PRE_ORDER },
    revalidateOnFocus: true,
  })

  return {
    preOrder: data?.preOrder ?? DEFAULT_PRE_ORDER,
    refresh: mutate,
  }
}
