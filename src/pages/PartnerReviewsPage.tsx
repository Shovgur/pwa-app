import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquareText, Star } from 'lucide-react'
import {
  fetchPartnerVenueReviews,
  replyPartnerVenueReview,
  type PartnerVenueReview,
  VENUE_REVIEW_TAGS,
} from '../lib/venueReviews'
import { features } from '../config/features'
import { formatRating } from '../utils/rating'

function tagLabel(id: string): string {
  return VENUE_REVIEW_TAGS.find((t) => t.id === id)?.label ?? id
}

export function PartnerReviewsPage() {
  const [reviews, setReviews] = useState<PartnerVenueReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unreplied'>('all')
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [busyId, setBusyId] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!features.venueReviews) {
      setReviews([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const list = await fetchPartnerVenueReviews(
        filter === 'unreplied' ? { replied: false } : undefined,
      )
      setReviews(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить отзывы')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    void reload()
  }, [reload])

  async function sendReply(reviewId: string) {
    const text = (replyDrafts[reviewId] || '').trim()
    if (!text) return
    setBusyId(reviewId)
    setError(null)
    try {
      await replyPartnerVenueReview(reviewId, text)
      setReplyDrafts((prev) => {
        const next = { ...prev }
        delete next[reviewId]
        return next
      })
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось ответить')
    } finally {
      setBusyId(null)
    }
  }

  if (!features.venueReviews) {
    return (
      <div className="dashboard-page">
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F1F5F9' }}>Отзывы</h1>
        <p style={{ color: '#64748b' }}>Раздел будет доступен после включения отзывов.</p>
      </div>
    )
  }

  const published = reviews.filter((r) => r.status === 'published')
  const avg = published.length
    ? published.reduce((s, r) => s + r.rating, 0) / published.length
    : null

  return (
    <div className="dashboard-page">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F1F5F9', margin: 0, fontFamily: 'var(--font-display)' }}>
              Отзывы
            </h1>
            <p style={{ color: '#64748b', fontSize: 14, margin: '6px 0 0' }}>
              Отзывы клиентов о ваших площадках
            </p>
          </div>
          {avg != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24', fontWeight: 800 }}>
              <Star size={18} fill="#EAB308" color="#EAB308" />
              {formatRating(avg)}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {([
            { id: 'all', label: 'Все' },
            { id: 'unreplied', label: 'Без ответа' },
          ] as const).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 600,
                fontSize: 13,
                background: filter === f.id ? '#22c55e' : '#222D3F',
                color: filter === f.id ? '#fff' : '#94a3b8',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ marginBottom: 12, color: '#fca5a5', fontSize: 13 }}>{error}</div>
        )}

        {loading ? (
          <p style={{ color: '#64748b' }}>Загрузка…</p>
        ) : reviews.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 20px',
              background: '#222D3F',
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <MessageSquareText size={40} color="#64748b" style={{ marginBottom: 12 }} />
            <div style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: 6 }}>Отзывов пока нет</div>
            <div style={{ color: '#64748b', fontSize: 14 }}>
              Когда гости оценят визит, отзывы появятся здесь
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.map((r) => (
              <article
                key={r.id}
                style={{
                  padding: 16,
                  borderRadius: 16,
                  background: '#222D3F',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{r.venueName}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {r.authorDisplayName} · {r.status}
                    </div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: '#fbbf24', fontWeight: 700 }}>
                    <Star size={14} fill="#EAB308" color="#EAB308" />
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
                  <p style={{ margin: '0 0 12px', color: '#cbd5e1', fontSize: 14, lineHeight: 1.5 }}>{r.text}</p>
                ) : null}

                {r.reply ? (
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      background: 'rgba(59,130,246,0.08)',
                      border: '1px solid rgba(59,130,246,0.2)',
                      color: '#cbd5e1',
                      fontSize: 13,
                    }}
                  >
                    <strong style={{ color: '#93c5fd' }}>Ваш ответ:</strong> {r.reply.text}
                  </div>
                ) : r.status === 'published' || r.status === 'pending' ? (
                  <div>
                    <textarea
                      value={replyDrafts[r.id] || ''}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({
                          ...prev,
                          [r.id]: e.target.value.slice(0, 1000),
                        }))
                      }
                      placeholder="Ответить гостю…"
                      rows={3}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(15,23,42,0.5)',
                        color: '#e2e8f0',
                        padding: 10,
                        fontFamily: 'inherit',
                        fontSize: 13,
                        marginBottom: 8,
                      }}
                    />
                    <button
                      type="button"
                      disabled={busyId === r.id || !(replyDrafts[r.id] || '').trim()}
                      onClick={() => void sendReply(r.id)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 10,
                        border: 'none',
                        background: '#3b82f6',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        opacity: busyId === r.id ? 0.7 : 1,
                      }}
                    >
                      {busyId === r.id ? 'Отправляем…' : 'Ответить'}
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
