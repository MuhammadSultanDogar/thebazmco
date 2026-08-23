"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import type { MascotProduct } from "@/lib/types/mascot"
import { findProductBySlug, parseProductPath } from "@/lib/utils/product-slug"
import {
  closeProductUrl,
  pushProductUrl,
  scrollToShop,
  syncProductFromBrowserUrl,
} from "@/lib/utils/product-url-sync"

function mergeFreshProduct(
  current: MascotProduct | null,
  next: MascotProduct | null,
): MascotProduct | null {
  if (!next) return null
  if (!current || current.id !== next.id) return next

  const currentImages = current.images?.length ?? (current.image ? 1 : 0)
  const nextImages = next.images?.length ?? (next.image ? 1 : 0)

  if (
    current.image !== next.image ||
    currentImages !== nextImages ||
    current.price !== next.price ||
    current.name !== next.name ||
    current.description !== next.description ||
    current.soldOut !== next.soldOut ||
    current.preOrder !== next.preOrder
  ) {
    return next
  }

  return current
}

/**
 * Opens/closes the product modal while syncing the shareable URL via
 * history.pushState — avoids Next.js route navigation and page remounts.
 */
export function useProductUrlModal(
  products: MascotProduct[],
  initialOpenProduct?: MascotProduct | null,
) {
  const pathname = usePathname()
  const [detailProduct, setDetailProduct] = useState<MascotProduct | null>(
    initialOpenProduct ?? null,
  )
  const clientNavRef = useRef(false)
  const didScrollForDirectLink = useRef(false)

  const openFromUrl = useCallback(
    (shouldScroll: boolean) => {
      const product = syncProductFromBrowserUrl(products)
      if (!product) return false

      setDetailProduct((current) => mergeFreshProduct(current, product))

      if (shouldScroll && !didScrollForDirectLink.current) {
        didScrollForDirectLink.current = true
        scrollToShop()
      }

      return true
    },
    [products],
  )

  // Keep trying until catalog has loaded (fixes new manager products + direct links)
  useEffect(() => {
    const parsed =
      parseProductPath(pathname) ?? parseProductPath(window.location.pathname)
    if (!parsed) return

    openFromUrl(true)
  }, [pathname, products, openFromUrl])

  // Refresh open modal when catalog updates (images, prices, etc.)
  useEffect(() => {
    setDetailProduct((current) => {
      if (!current) return current
      const fresh = products.find((p) => p.id === current.id)
      if (!fresh) return current
      return mergeFreshProduct(current, fresh)
    })
  }, [products])

  // Server provided product on /mascots/slug pages
  useEffect(() => {
    if (!initialOpenProduct) return
    setDetailProduct(initialOpenProduct)
    if (!didScrollForDirectLink.current) {
      didScrollForDirectLink.current = true
      scrollToShop()
    }
  }, [initialOpenProduct])

  useEffect(() => {
    const onPopState = () => {
      const parsed = parseProductPath(window.location.pathname)
      if (!parsed) {
        setDetailProduct(null)
        clientNavRef.current = false
        return
      }

      const product = findProductBySlug(products, parsed.category, parsed.slug)
      setDetailProduct(product ?? null)
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
