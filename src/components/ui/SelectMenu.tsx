import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { useFloatingPosition } from '../../hooks/useFloatingPosition'

export interface SelectOption {
  value: string
  label: string
}

interface SelectMenuProps {
  label: string
  icon: ReactNode
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  accent?: string
}

export function SelectMenu({ label, icon, value, options, onChange, accent = '#22C55E' }: SelectMenuProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const { menuStyle, prepareOpen } = useFloatingPosition(triggerRef, open, 240)

  const selected = options.find((o) => o.value === value)

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
      const menu = document.getElementById(`select-menu-${label}`)
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
  }, [open, label])

  return (
    <div className="select-field">
      <span className="select-field-label" style={{ color: undefined }}>
        {icon}
        {label}
      </span>
      <button
        ref={triggerRef}
        type="button"
        className={`select-field-trigger ${open ? 'select-field-trigger--open' : ''}`}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected?.label ?? 'Выберите'}</span>
        <ChevronDown size={18} className={`select-field-chevron ${open ? 'select-field-chevron--open' : ''}`} />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && menuStyle && (
            <motion.div
              id={`select-menu-${label}`}
              className="select-menu"
              style={{ top: menuStyle.top, left: menuStyle.left, width: menuStyle.width }}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              role="listbox"
            >
              {options.map((option) => {
                const active = option.value === value
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={`select-menu-item ${active ? 'select-menu-item--active' : ''}`}
                    style={active ? { borderColor: `${accent}55`, background: `${accent}18` } : undefined}
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                  >
                    <span>{option.label}</span>
                    {active && <Check size={16} style={{ color: accent }} />}
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
