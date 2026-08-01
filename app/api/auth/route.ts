import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  createSessionToken,
  getManagerCredentials,
  getSessionCookieOptions,
  safeCompare,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth/session"
import {
  assertSameOrigin,
  getClientIp,
  tooManyRequestsResponse,
} from "@/lib/auth/manager"
import { enforceRateLimit } from "@/lib/security/rate-limit"
import { secureJson } from "@/lib/security/headers"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 })
  }

  const ip = getClientIp(request)
  const allowed = await enforceRateLimit(`auth:login:${ip}`, {
    limit: 10,
    windowSeconds: 15 * 60,
  })
  if (!allowed) return tooManyRequestsResponse()

  try {
    const body = await request.json()
    const { username, password } = body
    const creds = getManagerCredentials()

    if (
      typeof username === "string" &&
      typeof password === "string" &&
      safeCompare(username, creds.username) &&
      safeCompare(password, creds.password)
    ) {
      const cookieStore = await cookies()
      cookieStore.set(SESSION_COOKIE_NAME, createSessionToken(), getSessionCookieOptions())
      return secureJson({ success: true })
    }

    return secureJson({ error: "Invalid credentials" }, { status: 401 })
  } catch {
    return secureJson({ error: "Invalid request" }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  if (!assertSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 })
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (verifySessionToken(token)) {
    cookieStore.delete(SESSION_COOKIE_NAME)
  }

  return secureJson({ success: true })
}
