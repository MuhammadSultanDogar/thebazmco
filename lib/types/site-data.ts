import type { MascotProduct } from "@/lib/types/mascot"
import type { PreOrderSettings } from "@/lib/types/pre-order"
import type { OrderNotificationSettings } from "@/lib/types/order-notifications"
import type { ShopOrder } from "@/lib/types/order"
import type { Invoice } from "@/lib/types/invoice"

export type PerformanceRates = {
  "30min": string
  "1hour": string
  "1.5hours": string
}

export type SiteData = {
  mascots: MascotProduct[]
  rates: PerformanceRates
  terms: string
  preOrder: PreOrderSettings
  orderNotifications: OrderNotificationSettings
  orders: ShopOrder[]
  invoices: Invoice[]
  orderCounter: number
  invoiceCounter: number
  updatedAt: string
}

export type StorageBackend = "upstash-redis" | "local-file" | "memory"

export type StorageInfo = {
  backend: StorageBackend
  persistent: boolean
  configured: boolean
  updatedAt: string | null
  dataSizeBytes: number | null
  connectionLabel: string | null
  databaseReachable: boolean
  vercelEnv: string | null
  counts: {
    mascots: number
    activeMascots: number
    orders: number
    invoices: number
  }
  message: string
  helpSteps: string[]
}
