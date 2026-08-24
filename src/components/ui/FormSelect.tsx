import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { useFloatingPosition } from '../../hooks/useFloatingPosition'

export interface FormSelectOption {
  value: string
  label: string
}

interface FormSelectProps {
  label: string
  value: string
  options: FormSelectOption[]
  onChange: (value: string) => void
  required?: boolean
  hasError?: boolean
  placeholder?: string
  accent?: string
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#94a3b8',
  marginBottom: 7,
  letterSpacing: 0.5,
}

export function FormSelect({
  label,
  value,
  options,
  onChange,
  required,
  hasError,
  placeholder = 'Выберите',
  accent = '#22c55e',
}: FormSelectProps) {
  const uid = useId()
  const menuId = `form-select-menu-${uid}`
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const { menuStyle, prepareOpen } = useFloatingPosition(triggerRef, open, 220)

  const selected = options.find(o => o.value === value)

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
      const menu = document.getElementById(menuId)
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
  }, [open, menuId])

  return (
    <div className="form-select">
      <span style={labelStyle}>
        {label}
        {required && <span style={{ color: '#f87171', marginLeft: 2 }}>*</span>}
      </span>
      <button
        ref={triggerRef}
        type="button"
        className={`form-select-trigger${open ? ' form-select-trigger--open' : ''}${hasError ? ' form-select-trigger--error' : ''}`}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="form-select-value">{selected?.label ?? placeholder}</span>
        <ChevronDown
          size={18}
          className={`form-select-chevron${open ? ' form-select-chevron--open' : ''}`}
          aria-hidden
        />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && menuStyle && (
            <motion.div
              id={menuId}
              className="select-menu form-select-menu"
              style={{
                top: menuStyle.top,
                left: menuStyle.left,
                width: menuStyle.width,
                maxHeight: 280,
                overflowY: 'auto',
              }}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              role="listbox"
            >
              {options.map(option => {
                const active = option.value === value
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={`select-menu-item${active ? ' select-menu-item--active' : ''}`}
                    style={active ? { borderColor: `${accent}55`, background: `${accent}18` } : undefined}
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                  >
                    <span>{option.label}</span>
                    {active && <Check size={16} style={{ color: accent, flexShrink: 0 }} />}
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}
