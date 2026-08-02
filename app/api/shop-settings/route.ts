import { NextResponse } from "next/server"
import { loadSiteConfig, updateSiteData } from "@/lib/store"
import { DEFAULT_PRE_ORDER } from "@/lib/types/pre-order"
import type { PreOrderSettings } from "@/lib/types/pre-order"
import {
  assertSameOrigin,
  noStoreJson,
  requireManagerAuth,
} from "@/lib/auth/manager"
import { secureJson } from "@/lib/security/headers"

export const dynamic = "force-dynamic"

export async function GET() {
  const config = await loadSiteConfig()
  const preOrder = config.preOrder ?? DEFAULT_PRE_ORDER

  return NextResponse.json({ preOrder }, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  })
}

export async function PUT(request: Request) {
  const authError = await requireManagerAuth()
  if (authError) return authError

  if (!assertSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const incoming = body.preOrder as Partial<PreOrderSettings> | undefined
    if (!incoming) {
      return secureJson({ error: "Missing preOrder settings" }, { status: 400 })
    }

    let saved: PreOrderSettings = DEFAULT_PRE_ORDER
    await updateSiteData((site) => {
      site.preOrder = {
        enabled: incoming.enabled ?? site.preOrder?.enabled ?? DEFAULT_PRE_ORDER.enabled,
        etaDays: incoming.etaDays ?? site.preOrder?.etaDays ?? DEFAULT_PRE_ORDER.etaDays,
        advanceAmount:
          incoming.advanceAmount ?? site.preOrder?.advanceAmount ?? DEFAULT_PRE_ORDER.advanceAmount,
        headline: incoming.headline?.trim() || site.preOrder?.headline || DEFAULT_PRE_ORDER.headline,
        details: incoming.details?.trim() || site.preOrder?.details || DEFAULT_PRE_ORDER.details,
      }
      saved = site.preOrder
    })

    return noStoreJson({ preOrder: saved })
  } catch {
    return secureJson({ error: "Invalid request" }, { status: 400 })
  }
}
