import { useCallback, useLayoutEffect, useState, type RefObject } from 'react'

export interface FloatingMenuStyle {
  top: number
  left: number
  width: number
}

export function useFloatingPosition(
  triggerRef: RefObject<HTMLElement | null>,
  open: boolean,
  minWidth: number,
) {
  const [menuStyle, setMenuStyle] = useState<FloatingMenuStyle | null>(null)

  const updatePosition = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setMenuStyle({
      top: rect.bottom + 8,
      left: rect.left,
      width: Math.max(rect.width, minWidth),
    })
  }, [triggerRef, minWidth])

  useLayoutEffect(() => {
    if (!open) return
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, updatePosition])

  const prepareOpen = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setMenuStyle({
      top: rect.bottom + 8,
      left: rect.left,
      width: Math.max(rect.width, minWidth),
    })
  }, [triggerRef, minWidth])

  return { menuStyle, prepareOpen }
}
