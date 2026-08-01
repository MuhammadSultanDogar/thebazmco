import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// In-memory storage for terms
let termsAndConditions = `A 50% advance payment is required to confirm the booking.
The remaining amount must be cleared before the start of the event.
The client is responsible for ensuring the safety of the performer and the costume during the event. Any damage caused by the audience or guests will be chargeable to the client.
In case of event cancellation, notice must be given at least 48 hours in advance to be eligible for a refund of the advance payment.
If the event is delayed beyond the agreed performance time, it will not be our responsibility. Our team will be required to leave as per the committed schedule, even if the performance has not yet started.
The client must arrange proper crowd control. Our performer has the right to pause or stop the performance if the environment becomes unsafe.
Exact performance timing must be shared in advance. Any extension beyond the agreed duration will be chargeable.
Travel time and setup time are not included in performance time.
We are not responsible for any technical issues at the venue such as lighting, sound, or space limitations.
Photos and videos from the event may be used on our social media for promotional purposes unless the client requests otherwise in advance.`

export async function GET() {
  return NextResponse.json({ terms: termsAndConditions })
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get("manager_session")

  if (authCookie?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { terms } = await request.json()

    if (!terms || typeof terms !== "string") {
      return NextResponse.json({ error: "Terms are required" }, { status: 400 })
    }

    termsAndConditions = terms
    return NextResponse.json({ success: true, terms: termsAndConditions })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
