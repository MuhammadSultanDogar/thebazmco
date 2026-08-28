export type ParkViewPurchaseItem = {
  name: string
  price: string
  iconUrl?: string
}

export type ParkViewProposal = {
  clientName: string
  eventTitle: string
  introText: string
  feature1Title: string
  feature1Description: string
  feature2Title: string
  feature2Description: string
  heroImageUrl: string
  purchaseTitle: string
  purchaseTagline: string
  purchaseItems: ParkViewPurchaseItem[]
  ownershipSteps: string[]
  performanceTitle: string
  performanceRate: string
  performanceLabel: string
  performanceDescription: string
  bookingSteps: string[]
  validityDays: string
  contactEmail: string
  contactPhone: string
  contactWebsite: string
  instagramHandle: string
  closingTagline: string
}
