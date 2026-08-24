import { motion } from 'framer-motion'
import { ChevronLeft, CreditCard, Loader2, Shield } from 'lucide-react'
import type { Court } from '../../contexts/BookingContext'

interface Props {
  court: Court
  totalPrice: number
  paying: boolean
  isDesktop: boolean
  onBack: () => void
  onPay: () => void
}

export function MockPaymentStep({ court, totalPrice, paying, isDesktop, onBack, onPay }: Props) {
  return (
    <motion.div
      key="payment"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.18 }}
      style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }}
    >
      <div
        className="court-sheet-narrow"
        style={{
          flex: 1,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          padding: isDesktop ? '0 32px 24px' : '0 16px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingTop: 4 }}>
          <button
            type="button"
            onClick={onBack}
            disabled={paying}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              borderRadius: 10,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: paying ? 'default' : 'pointer',
              flexShrink: 0,
              opacity: paying ? 0.5 : 1,
            }}
          >
            <ChevronLeft size={18} color="#94a3b8" />
          </button>
          <div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Шаг 3 из 3</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>Оплата</div>
          </div>
        </div>

        <div style={{
          background: `linear-gradient(135deg, ${court.color}33, rgba(15,23,42,0.9))`,
          border: `1px solid ${court.color}44`,
          borderRadius: 20,
          padding: '20px 22px',
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>К оплате</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9', fontFamily: 'var(--font-display)' }}>
            {totalPrice.toLocaleString('ru-RU')} ₽
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Способ оплаты
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '16px 18px',
            borderRadius: 16,
            background: 'rgba(34,197,94,0.1)',
            border: '1.5px solid rgba(34,197,94,0.45)',
            marginBottom: 10,
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CreditCard size={22} color="#22c55e" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Карта •••• 4242</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Visa · основная</div>
            </div>
            <div style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: '2px solid #22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
            </div>
          </div>

          <button
            type="button"
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 14,
              border: '1px dashed rgba(255,255,255,0.15)',
              background: 'transparent',
              color: '#64748b',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            + Добавить карту
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 14px',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.04)',
          marginBottom: 24,
        }}>
          <Shield size={16} color="#22c55e" />
          <span style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.45 }}>
            Демо-оплата: списание не производится, бронь сохранится локально
          </span>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: paying ? 1 : 0.97 }}
          onClick={onPay}
          disabled={paying}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 16,
            background: paying
              ? 'rgba(255,255,255,0.1)'
              : `linear-gradient(135deg, ${court.color}, ${court.color}bb)`,
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            border: 'none',
            cursor: paying ? 'wait' : 'pointer',
            boxShadow: paying ? 'none' : `0 8px 24px ${court.color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          {paying ? (
            <>
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
              Обрабатываем…
            </>
          ) : (
            <>Оплатить {totalPrice.toLocaleString('ru-RU')} ₽</>
          )}
        </motion.button>
        <div style={{ height: 90 }} />
      </div>
    </motion.div>
  )
}
