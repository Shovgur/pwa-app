/**
 * Manager → client reviews + risk badge (Stage 3).
 */
import {
  CLIENT_REVIEW_MAX_TEXT,
  CLIENT_REVIEW_PRESETS,
  featureClientReviewsEnabled,
} from './reviewConstants.js'
import { moderateText } from './reviewModeration.js'
import { computeClientRisk } from './clientRisk.js'

function featureOff(res) {
  return res.status(404).json({ error: 'feature_disabled' })
}

function normalizePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    return `7${digits.slice(1)}`
  }
  if (digits.length === 10) return `7${digits}`
  return digits || null
}

function parsePresets(raw) {
  if (!Array.isArray(raw)) return []
  const allowed = new Set(CLIENT_REVIEW_PRESETS)
  return [...new Set(raw.map((t) => String(t)).filter((t) => allowed.has(t)))]
}

async function loadClientReviewHistory(pool, { partnerId, userId, phoneNorm, network = false }) {
  const params = []
  const where = []
  if (!network) {
    params.push(partnerId)
    where.push(`partner_id = $${params.length}`)
  }
  if (userId) {
    params.push(userId)
    where.push(`client_user_id = $${params.length}`)
  } else if (phoneNorm) {
    params.push(phoneNorm)
    where.push(`client_phone_norm = $${params.length}`)
  } else {
    return []
  }
  const result = await pool.query(
    `SELECT rating, presets, created_at
     FROM client_reviews
     WHERE status = 'published' AND ${where.join(' AND ')}
     ORDER BY created_at DESC
     LIMIT 200`,
    params,
  )
  return result.rows.map((r) => ({
    rating: Number(r.rating),
    presets: r.presets || [],
    createdAt: r.created_at,
  }))
}

