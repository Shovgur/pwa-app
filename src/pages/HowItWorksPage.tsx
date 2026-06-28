import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  Search, Calendar, Sparkles, CheckCircle2, MapPin, Star,
  ChevronDown, ArrowRight, Shield, Zap, Users,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { SeoHead } from '../components/SeoHead'
import { colors } from '../theme/tokens'

/* ── Step data ── */
const STEPS = [
  {
    n: '01',
    icon: Search,
    color: colors.blue,
    dim: colors.blueDim,
    title: 'Выбери площадку',
    subtitle: 'Каталог всех форматов',
    desc: 'Открой каталог и выбери тип площадки: спортивный зал, бассейн, лофт или переговорная. Фильтруй по городу, дате и категории — найди идеальное место за секунды.',
    bullets: [
      'Спорт и бассейны в Москве и СПб',
      'Лофты с кейтерингом и оборудованием',
      'Переговорные и залы в отелях',
    ],
    visual: <CatalogVisual />,
  },
  {
    n: '02',
    icon: Calendar,
    color: colors.green,
    dim: colors.greenDim,
    title: 'Выбери дату и время',
    subtitle: 'Живое расписание',
    desc: 'Смотри доступные слоты в реальном времени. Занятые часы сразу отмечены — выбирай только свободное время. Бронирование на конкретный час без лишних шагов.',
    bullets: [
      'Расписание по дням недели',
      'Слоты по 60 минут',
      'Мгновенное подтверждение доступности',
    ],
    visual: <CalendarVisual />,
  },
  {
    n: '03',
    icon: Sparkles,
    color: colors.orange,
    dim: colors.orangeDim,
    title: 'Добавь услуги',
    subtitle: 'Всё включено по желанию',
    desc: 'К каждой площадке — дополнительные услуги: еда и напитки, проектор, фотограф, декор. Выбирай пакеты одним кликом — сумма пересчитывается сразу.',
    bullets: [
      'Кейтеринг и барные пакеты',
      'Техника: проектор, микрофон, экран',
      'Скидка 15% при добавлении услуг',
    ],
    visual: <AddonsVisual />,
  },
  {
    n: '04',
    icon: CheckCircle2,
    color: '#A855F7',
    dim: 'rgba(168,85,247,0.15)',
    title: 'Забронируй',
    subtitle: 'Один клик — готово',
    desc: 'Проверь итог в сводке заказа и нажми «Забронировать». Бронь подтверждается мгновенно — никаких звонков и ожидания. Всё в одном месте.',
    bullets: [
      'Мгновенное подтверждение',
      'Итоговая сумма до оплаты',
      'История броней в личном кабинете',
    ],
    visual: <ConfirmVisual />,
  },
]

const FAQ = [
  { q: 'Нужна ли регистрация для просмотра площадок?', a: 'Нет. Каталог и страницы площадок открыты без регистрации. Аккаунт нужен только для подтверждения бронирования.' },
  { q: 'Можно ли отменить или перенести бронь?', a: 'Да. В личном кабинете можно отменить бронь за 24 часа до начала без штрафа. Перенос — через менеджера площадки.' },
  { q: 'Что включено в стоимость?', a: 'Базовая стоимость — аренда площадки на указанное время. Дополнительные услуги (кейтеринг, техника, декор) оплачиваются отдельно и добавляются при бронировании.' },
  { q: 'Как быстро подтверждается бронирование?', a: 'Мгновенно. После нажатия кнопки «Забронировать» слот сразу закрепляется за тобой — никаких звонков и ожиданий.' },
]

/* ── Visual components ── */

