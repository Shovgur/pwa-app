#!/usr/bin/env python3
"""
Manager venues + promotions:
- partner_venues.managed_by_staff_id
- partner_venue_promotions table
- venues CRUD for managers (edit only own point)
- promotions partner + public APIs
- profile returns staff_id for managers
"""

from pathlib import Path
import subprocess

INDEX = Path('/opt/bookingo-api/src/index.js')
PARTNER = Path('/opt/bookingo-api/src/partnerVenues.js')

SQL = """
ALTER TABLE partner_venues
  ADD COLUMN IF NOT EXISTS managed_by_staff_id INTEGER REFERENCES partner_staff(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS partner_venue_promotions (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER NOT NULL REFERENCES partner_venues(id) ON DELETE CASCADE,
  partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  created_by_staff_id INTEGER REFERENCES partner_staff(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  promo_type VARCHAR(50) NOT NULL DEFAULT 'custom',
  discount_percent INTEGER,
  discount_amount INTEGER,
  time_from TIME,
  time_to TIME,
  starts_at DATE,
  ends_at DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_venue_promotions_venue ON partner_venue_promotions(venue_id);
CREATE INDEX IF NOT EXISTS idx_partner_venue_promotions_active ON partner_venue_promotions(is_active, is_featured);
"""

subprocess.run(
    ['sudo', '-u', 'postgres', 'psql', '-d', 'bookingo', '-c', SQL],
    check=False,
)
print('DB migrated')

# ── partnerVenues.js helpers & routes ────────────────────────────────────────

pv = PARTNER.read_text()

if "managed_by_staff_id" not in pv:
    pv = pv.replace(
        "lat: row.lat != null ? Number(row.lat) : null,\n    lng: row.lng != null ? Number(row.lng) : null,\n  };",
        """lat: row.lat != null ? Number(row.lat) : null,
    lng: row.lng != null ? Number(row.lng) : null,
    managedByStaffId: row.managed_by_staff_id != null ? String(row.managed_by_staff_id) : null,
    managedByName: extras.managedByName || null,
    canEdit: Boolean(extras.canEdit),
    promotions: extras.promotions || [],
  };""",
    )

PROMO_LOAD = '''
async function loadVenuePromotions(client, venueId) {
  const res = await client.query(
    `SELECT id, title, promo_type, discount_percent, discount_amount, is_featured, is_active
     FROM partner_venue_promotions
     WHERE venue_id = $1 AND is_active = true
       AND (starts_at IS NULL OR starts_at <= CURRENT_DATE)
       AND (ends_at IS NULL OR ends_at >= CURRENT_DATE)
     ORDER BY is_featured DESC, id DESC`,
    [venueId],
  );
  return res.rows.map((r) => ({
    id: String(r.id),
    title: r.title,
    promoType: r.promo_type,
    discountLabel: r.discount_percent
      ? `−${r.discount_percent}%`
      : (r.discount_amount ? `−${Number(r.discount_amount).toLocaleString('ru-RU')} ₽` : 'Акция'),
    isFeatured: Boolean(r.is_featured),
  }));
}

function discountLabelFromRow(r) {
  if (r.discount_percent) return `−${r.discount_percent}%`;
  if (r.discount_amount) return `−${Number(r.discount_amount).toLocaleString('ru-RU')} ₽`;
  return 'Акция';
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
    startsAt: row.starts_at ? String(row.starts_at).slice(0, 10) : null,
    endsAt: row.ends_at ? String(row.ends_at).slice(0, 10) : null,
    isActive: Boolean(row.is_active),
    isFeatured: Boolean(row.is_featured),
    createdAt: toISO(row.created_at),
  };
}
'''

if 'loadVenuePromotions' not in pv:
    pv = pv.replace(
        'async function loadVenueExtras(client, venueId, partnerId) {',
        PROMO_LOAD + '\nasync function loadVenueExtras(client, venueId, partnerId) {',
    )

