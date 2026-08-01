import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Invoice } from "@/lib/types/invoice"
import { loadSiteData, updateSiteData } from "@/lib/store"

export type { Invoice }

export async function GET() {
  const data = await loadSiteData()
  return NextResponse.json(data.invoices)
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get("manager_session")

  if (authCookie?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    return NextResponse.json(created)
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get("manager_session")

  if (authCookie?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get("manager_session")

  if (authCookie?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    await updateSiteData((site) => {
      const index = site.invoices.findIndex((inv) => inv.id === id)
      if (index === -1) throw new Error("NOT_FOUND")
      site.invoices.splice(index, 1)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
