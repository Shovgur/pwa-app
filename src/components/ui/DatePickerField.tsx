import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useFloatingPosition } from '../../hooks/useFloatingPosition'

interface DatePickerFieldProps {
  label: string
  icon: React.ReactNode
  value: string
  onChange: (value: string) => void
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function parseDate(value: string) {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatIso(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplay(value: string) {
  return parseDate(value).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<{ date: Date | null; iso: string | null }> = []

  for (let i = 0; i < startOffset; i++) cells.push({ date: null, iso: null })
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    cells.push({ date, iso: formatIso(date) })
  }
  return cells
}

export function DatePickerField({ label, icon, value, onChange }: DatePickerFieldProps) {
  const [open, setOpen] = useState(false)
  const selected = parseDate(value)
  const [viewYear, setViewYear] = useState(selected.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected.getMonth())
  const triggerRef = useRef<HTMLButtonElement>(null)
  const { menuStyle, prepareOpen } = useFloatingPosition(triggerRef, open, 300)

  const todayIso = formatIso(new Date())
  const cells = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth])

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  })

  function toggleOpen() {
    if (open) {
      setOpen(false)
      return
    }
    prepareOpen()
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return

    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      const menu = document.getElementById('hero-date-picker')
      if (menu?.contains(target)) return
      setOpen(false)
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  return (
    <div className="select-field">
      <span className="select-field-label">
        {icon}
        {label}
      </span>
      <button
        ref={triggerRef}
        type="button"
        className={`select-field-trigger ${open ? 'select-field-trigger--open' : ''}`}
        onClick={toggleOpen}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span>{formatDisplay(value)}</span>
        <ChevronDown size={18} className={`select-field-chevron ${open ? 'select-field-chevron--open' : ''}`} />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && menuStyle && (
            <motion.div
              id="hero-date-picker"
              className="date-picker"
              style={{ top: menuStyle.top, left: menuStyle.left, width: menuStyle.width }}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
            >
              <div className="date-picker-head">
                <button type="button" className="date-picker-nav" onClick={prevMonth} aria-label="Предыдущий месяц">
                  <ChevronLeft size={18} />
                </button>
                <span className="date-picker-month">{monthLabel}</span>
                <button type="button" className="date-picker-nav" onClick={nextMonth} aria-label="Следующий месяц">
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="date-picker-weekdays">
                {WEEKDAYS.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>

              <div className="date-picker-grid">
                {cells.map((cell, i) => {
                  if (!cell.date || !cell.iso) {
                    return <span key={`empty-${i}`} className="date-picker-day date-picker-day--empty" />
                  }
                  const iso = cell.iso
                  const active = iso === value
                  const isToday = iso === todayIso
                  return (
                    <button
                      key={iso}
                      type="button"
                      className={`date-picker-day ${active ? 'date-picker-day--active' : ''} ${isToday ? 'date-picker-day--today' : ''}`}
                      onClick={() => {
                        onChange(iso)
                        setOpen(false)
                      }}
                    >
                      {cell.date.getDate()}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}
