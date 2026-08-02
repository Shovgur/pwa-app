import { AlertCircle } from 'lucide-react'

/**
 * Лёгкая CSS-анимация вместо framer-motion: при одновременном появлении
 * ошибок сразу у нескольких полей (например, при отправке пустой формы)
 * JS-анимация высоты через framer-motion заметно подтормаживает. Обычная
 * CSS-анимация не требует измерения layout на каждый кадр и остаётся
 * плавной независимо от количества полей.
 */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="field-error-text">
      <AlertCircle size={12} style={{ flexShrink: 0 }} />
      {message}
    </p>
  )
}

export function errorInputStyle(hasError: boolean): React.CSSProperties {
  return hasError
    ? { borderColor: 'rgba(248,113,113,0.55)', boxShadow: '0 0 0 3px rgba(248,113,113,0.12)' }
    : {}
}
