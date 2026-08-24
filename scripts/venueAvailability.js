/** Slot availability from partner schedule + existing bookings. */

export function timeToMinutes(timeStr) {
  const [h, m] = String(timeStr).slice(0, 5).split(':').map(Number);
  return h * 60 + (m || 0);
}

export function minutesToTime(mins) {
  const normalized = ((mins % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function addMinutesToTime(timeStr, minutes) {
  return minutesToTime(timeToMinutes(timeStr) + minutes);
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

export function buildScheduleWindows(timePriceRules, basePrice) {
  if (Array.isArray(timePriceRules) && timePriceRules.length > 0) {
    return timePriceRules
      .map((r) => ({
        from: String(r.timeFrom || r.time_from || '').slice(0, 5),
        to: String(r.timeTo || r.time_to || '').slice(0, 5),
        pricePerHour: Number(r.pricePerHour ?? r.price_per_hour) || Number(basePrice) || 0,
      }))
      .filter((w) => w.from && w.to);
  }
  const price = Number(basePrice) || 0;
  return [{ from: '08:00', to: '22:00', pricePerHour: price }];
}

export function generateCandidateSlots(windows, durationMinutes, stepMinutes = 30) {
  const slots = [];
  const seen = new Set();

  for (const win of windows) {
    let start = timeToMinutes(win.from);
    let end = timeToMinutes(win.to);
    if (end <= start) end += 24 * 60;

    while (start + durationMinutes <= end) {
      const time = minutesToTime(start);
      if (!seen.has(time)) {
        seen.add(time);
        slots.push({ time, pricePerHour: win.pricePerHour });
      }
      start += stepMinutes;
    }
  }

  return slots.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
}

export function occupiedRangesFromBookings(rows) {
  return rows.map((row) => {
    const from = timeToMinutes(row.booking_time || row.time_from);
    const duration = Number(row.duration_minutes) || 60;
    const toMinutes = row.time_to
      ? timeToMinutes(row.time_to)
      : from + duration;
    return { from, to: toMinutes > from ? toMinutes : from + duration };
  });
}

export function filterAvailableSlots(slots, occupiedRanges, durationMinutes) {
  return slots.filter((slot) => {
    const start = timeToMinutes(slot.time);
    const end = start + durationMinutes;
    return !occupiedRanges.some((occ) => rangesOverlap(start, end, occ.from, occ.to));
  });
}

export function filterPastSlots(slots, dateYmd, now = new Date()) {
  const todayYmd = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
  if (dateYmd !== todayYmd) return slots;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return slots.filter((slot) => timeToMinutes(slot.time) >= nowMinutes);
}

export async function loadOccupiedRanges(pool, { partnerVenueId, venueRef, date }) {
  if (partnerVenueId) {
    const result = await pool.query(
      `SELECT booking_time, duration_minutes
       FROM bookings
       WHERE partner_venue_id = $1
         AND booking_date = $2
         AND status NOT IN ('cancelled')`,
      [partnerVenueId, date],
    );
    return occupiedRangesFromBookings(result.rows);
  }

  if (venueRef) {
    const result = await pool.query(
      `SELECT booking_time, duration_minutes
       FROM bookings
       WHERE venue_ref = $1
         AND booking_date = $2
         AND status NOT IN ('cancelled')`,
      [venueRef, date],
    );
    return occupiedRangesFromBookings(result.rows);
  }

  return [];
}

export async function computeVenueAvailability(pool, {
  partnerVenueId,
  venueRef,
  date,
  durationMinutes = 60,
  stepMinutes = 30,
  timePriceRules = [],
  basePrice = 0,
}) {
  const windows = buildScheduleWindows(timePriceRules, basePrice);
  const candidates = generateCandidateSlots(windows, durationMinutes, stepMinutes);
  const occupied = await loadOccupiedRanges(pool, { partnerVenueId, venueRef, date });
  const available = filterPastSlots(
    filterAvailableSlots(candidates, occupied, durationMinutes),
    date,
  );

  return {
    date,
    durationMinutes,
    stepMinutes,
    slots: available.map((slot) => ({
      time: slot.time,
      pricePerHour: slot.pricePerHour,
      available: true,
    })),
  };
}

export async function hasBookingConflict(client, {
  partnerVenueId,
  venueRef,
  date,
  time,
  durationMinutes,
}) {
  const start = timeToMinutes(time);
  const end = start + durationMinutes;
  const occupied = await loadOccupiedRanges(client, { partnerVenueId, venueRef, date });
  return occupied.some((occ) => rangesOverlap(start, end, occ.from, occ.to));
}
