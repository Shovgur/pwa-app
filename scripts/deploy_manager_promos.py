#!/usr/bin/env python3
"""Deploy manager venues ownership + promotions backend."""

from pathlib import Path
import shutil
import subprocess
from datetime import datetime

ROOT = Path('/opt/bookingo-api/src')
INDEX = ROOT / 'index.js'
PARTNER = ROOT / 'partnerVenues.js'
PROMOS = ROOT / 'partnerPromotions.js'
LOCAL_PROMOS = Path(__file__).resolve().parent / 'backend' / 'partnerPromotions.js'
if not LOCAL_PROMOS.exists():
    # When copied to /tmp next to partnerPromotions.js
    LOCAL_PROMOS = Path(__file__).resolve().parent / 'partnerPromotions.js'

stamp = datetime.now().strftime('%Y%m%d_%H%M%S')
shutil.copy2(INDEX, INDEX.with_suffix(f'.js.bak_{stamp}'))
shutil.copy2(PARTNER, PARTNER.with_suffix(f'.js.bak_{stamp}'))
print('backed up')

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
r = subprocess.run(
    ['sudo', '-u', 'postgres', 'psql', '-d', 'bookingo', '-v', 'ON_ERROR_STOP=1', '-c', SQL],
    capture_output=True, text=True,
)
print(r.stdout)
if r.returncode != 0:
    print(r.stderr)
    raise SystemExit('DB migration failed')
print('DB OK')

# Copy promotions module
PROMOS.write_text(LOCAL_PROMOS.read_text())
print('partnerPromotions.js installed')

pv = PARTNER.read_text()

# mapVenueRow extras
old_map_tail = """    lat: row.lat != null ? Number(row.lat) : null,
    lng: row.lng != null ? Number(row.lng) : null,
  };
}"""
new_map_tail = """    lat: row.lat != null ? Number(row.lat) : null,
    lng: row.lng != null ? Number(row.lng) : null,
    managedByStaffId: row.managed_by_staff_id != null ? String(row.managed_by_staff_id) : null,
    managedByName: extras.managedByName || null,
    canEdit: Boolean(extras.canEdit),
    promotions: extras.promotions || [],
  };
}"""
if 'managedByStaffId' not in pv:
    if old_map_tail not in pv:
        raise SystemExit('mapVenueRow tail not found')
    pv = pv.replace(old_map_tail, new_map_tail)

HELPERS = '''
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
      ? ('−' + r.discount_percent + '%')
      : (r.discount_amount ? ('−' + Number(r.discount_amount).toLocaleString('ru-RU') + ' ₽') : 'Акция'),
    isFeatured: Boolean(r.is_featured),
  }));
}

async function enrichVenueForViewer(client, row, partnerId, viewer) {
  const extras = await loadVenueExtras(client, row.id, partnerId);
  let managedByName = null;
  if (row.managed_by_staff_id) {
    const mn = await client.query('SELECT name FROM partner_staff WHERE id = $1', [row.managed_by_staff_id]);
    managedByName = mn.rows[0]?.name || null;
  }
  let promotions = [];
  try { promotions = await loadVenuePromotions(client, row.id); } catch (_) {}
  const role = viewer?.role || 'owner';
  const staffId = viewer?.staffId || null;
  const canEdit = role === 'manager'
    ? (!row.managed_by_staff_id || Number(row.managed_by_staff_id) === Number(staffId))
    : false;
  return mapVenueRow(row, { ...extras, managedByName, canEdit, promotions });
}

'''

if 'async function loadVenuePromotions' not in pv:
    pv = pv.replace(
        'async function loadVenueExtras(client, venueId, partnerId) {',
        HELPERS + 'async function loadVenueExtras(client, venueId, partnerId) {',
    )

# Swap venue routes auth + logic by replacing the whole registerPartnerVenueRoutes function start through end
# Safer: replace requireOwner with requirePartner on venue routes and inject logic pieces.

pv = pv.replace(
    'export function registerPartnerVenueRoutes(app, pool, { authenticateToken, requireOwner }) {',
    'export function registerPartnerVenueRoutes(app, pool, { authenticateToken, requireOwner, requirePartner }) {',
)

# GET venues: allow partner (owner+manager), enrich with canEdit
OLD_GET = """  app.get('/api/partner/venues', authenticateToken, requireOwner, async (req, res) => {
    try {
      const { partnerId } = req.user;
      const venuesRes = await pool.query(
        'SELECT * FROM partner_venues WHERE partner_id = $1 ORDER BY created_at DESC',
        [partnerId],
      );
      const venues = [];
      for (const row of venuesRes.rows) {
        const extras = await loadVenueExtras(pool, row.id, partnerId);
        venues.push(mapVenueRow(row, extras));
      }
      res.json({ venues });
    } catch (err) {
      console.error('GET /api/partner/venues', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  });"""

