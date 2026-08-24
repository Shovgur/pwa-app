export interface AddressSuggestion {
  id: string
  label: string
  city: string
  address: string
  lat: number
  lng: number
}

interface PhotonFeature {
  properties: {
    name?: string
    street?: string
    housenumber?: string
    city?: string
    locality?: string
    state?: string
    country?: string
    countrycode?: string
    postcode?: string
  }
  geometry: {
    coordinates: [number, number]
  }
}

const RUSSIA_BBOX = '19,41,180,82'

function formatStreetLine(props: PhotonFeature['properties']): string {
  const parts: string[] = []
  if (props.street) {
    parts.push(props.housenumber ? `${props.street}, ${props.housenumber}` : props.street)
  } else if (props.name) {
    parts.push(props.name)
  }
  return parts.join(', ')
}

function resolveCity(props: PhotonFeature['properties']): string {
  return props.city || props.locality || props.state || ''
}

function featureToSuggestion(feature: PhotonFeature, index: number): AddressSuggestion | null {
  if (feature.properties.countrycode && feature.properties.countrycode !== 'RU') return null
  const [lng, lat] = feature.geometry.coordinates
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  const city = resolveCity(feature.properties)
  const address = formatStreetLine(feature.properties)
  if (!address && !city) return null

  const label = [address, city].filter(Boolean).join(', ')
  return {
    id: `${lat}-${lng}-${index}`,
    label,
    city: city || 'Россия',
    address: address || label,
    lat,
    lng,
  }
}

export async function searchRussianAddresses(
  query: string,
  cityHint?: string,
): Promise<AddressSuggestion[]> {
  const trimmed = query.trim()
  if (trimmed.length < 3) return []

  const q = cityHint?.trim()
    ? `${trimmed}, ${cityHint.trim()}, Россия`
    : `${trimmed}, Россия`

  const url = new URL('https://photon.komoot.io/api/')
  url.searchParams.set('q', q)
  url.searchParams.set('limit', '8')
  url.searchParams.set('bbox', RUSSIA_BBOX)

  const res = await fetch(url.toString())
  if (!res.ok) return []

  const data = (await res.json().catch(() => null)) as { features?: PhotonFeature[] } | null
  const items = (data?.features ?? [])
    .map((f, i) => featureToSuggestion(f, i))
    .filter((x): x is AddressSuggestion => Boolean(x))

  const seen = new Set<string>()
  return items.filter((item) => {
    const key = item.label.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function geocodeVenueAddress(
  city: string,
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  const results = await searchRussianAddresses(address, city)
  return results[0] ? { lat: results[0].lat, lng: results[0].lng } : null
}

export function buildOsmEmbedUrl(lat: number, lng: number): string {
  const bbox = `${lng - 0.012},${lat - 0.008},${lng + 0.012},${lat + 0.008}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat}%2C${lng}`
}
