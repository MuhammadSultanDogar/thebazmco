import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { MascotProduct } from "@/lib/types/mascot"

const defaultMascots: MascotProduct[] = [
  {
    id: "mascot-black-gorilla",
    name: "Inflatable Black Gorilla",
    description:
      "Premium inflatable black gorilla mascot — bold, eye-catching, and built for standout events and promotions across Pakistan.",
    price: "99,000",
    image: "",
    shipping: "2,500",
    accessories: [],
    category: "mascot",
    featured: true,
    active: true,
    sortOrder: 1,
  },
  {
    id: "mascot-panda",
    name: "Inflatable Panda",
    description:
      "Adorable inflatable panda mascot — perfect for birthdays, mall activations, and family-friendly brand events.",
    price: "109,000",
    image: "",
    shipping: "2,500",
    accessories: [],
    category: "mascot",
    featured: false,
    active: true,
    sortOrder: 2,
  },
  {
    id: "mascot-pink-teddy",
    name: "Inflatable Pink Teddy",
    description:
      "Charming inflatable pink teddy mascot — ideal for weddings, baby showers, and premium retail activations.",
    price: "109,000",
    image: "",
    shipping: "2,500",
    accessories: [],
    category: "mascot",
    featured: false,
    active: true,
    sortOrder: 3,
  },
  {
    id: "mascot-gray-gorilla",
    name: "Inflatable Gray Gorilla",
    description:
      "Striking inflatable gray gorilla mascot — a versatile showstopper for corporate events, launches, and festivals.",
    price: "109,000",
    image: "",
    shipping: "2,500",
    accessories: [],
    category: "mascot",
    featured: false,
    active: true,
    sortOrder: 4,
  },
  {
    id: "acc-battery",
    name: "Battery",
    description:
      "High-capacity battery pack for inflatable mascot costumes. Essential power for extended event use.",
    price: "5,000",
    image: "",
    shipping: "500",
    accessories: [],
    category: "accessory",
    featured: false,
    active: true,
    sortOrder: 5,
  },
  {
    id: "acc-charger",
    name: "Charger",
    description:
      "Fast charger compatible with inflatable mascot battery systems. Reliable power on the go.",
    price: "2,000",
    image: "",
    shipping: "500",
    accessories: [],
    category: "accessory",
    featured: false,
    active: true,
    sortOrder: 6,
  },
  {
    id: "acc-connector",
    name: "Connector",
    description:
      "Durable connector cable for mascot inflation and power systems. Built for repeated event use.",
    price: "200",
    image: "",
    shipping: "200",
    accessories: [],
    category: "accessory",
    featured: false,
    active: true,
    sortOrder: 7,
  },
]

let mascots: MascotProduct[] = [...defaultMascots]

async function isAuthenticated() {
  const cookieStore = await cookies()
  const session = cookieStore.get("manager_session")
  return session?.value === "authenticated"
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const showAll = searchParams.get("all") === "true"

  if (showAll && (await isAuthenticated())) {
    return NextResponse.json(
      [...mascots].sort((a, b) => a.sortOrder - b.sortOrder)
    )
  }

  const active = mascots
    .filter((m) => m.active)
    .map((m) => ({ ...m, category: m.category || "mascot" }))
    .sort((a, b) => a.sortOrder - b.sortOrder)
  return NextResponse.json(active)
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    if (body.action === "replace-all") {
      mascots = (body.mascots as MascotProduct[]).map((m, i) => ({
        ...m,
        sortOrder: m.sortOrder ?? i + 1,
      }))
      return NextResponse.json({ success: true, mascots })
    }

    const newProduct: MascotProduct = {
      id: `mascot-${Date.now()}`,
      name: body.name || "New Product",
      description: body.description || "",
      price: body.price || "0",
      image: body.image || "",
      shipping: body.shipping || "0",
      accessories: body.accessories || [],
      category: body.category || "mascot",
      featured: body.featured ?? false,
      active: body.active ?? true,
      sortOrder: mascots.length + 1,
    }
    mascots.push(newProduct)
    return NextResponse.json(newProduct)
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const index = mascots.findIndex((m) => m.id === body.id)
    if (index === -1) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    mascots[index] = { ...mascots[index], ...body, id: mascots[index].id }
    return NextResponse.json(mascots[index])
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  mascots = mascots.filter((m) => m.id !== id)
  return NextResponse.json({ success: true })
}
