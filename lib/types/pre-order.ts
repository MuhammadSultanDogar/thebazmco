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
  headline: "Pre-order now — selected mascots, stock arriving in ~10 days",
  details:
    "Selected mascots are open for pre-order at special prices. Pay PKR 10,000 advance per pre-order mascot in your cart; in-stock items are charged in full. Balance due before shipping. Pre-order advance is non-refundable.",
}
