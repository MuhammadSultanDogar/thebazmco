"use client"

import { useEffect, useRef, useCallback } from "react"
import type { ShopOrder } from "@/lib/types/order"
import { formatPrice } from "@/lib/constants/payment"

type OrderAlertPollerProps = {
  enabled?: boolean
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
  enabled = true,
  onNewOrder,
  onPendingCount,
  pollMs = 300_000,
}: OrderAlertPollerProps) {
  const knownIds = useRef<Set<string>>(new Set())
  const ready = useRef(false)

  const poll = useCallback(async () => {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      return
    }

    try {
      const res = await fetch("/api/orders?mode=alerts", { cache: "no-store" })
      if (!res.ok) return

      const data: {
        pendingCount: number
        orders: Pick<
          ShopOrder,
          "id" | "orderNumber" | "status" | "customerPhone" | "total" | "amountDueNow"
        >[]
      } = await res.json()

      onPendingCount?.(data.pendingCount)

      if (!ready.current) {
        knownIds.current = new Set(data.orders.map((o) => o.id))
        ready.current = true
        return
      }

      for (const order of data.orders) {
        if (knownIds.current.has(order.id)) continue
        if (order.status === "pending_review") {
          notifyNewOrder(order as ShopOrder)
          onNewOrder?.(order as ShopOrder)
        }
      }

      knownIds.current = new Set(data.orders.map((o) => o.id))
    } catch {
      /* silent */
    }
  }, [onNewOrder, onPendingCount])

  useEffect(() => {
    if (!enabled) return

    void poll()

    const timer = setInterval(() => void poll(), pollMs)

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void poll()
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [poll, pollMs, enabled])

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
