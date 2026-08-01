"use client"

import { Sparkles, Users, Clock, MapPin } from "lucide-react"

const reasons = [
  {
    icon: Sparkles,
    title: "Viral-Worthy Moments",
    description: "Performances designed for maximum impact — your guests will be filming.",
  },
  {
    icon: Users,
    title: "Pro Performers",
    description: "Trained entertainers who read the crowd and deliver tailored experiences.",
  },
  {
    icon: Clock,
    title: "Always On Time",
    description: "We arrive prepared and punctual. No stress, just pure entertainment.",
  },
  {
    icon: MapPin,
    title: "All Cities Covered",
    description: "Nationwide delivery and performances — wherever your event is in Pakistan.",
  },
]

export function WhyChooseUs() {
  return (
    <div className="py-16 sm:py-20 bg-secondary/40 border-t border-primary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-2">Why TheBazm</p>
          <h3 className="font-display text-2xl sm:text-3xl font-bold">Trusted Across Pakistan</h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
          {reasons.map((reason) => {
            const Icon = reason.icon
            return (
              <div
                key={reason.title}
                className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-primary/10 hover:border-primary/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-primary-foreground" />
                </div>
                <h4 className="font-display text-sm sm:text-base font-bold mb-1.5">{reason.title}</h4>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{reason.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
