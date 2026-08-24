#!/usr/bin/env python3
"""Deploy venue availability: API route + booking conflict check."""

from pathlib import Path

ROOT = Path(__file__).resolve().parent
AVAIL_SRC = ROOT / 'venueAvailability.js'
PARTNER_VENUES = Path('/opt/bookingo-api/src/partnerVenues.js')
INDEX = Path('/opt/bookingo-api/src/index.js')
AVAIL_DST = Path('/opt/bookingo-api/src/venueAvailability.js')

AVAIL_DST.write_text(AVAIL_SRC.read_text())

pv = PARTNER_VENUES.read_text()

IMPORT = "import { computeVenueAvailability } from './venueAvailability.js';\n"
if "venueAvailability.js" not in pv:
    pv = pv.replace(
        "import { geocodeRussiaAddress } from './geocode.js';",
        "import { geocodeRussiaAddress } from './geocode.js';\n" + IMPORT,
    )

AVAIL_ROUTE = """
  app.get('/api/venues/:id/availability', async (req, res) => {
    try {
      const venueId = parseInt(req.params.id, 10);
      if (!Number.isFinite(venueId)) {
        return res.status(400).json({ error: 'Неверный id площадки' });
      }
      const date = String(req.query.date || '').slice(0, 10);
      if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'Укажите date в формате YYYY-MM-DD' });
      }
      const durationMinutes = Math.max(15, parseInt(String(req.query.duration || '60'), 10) || 60);
      const stepMinutes = Math.max(15, parseInt(String(req.query.step || '30'), 10) || 30);

      const venueRes = await pool.query(
        'SELECT id, base_price_per_hour, is_active FROM partner_venues WHERE id = $1',
        [venueId],
      );
      if (!venueRes.rows.length || !venueRes.rows[0].is_active) {
        return res.status(404).json({ error: 'Площадка не найдена' });
      }
      const venue = venueRes.rows[0];

      const timeRes = await pool.query(
        'SELECT time_from, time_to, price_per_hour FROM partner_venue_time_prices WHERE venue_id = $1 ORDER BY id',
        [venueId],
      );
      const timePriceRules = timeRes.rows.map((r) => ({
        timeFrom: String(r.time_from).slice(0, 5),
        timeTo: String(r.time_to).slice(0, 5),
        pricePerHour: Number(r.price_per_hour),
      }));

      const availability = await computeVenueAvailability(pool, {
        partnerVenueId: venueId,
        date,
        durationMinutes,
        stepMinutes,
        timePriceRules,
        basePrice: Number(venue.base_price_per_hour) || 0,
      });

      res.json(availability);
    } catch (err) {
      console.error('GET /api/venues/:id/availability', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  });
"""

if '/api/venues/:id/availability' not in pv:
    anchor = "  app.get('/api/venues/:id', async (req, res) => {"
    pv = pv.replace(anchor, AVAIL_ROUTE + "\n" + anchor)

PARTNER_VENUES.write_text(pv)
print('partnerVenues.js patched')

idx = INDEX.read_text()

if 'hasBookingConflict' not in idx:
    idx = idx.replace(
        "import { registerPartnerVenueRoutes, registerPublicVenueRoutes } from './partnerVenues.js';",
        "import { registerPartnerVenueRoutes, registerPublicVenueRoutes } from './partnerVenues.js';\nimport { hasBookingConflict, computeVenueAvailability } from './venueAvailability.js';",
    )
elif 'computeVenueAvailability' not in idx:
    idx = idx.replace(
        "import { hasBookingConflict } from './venueAvailability.js';",
        "import { hasBookingConflict, computeVenueAvailability } from './venueAvailability.js';",
    )

CONFLICT_CHECK = """    if (partnerVenueId) {
      const conflict = await hasBookingConflict(client, {
        partnerVenueId,
        date,
        time,
        durationMinutes,
      });
      if (conflict) {
        return res.status(409).json({ error: 'Это время уже занято. Выберите другой слот.' });
      }
    } else if (venueRef) {
      const conflict = await hasBookingConflict(client, {
        venueRef,
        date,
        time,
        durationMinutes,
      });
      if (conflict) {
        return res.status(409).json({ error: 'Это время уже занято. Выберите другой слот.' });
      }
    }

    await client.query('BEGIN');"""

OLD_BEGIN = """    await client.query('BEGIN');

    const bookingResult = await client.query(
      `INSERT INTO bookings ("""

if CONFLICT_CHECK.split('await client.query')[0].strip() not in idx and OLD_BEGIN in idx:
    idx = idx.replace(OLD_BEGIN, CONFLICT_CHECK + "\n\n    const bookingResult = await client.query(\n      `INSERT INTO bookings (")
elif 'hasBookingConflict' in idx:
    print('index.js conflict check already patched')
else:
    print('WARN: index.js BEGIN block not found')

INDEX.write_text(idx)
print('index.js patched')

AVAIL_REF_ROUTE = """
app.get('/api/availability', async (req, res) => {
  try {
    const { venueRef, date, duration, step } = req.query;
    if (!venueRef || !date) {
      return res.status(400).json({ error: 'venueRef и date обязательны' });
    }
    const dateYmd = String(date).slice(0, 10);
    if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(dateYmd)) {
      return res.status(400).json({ error: 'Укажите date в формате YYYY-MM-DD' });
    }
    const durationMinutes = Math.max(15, parseInt(String(duration || '60'), 10) || 60);
    const stepMinutes = Math.max(15, parseInt(String(step || '30'), 10) || 30);

    const partnerMatch = String(venueRef).match(/^partner:(\\d+)$/);
    let partnerVenueId = null;
    let timePriceRules = [];
    let basePrice = 0;

    if (partnerMatch) {
      partnerVenueId = parseInt(partnerMatch[1], 10);
      const venueRes = await pool.query(
        'SELECT id, base_price_per_hour, is_active FROM partner_venues WHERE id = $1',
        [partnerVenueId],
      );
      if (!venueRes.rows.length || !venueRes.rows[0].is_active) {
        return res.status(404).json({ error: 'Площадка не найдена' });
      }
      basePrice = Number(venueRes.rows[0].base_price_per_hour) || 0;
      const timeRes = await pool.query(
        'SELECT time_from, time_to, price_per_hour FROM partner_venue_time_prices WHERE venue_id = $1 ORDER BY id',
        [partnerVenueId],
      );
      timePriceRules = timeRes.rows.map((r) => ({
        timeFrom: String(r.time_from).slice(0, 5),
        timeTo: String(r.time_to).slice(0, 5),
        pricePerHour: Number(r.price_per_hour),
      }));
    }

    const availability = await computeVenueAvailability(pool, {
      partnerVenueId,
      venueRef: partnerVenueId ? undefined : String(venueRef),
      date: dateYmd,
      durationMinutes,
      stepMinutes,
      timePriceRules,
      basePrice,
    });
    res.json(availability);
  } catch (err) {
    console.error('GET /api/availability', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});
"""

if "/api/availability'" not in idx and "app.get('/api/availability'" not in idx:
    anchor = "registerPublicVenueRoutes(app, pool);"
    idx = idx.replace(anchor, AVAIL_REF_ROUTE + "\n\n" + anchor)
    INDEX.write_text(idx)
    print('index.js availability route added')
else:
    print('availability route already present')

