import { NextResponse } from "next/server"
import { loadSiteConfig } from "@/lib/store"
import { DEFAULT_ORDER_NOTIFICATIONS } from "@/lib/types/order-notifications"

export const dynamic = "force-dynamic"

/** Public read — used by checkout to send owner alert from the customer's browser. */
export async function GET() {
  const config = await loadSiteConfig()
  const settings = config.orderNotifications ?? DEFAULT_ORDER_NOTIFICATIONS

  return NextResponse.json(
    {
      enabled: settings.enabled,
      email: settings.enabled && settings.email ? settings.email : null,
    },
    {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    },
  )
}
