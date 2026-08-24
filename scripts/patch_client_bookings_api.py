#!/usr/bin/env python3
"""Patch /opt/bookingo-api/src/index.js — client bookings API."""

from pathlib import Path

INDEX = Path('/opt/bookingo-api/src/index.js')
text = INDEX.read_text()

HELPERS = '''
function addMinutesToTime(timeStr, minutes) {
  const [h, m] = String(timeStr).slice(0, 5).split(':').map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

function normalizeClientStatus(status) {
  if (status === 'confirmed' || status === 'paid' || status === 'pending') return 'upcoming';
  if (status === 'completed') return 'completed';
  if (status === 'cancelled') return 'cancelled';
  return 'upcoming';
}

function mapClientBookingRow(row) {
  return {
    id: row.id,
    venueRef: row.venue_ref,
    partnerVenueId: row.partner_venue_id,
    venueName: row.venue_name,
    venueKind: row.venue_kind,
    venueSport: row.venue_sport,
    venueAddress: row.venue_address,
    venueEmoji: row.venue_emoji,
    venueColor: row.venue_color,
    date: toDateYMD(row.booking_date),
    time: toTimeHHMM(row.booking_time),
    durationMinutes: row.duration_minutes,
    price: Number(row.price),
    status: normalizeClientStatus(row.status),
    paymentMethod: row.payment_method,
    code: row.code,
    createdAt: toISO(row.created_at),
  };
}

async function generateUniqueBookingCode(client) {
  for (let i = 0; i < 8; i++) {
    const code = `BG-${Math.floor(100000 + Math.random() * 900000)}`;
    const exists = await client.query(
      `SELECT 1 FROM bookings WHERE code = $1
       UNION SELECT 1 FROM partner_bookings WHERE code = $1`,
      [code],
    );
    if (!exists.rows.length) return code;
  }
  return `BG-${Date.now().toString().slice(-8)}`;
}

'''

BOOKINGS_BLOCK = '''// ─── Bookings ─────────────────────────────────────────────────────────────────

app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const result = await pool.query(
      `SELECT id, user_id, partner_venue_id, venue_ref, venue_name, venue_kind, venue_sport,
              venue_address, venue_emoji, venue_color, booking_date, booking_time,
              duration_minutes, price, status, payment_method, code, created_at
       FROM bookings WHERE user_id = $1 ORDER BY booking_date DESC, booking_time DESC`,
      [userId],
    );
    res.json({ bookings: result.rows.map(mapClientBookingRow) });
  } catch (err) {
    console.error('GET /api/bookings', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/bookings', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId } = req.user;
    const {
      venueRef,
      venueName,
      venueKind = 'sport',
      venueSport,
      venueAddress,
      venueEmoji,
      venueColor,
      date,
      time,
      durationMinutes = 60,
      price,
      paymentMethod = 'online',
      guests = 1,
      comment,
      addOns,
    } = req.body;

    if (!venueRef || !venueName || !date || !time || price == null) {
      return res.status(400).json({ error: 'Заполните обязательные поля брони' });
    }

    const userResult = await client.query('SELECT name, phone FROM users WHERE id = $1', [userId]);
    if (!userResult.rows.length) return res.status(404).json({ error: 'User not found' });
    const user = userResult.rows[0];

    let partnerVenueId = null;
    let partnerId = null;
    if (String(venueRef).startsWith('partner:')) {
      partnerVenueId = parseInt(String(venueRef).split(':')[1], 10);
      if (!Number.isFinite(partnerVenueId)) return res.status(400).json({ error: 'Неверная площадка' });
      const pv = await client.query(
        'SELECT id, partner_id, name, venue_kind, is_active FROM partner_venues WHERE id = $1',
        [partnerVenueId],
      );
      if (!pv.rows.length || !pv.rows[0].is_active) {
        return res.status(404).json({ error: 'Площадка не найдена' });
      }
      partnerId = pv.rows[0].partner_id;
    }

    const code = await generateUniqueBookingCode(client);
    const timeTo = addMinutesToTime(time, durationMinutes);
    const partnerStatus = paymentMethod === 'online' ? 'paid' : 'pending';
    const paidAmount = paymentMethod === 'online' ? price : 0;
    const extrasComment = Array.isArray(addOns) && addOns.length
      ? `Доп. услуги: ${addOns.map((a) => a.name).join(', ')}`
      : null;
    const fullComment = [comment, extrasComment].filter(Boolean).join('. ') || null;

    await client.query('BEGIN');

    const bookingResult = await client.query(
      `INSERT INTO bookings (
        user_id, object_id, partner_venue_id, venue_ref, venue_name, venue_kind,
        venue_sport, venue_address, venue_emoji, venue_color, booking_date, booking_time,
        duration_minutes, price, status, payment_method, code
      ) VALUES ($1, NULL, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'upcoming', $14, $15)
      RETURNING *`,
      [
        userId, partnerVenueId, venueRef, venueName, venueKind, venueSport || null,
        venueAddress || null, venueEmoji || null, venueColor || null, date, time,
        durationMinutes, price, paymentMethod, code,
      ],
    );

    if (partnerId) {
      await client.query(
        `INSERT INTO partner_bookings (
          partner_id, code, customer_name, customer_phone, venue_name, venue_kind,
          date, time_from, time_to, guests, amount, paid_amount, payment_method, status, comment
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          partnerId, code, user.name || 'Клиент', user.phone || '', venueName, venueKind,
          date, time, timeTo, guests, price, paidAmount, paymentMethod, partnerStatus, fullComment,
        ],
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ booking: mapClientBookingRow(bookingResult.rows[0]) });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/bookings', err);
    res.status(500).json({ error: 'Не удалось создать бронь' });
  } finally {
    client.release();
  }
});

app.patch('/api/bookings/:id/cancel', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId } = req.user;
    const bookingId = parseInt(req.params.id, 10);
    if (!Number.isFinite(bookingId)) return res.status(400).json({ error: 'Неверный id' });

    await client.query('BEGIN');
    const result = await client.query(
      `UPDATE bookings SET status = 'cancelled'
       WHERE id = $1 AND user_id = $2 AND status != 'cancelled'
       RETURNING *`,
      [bookingId, userId],
    );
    if (!result.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Бронь не найдена' });
    }
    const row = result.rows[0];
    if (row.code) {
      await client.query(
        `UPDATE partner_bookings SET status = 'cancelled'
         WHERE code = $1 AND status != 'cancelled'`,
        [row.code],
      );
    }
    await client.query('COMMIT');
    res.json({ booking: mapClientBookingRow(row) });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('PATCH /api/bookings/:id/cancel', err);
    res.status(500).json({ error: 'Не удалось отменить бронь' });
  } finally {
    client.release();
  }
});

'''

OLD = """// ─── Bookings ─────────────────────────────────────────────────────────────────

app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const result = await pool.query(
      'SELECT b.id, b.booking_date, b.booking_time, b.price, b.status FROM bookings b WHERE b.user_id = $1 ORDER BY b.booking_date DESC',
      [userId]
    );
    res.json({ bookings: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

"""

if 'mapClientBookingRow' not in text:
    anchor = 'function mapStaffRow(row) {'
    if anchor not in text:
        raise SystemExit('anchor not found for helpers')
    text = text.replace(anchor, HELPERS + anchor)

if OLD not in text:
    raise SystemExit('old bookings block not found')

text = text.replace(OLD, BOOKINGS_BLOCK)
INDEX.write_text(text)
print('patched ok')
