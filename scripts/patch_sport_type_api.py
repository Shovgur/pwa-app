#!/usr/bin/env python3
"""Add sport_type to partner_venues API."""

from pathlib import Path

INDEX = Path('/opt/bookingo-api/src/partnerVenues.js')
text = INDEX.read_text()

if 'sportType: row.sport_type' not in text:
    text = text.replace(
        "    venueKind: row.venue_kind,\n    city: row.city,",
        "    venueKind: row.venue_kind,\n    sportType: row.sport_type ?? null,\n    city: row.city,",
    )

old_insert = """        `INSERT INTO partner_venues
          (partner_id, name, venue_kind, city, address, description, base_price_per_hour, is_active, amenities, lat, lng)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8::jsonb, $9, $10)
         RETURNING *`,
        [
          partnerId,
          name.trim(),
          venueKind,
          city.trim(),
          address.trim(),
          (description || '').trim(),
          base,
          JSON.stringify(Array.isArray(amenities) ? amenities : []),
          lat,
          lng,
        ],"""

new_insert = """        `INSERT INTO partner_venues
          (partner_id, name, venue_kind, sport_type, city, address, description, base_price_per_hour, is_active, amenities, lat, lng)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9::jsonb, $10, $11)
         RETURNING *`,
        [
          partnerId,
          name.trim(),
          venueKind,
          venueKind === 'sport' ? (sportType || null) : null,
          city.trim(),
          address.trim(),
          (description || '').trim(),
          base,
          JSON.stringify(Array.isArray(amenities) ? amenities : []),
          lat,
          lng,
        ],"""

if old_insert in text:
    text = text.replace(old_insert, new_insert)
elif 'sport_type' not in text:
    raise SystemExit('INSERT block not found')

if 'sportType,' not in text.split('POST /api/partner/venues')[1].split('const {')[1][:400]:
    text = text.replace(
        "const {\n        name, venueKind, city, address, description,",
        "const {\n        name, venueKind, sportType, city, address, description,",
        1,
    )

INDEX.write_text(text)
print('partnerVenues.js patched')
