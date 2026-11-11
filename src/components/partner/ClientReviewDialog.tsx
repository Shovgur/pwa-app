import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { Star, X } from 'lucide-react'
import { CLIENT_REVIEW_PRESETS, createClientReview } from '../../lib/clientReviews'

interface ClientReviewDialogProps {
  bookingId: string
  customerName: string
  open: boolean
  onClose: () => void
  onSubmitted?: () => void
}

export function ClientReviewDialog({
  bookingId,
  customerName,
  open,
  onClose,
  onSubmitted,
}: ClientReviewDialogProps) {
  const titleId = useId()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [presets, setPresets] = useState<string[]>([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setRating(0)
    setHover(0)
    setPresets([])
    setText('')
    setError(null)
    setBusy(false)
  }, [open, bookingId])

  if (!open) return null

  function togglePreset(id: string) {
    setPresets((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  async function submit() {
    if (rating < 1) {
      setError('Поставьте оценку')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await createClientReview({
        bookingId,
        rating,
        presets,
        text: text.trim(),
      })
      onSubmitted?.()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сохранить')
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
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <h2 id={titleId} style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#f8fafc' }}>
              Оценка клиента
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#94a3b8' }}>{customerName}</p>
          </div>
          <button
            type="button"
            aria-label="Пропустить"
            onClick={() => { if (!busy) onClose() }}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div role="radiogroup" aria-label="Оценка" style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
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
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <Star size={28} fill={active ? '#EAB308' : 'transparent'} color={active ? '#EAB308' : '#64748b'} />
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {CLIENT_REVIEW_PRESETS.map((p) => {
            const on = presets.includes(p.id)
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePreset(p.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: on ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                  background: on ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                  color: on ? '#fcd34d' : '#94a3b8',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {p.label}
              </button>
            )
          })}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 300))}
          placeholder="Комментарий (до 300 символов, необязательно)"
          rows={3}
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
            marginBottom: 8,
          }}
        />
        <div style={{ fontSize: 11, color: '#64748b', textAlign: 'right', marginBottom: 12 }}>
          {text.length}/300
        </div>

        {error && <p style={{ color: '#fca5a5', fontSize: 13, marginBottom: 10 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            disabled={busy}
            onClick={() => { if (!busy) onClose() }}
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'transparent',
              color: '#94a3b8',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Пропустить
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit()}
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: 12,
              border: 'none',
              background: '#22c55e',
              color: '#fff',
              fontWeight: 700,
              cursor: busy ? 'wait' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {busy ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
