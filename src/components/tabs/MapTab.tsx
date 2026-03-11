import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Navigation, Search } from 'lucide-react'

const PINS = [
  { id: 1, emoji: '🎾', name: 'Корт Спарта', price: 1500, x: 28, y: 22, color: '#22c55e', available: true },
  { id: 2, emoji: '⚽', name: 'Олимп 5×5', price: 2400, x: 60, y: 38, color: '#3b82f6', available: true },
  { id: 3, emoji: '🏀', name: 'Arena ЦСКА', price: 900, x: 42, y: 55, color: '#f97316', available: true },
  { id: 4, emoji: '🏸', name: 'Бадминтон Plaza', price: 700, x: 72, y: 20, color: '#a855f7', available: false },
  { id: 5, emoji: '🎾', name: 'Лужники Корт 1', price: 3000, x: 18, y: 65, color: '#22c55e', available: true },
  { id: 6, emoji: '🏊', name: 'Aqua Sport', price: 600, x: 80, y: 68, color: '#f59e0b', available: true },
]

const AREAS = [
  { name: 'Центр', courts: 8, color: '#22c55e' },
  { name: 'Север', courts: 5, color: '#3b82f6' },
  { name: 'Юг', courts: 6, color: '#f97316' },
  { name: 'Запад', courts: 4, color: '#a855f7' },
  { name: 'Восток', courts: 7, color: '#06b6d4' },
]

export function MapTab() {
  const [selected, setSelected] = useState<typeof PINS[0] | null>(null)


  return (
    <div style={{ padding: '24px 20px', paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 20 }}>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>Карта площадок</h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Найдите ближайшие спортивные объекты</p>
      </motion.div>

      {/* Поиск места */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input placeholder="Поиск по адресу или метро..."
            style={{ width: '100%', padding: '13px 14px 13px 40px', borderRadius: 14, background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
        </div>
      </motion.div>

      {/* Имитация карты */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', height: 300, border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Фон карты */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, #0d1f2d 0%, #0f2740 50%, #0d2233 100%)',
          }}>
            {/* Сетка улиц */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }} viewBox="0 0 100 100" preserveAspectRatio="none">
              {[10, 25, 40, 55, 70, 85].map(x => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="100" stroke="#3b82f6" strokeWidth="0.5" />)}
              {[15, 30, 45, 60, 75, 90].map(y => <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="#3b82f6" strokeWidth="0.5" />)}
              {/* Главные улицы */}
              <line x1="0" y1="50" x2="100" y2="50" stroke="#60a5fa" strokeWidth="1" />
              <line x1="50" y1="0" x2="50" y2="100" stroke="#60a5fa" strokeWidth="1" />
            </svg>

            {/* Блоки зданий */}
            {[
              [12, 17, 10, 8], [27, 32, 10, 8], [42, 47, 10, 8], [57, 62, 10, 8], [72, 77, 10, 8],
              [12, 37, 25, 8], [42, 67, 25, 8], [72, 87, 25, 8],
              [12, 17, 38, 8], [27, 52, 38, 8], [57, 72, 38, 8],
              [12, 37, 52, 8], [42, 67, 52, 8], [72, 87, 52, 8],
              [12, 17, 65, 8], [27, 52, 65, 8], [57, 82, 65, 8],
              [12, 37, 78, 8], [42, 62, 78, 8], [67, 87, 78, 8],
            ].map(([x, x2, y, h], i) => (
              <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${x2 - x}%`, height: `${h}%`, background: 'rgba(30,50,80,0.6)', borderRadius: 3 }} />
            ))}

            {/* Пользователь */}
            <motion.div
              style={{ position: 'absolute', left: '48%', top: '48%', transform: 'translate(-50%, -50%)', zIndex: 5 }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#3b82f6', border: '3px solid #fff', boxShadow: '0 0 0 6px rgba(59,130,246,0.25)' }} />
            </motion.div>

            {/* Пины */}
            {PINS.map(pin => (
              <motion.button key={pin.id}
                onClick={() => setSelected(selected?.id === pin.id ? null : pin)}
                style={{
                  position: 'absolute', left: `${pin.x}%`, top: `${pin.y}%`,
                  transform: 'translate(-50%, -50%)',
                  background: pin.available ? pin.color : '#475569',
                  border: '2px solid #fff',
                  borderRadius: 12,
                  width: selected?.id === pin.id ? 44 : 34,
                  height: selected?.id === pin.id ? 44 : 34,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: selected?.id === pin.id ? 22 : 18,
                  cursor: 'pointer',
                  boxShadow: `0 4px 12px rgba(0,0,0,0.4)`,
                  zIndex: selected?.id === pin.id ? 10 : 3,
                  transition: 'all 0.2s',
                }}
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2 + pin.id * 0.3, repeat: Infinity, delay: pin.id * 0.2 }}
              >
                {pin.emoji}
              </motion.button>
            ))}
          </div>

          {/* Кнопка геолокации */}
          <button style={{ position: 'absolute', bottom: 12, right: 12, width: 38, height: 38, borderRadius: 12, background: '#1a2332', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <Navigation size={16} color="#22c55e" />
          </button>
        </div>

        {/* Карточка выбранного */}
        {selected && (
          <motion.div className="card" style={{ padding: '14px 16px', marginTop: 12 }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: `${selected.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{selected.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{selected.price} ₽ / час</div>
              </div>
              <div style={{ fontSize: 12, padding: '5px 12px', borderRadius: 100, fontWeight: 600, background: selected.available ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.12)', color: selected.available ? '#22c55e' : '#f87171' }}>
                {selected.available ? 'Свободно' : 'Занято'}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Районы */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>Площадки по районам</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {AREAS.map((area, i) => (
            <motion.div key={area.name} className="card card-hover"
              style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 + i * 0.06 }}
              whileHover={{ scale: 1.02 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: `${area.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={18} color={area.color} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{area.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{area.courts} площадок</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
