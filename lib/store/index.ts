import { mkdir, readFile, writeFile } from "fs/promises"
import path from "path"
import { head, list, put } from "@vercel/blob"
import type { SiteData, StorageBackend, StorageInfo } from "@/lib/types/site-data"
import { createDefaultSiteData, normalizeSiteData } from "@/lib/store/defaults"

const BLOB_PATH = "thebazm-site-data.json"
const LOCAL_DATA_PATH = path.join(process.cwd(), ".data", "site-data.json")

let memoryStore: SiteData | null = null
let memoryLoaded = false
let lastBackend: StorageBackend = "memory"
let lastBlobSizeBytes: number | null = null

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN
}

function useBlob() {
  return Boolean(blobToken())
}

function blobOptions() {
  return { token: blobToken() }
}

async function readFromBlob(): Promise<SiteData | null> {
  if (!useBlob()) return null

  try {
    const { blobs } = await list({ prefix: "thebazm", limit: 20, ...blobOptions() })
    const match = blobs.find((blob) => blob.pathname === BLOB_PATH)
    if (!match) return null

    lastBlobSizeBytes = match.size

    const meta = await head(match.url, blobOptions())
    const res = await fetch(meta.downloadUrl, {
      headers: { Authorization: `Bearer ${blobToken()}` },
      cache: "no-store",
    })

    if (!res.ok) {
      console.error("Blob download failed:", res.status, res.statusText)
      return null
    }

    const parsed = normalizeSiteData((await res.json()) as Partial<SiteData>)
    lastBackend = "vercel-blob"
    return parsed
  } catch (error) {
    console.error("Blob read failed:", error)
    return null
  }
}

async function blobExists(): Promise<boolean> {
  if (!useBlob()) return false
  const { blobs } = await list({ prefix: "thebazm", limit: 20, ...blobOptions() })
  return blobs.some((blob) => blob.pathname === BLOB_PATH)
}

async function writeToBlob(data: SiteData) {
  const payload = JSON.stringify(data)
  const result = await put(BLOB_PATH, payload, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    ...blobOptions(),
  })
  lastBlobSizeBytes = payload.length
  lastBackend = "vercel-blob"
  return result
}

async function readFromLocalFile(): Promise<SiteData | null> {
  try {
    const raw = await readFile(LOCAL_DATA_PATH, "utf-8")
    const parsed = normalizeSiteData(JSON.parse(raw) as Partial<SiteData>)
    lastBackend = "local-file"
    lastBlobSizeBytes = Buffer.byteLength(raw, "utf-8")
    return parsed
  } catch {
    return null
  }
}

async function writeToLocalFile(data: SiteData) {
  await mkdir(path.dirname(LOCAL_DATA_PATH), { recursive: true })
  const payload = JSON.stringify(data, null, 2)
  await writeFile(LOCAL_DATA_PATH, payload, "utf-8")
  lastBackend = "local-file"
  lastBlobSizeBytes = Buffer.byteLength(payload, "utf-8")
}

async function persist(data: SiteData) {
  const next = {
    ...data,
    updatedAt: new Date().toISOString(),
  }

  if (useBlob()) {
    await writeToBlob(next)
    return next
  }

  if (process.env.NODE_ENV !== "production") {
    await writeToLocalFile(next)
    return next
  }

  lastBackend = "memory"
  return next
}

export async function loadSiteData(): Promise<SiteData> {
  if (memoryStore && memoryLoaded) {
    return structuredClone(memoryStore)
  }

  if (useBlob()) {
    const stored = await readFromBlob()
    if (stored) {
      memoryStore = stored
      memoryLoaded = true
      return structuredClone(stored)
    }

    if (!(await blobExists())) {
      const defaults = await persist(createDefaultSiteData())
      memoryStore = defaults
      memoryLoaded = true
      return structuredClone(defaults)
    }

    console.error("Site data blob exists but could not be read")
  } else if (process.env.NODE_ENV !== "production") {
    const local = await readFromLocalFile()
    if (local) {
      memoryStore = local
      memoryLoaded = true
      return structuredClone(local)
    }

    const defaults = await persist(createDefaultSiteData())
    memoryStore = defaults
    memoryLoaded = true
    return structuredClone(defaults)
  }

  memoryStore = createDefaultSiteData()
  memoryLoaded = true
  lastBackend = "memory"
  return structuredClone(memoryStore)
}

export async function saveSiteData(data: SiteData): Promise<SiteData> {
  const saved = await persist(data)
  memoryStore = structuredClone(saved)
  memoryLoaded = true
  return structuredClone(saved)
}

export async function updateSiteData(
  updater: (data: SiteData) => SiteData | void,
): Promise<SiteData> {
  const current = await loadSiteData()
  const draft = structuredClone(current)
  const result = updater(draft)
  const next = (result ?? draft) as SiteData
  return saveSiteData(next)
}

export async function replaceSiteData(raw: Partial<SiteData>): Promise<SiteData> {
  const current = await loadSiteData()
  const merged = normalizeSiteData({ ...current, ...raw })
  return saveSiteData(merged)
}

export async function getStorageInfo(): Promise<StorageInfo> {
  const data = await loadSiteData()

  if (useBlob()) {
    const exists = await blobExists()
    return {
      backend: "vercel-blob",
      persistent: true,
      configured: true,
      updatedAt: data.updatedAt ?? null,
      blobSizeBytes: lastBlobSizeBytes,
      counts: {
        mascots: data.mascots.length,
        activeMascots: data.mascots.filter((m) => m.active).length,
        orders: data.orders.length,
        invoices: data.invoices.length,
      },
      message: exists
        ? "Connected to Vercel Blob. Data persists across deploys."
        : "Blob token found. Waiting for first save to create storage file.",
    }
  }

  if (process.env.NODE_ENV !== "production") {
    return {
      backend: "local-file",
      persistent: true,
      configured: true,
      updatedAt: data.updatedAt ?? null,
      blobSizeBytes: lastBlobSizeBytes,
      counts: {
        mascots: data.mascots.length,
        activeMascots: data.mascots.filter((m) => m.active).length,
        orders: data.orders.length,
        invoices: data.invoices.length,
      },
      message: "Using local .data/site-data.json on this machine (dev only).",
    }
  }

  return {
    backend: "memory",
    persistent: false,
    configured: false,
    updatedAt: data.updatedAt ?? null,
    blobSizeBytes: null,
    counts: {
      mascots: data.mascots.length,
      activeMascots: data.mascots.filter((m) => m.active).length,
      orders: data.orders.length,
      invoices: data.invoices.length,
    },
    message:
      "NOT PERSISTENT — add Vercel Blob storage or data will reset on every deploy.",
  }
}

export async function exportSiteData(): Promise<SiteData> {
  return loadSiteData()
}
