import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Button } from './Button'

export interface SummaryLineItem {
  id: string
  label: string
  value: string
  sublabel?: string
  isAddon?: boolean
  animated?: boolean
}

export interface SummaryMetaChip {
  icon: ReactNode
  text: string
}

interface BookingSummaryPanelProps {
  venueName: string
  venueMeta: string
  venueImage: string
  metaChips: SummaryMetaChip[]
  lines: SummaryLineItem[]
  emptyMessage?: string
  discount?: { title: string; description: string } | null
  total: number
  accent?: 'green' | 'loft'
  buttonLabel?: string
  buttonVariant?: 'primary' | 'loft'
  buttonDisabled?: boolean
  onConfirm: () => void
  footerNote?: string
}

export function BookingSummaryPanel({
  venueName,
  venueMeta,
  venueImage,
  metaChips,
  lines,
  emptyMessage,
  discount,
  total,
  accent = 'green',
  buttonLabel = 'Подтвердить бронь →',
  buttonVariant = 'primary',
  buttonDisabled = false,
  onConfirm,
  footerNote = 'Бесплатная отмена за 24 часа',
}: BookingSummaryPanelProps) {
  const totalClass = accent === 'loft'
    ? 'booking-summary-total-price'
    : 'booking-summary-total-price booking-summary-total-price--green'

  return (
    <aside className="booking-sidebar">
      <div className="booking-summary-panel">
        <div className="booking-summary-scroll">
          <h2 className="booking-summary-title">Сводка заказа</h2>

          <div className="booking-summary-venue">
            <div className="booking-summary-venue-image" style={{ background: venueImage }} />
            <div>
              <p className="booking-summary-venue-name">{venueName}</p>
              <p className="booking-summary-venue-meta">{venueMeta}</p>
            </div>
          </div>

          {metaChips.length > 0 && (
            <div className="booking-summary-meta-row">
              {metaChips.map((chip, i) => (
                <span key={i}>
                  {chip.icon}
                  {chip.text}
                </span>
              ))}
            </div>
          )}

          <div className="booking-summary-divider" />

          <div className="booking-summary-list">
            {lines.map((line) => {
              const row = (
                <div
                  className={`booking-summary-row${line.isAddon ? ' booking-summary-row--addon' : ''}`}
                >
                  <span>
                    {line.label}
                    {line.sublabel && <em>{line.sublabel}</em>}
                  </span>
                  <span>{line.value}</span>
                </div>
              )

              if (line.animated) {
                return (
                  <motion.div key={line.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {row}
                  </motion.div>
                )
              }

              return <div key={line.id}>{row}</div>
            })}
            {emptyMessage && lines.length <= 1 && (
              <p className="booking-summary-empty">{emptyMessage}</p>
            )}
          </div>

          {discount && (
            <div className="booking-summary-discount">
              <p className="booking-summary-discount-title">{discount.title}</p>
              <p className="booking-summary-discount-desc">{discount.description}</p>
            </div>
          )}
        </div>

        <div className="booking-summary-footer">
          <div className="booking-summary-total">
            <span>Итого</span>
            <motion.span
              key={total}
              className={totalClass}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
            >
              {total.toLocaleString()} ₽
            </motion.span>
          </div>
          <Button
            variant={buttonVariant}
            disabled={buttonDisabled}
            onClick={onConfirm}
            style={{ width: '100%' }}
          >
            {buttonLabel}
          </Button>
          {footerNote && (
            <p className="booking-sidebar-note">{footerNote}</p>
          )}
        </div>
      </div>
    </aside>
  )
}
