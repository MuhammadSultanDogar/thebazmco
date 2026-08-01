export interface Invoice {
  id: string
  invoiceNumber: string
  createdAt: string
  clientName: string
  clientContact: string
  eventDate: string
  eventType: string
  city: string
  location: string
  startTime: string
  endTime: string
  numberOfCostumes: number
  rate: string
  travelCost: string
  subtotal: string
  advancePaid: string
  remainingPaid: string
  discount: string
  balance: string
  paymentMethod: "cash" | "transfer"
  paymentStatus: "pending" | "paid"
  termsAndConditions?: string
}