NEW_GET = """  app.get('/api/partner/venues', authenticateToken, requirePartner, async (req, res) => {
    try {
      const { partnerId } = req.user;
      const venuesRes = await pool.query(
        'SELECT * FROM partner_venues WHERE partner_id = $1 ORDER BY created_at DESC',
        [partnerId],
      );
      const venues = [];
      for (const row of venuesRes.rows) {
        venues.push(await enrichVenueForViewer(pool, row, partnerId, req.user));
      }
      res.json({ venues });
    } catch (err) {
      console.error('GET /api/partner/venues', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  });"""

if OLD_GET in pv:
    pv = pv.replace(OLD_GET, NEW_GET)
elif "app.get('/api/partner/venues', authenticateToken, requirePartner" in pv:
    print('GET venues already patched')
else:
    # maybe already requireOwner still
    pv = pv.replace(
        "app.get('/api/partner/venues', authenticateToken, requireOwner,",
        "app.get('/api/partner/venues', authenticateToken, requirePartner,",
    )

# POST: managers only + managed_by_staff_id
pv = pv.replace(
    "app.post('/api/partner/venues', authenticateToken, requireOwner,",
    "app.post('/api/partner/venues', authenticateToken, requirePartner,",
)

POST_GUARD = """  app.post('/api/partner/venues', authenticateToken, requirePartner, async (req, res) => {
    const client = await pool.connect();
    try {
      if (req.user.role !== 'manager') {
        client.release();
        return res.status(403).json({ error: 'Площадки создают управляющие' });
      }
      const { partnerId, staffId } = req.user;"""

# Replace start of POST handler body
old_post_start = """  app.post('/api/partner/venues', authenticateToken, requirePartner, async (req, res) => {
    const client = await pool.connect();
    try {
      const { partnerId } = req.user;"""

if old_post_start in pv:
    pv = pv.replace(old_post_start, POST_GUARD)
elif 'Площадки создают управляющие' not in pv:
    print('WARN: could not inject POST guard exactly')

