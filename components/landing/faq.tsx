"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollReveal } from "@/components/landing/scroll-reveal"

const faqs = [
  {
    question: "What areas do you cover for performances?",
    answer:
      "We primarily serve Islamabad and Rawalpindi. For events outside these areas, please contact us via WhatsApp to discuss availability and additional travel charges.",
  },
  {
    question: "How far in advance should I book a performance?",
    answer:
      "We recommend booking at least 1-2 weeks in advance, especially during wedding and event season. However, we do accommodate last-minute bookings based on availability.",
  },
  {
    question: "What does the performance include?",
    answer:
      "Each performance includes a professional gorilla costume performer, grand entrance choreography, crowd interaction, dance performances, and unlimited photo opportunities with guests.",
  },
  {
    question: "Can I buy a mascot and book a performance together?",
    answer:
      "Absolutely! Many clients purchase their own inflatable mascot and also book our performers. Contact us on WhatsApp for bundle pricing.",
  },
  {
    question: "How do I order a mascot or accessory?",
    answer:
      "Browse our Mascots and Accessories sections, then click 'Order on WhatsApp'. We'll confirm availability, shipping, and payment details.",
  },
  {
    question: "Do you deliver mascots nationwide?",
    answer:
      "Yes, we deliver across Pakistan. Shipping costs are listed per product. Contact us for bulk or custom orders.",
  },
  {
    question: "What is your cancellation policy?",
    answer:
      "For performances, notify us at least 48 hours before your event for a full refund. Mascot orders follow our standard return policy — contact us for details.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-16 sm:py-24 section-purple scroll-mt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase mb-4">
            FAQ
          </p>
          <h2 className="headline-display text-3xl sm:text-4xl md:text-5xl mb-4">
            Questions? Answered.
          </h2>
          <div className="line-accent max-w-[120px] mx-auto mb-6" />
          <p className="text-muted-foreground max-w-xl mx-auto">
            Everything you need to know about performances and mascot orders.
          </p>
        </ScrollReveal>

        <ScrollReveal className="max-w-2xl mx-auto" delay={0.1}>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white border-2 border-primary/10 rounded-xl px-6 data-[state=open]:border-primary/40 data-[state=open]:shadow-md data-[state=open]:shadow-primary/10"
              >
                <AccordionTrigger className="text-left text-base font-medium hover:no-underline py-5 hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  )
}
