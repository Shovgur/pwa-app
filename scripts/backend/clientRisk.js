/**
 * Pure client risk badge rules (12 months).
 */
import {
  CLIENT_RISK_LOOKBACK_MONTHS,
  CLIENT_RISK_LOW_AVG,
  CLIENT_RISK_LOW_RATING,
  CLIENT_RISK_MIN_COUNT,
  CLIENT_RISK_PRESETS,
} from './reviewConstants.js'

/**
 * @param {Array<{ rating: number, presets?: string[], createdAt: string|Date }>} reviews
 * @param {Date} [now]
 * @returns {{ warning: boolean, reasons: string[] }}
 */
export function computeClientRisk(reviews, now = new Date()) {
  const cutoff = new Date(now)
  cutoff.setMonth(cutoff.getMonth() - CLIENT_RISK_LOOKBACK_MONTHS)

  const recent = (reviews || []).filter((r) => {
    const t = new Date(r.createdAt).getTime()
    return Number.isFinite(t) && t >= cutoff.getTime()
  })

  const reasons = []
  const presetHit = recent.some((r) =>
    (r.presets || []).some((p) => CLIENT_RISK_PRESETS.includes(p)),
  )
  if (presetHit) reasons.push('incident_preset')

  const lowRatings = recent.filter((r) => Number(r.rating) <= CLIENT_RISK_LOW_RATING)
  if (lowRatings.length >= CLIENT_RISK_MIN_COUNT) reasons.push('low_ratings')

  if (recent.length >= CLIENT_RISK_MIN_COUNT) {
    const avg = recent.reduce((s, r) => s + Number(r.rating), 0) / recent.length
    if (avg <= CLIENT_RISK_LOW_AVG) reasons.push('low_avg')
  }

  return { warning: reasons.length > 0, reasons }
}
