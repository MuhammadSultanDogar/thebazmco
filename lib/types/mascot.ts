export interface MascotAccessory {
  id: string
  name: string
  price: string
  soldOut?: boolean
}

export type MascotCategory = "mascot" | "accessory"

export interface MascotProduct {
  id: string
  name: string
  description: string
  price: string
  /** Primary image (first in `images`) — kept for backward compatibility */
  image: string
  /** Multiple product photos */
  images?: string[]
  shipping: string
  accessories: MascotAccessory[]
  category: MascotCategory
  featured: boolean
  active: boolean
  soldOut?: boolean
  /** When global pre-order is on, this mascot uses pre-order pricing & advance checkout */
  preOrder?: boolean
  /** Shown crossed out during pre-order when set */
  originalPrice?: string
  sortOrder: number
}

export const createAccessory = (name = "", price = ""): MascotAccessory => ({
  id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name,
  price,
})

export const createEmptyProduct = (): Omit<MascotProduct, "id" | "sortOrder"> => ({
  name: "",
  description: "",
  price: "",
  image: "",
  images: [],
  shipping: "",
  accessories: [],
  category: "mascot",
  featured: false,
  active: true,
  soldOut: false,
  preOrder: false,
})
