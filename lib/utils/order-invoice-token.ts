import { randomBytes } from "crypto"

export function createOrderInvoiceToken(): string {
  return randomBytes(24).toString("hex")
}
