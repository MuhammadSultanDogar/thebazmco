const PK_MOBILE_RE = /^03[0-9]{9}$/

const FAKE_ADDRESS_RE = /^(.)\1{4,}$|^(test|asdf|n\/a|none|aaa+|xxx+)$/i

const PK_CITIES = [
  "karachi",
  "lahore",
  "islamabad",
  "rawalpindi",
  "faisalabad",
  "multan",
  "peshawar",
  "quetta",
  "sialkot",
  "gujranwala",
  "hyderabad",
  "abbottabad",
  "sargodha",
  "bahawalpur",
  "sukkur",
  "larkana",
  "mardan",
  "mirpur",
  "jhelum",
  "gujrat",
  "sahiwal",
  "okara",
  "sheikhupura",
  "kasur",
  "muzaffarabad",
]

export function normalizePakistaniPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return null

  let local = digits
  if (local.startsWith("92") && local.length === 12) {
    local = `0${local.slice(2)}`
  } else if (local.startsWith("920") && local.length === 13) {
    local = local.slice(2)
  }

  if (local.length === 10 && local.startsWith("3")) {
    local = `0${local}`
  }

  if (!PK_MOBILE_RE.test(local)) return null
  return local
}

export function formatPhoneDisplay(normalized: string): string {
  return `${normalized.slice(0, 4)} ${normalized.slice(4)}`
}

export function validatePakistaniPhone(raw: string): { ok: true; phone: string } | { ok: false; error: string } {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { ok: false, error: "Enter your mobile number" }
  }

  const phone = normalizePakistaniPhone(trimmed)
  if (!phone) {
    return {
      ok: false,
      error: "Enter a valid Pakistani mobile number (e.g. 0321 1234567)",
    }
  }

  return { ok: true, phone }
}

export function validateDeliveryAddress(raw: string): { ok: true; address: string } | { ok: false; error: string } {
  const address = raw.trim().replace(/\s+/g, " ")

  if (address.length < 20) {
    return {
      ok: false,
      error: "Enter your full delivery address (street, area, and city)",
    }
  }

  if (address.length > 500) {
    return { ok: false, error: "Address is too long" }
  }

  if (FAKE_ADDRESS_RE.test(address.replace(/\s/g, ""))) {
    return { ok: false, error: "Please enter a real delivery address" }
  }

  const lower = address.toLowerCase()
  const hasCity = PK_CITIES.some((city) => lower.includes(city))
  const wordCount = address.split(/\s+/).filter(Boolean).length

  if (!hasCity && wordCount < 4) {
    return {
      ok: false,
      error: "Include area and city in your address (e.g. DHA Phase 5, Karachi)",
    }
  }

  if (!/[a-zA-Z]/.test(address)) {
    return { ok: false, error: "Address must include street or area details" }
  }

  return { ok: true, address }
}
