import type { MascotProduct } from "@/lib/types/mascot"

export const DEFAULT_PRODUCTS: MascotProduct[] = [
  {
    id: "mascot-black-gorilla",
    name: "Inflatable Black Gorilla",
    description:
      "Premium inflatable black gorilla mascot — bold, eye-catching, and built for standout events across Pakistan.",
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
      "Adorable inflatable panda mascot — perfect for birthdays, mall activations, and family-friendly events.",
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
      "Charming inflatable pink teddy mascot — ideal for weddings, baby showers, and retail activations.",
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
      "Striking inflatable gray gorilla mascot — a showstopper for corporate events, launches, and festivals.",
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
    description: "High-capacity battery pack for inflatable mascot costumes.",
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
    description: "Fast charger compatible with inflatable mascot battery systems.",
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
    description: "Durable connector cable for mascot inflation and power systems.",
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

const MASCOT_EMOJI: Record<string, string> = {
  "mascot-black-gorilla": "🦍",
  "mascot-panda": "🐼",
  "mascot-pink-teddy": "🧸",
  "mascot-gray-gorilla": "🦍",
  "acc-battery": "🔋",
  "acc-charger": "🔌",
  "acc-connector": "🔗",
}

export function getProductEmoji(id: string, category: string) {
  return MASCOT_EMOJI[id] ?? (category === "accessory" ? "⚡" : "🎭")
}
