import { NextResponse } from "next/server"
import type { Invoice } from "@/lib/types/invoice"
import { loadSiteData, updateSiteData } from "@/lib/store"
import {
  assertSameOrigin,
  noStoreJson,
  requireManagerAuth,
} from "@/lib/auth/manager"
import { secureJson } from "@/lib/security/headers"

export const dynamic = "force-dynamic"

export type { Invoice }

export async function GET() {
  const authError = await requireManagerAuth()
  if (authError) return authError

  const data = await loadSiteData()
  return noStoreJson(data.invoices)
}

export async function POST(request: Request) {
  const authError = await requireManagerAuth()
  if (authError) return authError

  if (!assertSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const payload = await request.json()
    let created: Invoice | null = null

    await updateSiteData((site) => {
      created = {
        id: `inv_${Date.now()}`,
        invoiceNumber: `TBZ-${new Date().getFullYear()}-${String(site.invoiceCounter++).padStart(3, "0")}`,
        createdAt: new Date().toISOString(),
        ...payload,
      }
      site.invoices.unshift(created)
    })

    return noStoreJson(created)
  } catch {
    return secureJson({ error: "Invalid data" }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  const authError = await requireManagerAuth()
  if (authError) return authError

  if (!assertSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const payload = await request.json()
    let updated: Invoice | null = null

    await updateSiteData((site) => {
      const index = site.invoices.findIndex((inv) => inv.id === payload.id)
      if (index === -1) throw new Error("NOT_FOUND")
      site.invoices[index] = { ...site.invoices[index], ...payload }
      updated = site.invoices[index]
    })

    return noStoreJson(updated)
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return secureJson({ error: "Invoice not found" }, { status: 404 })
    }
    return secureJson({ error: "Invalid data" }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  const authError = await requireManagerAuth()
  if (authError) return authError

  if (!assertSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    await updateSiteData((site) => {
      const index = site.invoices.findIndex((inv) => inv.id === id)
      if (index === -1) throw new Error("NOT_FOUND")
      site.invoices.splice(index, 1)
    })

    return secureJson({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return secureJson({ error: "Invoice not found" }, { status: 404 })
    }
    return secureJson({ error: "Invalid request" }, { status: 400 })
  }
}
