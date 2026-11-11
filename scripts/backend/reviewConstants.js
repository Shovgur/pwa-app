/** Shared review limits / tags / presets (Stage 1+). */

export const REVIEW_WINDOW_DAYS = 7
export const REVIEW_PROMPT_OFFSET_MINUTES = 15

export const VENUE_REVIEW_MAX_TEXT = 2000
export const CLIENT_REVIEW_MAX_TEXT = 300
export const CLIENT_REVIEW_MAX_PHOTOS = 3

export const VENUE_REVIEW_TAGS = Object.freeze([
  'clean',
  'location',
  'staff',
  'equipment',
  'value',
  'atmosphere',
])

export const CLIENT_REVIEW_PRESETS = Object.freeze([
  'on_time',
  'polite',
  'careful',
  'no_show',
  'damage',
  'mess',
  'unpaid',
  'other',
])

export const CLIENT_RISK_PRESETS = Object.freeze(['no_show', 'damage', 'unpaid'])
export const CLIENT_RISK_LOOKBACK_MONTHS = 12
export const CLIENT_RISK_LOW_RATING = 2
export const CLIENT_RISK_LOW_AVG = 2.5
export const CLIENT_RISK_MIN_COUNT = 2

export function featureVenueReviewsEnabled() {
  return String(process.env.FEATURE_VENUE_REVIEWS || '').toLowerCase() === 'true'
}

export function featureClientReviewsEnabled() {
  return String(process.env.FEATURE_CLIENT_REVIEWS || '').toLowerCase() === 'true'
}
