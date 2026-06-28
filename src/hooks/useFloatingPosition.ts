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

  const calcPosition = useCallback((el: HTMLElement): FloatingMenuStyle => {
    const rect = el.getBoundingClientRect()
    const w = Math.max(rect.width, minWidth)
    const viewW = window.innerWidth
    const margin = 16
    let left = rect.left
    if (left + w > viewW - margin) {
      left = Math.max(margin, viewW - w - margin)
    }
    return { top: rect.bottom + 8, left, width: Math.min(w, viewW - margin * 2) }
  }, [minWidth])

  const updatePosition = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    setMenuStyle(calcPosition(el))
  }, [triggerRef, calcPosition])

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
    setMenuStyle(calcPosition(el))
  }, [triggerRef, calcPosition])

  return { menuStyle, prepareOpen }
}
