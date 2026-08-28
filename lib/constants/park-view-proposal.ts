import type { ParkViewProposal } from "@/lib/types/park-view-proposal"
import { CONTACT_EMAIL } from "@/lib/constants/contact"

export const PROPOSAL_LOGO_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO%20SET%20%28THEBAZM.CO%29%20%281%29-Vyn5qZbbAAo85GDoYBp77NHmq9hJWu.png"

export const DEFAULT_PARK_VIEW_PROPOSAL: ParkViewProposal = {
  clientName: "PARK VIEW CITY",
  eventTitle: "DISNEY INFLATABLE MASCOTS PARADE",
  introText:
    "Thank you for considering The Bazm.co for your upcoming Disney Parade! Below is our quotation for the inflatable mascots you requested.",
  feature1Title: "Premium Quality",
  feature1Description: "Durable, eye-catching & event-ready",
  feature2Title: "Perfect for Parades",
  feature2Description: "Lightweight, easy to handle & great for large events",
  heroImageUrl: "",
  purchaseTitle: "PURCHASE PRICE (PER MASCOT)",
  purchaseTagline: "Take them home and own the fun! Yours to use, anytime you want.",
  purchaseItems: [
    { name: "MICKEY", price: "350,000" },
    { name: "MINNIE", price: "350,000" },
    { name: "DAISY", price: "340,000" },
    { name: "DONALD", price: "340,000" },
    { name: "GOOFY", price: "320,000" },
    { name: "PLUTO", price: "320,000" },
  ],
  ownershipSteps: ["Select Characters", "Secure Payment", "Fast Delivery"],
  performanceTitle: "PERFORMANCE (PER MASCOT)",
  performanceRate: "29,500",
  performanceLabel: "PER MASCOT PER HOUR",
  performanceDescription: "Our team will perform in the mascots and bring the magic to life!",
  bookingSteps: ["Review and Accept Quote", "Confirm Schedule", "Make Advance Payment"],
  validityDays: "14",
  contactEmail: CONTACT_EMAIL,
  contactPhone: "+92 317 357 3391",
  contactWebsite: "www.thebazm.co",
  instagramHandle: "@thebazm.co",
  closingTagline: "Let's create unforgettable moments together!",
}

export function normalizeParkViewProposal(
  raw: Partial<ParkViewProposal> | null | undefined,
): ParkViewProposal {
  const defaults = DEFAULT_PARK_VIEW_PROPOSAL
  if (!raw) return { ...defaults, purchaseItems: [...defaults.purchaseItems.map((i) => ({ ...i }))], ownershipSteps: [...defaults.ownershipSteps], bookingSteps: [...defaults.bookingSteps] }

  const purchaseItems =
    Array.isArray(raw.purchaseItems) && raw.purchaseItems.length > 0
      ? raw.purchaseItems.map((item, index) => ({
          name: item.name?.trim() || defaults.purchaseItems[index]?.name || `Item ${index + 1}`,
          price: item.price?.trim() || defaults.purchaseItems[index]?.price || "0",
          iconUrl: item.iconUrl?.trim() || undefined,
        }))
      : defaults.purchaseItems.map((i) => ({ ...i }))

  const ownershipSteps =
    Array.isArray(raw.ownershipSteps) && raw.ownershipSteps.length > 0
      ? raw.ownershipSteps.map((s, i) => s?.trim() || defaults.ownershipSteps[i] || "")
      : [...defaults.ownershipSteps]

  const bookingSteps =
    Array.isArray(raw.bookingSteps) && raw.bookingSteps.length > 0
      ? raw.bookingSteps.map((s, i) => s?.trim() || defaults.bookingSteps[i] || "")
      : [...defaults.bookingSteps]

  return {
    clientName: raw.clientName?.trim() || defaults.clientName,
    eventTitle: raw.eventTitle?.trim() || defaults.eventTitle,
    introText: raw.introText?.trim() || defaults.introText,
    feature1Title: raw.feature1Title?.trim() || defaults.feature1Title,
    feature1Description: raw.feature1Description?.trim() || defaults.feature1Description,
    feature2Title: raw.feature2Title?.trim() || defaults.feature2Title,
    feature2Description: raw.feature2Description?.trim() || defaults.feature2Description,
    heroImageUrl: raw.heroImageUrl?.trim() ?? defaults.heroImageUrl,
    purchaseTitle: raw.purchaseTitle?.trim() || defaults.purchaseTitle,
    purchaseTagline: raw.purchaseTagline?.trim() || defaults.purchaseTagline,
    purchaseItems,
    ownershipSteps,
    performanceTitle: raw.performanceTitle?.trim() || defaults.performanceTitle,
    performanceRate: raw.performanceRate?.trim() || defaults.performanceRate,
    performanceLabel: raw.performanceLabel?.trim() || defaults.performanceLabel,
    performanceDescription: raw.performanceDescription?.trim() || defaults.performanceDescription,
    bookingSteps,
    validityDays: raw.validityDays?.trim() || defaults.validityDays,
    contactEmail: raw.contactEmail?.trim() || defaults.contactEmail,
    contactPhone: raw.contactPhone?.trim() || defaults.contactPhone,
    contactWebsite: raw.contactWebsite?.trim() || defaults.contactWebsite,
    instagramHandle: raw.instagramHandle?.trim() || defaults.instagramHandle,
    closingTagline: raw.closingTagline?.trim() || defaults.closingTagline,
  }
}