function CatalogVisual() {
  const cards = [
    { label: 'Бассейн', loc: 'Москва', price: '1 200 ₽', r: 4.8, color: colors.blue },
    { label: 'Теннисный корт', loc: 'СПб', price: '800 ₽', r: 4.6, color: colors.green },
    { label: 'Лофт Sunset', loc: 'Москва', price: '3 500 ₽', r: 4.9, color: colors.orange },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Filter pill row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
        {['Все', 'Спорт', 'Лофты', 'Переговорные'].map((t, i) => (
          <motion.div
            key={t}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            style={{
              padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600,
              background: i === 0 ? colors.blue : 'rgba(255,255,255,0.06)',
              color: i === 0 ? '#fff' : colors.text2,
              border: `1px solid ${i === 0 ? colors.blue : 'rgba(255,255,255,0.1)'}`,
            }}
          >{t}</motion.div>
        ))}
      </div>
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderRadius: 16,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid rgba(255,255,255,0.08)`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${c.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={16} color={c.color} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>{c.label}</div>
              <div style={{ fontSize: 11, color: colors.muted }}>{c.loc}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>{c.price}/час</div>
            <div style={{ fontSize: 11, color: '#EAB308', display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
              <Star size={10} fill="#EAB308" color="#EAB308" /> {c.r}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function CalendarVisual() {
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  const slots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']
  const busy = new Set([1, 3, 5])
  const [selected, setSelected] = useState(2)
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {days.map((d, i) => (
          <motion.div
            key={d}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelected(i)}
            style={{
              flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 12, cursor: 'pointer',
              background: selected === i ? colors.green : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selected === i ? colors.green : 'rgba(255,255,255,0.08)'}`,
              fontSize: 11, fontWeight: 600,
              color: selected === i ? '#fff' : colors.text2,
              transition: 'all 0.18s',
            }}
          >
            <div>{d}</div>
            <div style={{ fontSize: 13, fontWeight: 800, marginTop: 2 }}>{9 + i}</div>
          </motion.div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {slots.map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.04 }}
            style={{
              padding: '10px 14px', borderRadius: 12, fontSize: 13, fontWeight: 600,
              textAlign: 'center',
              background: busy.has(i) ? 'rgba(255,255,255,0.02)' : i === 4 ? colors.greenDim : 'rgba(255,255,255,0.05)',
              border: `1px solid ${busy.has(i) ? 'rgba(255,255,255,0.04)' : i === 4 ? colors.green : 'rgba(255,255,255,0.1)'}`,
              color: busy.has(i) ? colors.muted : i === 4 ? colors.green : colors.text,
              textDecoration: busy.has(i) ? 'line-through' : 'none',
            }}
          >{s}</motion.div>
        ))}
      </div>
    </div>
  )
}

