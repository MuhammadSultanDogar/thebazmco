import { NextResponse } from "next/server"
import { loadSiteConfig, updateSiteData } from "@/lib/store"
import {
  DEFAULT_PARK_VIEW_PROPOSAL,
  normalizeParkViewProposal,
} from "@/lib/constants/park-view-proposal"
import type { ParkViewProposal } from "@/lib/types/park-view-proposal"
import {
  assertSameOrigin,
  noStoreJson,
  requireManagerAuth,
} from "@/lib/auth/manager"
import { secureJson } from "@/lib/security/headers"

export const dynamic = "force-dynamic"

export async function GET() {
  const authError = await requireManagerAuth()
  if (authError) return authError

  const config = await loadSiteConfig()
  const proposal = normalizeParkViewProposal(config.parkViewProposal)

  return noStoreJson({ proposal })
}

export async function PUT(request: Request) {
  const authError = await requireManagerAuth()
  if (authError) return authError

  if (!assertSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const incoming = body.proposal as Partial<ParkViewProposal> | undefined

    if (!incoming) {
      return secureJson({ error: "Missing proposal data" }, { status: 400 })
    }

    let saved: ParkViewProposal = DEFAULT_PARK_VIEW_PROPOSAL

    await updateSiteData((site) => {
      site.parkViewProposal = normalizeParkViewProposal({
        ...site.parkViewProposal,
        ...incoming,
      })
      saved = site.parkViewProposal
    })

    return noStoreJson({ proposal: saved })
  } catch {
    return secureJson({ error: "Invalid request" }, { status: 400 })
  }
}
