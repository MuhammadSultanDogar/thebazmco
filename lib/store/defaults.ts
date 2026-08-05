import { DEFAULT_PRODUCTS } from "@/lib/constants/products"
import { DEFAULT_PRE_ORDER } from "@/lib/types/pre-order"
import { DEFAULT_ORDER_NOTIFICATIONS, normalizeOrderNotifications } from "@/lib/types/order-notifications"
import type { SiteData } from "@/lib/types/site-data"
import type { PreOrderSettings } from "@/lib/types/pre-order"
import { normalizeMascotList } from "@/lib/utils/product-images"

export const DEFAULT_TERMS = `A 50% advance payment is required to confirm the booking.
The remaining amount must be cleared before the start of the event.
The client is responsible for ensuring the safety of the performer and the costume during the event. Any damage caused by the audience or guests will be chargeable to the client.
In case of event cancellation, notice must be given at least 48 hours in advance to be eligible for a refund of the advance payment.
If the event is delayed beyond the agreed performance time, it will not be our responsibility. Our team will be required to leave as per the committed schedule, even if the performance has not yet started.
The client must arrange proper crowd control. Our performer has the right to pause or stop the performance if the environment becomes unsafe.
Exact performance timing must be shared in advance. Any extension beyond the agreed duration will be chargeable.
Travel time and setup time are not included in performance time.
We are not responsible for any technical issues at the venue such as lighting, sound, or space limitations.
Photos and videos from the event may be used on our social media for promotional purposes unless the client requests otherwise in advance.`

export const DEFAULT_RATES = {
  "30min": "22,000",
  "1hour": "28,000",
  "1.5hours": "35,000",
}

export function createDefaultSiteData(): SiteData {
  return {
    mascots: DEFAULT_PRODUCTS.map((product) => ({ ...product, soldOut: product.soldOut ?? false })),
    rates: { ...DEFAULT_RATES },
    terms: DEFAULT_TERMS,
    preOrder: { ...DEFAULT_PRE_ORDER },
    orderNotifications: { ...DEFAULT_ORDER_NOTIFICATIONS },
    orders: [],
    invoices: [],
    orderCounter: 1,
    invoiceCounter: 1,
    updatedAt: new Date().toISOString(),
  }
}

function normalizePreOrder(raw: Partial<PreOrderSettings> | undefined): PreOrderSettings {
  const defaults = DEFAULT_PRE_ORDER
  if (!raw) return { ...defaults }

  return {
    enabled: raw.enabled ?? defaults.enabled,
    etaDays: raw.etaDays ?? defaults.etaDays,
    advanceAmount: raw.advanceAmount ?? defaults.advanceAmount,
    headline: raw.headline?.trim() || defaults.headline,
    details: raw.details?.trim() || defaults.details,
  }
}

export function normalizeSiteData(raw: Partial<SiteData> | null | undefined): SiteData {
  const defaults = createDefaultSiteData()
  if (!raw) return defaults

  return {
    mascots: Array.isArray(raw.mascots)
      ? normalizeMascotList(raw.mascots)
      : defaults.mascots,
    rates: raw.rates ?? defaults.rates,
    terms: raw.terms ?? defaults.terms,
    preOrder: normalizePreOrder(raw.preOrder),
    orderNotifications: normalizeOrderNotifications(raw.orderNotifications),
    orders: Array.isArray(raw.orders) ? raw.orders : defaults.orders,
    invoices: Array.isArray(raw.invoices) ? raw.invoices : defaults.invoices,
    orderCounter: raw.orderCounter ?? defaults.orderCounter,
    invoiceCounter: raw.invoiceCounter ?? defaults.invoiceCounter,
    updatedAt: raw.updatedAt ?? defaults.updatedAt,
  }
}