# enrich loadVenueExtras to include promotions + manager name
if 'managedByName' not in pv or 'loadVenuePromotions(client, venueId)' not in pv:
    old_return = """  return {
    photos: photosRes.rows.map((p) => ({
      id: String(p.id),
      url: p.url,
      isCover: p.is_cover,
    })),
    timePriceRules: timeRes.rows.map((r) => ({
      id: String(r.id),
      label: r.label || '',
      timeFrom: toTimeHHMM(r.time_from),
      timeTo: toTimeHHMM(r.time_to),
      pricePerHour: Number(r.price_per_hour),
    })),
    durationRules: durationRes.rows.map((r) => ({
      id: String(r.id),
      label: r.label || '',
      hours: Number(r.hours),
      price: Number(r.price),
    })),
    extraServices: extrasRes.rows.map((r) => ({
      id: String(r.id),
      name: r.name,
      description: r.description || '',
      price: Number(r.price),
      billing: r.billing,
    })),
    bookingsCount: bookingsRes.rows[0]?.cnt || 0,
  };
}"""
    # softer: append promotions fetch before return if not present
    if 'loadVenuePromotions' in pv and 'promotions:' not in old_return:
        pass

# Replace registerPartnerVenueRoutes to use requirePartner instead of requireOwner for venues
if "requireOwner" in pv and "registerPartnerVenueRoutes" in pv:
    pv = pv.replace(
        'export function registerPartnerVenueRoutes(app, pool, { authenticateToken, requireOwner }) {',
        'export function registerPartnerVenueRoutes(app, pool, { authenticateToken, requireOwner, requirePartner }) {',
    )
    # Use requirePartner for list/create; keep owner-only if requirePartner missing → fallback authenticateToken
    pv = pv.replace(
        "app.get('/api/partner/venues', authenticateToken, requireOwner,",
        "app.get('/api/partner/venues', authenticateToken, requirePartner || requireOwner,",
    )
    pv = pv.replace(
        "app.post('/api/partner/venues', authenticateToken, requireOwner,",
        "app.post('/api/partner/venues', authenticateToken, requirePartner || requireOwner,",
    )
    pv = pv.replace(
        "app.patch('/api/partner/venues/:id', authenticateToken, requireOwner,",
        "app.patch('/api/partner/venues/:id', authenticateToken, requirePartner || requireOwner,",
    )
    pv = pv.replace(
        "app.delete('/api/partner/venues/:id', authenticateToken, requireOwner,",
        "app.delete('/api/partner/venues/:id', authenticateToken, requirePartner || requireOwner,",
    )

# Patch POST insert to set managed_by_staff_id
if 'managed_by_staff_id' not in pv.split('INSERT INTO partner_venues')[1][:800] if 'INSERT INTO partner_venues' in pv else True:
    pv = pv.replace(
        """        `INSERT INTO partner_venues
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
        ],""",
        """        `INSERT INTO partner_venues
          (partner_id, name, venue_kind, sport_type, city, address, description, base_price_per_hour, is_active, amenities, lat, lng, managed_by_staff_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9::jsonb, $10, $11, $12)
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
          req.user.staffId || null,
        ],""",
    )

# After listing venues, inject canEdit based on role/staffId — patch GET loop
OLD_LIST_PUSH = """        const extras = await loadVenueExtras(pool, row.id, partnerId);
        venues.push(mapVenueRow(row, extras));"""
NEW_LIST_PUSH = """        const extras = await loadVenueExtras(pool, row.id, partnerId);
        const staffId = req.user.staffId || null;
        const role = req.user.role || 'owner';
        let managerName = null;
        if (row.managed_by_staff_id) {
          const mn = await pool.query('SELECT name FROM partner_staff WHERE id = $1', [row.managed_by_staff_id]);
          managerName = mn.rows[0]?.name || null;
        }
        let promotions = [];
        try { promotions = await loadVenuePromotions(pool, row.id); } catch (_) {}
        const canEdit = role === 'manager'
          ? (!row.managed_by_staff_id || Number(row.managed_by_staff_id) === Number(staffId))
          : false;
        venues.push(mapVenueRow(row, { ...extras, managedByName: managerName, canEdit, promotions }));"""

