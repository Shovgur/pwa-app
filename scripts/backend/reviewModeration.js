/**
 * Lightweight text premod for venue/client reviews.
 * Pure functions — no I/O.
 */

const PHONE_RE = /(?:\+?7|8)[\s\-()]*\d{3}[\s\-()]*\d{3}[\s\-()]*\d{2}[\s\-()]*\d{2}|\d{10,11}/i
const URL_RE = /https?:\/\/|www\.|[a-z0-9-]+\.(ru|com|net|org)\b/i
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
const TELEGRAM_RE = /(?:t\.me\/|@)[a-zA-Z0-9_]{4,}/i

/** Minimal RU stoplist — extend via REVIEW_STOPLIST env (comma-separated). */
const DEFAULT_STOPLIST = [
  'сука',
  'бля',
  'хуй',
  'пизд',
  'ебан',
  'мудак',
]

function stoplist() {
  const fromEnv = String(process.env.REVIEW_STOPLIST || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  return [...DEFAULT_STOPLIST, ...fromEnv]
}

function isMostlyCaps(text) {
  const letters = text.replace(/[^a-zA-Zа-яА-ЯёЁ]/g, '')
  if (letters.length < 12) return false
  const upper = letters.replace(/[^A-ZА-ЯЁ]/g, '').length
  return upper / letters.length >= 0.7
}

/**
 * @param {string|null|undefined} text
 * @returns {{ verdict: 'publish'|'hold'|'reject', flags: string[] }}
 */
export function moderateText(text) {
  const raw = typeof text === 'string' ? text.trim() : ''
  if (!raw) {
    return { verdict: 'publish', flags: [] }
  }

  const flags = []
  const lower = raw.toLowerCase()

  if (PHONE_RE.test(raw)) flags.push('phone')
  if (URL_RE.test(raw) || EMAIL_RE.test(raw) || TELEGRAM_RE.test(raw)) flags.push('contact')
  if (isMostlyCaps(raw)) flags.push('caps')

  for (const word of stoplist()) {
    if (word && lower.includes(word)) {
      flags.push('profanity')
      break
    }
  }

  // Spam: same char repeated heavily
  if (/(.)\1{7,}/.test(raw)) flags.push('spam')

  if (flags.includes('profanity') && flags.length >= 2) {
    return { verdict: 'reject', flags }
  }
  if (flags.length > 0) {
    return { verdict: 'hold', flags }
  }
  return { verdict: 'publish', flags: [] }
}

/**
 * Status after create: clean text → published; hold → pending; reject → rejected.
 */
export function statusFromModeration(verdict) {
  if (verdict === 'publish') return 'published'
  if (verdict === 'reject') return 'rejected'
  return 'pending'
}
