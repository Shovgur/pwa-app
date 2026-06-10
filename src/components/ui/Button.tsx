import { motion, type HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'
import { gradients } from '../../theme/tokens'

type Variant = 'primary' | 'ghost' | 'loft' | 'outline'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

const variants: Record<Variant, React.CSSProperties> = {
  primary: {
    background: gradients.primary,
    color: '#fff',
    boxShadow: gradients.primaryGlow,
    border: 'none',
  },
  loft: {
    background: gradients.loft,
    color: '#fff',
    boxShadow: gradients.loftGlow,
    border: 'none',
  },
  ghost: {
    background: 'rgba(255,255,255,0.06)',
    color: '#94A3B8',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  outline: {
    background: 'transparent',
    color: '#22C55E',
    border: '1px solid rgba(34,197,94,0.4)',
  },
}

const sizes: Record<string, React.CSSProperties> = {
  sm: { padding: '10px 18px', fontSize: 13, borderRadius: 12 },
  md: { padding: '14px 28px', fontSize: 15, borderRadius: 14 },
  lg: { padding: '16px 32px', fontSize: 16, borderRadius: 16 },
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  children,
  className,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      className={cn('inline-flex items-center justify-center gap-2 font-bold cursor-pointer select-none', className)}
      style={{ ...variants[variant], ...sizes[size], ...style }}
      whileHover={disabled || loading ? undefined : { scale: 1.03, y: -1 }}
      whileTap={disabled || loading ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : icon}
      {children}
    </motion.button>
  )
}
