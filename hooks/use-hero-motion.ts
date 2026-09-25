"use client"

import { useEffect, type RefObject } from "react"

type UseHeroMotionOptions = {
  enabled: boolean
  enableParallax: boolean
}

export function useHeroMotion(
  sectionRef: RefObject<HTMLElement | null>,
  mascotLayerRef: RefObject<HTMLElement | null>,
  { enabled, enableParallax }: UseHeroMotionOptions,
) {
  useEffect(() => {
    if (!enabled) return

    const section = sectionRef.current
    const layer = mascotLayerRef.current
    if (!section || !layer) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reducedMotion) return

    const nodes = Array.from(
      layer.querySelectorAll<HTMLElement>("[data-hero-mascot]"),
    )

    let raf = 0
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let scrollProgress = 0

    const onMouseMove = (event: MouseEvent) => {
      if (!enableParallax) return
      const rect = section.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2
    }

    const onScroll = () => {
      const rect = section.getBoundingClientRect()
      const total = Math.max(rect.height, 1)
      scrollProgress = Math.min(Math.max(-rect.top / total, 0), 1)
    }

    const tick = () => {
      currentX += (targetX - currentX) * 0.07
      currentY += (targetY - currentY) * 0.07

      for (const node of nodes) {
        const parallax = Number(node.dataset.parallaxStrength ?? 0)
        const scrollFactor = Number(node.dataset.scrollFactor ?? 0)
        const maxMove = 8 + parallax * 12

        const px = enableParallax ? currentX * maxMove : 0
        const py = enableParallax ? currentY * maxMove * 0.75 : 0
        const scrollY = scrollProgress * scrollFactor * 48
        const fade = 1 - scrollProgress * 0.35
        const scale = 1 - scrollProgress * 0.04

        node.style.setProperty("--hero-px", `${px.toFixed(2)}px`)
        node.style.setProperty("--hero-py", `${py.toFixed(2)}px`)
        node.style.setProperty("--hero-scroll", `${scrollY.toFixed(2)}px`)
        node.style.setProperty("--hero-fade", fade.toFixed(3))
        node.style.setProperty("--hero-scale", scale.toFixed(3))
      }

      raf = requestAnimationFrame(tick)
    }

    onScroll()
    raf = requestAnimationFrame(tick)

    if (enableParallax) {
      window.addEventListener("mousemove", onMouseMove, { passive: true })
    }
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("scroll", onScroll)
    }
  }, [enabled, enableParallax, sectionRef, mascotLayerRef])
}