if OLD_LIST_PUSH in pv and 'const canEdit = role ===' not in pv:
    pv = pv.replace(OLD_LIST_PUSH, NEW_LIST_PUSH)

# Guard PATCH/DELETE for managers
GUARD = """
      const venueCheck = await pool.query('SELECT managed_by_staff_id FROM partner_venues WHERE id = $1 AND partner_id = $2', [venueId, partnerId]);
      if (!venueCheck.rows.length) return res.status(404).json({ error: 'Площадка не найдена' });
      if (req.user.role === 'manager') {
        const mid = venueCheck.rows[0].managed_by_staff_id;
        if (mid && Number(mid) !== Number(req.user.staffId)) {
          return res.status(403).json({ error: 'Можно редактировать только свою площадку' });
        }
      }
"""

if "Можно редактировать только свою площадку" not in pv:
    pv = pv.replace(
        """  app.patch('/api/partner/venues/:id', authenticateToken, requirePartner || requireOwner, async (req, res) => {
    try {
      const { partnerId } = req.user;
      const venueId = req.params.id;
      const { isActive } = req.body;""",
        """  app.patch('/api/partner/venues/:id', authenticateToken, requirePartner || requireOwner, async (req, res) => {
    try {
      const { partnerId } = req.user;
      const venueId = req.params.id;
""" + GUARD + """
      const { isActive } = req.body;""",
    )
    pv = pv.replace(
        """  app.delete('/api/partner/venues/:id', authenticateToken, requirePartner || requireOwner, async (req, res) => {
    try {
      const { partnerId } = req.user;
      const venueId = req.params.id;
      const result = await pool.query(""",
        """  app.delete('/api/partner/venues/:id', authenticateToken, requirePartner || requireOwner, async (req, res) => {
    try {
      const { partnerId } = req.user;
      const venueId = req.params.id;
""" + GUARD + """
      const result = await pool.query(""",
    )

# Block owners from creating venues
if "Площадки создают управляющие" not in pv:
    pv = pv.replace(
        """  app.post('/api/partner/venues', authenticateToken, requirePartner || requireOwner, async (req, res) => {
    const client = await pool.connect();
    try {
      const { partnerId } = req.user;""",
        """  app.post('/api/partner/venues', authenticateToken, requirePartner || requireOwner, async (req, res) => {
    const client = await pool.connect();
    try {
      if (req.user.role === 'owner') {
        client.release();
        return res.status(403).json({ error: 'Площадки создают управляющие' });
      }
      const { partnerId } = req.user;""",
    )

PROMO_ROUTES = r'''
export function registerPartnerPromotionRoutes(app, pool, { authenticateToken, requirePartner }) {
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
      } = req.body;
      if (!venueId || !title?.trim()) {
        return res.status(400).json({ error: 'venueId и title обязательны' });
      }
      const venue = await pool.query(
        'SELECT id, managed_by_staff_id, name FROM partner_venues WHERE id = $1 AND partner_id = $2',
        [venueId, partnerId],
      );
      if (!venue.rows.length) return res.status(404).json({ error: 'Площадка не найдена' });
      const mid = venue.rows[0].managed_by_staff_id;
      if (mid && Number(mid) !== Number(staffId)) {
        return res.status(403).json({ error: 'Акции только для своей площадки' });
      }
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
      const row = { ...ins.rows[0], venue_name: venue.rows[0].name };
      res.status(201).json({ promotion: mapPromoRow(row) });
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
      const promoId = req.params.id;
      const existing = await pool.query(
        `SELECT p.*, v.managed_by_staff_id, v.name AS venue_name
         FROM partner_venue_promotions p
         JOIN partner_venues v ON v.id = p.venue_id
         WHERE p.id = $1 AND p.partner_id = $2`,
        [promoId, partnerId],
      );
      if (!existing.rows.length) return res.status(404).json({ error: 'Акция не найдена' });
      const mid = existing.rows[0].managed_by_staff_id;
      if (mid && Number(mid) !== Number(staffId)) {
        return res.status(403).json({ error: 'Акции только для своей площадки' });
      }
      const cur = existing.rows[0];
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
          b.title ?? null, b.description ?? null, b.promoType ?? null,
          b.discountPercent ?? null, b.discountAmount ?? null,
          b.timeFrom ?? null, b.timeTo ?? null, b.startsAt ?? null, b.endsAt ?? null,
          typeof b.isActive === 'boolean' ? b.isActive : null,
          typeof b.isFeatured === 'boolean' ? b.isFeatured : null,
          promoId,
        ],
      );
      res.json({ promotion: mapPromoRow({ ...updated.rows[0], venue_name: cur.venue_name }) });
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
      const mid = existing.rows[0].managed_by_staff_id;
      if (mid && Number(mid) !== Number(staffId)) {
        return res.status(403).json({ error: 'Акции только для своей площадки' });
      }
      await pool.query('DELETE FROM partner_venue_promotions WHERE id = $1', [req.params.id]);
      res.sendStatus(204);
    } catch (err) {
      console.error('DELETE /api/partner/promotions', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  });
}
'''

