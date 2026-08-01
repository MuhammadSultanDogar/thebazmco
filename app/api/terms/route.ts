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
  const authError = await requireManagerAuth()
  if (authError) return authError

  const data = await loadSiteData()
  return noStoreJson({ terms: data.terms })
}

export async function POST(request: Request) {
  const authError = await requireManagerAuth()
  if (authError) return authError

  if (!assertSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { terms } = await request.json()

    if (!terms || typeof terms !== "string" || terms.length > 20_000) {
      return secureJson({ error: "Terms are required" }, { status: 400 })
    }

    const data = await updateSiteData((site) => {
      site.terms = terms
    })
    return noStoreJson({ success: true, terms: data.terms })
  } catch {
    return secureJson({ error: "Invalid request body" }, { status: 400 })
  }
}
