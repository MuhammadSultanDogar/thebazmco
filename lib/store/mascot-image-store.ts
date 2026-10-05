import type { MascotProduct } from "@/lib/types/mascot"
import { getRedis } from "@/lib/store/redis-client"
import { getProductImages } from "@/lib/utils/product-images"
import { isDataUrl } from "@/lib/utils/compress-image"

export function mascotImageKey(productId: string, index: number): string {
  return `thebazm:img:${productId}:${index}`
}

export function storedImageRef(productId: string, index: number): string {
  return `stored:${productId}:${index}`
}

export function parseStoredImageRef(ref: string): { productId: string; index: number } | null {
  const match = /^stored:([^:]+):(\d+)$/.exec(ref)
  if (!match) return null
  return { productId: match[1], index: Number(match[2]) }
}

export async function readMascotImageBlob(
  productId: string,
  index: number,
): Promise<string | null> {
  const redis = getRedis()
  if (!redis) return null

  try {
    return await redis.get<string>(mascotImageKey(productId, index))
  } catch {
    return null
  }
}

/** Move base64 out of the main site-data blob into per-image Redis keys. */
export async function splitMascotImagesForStorage(
  mascots: MascotProduct[],
): Promise<{ mascots: MascotProduct[]; changed: boolean }> {
  const redis = getRedis()
  if (!redis) return { mascots, changed: false }

  let changed = false
  const next: MascotProduct[] = []

  for (const product of mascots) {
    const images = getProductImages(product)
    if (!images.some(isDataUrl)) {
      next.push(product)
      continue
    }

    changed = true
    const liteImages: string[] = []

    for (let i = 0; i < images.length; i++) {
      const src = images[i]
      if (isDataUrl(src)) {
        await redis.set(mascotImageKey(product.id, i), src)
        liteImages.push(storedImageRef(product.id, i))
      } else {
        liteImages.push(src)
      }
    }

    next.push({
      ...product,
      images: liteImages,
      image: liteImages[0] ?? "",
    })
  }

  return { mascots: next, changed }
}

export async function hydrateMascotImages(product: MascotProduct): Promise<MascotProduct> {
  const images = getProductImages(product)
  const hydrated: string[] = []

  for (let i = 0; i < images.length; i++) {
    const src = images[i]
    const ref = parseStoredImageRef(src)
    if (ref) {
      const blob = await readMascotImageBlob(ref.productId, ref.index)
      hydrated.push(blob ?? src)
    } else {
      hydrated.push(src)
    }
  }

  return {
    ...product,
    images: hydrated,
    image: hydrated[0] ?? "",
  }
}

export async function hydrateMascotsForManager(
  mascots: MascotProduct[],
): Promise<MascotProduct[]> {
  return Promise.all(mascots.map(hydrateMascotImages))
}

export async function resolveProductImageSrc(
  productId: string,
  index: number,
): Promise<string | null> {
  const direct = await readMascotImageBlob(productId, index)
  if (direct) return direct
  return null
}
