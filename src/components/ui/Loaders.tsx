import { motion } from 'framer-motion'
import { colors, gradients } from '../../theme/tokens'
import { Logo } from './Logo'

export function PulseRingLoader({ size = 64 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            inset: i * 8,
            borderRadius: '50%',
            border: `${3 - i}px solid ${i === 2 ? colors.green : `rgba(34,197,94,${0.3 - i * 0.1})`}`,
            background: i === 2 ? colors.green : 'transparent',
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

export function ProgressLoader({ progress = 70, label = 'Загрузка...' }: { progress?: number; label?: string }) {
  return (
    <div style={{ width: 280, maxWidth: '90vw' }}>
      <div style={{ height: 6, borderRadius: 100, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', borderRadius: 100, background: gradients.hero, width: `${progress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>
      {label && <p style={{ marginTop: 10, fontSize: 12, color: colors.muted, textAlign: 'center' }}>{label}</p>}
    </div>
  )
}

export function FullPageLoader({ message = 'Загружаем лучшие площадки для вас...' }: { message?: string }) {
  return (
    <motion.div
      className="page-loader page-loader--route"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
        <PulseRingLoader size={72} />
      </motion.div>
      <Logo size="md" />
      <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
        {message}
      </motion.p>
      <ProgressLoader progress={70} label="" />
    </motion.div>
  )
}

export function AuthTransitionLoader({ message }: { message: string }) {
  return (
    <motion.div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        background: 'rgba(10, 22, 40, 0.94)',
        backdropFilter: 'blur(14px)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
        <PulseRingLoader size={72} />
      </motion.div>
      <motion.p
        style={{ margin: 0, fontSize: 15, fontWeight: 600, color: colors.text2, textAlign: 'center', maxWidth: 280 }}
        animate={{ opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        {message}
      </motion.p>
    </motion.div>
  )
}
