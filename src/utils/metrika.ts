/** Yandex Metrika counter ID (see index.html). */
export const METRIKA_COUNTER_ID = 110228611

/** Goal identifiers configured in Yandex Metrika → Цели → JS-событие. */
export const METRIKA_GOALS = {
  poolBuyClick: 'pool_buy_click',
} as const

declare global {
  interface Window {
    ym?: (counterId: number, method: string, ...args: unknown[]) => void
  }
}

export function reachGoal(
  goal: string,
  params?: Record<string, string | number | boolean>,
) {
  window.ym?.(METRIKA_COUNTER_ID, 'reachGoal', goal, params)
}

export function trackPoolBuyClick(pool: {
  id: string
  name: string
  city: string
  price: string
}) {
  reachGoal(METRIKA_GOALS.poolBuyClick, {
    pool_id: pool.id,
    pool_name: pool.name,
    pool_city: pool.city,
    pool_price: pool.price,
  })
}
