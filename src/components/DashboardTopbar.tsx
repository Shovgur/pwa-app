import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Bell, CalendarCheck, LayoutDashboard,
  HelpCircle, Settings, Globe, LogOut, MapPin, Star, X,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useBookings, COURTS } from '../contexts/BookingContext'
import { usePublicVenues } from '../contexts/PublicVenuesContext'
import type { Court } from '../contexts/BookingContext'
import { colors } from '../theme/tokens'
import { CourtDetailSheet } from './CourtDetailSheet'
import { courtCardBannerStyle } from '../utils/venueAdapters'
import {
  ALL_VENUE_CHIP,
  buildVenueFilterChips,
  courtMatchesQuery,
  matchesVenueChip,
  sportChipsMatchingQuery,
} from '../data/sportTypes'
import { SportFilterChips } from './ui/SportFilterChips'

const HEADER_H = 94
const TOPBAR_BG = '#1E293B'

export function DashboardTopbar() {
  const { user } = useAuth()
  const { courts: partnerCourts } = usePublicVenues()
  const navigate = useNavigate()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер'
  const firstName = user?.name?.split(' ')[0] ?? 'Гость'

  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [sportChip, setSportChip] = useState('all')
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!searchOpen) return
    const t = window.setTimeout(() => inputRef.current?.focus(), 180)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      document.removeEventListener('keydown', onKey)
    }
  }, [searchOpen])

  function closeSearch() {
    setSearchOpen(false)
    setQuery('')
    setSportChip('all')
  }

  const allCourts = [...partnerCourts, ...COURTS]
  const searchSportSuggestions = sportChipsMatchingQuery(query)
  const filterChips = buildVenueFilterChips(allCourts)
  const visibleChips = query.trim() && searchSportSuggestions.length
    ? [ALL_VENUE_CHIP, ...searchSportSuggestions]
    : query.trim()
      ? filterChips.filter(c => c.kind === 'sport').slice(0, 8)
      : []

  const results = (query.trim().length === 0 && sportChip === 'all')
    ? allCourts.filter(c => c.available).slice(0, 5)
    : allCourts
        .filter(c => matchesVenueChip(c, sportChip) && courtMatchesQuery(c, query))
        .slice(0, 8)

  return (
    <>
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={closeSearch}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(5, 8, 14, 0.72)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              zIndex: 40,
            }}
          />
        )}
      </AnimatePresence>

      <header
        className="dashboard-desktop-topbar hidden md:flex"
        style={{
          height: HEADER_H,
          flexShrink: 0,
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: TOPBAR_BG,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{
          opacity: searchOpen ? 0.25 : 1,
          transition: 'opacity 0.22s',
          pointerEvents: searchOpen ? 'none' : 'auto',
          minWidth: 0,
        }}>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0, marginBottom: 3 }}>
            {greeting} 👋
          </p>
          <h1 style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#F1F5F9',
            margin: 0,
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em',
          }}>
            {firstName}
          </h1>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          position: 'relative',
          zIndex: 51,
          marginLeft: 'auto',
        }}>
          <motion.div
            layout
            animate={{ width: searchOpen ? 420 : 260 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{
              position: 'relative',
              height: 42,
              borderRadius: 12,
              background: searchOpen ? '#222D3F' : '#2A3548',
              border: searchOpen
                ? '1.5px solid rgba(34,197,94,0.45)'
                : '1px solid rgba(255,255,255,0.06)',
              boxShadow: searchOpen ? '0 12px 40px rgba(0,0,0,0.45)' : 'none',
              display: 'flex',
              alignItems: 'center',
              overflow: 'visible',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              height: '100%',
              padding: '0 12px 0 14px',
            }}>
              <Search size={15} color={searchOpen ? '#22C55E' : '#64748b'} style={{ flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                onClick={() => setSearchOpen(true)}
                placeholder="Поиск площадок..."
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: '#F1F5F9',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  padding: 0,
                }}
              />
              {searchOpen && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (query) setQuery('')
                    else closeSearch()
                  }}
                  aria-label={query ? 'Очистить' : 'Закрыть поиск'}
                  style={{
                    width: 24, height: 24, borderRadius: 8,
                    border: 'none', background: 'rgba(255,255,255,0.06)',
                    color: '#94a3b8', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, padding: 0,
                  }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    left: 0,
                    right: 0,
                    borderRadius: 16,
                    background: '#161F2E',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
                    overflow: 'hidden',
                    maxHeight: 380,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{
                    padding: '10px 14px 8px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#64748b',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}>
                    {query.trim() ? `Результаты · ${results.length}` : 'Популярные сейчас'}
                  </div>

                  {visibleChips.length > 0 && (
                    <div style={{ padding: '0 10px 8px' }}>
                      <SportFilterChips
                        chips={visibleChips}
                        activeId={sportChip}
                        onSelect={setSportChip}
                        size="sm"
                      />
                    </div>
                  )}

                  <div style={{ overflowY: 'auto', padding: '0 6px 8px' }}>
                    {results.length === 0 ? (
                      <p style={{ padding: '16px 12px', margin: 0, fontSize: 13, color: '#64748b' }}>
                        Ничего не найдено по запросу «{query}»
                      </p>
                    ) : (
                      results.map(c => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setSelectedCourt(c)
                            closeSearch()
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 12px',
                            borderRadius: 12,
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            color: '#F1F5F9',
                            fontFamily: 'inherit',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                        >
                          <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            ...courtCardBannerStyle(c),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18, flexShrink: 0,
                          }}>
                            {c.emoji}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {c.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                              <span style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>
                                <MapPin size={10} /> {c.location}
                              </span>
                              <span style={{ fontSize: 11, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Star size={10} fill="#f59e0b" color="#f59e0b" /> {c.rating}
                              </span>
                            </div>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: c.color, flexShrink: 0 }}>
                            {c.price.toLocaleString()} ₽
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => {
                      closeSearch()
                      navigate('/dashboard/courts')
                    }}
                    style={{
                      border: 'none',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      background: 'transparent',
                      padding: '12px 16px',
                      color: '#22C55E',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                    }}
                  >
                    Смотреть все площадки →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/dashboard/notifications')}
            aria-label="Уведомления"
            style={{
              position: 'relative',
              width: 38,
              height: 38,
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.06)',
              background: '#2A3548',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              flexShrink: 0,
            }}
          >
            <Bell size={16} />
            <span style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 7,
              height: 7,
              borderRadius: 4,
              background: '#22C55E',
              border: '1.5px solid #1E293B',
            }} />
          </motion.button>

          <AvatarMenu />
        </div>
      </header>

      {selectedCourt && (
        <CourtDetailSheet court={selectedCourt} onClose={() => setSelectedCourt(null)} />
      )}
    </>
  )
}

