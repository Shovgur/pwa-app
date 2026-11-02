/** Яндекс.Карты: маршрут от геолокации пользователя до точки; без геолокации — только точка назначения. */
export function openYandexRoute(destLat: number, destLng: number): void {
  const to = `${destLat},${destLng}`
  const open = (from?: string) => {
    const rtext = from ? `${from}~${to}` : `~${to}`
    window.open(`https://yandex.ru/maps/?rtext=${rtext}&rtt=auto`, '_blank', 'noopener,noreferrer')
  }

  if (!navigator.geolocation) {
    open()
    return
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => open(`${pos.coords.latitude},${pos.coords.longitude}`),
    () => open(),
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
  )
}