export function registerClientReviewRoutes(app, pool, { authenticateToken, requirePartner }) {
  app.post('/api/partner/bookings/:id/client-review', authenticateToken, requirePartner, async (req, res) => {
    const client = await pool.connect()
    try {
      if (!featureClientReviewsEnabled()) {
        client.release()
        return featureOff(res)
      }
      const { partnerId, role, staffId } = req.user
      const bookingId = parseInt(req.params.id, 10)
      const rating = parseInt(req.body?.rating, 10)
      const presets = parsePresets(req.body?.presets)
      const text = typeof req.body?.text === 'string' ? req.body.text.trim() : ''

      if (!Number.isFinite(bookingId)) {
        client.release()
        return res.status(400).json({ error: 'Неверный id' })
      }
      if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
        client.release()
        return res.status(400).json({ error: 'Оценка от 1 до 5' })
      }
      if (text.length > CLIENT_REVIEW_MAX_TEXT) {
        client.release()
        return res.status(400).json({ error: `Текст не длиннее ${CLIENT_REVIEW_MAX_TEXT}` })
      }

      const mod = moderateText(text)
      if (mod.verdict === 'reject') {
        client.release()
        return res.status(422).json({ error: 'Текст не прошёл модерацию', flags: mod.flags })
      }

      await client.query('BEGIN')
      const booking = await client.query(
        `SELECT * FROM partner_bookings WHERE id = $1 AND partner_id = $2 FOR UPDATE`,
        [bookingId, partnerId],
      )
      if (!booking.rows.length) {
        await client.query('ROLLBACK')
        client.release()
        return res.status(404).json({ error: 'Бронь не найдена' })
      }
      const pb = booking.rows[0]
      if (pb.status !== 'completed') {
        await client.query('ROLLBACK')
        client.release()
        return res.status(422).json({ error: 'Оценка клиента доступна после «Завершить»' })
      }
      if (pb.completed_at) {
        const deadline = new Date(pb.completed_at).getTime() + 7 * 86400000
        if (Date.now() > deadline) {
          await client.query('ROLLBACK')
          client.release()
          return res.status(422).json({ error: 'Окно отзыва истекло (7 дней)' })
        }
      }

      if (role === 'manager' && staffId != null && pb.venue_id != null) {
        const own = await client.query(
          'SELECT 1 FROM partner_venues WHERE id = $1 AND partner_id = $2 AND managed_by_staff_id = $3',
          [pb.venue_id, partnerId, staffId],
        )
        if (!own.rows.length) {
          await client.query('ROLLBACK')
          client.release()
          return res.status(403).json({ error: 'Нет доступа к этой брони' })
        }
      }

      const exists = await client.query(
        'SELECT id FROM client_reviews WHERE partner_booking_id = $1',
        [bookingId],
      )
      if (exists.rows.length) {
        await client.query('ROLLBACK')
        client.release()
        return res.status(409).json({ error: 'Отзыв о клиенте уже оставлен' })
      }

      const phoneNorm = normalizePhone(pb.customer_phone)
      if (!pb.user_id && !phoneNorm) {
        await client.query('ROLLBACK')
        client.release()
        return res.status(422).json({ error: 'Нет user_id и телефона клиента' })
      }

      const inserted = await client.query(
        `INSERT INTO client_reviews (
           partner_booking_id, partner_id, venue_id, author_staff_id,
           client_user_id, client_phone_norm, rating, presets, body, status
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'published')
         RETURNING id, created_at`,
        [
          bookingId,
          partnerId,
          pb.venue_id,
          role === 'manager' ? staffId : null,
          pb.user_id || null,
          phoneNorm,
          rating,
          presets,
          text,
        ],
      )

      await client.query('COMMIT')
      client.release()
      res.status(201).json({
        review: {
          id: String(inserted.rows[0].id),
          rating,
          presets,
          text,
          createdAt: inserted.rows[0].created_at,
        },
      })
    } catch (err) {
      try { await client.query('ROLLBACK') } catch { /* ignore */ }
      client.release()
      console.error('POST /api/partner/bookings/:id/client-review', err)
      res.status(500).json({ error: 'Не удалось сохранить отзыв' })
    }
  })

  app.get('/api/partner/bookings/:id/client-review', authenticateToken, requirePartner, async (req, res) => {
    try {
      if (!featureClientReviewsEnabled()) return featureOff(res)
      const { partnerId } = req.user
      const bookingId = parseInt(req.params.id, 10)
      const result = await pool.query(
        `SELECT id, rating, presets, body, created_at
         FROM client_reviews
         WHERE partner_booking_id = $1 AND partner_id = $2`,
        [bookingId, partnerId],
      )
      if (!result.rows.length) return res.json({ review: null })
      const r = result.rows[0]
      res.json({
        review: {
          id: String(r.id),
          rating: Number(r.rating),
          presets: r.presets || [],
          text: r.body || '',
          createdAt: r.created_at,
        },
      })
    } catch (err) {
      console.error('GET client-review', err)
      res.status(500).json({ error: 'Ошибка сервера' })
    }
  })

  /** Risk for a booking's client (same partner history + network warning boolean). */
  app.get('/api/partner/bookings/:id/client-risk', authenticateToken, requirePartner, async (req, res) => {
    try {
      if (!featureClientReviewsEnabled()) return featureOff(res)
      const { partnerId } = req.user
      const bookingId = parseInt(req.params.id, 10)
      const booking = await pool.query(
        'SELECT user_id, customer_phone FROM partner_bookings WHERE id = $1 AND partner_id = $2',
        [bookingId, partnerId],
      )
      if (!booking.rows.length) return res.status(404).json({ error: 'Бронь не найдена' })
      const pb = booking.rows[0]
      const phoneNorm = normalizePhone(pb.customer_phone)

      const own = await loadClientReviewHistory(pool, {
        partnerId,
        userId: pb.user_id,
        phoneNorm,
        network: false,
      })
      const network = await loadClientReviewHistory(pool, {
        partnerId,
        userId: pb.user_id,
        phoneNorm,
        network: true,
      })

      const ownRisk = computeClientRisk(own)
      const netRisk = computeClientRisk(network)
      res.json({
        clientRisk: {
          warning: ownRisk.warning || netRisk.warning,
          reasons: ownRisk.reasons,
          networkWarning: netRisk.warning && !ownRisk.warning,
        },
      })
    } catch (err) {
      console.error('GET client-risk', err)
      res.status(500).json({ error: 'Ошибка сервера' })
    }
  })
}

export { computeClientRisk, normalizePhone }
