export interface MascotAccessory {
  id: string
  name: string
  price: string
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
})
