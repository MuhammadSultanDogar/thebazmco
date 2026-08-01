import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export interface Invoice {
  id: string
  invoiceNumber: string
  createdAt: string
  
  // Client Info
  clientName: string
  clientContact: string
  
  // Booking Details
  eventDate: string
  eventType: string
  city: string
  location: string
  startTime: string
  endTime: string
  
  // Performance Details
  numberOfCostumes: number
  rate: string
  travelCost: string
  
  // Payment
  subtotal: string
  advancePaid: string
  remainingPaid: string
  discount: string
  balance: string
  paymentMethod: "cash" | "transfer"
  paymentStatus: "pending" | "paid"
  termsAndConditions?: string
}

// In-memory storage (use a database for production)
const invoices: Invoice[] = []
let invoiceCounter = 1

export async function GET() {
  return NextResponse.json(invoices)
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get("manager_session")

  if (authCookie?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()
    
    const invoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `TBZ-${new Date().getFullYear()}-${String(invoiceCounter++).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
      ...data,
    }
    
    invoices.unshift(invoice)
    return NextResponse.json(invoice)
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get("manager_session")

  if (authCookie?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()
    const index = invoices.findIndex((inv) => inv.id === data.id)
    
    if (index === -1) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }
    
    invoices[index] = { ...invoices[index], ...data }
    return NextResponse.json(invoices[index])
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get("manager_session")

  if (authCookie?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    const index = invoices.findIndex((inv) => inv.id === id)
    
    if (index === -1) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }
    
    invoices.splice(index, 1)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
