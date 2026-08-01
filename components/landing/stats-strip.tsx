"use client"

const stats = [
  { value: "100+", label: "Events Delivered" },
  { value: "7", label: "Products Available" },
  { value: "All Cities", label: "Nationwide Delivery" },
  { value: "24/7", label: "WhatsApp Support" },
]

export function StatsStrip() {
  return (
    <div className="border-y border-primary/15 bg-secondary py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-4 rounded-2xl bg-white border border-primary/10 shadow-sm"
            >
              <p className="font-display text-2xl sm:text-3xl font-bold text-primary mb-1">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
