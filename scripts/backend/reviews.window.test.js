import { describe, expect, it } from 'vitest'
import { computeSlotEnd, isWithinReviewWindow } from './reviews.js'

describe('review window', () => {
  it('computeSlotEnd строит Moscow offset', () => {
    const end = computeSlotEnd('2026-11-11', '18:00')
    expect(end.toISOString()).toBe('2026-11-11T15:00:00.000Z')
  })

  it('окно: до slot_end — false; сразу после — true; через 7д+ — false', () => {
    const slotEnd = computeSlotEnd('2026-11-11', '18:00')
    expect(isWithinReviewWindow(slotEnd, new Date(slotEnd.getTime() - 1000))).toBe(false)
    expect(isWithinReviewWindow(slotEnd, new Date(slotEnd.getTime() + 1000))).toBe(true)
    expect(
      isWithinReviewWindow(slotEnd, new Date(slotEnd.getTime() + 7 * 86400000 + 1000)),
    ).toBe(false)
    expect(
      isWithinReviewWindow(slotEnd, new Date(slotEnd.getTime() + 7 * 86400000 - 1000)),
    ).toBe(true)
  })
})
