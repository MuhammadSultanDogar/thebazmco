import { NextResponse } from "next/server"
import { loadSiteData, updateSiteData } from "@/lib/store"
import {
  assertSameOrigin,
  noStoreJson,
  requireManagerAuth,
} from "@/lib/auth/manager"
import { secureJson } from "@/lib/security/headers"

export const dynamic = "force-dynamic"

export async function GET() {
  const data = await loadSiteData()
  return NextResponse.json(data.rates, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  })
}

export async function POST(request: Request) {
  const authError = await requireManagerAuth()
  if (authError) return authError

  if (!assertSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const data = await updateSiteData((site) => {
      site.rates = {
        "30min": body["30min"] || site.rates["30min"],
        "1hour": body["1hour"] || site.rates["1hour"],
        "1.5hours": body["1.5hours"] || site.rates["1.5hours"],
      }
    })
    return noStoreJson({ success: true, rates: data.rates })
  } catch {
    return secureJson({ error: "Invalid request" }, { status: 400 })
  }
}
