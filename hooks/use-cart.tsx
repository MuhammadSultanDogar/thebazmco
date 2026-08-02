"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { CartItem } from "@/lib/types/order"
import type { MascotProduct } from "@/lib/types/mascot"
import { calculateOrderTotals } from "@/lib/constants/payment"
import { isProductSoldOut } from "@/lib/utils/product-availability"
import { calculatePreOrderPayment } from "@/lib/utils/pre-order-payment"
import { DEFAULT_PRE_ORDER } from "@/lib/types/pre-order"
import type { PreOrderSettings } from "@/lib/types/pre-order"

type CartContextValue = {
  items: CartItem[]
  itemCount: number
  subtotal: number
  shipping: number
  total: number
  freeShipping: boolean
  amountToFreeShipping: number
  preOrder: PreOrderSettings
  mascotUnits: number
  amountDueNow: number
  balanceDue: number
  isPreOrder: boolean
  setPreOrderSettings: (settings: PreOrderSettings) => void
  addItem: (product: MascotProduct) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  checkoutOpen: boolean
  openCheckout: () => void
  closeCheckout: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = "thebazm-cart"

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [preOrder, setPreOrderSettings] = useState<PreOrderSettings>(DEFAULT_PRE_ORDER)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {
      /* ignore */
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    fetch("/api/shop-settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.preOrder) setPreOrderSettings(data.preOrder)
      })
      .catch(() => {
        /* ignore */
      })
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, hydrated])

  const addItem = useCallback((product: MascotProduct) => {
    if (isProductSoldOut(product)) return
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId))
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totals = useMemo(() => calculateOrderTotals(items), [items])
  const itemCount = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items])
  const amountToFreeShipping = Math.max(0, 10000 - totals.subtotal)
  const preOrderPayment = useMemo(
    () => calculatePreOrderPayment(items, preOrder, totals.total),
    [items, preOrder, totals.total],
  )

  const value: CartContextValue = {
    items,
    itemCount,
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    total: totals.total,
    freeShipping: totals.freeShipping,
    amountToFreeShipping,
    preOrder,
    mascotUnits: preOrderPayment.mascotUnits,
    amountDueNow: preOrderPayment.amountDueNow,
    balanceDue: preOrderPayment.balanceDue,
    isPreOrder: preOrderPayment.isPreOrder,
    setPreOrderSettings,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    checkoutOpen,
    openCheckout: () => {
      setIsOpen(false)
      setCheckoutOpen(true)
    },
    closeCheckout: () => setCheckoutOpen(false),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
