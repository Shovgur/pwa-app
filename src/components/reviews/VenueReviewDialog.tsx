import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { Star, X } from 'lucide-react'
import { createVenueReview, VENUE_REVIEW_TAGS } from '../../lib/venueReviews'

interface VenueReviewDialogProps {
  bookingId: number | string
  venueName: string
  open: boolean
  onClose: () => void
  onSubmitted?: () => void
}

export function VenueReviewDialog({
  bookingId,
  venueName,
  open,
  onClose,
  onSubmitted,
}: VenueReviewDialogProps) {
  const titleId = useId()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [tags, setTags] = useState<string[]>([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setRating(0)
    setHover(0)
    setTags([])
    setText('')
    setError(null)
    setBusy(false)
  }, [open, bookingId])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, busy, onClose])

  if (!open) return null

  function toggleTag(id: string) {
    setTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  async function submit() {
    if (rating < 1) {
      setError('Поставьте оценку от 1 до 5')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await createVenueReview({ bookingId, rating, tags, text: text.trim() })
      onSubmitted?.()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось отправить отзыв')
    } finally {
      setBusy(false)
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10050,
        background: 'rgba(2,6,23,0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={() => { if (!busy) onClose() }}
    >
      <div
        style={{
          width: 'min(440px, 100%)',
          background: '#1e293b',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.08)',
          padding: 22,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <h2 id={titleId} style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#f8fafc' }}>
              Оцените визит
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#94a3b8' }}>{venueName}</p>
          </div>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={() => { if (!busy) onClose() }}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div
          role="radiogroup"
          aria-label="Оценка"
          style={{ display: 'flex', gap: 6, marginBottom: 16 }}
        >
          {[1, 2, 3, 4, 5].map((n) => {
            const active = (hover || rating) >= n
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} из 5`}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <Star
                  size={28}
                  fill={active ? '#EAB308' : 'transparent'}
                  color={active ? '#EAB308' : '#64748b'}
                />
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {VENUE_REVIEW_TAGS.map((t) => {
            const on = tags.includes(t.id)
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTag(t.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: on ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.1)',
                  background: on ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
                  color: on ? '#86efac' : '#94a3b8',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 2000))}
          placeholder="Расскажите, как прошёл визит (необязательно)"
          rows={4}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(15,23,42,0.6)',
            color: '#e2e8f0',
            padding: 12,
            fontFamily: 'inherit',
            fontSize: 14,
            resize: 'vertical',
            marginBottom: 8,
          }}
        />
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12, textAlign: 'right' }}>
          {text.length}/2000
        </div>

        {error && (
          <p style={{ color: '#fca5a5', fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={() => void submit()}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 12,
            border: 'none',
            background: busy ? '#334155' : 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
            cursor: busy ? 'wait' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {busy ? 'Отправляем…' : 'Отправить отзыв'}
        </button>
      </div>
    </div>,
    document.body,
  )
}
