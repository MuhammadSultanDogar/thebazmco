"use client"

import { useEffect, useState } from "react"
import type { HeroMascotConfig } from "@/lib/constants/hero-mascots"
import {
  getHeroMascotsForWidth,
  HERO_MASCOTS_DESKTOP,
  HERO_MASCOTS_MOBILE,
  HERO_MASCOTS_TABLET,
} from "@/lib/constants/hero-mascots"

export type HeroBreakpoint = "mobile" | "tablet" | "desktop"

function widthToBreakpoint(width: number): HeroBreakpoint {
  if (width >= 1200) return "desktop"
  if (width >= 768) return "tablet"
  return "mobile"
}

export function useHeroBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<HeroBreakpoint>("mobile")
  const [mascots, setMascots] = useState<HeroMascotConfig[]>(HERO_MASCOTS_MOBILE)
  const [enableParallax, setEnableParallax] = useState(true)

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth
      setBreakpoint(widthToBreakpoint(width))
      setMascots(getHeroMascotsForWidth(width))
      setEnableParallax(width >= 1024)
    }

    update()
    window.addEventListener("resize", update, { passive: true })
    return () => window.removeEventListener("resize", update)
  }, [])

  return { breakpoint, mascots, enableParallax }
}

export function getInitialHeroMascots(): HeroMascotConfig[] {
  if (typeof window === "undefined") return HERO_MASCOTS_DESKTOP
  return getHeroMascotsForWidth(window.innerWidth)
}

export { HERO_MASCOTS_MOBILE, HERO_MASCOTS_TABLET }
