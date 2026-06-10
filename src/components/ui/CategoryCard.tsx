import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { VenueCategory } from '../../data/venues'

interface CategoryCardProps {
  id: VenueCategory | 'hotel' | 'meeting'
  emoji: string
  label: string
  color: string
  desc: string
}

export function CategoryCard({ id, emoji, label, color, desc }: CategoryCardProps) {
  return (
    <Link to={`/catalog?type=${id}`} style={{ textDecoration: 'none' }}>
      <motion.div
        className="category-card"
        style={{ '--cat-color': color } as React.CSSProperties}
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        <div className="category-card-glow" />
        <div className="category-card-top">
          <span className="category-card-emoji">{emoji}</span>
          <ArrowRight size={18} className="category-card-arrow" />
        </div>
        <h3>{label}</h3>
        <p>{desc}</p>
      </motion.div>
    </Link>
  )
}
