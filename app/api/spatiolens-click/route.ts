import {
  getSpatiolensClickStats,
  recordSpatiolensClick,
} from "@/lib/store/spatiolens-clicks"
import {
  assertSameOrigin,
  getClientIp,
  noStoreJson,
  requireManagerAuth,
  tooManyRequestsResponse,
} from "@/lib/auth/manager"
import { enforceRateLimit } from "@/lib/security/rate-limit"
import { secureJson } from "@/lib/security/headers"

export const dynamic = "force-dynamic"

const VISITOR_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET() {
  const authError = await requireManagerAuth()
  if (authError) return authError

  const stats = await getSpatiolensClickStats()
  return noStoreJson(stats)
}

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 })
  }

  const ip = getClientIp(request)
  const allowed = await enforceRateLimit(`spatiolens-click:${ip}`, {
    limit: 30,
    windowSeconds: 60 * 60,
  })
  if (!allowed) return tooManyRequestsResponse()

  try {
    const body = (await request.json()) as { visitorId?: string }
    const visitorId = body.visitorId?.trim()

    if (!visitorId || !VISITOR_ID_RE.test(visitorId)) {
      return secureJson({ error: "Invalid visitor id" }, { status: 400 })
    }

    const stats = await recordSpatiolensClick(visitorId)
    return secureJson({ ok: true, ...stats })
  } catch {
    return secureJson({ error: "Invalid request" }, { status: 400 })
  }
}
