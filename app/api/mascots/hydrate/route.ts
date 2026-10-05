import { loadSiteConfig } from "@/lib/store"
import { hydrateMascotImages } from "@/lib/store/mascot-image-store"
import { noStoreJson, requireManagerAuth } from "@/lib/auth/manager"

export const dynamic = "force-dynamic"

/** Load one product with full image data for the edit form (manager only). */
export async function GET(request: Request) {
  const authError = await requireManagerAuth()
  if (authError) return authError

  const id = new URL(request.url).searchParams.get("id")
  if (!id) {
    return noStoreJson({ error: "Missing id" })
  }

  const config = await loadSiteConfig()
  const product = config.mascots.find((m) => m.id === id)
  if (!product) {
    return noStoreJson({ error: "Not found" })
  }

  const hydrated = await hydrateMascotImages(product)
  return noStoreJson(hydrated)
}
