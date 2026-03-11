import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, MapPin, ChevronRight, Check, ChevronLeft, ChevronDown } from 'lucide-react'
import type { Court } from '../contexts/BookingContext'
import { useBookings } from '../contexts/BookingContext'

const DURATIONS = [
  { label: '30 мин', value: 30 },
  { label: '1 час', value: 60 },
  { label: '1.5 часа', value: 90 },
  { label: '2 часа', value: 120 },
]

const UPCOMING_DATES = (() => {
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  const result = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    result.push({
      label: i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : days[d.getDay()],
      date: `${d.getDate()} ${months[d.getMonth()]}`,
      full: d.toLocaleDateString('ru-RU'),
    })
  }
  return result
})()

type Step = 'detail' | 'booking' | 'confirm' | 'success'

interface Props {
  court: Court
  onClose: () => void
}

function FakeMap({ court }: { court: Court }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: 180, borderRadius: 16, overflow: 'hidden', background: '#1a2332' }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        {[20, 40, 60, 80].map(y => (
          <line key={`h${y}`} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        ))}
        {[15, 30, 50, 70, 85].map(x => (
          <line key={`v${x}`} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        ))}
        {[[5, 5, 20, 30], [35, 15, 20, 40], [60, 10, 30, 25], [70, 50, 18, 25], [10, 50, 22, 35], [40, 60, 25, 30]].map(([x, y, w, h], i) => (
          <rect key={i} x={`${x}%`} y={`${y}%`} width={`${w}%`} height={`${h}%`} rx="3" fill="rgba(255,255,255,0.04)" />
        ))}
      </svg>
      <div style={{ position: 'absolute', left: '50%', top: '40%', transform: 'translate(-50%,-50%)' }}>
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <div style={{
            background: court.color, borderRadius: '50% 50% 50% 0', width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            boxShadow: `0 4px 20px ${court.color}80`, transform: 'rotate(-45deg)',
          }}>
            <span style={{ transform: 'rotate(45deg)' }}>{court.emoji}</span>
          </div>
          <div style={{ width: 6, height: 6, background: court.color, borderRadius: '50%', marginTop: 2, opacity: 0.7 }} />
        </motion.div>
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 12px',
        background: 'linear-gradient(transparent, rgba(10,15,25,0.9))',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <MapPin size={13} color={court.color} />
        <span style={{ fontSize: 12, color: '#94a3b8' }}>{court.address}</span>
      </div>
    </div>
  )
}


