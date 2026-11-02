#!/usr/bin/env python3
"""Partner earnings scope: venue_id on bookings, manager filters, owner assign manager."""

from pathlib import Path
import re

INDEX = Path('/opt/bookingo-api/src/index.js')
VENUES = Path('/opt/bookingo-api/src/partnerVenues.js')
PROMOS = Path('/opt/bookingo-api/src/partnerPromotions.js')

text = INDEX.read_text()

# ── 1) mapBookingRow + venueId ─────────────────────────────
OLD_MAP = """function mapBookingRow(row) {
  return {
    id: String(row.id),
    code: row.code,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    venueName: row.venue_name,
    venueKind: row.venue_kind,"""

NEW_MAP = """function mapBookingRow(row) {
  return {
    id: String(row.id),
    code: row.code,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    venueId: row.venue_id != null ? String(row.venue_id) : null,
    venueName: row.venue_name,
    venueKind: row.venue_kind,"""

if 'venueId: row.venue_id' not in text:
    if OLD_MAP not in text:
        raise SystemExit('mapBookingRow block not found')
    text = text.replace(OLD_MAP, NEW_MAP, 1)
    print('mapBookingRow +venueId')
else:
    print('mapBookingRow already has venueId')

# ── 2) INSERT partner_bookings includes venue_id ───────────
# Current insert without venue_id — patch both columns and values
OLD_INSERT = """        `INSERT INTO partner_bookings (
          partner_id, code, customer_name, customer_phone, venue_name, venue_kind,
          date, time_from, time_to, guests, amount, paid_amount, payment_method, status, comment
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          partnerId, code, user.name || 'Клиент', user.phone || '', venueName, venueKind,
          date, time, timeTo, guests, price, paidAmount, paymentMethod, partnerStatus, fullComment,
        ],"""

NEW_INSERT = """        `INSERT INTO partner_bookings (
          partner_id, code, customer_name, customer_phone, venue_id, venue_name, venue_kind,
          date, time_from, time_to, guests, amount, paid_amount, payment_method, status, comment
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          partnerId, code, user.name || 'Клиент', user.phone || '', partnerVenueId, venueName, venueKind,
          date, time, timeTo, guests, price, paidAmount, paymentMethod, partnerStatus, fullComment,
        ],"""

if 'venue_id, venue_name, venue_kind' in text and 'partnerVenueId, venueName, venueKind' in text:
    print('partner_bookings insert already has venue_id')
elif OLD_INSERT in text:
    text = text.replace(OLD_INSERT, NEW_INSERT, 1)
    print('partner_bookings insert +venue_id')
else:
    print('WARN: partner_bookings insert pattern not found — check manually')

# ── 3) GET /partner/bookings — manager scope ───────────────
OLD_GET_BOOKINGS = """app.get('/api/partner/bookings', authenticateToken, async (req, res) => {
  try {
    const { partnerId } = req.user;
    const result = await pool.query(
      'SELECT * FROM partner_bookings WHERE partner_id = $1 ORDER BY date DESC, time_from DESC, created_at DESC',
      [partnerId]
    );
    res.json({ bookings: result.rows.map(mapBookingRow) });
  } catch (err) {
    console.error('GET /api/partner/bookings', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});"""

NEW_GET_BOOKINGS = """app.get('/api/partner/bookings', authenticateToken, async (req, res) => {
  try {
    const { partnerId, role, staffId } = req.user;
    let result;
    if (role === 'manager' && staffId != null) {
      result = await pool.query(
        `SELECT pb.*
         FROM partner_bookings pb
         LEFT JOIN partner_venues pv ON pv.id = pb.venue_id
         WHERE pb.partner_id = $1
           AND (
             pb.venue_id IN (
               SELECT id FROM partner_venues
               WHERE partner_id = $1 AND managed_by_staff_id = $2
             )
             OR (
               pb.venue_id IS NULL
               AND EXISTS (
                 SELECT 1 FROM partner_venues pv2
                 WHERE pv2.partner_id = $1
                   AND pv2.managed_by_staff_id = $2
                   AND pv2.name = pb.venue_name
               )
             )
           )
         ORDER BY pb.date DESC, pb.time_from DESC, pb.created_at DESC`,
        [partnerId, staffId],
      );
    } else {
      result = await pool.query(
        'SELECT * FROM partner_bookings WHERE partner_id = $1 ORDER BY date DESC, time_from DESC, created_at DESC',
        [partnerId],
      );
    }
    res.json({ bookings: result.rows.map(mapBookingRow) });
  } catch (err) {
    console.error('GET /api/partner/bookings', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});"""

