#!/usr/bin/env python3
"""Expand PATCH /api/partner/venues/:id to full venue update (fields + children)."""
from pathlib import Path

PV = Path('/opt/bookingo-api/src/partnerVenues.js')
text = PV.read_text()

OLD = """  app.patch('/api/partner/venues/:id', authenticateToken, requirePartner, async (req, res) => {
    try {
      const { partnerId } = req.user;
      const venueId = req.params.id;

      const owned = await pool.query(
        'SELECT managed_by_staff_id FROM partner_venues WHERE id = $1 AND partner_id = $2',
        [venueId, partnerId],
      );
      if (!owned.rows.length) return res.status(404).json({ error: 'Площадка не найдена' });
      if (req.user.role === 'manager') {
        const mid = owned.rows[0].managed_by_staff_id;
        if (mid && Number(mid) !== Number(req.user.staffId)) {
          return res.status(403).json({ error: 'Можно редактировать только свою площадку' });
        }
      } else if (req.user.role === 'owner') {
        return res.status(403).json({ error: 'Площадки ведут управляющие' });
      }

      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ error: 'Поле isActive обязательно (boolean)' });
      }

      const result = await pool.query(
        'UPDATE partner_venues SET is_active = $1 WHERE id = $2 AND partner_id = $3 RETURNING *',
        [isActive, venueId, partnerId],
      );
      if (!result.rows.length) return res.status(404).json({ error: 'Площадка не найдена' });
      const extras = await loadVenueExtras(pool, venueId, partnerId);
      res.json({ venue: mapVenueRow(result.rows[0], extras) });
    } catch (err) {
      console.error('PATCH /api/partner/venues/:id', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  });
"""

NEW = r"""  app.patch('/api/partner/venues/:id', authenticateToken, requirePartner, async (req, res) => {
    const client = await pool.connect();
    try {
      const { partnerId } = req.user;
      const venueId = req.params.id;
      const body = req.body || {};

      const owned = await client.query(
        'SELECT * FROM partner_venues WHERE id = $1 AND partner_id = $2',
        [venueId, partnerId],
      );
      if (!owned.rows.length) {
        client.release();
        return res.status(404).json({ error: 'Площадка не найдена' });
      }
      if (req.user.role === 'manager') {
        const mid = owned.rows[0].managed_by_staff_id;
        if (mid && Number(mid) !== Number(req.user.staffId)) {
          client.release();
          return res.status(403).json({ error: 'Можно редактировать только свою площадку' });
        }
      } else if (req.user.role === 'owner') {
        client.release();
        return res.status(403).json({ error: 'Площадки ведут управляющие' });
      }

      // Toggle visibility only
      if (typeof body.isActive === 'boolean' && body.name == null && body.city == null && body.address == null) {
        const result = await client.query(
          'UPDATE partner_venues SET is_active = $1 WHERE id = $2 AND partner_id = $3 RETURNING *',
          [body.isActive, venueId, partnerId],
        );
        client.release();
        const venue = await enrichVenueForViewer(pool, result.rows[0], partnerId, req.user);
        return res.json({ venue });
      }

      const {
        name, venueKind, sportType, city, address, description,
        basePricePerHour, timePriceRules, durationRules, extraServices, amenities, photos,
        lat: bodyLat, lng: bodyLng, isActive,
      } = body;

      if (!name?.trim() || !venueKind || !city?.trim() || !address?.trim()) {
        client.release();
        return res.status(400).json({ error: 'name, venueKind, city и address обязательны' });
      }

      const base = Number(basePricePerHour) || 0;
      const hasTime = Array.isArray(timePriceRules) && timePriceRules.some((r) => r.pricePerHour > 0);
      if (base <= 0 && !hasTime) {
        client.release();
        return res.status(400).json({ error: 'Укажите базовую цену или тариф по времени' });
      }

      let lat = bodyLat != null ? Number(bodyLat) : owned.rows[0].lat;
      let lng = bodyLng != null ? Number(bodyLng) : owned.rows[0].lng;
      if ((!Number.isFinite(lat) || !Number.isFinite(lng)) ||
          (city.trim() !== owned.rows[0].city || address.trim() !== owned.rows[0].address)) {
        const geo = await geocodeRussiaAddress(city.trim(), address.trim());
        if (geo) { lat = geo.lat; lng = geo.lng; }
      }

      await client.query('BEGIN');
      const venueRes = await client.query(
        `UPDATE partner_venues SET
          name = $1,
          venue_kind = $2,
          sport_type = $3,
          city = $4,
          address = $5,
          description = $6,
          base_price_per_hour = $7,
          amenities = $8::jsonb,
          lat = $9,
          lng = $10,
          is_active = COALESCE($11, is_active)
         WHERE id = $12 AND partner_id = $13
         RETURNING *`,
        [
          name.trim(),
          venueKind,
          venueKind === 'sport' ? (sportType || null) : null,
          city.trim(),
          address.trim(),
          (description || '').trim(),
          base,
          JSON.stringify(Array.isArray(amenities) ? amenities : []),
          Number.isFinite(lat) ? lat : null,
          Number.isFinite(lng) ? lng : null,
          typeof isActive === 'boolean' ? isActive : null,
          venueId,
          partnerId,
        ],
      );

      await client.query('DELETE FROM partner_venue_photos WHERE venue_id = $1', [venueId]);
      await client.query('DELETE FROM partner_venue_time_prices WHERE venue_id = $1', [venueId]);
      await client.query('DELETE FROM partner_venue_duration_prices WHERE venue_id = $1', [venueId]);
      await client.query('DELETE FROM partner_venue_extras WHERE venue_id = $1', [venueId]);

      await insertVenueChildren(client, venueId, partnerId, {
        photos, timePriceRules, durationRules, extraServices,
      });
      await client.query('COMMIT');
      client.release();

      const venue = await enrichVenueForViewer(pool, venueRes.rows[0], partnerId, req.user);
      res.json({ venue });
    } catch (err) {
      try { await client.query('ROLLBACK'); } catch (_) {}
      client.release();
      console.error('PATCH /api/partner/venues/:id', err);
      res.status(500).json({ error: err.message || 'Ошибка сервера' });
    }
  });
"""

if OLD not in text:
    if 'Укажите базовую цену или тариф по времени' in text and "body.name == null" in text:
        print('venue PATCH already expanded')
    else:
        raise SystemExit('OLD patch block not found')
else:
    PV.write_text(text.replace(OLD, NEW, 1))
    print('partnerVenues.js PATCH expanded')
