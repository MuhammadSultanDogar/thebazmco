import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { StatsStrip } from "@/components/landing/stats-strip"
import { MascotsShop } from "@/components/landing/mascots-shop"
import { PerformanceSection } from "@/components/landing/performance-section"
import { FAQ } from "@/components/landing/faq"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"
import { HomeJsonLd } from "@/components/seo/home-json-ld"

export default function Home() {
  return (
    <main className="bg-white">
      <HomeJsonLd />
      <Header />
      <Hero />
      <MascotsShop />
      <StatsStrip />
      <FAQ />
      <PerformanceSection />
      <CTA />
      <Footer />
    </main>
  )
}
