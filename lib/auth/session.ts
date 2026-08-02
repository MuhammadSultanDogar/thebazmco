import { createHmac, randomBytes, timingSafeEqual } from "crypto"

export const SESSION_COOKIE_NAME = "manager_session"
const SESSION_TTL_MS = 24 * 60 * 60 * 1000

export class SessionNotConfiguredError extends Error {
  constructor() {
    super("MANAGER_SESSION_SECRET is required in production")
    this.name = "SessionNotConfiguredError"
  }
}

function readSessionSecret(): string | null {
  const secret = process.env.MANAGER_SESSION_SECRET?.trim()
  return secret || null
}

function getSessionSecret(): string {
  const secret = readSessionSecret()
  if (secret) return secret

  if (process.env.NODE_ENV === "production") {
    throw new SessionNotConfiguredError()
  }

  return "dev-only-insecure-session-secret-change-me"
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url")
}

export function createSessionToken(): string {
  const secret = getSessionSecret()
  const exp = Date.now() + SESSION_TTL_MS
  const nonce = randomBytes(16).toString("base64url")
  const payload = `${exp}.${nonce}`
  return `${payload}.${sign(payload, secret)}`
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false

  const parts = token.split(".")
  if (parts.length !== 3) return false

  const [expStr, nonce, signature] = parts
  const exp = Number(expStr)
  if (!Number.isFinite(exp) || Date.now() > exp) return false

  const payload = `${expStr}.${nonce}`

  let secret: string
  try {
    secret = getSessionSecret()
  } catch {
    return false
  }

  const expected = sign(payload, secret)

  try {
    const sigBuf = Buffer.from(signature)
    const expBuf = Buffer.from(expected)
    if (sigBuf.length !== expBuf.length) return false
    return timingSafeEqual(sigBuf, expBuf)
  } catch {
    return false
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: SESSION_TTL_MS / 1000,
    path: "/",
  }
}

export function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export function getManagerCredentials() {
  return {
    username: (process.env.MANAGER_USERNAME ?? "hassan").trim(),
    password: (process.env.MANAGER_PASSWORD ?? "chotakela1").trim(),
  }
}

export function isSessionConfigured(): boolean {
  if (readSessionSecret()) return true
  return process.env.NODE_ENV !== "production"
}
