import { fadeUpContainer, fadeUpItem } from '../../utils/variants'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Shield, Palette, Globe, Smartphone, Save } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

function Toggle({ value, onChange, color = '#7c3aed' }: { value: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <motion.button
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full flex-shrink-0"
      style={{ background: value ? color : 'rgba(255,255,255,0.1)' }}
      animate={{ background: value ? color : 'rgba(255,255,255,0.1)' }}
    >
      <motion.div
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
        animate={{ x: value ? 21 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
    </motion.button>
  )
}

export function SettingsTab() {
  const { user } = useAuth()
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifPush, setNotifPush] = useState(true)
  const [notifSms, setNotifSms] = useState(false)
  const [twoFactor, setTwoFactor] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [language, setLanguage] = useState('ru')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const sections = [
    {
      title: 'Уведомления',
      icon: Bell,
      color: '#22d3ee',
      settings: [
        { label: 'Email уведомления', desc: 'Получать важные обновления на email', value: notifEmail, onChange: setNotifEmail },
        { label: 'Push уведомления', desc: 'Уведомления в браузере', value: notifPush, onChange: setNotifPush },
        { label: 'SMS уведомления', desc: 'Уведомления через SMS', value: notifSms, onChange: setNotifSms },
      ],
    },
    {
      title: 'Безопасность',
      icon: Shield,
      color: '#34d399',
      settings: [
        { label: 'Двухфакторная аутентификация', desc: 'Дополнительная защита аккаунта', value: twoFactor, onChange: setTwoFactor },
      ],
    },
    {
      title: 'Внешний вид',
      icon: Palette,
      color: '#a855f7',
      settings: [
        { label: 'Тёмная тема', desc: 'Тёмный интерфейс', value: darkMode, onChange: setDarkMode },
      ],
    },
  ]

  return (
    <motion.div
      className="p-6 space-y-6 max-w-2xl"
      variants={fadeUpContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUpItem}>
        <h1 className="text-2xl font-bold text-white">Настройки</h1>
        <p className="text-slate-400 text-sm mt-1">Управление аккаунтом и предпочтениями</p>
      </motion.div>

      {/* Profile */}
      <motion.div
        variants={fadeUpItem}
        className="glass rounded-2xl p-5"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Smartphone size={16} className="text-slate-400" /> Профиль
        </h3>
        <div className="flex items-center gap-4 mb-5">
          <motion.div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            {user?.avatar}
          </motion.div>
          <div>
            <p className="text-white font-semibold">{user?.name}</p>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <p className="text-purple-400 text-xs mt-1">{user?.role}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Имя</label>
            <input
              defaultValue={user?.name}
              className="w-full px-3 py-2.5 rounded-xl glass text-white text-sm outline-none"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Email</label>
            <input
              defaultValue={user?.email}
              className="w-full px-3 py-2.5 rounded-xl glass text-white text-sm outline-none"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
        </div>
      </motion.div>

      {/* Language */}
      <motion.div
        variants={fadeUpItem}
        className="glass rounded-2xl p-5"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Globe size={16} className="text-slate-400" /> Язык интерфейса
        </h3>
        <div className="flex gap-3">
          {[{ code: 'ru', label: '🇷🇺 Русский' }, { code: 'en', label: '🇬🇧 English' }].map((l) => (
            <motion.button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{
                background: language === l.code ? 'rgba(124,58,237,0.2)' : 'transparent',
                color: language === l.code ? '#a855f7' : '#64748b',
                border: language === l.code ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.06)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {l.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Toggle sections */}
      {sections.map((section) => {
        const Icon = section.icon
        return (
          <motion.div
            key={section.title}
            variants={fadeUpItem}
            className="glass rounded-2xl p-5"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Icon size={16} style={{ color: section.color }} />
              {section.title}
            </h3>
            <div className="space-y-4">
              {section.settings.map((s) => (
                <div key={s.label} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white text-sm">{s.label}</p>
                    <p className="text-slate-500 text-xs">{s.desc}</p>
                  </div>
                  <Toggle value={s.value} onChange={s.onChange} color={section.color} />
                </div>
              ))}
            </div>
          </motion.div>
        )
      })}

      {/* Save */}
      <motion.div variants={fadeUpItem}>
        <motion.button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
          whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(124,58,237,0.4)' }}
          whileTap={{ scale: 0.97 }}
        >
          <Save size={16} />
          {saved ? '✓ Сохранено!' : 'Сохранить изменения'}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
