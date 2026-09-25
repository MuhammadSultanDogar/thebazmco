"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { ShoppingBag } from "lucide-react"
import { HERO_DESKTOP, HERO_MOBILE } from "@/lib/constants/hero"

const HEADER_OFFSET = "4.5rem"
const PARALLAX_MAX = 8

export function HeroArtwork() {
  const sectionRef = useRef<HTMLElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const pointer = useRef({ targetX: 0, targetY: 0, currentX: 0, currentY: 0 })
  const reducedMotion = useRef(false)
  const parallaxEnabled = useRef(false)

  useEffect(() => {
    const section = sectionRef.current
    const layer = layerRef.current
    if (!section || !layer) return

    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    parallaxEnabled.current =
      !reducedMotion.current && window.matchMedia("(pointer: fine)").matches

    if (!parallaxEnabled.current) return

    const onPointerMove = (event: MouseEvent) => {
      const rect = section.getBoundingClientRect()
      const nx = (event.clientX - rect.left) / rect.width - 0.5
      const ny = (event.clientY - rect.top) / rect.height - 0.5
      pointer.current.targetX = nx * PARALLAX_MAX
      pointer.current.targetY = ny * PARALLAX_MAX
    }

    const onPointerLeave = () => {
      pointer.current.targetX = 0
      pointer.current.targetY = 0
    }

    const tick = () => {
      pointer.current.currentX +=
        (pointer.current.targetX - pointer.current.currentX) * 0.06
      pointer.current.currentY +=
        (pointer.current.targetY - pointer.current.currentY) * 0.06

      layer.style.transform = `translate3d(${pointer.current.currentX}px, ${pointer.current.currentY}px, 0)`

      rafRef.current = requestAnimationFrame(tick)
    }

    section.addEventListener("mousemove", onPointerMove, { passive: true })
    section.addEventListener("mouseleave", onPointerLeave)
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      section.removeEventListener("mousemove", onPointerMove)
      section.removeEventListener("mouseleave", onPointerLeave)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      layer.style.transform = ""
    }
  }, [])

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="hero-section relative isolate w-full overflow-x-hidden"
      aria-label="The Bazm mascot collection"
      style={{ paddingTop: HEADER_OFFSET }}
    >
      {/* Fixed-header clearance — artwork starts below the navbar */}
      <div
        ref={layerRef}
        className="hero-artwork-layer relative z-[1] mx-auto w-full will-change-transform"
      >
        <picture className="hero-picture block w-full">
          <source
            media="(min-width: 768px)"
            srcSet={`${HERO_DESKTOP.src} ${HERO_DESKTOP.width}w`}
            width={HERO_DESKTOP.width}
            height={HERO_DESKTOP.height}
          />
          <img
            src={HERO_MOBILE.src}
            srcSet={`${HERO_MOBILE.src} ${HERO_MOBILE.width}w`}
            alt={HERO_MOBILE.alt}
            width={HERO_MOBILE.width}
            height={HERO_MOBILE.height}
            sizes="(min-width: 768px) 1024px, 100vw"
            className="hero-artwork-img"
            fetchPriority="high"
            decoding="sync"
            draggable={false}
          />
        </picture>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-16 bg-gradient-to-b from-transparent to-[#faf8ff] sm:h-20"
        aria-hidden
      />

      <div className="relative z-[3] flex justify-center px-4 pb-6 pt-3 sm:pb-8">
        <Link
          href="#mascots"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:brightness-105"
        >
          <ShoppingBag className="h-4 w-4" />
          Shop Mascots
        </Link>
      </div>
    </section>
  )
}
