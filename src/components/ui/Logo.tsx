import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

interface LogoProps {
  to?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { mark: 32, text: 18 },
  md: { mark: 36, text: 22 },
  lg: { mark: 44, text: 26 },
}

export function Logo({ to = '/', size = 'md' }: LogoProps) {
  const s = sizes[size]
  const content = (
    <motion.div
      className="inline-flex items-center gap-2.5"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <img
        src="/icon-192.png"
        alt="BookinGo"
        width={s.mark}
        height={s.mark}
        style={{
          width: s.mark,
          height: s.mark,
          borderRadius: s.mark * 0.22,
          display: 'block',
          flexShrink: 0,
        }}
      />
      <span className="logo-text" style={{ fontSize: s.text, fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.03em' }}>
        BookinGo
      </span>
    </motion.div>
  )

  if (to) return <Link to={to} style={{ textDecoration: 'none' }}>{content}</Link>
  return content
}