if "role === 'manager' && staffId != null" in text and 'FROM partner_bookings pb' in text:
    print('GET bookings already scoped')
elif OLD_GET_BOOKINGS in text:
    text = text.replace(OLD_GET_BOOKINGS, NEW_GET_BOOKINGS, 1)
    print('GET bookings manager scope')
else:
    raise SystemExit('GET /partner/bookings block not found')

# ── 4) PATCH booking status — manager can only touch own venues
OLD_PATCH_GUARD = """    const current = currentResult.rows[0];
    const allowed = BOOKING_TRANSITIONS[current.status] || [];"""

NEW_PATCH_GUARD = """    const current = currentResult.rows[0];
    if (role === 'manager' && staffId != null) {
      let allowedVenue = false;
      if (current.venue_id != null) {
        const own = await client.query(
          'SELECT 1 FROM partner_venues WHERE id = $1 AND partner_id = $2 AND managed_by_staff_id = $3',
          [current.venue_id, partnerId, staffId],
        );
        allowedVenue = own.rows.length > 0;
      } else {
        const own = await client.query(
          'SELECT 1 FROM partner_venues WHERE partner_id = $1 AND managed_by_staff_id = $2 AND name = $3',
          [partnerId, staffId, current.venue_name],
        );
        allowedVenue = own.rows.length > 0;
      }
      if (!allowedVenue) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(403).json({ error: 'Нет доступа к этой брони' });
      }
    }
    const allowed = BOOKING_TRANSITIONS[current.status] || [];"""

if 'Нет доступа к этой брони' in text:
    print('PATCH booking guard already present')
elif OLD_PATCH_GUARD in text:
    text = text.replace(OLD_PATCH_GUARD, NEW_PATCH_GUARD, 1)
    print('PATCH booking manager guard')
else:
    print('WARN: PATCH booking guard not applied')

# Ensure migration runs once at boot (idempotent)
MIGRATE = """
async function ensurePartnerBookingVenueId() {
  try {
    await pool.query('ALTER TABLE partner_bookings ADD COLUMN IF NOT EXISTS venue_id INTEGER');
    await pool.query(`
      UPDATE partner_bookings pb
      SET venue_id = pv.id
      FROM partner_venues pv
      WHERE pb.venue_id IS NULL
        AND pb.partner_id = pv.partner_id
        AND pb.venue_name = pv.name
    `);
  } catch (e) {
    console.error('ensurePartnerBookingVenueId', e.message);
  }
}
ensurePartnerBookingVenueId();
"""

if 'ensurePartnerBookingVenueId' not in text:
    if 'registerYookassaRoutes(app, pool' in text:
        text = text.replace(
            'registerYookassaRoutes(app, pool, { authenticateToken });',
            MIGRATE + '\nregisterYookassaRoutes(app, pool, { authenticateToken });',
            1,
        )
    elif 'app.listen(PORT' in text:
        text = text.replace('app.listen(PORT', MIGRATE + '\napp.listen(PORT', 1)
    else:
        raise SystemExit('cannot inject venue_id migration')
    print('added venue_id migration')
else:
    print('venue_id migration already present')

INDEX.write_text(text)
print('index.js patched')

