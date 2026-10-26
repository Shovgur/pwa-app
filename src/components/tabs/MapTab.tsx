import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Navigation, Search } from 'lucide-react'
import { usePublicVenues } from '../../contexts/PublicVenuesContext'
import type { Court } from '../../contexts/BookingContext'

type MapPinItem = Court & { x: number; y: number }

function projectPins(venues: Court[]): MapPinItem[] {
  const withCoords = venues.filter(
    (v) => v.lat != null && v.lng != null && Number.isFinite(v.lat) && Number.isFinite(v.lng),
  )
  if (withCoords.length === 0) return []

  const lats = withCoords.map((v) => v.lat!)
  const lngs = withCoords.map((v) => v.lng!)
  let minLat = Math.min(...lats)
  let maxLat = Math.max(...lats)
  let minLng = Math.min(...lngs)
  let maxLng = Math.max(...lngs)

  // Если все точки почти в одном месте — раздвигаем рамку, чтобы пины не слиплись.
  if (maxLat - minLat < 0.01) {
    minLat -= 0.02
    maxLat += 0.02
  }
  if (maxLng - minLng < 0.01) {
    minLng -= 0.02
    maxLng += 0.02
  }

  const pad = 12
  return withCoords.map((v) => ({
    ...v,
    x: pad + ((v.lng! - minLng) / (maxLng - minLng)) * (100 - pad * 2),
    y: pad + ((maxLat - v.lat!) / (maxLat - minLat)) * (100 - pad * 2),
  }))
}

/** Яндекс.Карты: от геолокации пользователя до площадки; без геолокации — rtext=~lat,lng. */
function openYandexRoute(destLat: number, destLng: number) {
  const to = `${destLat},${destLng}`
  const open = (from?: string) => {
    const rtext = from ? `${from}~${to}` : `~${to}`
    window.open(`https://yandex.ru/maps/?rtext=${rtext}&rtt=auto`, '_blank', 'noopener,noreferrer')
  }

  if (!navigator.geolocation) {
    open()
    return
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => open(`${pos.coords.latitude},${pos.coords.longitude}`),
    () => open(),
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
  )
}

export function MapTab() {
  const { courts, isLoading } = usePublicVenues()
  const pins = useMemo(() => projectPins(courts), [courts])
  const [selected, setSelected] = useState<MapPinItem | null>(null)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return pins
    return pins.filter(
      (p) =>
        p.name.toLowerCase().includes(q)
        || p.location.toLowerCase().includes(q)
        || p.address.toLowerCase().includes(q)
        || p.sport.toLowerCase().includes(q),
    )
  }, [pins, query])

  const areas = useMemo(() => {
    const byCity = new Map<string, number>()
    for (const p of pins) {
      const city = p.location || 'Другое'
      byCity.set(city, (byCity.get(city) ?? 0) + 1)
    }
    const palette = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#06b6d4']
    return [...byCity.entries()].map(([name, count], i) => ({
      name,
      courts: count,
      color: palette[i % palette.length],
    }))
  }, [pins])

  return (
    <div className="dashboard-page">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F1F5F9', marginBottom: 4, fontFamily: 'var(--font-display)' }}>
          Карта площадок
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          {isLoading ? 'Загружаем площадки…' : `Площадок с координатами: ${pins.length}`}
        </p>
      </motion.div>

      <div className="dashboard-map-layout">
        <div className="dashboard-map-main" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#64748b" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по названию, городу или адресу..."
                style={{
                  width: '100%', padding: '13px 14px 13px 40px', borderRadius: 14,
                  background: '#222D3F', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                }}
              />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <div style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', height: 420, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, #0d1f2d 0%, #0f2740 50%, #0d2233 100%)',
              }}>
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }} viewBox="0 0 100 100" preserveAspectRatio="none">
                  {[10, 25, 40, 55, 70, 85].map((x) => (
                    <line key={`v${x}`} x1={x} y1="0" x2={x} y2="100" stroke="#3b82f6" strokeWidth="0.5" />
                  ))}
                  {[15, 30, 45, 60, 75, 90].map((y) => (
                    <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="#3b82f6" strokeWidth="0.5" />
                  ))}
                </svg>

                {filtered.length === 0 && !isLoading && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#64748b', fontSize: 14, padding: 24, textAlign: 'center',
                  }}>
                    Нет площадок с координатами
                  </div>
                )}

                {filtered.map((pin) => (
                  <motion.button
                    key={pin.id}
                    type="button"
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
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                      zIndex: selected?.id === pin.id ? 10 : 3,
                      transition: 'all 0.2s',
                    }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {pin.emoji}
                  </motion.button>
                ))}
              </div>

              {selected?.lat != null && selected?.lng != null && (
                <button
                  type="button"
                  onClick={() => openYandexRoute(selected.lat!, selected.lng!)}
                  title="Проложить маршрут"
                  style={{
                    position: 'absolute', bottom: 12, right: 12, zIndex: 10,
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px', borderRadius: 12,
                    background: '#1a2332', border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer', color: '#e2e8f0', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                  }}
                >
                  <Navigation size={16} color="#22c55e" />
                  Проложить маршрут
                </button>
              )}
            </div>
          </motion.div>
        </div>

        <div className="dashboard-map-side" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {selected ? (
            <motion.div className="card" style={{ padding: '14px 16px' }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14, background: `${selected.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                }}>
                  {selected.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{selected.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {selected.location} · {selected.price.toLocaleString('ru-RU')} ₽ / час
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{selected.address}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openYandexRoute(selected.lat!, selected.lng!)}
                style={{
                  marginTop: 12, width: '100%', padding: '11px 14px', borderRadius: 12,
                  background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.28)',
                  color: '#22c55e', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit',
                }}
              >
                <Navigation size={15} />
                Проложить маршрут
              </button>

              {selected.partnerVenueId && (
                <Link
                  to={`/venue/${selected.partnerVenueId}`}
                  style={{
                    display: 'block', marginTop: 8, textAlign: 'center', fontSize: 13,
                    color: '#94a3b8', textDecoration: 'none', fontWeight: 600, padding: '8px 0',
                  }}
                >
                  Открыть площадку →
                </Link>
              )}
            </motion.div>
          ) : (
            <div className="card" style={{ padding: '18px 16px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
              Выберите метку на карте, чтобы увидеть детали площадки
            </div>
          )}

          {areas.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>По городам</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {areas.map((area, i) => (
                  <motion.div
                    key={area.name}
                    className="card"
                    style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.05 }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 12, background: `${area.color}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <MapPin size={16} color={area.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{area.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{area.courts} площадок</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
