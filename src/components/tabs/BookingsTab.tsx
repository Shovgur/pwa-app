import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export function BookingsTab() {
  const navigate = useNavigate()

  return (
    <div style={{ padding: '24px 16px', paddingBottom: 100 }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 2 }}>Мои брони</h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>История бронирований</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ textAlign: 'center', padding: '64px 20px' }}
      >
        <div style={{ fontSize: 52, marginBottom: 16 }}>📅</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
          Броней пока нет
        </div>
        <div style={{ fontSize: 14, color: '#64748b', marginBottom: 28, lineHeight: 1.6 }}>
          Здесь будут отображаться<br />все ваши бронирования
        </div>
        <motion.button
          onClick={() => navigate('/dashboard/courts')}
          style={{
            padding: '13px 28px', borderRadius: 14,
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            border: 'none', color: '#fff', fontSize: 15, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 8px 24px rgba(34,197,94,0.3)',
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Найти площадку
        </motion.button>
      </motion.div>
    </div>
  )
}
