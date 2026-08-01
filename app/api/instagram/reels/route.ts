import { NextResponse } from "next/server"
import { fetchReelPreviews } from "@/lib/instagram/reels"

export const revalidate = 3600

export async function GET() {
  const reels = await fetchReelPreviews()
  return NextResponse.json(reels)
}
