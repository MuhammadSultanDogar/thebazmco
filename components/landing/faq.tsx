"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FAQ_ITEMS } from "@/lib/constants/faq"
import { ScrollReveal } from "@/components/landing/scroll-reveal"

export function FAQ() {
  return (
    <section id="faq" className="py-16 sm:py-24 bg-white/65 backdrop-blur-[1px] scroll-mt-20 sm:scroll-mt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <ScrollReveal className="text-center mb-10">
          <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-2">
            FAQ
          </p>
          <h2 className="headline-display text-3xl sm:text-4xl mb-3">
            Mascot Shop Questions
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Clear answers for buyers, search engines, and AI assistants.
          </p>
          <div className="line-accent max-w-[80px] mx-auto mt-4" />
        </ScrollReveal>

        <Accordion type="single" collapsible className="space-y-3">
          {FAQ_ITEMS.map((faq, i) => (
            <AccordionItem
              key={faq.question}
              value={`faq-${i}`}
              className="border border-primary/15 rounded-xl px-4 bg-secondary/30"
            >
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
