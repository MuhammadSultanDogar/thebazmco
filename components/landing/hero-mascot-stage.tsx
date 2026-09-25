"use client"

import { useRef, type RefObject } from "react"
import { HeroMascot } from "@/components/landing/hero-mascot"
import { useHeroBreakpoint } from "@/hooks/use-hero-breakpoint"
import { useHeroMotion } from "@/hooks/use-hero-motion"

type HeroMascotStageProps = {
  sectionRef: RefObject<HTMLElement | null>
}

export function HeroMascotStage({ sectionRef }: HeroMascotStageProps) {
  const layerRef = useRef<HTMLDivElement>(null)
  const { mascots, enableParallax, breakpoint } = useHeroBreakpoint()

  useHeroMotion(sectionRef, layerRef, {
    enabled: true,
    enableParallax,
  })

  return (
    <div
      ref={layerRef}
      className="hero-mascot-stage relative h-full w-full overflow-hidden"
      aria-hidden
    >
      <div className="hero-sky absolute inset-0" />
      <div className="hero-cloud hero-cloud-a" />
      <div className="hero-cloud hero-cloud-b" />
      <div className="hero-cloud hero-cloud-c" />
      <div className="hero-ground-glow" />

      <div
        className={`hero-mascot-canvas relative mx-auto h-full w-full ${
          breakpoint === "mobile"
            ? "max-w-[430px]"
            : breakpoint === "tablet"
              ? "max-w-[920px]"
              : "max-w-[1280px]"
        }`}
      >
        {mascots.map((mascot) => (
          <HeroMascot key={`${breakpoint}-${mascot.id}`} config={mascot} />
        ))}
      </div>

      <div className="hero-stage-scrim pointer-events-none absolute inset-0" />
    </div>
  )
}
