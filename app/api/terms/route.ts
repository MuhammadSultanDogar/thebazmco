import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { loadSiteData, updateSiteData } from "@/lib/store"

export async function GET() {
  const data = await loadSiteData()
  return NextResponse.json({ terms: data.terms })
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get("manager_session")

  if (authCookie?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { terms } = await request.json()

    if (!terms || typeof terms !== "string") {
      return NextResponse.json({ error: "Terms are required" }, { status: 400 })
    }

    const data = await updateSiteData((site) => {
      site.terms = terms
    })
    return NextResponse.json({ success: true, terms: data.terms })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
