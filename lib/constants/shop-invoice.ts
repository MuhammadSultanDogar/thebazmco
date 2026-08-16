import { PAYMENT_DETAILS } from "@/lib/constants/payment"
import { CONTACT_EMAIL } from "@/lib/constants/contact"

export const SHOP_INVOICE_TERMS = `100% advance payment is required before dispatch unless noted as a pre-order with balance due.
Pre-order advance payments are non-refundable once paid.
Delivery address must be accurate — delays caused by incorrect details are the customer's responsibility.
Orders are processed after payment verification via bank transfer to ${PAYMENT_DETAILS.bank}, account ${PAYMENT_DETAILS.accountNumber}.
For support contact us at ${CONTACT_EMAIL} or WhatsApp.`
