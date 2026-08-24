const SKELETON_COUNT = 12

interface VenueSlotPickerProps {
  slots: string[]
  selectedSlot: string | null
  onSelect: (slot: string) => void
  loading?: boolean
  error?: string | null
  accentColor?: string
  columns?: number
  minHeight?: number
}

export function VenueSlotPicker({
  slots,
  selectedSlot,
  onSelect,
  loading = false,
  error = null,
  accentColor = '#22c55e',
  columns = 4,
  minHeight = 196,
}: VenueSlotPickerProps) {
  const showSkeleton = loading && slots.length === 0
  const skeletonItems = Array.from({ length: SKELETON_COUNT }, (_, i) => i)

  if (!showSkeleton && !loading && error) {
    return (
      <div style={{ minHeight, display: 'flex', alignItems: 'center' }}>
        <p style={{ fontSize: 13, color: '#f87171', margin: 0 }}>{error}</p>
      </div>
    )
  }

  if (!showSkeleton && !loading && slots.length === 0) {
    return (
      <div style={{ minHeight, display: 'flex', alignItems: 'center' }}>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>На этот день свободных слотов нет</p>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', minHeight }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 8,
          opacity: loading ? 0.45 : 1,
          pointerEvents: loading ? 'none' : 'auto',
          transition: 'opacity 0.15s ease',
        }}
      >
        {showSkeleton
          ? skeletonItems.map((i) => (
              <div
                key={i}
                style={{
                  height: 40,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.06)',
                  animation: 'slot-skeleton-pulse 1.2s ease-in-out infinite',
                }}
              />
            ))
          : slots.map((slot) => {
              const active = selectedSlot === slot
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onSelect(slot)}
                  style={{
                    padding: '10px 4px',
                    borderRadius: 12,
                    background: active ? `${accentColor}20` : 'rgba(255,255,255,0.04)',
                    border: active ? `1.5px solid ${accentColor}` : '1px solid rgba(255,255,255,0.08)',
                    color: active ? accentColor : '#94a3b8',
                    fontSize: 13,
                    fontWeight: active ? 700 : 400,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
                  }}
                >
                  {slot}
                </button>
              )
            })}
      </div>
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 6,
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#94a3b8',
              background: 'rgba(15,23,42,0.85)',
              padding: '4px 10px',
              borderRadius: 999,
            }}
          >
            Обновляем слоты…
          </span>
        </div>
      )}
    </div>
  )
}
