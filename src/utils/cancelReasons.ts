/** Причины отмены брони клиентом */
export type CancelReasonCode = 'changed_mind' | 'found_other' | 'cannot_come' | 'other'

export const CANCEL_REASON_OPTIONS: { code: CancelReasonCode; label: string }[] = [
  { code: 'changed_mind', label: 'Передумал' },
  { code: 'found_other', label: 'Нашёл другое' },
  { code: 'cannot_come', label: 'Не могу прийти' },
  { code: 'other', label: 'Своё' },
]

export function cancelReasonLabel(code: string | null | undefined, customText?: string | null): string {
  if (!code) return customText?.trim() || 'Без причины'
  const opt = CANCEL_REASON_OPTIONS.find(o => o.code === code)
  if (code === 'other') return customText?.trim() || opt?.label || 'Своё'
  return opt?.label || customText?.trim() || code
}
