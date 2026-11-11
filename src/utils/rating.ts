/** Публичный рейтинг показываем только при реальных отзывах. */
export function hasPublicRating(
  rating: number | null | undefined,
  count: number | null | undefined = 0,
): boolean {
  if (rating == null || !Number.isFinite(rating)) return false
  if (rating < 1 || rating > 5) return false
  const n = count ?? 0
  return Number.isFinite(n) && n >= 1
}

export function formatRating(rating: number): string {
  return rating.toFixed(1).replace('.', ',')
}

export function reviewsLabel(count: number): string {
  const n = Math.max(0, Math.floor(count))
  const mod100 = n % 100
  const mod10 = n % 10
  if (mod100 >= 11 && mod100 <= 14) return `${n} отзывов`
  if (mod10 === 1) return `${n} отзыв`
  if (mod10 >= 2 && mod10 <= 4) return `${n} отзыва`
  return `${n} отзывов`
}
