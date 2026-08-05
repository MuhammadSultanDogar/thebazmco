import { CONTACT_EMAIL } from "@/lib/constants/contact"

export type OrderNotificationSettings = {
  enabled: boolean
  email: string
}

export const DEFAULT_ORDER_NOTIFICATIONS: OrderNotificationSettings = {
  enabled: true,
  email: CONTACT_EMAIL,
}

export function normalizeOrderNotifications(
  raw: Partial<OrderNotificationSettings> | undefined,
): OrderNotificationSettings {
  const defaults = DEFAULT_ORDER_NOTIFICATIONS
  if (!raw) return { ...defaults }

  const email = raw.email?.trim() || defaults.email

  return {
    enabled: raw.enabled ?? defaults.enabled,
    email,
  }
}

export function isValidNotificationEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
