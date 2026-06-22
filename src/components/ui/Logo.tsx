import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { gradients } from '../../theme/tokens'

interface LogoProps {
  to?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { mark: 32, icon: 16, text: 18 },
  md: { mark: 36, icon: 18, text: 22 },
  lg: { mark: 44, icon: 22, text: 26 },
}

export function Logo({ to = '/', size = 'md' }: LogoProps) {
  const s = sizes[size]
  const content = (
    <motion.div
      className="inline-flex items-center gap-2.5"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        style={{
          width: s.mark,
          height: s.mark,
          borderRadius: 12,
          background: gradients.hero,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(34,197,94,0.3)',
        }}
      >
        <MapPin size={s.icon} color="#fff" strokeWidth={2.5} />
      </div>
      <span className="logo-text" style={{ fontSize: s.text, fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.03em' }}>
        BookinGo
      </span>
    </motion.div>
  )

  if (to) return <Link to={to} style={{ textDecoration: 'none' }}>{content}</Link>
  return content
}