function AvatarMenu() {
  const { user, logout } = useAuth()
  const { bookings } = useBookings()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const activeCount = bookings.filter(b => b.status === 'upcoming').length
  const initials = user?.avatar || user?.name?.slice(0, 2).toUpperCase() || 'U'

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleLogout() {
    setOpen(false)
    logout()
    navigate('/')
  }

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Меню пользователя"
        aria-expanded={open}
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          border: open
            ? '1.5px solid rgba(34,197,94,0.6)'
            : '1.5px solid rgba(34,197,94,0.25)',
          background: open ? 'rgba(34,197,94,0.18)' : 'rgba(34,197,94,0.1)',
          cursor: 'pointer',
          color: colors.text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          letterSpacing: '0.04em',
          flexShrink: 0,
          transition: 'border-color 0.18s, background 0.18s',
        }}
      >
        {initials}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              minWidth: 220,
              borderRadius: 16,
              background: '#0E1420',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)',
              overflow: 'hidden',
              zIndex: 10000,
            }}
          >
            <div style={{
              padding: '14px 16px 12px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: 0 }}>
                {user?.name}
              </p>
              <p style={{ fontSize: 12, color: colors.muted, margin: '2px 0 0' }}>
                {user?.email}
              </p>
            </div>

            <div style={{ padding: '6px 0' }}>
              <DropItem
                icon={<CalendarCheck size={15} />}
                label="Мои брони"
                badge={activeCount}
                onClick={() => { setOpen(false); navigate('/dashboard/bookings') }}
              />
              <DropItem
                icon={<LayoutDashboard size={15} />}
                label="Личный кабинет"
                onClick={() => { setOpen(false); navigate('/dashboard/profile') }}
              />
              <DropItem
                icon={<HelpCircle size={15} />}
                label="Как это работает"
                onClick={() => { setOpen(false); navigate('/how-it-works') }}
              />
              <DropItem
                icon={<Settings size={15} />}
                label="Настройки"
                onClick={() => { setOpen(false); navigate('/dashboard/settings') }}
              />
              <DropItem
                icon={<Globe size={15} />}
                label="На сайт"
                highlight
                onClick={() => { setOpen(false); navigate('/') }}
              />
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '6px 0' }}>
              <DropItem
                icon={<LogOut size={15} />}
                label="Выйти"
                danger
                onClick={handleLogout}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface DropItemProps {
  icon: React.ReactNode
  label: string
  badge?: number
  danger?: boolean
  highlight?: boolean
  onClick: () => void
}

function DropItem({ icon, label, badge, danger, highlight, onClick }: DropItemProps) {
  const [hover, setHover] = useState(false)
  const color = danger ? '#F87171' : highlight ? '#22C55E' : colors.text2

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '9px 16px',
        background: hover
          ? (danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.05)')
          : 'transparent',
        border: 'none',
        cursor: 'pointer',
        color,
        fontSize: 13,
        fontWeight: highlight ? 600 : 500,
        textAlign: 'left',
        transition: 'background 0.12s, color 0.12s',
      }}
    >
      <span style={{ flexShrink: 0, opacity: highlight ? 1 : 0.75 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && badge > 0 && (
        <span style={{
          minWidth: 18, height: 18,
          borderRadius: 9,
          background: '#22C55E',
          color: '#0A0E17',
          fontSize: 10,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 4px',
        }}>
          {badge}
        </span>
      )}
    </button>
  )
}