# ── 5) partnerVenues.js — filter list for manager + owner assign ─
if VENUES.exists():
    v = VENUES.read_text()

    # Filter GET list for manager
    OLD_V_LIST = """      const venuesRes = await pool.query(
        'SELECT * FROM partner_venues WHERE partner_id = $1 ORDER BY created_at DESC',
        [partnerId],
      );"""
    # may already use requirePartner — try common patterns
    if 'managed_by_staff_id = $2' in v and 'GET manager venues filter' in v:
        print('venues list already filtered')
    else:
        # Broader replace for list query
        pattern = re.compile(
            r"const venuesRes = await pool\.query\(\s*'SELECT \* FROM partner_venues WHERE partner_id = \$1[^']*',\s*\[partnerId\],\s*\);",
            re.M,
        )
        NEW_V_LIST = """const { role, staffId } = req.user;
      let venuesRes;
      if (role === 'manager' && staffId != null) {
        // GET manager venues filter
        venuesRes = await pool.query(
          'SELECT * FROM partner_venues WHERE partner_id = $1 AND managed_by_staff_id = $2 ORDER BY created_at DESC',
          [partnerId, staffId],
        );
      } else {
        venuesRes = await pool.query(
          'SELECT * FROM partner_venues WHERE partner_id = $1 ORDER BY created_at DESC',
          [partnerId],
        );
      }"""
        if pattern.search(v):
            v = pattern.sub(NEW_V_LIST, v, count=1)
            print('venues GET filtered for manager')
        else:
            print('WARN: venues list query not found')

    # Owner can PATCH managedByStaffId
    if 'managedByStaffId' in v and 'owner assign manager' in v:
        print('owner assign already present')
    else:
        # Inject into PATCH handler after reading body — look for is_active update path
        ASSIGN_SNIPPET = """
      // owner assign manager
      if (req.user.role === 'owner' && Object.prototype.hasOwnProperty.call(req.body || {}, 'managedByStaffId')) {
        const rawMgr = req.body.managedByStaffId;
        let mid = null;
        if (rawMgr != null && rawMgr !== '') {
          mid = parseInt(rawMgr, 10);
          if (!Number.isFinite(mid)) {
            return res.status(400).json({ error: 'Неверный managedByStaffId' });
          }
          const st = await pool.query(
            'SELECT id FROM partner_staff WHERE id = $1 AND partner_id = $2 AND is_active = true',
            [mid, partnerId],
          );
          if (!st.rows.length) {
            return res.status(404).json({ error: 'Сотрудник не найден' });
          }
        }
        await pool.query(
          'UPDATE partner_venues SET managed_by_staff_id = $1 WHERE id = $2 AND partner_id = $3',
          [mid, venueId, partnerId],
        );
      }
"""
        # Insert before final enrich/response in PATCH — find a stable anchor
        anchor = "const updated = await pool.query(\n        'SELECT * FROM partner_venues WHERE id = $1 AND partner_id = $2'"
        # Try alternate: after ownership check in patch
        if 'app.patch' in v and "managedByStaffId" not in v:
            # Find patch function and inject near start after venueId parse
            m = re.search(
                r"(app\.patch\('/api/partner/venues/:id', authenticateToken, requirePartner, async \(req, res\) => \{\s*try \{)",
                v,
            )
            if not m:
                m = re.search(
                    r"(app\.patch\('/api/partner/venues/:id',[^\n]+async \(req, res\) => \{\s*try \{)",
                    v,
                )
            if m:
                # We'll add assign block just before COMMIT-like final fetch — simpler: after const partnerId
                insert_at = m.end()
                # Find partnerId line after
                rest = v[insert_at:]
                pm = re.search(r"const \{ partnerId[^}]*\} = req\.user;", rest)
                if pm:
                    pos = insert_at + pm.end()
                    # Actually inject before response at end of successful path is hard.
                    # Inject right after ownership checks by replacing a known update block.
                    pass

            # Simpler dedicated route
            if "app.patch('/api/partner/venues/:id/manager'" not in v:
                register_anchor = "export function registerPartnerVenueRoutes"
                # append route before closing of register function — find last app.delete or end
                route = """
  app.patch('/api/partner/venues/:id/manager', authenticateToken, requireOwner, async (req, res) => {
    try {
      const { partnerId } = req.user;
      const venueId = parseInt(req.params.id, 10);
      if (!Number.isFinite(venueId)) return res.status(400).json({ error: 'Неверный id' });
      const rawMgr = req.body?.managedByStaffId;
      let mid = null;
      if (rawMgr != null && rawMgr !== '') {
        mid = parseInt(rawMgr, 10);
        if (!Number.isFinite(mid)) return res.status(400).json({ error: 'Неверный managedByStaffId' });
        const st = await pool.query(
          'SELECT id, name FROM partner_staff WHERE id = $1 AND partner_id = $2 AND is_active = true',
          [mid, partnerId],
        );
        if (!st.rows.length) return res.status(404).json({ error: 'Сотрудник не найден' });
      }
      const upd = await pool.query(
        'UPDATE partner_venues SET managed_by_staff_id = $1 WHERE id = $2 AND partner_id = $3 RETURNING *',
        [mid, venueId, partnerId],
      );
      if (!upd.rows.length) return res.status(404).json({ error: 'Площадка не найдена' });
      const venue = await enrichVenueForViewer(pool, upd.rows[0], partnerId, req.user);
      res.json({ venue });
    } catch (err) {
      console.error('PATCH /api/partner/venues/:id/manager', err);
      res.status(500).json({ error: 'Не удалось назначить менеджера' });
    }
  });
"""
                # Insert before closing brace of export function — last occurrence of lone }
                # Find registerPartnerVenueRoutes body end by matching last app. in file then add before final }
                if "registerPartnerVenueRoutes" in v:
                    # append before the final export closing - find last `}` of file that closes function
                    idx = v.rfind('\n}')
                    if idx > 0:
                        v = v[:idx] + route + v[idx:]
                        print('added PATCH venues/:id/manager')
                    else:
                        print('WARN: could not append manager route')
                else:
                    print('WARN: registerPartnerVenueRoutes not found')
        else:
            print('manager assign route skip')

    VENUES.write_text(v)
    print('partnerVenues.js updated')
