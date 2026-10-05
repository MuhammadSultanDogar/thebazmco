/**
 * Export TheBazm data from Upstash to a JSON file (run on your Mac, not on Vercel).
 *
 * Setup:
 *   1. Get REST URL + token from console.upstash.com OR Vercel → Project → Settings → Env Vars
 *   2. export UPSTASH_REDIS_REST_URL="..."
 *      export UPSTASH_REDIS_REST_TOKEN="..."
 *   3. node scripts/export-upstash-backup.mjs
 *
 * Output: thebazm-backup-YYYY-MM-DD.json in the current folder
 */

import { Redis } from "@upstash/redis"
import fs from "fs"

const SITE_DATA_KEY = "thebazm:site-data"
const ORDERS_KEY = "thebazm:orders"
const IMAGE_PREFIX = "thebazm:img:"

function requireEnv() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error(
      "Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN.\n" +
        "Set them from Upstash Console → your database → REST API.",
    )
    process.exit(1)
  }
}

async function scanImageKeys(redis) {
  const imageKeys = {}
  let cursor = 0
  do {
    const [nextCursor, keys] = await redis.scan(cursor, {
      match: `${IMAGE_PREFIX}*`,
      count: 100,
    })
    cursor = Number(nextCursor)
    for (const key of keys) {
      imageKeys[key] = await redis.get(key)
    }
  } while (cursor !== 0)
  return imageKeys
}

async function main() {
  requireEnv()
  const redis = Redis.fromEnv()

  console.log("Connecting to Upstash…")
  await redis.ping()

  console.log("Reading site data…")
  const siteData = await redis.get(SITE_DATA_KEY)
  const orders = await redis.get(ORDERS_KEY)

  console.log("Scanning product image keys…")
  const imageKeys = await scanImageKeys(redis)

  const backup = {
    exportedAt: new Date().toISOString(),
    version: 1,
    siteData,
    orders,
    imageKeys,
  }

  const filename = `thebazm-backup-${new Date().toISOString().slice(0, 10)}.json`
  fs.writeFileSync(filename, JSON.stringify(backup, null, 2))
  console.log(`Saved ${filename}`)
  console.log(
    `Keys: site-data=${siteData ? "yes" : "no"}, orders=${Array.isArray(orders) ? orders.length : 0}, images=${Object.keys(imageKeys).length}`,
  )
}

main().catch((err) => {
  console.error("Export failed:", err.message)
  console.error(
    "\nIf you see rate limit / bandwidth errors, try Upstash Console → Support,\n" +
      "or wait until the monthly reset. You may still have an older backup JSON from Manager.",
  )
  process.exit(1)
})
