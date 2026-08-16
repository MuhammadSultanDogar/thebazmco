export type ShippingSettings = {
  /** Order subtotal at or above this amount gets free shipping (PKR) */
  freeShippingMinimum: number
}

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  freeShippingMinimum: 10000,
}
