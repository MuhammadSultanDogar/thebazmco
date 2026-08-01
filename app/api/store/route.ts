import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  exportSiteData,
  getStorageInfo,
  replaceSiteData,
} from "@/lib/store"
import { normalizeSiteData } from "@/lib/store/defaults"
import type { SiteData } from "@/lib/types/site-data"

export const dynamic = "force-dynamic"

async function isAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.get("manager_session")?.value === "authenticated"
}

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("mode")

  if (mode === "export") {
    const data = await exportSiteData()
    return NextResponse.json(data)
  }

  const info = await getStorageInfo()
  return NextResponse.json(info)
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    if (body.action === "import" && body.data) {
      const imported = normalizeSiteData(body.data as Partial<SiteData>)
      const saved = await replaceSiteData(imported)
      const info = await getStorageInfo()
      return NextResponse.json({ success: true, data: saved, info })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
