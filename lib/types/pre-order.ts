export type PreOrderSettings = {
  enabled: boolean
  etaDays: number
  advanceAmount: number
  headline: string
  details: string
}

export const DEFAULT_PRE_ORDER: PreOrderSettings = {
  enabled: true,
  etaDays: 10,
  advanceAmount: 10000,
  headline: "Pre-order now — stock arriving in ~10 days",
  details:
    "Reserve your piece at today's special pre-order price. Pay only PKR 10,000 advance now — we'll hold your order until dispatch. Balance due before shipping.",
}
