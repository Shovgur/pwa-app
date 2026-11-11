import { useState } from 'react'
import { VenueReviewDialog } from './VenueReviewDialog'
import { useReviewPrompt } from '../../hooks/useReviewPrompt'
import { features } from '../../config/features'

/** Монтируется в клиентском дашборде: один popup после визита. */
export function ReviewPromptPopup() {
  const { prompt, dismiss } = useReviewPrompt()
  const [open, setOpen] = useState(false)

  if (!features.venueReviews || !prompt) return null

  return (
    <>
      {!open && (
        <div
          style={{
            position: 'fixed',
            right: 16,
            bottom: 16,
            zIndex: 10040,
            maxWidth: 340,
            padding: 16,
            borderRadius: 16,
            background: '#1e293b',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
          }}
        >
          <p style={{ margin: '0 0 6px', fontWeight: 800, color: '#f8fafc', fontSize: 15 }}>
            Как прошёл визит?
          </p>
          <p style={{ margin: '0 0 14px', color: '#94a3b8', fontSize: 13, lineHeight: 1.45 }}>
            Оцените «{prompt.venueName}» — это займёт минуту.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setOpen(true)}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 10,
                border: 'none',
                background: '#22c55e',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Оставить отзыв
            </button>
            <button
              type="button"
              onClick={() => dismiss(prompt.partnerBookingId)}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'transparent',
                color: '#94a3b8',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Позже
            </button>
          </div>
        </div>
      )}
      <VenueReviewDialog
        open={open}
        bookingId={prompt.partnerBookingId}
        venueName={prompt.venueName}
        onClose={() => {
          setOpen(false)
          dismiss(prompt.partnerBookingId)
        }}
        onSubmitted={() => dismiss(prompt.partnerBookingId)}
      />
    </>
  )
}
