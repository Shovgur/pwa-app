from pathlib import Path

p = Path('/opt/bookingo-api/src/partnerVenues.js')
text = p.read_text()

text = text.replace(
    'amenities, photos,\n      } = req.body;',
    'amenities, photos,\n        lat: bodyLat, lng: bodyLng,\n      } = req.body;',
)

needle = "      await client.query('BEGIN');"
if needle in text and 'geocodeRussiaAddress(city.trim()' not in text:
    insert = """      let lat = bodyLat != null ? Number(bodyLat) : null;
      let lng = bodyLng != null ? Number(bodyLng) : null;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        const geo = await geocodeRussiaAddress(city.trim(), address.trim());
        if (geo) { lat = geo.lat; lng = geo.lng; }
      }

      await client.query('BEGIN');"""
    text = text.replace(needle, insert, 1)

text = text.replace(
    '(partner_id, name, venue_kind, city, address, description, base_price_per_hour, is_active, amenities)',
    '(partner_id, name, venue_kind, city, address, description, base_price_per_hour, is_active, amenities, lat, lng)',
)
text = text.replace(
    'VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8::jsonb)',
    'VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8::jsonb, $9, $10)',
)
text = text.replace(
    'JSON.stringify(Array.isArray(amenities) ? amenities : []),\n        ],\n      );\n      const venueRow = venueRes.rows[0];',
    'JSON.stringify(Array.isArray(amenities) ? amenities : []),\n          lat,\n          lng,\n        ],\n      );\n      const venueRow = venueRes.rows[0];',
)

p.write_text(text)
print('patched')
