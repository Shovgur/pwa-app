import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Zap, PlusCircle, ShieldCheck, ArrowRight, Sparkles,
} from 'lucide-react'
import { HeroBackground } from '../components/layout/HeroBackground'
import { HeroSearch, HeroStats } from '../components/ui/HeroSearch'
import { Button } from '../components/ui/Button'
import { VenueCard } from '../components/ui/VenueCard'
import { CategoryCard } from '../components/ui/CategoryCard'
import { PARTNERS, FEATURES, LOFTS } from '../data/venues'
import { COURTS } from '../contexts/BookingContext'
import { colors } from '../theme/tokens'
import { fadeUpContainer, fadeUpItem } from '../utils/variants'

const FEATURE_ICONS = { zap: Zap, 'plus-circle': PlusCircle, 'shield-check': ShieldCheck }

const CATEGORY_ITEMS = [
  { id: 'sport' as const, emoji: '🏊', label: 'Спорт и бассейны', color: '#3B82F6', desc: 'Корты, бассейны, залы и поля' },
  { id: 'loft' as const, emoji: '🏢', label: 'Лофты', color: '#F97316', desc: 'Пространства с услугами и кейтерингом' },
  { id: 'meeting' as const, emoji: '💼', label: 'Переговорные', color: '#A855F7', desc: 'Комнаты для встреч и презентаций' },
  { id: 'hotel' as const, emoji: '🏨', label: 'Отели', color: '#EC4899', desc: 'Залы и площадки в отелях' },
]

export function LandingPage() {
  const partnerCards = [
    {
      ...PARTNERS[0],
      to: `/sport/${COURTS.find(c => c.sport === 'Бассейн')?.id ?? 6}`,
      title: 'AquaSport Arena',
      badge: 'Спорт',
      price: '1 200 ₽/час',
      rating: 4.8,
      location: 'Москва',
      description: '12 бассейнов и спортивных кортов — от любительских до профессиональных.',
    },
    {
      ...PARTNERS[1],
      to: `/loft/${LOFTS[0].id}`,
      title: 'Loft Sunset',
      badge: 'Лофт + услуги',
      price: '3 500 ₽/час',
      rating: LOFTS[0].rating,
      location: 'Москва · Loft & Co',
      description: 'Панорамный лофт 80м² — закуски, бар и оборудование при бронировании.',
    },
    {
      ...PARTNERS[2],
      to: `/loft/${LOFTS[2].id}`,
      title: 'Urban Loft Studio',
      badge: 'Лофт + услуги',
      price: '4 000 ₽/час',
      rating: LOFTS[2].rating,
      location: 'Санкт-Петербург',
      description: 'Минималистичный белый лофт с фото-зоной и проектором 4K.',
    },
  ]

  return (
    <div style={{ width: '100%' }}>
      {/* Hero */}
      <section style={{ position: 'relative', width: '100%', minHeight: '88vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <HeroBackground />
        <div
          className="site-container"
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            paddingTop: 88,
            paddingBottom: 72,
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 100,
              background: colors.greenDim,
              border: '1px solid rgba(34,197,94,0.25)',
              marginBottom: 32,
            }}
          >
            <motion.span
              style={{ width: 8, height: 8, borderRadius: '50%', background: colors.green, display: 'inline-block' }}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, color: colors.green }}>Бронирование площадок нового поколения</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            style={{ fontSize: 'clamp(40px, 5.5vw, 72px)', fontWeight: 800, lineHeight: 1.05, marginBottom: 24, color: colors.text, letterSpacing: '-0.03em', maxWidth: 900 }}
          >
            Бронируй площадки<br />
            <span className="gradient-text">для любого досуга</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: 19, color: colors.text2, lineHeight: 1.65, maxWidth: 580, marginBottom: 48 }}
          >
            Спорт, лофты, переговорные в отелях — всё в одном месте. Выбирай время, добавляй услуги и бронируй за минуту.
          </motion.p>

          <HeroSearch />
          <HeroStats />
        </div>
      </section>

      {/* Categories */}
      <section className="site-container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        <div className="section-heading">
          <h2>Категории</h2>
          <p>Выберите формат — от спортивных залов до лофтов с кейтерингом</p>
        </div>
        <motion.div variants={fadeUpContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="site-grid-4">
          {CATEGORY_ITEMS.map((cat) => (
            <motion.div key={cat.id} variants={fadeUpItem}>
              <CategoryCard {...cat} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Partners */}
      <section className="site-container" style={{ paddingBottom: 80 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%', marginBottom: 40, gap: 16, flexWrap: 'wrap' }}>
          <div className="section-heading" style={{ marginBottom: 0 }}>
            <h2>Наши партнёры</h2>
            <p>3 площадки — разные форматы досуга</p>
          </div>
          <Link to="/catalog"><Button variant="ghost" size="sm" icon={<ArrowRight size={16} />}>Все площадки</Button></Link>
        </div>
        <div className="site-grid-3">
          {partnerCards.map((p, i) => (
            <VenueCard
              key={p.id}
              variant="featured"
              to={p.to}
              badge={p.badge}
              title={p.title}
              location={p.location}
              description={p.description}
              price={p.price}
              rating={p.rating}
              gradient={p.gradient}
              delay={i * 0.1}
            />
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="site-container" style={{ paddingBottom: 80 }}>
        <div className="section-heading">
          <h2>Почему BookinGo</h2>
          <p>Всё для комфортного бронирования — от выбора слота до доп. услуг</p>
        </div>
        <div className="site-grid-3">
          {FEATURES.map((f, i) => {
            const Icon = FEATURE_ICONS[f.icon]
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ padding: 32, borderRadius: 28, background: 'linear-gradient(145deg, #1A2332 0%, #141B28 100%)', border: `1px solid ${colors.border}` }}
                whileHover={{ y: -6, borderColor: `${f.color}44` }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 16, background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Icon size={26} color={f.color} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 15, color: colors.muted, lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="site-container" style={{ paddingBottom: 100 }}>
        <motion.div
          className="relative overflow-hidden text-center"
          style={{ padding: '80px 48px', borderRadius: 32, background: 'linear-gradient(135deg, #1A2332 0%, #0F1623 100%)', border: `1px solid ${colors.border}` }}
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          viewport={{ once: true }}
        >
          <motion.div
            style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.1) 0%, transparent 65%)' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <Sparkles size={36} color={colors.green} style={{ margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, marginBottom: 14, position: 'relative', letterSpacing: '-0.02em' }}>Готов забронировать?</h2>
          <p style={{ color: colors.muted, marginBottom: 32, position: 'relative', fontSize: 17 }}>Присоединяйся к BookinGo — бронируй площадки за пару кликов</p>
          <Link to="/catalog"><Button size="lg" icon={<ArrowRight size={18} />}>Смотреть площадки</Button></Link>
        </motion.div>
      </section>
    </div>
  )
}
