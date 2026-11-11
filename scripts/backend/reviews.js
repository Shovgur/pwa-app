/**
 * Venue reviews API (Stage 1). Client→venue only; manager replies in Stage 2.
 * Feature flags: FEATURE_VENUE_REVIEWS / FEATURE_CLIENT_REVIEWS
 */
import {
  REVIEW_WINDOW_DAYS,
  VENUE_REVIEW_MAX_TEXT,
  VENUE_REVIEW_TAGS,
  featureVenueReviewsEnabled,
} from './reviewConstants.js'
import { moderateText, statusFromModeration } from './reviewModeration.js'

function featureOff(res) {
  return res.status(404).json({ error: 'feature_disabled' })
}

function parseTags(raw) {
  if (!Array.isArray(raw)) return []
  const allowed = new Set(VENUE_REVIEW_TAGS)
  return [...new Set(raw.map((t) => String(t)).filter((t) => allowed.has(t)))]
}

/** Slot end = date + time_to in Europe/Moscow → Date */
export function computeSlotEnd(dateVal, timeTo) {
  const dateStr = dateVal instanceof Date
    ? dateVal.toISOString().slice(0, 10)
    : String(dateVal).slice(0, 10)
  const timeStr = String(timeTo || '00:00').slice(0, 5)
  // Interpret as Moscow local
  return new Date(`${dateStr}T${timeStr}:00+03:00`)
}

export function isWithinReviewWindow(slotEnd, now = new Date(), windowDays = REVIEW_WINDOW_DAYS) {
  if (!(slotEnd instanceof Date) || Number.isNaN(slotEnd.getTime())) return false
  const start = slotEnd.getTime()
  const end = start + windowDays * 24 * 60 * 60 * 1000
  const t = now.getTime()
  return t >= start && t <= end
}

async function recomputeVenueRating(client, venueId) {
  const agg = await client.query(
    `SELECT COALESCE(AVG(rating), 0)::numeric(3,2) AS avg,
            COUNT(*)::int AS cnt
     FROM venue_reviews
     WHERE venue_id = $1 AND status = 'published'`,
    [venueId],
  )
  const avg = Number(agg.rows[0].avg) || 0
  const cnt = Number(agg.rows[0].cnt) || 0
  await client.query(
    `UPDATE partner_venues
     SET rating_avg = $2, rating_count = $3
     WHERE id = $1`,
    [venueId, cnt > 0 ? avg : null, cnt],
  )
  return { ratingAvg: cnt > 0 ? avg : null, ratingCount: cnt }
}

function mapPublicReview(row) {
  const name = row.author_name || 'Гость'
  const parts = String(name).trim().split(/\s+/)
  const displayName = parts.length >= 2
    ? `${parts[0]} ${parts[1][0]}.`
    : parts[0] || 'Гость'
  return {
    id: String(row.id),
    rating: Number(row.rating),
    tags: Array.isArray(row.tags) ? row.tags : [],
    text: row.body || '',
    createdAt: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : row.created_at,
    authorDisplayName: displayName,
    reply: row.reply_body
      ? {
          text: row.reply_body,
          createdAt: row.reply_created_at instanceof Date
            ? row.reply_created_at.toISOString()
            : row.reply_created_at,
        }
      : null,
  }
}

