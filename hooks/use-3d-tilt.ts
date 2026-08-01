"use client"

import { useEffect, useRef } from "react"
import { gsap, registerGsap } from "@/lib/gsap"

export function useTilt3D(intensity = 12) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    registerGsap()
    const el = ref.current
    if (!el) return

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      gsap.to(el, {
        rotateY: x * intensity,
        rotateX: -y * intensity,
        duration: 0.4,
        ease: "power2.out",
        transformPerspective: 800,
      })
    }

    const onLeave = () => {
      gsap.to(el, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.6,
        ease: "power3.out",
      })
    }

    el.addEventListener("mousemove", onMove)
    el.addEventListener("mouseleave", onLeave)
    return () => {
      el.removeEventListener("mousemove", onMove)
      el.removeEventListener("mouseleave", onLeave)
    }
  }, [intensity])

  return ref
}

export function useFloat3D() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    registerGsap()
    const el = ref.current
    if (!el) return

    gsap.to(el, {
      y: -18,
      rotateY: 8,
      rotateX: -4,
      duration: 2.8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    })
  }, [])

  return ref
}
