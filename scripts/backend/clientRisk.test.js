import { describe, expect, it } from 'vitest'
import { computeClientRisk } from './clientRisk.js'

const now = new Date('2026-11-11T12:00:00.000Z')

function rev(rating, presets, monthsAgo) {
  const d = new Date(now)
  d.setMonth(d.getMonth() - monthsAgo)
  return { rating, presets, createdAt: d.toISOString() }
}

describe('computeClientRisk', () => {
  it('без отзывов — без warning', () => {
    expect(computeClientRisk([], now)).toEqual({ warning: false, reasons: [] })
  })

  it('одна оценка ≤2 — ещё не warning', () => {
    expect(computeClientRisk([rev(2, [], 1)], now).warning).toBe(false)
  })

  it('две оценки ≤2 — warning', () => {
    const r = computeClientRisk([rev(1, [], 1), rev(2, [], 2)], now)
    expect(r.warning).toBe(true)
    expect(r.reasons).toContain('low_ratings')
  })

  it('avg≤2.5 при count≥2', () => {
    const r = computeClientRisk([rev(2, [], 1), rev(3, [], 1)], now)
    expect(r.warning).toBe(true)
    expect(r.reasons).toContain('low_avg')
  })

  it('avg 2.6 — не low_avg', () => {
    const r = computeClientRisk([rev(2, [], 1), rev(4, [], 1)], now)
    expect(r.reasons).not.toContain('low_avg')
  })

  it('preset no_show/damage/unpaid', () => {
    const r = computeClientRisk([rev(5, ['no_show'], 1)], now)
    expect(r.warning).toBe(true)
    expect(r.reasons).toContain('incident_preset')
  })

  it('старше 12 месяцев не считается', () => {
    const r = computeClientRisk([rev(1, ['damage'], 13), rev(1, [], 13)], now)
    expect(r.warning).toBe(false)
  })

  it('граница 11 месяцев входит', () => {
    const r = computeClientRisk([rev(1, ['unpaid'], 11)], now)
    expect(r.warning).toBe(true)
  })
})
