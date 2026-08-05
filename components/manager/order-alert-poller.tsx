"use client"

import { useEffect, useRef, useCallback } from "react"
import type { ShopOrder } from "@/lib/types/order"
import { formatPrice } from "@/lib/constants/payment"

type OrderAlertPollerProps = {
  onNewOrder?: (order: ShopOrder) => void
  onPendingCount?: (count: number) => void
  pollMs?: number
}

function notifyNewOrder(order: ShopOrder) {
  if (typeof window === "undefined" || !("Notification" in window)) return
  if (Notification.permission !== "granted") return

  const body = `${order.customerPhone} · PKR ${formatPrice(order.amountDueNow ?? order.total)}`

  try {
    new Notification(`New order ${order.orderNumber}`, {
      body,
      icon: "/icon-192.png",
      tag: order.id,
    })
  } catch {
    /* ignore */
  }
}

export function OrderAlertPoller({
  onNewOrder,
  onPendingCount,
  pollMs = 45_000,
}: OrderAlertPollerProps) {
  const knownIds = useRef<Set<string>>(new Set())
  const ready = useRef(false)

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" })
      if (!res.ok) return

      const orders: ShopOrder[] = await res.json()
      const pending = orders.filter((o) => o.status === "pending_review").length
      onPendingCount?.(pending)

      if (!ready.current) {
        knownIds.current = new Set(orders.map((o) => o.id))
        ready.current = true
        return
      }

      for (const order of orders) {
        if (knownIds.current.has(order.id)) continue
        if (order.status === "pending_review") {
          notifyNewOrder(order)
          onNewOrder?.(order)
        }
      }

      knownIds.current = new Set(orders.map((o) => o.id))
    } catch {
      /* silent */
    }
  }, [onNewOrder, onPendingCount])

  useEffect(() => {
    void poll()
    const timer = setInterval(() => void poll(), pollMs)
    return () => clearInterval(timer)
  }, [poll, pollMs])

  return null
}

export function requestOrderAlertPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return Promise.resolve(false)
  }
  if (Notification.permission === "granted") return Promise.resolve(true)
  if (Notification.permission === "denied") return Promise.resolve(false)
  return Notification.requestPermission().then((p) => p === "granted")
}
