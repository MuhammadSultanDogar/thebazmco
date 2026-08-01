import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { MascotProduct } from "@/lib/types/mascot"
import { loadSiteData, updateSiteData } from "@/lib/store"

async function isAuthenticated() {
  const cookieStore = await cookies()
  const session = cookieStore.get("manager_session")
  return session?.value === "authenticated"
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const showAll = searchParams.get("all") === "true"
  const data = await loadSiteData()

  if (showAll && (await isAuthenticated())) {
    return NextResponse.json(
      [...data.mascots].sort((a, b) => a.sortOrder - b.sortOrder),
    )
  }

  const active = data.mascots
    .filter((m) => m.active)
    .map((m) => ({ ...m, category: m.category || "mascot" }))
    .sort((a, b) => a.sortOrder - b.sortOrder)
  return NextResponse.json(active)
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    if (body.action === "replace-all") {
      const data = await updateSiteData((site) => {
        site.mascots = (body.mascots as MascotProduct[]).map((m, i) => ({
          ...m,
          sortOrder: m.sortOrder ?? i + 1,
        }))
      })
      return NextResponse.json({ success: true, mascots: data.mascots })
    }

    let created: MascotProduct | null = null
    const data = await updateSiteData((site) => {
      created = {
        id: `mascot-${Date.now()}`,
        name: body.name || "New Product",
        description: body.description || "",
        price: body.price || "0",
        image: body.image || "",
        shipping: body.shipping || "0",
        accessories: body.accessories || [],
        category: body.category || "mascot",
        featured: body.featured ?? false,
        active: body.active ?? true,
        sortOrder: site.mascots.length + 1,
      }
      site.mascots.push(created)
    })

    return NextResponse.json(created ?? data.mascots.at(-1))
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    let updated: MascotProduct | null = null

    await updateSiteData((site) => {
      const index = site.mascots.findIndex((m) => m.id === body.id)
      if (index === -1) {
        throw new Error("NOT_FOUND")
      }
      site.mascots[index] = { ...site.mascots[index], ...body, id: site.mascots[index].id }
      updated = site.mascots[index]
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  await updateSiteData((site) => {
    site.mascots = site.mascots.filter((m) => m.id !== id)
  })

  return NextResponse.json({ success: true })
}
