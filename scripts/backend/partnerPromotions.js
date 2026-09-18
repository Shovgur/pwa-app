/**
 * Partner + public promotions API.
 * Imported from index.js after partnerVenues.js helpers exist on the same process.
 */
export function registerPartnerPromotionRoutes(app, pool, { authenticateToken, requirePartner, helpers }) {
  const { toISO, toTimeHHMM } = helpers;

  function toDateYMD(value) {
    if (!value) return null;
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      const y = value.getFullYear();
      const m = String(value.getMonth() + 1).padStart(2, '0');
      const d = String(value.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    const s = String(value);
    const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : null;
  }

  function mapPromoRow(row) {
    return {
      id: String(row.id),
      venueId: String(row.venue_id),
      venueName: row.venue_name || '',
      title: row.title,
      description: row.description || '',
      promoType: row.promo_type,
      discountPercent: row.discount_percent != null ? Number(row.discount_percent) : null,
      discountAmount: row.discount_amount != null ? Number(row.discount_amount) : null,
      timeFrom: row.time_from ? String(row.time_from).slice(0, 5) : null,
      timeTo: row.time_to ? String(row.time_to).slice(0, 5) : null,
      startsAt: toDateYMD(row.starts_at),
      endsAt: toDateYMD(row.ends_at),
      isActive: Boolean(row.is_active),
      isFeatured: Boolean(row.is_featured),
      createdAt: toISO(row.created_at),
    };
  }

  async function assertCanManageVenue(partnerId, staffId, venueId) {
    const venue = await pool.query(
      'SELECT id, managed_by_staff_id, name FROM partner_venues WHERE id = $1 AND partner_id = $2',
      [venueId, partnerId],
    );
    if (!venue.rows.length) return { error: 'Площадка не найдена', status: 404 };
    const mid = venue.rows[0].managed_by_staff_id;
    if (mid && Number(mid) !== Number(staffId)) {
      return { error: 'Можно менять только свою площадку', status: 403 };
    }
    return { venue: venue.rows[0] };
  }

  app.get('/api/partner/promotions', authenticateToken, requirePartner, async (req, res) => {
    try {
      const { partnerId } = req.user;
      const result = await pool.query(
        `SELECT p.*, v.name AS venue_name
         FROM partner_venue_promotions p
         JOIN partner_venues v ON v.id = p.venue_id
         WHERE p.partner_id = $1
         ORDER BY p.created_at DESC`,
        [partnerId],
      );
      res.json({ promotions: result.rows.map(mapPromoRow) });
    } catch (err) {
      console.error('GET /api/partner/promotions', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  });

  app.post('/api/partner/promotions', authenticateToken, requirePartner, async (req, res) => {
    try {
      if (req.user.role === 'owner') {
        return res.status(403).json({ error: 'Акции создают управляющие' });
      }
      const { partnerId, staffId } = req.user;
      const {
        venueId, title, description, promoType,
        discountPercent, discountAmount, timeFrom, timeTo,
        startsAt, endsAt, isActive = true, isFeatured = false,
      } = req.body || {};

      if (!venueId || !title?.trim()) {
        return res.status(400).json({ error: 'venueId и title обязательны' });
      }

      const check = await assertCanManageVenue(partnerId, staffId, venueId);
      if (check.error) return res.status(check.status).json({ error: check.error });

      const ins = await pool.query(
        `INSERT INTO partner_venue_promotions
          (venue_id, partner_id, created_by_staff_id, title, description, promo_type,
           discount_percent, discount_amount, time_from, time_to, starts_at, ends_at, is_active, is_featured)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         RETURNING *`,
        [
          venueId, partnerId, staffId || null, title.trim(), (description || '').trim(),
          promoType || 'custom',
          discountPercent || null, discountAmount || null,
          timeFrom || null, timeTo || null, startsAt || null, endsAt || null,
          Boolean(isActive), Boolean(isFeatured),
        ],
      );
      res.status(201).json({
        promotion: mapPromoRow({ ...ins.rows[0], venue_name: check.venue.name }),
      });
    } catch (err) {
      console.error('POST /api/partner/promotions', err);
      res.status(500).json({ error: err.message || 'Ошибка сервера' });
    }
  });

  app.patch('/api/partner/promotions/:id', authenticateToken, requirePartner, async (req, res) => {
    try {
      if (req.user.role === 'owner') {
        return res.status(403).json({ error: 'Акции редактируют управляющие' });
      }
      const { partnerId, staffId } = req.user;
      const existing = await pool.query(
        `SELECT p.*, v.managed_by_staff_id, v.name AS venue_name
         FROM partner_venue_promotions p
         JOIN partner_venues v ON v.id = p.venue_id
         WHERE p.id = $1 AND p.partner_id = $2`,
        [req.params.id, partnerId],
      );
      if (!existing.rows.length) return res.status(404).json({ error: 'Акция не найдена' });
      const cur = existing.rows[0];
      if (cur.managed_by_staff_id && Number(cur.managed_by_staff_id) !== Number(staffId)) {
        return res.status(403).json({ error: 'Акции только для своей площадки' });
      }

      const b = req.body || {};
      const updated = await pool.query(
        `UPDATE partner_venue_promotions SET
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          promo_type = COALESCE($3, promo_type),
          discount_percent = COALESCE($4, discount_percent),
          discount_amount = COALESCE($5, discount_amount),
          time_from = COALESCE($6, time_from),
          time_to = COALESCE($7, time_to),
          starts_at = COALESCE($8, starts_at),
          ends_at = COALESCE($9, ends_at),
          is_active = COALESCE($10, is_active),
          is_featured = COALESCE($11, is_featured)
         WHERE id = $12
         RETURNING *`,
        [
          b.title ?? null,
          b.description ?? null,
          b.promoType ?? null,
          b.discountPercent ?? null,
          b.discountAmount ?? null,
          b.timeFrom ?? null,
          b.timeTo ?? null,
          b.startsAt ?? null,
          b.endsAt ?? null,
          typeof b.isActive === 'boolean' ? b.isActive : null,
          typeof b.isFeatured === 'boolean' ? b.isFeatured : null,
          req.params.id,
        ],
      );
      res.json({
        promotion: mapPromoRow({ ...updated.rows[0], venue_name: cur.venue_name }),
      });
    } catch (err) {
      console.error('PATCH /api/partner/promotions', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  });

  app.delete('/api/partner/promotions/:id', authenticateToken, requirePartner, async (req, res) => {
    try {
      if (req.user.role === 'owner') {
        return res.status(403).json({ error: 'Акции удаляют управляющие' });
      }
      const { partnerId, staffId } = req.user;
      const existing = await pool.query(
        `SELECT p.id, v.managed_by_staff_id
         FROM partner_venue_promotions p
         JOIN partner_venues v ON v.id = p.venue_id
         WHERE p.id = $1 AND p.partner_id = $2`,
        [req.params.id, partnerId],
      );
      if (!existing.rows.length) return res.status(404).json({ error: 'Акция не найдена' });
      if (existing.rows[0].managed_by_staff_id
          && Number(existing.rows[0].managed_by_staff_id) !== Number(staffId)) {
        return res.status(403).json({ error: 'Акции только для своей площадки' });
      }
      await pool.query('DELETE FROM partner_venue_promotions WHERE id = $1', [req.params.id]);
      res.sendStatus(204);
    } catch (err) {
      console.error('DELETE /api/partner/promotions', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  });

  app.get('/api/promotions', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT p.*, v.name AS venue_name
         FROM partner_venue_promotions p
         JOIN partner_venues v ON v.id = p.venue_id
         WHERE p.is_active = true AND v.is_active = true
           AND (p.starts_at IS NULL OR p.starts_at <= CURRENT_DATE)
           AND (p.ends_at IS NULL OR p.ends_at >= CURRENT_DATE)
         ORDER BY p.is_featured DESC, p.created_at DESC
         LIMIT 40`,
      );
      res.json({ promotions: result.rows.map(mapPromoRow) });
    } catch (err) {
      console.error('GET /api/promotions', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  });

  // silence unused in some bundlers
  void toTimeHHMM;
}
