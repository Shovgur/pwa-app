import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import { buildOsmEmbedUrl, geocodeVenueAddress } from '../../lib/geocoding'
import { colors } from '../../theme/tokens'

interface VenueMapProps {
  address: string
  city?: string
  lat?: number | null
  lng?: number | null
  height?: number
  accentColor?: string
}

export function VenueMap({
  address,
  city,
  lat,
  lng,
  height = 280,
  accentColor = colors.green,
}: VenueMapProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(() =>
    lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)
      ? { lat, lng }
      : null,
  )
  const [loading, setLoading] = useState(!coords && Boolean(address.trim()))

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
  )
}
