"use client"

import Image from "next/image"

export function HeroMobileScene() {
  return (
    <div className="relative h-full w-full overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-[#f5f0ff] via-white/80 to-transparent" />
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute top-1/4 -left-10 w-32 h-32 rounded-full bg-accent/15 blur-3xl" />

      <div className="absolute inset-x-0 bottom-0 h-[55%] hero-mobile-grid opacity-30" />

      <div className="absolute inset-0 flex items-center justify-center pb-2">
        <div className="relative w-[min(70vw,240px)] aspect-square perspective-3d">
          <div className="absolute inset-[10%] rounded-full border border-primary/25 hero-mobile-orbit-1" />
          <div className="absolute inset-[20%] rounded-full border-2 border-dashed border-primary/20 hero-mobile-orbit-2" />
          <div className="absolute inset-[4%] rounded-full border border-primary/10 hero-mobile-orbit-3" />

          <div className="absolute left-[4%] top-[30%] w-8 h-8 hero-mobile-cube hero-mobile-float-a">
            <div className="hero-mobile-cube-inner">
              <div className="hero-mobile-cube-face hero-mobile-cube-front" />
              <div className="hero-mobile-cube-face hero-mobile-cube-back" />
              <div className="hero-mobile-cube-face hero-mobile-cube-right" />
              <div className="hero-mobile-cube-face hero-mobile-cube-left" />
              <div className="hero-mobile-cube-face hero-mobile-cube-top" />
              <div className="hero-mobile-cube-face hero-mobile-cube-bottom" />
            </div>
          </div>

          <div className="absolute right-[6%] top-[20%] w-6 h-6 hero-mobile-cube hero-mobile-float-b">
            <div className="hero-mobile-cube-inner hero-mobile-cube-sm">
              <div className="hero-mobile-cube-face hero-mobile-cube-front" />
              <div className="hero-mobile-cube-face hero-mobile-cube-back" />
              <div className="hero-mobile-cube-face hero-mobile-cube-right" />
              <div className="hero-mobile-cube-face hero-mobile-cube-left" />
              <div className="hero-mobile-cube-face hero-mobile-cube-top" />
              <div className="hero-mobile-cube-face hero-mobile-cube-bottom" />
            </div>
          </div>

          <div className="absolute right-[20%] bottom-[24%] w-4 h-4 rounded-full bg-gradient-to-br from-primary to-accent shadow-md shadow-primary/30 hero-mobile-float-c" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative hero-mobile-logo-stage">
              <div className="absolute -inset-3 rounded-[1.5rem] bg-primary/10 blur-lg hero-mobile-pulse" />
              <div className="relative w-28 h-28 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-primary/20 shadow-xl shadow-primary/15 overflow-hidden card-3d">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-secondary/30 to-primary/5" />
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO%20SET%20%28THEBAZM.CO%29%20%281%29-Vyn5qZbbAAo85GDoYBp77NHmq9hJWu.png"
                  alt=""
                  fill
                  className="object-contain p-4"
                  priority
                />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-2 rounded-full bg-primary/20 blur-sm" />
            </div>
          </div>

          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/40 hero-mobile-particle"
              style={{
                left: `${18 + i * 16}%`,
                top: `${14 + (i % 3) * 22}%`,
                animationDelay: `${i * 0.35}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
