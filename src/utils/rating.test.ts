import { describe, expect, it } from 'vitest'
import { formatRating, hasPublicRating, reviewsLabel } from './rating'

describe('hasPublicRating', () => {
  it('false без отзывов', () => {
    expect(hasPublicRating(4.9, 0)).toBe(false)
    expect(hasPublicRating(null, 12)).toBe(false)
    expect(hasPublicRating(undefined, undefined)).toBe(false)
    expect(hasPublicRating(NaN, 3)).toBe(false)
  })

  it('true при валидной оценке и count≥1', () => {
    expect(hasPublicRating(4.5, 1)).toBe(true)
    expect(hasPublicRating(5, 2)).toBe(true)
  })
})

describe('formatRating / reviewsLabel', () => {
  it('форматирует с запятой', () => {
    expect(formatRating(4.9)).toBe('4,9')
  })

  it('склоняет отзывы', () => {
    expect(reviewsLabel(1)).toBe('1 отзыв')
    expect(reviewsLabel(2)).toBe('2 отзыва')
    expect(reviewsLabel(5)).toBe('5 отзывов')
    expect(reviewsLabel(21)).toBe('21 отзыв')
    expect(reviewsLabel(12)).toBe('12 отзывов')
  })
})
