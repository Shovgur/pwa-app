/**
 * Скроллбары по умолчанию невидимы (см. index.css). Здесь навешиваем
 * класс `.is-scrolling` на тот элемент, который реально скроллится,
 * чтобы его полоса прокрутки на мгновение появилась, а затем сама скрылась.
 *
 * Слушатель ставится один раз на window с capture: true — событие
 * `scroll` не всплывает, но фаза захвата (capture) всё равно проходит
 * через window для скролла любого вложенного элемента на странице.
 */
export function initAutoHideScrollbars() {
  const hideTimers = new WeakMap<Element, number>()

  function resolveScrolledElement(target: EventTarget | null): Element | null {
    if (target instanceof Document) {
      return target.scrollingElement ?? document.documentElement
    }
    if (target instanceof Element) return target
    return null
  }

  window.addEventListener(
    'scroll',
    (event) => {
      const el = resolveScrolledElement(event.target)
      if (!el) return

      el.classList.add('is-scrolling')

      const pending = hideTimers.get(el)
      if (pending) window.clearTimeout(pending)

      const timeoutId = window.setTimeout(() => {
        el.classList.remove('is-scrolling')
        hideTimers.delete(el)
      }, 650)

      hideTimers.set(el, timeoutId)
    },
    { capture: true, passive: true },
  )
}
