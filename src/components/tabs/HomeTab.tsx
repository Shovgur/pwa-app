import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarCheck, MapPin, Clock, Star, TrendingUp, Users,
  ChevronRight, Award, Building2, Sparkles,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { COURTS } from '../../contexts/BookingContext'
import { CourtDetailSheet } from '../CourtDetailSheet'
import type { Court } from '../../contexts/BookingContext'

const POPULAR = COURTS.filter(c => c.available).slice(0, 3)

const NEWS = [
  {
    id: 'achievement',
    eyebrow: 'ДОСТИЖЕНИЕ РАЗБЛОКИРОВАНО',
    title: 'Вы отлично провели неделю — 10 бронирований! 🏆',
    cta: 'Смотреть',
    icon: Award,
    action: '/dashboard/bookings',
  },
  {
    id: 'venue',
    eyebrow: 'НОВАЯ ПЛОЩАДКА',
    title: 'Открылся теннисный корт Elite — бронируйте первыми',
    cta: 'Посмотреть',
    icon: Building2,
    action: '/dashboard/courts',
  },
  {
    id: 'promo',
    eyebrow: 'ДЛЯ ВАС',
    title: 'Скидка 15% на вечерние слоты до конца недели',
    cta: 'Забронировать',
    icon: Sparkles,
    action: '/dashboard/courts',
  },
]

export function HomeTab() {
  const navigate = useNavigate()
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setSlide(s => (s + 1) % NEWS.length)
    }, 4500)
    return () => window.clearInterval(id)
  }, [])

  const STATS = [
    { icon: CalendarCheck, label: 'Площадок рядом', value: String(COURTS.length), color: '#22c55e' },
    { icon: Clock, label: 'Доступно сейчас', value: String(COURTS.filter(c => c.available).length), color: '#3b82f6' },
    { icon: Star, label: 'Видов спорта', value: String(new Set(COURTS.map(c => c.sport)).size), color: '#f97316' },
    { icon: Users, label: 'Всего отзывов', value: String(COURTS.reduce((s, c) => s + c.reviews, 0)), color: '#a855f7' },
  ]

  const current = NEWS[slide]
  const Icon = current.icon

  return (
    <div className="dashboard-home" style={{
      padding: '28px 32px 40px',
      paddingBottom: 100,
      display: 'flex',
      flexDirection: 'column',
      gap: 28,
    }}>

      {/* Карусель новостей / достижений — всегда видна */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div
          style={{
            borderRadius: 20,
            padding: '28px 32px',
            background: 'linear-gradient(135deg, #22C55E 0%, #3B82F6 100%)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            position: 'relative',
            zIndex: 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'rgba(255,255,255,0.16)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Icon size={28} color="#fff" />
                  </motion.div>
                </AnimatePresence>
              </div>
              <div style={{ minWidth: 0 }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id + '-text'}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28 }}
                  >
                    <p style={{
                      margin: 0,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      color: 'rgba(240,253,244,0.8)',
                      marginBottom: 6,
                    }}>
                      {current.eyebrow}
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: 21,
                      fontWeight: 700,
                      color: '#fff',
                      fontFamily: 'var(--font-display)',
                      lineHeight: 1.25,
                    }}>
                      {current.title}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(current.action)}
              style={{
                padding: '12px 20px',
                borderRadius: 11,
                border: 'none',
                background: '#fff',
                color: '#0A0E17',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {current.cta}
            </motion.button>
          </div>

          <div style={{ display: 'flex', gap: 6, position: 'relative', zIndex: 1 }}>
            {NEWS.map((n, i) => (
              <button
                key={n.id}
                onClick={() => setSlide(i)}
                aria-label={`Слайд ${i + 1}`}
                style={{
                  width: i === slide ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  border: 'none',
                  padding: 0,
                  background: i === slide ? '#fff' : 'rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  transition: 'width 0.25s, background 0.25s',
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Статистика — одна карточка с разделителями */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          padding: '22px 26px',
          borderRadius: 18,
          background: '#222D3F',
          border: '1px solid rgba(255,255,255,0.07)',
          gap: 0,
          overflowX: 'auto',
        }}
      >
        {STATS.map((s, i) => {
          const StatIcon = s.icon
          return (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 140 }}>
              {i > 0 && (
                <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)', marginRight: 20, flexShrink: 0 }} />
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: i > 0 ? 0 : 0 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: `${s.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <StatIcon size={18} color={s.color} />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#F1F5F9', lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            </div>
          )
        })}
      </motion.div>

      {/* Популярные площадки — карточки */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F1F5F9', margin: 0, fontFamily: 'var(--font-display)' }}>
            Популярные площадки
          </h2>
          <button
            onClick={() => navigate('/dashboard/courts')}
            style={{
              background: 'none', border: 'none', color: '#22c55e',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 2,
            }}
          >
            Все <ChevronRight size={14} />
          </button>
        </div>

        <div className="dashboard-venue-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}>
          {POPULAR.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.06 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCourt(c)}
              style={{
                borderRadius: 18,
                overflow: 'hidden',
                background: '#222D3F',
                border: '1px solid rgba(255,255,255,0.07)',
                cursor: 'pointer',
              }}
            >
              <div style={{
                height: 140,
                background: c.photos[0],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 40,
              }}>
                {c.emoji}
              </div>
              <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9' }}>{c.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <MapPin size={11} /> {c.location}
                  </span>
                  <span style={{ fontSize: 12, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Star size={11} fill="#f59e0b" color="#f59e0b" /> {c.rating}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: c.color, fontFamily: 'var(--font-display)' }}>
                    {c.price.toLocaleString()} ₽
                  </span>
                  <span style={{ fontSize: 12, color: '#64748b', paddingBottom: 1 }}>/ час</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Активность за неделю */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        style={{
          padding: '24px 26px',
          borderRadius: 18,
          background: '#222D3F',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <TrendingUp size={18} color="#22c55e" />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9', fontFamily: 'var(--font-display)' }}>
            Активность за неделю
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 110 }}>
          {[2, 5, 3, 7, 4, 6, 8].map((v, i) => {
            const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
            const px = Math.max(6, Math.round((v / 8) * 72))
            const isLast = i === 6
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 8, height: '100%' }}>
                <motion.div
                  style={{
                    width: '100%',
                    borderRadius: '4px 4px 0 0',
                    background: isLast ? '#22c55e' : 'rgba(34,197,94,0.2)',
                    height: px,
                    minHeight: 4,
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: px }}
                  transition={{ delay: 0.4 + i * 0.05, duration: 0.4 }}
                />
                <span style={{ fontSize: 11, color: '#64748b' }}>{days[i]}</span>
              </div>
            )
          })}
        </div>
      </motion.div>

      {selectedCourt && <CourtDetailSheet court={selectedCourt} onClose={() => setSelectedCourt(null)} />}
    </div>
  )
}
