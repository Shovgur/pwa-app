import { Star } from 'lucide-react'
import { formatRating, hasPublicRating, reviewsLabel } from '../../utils/rating'

interface RatingBadgeProps {
  rating: number | null | undefined
  count?: number | null
  /** Показать «N отзывов» рядом */
  showCount?: boolean
  size?: number
  className?: string
}

/** Звезда + оценка; null если отзывов ещё нет. */
export function RatingBadge({
  rating,
  count = 0,
  showCount = false,
  size = 15,
  className,
}: RatingBadgeProps) {
  if (!hasPublicRating(rating, count)) return null
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontWeight: 600,
      }}
    >
      <Star size={size} fill="#EAB308" color="#EAB308" aria-hidden />
      <span>{formatRating(rating as number)}</span>
      {showCount ? (
        <span style={{ fontWeight: 500, opacity: 0.85 }}>
          · {reviewsLabel(count ?? 0)}
        </span>
      ) : null}
    </span>
  )
}
