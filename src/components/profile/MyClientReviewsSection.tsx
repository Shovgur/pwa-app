import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { features } from '../../config/features'
import {
  CLIENT_REVIEW_PRESETS,
  fetchMyClientReviews,
  type MyClientReview,
} from '../../lib/clientReviews'

function presetLabel(id: string): string {
  return CLIENT_REVIEW_PRESETS.find((p) => p.id === id)?.label ?? id
}

/** «Отзывы обо мне» — без ФИО автора. */
export function MyClientReviewsSection() {
  const [reviews, setReviews] = useState<MyClientReview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!features.clientReviews) {
      setLoading(false)
      return
    }
    let cancelled = false
    void fetchMyClientReviews()
      .then((list) => { if (!cancelled) setReviews(list) })
      .catch(() => { if (!cancelled) setReviews([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (!features.clientReviews) return null

  return (
    <section style={{ marginTop: 28 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', margin: '0 0 12px' }}>
        Отзывы обо мне
      </h2>
      <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 14px', lineHeight: 1.5 }}>
        Оценки площадок после визита. Имена сотрудников не показываются.
      </p>
      {loading ? (
        <p style={{ color: '#64748b', fontSize: 13 }}>Загрузка…</p>
      ) : reviews.length === 0 ? (
        <p style={{ color: '#64748b', fontSize: 13 }}>Пока нет отзывов о ваших визитах.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reviews.map((r, i) => (
            <article
              key={`${r.createdAt}-${i}`}
              style={{
                padding: 14,
                borderRadius: 14,
                background: '#222D3F',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                <strong style={{ color: '#e2e8f0', fontSize: 14 }}>{r.venueName}</strong>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: '#fbbf24', fontWeight: 700, fontSize: 13 }}>
                  <Star size={12} fill="#EAB308" color="#EAB308" />
                  {r.rating}
                </span>
              </div>
              {r.presets.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                  {r.presets.map((p) => (
                    <span
                      key={p}
                      style={{
                        fontSize: 11,
                        padding: '3px 8px',
                        borderRadius: 999,
                        background: 'rgba(245,158,11,0.12)',
                        color: '#fcd34d',
                      }}
                    >
                      {presetLabel(p)}
                    </span>
                  ))}
                </div>
              )}
              {r.text ? (
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: 13, lineHeight: 1.5 }}>{r.text}</p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
