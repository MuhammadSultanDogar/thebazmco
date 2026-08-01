import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const VALID_USERNAME = "hassan"
const VALID_PASSWORD = "chotakela1"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      const cookieStore = await cookies()
      cookieStore.set("manager_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 hours
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete("manager_session")
  return NextResponse.json({ success: true })
}
