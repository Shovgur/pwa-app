import type { PublicVenue } from '../../lib/publicVenues'
import { demoDelay, read, stripDemoVenueFields } from '../demoStore'

export async function demoFetchPublicVenues(): Promise<PublicVenue[]> {
  await demoDelay()
  return read()
    .venues.filter(v => v.isActive)
    .map(stripDemoVenueFields)
}

export async function demoFetchPublicVenue(id: string): Promise<PublicVenue | null> {
  await demoDelay()
  const v = read().venues.find(row => row.id === id && row.isActive)
  if (!v) return null
  return stripDemoVenueFields(v)
}
