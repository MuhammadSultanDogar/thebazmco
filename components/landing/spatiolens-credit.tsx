"use client"

import { usePathname } from "next/navigation"

const VISITOR_KEY = "thebazm_visitor_id"
const SPATIOLENS_URL = "https://spatiolens.com"

function getVisitorId(): string {
  if (typeof window === "undefined") return ""

  try {
    let id = localStorage.getItem(VISITOR_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}

function trackClick(visitorId: string) {
  void fetch("/api/spatiolens-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitorId }),
    keepalive: true,
  })
}

export function SpatiolensCredit() {
  const pathname = usePathname()

  if (pathname?.startsWith("/manager")) return null

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    const visitorId = getVisitorId()
    if (visitorId) trackClick(visitorId)
    window.open(SPATIOLENS_URL, "_blank", "noopener,noreferrer")
  }

  return (
    <a
      href={SPATIOLENS_URL}
      onClick={handleClick}
      className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-3 z-40 inline-flex items-center rounded-full border border-primary/15 bg-white/90 px-3 py-1.5 text-[10px] sm:text-xs font-medium text-muted-foreground shadow-md shadow-primary/10 backdrop-blur-sm transition-colors hover:border-primary/30 hover:text-foreground sm:right-4 sm:px-3.5 sm:py-2"
    >
      Designed by{" "}
      <span className="ml-1 font-semibold text-primary">Spatiolens</span>
    </a>
  )
}
