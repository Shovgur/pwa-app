import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Waves, ChevronRight, Flame, GraduationCap } from 'lucide-react'
import { SeoHead } from '../components/SeoHead'
import { FadeImg } from '../components/ui/FadeImg'
import { POOLS } from '../data/pools'
import { colors } from '../theme/tokens'

const CITIES = ['Все города', 'Москва', 'Зеленоград', 'Нахабино', 'Омск', 'Красноярск']

export function PoolsPage() {
  const [cityFilter, setCityFilter] = useState('Все города')

  const filtered = useMemo(() => {
    if (cityFilter === 'Все города') return POOLS
    return POOLS.filter((p) => p.city === cityFilter || (cityFilter === 'Москва' && p.city === 'Зеленоград'))
  }, [cityFilter])

  return (
    <div className="site-container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <SeoHead
        title="Бассейны онлайн — расписание и билеты"
        description="Бронируй билеты в бассейны Москвы и других городов онлайн. Расписание сеансов, цены, скидки при онлайн-бронировании через BookinGo."
        path="/pools"
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 40 }}>🏊</span>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>Бассейны</h1>
            <p style={{ color: colors.muted, fontSize: 15, margin: 0 }}>
              {POOLS.length} бассейнов · Партнёр basseiny.online
            </p>
          </div>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(59,130,246,0.1) 100%)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 16,
            padding: '16px 20px',
            marginTop: 20,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 28 }}>🎟️</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#fff' }}>
              Онлайн-бронирование дешевле кассы
            </p>
            <p style={{ margin: 0, fontSize: 13, color: colors.muted }}>
              Расписание и оплата напрямую через сайт партнёра basseiny.online
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}
      >
        {CITIES.map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => setCityFilter(city)}
            style={{
              padding: '8px 16px',
              borderRadius: 100,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              transition: 'all 0.2s',
              background: cityFilter === city ? colors.green : 'rgba(255,255,255,0.06)',
              color: cityFilter === city ? '#000' : colors.muted,
            }}
          >
            {city}
          </button>
        ))}
      </motion.div>

      <motion.div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 20,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        {filtered.map((pool, i) => (
          <motion.div
            key={pool.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              to={`/pools/${pool.id}`}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 20,
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.transform = 'translateY(-4px)'
                  el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.3)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = 'none'
                }}
              >
                <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                  <FadeImg
                    src={pool.image}
                    alt={pool.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      display: 'flex',
                      gap: 6,
                    }}
                  >
                    {pool.sauna && (
                      <span
                        style={{
                          background: 'rgba(239,68,68,0.85)',
                          backdropFilter: 'blur(8px)',
                          borderRadius: 8,
                          padding: '4px 10px',
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Flame size={12} /> Сауна
                      </span>
                    )}
                    {pool.hasCoach && (
                      <span
                        style={{
                          background: 'rgba(59,130,246,0.85)',
                          backdropFilter: 'blur(8px)',
                          borderRadius: 8,
                          padding: '4px 10px',
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <GraduationCap size={12} /> Тренер
                      </span>
                    )}
                  </div>
                  <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
                    <span
                      style={{
                        background: 'rgba(16,185,129,0.9)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: 10,
                        padding: '6px 14px',
                        fontSize: 15,
                        fontWeight: 800,
                        color: '#000',
                      }}
                    >
                      {pool.price}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '16px 16px 14px' }}>
                  <h3
                    style={{
                      margin: '0 0 6px',
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#fff',
                      lineHeight: 1.3,
                    }}
                  >
                    {pool.name}
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: colors.muted,
                      fontSize: 13,
                      marginBottom: 12,
                    }}
                  >
                    <MapPin size={13} />
                    <span>{pool.address}, {pool.city}</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span
                        style={{
                          background: 'rgba(16,185,129,0.12)',
                          color: colors.green,
                          borderRadius: 8,
                          padding: '4px 10px',
                          fontSize: 12,
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Waves size={12} /> Бассейн
                      </span>
                      {!pool.medCert && (
                        <span
                          style={{
                            background: 'rgba(34,197,94,0.12)',
                            color: '#22c55e',
                            borderRadius: 8,
                            padding: '4px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          Без справки
                        </span>
                      )}
                    </div>
                    <ChevronRight size={18} color={colors.muted} />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
