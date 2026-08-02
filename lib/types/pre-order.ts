export type PreOrderSettings = {
  enabled: boolean
  etaDays: number
  advanceAmount: number
  headline: string
  details: string
}

export const DEFAULT_PRE_ORDER: PreOrderSettings = {
  enabled: false,
  etaDays: 10,
  advanceAmount: 10000,
  headline: "Pre-order now — stock arriving in ~10 days",
  details:
    "Reserve at today's special pre-order price. Pay PKR 10,000 advance per mascot to hold your piece — add PKR 10,000 for each additional mascot. Balance due before shipping.",
}
