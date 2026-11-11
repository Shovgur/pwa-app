import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import {
  fetchPublicVenueReviews,
  fetchPublicVenueReviewSummary,
  type PublicVenueReview,
  type VenueReviewSummary,
  VENUE_REVIEW_TAGS,
} from '../../lib/venueReviews'
import { formatRating, hasPublicRating } from '../../utils/rating'
import { features } from '../../config/features'

function tagLabel(id: string): string {
  return VENUE_REVIEW_TAGS.find((t) => t.id === id)?.label ?? id
}

interface VenueReviewListProps {
  venueId: string
}

export function VenueReviewList({ venueId }: VenueReviewListProps) {
  const [summary, setSummary] = useState<VenueReviewSummary>({ ratingAvg: null, ratingCount: 0 })
  const [reviews, setReviews] = useState<PublicVenueReview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!features.venueReviews) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    void Promise.all([
      fetchPublicVenueReviewSummary(venueId),
      fetchPublicVenueReviews(venueId),
    ]).then(([s, list]) => {
      if (cancelled) return
      setSummary(s)
      setReviews(list)
      setLoading(false)
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [venueId])

  if (!features.venueReviews) return null
  if (loading) {
    return (
      <section style={{ marginTop: 32 }}>
        <p style={{ color: '#64748b', fontSize: 14 }}>Загружаем отзывы…</p>
      </section>
    )
  }
  if (!hasPublicRating(summary.ratingAvg, summary.ratingCount)) {
    return (
      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>Отзывы</h2>
        <p style={{ color: '#64748b', fontSize: 14 }}>Пока нет опубликованных отзывов.</p>
      </section>
    )
  }

  return (
    <section style={{ marginTop: 32 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Отзывы</h2>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#fbbf24', fontWeight: 700 }}>
          <Star size={16} fill="#EAB308" color="#EAB308" />
          {formatRating(summary.ratingAvg as number)}
        </span>
        <span style={{ color: '#64748b', fontSize: 13 }}>{summary.ratingCount}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {reviews.map((r) => (
          <article
            key={r.id}
            style={{
              padding: 16,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
              <strong style={{ color: '#e2e8f0', fontSize: 14 }}>{r.authorDisplayName}</strong>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: '#fbbf24', fontSize: 13, fontWeight: 700 }}>
                <Star size={12} fill="#EAB308" color="#EAB308" />
                {r.rating}
              </span>
            </div>
            {r.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {r.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 11,
                      padding: '3px 8px',
                      borderRadius: 999,
                      background: 'rgba(34,197,94,0.12)',
                      color: '#86efac',
                    }}
                  >
                    {tagLabel(t)}
                  </span>
                ))}
              </div>
            )}
            {r.text ? (
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: 14, lineHeight: 1.55 }}>{r.text}</p>
            ) : null}
            {r.reply?.text ? (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 12,
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.2)',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: '#93c5fd', marginBottom: 4 }}>
                  Ответ площадки
                </div>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: 13, lineHeight: 1.5 }}>{r.reply.text}</p>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}