function AddonsVisual() {
  const [active, setActive] = useState(new Set([0, 2]))
  const addons = [
    { icon: '🍽️', label: 'Кейтеринг', price: '2 500 ₽', color: colors.orange },
    { icon: '📽️', label: 'Проектор 4K', price: '800 ₽', color: colors.blue },
    { icon: '🎵', label: 'Музыкальная система', price: '1 200 ₽', color: '#A855F7' },
    { icon: '📸', label: 'Фотограф', price: '3 000 ₽', color: colors.green },
  ]
  const total = addons.filter((_, i) => active.has(i)).reduce((s, a) => s + parseInt(a.price.replace(/\D/g, '')), 0)
  const discount = Math.round(total * 0.15)

  function toggle(i: number) {
    setActive(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {addons.map((a, i) => {
          const on = active.has(i)
          return (
            <motion.div
              key={a.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => toggle(i)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: 14, cursor: 'pointer',
                background: on ? `${a.color}14` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${on ? `${a.color}44` : 'rgba(255,255,255,0.08)'}`,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{a.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: on ? '#fff' : colors.text2 }}>{a.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: colors.muted }}>{a.price}</span>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', border: `2px solid ${on ? a.color : 'rgba(255,255,255,0.2)'}`,
                  background: on ? a.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {on && <CheckCircle2 size={10} color="#fff" />}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
      {total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: '12px 16px', borderRadius: 14, background: colors.orangeDim, border: `1px solid ${colors.orange}44` }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: colors.muted, marginBottom: 4 }}>
            <span>Услуги</span><span>{total.toLocaleString()} ₽</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: colors.orange }}>
            <span>Скидка 15%</span><span>−{discount.toLocaleString()} ₽</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function ConfirmVisual() {
  const [done, setDone] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ padding: '16px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 11, color: colors.muted, marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Итог бронирования</div>
        {[
          { label: 'AquaSport Arena', val: 'Сб, 14 июня' },
          { label: 'Время', val: '14:00 – 15:00' },
          { label: 'Аренда', val: '1 200 ₽' },
          { label: 'Кейтеринг', val: '2 125 ₽' },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: colors.text2 }}>{r.label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>{r.val}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Итого</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: colors.green }}>3 325 ₽</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key="btn"
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ padding: '14px', borderRadius: 16, background: colors.green, textAlign: 'center', cursor: 'pointer' }}
          >
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}
            >Забронировать</motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{ padding: '20px', borderRadius: 16, background: colors.greenDim, border: `1px solid ${colors.green}44`, textAlign: 'center' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
            >
              <CheckCircle2 size={40} color={colors.green} style={{ margin: '0 auto 10px' }} />
            </motion.div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Бронь подтверждена!</div>
            <div style={{ fontSize: 12, color: colors.muted }}>AquaSport Arena · 14:00</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Step section ── */
function StepSection({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const isEven = index % 2 === 0

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.4 }}
      className="how-step"
    >
      {/* Text */}
      <motion.div
        initial={{ opacity: 0, x: isEven ? -40 : 40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className={isEven ? 'how-step-text' : 'how-step-text how-step-text--right'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: step.dim,
            border: `1px solid ${step.color}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <step.icon size={22} color={step.color} />
          </div>
          <span style={{
            fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: step.color,
          }}>Шаг {step.n}</span>
        </div>

        <h2 style={{
          fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, lineHeight: 1.1,
          letterSpacing: '-0.03em', marginBottom: 8, color: colors.text,
        }}>{step.title}</h2>
        <p style={{ fontSize: 14, fontWeight: 600, color: step.color, marginBottom: 20 }}>{step.subtitle}</p>
        <p style={{ fontSize: 16, color: colors.text2, lineHeight: 1.7, marginBottom: 28, maxWidth: 440 }}>{step.desc}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {step.bullets.map((b, i) => (
            <motion.div
              key={b}
              initial={{ opacity: 0, x: -12 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: step.color, flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: colors.text2 }}>{b}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Visual card */}
      <motion.div
        initial={{ opacity: 0, x: isEven ? 40 : -40, scale: 0.96 }}
        animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className={isEven ? 'how-step-visual' : 'how-step-visual how-step-visual--left'}
      >
        <div style={{
          borderRadius: 28, padding: 28,
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid rgba(255,255,255,0.08)`,
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: colors.muted, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: step.color }} />
            BookinGo · Шаг {step.n}
          </div>
          {step.visual}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── FAQ item ── */
function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.07, duration: 0.5 }}
      style={{
        borderRadius: 18, overflow: 'hidden',
        border: `1px solid ${open ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'}`,
        background: open ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
        transition: 'border-color 0.2s, background 0.2s',
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '22px 24px', background: 'transparent', border: 'none', cursor: 'pointer',
          color: colors.text, textAlign: 'left', gap: 16,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.4 }}>{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} style={{ flexShrink: 0 }}>
          <ChevronDown size={20} color={colors.muted} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{ padding: '0 24px 22px', fontSize: 15, color: colors.text2, lineHeight: 1.7, margin: 0 }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ── Perks strip ── */
const PERKS = [
  { icon: Zap, label: 'Мгновенное бронирование', color: colors.green },
  { icon: Shield, label: 'Гарантия возврата', color: colors.blue },
  { icon: Users, label: 'Площадки для любых событий', color: colors.orange },
  { icon: Star, label: 'Рейтинг 4.9 от клиентов', color: '#A855F7' },
]

/* ── Page ── */
export function HowItWorksPage() {
  const { scrollYProgress } = useScroll()
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <div style={{ width: '100%' }}>
      <SeoHead
        title="Как это работает — бронирование площадок"
        description="Узнай, как за 4 шага забронировать спортивную площадку, лофт или переговорную. Выбери место, время, добавь услуги и подтверди бронь мгновенно."
        path="/how-it-works"
      />

      {/* Scroll progress bar */}
      <motion.div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 2,
          background: colors.green, scaleX: scrollYProgress,
          transformOrigin: 'left', zIndex: 100,
          width: progressWidth,
        }}
      />

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="site-container" style={{ paddingTop: 96, paddingBottom: 80, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 18px', borderRadius: 100,
              background: colors.greenDim, border: `1px solid rgba(34,197,94,0.25)`,
              marginBottom: 32,
            }}
          >
            <Zap size={14} color={colors.green} />
            <span style={{ fontSize: 13, fontWeight: 600, color: colors.green }}>4 шага до готовой брони</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            style={{
              fontSize: 'clamp(38px, 5vw, 68px)', fontWeight: 800, lineHeight: 1.05,
              letterSpacing: '-0.03em', marginBottom: 20, color: colors.text,
            }}
          >
            Как это<br />
            <span className="gradient-text">работает</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: 18, color: colors.text2, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 48px' }}
          >
            Бронируй площадки онлайн без звонков и ожиданий. Весь процесс — за пару минут.
          </motion.p>

          {/* Step numbers overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="how-steps-overview"
          >
            {STEPS.map((s, i) => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 18,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: s.dim, border: `1px solid ${s.color}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <s.icon size={14} color={s.color} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: colors.text2 }}>{s.title}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <div style={{ position: 'relative' }}>
        {/* Divider lines between steps */}
        {STEPS.map((step, i) => (
          <div key={step.n} style={{ position: 'relative' }}>
            {i > 0 && (
              <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: 1, height: 40, background: `linear-gradient(to bottom, rgba(255,255,255,0.08), transparent)`,
              }} />
            )}
            <div className="site-container">
              <StepSection step={step} index={i} />
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', maxWidth: 900, margin: '0 auto' }} />
            )}
          </div>
        ))}
      </div>

      {/* Perks strip */}
      <section className="site-container" style={{ paddingTop: 24, paddingBottom: 80 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16, padding: '32px 40px', borderRadius: 28,
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {PERKS.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{ display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: `${p.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <p.icon size={19} color={p.color} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: colors.text2, lineHeight: 1.4 }}>{p.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="site-container" style={{ paddingBottom: 80 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-heading"
        >
          <h2>Частые вопросы</h2>
          <p>Всё, что нужно знать перед первым бронированием</p>
        </motion.div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 720, margin: '0 auto' }}>
          {FAQ.map((f, i) => <FaqItem key={f.q} q={f.q} a={f.a} index={i} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="site-container" style={{ paddingBottom: 100 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            textAlign: 'center', padding: '72px 48px', borderRadius: 32,
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.08)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          <motion.div
            style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.08) 0%, transparent 65%)' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{ position: 'relative', marginBottom: 24 }}
          >
            <CheckCircle2 size={52} color={colors.green} style={{ margin: '0 auto' }} />
          </motion.div>
          <h2 style={{ fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 800, marginBottom: 12, position: 'relative', letterSpacing: '-0.02em' }}>
            Готов попробовать?
          </h2>
          <p style={{ color: colors.muted, marginBottom: 36, position: 'relative', fontSize: 17, maxWidth: 400, margin: '0 auto 36px' }}>
            Открой каталог и выбери площадку — бронирование займёт меньше двух минут
          </p>
          <Link to="/catalog" style={{ position: 'relative' }}>
            <Button size="lg" icon={<ArrowRight size={18} />}>Смотреть площадки</Button>
          </Link>
        </motion.div>
      </section>

    </div>
  )
}
