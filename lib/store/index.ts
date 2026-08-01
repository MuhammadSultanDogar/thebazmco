import { head, list, put } from "@vercel/blob"
import type { SiteData } from "@/lib/types/site-data"
import { createDefaultSiteData } from "@/lib/store/defaults"

const BLOB_PATH = "thebazm-site-data.json"

let memoryStore: SiteData | null = null
let memoryLoaded = false

function useBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

async function readFromBlob(): Promise<SiteData | null> {
  if (!useBlob()) return null

  try {
    const blobs = await list({ prefix: BLOB_PATH, limit: 1 })
    const match = blobs.blobs.find((blob) => blob.pathname === BLOB_PATH)
    if (!match) return null

    const meta = await head(match.url)
    const res = await fetch(meta.url, { cache: "no-store" })
    if (!res.ok) return null
    return (await res.json()) as SiteData
  } catch {
    return null
  }
}

async function writeToBlob(data: SiteData) {
  await put(BLOB_PATH, JSON.stringify(data), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  })
}

export async function loadSiteData(): Promise<SiteData> {
  if (!useBlob()) {
    if (!memoryLoaded) {
      memoryStore = createDefaultSiteData()
      memoryLoaded = true
    }
    return structuredClone(memoryStore!)
  }

  const stored = await readFromBlob()
  if (stored) {
    memoryStore = stored
    memoryLoaded = true
    return structuredClone(stored)
  }

  const defaults = createDefaultSiteData()
  memoryStore = defaults
  memoryLoaded = true
  await writeToBlob(defaults)
  return structuredClone(defaults)
}

export async function saveSiteData(data: SiteData): Promise<void> {
  memoryStore = structuredClone(data)
  memoryLoaded = true

  if (useBlob()) {
    await writeToBlob(data)
  }
}

export async function updateSiteData(
  updater: (data: SiteData) => SiteData | void,
): Promise<SiteData> {
  const current = await loadSiteData()
  const draft = structuredClone(current)
  const result = updater(draft)
  const next = (result ?? draft) as SiteData
  await saveSiteData(next)
  return structuredClone(next)
}
