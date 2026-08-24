// Client bookings API — вставить в /opt/bookingo-api/src/index.js
// Заменяет блок GET /api/bookings и добавляет POST + PATCH cancel

function addMinutesToTime(timeStr, minutes) {
  const [h, m] = String(timeStr).slice(0, 5).split(':').map(Number)
  const total = h * 60 + m + minutes
  const nh = Math.floor(total / 60) % 24
  const nm = total % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}

function normalizeClientStatus(status) {
  if (status === 'confirmed' || status === 'paid' || status === 'pending') return 'upcoming'
  if (status === 'completed') return 'completed'
  if (status === 'cancelled') return 'cancelled'
  return 'upcoming'
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
  }
}

async function generateUniqueBookingCode(client) {
  for (let i = 0; i < 8; i++) {
    const code = `BG-${Math.floor(100000 + Math.random() * 900000)}`
    const exists = await client.query(
      `SELECT 1 FROM bookings WHERE code = $1
       UNION SELECT 1 FROM partner_bookings WHERE code = $1`,
      [code],
    )
    if (!exists.rows.length) return code
  }
  return `BG-${Date.now().toString().slice(-8)}`
}
