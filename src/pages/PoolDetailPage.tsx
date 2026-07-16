import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, MapPin, Star, Flame, GraduationCap, ShieldCheck, ShieldX,
  ExternalLink,
} from 'lucide-react'
import { SeoHead } from '../components/SeoHead'
import { getPoolById, getBuyUrl } from '../data/pools'
import { colors } from '../theme/tokens'
import { FadeImg } from '../components/ui/FadeImg'
import { trackPoolBuyClick } from '../utils/metrika'

function poolDescription(pool: ReturnType<typeof getPoolById>): string {
  if (!pool) return ''
  const parts: string[] = []
  parts.push(`${pool.name} — современный бассейн в ${pool.city === 'Москва' || pool.city === 'Зеленоград' ? 'Москве' : pool.city}.`)
  parts.push('Свободное плавание, детские группы и индивидуальные тренировки.')
  if (pool.sauna) parts.push('Комплекс включает сауну.')
  if (pool.hasCoach) parts.push('Доступны персональные тренеры.')
  if (!pool.medCert) parts.push('Медицинская справка не требуется.')
  else parts.push('Необходима медицинская справка.')
  return parts.join(' ')
}

export function PoolDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const pool = id ? getPoolById(id) : undefined

  if (!pool) {
    return (
      <div className="page-center">
        <p style={{ color: colors.muted, marginBottom: 16 }}>Бассейн не найден</p>
        <button
          type="button"
          className="booking-back"
          onClick={() => navigate('/catalog?type=pool')}
        >
          <ArrowLeft size={18} /> К бассейнам
        </button>
      </div>
    )
  }

  const buyUrl = getBuyUrl(pool.id)

  const amenities = [
    pool.sauna && 'Сауна',
    pool.hasCoach && 'Тренер',
    pool.medCert ? 'Мед. справка' : 'Без справки',
    'Раздевалки',
    'Душ',
  ].filter(Boolean) as string[]

  return (
    <div className="booking-layout">
      <SeoHead
        title={`${pool.name} — расписание и билеты онлайн`}
        description={`Бронируй билеты в ${pool.name}. Адрес: ${pool.address}, ${pool.city}. Цена от ${pool.price}. Расписание сеансов и онлайн-бронирование.`}
        path={`/pools/${pool.id}`}
      />

      <div className="booking-main">
        <div className="site-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
          <button type="button" className="booking-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Назад
          </button>

          <motion.div className="booking-hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div
              className="booking-hero-image"
              style={{
                background: 'linear-gradient(135deg, #0c4a6e 0%, #164e63 100%)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <FadeImg
                src={pool.image}
                alt={pool.name}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span className="booking-hero-badge">🏊 Бассейн</span>
              {pool.sauna && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    background: 'rgba(239,68,68,0.85)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: 8,
                    padding: '5px 12px',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    zIndex: 1,
                  }}
                >
                  <Flame size={13} /> Сауна
                </span>
              )}
            </div>

            <div className="booking-hero-info">
              <h1>{pool.name}</h1>
              <p style={{ color: colors.muted, fontSize: 15, lineHeight: 1.55 }}>
                {poolDescription(pool)}
              </p>
              <div className="booking-hero-meta">
                <span><Star size={15} fill="#EAB308" color="#EAB308" /> 4.7 · партнёр basseiny.online</span>
                <span><MapPin size={15} color={colors.green} /> {pool.address}, {pool.city}</span>
              </div>
              <p style={{ fontSize: 13, color: colors.text2 }}>{amenities.join(' · ')}</p>
            </div>
          </motion.div>

          <section className="booking-section">
            <div className="booking-section-head">
              <div>
                <h2>Информация о бассейне</h2>
                <p>Удобства и условия посещения</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              <FeatureCard
                icon={<span style={{ fontSize: 22 }}>💰</span>}
                label="Цена онлайн"
                value={pool.price}
                valueColor={colors.green}
              />
              <FeatureCard
                icon={pool.sauna ? <Flame size={20} color="#ef4444" /> : <span style={{ fontSize: 22 }}>🚿</span>}
                label="Сауна"
                value={pool.sauna ? 'Есть' : 'Нет'}
                valueColor={pool.sauna ? '#ef4444' : colors.muted}
              />
              <FeatureCard
                icon={pool.medCert
                  ? <ShieldCheck size={20} color="#f59e0b" />
                  : <ShieldX size={20} color={colors.green} />}
                label="Мед. справка"
                value={pool.medCert ? 'Требуется' : 'Не нужна'}
                valueColor={pool.medCert ? '#f59e0b' : colors.green}
              />
              {pool.hasCoach && (
                <FeatureCard
                  icon={<GraduationCap size={20} color="#3b82f6" />}
                  label="Тренер"
                  value="Доступен"
                  valueColor="#3b82f6"
                />
              )}
            </div>
          </section>

          <section className="booking-section">
            <div className="booking-section-head">
              <div>
                <h2>Расположение</h2>
                <p>{pool.address}, {pool.city}</p>
              </div>
            </div>
            <div
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                height: 280,
                position: 'relative',
              }}
            >
              <iframe
                title={`Карта — ${pool.name}`}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${pool.lon - 0.012}%2C${pool.lat - 0.008}%2C${pool.lon + 0.012}%2C${pool.lat + 0.008}&layer=mapnik&marker=${pool.lat}%2C${pool.lon}`}
                width="100%"
                height="280"
                style={{ border: 'none', display: 'block', filter: 'saturate(0.8) brightness(0.85)' }}
                loading="lazy"
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  background: 'rgba(10,15,25,0.88)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: 12,
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  pointerEvents: 'none',
                }}
              >
                <MapPin size={14} color={colors.green} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{pool.address}</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <aside className="booking-sidebar">
        <div className="booking-summary-panel">
          <div className="booking-summary-scroll">
            <h2 className="booking-summary-title">Сводка</h2>

            <div className="booking-summary-venue">
              <div
                className="booking-summary-venue-image"
                style={{
                  background: 'linear-gradient(135deg, #0c4a6e 0%, #164e63 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <FadeImg
                  src={pool.image}
                  alt={pool.name}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div>
                <p className="booking-summary-venue-name">{pool.name}</p>
                <p className="booking-summary-venue-meta">Бассейн · {pool.city}</p>
              </div>
            </div>

            <div className="booking-summary-divider" />

            <div className="booking-summary-list">
              <div className="booking-summary-row">
                <span>Цена онлайн</span>
                <span>{pool.price}</span>
              </div>
              <div className="booking-summary-row">
                <span>Мед. справка</span>
                <span>{pool.medCert ? 'Требуется' : 'Не нужна'}</span>
              </div>
              {pool.sauna && (
                <div className="booking-summary-row">
                  <span>Сауна</span>
                  <span>Включена</span>
                </div>
              )}
            </div>
          </div>

          <div className="booking-summary-footer">
            <div className="booking-summary-total">
              <span>Итого</span>
              <span className="booking-summary-total-price booking-summary-total-price--green">
                {pool.price}
              </span>
            </div>

            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackPoolBuyClick(pool)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                background: colors.green,
                color: '#000',
                borderRadius: 14,
                padding: '14px 20px',
                fontWeight: 800,
                fontSize: 16,
                textDecoration: 'none',
                transition: 'opacity 0.2s',
                boxSizing: 'border-box',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.85')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')}
            >
              Купить билет →
              <ExternalLink size={15} style={{ opacity: 0.6 }} />
            </a>

            <p className="booking-sidebar-note">
              Оплата и запись — на сайте партнёра basseiny.online
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}

function FeatureCard({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode
  label: string
  value: string
  valueColor: string
}) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div>{icon}</div>
      <div>
        <p style={{ margin: 0, fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </p>
        <p style={{ margin: '2px 0 0', fontWeight: 700, fontSize: 15, color: valueColor }}>{value}</p>
      </div>
    </div>
  )
}
