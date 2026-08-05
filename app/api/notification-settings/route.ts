import { loadSiteConfig, updateSiteData } from "@/lib/store"
import {
  DEFAULT_ORDER_NOTIFICATIONS,
  isValidNotificationEmail,
  normalizeOrderNotifications,
  type OrderNotificationSettings,
} from "@/lib/types/order-notifications"
import {
  assertSameOrigin,
  noStoreJson,
  requireManagerAuth,
} from "@/lib/auth/manager"
import { secureJson } from "@/lib/security/headers"

export const dynamic = "force-dynamic"

export async function GET() {
  const authError = await requireManagerAuth()
  if (authError) return authError

  const config = await loadSiteConfig()
  const orderNotifications =
    config.orderNotifications ?? DEFAULT_ORDER_NOTIFICATIONS

  return noStoreJson({ orderNotifications })
}

export async function PUT(request: Request) {
  const authError = await requireManagerAuth()
  if (authError) return authError

  if (!assertSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const incoming = body.orderNotifications as
      | Partial<OrderNotificationSettings>
      | undefined

    if (!incoming) {
      return secureJson({ error: "Missing orderNotifications settings" }, { status: 400 })
    }

    const email = incoming.email?.trim() ?? ""
    if (email && !isValidNotificationEmail(email)) {
      return secureJson({ error: "Invalid email address" }, { status: 400 })
    }

    let saved: OrderNotificationSettings = DEFAULT_ORDER_NOTIFICATIONS
    await updateSiteData((site) => {
      site.orderNotifications = normalizeOrderNotifications({
        enabled: incoming.enabled,
        email: email || site.orderNotifications?.email || DEFAULT_ORDER_NOTIFICATIONS.email,
      })
      saved = site.orderNotifications
    })

    return noStoreJson({ orderNotifications: saved })
  } catch {
    return secureJson({ error: "Invalid request" }, { status: 400 })
  }
}
