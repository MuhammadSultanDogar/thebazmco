"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import type { MascotProduct } from "@/lib/types/mascot"
import { parseProductPath } from "@/lib/utils/product-slug"
import {
  closeProductUrl,
  pushProductUrl,
  scrollToShop,
  syncProductFromBrowserUrl,
} from "@/lib/utils/product-url-sync"

/**
 * Opens/closes the product modal while syncing the shareable URL via
 * history.pushState — avoids Next.js route navigation and page remounts.
 */
export function useProductUrlModal(products: MascotProduct[]) {
  const pathname = usePathname()
  const [detailProduct, setDetailProduct] = useState<MascotProduct | null>(null)
  const clientNavRef = useRef(false)
  const initializedRef = useRef(false)

  // Direct visit to /mascots/slug or /accessories/slug (full page load)
  useEffect(() => {
    if (!products.length || initializedRef.current) return

    const fromNextPath = parseProductPath(pathname)
    const fromBrowserPath = parseProductPath(window.location.pathname)
    if (!fromNextPath && !fromBrowserPath) {
      initializedRef.current = true
      return
    }

    initializedRef.current = true
    const product = syncProductFromBrowserUrl(products)
    if (product) {
      setDetailProduct(product)
      scrollToShop()
    }
  }, [products, pathname])

  // Browser back / forward
  useEffect(() => {
    const onPopState = () => {
      const product = syncProductFromBrowserUrl(products)
      setDetailProduct(product)
      clientNavRef.current = product !== null
    }

    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [products])

  const openProduct = useCallback((product: MascotProduct) => {
    setDetailProduct(product)
    pushProductUrl(product)
    clientNavRef.current = true
  }, [])

  const closeProduct = useCallback(() => {
    setDetailProduct(null)
    const wasClientNav = clientNavRef.current
    clientNavRef.current = false
    closeProductUrl(wasClientNav)
  }, [])

  return { detailProduct, openProduct, closeProduct }
}
