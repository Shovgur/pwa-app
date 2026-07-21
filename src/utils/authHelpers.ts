/** Detect if the login input is a phone number rather than email. */
export function isPhoneInput(value: string): boolean {
  const v = value.trim()
  if (!v || v.includes('@')) return false
  const digits = v.replace(/\D/g, '')
  return digits.length >= 10
}

/** Normalize RU phone to +7XXXXXXXXXX when possible. */
export function normalizePhone(phone: string): string {
  let p = phone.replace(/[\s\-()]/g, '')
  if (p.startsWith('8') && p.length === 11) p = '+7' + p.slice(1)
  else if (p.startsWith('7') && p.length === 11 && !p.startsWith('+')) p = '+' + p
  else if (/^\d{10}$/.test(p)) p = '+7' + p
  return p
}

/** Backend duplicate-email signals (500/409, Postgres unique constraint, etc.). */
export function isDuplicateEmailError(message: string, status?: number): boolean {
  const m = message.toLowerCase()
  return (
    status === 409 ||
    m.includes('already registered') ||
    m.includes('already exists') ||
    m.includes('users_email_key') ||
    m.includes('duplicate key') ||
    m.includes('registration failed') ||
    m.includes('уже зарегистрирован')
  )
}

/** Build login payload: either email or phone + password. */
export function buildLoginPayload(login: string, password: string) {
  const trimmed = login.trim()
  if (isPhoneInput(trimmed)) {
    return { phone: normalizePhone(trimmed), password }
  }
  return { email: trimmed, password }
}