else:
    print('WARN: partnerVenues.js missing')

# ── 6) promotions list filter for manager ─────────────────
if PROMOS.exists():
    p = PROMOS.read_text()
    if 'GET manager promos filter' in p:
        print('promos already filtered')
    else:
        # common pattern: select all partner promotions
        old = None
        for candidate in [
            """      const result = await pool.query(
        `SELECT p.*, v.name AS venue_name
         FROM partner_venue_promotions p
         JOIN partner_venues v ON v.id = p.venue_id
         WHERE v.partner_id = $1
         ORDER BY p.created_at DESC`,
        [partnerId],
      );""",
            """      const result = await pool.query(
        `SELECT p.*, v.name AS venue_name
         FROM partner_promotions p
         JOIN partner_venues v ON v.id = p.venue_id
         WHERE v.partner_id = $1
         ORDER BY p.created_at DESC`,
        [partnerId],
      );""",
        ]:
            if candidate in p:
                old = candidate
                break
        if old:
            # detect table name from old
            table = 'partner_venue_promotions' if 'partner_venue_promotions' in old else 'partner_promotions'
            new = f"""      const {{ role, staffId }} = req.user;
      let result;
      if (role === 'manager' && staffId != null) {{
        // GET manager promos filter
        result = await pool.query(
          `SELECT p.*, v.name AS venue_name
           FROM {table} p
           JOIN partner_venues v ON v.id = p.venue_id
           WHERE v.partner_id = $1 AND v.managed_by_staff_id = $2
           ORDER BY p.created_at DESC`,
          [partnerId, staffId],
        );
      }} else {{
        result = await pool.query(
          `SELECT p.*, v.name AS venue_name
           FROM {table} p
           JOIN partner_venues v ON v.id = p.venue_id
           WHERE v.partner_id = $1
           ORDER BY p.created_at DESC`,
          [partnerId],
        );
      }}"""
            p = p.replace(old, new, 1)
            PROMOS.write_text(p)
            print('promos GET filtered for manager')
        else:
            print('WARN: promos list query not found')
else:
    print('WARN: partnerPromotions.js missing')

print('done')
