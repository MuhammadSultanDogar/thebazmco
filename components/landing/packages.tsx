"use client"

import { Check } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const defaultRates = {
  "30min": "22,000",
  "1hour": "28,000",
  "1.5hours": "35,000",
}

const getPackages = (rates: typeof defaultRates) => [
  {
    duration: "30 Minutes",
    price: rates["30min"],
    features: ["Professional performer", "Grand entrance", "Crowd interaction", "Photo ops"],
    popular: false,
  },
  {
    duration: "1 Hour",
    price: rates["1hour"],
    features: [
      "Professional performer",
      "Grand entrance",
      "Extended crowd interaction",
      "Dance performances",
      "Photo & video moments",
    ],
    popular: true,
  },
  {
    duration: "1.5 Hours",
    price: rates["1.5hours"],
    features: [
      "Professional performer",
      "Full event coverage",
      "Multiple dance sets",
      "Unlimited photo ops",
      "Special moments coordination",
    ],
    popular: false,
  },
]

export function Packages() {
  const { data: rates } = useSWR("/api/rates", fetcher, {
    fallbackData: defaultRates,
    revalidateOnFocus: false,
  })

  const packages = getPackages(rates || defaultRates)

  return (
    <div>
      <div className="text-center mb-10">
        <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-2">Pricing</p>
        <h3 className="font-display text-2xl sm:text-3xl font-bold mb-2">Choose Your Package</h3>
        <p className="text-muted-foreground text-sm">All cities covered · Transparent PKR pricing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 max-w-5xl mx-auto">
        {packages.map((pkg) => (
          <div
            key={pkg.duration}
            className={`relative rounded-2xl p-6 transition-all duration-300 border-2 ${
              pkg.popular
                ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/25 scale-[1.02]"
                : "bg-white border-primary/10 hover:border-primary/30 hover:shadow-lg"
            }`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Most Popular
                </span>
              </div>
            )}

            <div className="mb-5">
              <h4 className="font-display text-lg font-bold mb-1">{pkg.duration}</h4>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold">{pkg.price}</span>
                <span className={`text-sm ${pkg.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  PKR
                </span>
              </div>
            </div>

            <ul className="space-y-2.5 mb-6">
              {pkg.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${pkg.popular ? "text-primary-foreground" : "text-primary"}`} />
                  <span className={`text-sm ${pkg.popular ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href="https://wa.me/923255105062"
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-full text-center py-2.5 px-5 rounded-xl text-sm font-bold transition-all ${
                pkg.popular
                  ? "bg-white text-primary border-2 border-primary hover:bg-secondary"
                  : "bg-primary text-primary-foreground hover:brightness-110"
              }`}
            >
              Book Now
            </a>
          </div>
        ))}
      </div>

      <p className="text-center mt-8 text-sm text-muted-foreground">
        <span className="font-bold text-primary">2nd Gorilla</span> available as add-on
      </p>
    </div>
  )
}