export function CourtDetailSheet({ court, onClose }: Props) {
  const { addBooking } = useBookings()
  const [step, setStep] = useState<Step>('detail')
  const [photoIdx, setPhotoIdx] = useState(0)
  const [selectedDate, setSelectedDate] = useState(UPCOMING_DATES[0])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedDuration, setSelectedDuration] = useState(DURATIONS[1])
  const [newBooking, setNewBooking] = useState<ReturnType<typeof addBooking> | null>(null)

  const totalPrice = Math.round(court.price * (selectedDuration.value / 60))

  function handleBook() {
    if (!selectedSlot) return
    const booking = addBooking(court, selectedDate.date, selectedSlot, selectedDuration.value)
    setNewBooking(booking)
    setStep('success')
  }

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      />

      {/* Sheet */}
      <motion.div
        key="sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10001,
          background: '#111827',
          borderRadius: '24px 24px 0 0',
          maxHeight: '92vh',
          /* Ключевая архитектура: flex-column
             handle + content(scroll, flex:1) + footer(no scroll) */
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Handle */}
        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
        </div>

        <AnimatePresence mode="wait">

          {/* ─── DETAIL ─── */}
          {step === 'detail' && (
            <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}
              style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }}>

              {/* Скроллируемый контент */}
              <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
                {/* Фото */}
                <div style={{ position: 'relative', margin: '0 16px 16px', height: 200, borderRadius: 20, overflow: 'hidden' }}>
                  <AnimatePresence mode="wait">
                    <motion.div key={photoIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                      style={{ width: '100%', height: '100%', background: court.photos[photoIdx] }} />
                  </AnimatePresence>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 64, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.5))' }}>{court.emoji}</span>
                  </div>
                  <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
                    {court.photos.map((_, i) => (
                      <button key={i} onClick={() => setPhotoIdx(i)}
                        style={{ width: i === photoIdx ? 20 : 7, height: 7, borderRadius: 4, background: i === photoIdx ? court.color : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s' }} />
                    ))}
                  </div>
                  <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={16} color="#fff" />
                  </button>
                  <div style={{ position: 'absolute', top: 10, left: 10, background: court.available ? 'rgba(34,197,94,0.85)' : 'rgba(239,68,68,0.85)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 10 }}>
                    {court.available ? '● Свободно' : '● Занято'}
                  </div>
                </div>

                <div style={{ padding: '0 16px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 12, color: court.color, fontWeight: 600, background: `${court.color}18`, padding: '2px 8px', borderRadius: 6 }}>{court.sport}</span>
                      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', marginTop: 6 }}>{court.name}</h2>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: court.color }}>{court.price.toLocaleString()} ₽</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>/ час</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{court.rating}</span>
                      <span style={{ fontSize: 12, color: '#64748b' }}>({court.reviews})</span>
                    </div>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#334155' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={13} color="#64748b" />
                      <span style={{ fontSize: 12, color: '#64748b' }}>{court.distance}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, marginBottom: 16 }}>{court.description}</p>

                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>Удобства</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {court.amenities.map(a => (
                        <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '5px 10px' }}>
                          <Check size={11} color={court.color} />
                          <span style={{ fontSize: 12, color: '#cbd5e1' }}>{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>Расположение</h3>
                    <FakeMap court={court} />
                  </div>

                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>Ближайшие слоты — сегодня</h3>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {court.slots.slice(0, 4).map(slot => (
                        <div key={slot} style={{ padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: `${court.color}18`, color: court.color, border: `1px solid ${court.color}30` }}>
                          {slot}
                        </div>
                      ))}
                      {court.slots.length > 4 && (
                        <div style={{ padding: '6px 14px', borderRadius: 10, fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>
                          +{court.slots.length - 4} ещё <ChevronDown size={13} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Кнопка внизу контента */}
                  {court.available && (
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setStep('booking')}
                      style={{
                        width: '100%', padding: '16px', borderRadius: 16, marginTop: 24,
                        background: `linear-gradient(135deg, ${court.color}, ${court.color}bb)`,
                        color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: `0 8px 24px ${court.color}40`,
                      }}
                    >
                      Забронировать <ChevronRight size={18} />
                    </motion.button>
                  )}
                  {/* Отступ снизу — чтобы кнопка выскроллилась выше нижнего меню */}
                  <div style={{ height: 90 }} />
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── BOOKING ─── */}
          {step === 'booking' && (
            <motion.div key="booking" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.18 }}
              style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }}>

              <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', padding: '0 16px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingTop: 4 }}>
                  <button onClick={() => setStep('detail')} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    <ChevronLeft size={18} color="#94a3b8" />
                  </button>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{court.name}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>Выбор времени</div>
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Дата</h3>
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                    {UPCOMING_DATES.map(d => {
                      const active = selectedDate.date === d.date
                      return (
                        <button key={d.date} onClick={() => setSelectedDate(d)} style={{ flex: '0 0 auto', padding: '10px 14px', borderRadius: 14, background: active ? court.color : 'rgba(255,255,255,0.05)', border: active ? 'none' : '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', textAlign: 'center', minWidth: 64 }}>
                          <div style={{ fontSize: 10, color: active ? 'rgba(255,255,255,0.7)' : '#64748b', marginBottom: 2 }}>{d.label}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: active ? '#fff' : '#f1f5f9' }}>{d.date.split(' ')[0]}</div>
                          <div style={{ fontSize: 10, color: active ? 'rgba(255,255,255,0.7)' : '#64748b' }}>{d.date.split(' ')[1]}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Время начала</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {court.slots.map(slot => {
                      const active = selectedSlot === slot
                      return (
                        <motion.button key={slot} whileTap={{ scale: 0.93 }} onClick={() => setSelectedSlot(slot)}
                          style={{ padding: '10px 4px', borderRadius: 12, background: active ? `${court.color}20` : 'rgba(255,255,255,0.04)', border: active ? `1.5px solid ${court.color}` : '1px solid rgba(255,255,255,0.08)', color: active ? court.color : '#94a3b8', fontSize: 13, fontWeight: active ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
                          {slot}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Продолжительность</h3>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {DURATIONS.map(d => {
                      const active = selectedDuration.value === d.value
                      return (
                        <motion.button key={d.value} whileTap={{ scale: 0.93 }} onClick={() => setSelectedDuration(d)}
                          style={{ flex: 1, padding: '10px 4px', borderRadius: 12, background: active ? `${court.color}20` : 'rgba(255,255,255,0.04)', border: active ? `1.5px solid ${court.color}` : '1px solid rgba(255,255,255,0.08)', color: active ? court.color : '#94a3b8', fontSize: 12, fontWeight: active ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
                          {d.label}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {selectedSlot && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: '#64748b' }}>Дата и время</span>
                      <span style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600 }}>{selectedDate.date}, {selectedSlot}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: '#64748b' }}>Продолжительность</span>
                      <span style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600 }}>{selectedDuration.label}</span>
                    </div>
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '10px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Итого</span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: court.color }}>{totalPrice.toLocaleString()} ₽</span>
                    </div>
                  </motion.div>
                )}

                {/* Кнопка внизу контента */}
                <motion.button
                  whileTap={{ scale: selectedSlot ? 0.97 : 1 }}
                  onClick={() => selectedSlot && setStep('confirm')}
                  style={{
                    width: '100%', padding: '16px', borderRadius: 16, marginTop: 20,
                    background: selectedSlot ? `linear-gradient(135deg, ${court.color}, ${court.color}bb)` : 'rgba(255,255,255,0.08)',
                    color: selectedSlot ? '#fff' : '#475569',
                    fontSize: 16, fontWeight: 700, border: 'none',
                    cursor: selectedSlot ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    boxShadow: selectedSlot ? `0 8px 24px ${court.color}40` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                  {selectedSlot ? 'Продолжить' : 'Выберите время'}
                  {selectedSlot && <ChevronRight size={18} />}
                </motion.button>
                <div style={{ height: 90 }} />
              </div>
            </motion.div>
          )}

          {/* ─── CONFIRM ─── */}
          {step === 'confirm' && (
            <motion.div key="confirm" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.18 }}
              style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }}>

              <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', padding: '0 16px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingTop: 4 }}>
                  <button onClick={() => setStep('booking')} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    <ChevronLeft size={18} color="#94a3b8" />
                  </button>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Шаг 3 из 3</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>Подтверждение</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 16, marginBottom: 20, display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ width: 60, height: 60, borderRadius: 14, background: court.photos[0], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                    {court.emoji}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>{court.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={12} color="#64748b" />
                      <span style={{ fontSize: 12, color: '#64748b' }}>{court.location}</span>
                    </div>
                  </div>
                </div>

                {[['Дата', selectedDate.date], ['Время', selectedSlot!], ['Продолжительность', selectedDuration.label], ['Адрес', court.address]].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: 14, color: '#64748b' }}>{label}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{value}</span>
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 0' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>К оплате</span>
                  <span style={{ fontSize: 24, fontWeight: 800, color: court.color }}>{totalPrice.toLocaleString()} ₽</span>
                </div>

                {/* Кнопка внизу контента */}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleBook}
                  style={{ width: '100%', padding: '16px', borderRadius: 16, marginTop: 20, background: `linear-gradient(135deg, ${court.color}, ${court.color}bb)`, color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: `0 8px 24px ${court.color}40` }}>
                  Подтвердить и оплатить
                </motion.button>
                <div style={{ height: 90 }} />
              </div>
            </motion.div>
          )}

          {/* ─── SUCCESS ─── */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, type: 'spring' }}
              style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }}>

              <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', padding: '24px 16px 16px', textAlign: 'center' }}>
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
                  style={{ width: 88, height: 88, borderRadius: '50%', background: `linear-gradient(135deg, ${court.color}, ${court.color}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: `0 16px 40px ${court.color}50` }}>
                  <Check size={40} color="#fff" />
                </motion.div>

                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>Бронь подтверждена!</h2>
                <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24, lineHeight: 1.6 }}>
                  {court.name} забронирован на {newBooking?.date} в {newBooking?.time}
                </p>

                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 20, border: `1px solid ${court.color}30` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                    <span style={{ fontSize: 32 }}>{court.emoji}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{court.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{court.location}</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[['📅 Дата', newBooking?.date], ['⏰ Время', newBooking?.time], ['⏱ Длительность', selectedDuration.label], ['💳 Оплачено', `${totalPrice.toLocaleString()} ₽`]].map(([label, value]) => (
                      <div key={label as string} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '10px 12px' }}>
                        <div style={{ fontSize: 11, color: '#475569', marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Кнопка внизу контента */}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onClose}
                  style={{ width: '100%', padding: '16px', borderRadius: 16, marginTop: 20, background: `linear-gradient(135deg, ${court.color}, ${court.color}bb)`, color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: `0 8px 24px ${court.color}40` }}>
                  Отлично!
                </motion.button>
                <div style={{ height: 90 }} />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
