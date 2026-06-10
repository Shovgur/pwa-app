import { motion } from 'framer-motion'
import { gradients } from '../../theme/tokens'

export function HeroBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, width: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, width: '100%', background: gradients.mesh }} />
      <motion.div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          top: '-5%',
          right: '10%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{ scale: [1, 1.15, 1], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          bottom: '10%',
          left: '5%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{ scale: [1, 1.2, 1], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
      />
    </div>
  )
}
