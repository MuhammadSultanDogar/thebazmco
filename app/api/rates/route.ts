import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// Default rates
const defaultRates = {
  "30min": "22,000",
  "1hour": "28,000",
  "1.5hours": "35,000",
}

// In-memory storage (will reset on server restart - for production use a database)
let rates = { ...defaultRates }

export async function GET() {
  return NextResponse.json(rates)
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const session = cookieStore.get("manager_session")

  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    rates = {
      "30min": body["30min"] || rates["30min"],
      "1hour": body["1hour"] || rates["1hour"],
      "1.5hours": body["1.5hours"] || rates["1.5hours"],
    }
    return NextResponse.json({ success: true, rates })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
