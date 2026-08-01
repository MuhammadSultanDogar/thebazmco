import { mkdir, readFile, writeFile } from "fs/promises"
import path from "path"
import type { SiteData } from "@/lib/types/site-data"
import { normalizeSiteData } from "@/lib/store/defaults"

const LOCAL_DATA_PATH = path.join(process.cwd(), ".data", "site-data.json")

export async function readFromLocalFile(): Promise<SiteData | null> {
  try {
    const raw = await readFile(LOCAL_DATA_PATH, "utf-8")
    return normalizeSiteData(JSON.parse(raw) as Partial<SiteData>)
  } catch {
    return null
  }
}

export async function writeToLocalFile(data: SiteData) {
  await mkdir(path.dirname(LOCAL_DATA_PATH), { recursive: true })
  const payload = JSON.stringify(data, null, 2)
  await writeFile(LOCAL_DATA_PATH, payload, "utf-8")
}

export function getLocalDataPath() {
  return LOCAL_DATA_PATH
}
