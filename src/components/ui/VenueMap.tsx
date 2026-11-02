import { useEffect, useState } from 'react'
import { MapPin, Navigation } from 'lucide-react'
import { buildOsmEmbedUrl, geocodeVenueAddress } from '../../lib/geocoding'
import { openYandexRoute } from '../../utils/yandexRoute'
import { colors } from '../../theme/tokens'

interface VenueMapProps {
  address: string
  city?: string
  lat?: number | null
  lng?: number | null
  height?: number
  accentColor?: string
  /** Показать кнопку «Проложить маршрут» (по умолчанию да) */
  showRouteButton?: boolean
}

export function VenueMap({
  address,
  city,
  lat,
  lng,
  height = 280,
  accentColor = colors.green,
  showRouteButton = true,
}: VenueMapProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(() =>
    lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)
      ? { lat, lng }
      : null,
  )
  const [loading, setLoading] = useState(!coords && Boolean(address.trim()))
  const [routing, setRouting] = useState(false)

  useEffect(() => {
    if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
      setCoords({ lat, lng })
      setLoading(false)
      return
    }

    const addr = address.trim()
    if (!addr) {
      setCoords(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    void geocodeVenueAddress(city?.trim() || '', addr).then((result) => {
      if (!cancelled) {
        setCoords(result)
        setLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [address, city, lat, lng])

  const addressLine = [address, city].filter(Boolean).join(', ')

  function handleRoute() {
    if (!coords || routing) return
    setRouting(true)
    openYandexRoute(coords.lat, coords.lng)
    window.setTimeout(() => setRouting(false), 1500)
  }

  if (loading) {
    return (
      <div style={{
        borderRadius: 20,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        height,
        background: 'linear-gradient(135deg, #0d1f2d 0%, #111827 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b',
        fontSize: 14,
      }}>
        Загружаем карту…
      </div>
    )
  }

  if (!coords) {
    return (
      <div style={{
        borderRadius: 20,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        height,
        background: 'linear-gradient(135deg, #0d1f2d 0%, #111827 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 24px)',
        }} />
        <div style={{
          position: 'relative',
          width: '100%',
          padding: '12px 14px',
          background: 'linear-gradient(transparent, rgba(10,15,25,0.95))',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <MapPin size={14} color={accentColor} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{addressLine || 'Адрес не указан'}</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{
        borderRadius: 20,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        height,
        position: 'relative',
      }}>
        <iframe
          title={`Карта — ${addressLine}`}
          src={buildOsmEmbedUrl(coords.lat, coords.lng)}
          width="100%"
          height={height}
          style={{ border: 'none', display: 'block', filter: 'saturate(0.8) brightness(0.85)' }}
          loading="lazy"
        />
        <div style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          right: 12,
          background: 'rgba(10,15,25,0.88)',
          backdropFilter: 'blur(12px)',
          borderRadius: 12,
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          pointerEvents: 'none',
        }}>
          <MapPin size={14} color={accentColor} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{addressLine}</span>
        </div>
      </div>

      {showRouteButton && (
        <button
          type="button"
          onClick={handleRoute}
          disabled={routing}
          title="Проложить маршрут"
          style={{
            marginTop: 10,
            width: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px solid rgba(34,197,94,0.35)',
            background: 'rgba(34,197,94,0.12)',
            color: '#86efac',
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'inherit',
            cursor: routing ? 'wait' : 'pointer',
            opacity: routing ? 0.75 : 1,
          }}
        >
          <Navigation size={16} />
          {routing ? 'Открываем Яндекс.Карты…' : 'Проложить маршрут'}
        </button>
      )}
    </div>
  )
}
