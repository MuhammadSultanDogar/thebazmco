import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  createSessionToken,
  getManagerCredentials,
  getSessionCookieOptions,
  safeCompare,
  SESSION_COOKIE_NAME,
  SessionNotConfiguredError,
  verifySessionToken,
} from "@/lib/auth/session"
import {
  assertSameOrigin,
  getClientIp,
  tooManyRequestsResponse,
} from "@/lib/auth/manager"
import {
  clearRateLimit,
  isRateLimited,
  recordRateLimitFailure,
} from "@/lib/security/rate-limit"
import { secureJson } from "@/lib/security/headers"

export const dynamic = "force-dynamic"

const LOGIN_RATE_LIMIT = {
  limit: 15,
  windowSeconds: 10 * 60,
}

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 })
  }

  const ip = getClientIp(request)
  const rateKey = `auth:login:${ip}`

  if (await isRateLimited(rateKey, LOGIN_RATE_LIMIT)) {
    return tooManyRequestsResponse(
      "Too many failed login attempts. Wait 10 minutes and try again.",
    )
  }

  try {
    const body = await request.json()
    const { username, password } = body
    const creds = getManagerCredentials()

    if (
      typeof username === "string" &&
      typeof password === "string" &&
      safeCompare(username.trim(), creds.username) &&
      safeCompare(password, creds.password)
    ) {
      try {
        const cookieStore = await cookies()
        cookieStore.set(SESSION_COOKIE_NAME, createSessionToken(), getSessionCookieOptions())
        await clearRateLimit(rateKey)
        return secureJson({ success: true })
      } catch (error) {
        if (error instanceof SessionNotConfiguredError) {
          return secureJson(
            {
              error:
                "Login blocked: MANAGER_SESSION_SECRET is not set on the server. Add it in Vercel → Settings → Environment Variables, then redeploy.",
            },
            { status: 503 },
          )
        }
        throw error
      }
    }

    await recordRateLimitFailure(rateKey, LOGIN_RATE_LIMIT)
    return secureJson({ error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("Auth login error:", error)
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
