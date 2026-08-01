import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { applySecurityHeaders } from "@/lib/security/headers"

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  applySecurityHeaders(response)

  // Block common probe paths
  const path = request.nextUrl.pathname
  if (
    path.startsWith("/.env") ||
    path.startsWith("/wp-admin") ||
    path.startsWith("/wp-login") ||
    path === "/admin" ||
    path === "/administrator"
  ) {
    return new NextResponse("Not Found", { status: 404 })
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
