import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, MapPin, ArrowUpRight } from 'lucide-react'
import { scrollToTop } from '../../utils/scroll'

export interface VenueCardProps {
  to: string
  badge: string
  title: string
  location: string
  price: string
  rating: number
  gradient: string
  delay?: number
  variant?: 'default' | 'featured'
  description?: string
}

export function VenueCard({
  to,
  badge,
  title,
  location,
  price,
  rating,
  gradient,
  delay = 0,
  variant = 'default',
  description,
}: VenueCardProps) {
  const featured = variant === 'featured'

  return (
    <motion.div
      style={{ width: '100%' }}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={to}
        onClick={() => {
          scrollToTop()
          requestAnimationFrame(scrollToTop)
        }}
        style={{ textDecoration: 'none', display: 'block' }}
      >
        <motion.article
          className={`venue-card ${featured ? 'venue-card--featured' : ''}`}
          whileHover={{ y: -8 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          <div
            className="venue-card-media"
            style={{ background: gradient }}
          >
            <div className="venue-card-media-overlay" />
            <span className="venue-card-badge">{badge.replace(/^[^\s]+\s/, '') || badge}</span>
            {featured && (
              <div className="venue-card-media-content">
                <h3>{title}</h3>
                <p><MapPin size={14} /> {location.split('·')[0]?.trim() || location}</p>
              </div>
            )}
            <motion.span className="venue-card-arrow">
              <ArrowUpRight size={22} />
            </motion.span>
          </div>

          <div className="venue-card-body">
            {!featured && (
              <>
                <h3>{title}</h3>
                <p className="venue-card-location"><MapPin size={14} /> {location}</p>
              </>
            )}
            {featured && description && (
              <p className="venue-card-desc">{description}</p>
            )}
            <div className="venue-card-footer">
              <div>
                <span className="venue-card-price-label">от</span>
                <span className="venue-card-price">{price.replace(/^от\s*/, '')}</span>
              </div>
              <div className="venue-card-rating">
                <Star size={15} fill="#EAB308" color="#EAB308" />
                <span>{rating}</span>
              </div>
            </div>
            {featured && (
              <span className="venue-card-cta">Смотреть и забронировать →</span>
            )}
          </div>
        </motion.article>
      </Link>
    </motion.div>
  )
}