export function registerReviewRoutes(app, pool, { authenticateToken, requirePartner }) {
  // ── Public venue reviews ──────────────────────────────────────────
  app.get('/api/venues/:id/reviews', async (req, res) => {
    try {
      if (!featureVenueReviewsEnabled()) return featureOff(res)
      const venueId = parseInt(req.params.id, 10)
      if (!Number.isFinite(venueId)) return res.status(400).json({ error: 'Неверный id' })

      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20))
      const cursor = req.query.cursor ? parseInt(req.query.cursor, 10) : null

      const params = [venueId]
      let cursorSql = ''
      if (Number.isFinite(cursor)) {
        params.push(cursor)
        cursorSql = `AND r.id < $${params.length}`
      }
      params.push(limit)

      const result = await pool.query(
        `SELECT r.*, u.name AS author_name,
                reply.body AS reply_body, reply.created_at AS reply_created_at
         FROM venue_reviews r
         JOIN users u ON u.id = r.user_id
         LEFT JOIN venue_review_replies reply
           ON reply.review_id = r.id AND reply.status = 'published'
         WHERE r.venue_id = $1 AND r.status = 'published'
         ${cursorSql}
         ORDER BY r.created_at DESC, r.id DESC
         LIMIT $${params.length}`,
        params,
      )

      const reviews = result.rows.map(mapPublicReview)
      const nextCursor = reviews.length === limit
        ? String(result.rows[result.rows.length - 1].id)
        : null
      res.json({ reviews, nextCursor })
    } catch (err) {
      console.error('GET /api/venues/:id/reviews', err)
      res.status(500).json({ error: 'Ошибка сервера' })
    }
  })

  app.get('/api/venues/:id/reviews/summary', async (req, res) => {
    try {
      if (!featureVenueReviewsEnabled()) return featureOff(res)
      const venueId = parseInt(req.params.id, 10)
      if (!Number.isFinite(venueId)) return res.status(400).json({ error: 'Неверный id' })

      const result = await pool.query(
        `SELECT rating_avg, rating_count FROM partner_venues WHERE id = $1 AND is_active = true`,
        [venueId],
      )
      if (!result.rows.length) return res.status(404).json({ error: 'Площадка не найдена' })
      const row = result.rows[0]
      const count = Number(row.rating_count) || 0
      res.json({
        ratingAvg: count > 0 && row.rating_avg != null ? Number(row.rating_avg) : null,
        ratingCount: count,
      })
    } catch (err) {
      console.error('GET /api/venues/:id/reviews/summary', err)
      res.status(500).json({ error: 'Ошибка сервера' })
    }
  })

  // ── Client: pending reviews ───────────────────────────────────────
  app.get('/api/me/reviews/pending', authenticateToken, async (req, res) => {
    try {
      if (!featureVenueReviewsEnabled()) return featureOff(res)
      const { userId } = req.user

      const result = await pool.query(
        `SELECT pb.id, pb.code, pb.venue_id, pb.venue_name, pb.date, pb.time_to,
                pb.status, pb.user_id
         FROM partner_bookings pb
         LEFT JOIN venue_reviews vr ON vr.partner_booking_id = pb.id
         WHERE pb.user_id = $1
           AND pb.status IN ('paid', 'completed')
           AND vr.id IS NULL
           AND pb.venue_id IS NOT NULL
         ORDER BY pb.date DESC, pb.time_to DESC
         LIMIT 50`,
        [userId],
      )

      const now = new Date()
      const pending = []
      for (const row of result.rows) {
        const slotEnd = computeSlotEnd(row.date, row.time_to)
        if (!isWithinReviewWindow(slotEnd, now)) continue
        const deadline = new Date(slotEnd.getTime() + REVIEW_WINDOW_DAYS * 86400000)
        pending.push({
          partnerBookingId: String(row.id),
          code: row.code,
          venueId: String(row.venue_id),
          venueName: row.venue_name,
          slotEnd: slotEnd.toISOString(),
          deadline: deadline.toISOString(),
        })
      }
      res.json({ pending })
    } catch (err) {
      console.error('GET /api/me/reviews/pending', err)
      res.status(500).json({ error: 'Ошибка сервера' })
    }
  })

  // ── Client: create venue review (by partner booking id) ───────────
  app.post('/api/bookings/:id/review', authenticateToken, async (req, res) => {
    const client = await pool.connect()
    try {
      if (!featureVenueReviewsEnabled()) {
        client.release()
        return featureOff(res)
      }

      const { userId } = req.user
      const bookingId = parseInt(req.params.id, 10)
      if (!Number.isFinite(bookingId)) {
        client.release()
        return res.status(400).json({ error: 'Неверный id' })
      }

      const rating = parseInt(req.body?.rating, 10)
      if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
        client.release()
        return res.status(400).json({ error: 'Оценка от 1 до 5' })
      }
      const tags = parseTags(req.body?.tags)
      const text = typeof req.body?.text === 'string' ? req.body.text.trim() : ''
      if (text.length > VENUE_REVIEW_MAX_TEXT) {
        client.release()
        return res.status(400).json({ error: `Текст не длиннее ${VENUE_REVIEW_MAX_TEXT} символов` })
      }

      await client.query('BEGIN')

      const booking = await client.query(
        `SELECT * FROM partner_bookings WHERE id = $1 FOR UPDATE`,
        [bookingId],
      )
      if (!booking.rows.length) {
        await client.query('ROLLBACK')
        client.release()
        return res.status(404).json({ error: 'Бронь не найдена' })
      }
      const pb = booking.rows[0]
      if (Number(pb.user_id) !== Number(userId)) {
        await client.query('ROLLBACK')
        client.release()
        return res.status(403).json({ error: 'Нет доступа к этой брони' })
      }
      if (!['paid', 'completed'].includes(pb.status)) {
        await client.query('ROLLBACK')
        client.release()
        return res.status(422).json({ error: 'Отзыв доступен после визита' })
      }
      if (!pb.venue_id) {
        await client.query('ROLLBACK')
        client.release()
        return res.status(422).json({ error: 'У брони нет площадки' })
      }

      const slotEnd = computeSlotEnd(pb.date, pb.time_to)
      if (!isWithinReviewWindow(slotEnd)) {
        await client.query('ROLLBACK')
        client.release()
        return res.status(422).json({ error: 'Окно отзыва истекло (7 дней)' })
      }

      const existing = await client.query(
        'SELECT id FROM venue_reviews WHERE partner_booking_id = $1',
        [bookingId],
      )
      if (existing.rows.length) {
        await client.query('ROLLBACK')
        client.release()
        return res.status(409).json({ error: 'Отзыв уже оставлен' })
      }

      const mod = moderateText(text)
      const status = statusFromModeration(mod.verdict)
      if (status === 'rejected') {
        await client.query('ROLLBACK')
        client.release()
        return res.status(422).json({ error: 'Текст не прошёл модерацию', flags: mod.flags })
      }

      const inserted = await client.query(
        `INSERT INTO venue_reviews (
           partner_booking_id, booking_code, venue_id, partner_id, user_id,
           rating, tags, body, status, moderation_flags, moderated_at, slot_end
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12)
         RETURNING *`,
        [
          bookingId,
          pb.code || null,
          pb.venue_id,
          pb.partner_id,
          userId,
          rating,
          tags,
          text,
          status,
          JSON.stringify(mod.flags),
          status === 'published' ? new Date() : null,
          slotEnd.toISOString(),
        ],
      )

      await client.query(
        `INSERT INTO review_moderation_log (review_type, review_id, action, flags, actor)
         VALUES ('venue', $1, $2, $3::jsonb, $4)`,
        [
          inserted.rows[0].id,
          `create:${mod.verdict}`,
          JSON.stringify(mod.flags),
          `user:${userId}`,
        ],
      )

      let summary = { ratingAvg: null, ratingCount: 0 }
      if (status === 'published') {
        summary = await recomputeVenueRating(client, pb.venue_id)
      }

      await client.query('COMMIT')
      client.release()
      res.status(201).json({
        review: {
          id: String(inserted.rows[0].id),
          status,
          rating,
          tags,
          text,
        },
        summary,
      })
    } catch (err) {
      try { await client.query('ROLLBACK') } catch { /* ignore */ }
      client.release()
      console.error('POST /api/bookings/:id/review', err)
      res.status(500).json({ error: 'Не удалось сохранить отзыв' })
    }
  })

  // ── Soft-delete own review (hide) ─────────────────────────────────
  app.delete('/api/me/reviews/:id', authenticateToken, async (req, res) => {
    const client = await pool.connect()
    try {
      if (!featureVenueReviewsEnabled()) {
        client.release()
        return featureOff(res)
      }
      const { userId } = req.user
      const reviewId = parseInt(req.params.id, 10)
      if (!Number.isFinite(reviewId)) {
        client.release()
        return res.status(400).json({ error: 'Неверный id' })
      }

      await client.query('BEGIN')
      const cur = await client.query(
        'SELECT * FROM venue_reviews WHERE id = $1 AND user_id = $2 FOR UPDATE',
        [reviewId, userId],
      )
      if (!cur.rows.length) {
        await client.query('ROLLBACK')
        client.release()
        return res.status(404).json({ error: 'Отзыв не найден' })
      }
      await client.query(
        `UPDATE venue_reviews SET status = 'hidden', updated_at = NOW() WHERE id = $1`,
        [reviewId],
      )
      const summary = await recomputeVenueRating(client, cur.rows[0].venue_id)
      await client.query('COMMIT')
      client.release()
      res.json({ ok: true, summary })
    } catch (err) {
      try { await client.query('ROLLBACK') } catch { /* ignore */ }
      client.release()
      console.error('DELETE /api/me/reviews/:id', err)
      res.status(500).json({ error: 'Не удалось удалить отзыв' })
    }
  })

  // ── Admin moderation queue (header X-Reviews-Admin-Key) ───────────
  function requireReviewsAdmin(req, res) {
    const key = process.env.REVIEWS_ADMIN_KEY
    if (!key || req.get('X-Reviews-Admin-Key') !== key) {
      res.status(401).json({ error: 'Unauthorized' })
      return false
    }
    return true
  }

  app.get('/api/admin/reviews/queue', async (req, res) => {
    try {
      if (!featureVenueReviewsEnabled()) return featureOff(res)
      if (!requireReviewsAdmin(req, res)) return
      const result = await pool.query(
        `SELECT id, venue_id, partner_id, user_id, rating, tags, body, moderation_flags, created_at
         FROM venue_reviews WHERE status = 'pending'
         ORDER BY created_at ASC LIMIT 100`,
      )
      res.json({
        reviews: result.rows.map((r) => ({
          id: String(r.id),
          venueId: String(r.venue_id),
          rating: Number(r.rating),
          tags: r.tags || [],
          text: r.body || '',
          flags: r.moderation_flags,
          createdAt: r.created_at,
        })),
      })
    } catch (err) {
      console.error('GET /api/admin/reviews/queue', err)
      res.status(500).json({ error: 'Ошибка сервера' })
    }
  })

  app.patch('/api/admin/reviews/:id', async (req, res) => {
    const client = await pool.connect()
    try {
      if (!featureVenueReviewsEnabled()) {
        client.release()
        return featureOff(res)
      }
      if (!requireReviewsAdmin(req, res)) {
        client.release()
        return
      }
      const reviewId = parseInt(req.params.id, 10)
      const next = req.body?.status
      if (!['published', 'rejected', 'hidden'].includes(next)) {
        client.release()
        return res.status(400).json({ error: 'status: published|rejected|hidden' })
      }
      await client.query('BEGIN')
      const cur = await client.query(
        'SELECT * FROM venue_reviews WHERE id = $1 FOR UPDATE',
        [reviewId],
      )
      if (!cur.rows.length) {
        await client.query('ROLLBACK')
        client.release()
        return res.status(404).json({ error: 'Не найдено' })
      }
      await client.query(
        `UPDATE venue_reviews
         SET status = $2, moderated_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [reviewId, next],
      )
      await client.query(
        `INSERT INTO review_moderation_log (review_type, review_id, action, flags, actor)
         VALUES ('venue', $1, $2, '[]'::jsonb, 'admin')`,
        [reviewId, `admin:${next}`],
      )
      const summary = await recomputeVenueRating(client, cur.rows[0].venue_id)
      await client.query('COMMIT')
      client.release()
      res.json({ ok: true, summary })
    } catch (err) {
      try { await client.query('ROLLBACK') } catch { /* ignore */ }
      client.release()
      console.error('PATCH /api/admin/reviews/:id', err)
      res.status(500).json({ error: 'Ошибка сервера' })
    }
  })

  // Placeholder so requirePartner is referenced (partner routes in Stage 2)
  void requirePartner
}

export const __test = {
  computeSlotEnd,
  isWithinReviewWindow,
  recomputeVenueRating,
}
