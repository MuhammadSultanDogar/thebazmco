"use client"

import { useEffect, useRef } from "react"

const IDLE_MS = 30 * 60 * 1000

type ManagerIdleGuardProps = {
  enabled: boolean
  onIdle: () => void
}

export function ManagerIdleGuard({ enabled, onIdle }: ManagerIdleGuardProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onIdleRef = useRef(onIdle)

  useEffect(() => {
    onIdleRef.current = onIdle
  }, [onIdle])

  useEffect(() => {
    if (!enabled) return

    const reset = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        onIdleRef.current()
      }, IDLE_MS)
    }

    reset()

    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ]

    for (const event of events) {
      window.addEventListener(event, reset, { passive: true })
    }

    const onVisibility = () => {
      if (document.visibilityState === "visible") reset()
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      for (const event of events) {
        window.removeEventListener(event, reset)
      }
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [enabled])

  return null
}
