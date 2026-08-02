import { useCallback, useState } from 'react'

type ValidatableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

function messageForValidity(el: ValidatableElement): string {
  const v = el.validity
  if (v.valueMissing) return 'Заполните это поле'
  if (v.typeMismatch) {
    if (el.type === 'email') return 'Введите корректный email, например you@example.com'
    return 'Проверьте формат значения'
  }
  if (v.tooShort) return `Минимум ${el.minLength} символов`
  if (v.tooLong) return `Максимум ${el.maxLength} символов`
  if (v.patternMismatch) return 'Неверный формат значения'
  if (v.rangeUnderflow || v.rangeOverflow) return 'Значение вне допустимого диапазона'
  return 'Проверьте значение поля'
}

/**
 * Заменяет нативные всплывающие подсказки браузера ("Please fill in this
 * field") на собственные текстовые подписи под полем. Событие `invalid`
 * всё ещё блокирует отправку формы — мы лишь подавляем стандартный UI.
 */
export function useFieldErrors() {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInvalid = useCallback(
    (name: string) => (e: React.InvalidEvent<ValidatableElement>) => {
      e.preventDefault()
      // `currentTarget` перестаёт быть валидным сразу после завершения
      // диспетчеризации события, поэтому читаем сообщение синхронно —
      // до того, как React применит функциональный апдейтер состояния.
      const message = messageForValidity(e.currentTarget)
      setErrors(prev => ({ ...prev, [name]: message }))
    },
    [],
  )

  const clearError = useCallback((name: string) => {
    setErrors(prev => {
      if (!(name in prev)) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }, [])

  const resetErrors = useCallback(() => setErrors({}), [])

  return { errors, handleInvalid, clearError, resetErrors }
}