OLD_INSERT = """        `INSERT INTO partner_venues
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

NEW_INSERT = """        `INSERT INTO partner_venues
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
          staffId || null,
        ],"""

if OLD_INSERT in pv:
    pv = pv.replace(OLD_INSERT, NEW_INSERT)
elif 'managed_by_staff_id)' in pv:
    print('INSERT already has managed_by_staff_id')
else:
    raise SystemExit('INSERT block not found')

# After create, return enriched venue
pv = pv.replace(
    """      const extras = await loadVenueExtras(pool, venueRow.id, partnerId);
      client.release();
      res.status(201).json({ venue: mapVenueRow(venueRow, extras) });""",
    """      client.release();
      const venue = await enrichVenueForViewer(pool, venueRow, partnerId, req.user);
      res.status(201).json({ venue });""",
)

# PATCH / DELETE: requirePartner + ownership guard
pv = pv.replace(
    "app.patch('/api/partner/venues/:id', authenticateToken, requireOwner,",
    "app.patch('/api/partner/venues/:id', authenticateToken, requirePartner,",
)
pv = pv.replace(
    "app.delete('/api/partner/venues/:id', authenticateToken, requireOwner,",
    "app.delete('/api/partner/venues/:id', authenticateToken, requirePartner,",
)

OWN_GUARD = """
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
"""

if 'Можно редактировать только свою площадку' not in pv:
    pv = pv.replace(
        """  app.patch('/api/partner/venues/:id', authenticateToken, requirePartner, async (req, res) => {
    try {
      const { partnerId } = req.user;
      const venueId = req.params.id;
      const { isActive } = req.body;""",
        """  app.patch('/api/partner/venues/:id', authenticateToken, requirePartner, async (req, res) => {
    try {
      const { partnerId } = req.user;
      const venueId = req.params.id;
""" + OWN_GUARD + """
      const { isActive } = req.body;""",
    )
    pv = pv.replace(
        """  app.delete('/api/partner/venues/:id', authenticateToken, requirePartner, async (req, res) => {
    try {
      const { partnerId } = req.user;
      const venueId = req.params.id;
      const result = await pool.query(
        'DELETE FROM partner_venues WHERE id = $1 AND partner_id = $2 RETURNING id',
        [venueId, partnerId],
      );""",
        """  app.delete('/api/partner/venues/:id', authenticateToken, requirePartner, async (req, res) => {
    try {
      const { partnerId } = req.user;
      const venueId = req.params.id;
""" + OWN_GUARD + """
      const result = await pool.query(
        'DELETE FROM partner_venues WHERE id = $1 AND partner_id = $2 RETURNING id',
        [venueId, partnerId],
      );""",
    )

# Public venues: attach promotions
OLD_PUBLIC_LIST = """      for (const row of venuesRes.rows) {
        const extras = await loadVenueExtras(pool, row.id, row.partner_id);
        venues.push(mapVenueRow(row, extras));
      }
      res.json({ venues });
    } catch (err) {
      console.error('GET /api/venues', err);"""

NEW_PUBLIC_LIST = """      for (const row of venuesRes.rows) {
        venues.push(await enrichVenueForViewer(pool, row, row.partner_id, { role: 'public' }));
      }
      // Featured promo venues first
      venues.sort((a, b) => {
        const af = (a.promotions || []).some((p) => p.isFeatured) ? 1 : 0;
        const bf = (b.promotions || []).some((p) => p.isFeatured) ? 1 : 0;
        return bf - af;
      });
      res.json({ venues });
    } catch (err) {
      console.error('GET /api/venues', err);"""

if OLD_PUBLIC_LIST in pv:
    pv = pv.replace(OLD_PUBLIC_LIST, NEW_PUBLIC_LIST)

OLD_PUBLIC_ONE = """      const extras = await loadVenueExtras(pool, row.id, row.partner_id);
      res.json({ venue: mapVenueRow(row, extras) });
    } catch (err) {
      console.error('GET /api/venues/:id', err);"""

NEW_PUBLIC_ONE = """      const venue = await enrichVenueForViewer(pool, row, row.partner_id, { role: 'public' });
      res.json({ venue });
    } catch (err) {
      console.error('GET /api/venues/:id', err);"""

if OLD_PUBLIC_ONE in pv:
    pv = pv.replace(OLD_PUBLIC_ONE, NEW_PUBLIC_ONE)

PARTNER.write_text(pv)
print('partnerVenues.js patched')

# index.js
idx = INDEX.read_text()

if 'function requirePartner' not in idx:
    idx = idx.replace(
        'function requireOwner(req, res, next) {',
        '''function requirePartner(req, res, next) {
  if (!req.user || !req.user.partnerId) {
    return res.status(403).json({ error: 'Нет доступа партнёра' });
  }
  next();
}

function requireOwner(req, res, next) {''',
    )

# manager profile staff_id
OLD_MGR_PROFILE = """      return res.json({
        id: row.id,
        company_name: row.company_name,
        login: row.login,
        name: row.name,
        role: 'manager',
        status: row.is_active ? (row.partner_status || 'active') : 'disabled',
      });"""

NEW_MGR_PROFILE = """      return res.json({
        id: row.id,
        company_name: row.company_name,
        login: row.login,
        name: row.name,
        role: 'manager',
        staff_id: row.id,
        status: row.is_active ? (row.partner_status || 'active') : 'disabled',
      });"""

if 'staff_id: row.id' not in idx:
    if OLD_MGR_PROFILE not in idx:
        raise SystemExit('manager profile block not found')
    idx = idx.replace(OLD_MGR_PROFILE, NEW_MGR_PROFILE)

# imports + register
if 'partnerPromotions.js' not in idx:
    idx = idx.replace(
        "import { registerPartnerVenueRoutes, registerPublicVenueRoutes } from './partnerVenues.js';",
        "import { registerPartnerVenueRoutes, registerPublicVenueRoutes } from './partnerVenues.js';\n"
        "import { registerPartnerPromotionRoutes } from './partnerPromotions.js';",
    )

if 'registerPartnerPromotionRoutes' not in idx.split('registerPartnerVenueRoutes')[-1]:
    idx = idx.replace(
        'registerPartnerVenueRoutes(app, pool, { authenticateToken, requireOwner });',
        '''registerPartnerVenueRoutes(app, pool, { authenticateToken, requireOwner, requirePartner });
registerPartnerPromotionRoutes(app, pool, {
  authenticateToken,
  requirePartner,
  helpers: {
    toISO: (value) => (value instanceof Date ? value.toISOString() : value ? new Date(value).toISOString() : null),
    toTimeHHMM: (value) => (value ? String(value).slice(0, 5) : ''),
  },
});''',
    )

INDEX.write_text(idx)
print('index.js patched')

# syntax check
chk = subprocess.run(['node', '--check', str(PARTNER)], capture_output=True, text=True)
print('partnerVenues check:', chk.returncode, chk.stderr.strip())
chk2 = subprocess.run(['node', '--check', str(PROMOS)], capture_output=True, text=True)
print('promotions check:', chk2.returncode, chk2.stderr.strip())
chk3 = subprocess.run(['node', '--check', str(INDEX)], capture_output=True, text=True)
print('index check:', chk3.returncode, chk3.stderr.strip())
if chk.returncode or chk2.returncode or chk3.returncode:
    raise SystemExit('syntax error')

print('SUCCESS')
