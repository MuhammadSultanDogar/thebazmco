import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth/session"

export async function isManagerAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  return verifySessionToken(token)
}

export async function requireManagerAuth(): Promise<NextResponse | null> {
  if (!(await isManagerAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export function forbiddenResponse(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 })
}

export function tooManyRequestsResponse(message?: string) {
  return NextResponse.json(
    {
      error:
        message ??
        "Too many requests. Please wait a few minutes and try again.",
    },
    { status: 429, headers: { "Retry-After": "600" } },
  )
}

/** Block cross-origin mutating requests (browser-based API abuse). */
export function assertSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin")
  const host = request.headers.get("host")
  if (!origin || !host) return true

  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

export function noStoreJson(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...init?.headers,
      "Cache-Control": "no-store",
    },
  })
}
