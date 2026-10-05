/**
 * Import a backup file into a (new) Upstash database.
 *
 *   export UPSTASH_REDIS_REST_URL="..."   # NEW database credentials
 *   export UPSTASH_REDIS_REST_TOKEN="..."
 *   node scripts/import-upstash-backup.mjs thebazm-backup-2026-10-05.json
 */

import { Redis } from "@upstash/redis"
import fs from "fs"

const SITE_DATA_KEY = "thebazm:site-data"
const ORDERS_KEY = "thebazm:orders"

function requireEnv() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error("Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for the NEW database.")
    process.exit(1)
  }
}

async function main() {
  requireEnv()
  const file = process.argv[2]
  if (!file || !fs.existsSync(file)) {
    console.error("Usage: node scripts/import-upstash-backup.mjs <backup.json>")
    process.exit(1)
  }

  const backup = JSON.parse(fs.readFileSync(file, "utf8"))
  const redis = Redis.fromEnv()

  await redis.ping()
  console.log("Importing into Upstash…")

  if (backup.siteData) {
    await redis.set(SITE_DATA_KEY, backup.siteData)
    console.log("  ✓ site-data")
  }

  if (backup.orders) {
    await redis.set(ORDERS_KEY, backup.orders)
    console.log("  ✓ orders")
  }

  const imageKeys = backup.imageKeys ?? {}
  for (const [key, value] of Object.entries(imageKeys)) {
    if (value != null) await redis.set(key, value)
  }
  console.log(`  ✓ ${Object.keys(imageKeys).length} image keys`)

  console.log("Done. Update Vercel env vars to this NEW database and redeploy.")
}

main().catch((err) => {
  console.error("Import failed:", err.message)
  process.exit(1)
})
