import { useEffect, useId, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import { searchRussianAddresses, type AddressSuggestion } from '../../lib/geocoding'

interface AddressAutocompleteProps {
  value: string
  city: string
  onChange: (address: string) => void
  onSelect: (suggestion: AddressSuggestion) => void
  placeholder?: string
  required?: boolean
  style?: React.CSSProperties
}

export function AddressAutocomplete({
  value,
  city,
  onChange,
  onSelect,
  placeholder = 'ул. Примерная, 1',
  required,
  style,
}: AddressAutocompleteProps) {
  const listId = useId()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])

  useEffect(() => {
    if (!open || value.trim().length < 3) {
      setSuggestions([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    const timer = window.setTimeout(() => {
      void searchRussianAddresses(value, city).then((items) => {
        if (!cancelled) {
          setSuggestions(items)
          setLoading(false)
        }
      })
    }, 280)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [value, city, open])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={listId}
        style={style}
      />

      {open && (loading || suggestions.length > 0) && value.trim().length >= 3 && (
        <div
          id={listId}
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 40,
            background: '#161f2e',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
            overflow: 'hidden',
            maxHeight: 240,
            overflowY: 'auto',
          }}
        >
          {loading && (
            <div style={{ padding: '12px 14px', fontSize: 13, color: '#64748b' }}>
              Ищем адреса…
            </div>
          )}
          {!loading && suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              role="option"
              onClick={() => {
                onSelect(item)
                setOpen(false)
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '11px 14px',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              <MapPin size={15} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.45 }}>{item.label}</span>
            </button>
          ))}
          {!loading && suggestions.length === 0 && (
            <div style={{ padding: '12px 14px', fontSize: 13, color: '#64748b' }}>
              Адрес не найден — можно ввести вручную
            </div>
          )}
        </div>
      )}
    </div>
  )
}
