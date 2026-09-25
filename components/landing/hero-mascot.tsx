"use client"

import Image from "next/image"
import type { HeroMascotConfig } from "@/lib/constants/hero-mascots"

type HeroMascotProps = {
  config: HeroMascotConfig
}

export function HeroMascot({ config }: HeroMascotProps) {
  const {
    id,
    src,
    alt,
    zIndex,
    width,
    top,
    left,
    right,
    bottom,
    rotate,
    parallaxStrength,
    scrollFactor,
    animation,
    animationDelay,
    animationDuration,
    priority,
    centerX,
  } = config

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        zIndex,
        top,
        left,
        right,
        bottom,
        width,
        transform: centerX ? "translateX(-50%)" : undefined,
      }}
    >
      <div
        data-hero-mascot={id}
        data-parallax-strength={parallaxStrength}
        data-scroll-factor={scrollFactor}
        className="hero-mascot-root h-full w-full will-change-transform"
        style={{
          ["--hero-rotate" as string]: `${rotate}deg`,
          ["--hero-anim-delay" as string]: `${animationDelay}s`,
          ["--hero-anim-duration" as string]: `${animationDuration}s`,
        }}
      >
        <div className={`hero-mascot-float hero-mascot-${animation} h-full w-full`}>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={Math.round(width * 1.35)}
            className="h-auto w-full select-none object-contain drop-shadow-[0_18px_28px_rgba(15,23,42,0.18)]"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            sizes={`${width}px`}
            draggable={false}
          />
        </div>
      </div>
    </div>
  )
}