if 'registerPartnerPromotionRoutes' not in pv:
    pv += '\n' + PROMO_ROUTES + '\n'

# Public promotions + attach to public venues
if "app.get('/api/promotions'" not in pv:
    pv = pv.replace(
        "export function registerPublicVenueRoutes(app, pool) {",
        """export function registerPublicVenueRoutes(app, pool) {
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
""",
    )

# Attach promotions on public venue list
if 'loadVenuePromotions(pool, row.id)' not in pv.split("registerPublicVenueRoutes")[-1][:2500]:
    pv = pv.replace(
        """      for (const row of venuesRes.rows) {
        const extras = await loadVenueExtras(pool, row.id, row.partner_id);
        venues.push(mapVenueRow(row, extras));
      }
      res.json({ venues });
    } catch (err) {
      console.error('GET /api/venues', err);""",
        """      for (const row of venuesRes.rows) {
        const extras = await loadVenueExtras(pool, row.id, row.partner_id);
        let promotions = [];
        try { promotions = await loadVenuePromotions(pool, row.id); } catch (_) {}
        venues.push(mapVenueRow(row, { ...extras, promotions, canEdit: false }));
      }
      res.json({ venues });
    } catch (err) {
      console.error('GET /api/venues', err);""",
    )

PARTNER.write_text(pv)
print('partnerVenues.js patched')

# ── index.js: requirePartner, staffId on JWT profile, register promo routes ──

idx = INDEX.read_text()

if 'function requirePartner' not in idx:
    idx = idx.replace(
        'function requireOwner',
        '''function requirePartner(req, res, next) {
  if (!req.user || !req.user.partnerId) {
    return res.status(403).json({ error: 'Нет доступа партнёра' });
  }
  next();
}

function requireOwner''',
    )

# Update import / register calls
if 'registerPartnerPromotionRoutes' not in idx:
    idx = idx.replace(
        "import { registerPartnerVenueRoutes, registerPublicVenueRoutes } from './partnerVenues.js';",
        "import { registerPartnerVenueRoutes, registerPublicVenueRoutes, registerPartnerPromotionRoutes } from './partnerVenues.js';",
    )
    idx = idx.replace(
        'registerPartnerVenueRoutes(app, pool, { authenticateToken, requireOwner });',
        '''registerPartnerVenueRoutes(app, pool, { authenticateToken, requireOwner, requirePartner });
registerPartnerPromotionRoutes(app, pool, { authenticateToken, requirePartner });''',
    )

# Ensure manager login/profile exposes staff_id — soft patch common patterns
if 'staff_id: req.user.staffId' not in idx and 'staff_id:' not in idx:
    # Try to enrich /api/partner/me or profile response
    for needle in [
        "commission_percent: partner.commission_percent",
        "commissionPercent: partner.commission_percent",
    ]:
        if needle in idx:
            idx = idx.replace(
                needle,
                needle + ",\n      staff_id: req.user.staffId ?? null,\n      role: req.user.role || 'owner'",
            )
            break

INDEX.write_text(idx)
print('index.js patched')
print('Done. Restart: pm2 restart bookingo-api')
