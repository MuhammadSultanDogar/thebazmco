import { NextResponse } from "next/server"
import { loadSiteConfig, updateSiteData } from "@/lib/store"
import { DEFAULT_PRE_ORDER } from "@/lib/types/pre-order"
import type { PreOrderSettings } from "@/lib/types/pre-order"
import { DEFAULT_SHIPPING_SETTINGS } from "@/lib/types/shipping-settings"
import type { ShippingSettings } from "@/lib/types/shipping-settings"
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
  const shippingSettings = config.shippingSettings ?? DEFAULT_SHIPPING_SETTINGS

  return NextResponse.json({ preOrder, shippingSettings }, {
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
    const incomingPreOrder = body.preOrder as Partial<PreOrderSettings> | undefined
    const incomingShipping = body.shippingSettings as Partial<ShippingSettings> | undefined

    if (!incomingPreOrder && !incomingShipping) {
      return secureJson({ error: "Missing shop settings" }, { status: 400 })
    }

    let savedPreOrder: PreOrderSettings = DEFAULT_PRE_ORDER
    let savedShipping: ShippingSettings = DEFAULT_SHIPPING_SETTINGS

    await updateSiteData((site) => {
      if (incomingPreOrder) {
        site.preOrder = {
          enabled: incomingPreOrder.enabled ?? site.preOrder?.enabled ?? DEFAULT_PRE_ORDER.enabled,
          etaDays: incomingPreOrder.etaDays ?? site.preOrder?.etaDays ?? DEFAULT_PRE_ORDER.etaDays,
          advanceAmount:
            incomingPreOrder.advanceAmount ?? site.preOrder?.advanceAmount ?? DEFAULT_PRE_ORDER.advanceAmount,
          headline:
            incomingPreOrder.headline?.trim() || site.preOrder?.headline || DEFAULT_PRE_ORDER.headline,
          details:
            incomingPreOrder.details?.trim() || site.preOrder?.details || DEFAULT_PRE_ORDER.details,
        }
      }

      if (incomingShipping) {
        const minimum = Number(incomingShipping.freeShippingMinimum)
        site.shippingSettings = {
          freeShippingMinimum:
            Number.isFinite(minimum) && minimum >= 0
              ? Math.round(minimum)
              : site.shippingSettings?.freeShippingMinimum ??
                DEFAULT_SHIPPING_SETTINGS.freeShippingMinimum,
        }
      }

      savedPreOrder = site.preOrder ?? DEFAULT_PRE_ORDER
      savedShipping = site.shippingSettings ?? DEFAULT_SHIPPING_SETTINGS
    })

    return noStoreJson({ preOrder: savedPreOrder, shippingSettings: savedShipping })
  } catch {
    return secureJson({ error: "Invalid request" }, { status: 400 })
  }
}
