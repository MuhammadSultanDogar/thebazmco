import { NextResponse } from "next/server"
import {
  exportSiteData,
  getStorageInfo,
  replaceSiteData,
} from "@/lib/store"
import { normalizeSiteData } from "@/lib/store/defaults"
import type { SiteData } from "@/lib/types/site-data"
import {
  assertSameOrigin,
  noStoreJson,
  requireManagerAuth,
} from "@/lib/auth/manager"
import { secureJson } from "@/lib/security/headers"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const authError = await requireManagerAuth()
  if (authError) return authError

  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("mode")

  if (mode === "export") {
    const data = await exportSiteData()
    return noStoreJson(data)
  }

  const info = await getStorageInfo()
  return noStoreJson(info)
}

export async function POST(request: Request) {
  const authError = await requireManagerAuth()
  if (authError) return authError

  if (!assertSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()

    if (body.action === "import" && body.data) {
      const imported = normalizeSiteData(body.data as Partial<SiteData>)
      const saved = await replaceSiteData(imported)
      const info = await getStorageInfo()
      return noStoreJson({ success: true, data: saved, info })
    }

    return secureJson({ error: "Invalid action" }, { status: 400 })
  } catch {
    return secureJson({ error: "Invalid request" }, { status: 400 })
  }
}
