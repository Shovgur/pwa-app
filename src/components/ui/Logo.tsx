import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { APP_ICON_SRC } from '../../config/branding'

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
        src={APP_ICON_SRC}
        alt="BookinGo"
        width={s.mark}
        height={s.mark}
        decoding="async"
        style={{
          width: s.mark,
          height: s.mark,
          borderRadius: '50%',
          display: 'block',
          flexShrink: 0,
          objectFit: 'cover',
        }}
      />
      <span className="logo-text" style={{ fontSize: s.text, fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.03em' }}>
        BookinGo
      </span>
    </motion.div>
  )

  // Бренд всегда ведёт на главную, даже если to передали пустым.
  const href = to || '/'
  return <Link to={href} style={{ textDecoration: 'none' }}>{content}</Link>
}
