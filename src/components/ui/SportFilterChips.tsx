import { motion } from 'framer-motion'
import type { VenueFilterChip } from '../../data/sportTypes'

interface Props {
  chips: VenueFilterChip[]
  activeId: string
  onSelect: (id: string) => void
  className?: string
  size?: 'sm' | 'md'
}

export function SportFilterChips({ chips, activeId, onSelect, className, size = 'md' }: Props) {
  if (chips.length === 0) return null

  const pad = size === 'sm' ? '6px 12px' : '8px 16px'
  const fontSize = size === 'sm' ? 12 : 13

  return (
    <div
      className={className}
      style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2, flexWrap: 'wrap' }}
    >
      {chips.map(chip => {
        const active = activeId === chip.id
        return (
          <motion.button
            key={chip.id}
            type="button"
            onClick={() => onSelect(chip.id)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: pad,
              borderRadius: 100,
              border: active ? `1.5px solid ${chip.color}88` : '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
              flexShrink: 0,
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize,
              transition: 'all 0.2s',
              background: active ? `${chip.color}22` : '#222D3F',
              color: active ? '#f1f5f9' : '#94a3b8',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>{chip.emoji}</span>
            {chip.label}
          </motion.button>
        )
      })}
    </div>
  )
}
