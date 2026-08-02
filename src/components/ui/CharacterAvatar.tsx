import { motion, AnimatePresence } from 'framer-motion'
import { useBookings } from '../../contexts/BookingContext'
import { getDominantOutfit, OUTFITS } from '../../utils/characterOutfit'

interface CharacterAvatarProps {
  size?: number
  showGlow?: boolean
}

/**
 * Мультяшный 3D-персонаж личного кабинета. Его "наряд" подбирается
 * автоматически по недавним бронированиям пользователя (см.
 * ../../utils/characterOutfit) — играешь в теннис, значит и персонаж в
 * теннисной форме, часто бронируешь лофты — он в костюме для вечеринки.
 */
export function CharacterAvatar({ size = 96, showGlow = true }: CharacterAvatarProps) {
  const { bookings } = useBookings()
  const outfitKey = getDominantOutfit(bookings)
  const outfit = OUTFITS[outfitKey]

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {showGlow && (
        <div
          style={{
            position: 'absolute',
            inset: '8%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34,197,94,0.35) 0%, transparent 70%)',
            filter: 'blur(6px)',
          }}
        />
      )}
      <AnimatePresence mode="wait">
        <motion.img
          key={outfitKey}
          src={outfit.image}
          alt={outfit.label}
          initial={{ opacity: 0, scale: 0.8, y: 8, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: -6 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          whileHover={{ scale: 1.05, rotate: 2 }}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.4))',
          }}
        />
      </AnimatePresence>
    </div>
  )
}
