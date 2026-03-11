import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Shield, Globe, Moon } from 'lucide-react'

function Toggle({ on, onChange, color = '#22c55e' }: { on: boolean; onChange: () => void; color?: string }) {
  return (
    <motion.button onClick={onChange}
      style={{ width: 46, height: 26, borderRadius: 100, padding: 3, display: 'flex', alignItems: 'center', border: 'none', cursor: 'pointer', background: on ? color : 'rgba(255,255,255,0.12)', flexShrink: 0, transition: 'background 0.2s' }}>
      <motion.div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff' }}
        animate={{ x: on ? 20 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
    </motion.button>
  )
}

export function SettingsTab() {
  const [notifBooking, setNotifBooking] = useState(true)
  const [notifReminder, setNotifReminder] = useState(true)
  const [notifPromo, setNotifPromo] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [location, setLocation] = useState(true)
  const [twofa, setTwofa] = useState(false)
  const [lang, setLang] = useState('ru')
  const [saved, setSaved] = useState(false)

  const sections = [
    {
      title: 'Уведомления', icon: Bell, color: '#3b82f6',
      items: [
        { label: 'Подтверждения бронирований', on: notifBooking, set: () => setNotifBooking(!notifBooking) },
        { label: 'Напоминания о визите', on: notifReminder, set: () => setNotifReminder(!notifReminder) },
        { label: 'Акции и скидки', on: notifPromo, set: () => setNotifPromo(!notifPromo) },
      ]
    },
    {
      title: 'Приложение', icon: Moon, color: '#a855f7',
      items: [
        { label: 'Тёмная тема', on: darkMode, set: () => setDarkMode(!darkMode) },
        { label: 'Определять местоположение', on: location, set: () => setLocation(!location) },
      ]
    },
    {
      title: 'Безопасность', icon: Shield, color: '#22c55e',
      items: [
        { label: 'Двухфакторная аутентификация', on: twofa, set: () => setTwofa(!twofa) },
      ]
    },
  ]

  return (
    <div style={{ padding: '24px 20px', paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 20 }}>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>Настройки</h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Управление аккаунтом и приложением</p>
      </motion.div>

      {/* Язык */}
      <motion.div className="card" style={{ padding: '16px 20px' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={17} color="#22c55e" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Язык</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ code: 'ru', label: '🇷🇺 Русский' }, { code: 'en', label: '🇬🇧 English' }].map(l => (
            <button key={l.code} onClick={() => setLang(l.code)}
              style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, background: lang === l.code ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)', color: lang === l.code ? '#22c55e' : '#64748b', transition: 'all 0.2s' }}>
              {l.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Разделы */}
      {sections.map((section, si) => {
        const Icon = section.icon
        return (
          <motion.div key={section.title} className="card" style={{ padding: '16px 20px' }}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + si * 0.07 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: `${section.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={17} color={section.color} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{section.title}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {section.items.map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontSize: 14, color: '#e2e8f0' }}>{item.label}</span>
                  <Toggle on={item.on} onChange={item.set} color={section.color} />
                </div>
              ))}
            </div>
          </motion.div>
        )
      })}

      {/* Сохранить */}
      <motion.button
        onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}
        style={{ width: '100%', padding: 15, borderRadius: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 8px 20px rgba(34,197,94,0.25)' }}
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
      >
        {saved ? '✓ Сохранено!' : 'Сохранить настройки'}
      </motion.button>
    </div>
  )
}
