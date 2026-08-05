import { Packages } from "@/components/landing/packages"
import { Gallery } from "@/components/landing/gallery"
import { WhyChooseUs } from "@/components/landing/why-choose-us"
import { ScrollReveal } from "@/components/landing/scroll-reveal"

export function PerformanceSection() {
  return (
    <section id="performance" className="py-16 sm:py-24 bg-white/70 backdrop-blur-[1px] scroll-mt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mb-14">
          <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-2">
            Also available
          </p>
          <h2 className="headline-display text-3xl sm:text-4xl md:text-5xl mb-3">
            Live Gorilla Shows
          </h2>
          <div className="line-accent max-w-[80px] mb-4" />
          <p className="text-muted-foreground max-w-xl text-base sm:text-lg">
            We mainly sell inflatable mascots nationwide. Need a performer for a wedding or corporate event? Live gorilla shows are still available on request.
          </p>
        </ScrollReveal>

        <Packages />
      </div>

      <Gallery />
      <WhyChooseUs />
    </section>
  )
}
