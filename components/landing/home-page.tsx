import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { StatsStrip } from "@/components/landing/stats-strip"
import { MascotsShop } from "@/components/landing/mascots-shop"
import { PerformanceSection } from "@/components/landing/performance-section"
import { FAQ } from "@/components/landing/faq"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"
import { MascotBackground } from "@/components/landing/mascot-background"
import { HomeJsonLd } from "@/components/seo/home-json-ld"
import type { MascotProduct } from "@/lib/types/mascot"

type HomePageProps = {
  initialProducts?: MascotProduct[]
  initialOpenProduct?: MascotProduct | null
}

export function HomePage({ initialProducts, initialOpenProduct }: HomePageProps) {
  return (
    <main className="relative min-h-screen">
      <MascotBackground />
      <div className="relative z-10">
        <HomeJsonLd />
        <Header />
        <Hero />
        <MascotsShop
          initialProducts={initialProducts}
          initialOpenProduct={initialOpenProduct}
        />
        <StatsStrip />
        <PerformanceSection />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </main>
  )
}
