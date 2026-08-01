import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { loadSiteData, updateSiteData } from "@/lib/store"

export async function GET() {
  const data = await loadSiteData()
  return NextResponse.json(data.rates)
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const session = cookieStore.get("manager_session")

  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
    return NextResponse.json({ success: true, rates: data.rates })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
