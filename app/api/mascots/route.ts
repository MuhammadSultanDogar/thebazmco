import { NextResponse } from "next/server"
import type { MascotProduct } from "@/lib/types/mascot"
import { loadSiteData, updateSiteData } from "@/lib/store"
import {
  assertSameOrigin,
  noStoreJson,
  requireManagerAuth,
} from "@/lib/auth/manager"
import { secureJson } from "@/lib/security/headers"
import { normalizeMascotProduct } from "@/lib/utils/product-images"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const showAll = searchParams.get("all") === "true"
  const data = await loadSiteData()

  if (showAll) {
    const authError = await requireManagerAuth()
    if (authError) return authError

    return noStoreJson(
      [...data.mascots].sort((a, b) => a.sortOrder - b.sortOrder),
    )
  }

  const active = data.mascots
    .filter((m) => m.active)
    .map((m) => {
      const normalized = normalizeMascotProduct(m)
      return {
        id: normalized.id,
        name: normalized.name,
        description: normalized.description,
        price: normalized.price,
        image: normalized.image,
        images: normalized.images,
        shipping: normalized.shipping,
        accessories: normalized.accessories,
        category: normalized.category || "mascot",
        featured: normalized.featured,
        active: normalized.active,
        soldOut: normalized.soldOut,
        originalPrice: normalized.originalPrice,
        sortOrder: normalized.sortOrder,
      }
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return NextResponse.json(active, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  })
}

export async function POST(request: Request) {
  const authError = await requireManagerAuth()
  if (authError) return authError

  if (!assertSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()

    if (body.action === "replace-all") {
      const data = await updateSiteData((site) => {
        site.mascots = (body.mascots as MascotProduct[]).map((m, i) =>
          normalizeMascotProduct({
            ...m,
            sortOrder: m.sortOrder ?? i + 1,
          }),
        )
      })
      return noStoreJson({ success: true, mascots: data.mascots })
    }

    let created: MascotProduct | null = null
    const data = await updateSiteData((site) => {
      created = normalizeMascotProduct({
        id: `mascot-${Date.now()}`,
        name: body.name || "New Product",
        description: body.description || "",
        price: body.price || "0",
        image: body.image || "",
        images: body.images,
        shipping: body.shipping || "0",
        accessories: body.accessories || [],
        category: body.category || "mascot",
        featured: body.featured ?? false,
        active: body.active ?? true,
        soldOut: body.soldOut ?? false,
        originalPrice: body.originalPrice,
        sortOrder: site.mascots.length + 1,
      })
      site.mascots.push(created)
    })

    return noStoreJson(created ?? data.mascots.at(-1))
  } catch {
    return secureJson({ error: "Invalid request" }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  const authError = await requireManagerAuth()
  if (authError) return authError

  if (!assertSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    let updated: MascotProduct | null = null

    await updateSiteData((site) => {
      const index = site.mascots.findIndex((m) => m.id === body.id)
      if (index === -1) throw new Error("NOT_FOUND")
      site.mascots[index] = normalizeMascotProduct({
        ...site.mascots[index],
        ...body,
        id: site.mascots[index].id,
      })
      updated = site.mascots[index]
    })

    return noStoreJson(updated)
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return secureJson({ error: "Product not found" }, { status: 404 })
    }
    return secureJson({ error: "Invalid request" }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  const authError = await requireManagerAuth()
  if (authError) return authError

  if (!assertSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return secureJson({ error: "Missing id" }, { status: 400 })

  await updateSiteData((site) => {
    site.mascots = site.mascots.filter((m) => m.id !== id)
  })

  return secureJson({ success: true })
}
