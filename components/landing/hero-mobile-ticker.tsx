const TICKER_ITEMS = [
  "Limited Stock",
  "24/7 Support",
  "Free Shipping",
  "Performed in 100+ Events",
  "Selling Inflatable Mascots",
  "Across All Pakistan",
  "In All Cities",
]

export function HeroMobileTicker() {
  const loop = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div className="relative -mx-4 sm:-mx-6 my-3 overflow-hidden bg-secondary/80 border-y border-primary/15">
      <div className="hero-ticker-fade-left pointer-events-none absolute inset-y-0 left-0 w-8 z-[1] bg-gradient-to-r from-secondary/80 to-transparent" />
      <div className="hero-ticker-fade-right pointer-events-none absolute inset-y-0 right-0 w-8 z-[1] bg-gradient-to-l from-secondary/80 to-transparent" />
      <div className="hero-ticker-track flex w-max py-2.5">
        {loop.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-flex shrink-0 items-center gap-2 px-5 text-[11px] font-bold uppercase tracking-[0.12em] text-primary"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary/70" aria-hidden />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
