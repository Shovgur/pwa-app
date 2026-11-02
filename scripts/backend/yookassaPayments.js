/**
 * ЮKassa (test/live): создание платежа, webhook, статус.
 * Подключается из /opt/bookingo-api/src/index.js
 * Секрет только из env: YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY, YOOKASSA_RETURN_URL
 */

import { randomUUID } from 'crypto'

function yookassaConfigured() {
  return Boolean(process.env.YOOKASSA_SHOP_ID && process.env.YOOKASSA_SECRET_KEY)
}

function authHeader() {
  const raw = `${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`
  return `Basic ${Buffer.from(raw).toString('base64')}`
}

function rubAmount(price) {
  const n = Number(price)
  if (!Number.isFinite(n) || n <= 0) throw new Error('Некорректная сумма')
  return n.toFixed(2)
}

async function yookassaRequest(path, { method = 'GET', body, idempotenceKey } = {}) {
  const headers = {
    Authorization: authHeader(),
    'Content-Type': 'application/json',
  }
  if (idempotenceKey) headers['Idempotence-Key'] = idempotenceKey

  const res = await fetch(`https://api.yookassa.ru/v3${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.description || data?.message || `YooKassa ${res.status}`
    const err = new Error(msg)
    err.status = res.status
    err.payload = data
    throw err
  }
  return data
}

async function ensurePaymentColumns(pool) {
  await pool.query(`
    ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS yookassa_payment_id VARCHAR(64),
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(32) DEFAULT 'none'
  `)
}

function paymentOpen(status) {
  return status === 'pending' || status === 'waiting_for_capture'
}

function amountsMatch(bookingPrice, payment) {
  const expected = rubAmount(bookingPrice)
  const got = payment?.amount?.value
  return got != null && String(got) === expected
}

async function markBookingPaid(pool, { bookingId, code, paymentId, expectedAmount }) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const booking = await client.query(
      `SELECT id, code, price, payment_status, yookassa_payment_id
       FROM bookings WHERE id = $1 FOR UPDATE`,
      [bookingId],
    )
    if (!booking.rows.length) {
      await client.query('ROLLBACK')
      return { ok: false, reason: 'not_found' }
    }
    const row = booking.rows[0]
    const bookingCode = code || row.code

    if (row.payment_status === 'succeeded') {
      await client.query('COMMIT')
      return { ok: true, already: true }
    }

    // Не принимаем чужой paymentId, если у брони уже другой
    if (
      row.yookassa_payment_id
      && paymentId
      && row.yookassa_payment_id !== paymentId
    ) {
      await client.query('ROLLBACK')
      return { ok: false, reason: 'payment_mismatch' }
    }

    if (expectedAmount != null && !amountsMatch(row.price, { amount: { value: expectedAmount } })) {
      await client.query('ROLLBACK')
      return { ok: false, reason: 'amount_mismatch' }
    }

    await client.query(
      `UPDATE bookings
       SET payment_status = 'succeeded',
           yookassa_payment_id = COALESCE(yookassa_payment_id, $2)
       WHERE id = $1`,
      [bookingId, paymentId || null],
    )

    if (bookingCode) {
      await client.query(
        `UPDATE partner_bookings
         SET status = 'paid',
             paid_amount = amount
         WHERE code = $1 AND status != 'cancelled'`,
        [bookingCode],
      )
    }

    await client.query('COMMIT')
    return { ok: true, already: false }
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

async function markBookingPaymentCanceled(pool, { bookingId, paymentId }) {
  await pool.query(
    `UPDATE bookings
     SET payment_status = 'canceled',
         yookassa_payment_id = COALESCE(yookassa_payment_id, $2)
     WHERE id = $1 AND COALESCE(payment_status, 'none') != 'succeeded'`,
    [bookingId, paymentId || null],
  )
}

/** Найти бронь по verified payment (не доверяем metadata из webhook body вслепую). */
async function findBookingForPayment(pool, payment) {
  const paymentId = payment.id
  const byPay = await pool.query(
    'SELECT id, code, price, yookassa_payment_id, payment_status FROM bookings WHERE yookassa_payment_id = $1',
    [paymentId],
  )
  if (byPay.rows.length) return byPay.rows[0]

  const metaId = parseInt(payment.metadata?.bookingId, 10)
  if (!Number.isFinite(metaId)) return null

  const byMeta = await pool.query(
    'SELECT id, code, price, yookassa_payment_id, payment_status FROM bookings WHERE id = $1',
    [metaId],
  )
  const row = byMeta.rows[0]
  if (!row) return null

  // metadata допустим только если payment ещё не привязан к другой брони
  // и сумма совпадает
  if (row.yookassa_payment_id && row.yookassa_payment_id !== paymentId) return null
  if (!amountsMatch(row.price, payment)) return null
  return row
}

async function applyVerifiedPayment(pool, payment) {
  const booking = await findBookingForPayment(pool, payment)
  if (!booking) return { ok: false, reason: 'booking_not_found' }

  if (payment.status === 'succeeded') {
    if (!amountsMatch(booking.price, payment)) {
      return { ok: false, reason: 'amount_mismatch' }
    }
    return markBookingPaid(pool, {
      bookingId: booking.id,
      code: booking.code,
      paymentId: payment.id,
      expectedAmount: payment.amount?.value,
    })
  }

  if (payment.status === 'canceled') {
    await markBookingPaymentCanceled(pool, {
      bookingId: booking.id,
      paymentId: payment.id,
    })
    return { ok: true, canceled: true }
  }

  return { ok: true, ignored: true, status: payment.status }
}

export function registerYookassaRoutes(app, pool, { authenticateToken }) {
  ensurePaymentColumns(pool).catch((err) => {
    console.error('yookassa ensurePaymentColumns', err)
  })

  /** Создать платёж ЮKassa для существующей брони (online, ещё не paid). */
  app.post('/api/payments/yookassa/create', authenticateToken, async (req, res) => {
    try {
      if (!yookassaConfigured()) {
        return res.status(503).json({ error: 'ЮKassa не настроена на сервере' })
      }

      const { userId } = req.user
      const bookingId = parseInt(req.body?.bookingId, 10)
      if (!Number.isFinite(bookingId)) {
        return res.status(400).json({ error: 'Укажите bookingId' })
      }

      const result = await pool.query(
        `SELECT b.*, u.email, u.phone, u.name
         FROM bookings b
         JOIN users u ON u.id = b.user_id
         WHERE b.id = $1 AND b.user_id = $2`,
        [bookingId, userId],
      )
      if (!result.rows.length) return res.status(404).json({ error: 'Бронь не найдена' })
      const booking = result.rows[0]

      if (booking.payment_method !== 'online') {
        return res.status(400).json({ error: 'Оплата картой недоступна для этой брони' })
      }
      if (booking.status === 'cancelled') {
        return res.status(400).json({ error: 'Бронь отменена' })
      }
      if (booking.payment_status === 'succeeded') {
        return res.status(400).json({ error: 'Бронь уже оплачена' })
      }

      // Повторный клик: вернуть уже созданный открытый платёж (без второго charge)
      let forceNewAttempt = false
      if (booking.yookassa_payment_id) {
        try {
          const existing = await yookassaRequest(`/payments/${booking.yookassa_payment_id}`)
          if (existing.status === 'succeeded') {
            await markBookingPaid(pool, {
              bookingId: booking.id,
              code: booking.code,
              paymentId: existing.id,
              expectedAmount: existing.amount?.value,
            })
            return res.status(400).json({ error: 'Бронь уже оплачена' })
          }
          if (paymentOpen(existing.status) && existing.confirmation?.confirmation_url) {
            await pool.query(
              `UPDATE bookings SET payment_status = 'pending', yookassa_payment_id = $2 WHERE id = $1`,
              [booking.id, existing.id],
            )
            return res.json({
              confirmationUrl: existing.confirmation.confirmation_url,
              paymentId: existing.id,
              bookingId: booking.id,
            })
          }
          // canceled / expired — нужна новая попытка с новым Idempotence-Key
          if (existing.status === 'canceled') {
            await markBookingPaymentCanceled(pool, {
              bookingId: booking.id,
              paymentId: existing.id,
            })
          }
          forceNewAttempt = true
        } catch (e) {
          console.error('yookassa reuse pending', e.message)
          forceNewAttempt = true
        }
      }

      const amountValue = rubAmount(booking.price)
      const returnBase = process.env.YOOKASSA_RETURN_URL || 'https://bookingo.ru/booking/payment-result'
      const returnUrl = `${returnBase}?bookingId=${booking.id}`

      const customer = {}
      if (booking.email) customer.email = booking.email
      if (booking.phone) customer.phone = String(booking.phone).replace(/[^\d+]/g, '')

      if (!customer.email && !customer.phone) {
        return res.status(400).json({ error: 'Для чека нужны email или телефон в профиле' })
      }

      const payload = {
        amount: { value: amountValue, currency: 'RUB' },
        capture: true,
        confirmation: { type: 'redirect', return_url: returnUrl },
        description: `Бронирование: ${booking.venue_name || 'площадка'} (${booking.code || booking.id})`,
        metadata: {
          bookingId: String(booking.id),
          userId: String(userId),
          code: booking.code || '',
        },
        receipt: {
          customer,
          items: [
            {
              description: 'Бронирование площадки',
              quantity: '1.00',
              amount: { value: amountValue, currency: 'RUB' },
              vat_code: 1,
              payment_mode: 'full_payment',
              payment_subject: 'service',
            },
          ],
        },
      }

      // Стабильный ключ: первая попытка — `-a1`; после cancel/замены — новый суффикс.
      const attempt = forceNewAttempt || booking.payment_status === 'canceled'
        ? randomUUID().slice(0, 8)
        : '1'
      const idempotenceKey = `bookingo-b${booking.id}-a${attempt}`

      const payment = await yookassaRequest('/payments', {
        method: 'POST',
        body: payload,
        idempotenceKey,
      })

      await pool.query(
        `UPDATE bookings
         SET yookassa_payment_id = $2, payment_status = 'pending'
         WHERE id = $1`,
        [booking.id, payment.id],
      )

      const confirmationUrl = payment?.confirmation?.confirmation_url
      if (!confirmationUrl) {
        return res.status(502).json({ error: 'ЮKassa не вернула ссылку на оплату' })
      }

      res.json({
        confirmationUrl,
        paymentId: payment.id,
        bookingId: booking.id,
      })
    } catch (err) {
      console.error('POST /api/payments/yookassa/create', err?.payload || err)
      res.status(err.status && err.status < 500 ? err.status : 500).json({
        error: err.message || 'Не удалось создать платёж',
      })
    }
  })

  /**
   * HTTP-уведомления ЮKassa.
   * Не доверяем body: всегда GET /payments/{id} с shop-кредами и только потом обновляем бронь.
   */
  app.post('/api/payments/yookassa/webhook', async (req, res) => {
    try {
      const paymentId = req.body?.object?.id
      if (!paymentId || typeof paymentId !== 'string') {
        return res.status(200).json({ ok: true, ignored: true })
      }

      // Без секрета нельзя проверить платёж — не помечаем paid по body
      if (!yookassaConfigured()) {
        console.error('webhook: YOOKASSA_SECRET_KEY not set, ignore', paymentId)
        return res.status(200).json({ ok: true, ignored: true, reason: 'not_configured' })
      }

      let payment
      try {
        payment = await yookassaRequest(`/payments/${paymentId}`)
      } catch (e) {
        console.error('webhook yookassa fetch', e.message)
        // 5xx → ЮKassa повторит; фейковый id даст 404 → 200 ignore
        if (e.status === 404) return res.status(200).json({ ok: true, ignored: true })
        return res.status(500).json({ ok: false })
      }

      await applyVerifiedPayment(pool, payment)
      return res.status(200).json({ ok: true })
    } catch (err) {
      console.error('POST /api/payments/yookassa/webhook', err)
      return res.status(200).json({ ok: false })
    }
  })

  /** Статус платежа для страницы return (если webhook ещё не дошёл). */
  app.get('/api/payments/yookassa/status', authenticateToken, async (req, res) => {
    try {
      const { userId } = req.user
      const bookingId = parseInt(req.query.bookingId, 10)
      const paymentIdQuery = typeof req.query.paymentId === 'string' ? req.query.paymentId : null

      if (!Number.isFinite(bookingId) && !paymentIdQuery) {
        return res.status(400).json({ error: 'Укажите bookingId или paymentId' })
      }

      let booking
      if (Number.isFinite(bookingId)) {
        const r = await pool.query(
          'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
          [bookingId, userId],
        )
        booking = r.rows[0]
      } else {
        const r = await pool.query(
          'SELECT * FROM bookings WHERE yookassa_payment_id = $1 AND user_id = $2',
          [paymentIdQuery, userId],
        )
        booking = r.rows[0]
      }

      if (!booking) return res.status(404).json({ error: 'Бронь не найдена' })

      let paymentStatus = booking.payment_status || 'none'
      const paymentId = booking.yookassa_payment_id || paymentIdQuery

      if (
        paymentId
        && yookassaConfigured()
        && paymentStatus !== 'succeeded'
        && paymentStatus !== 'canceled'
      ) {
        try {
          const payment = await yookassaRequest(`/payments/${paymentId}`)
          await applyVerifiedPayment(pool, payment)
          paymentStatus = payment.status || paymentStatus
          if (payment.status === 'succeeded') paymentStatus = 'succeeded'
          if (payment.status === 'canceled') paymentStatus = 'canceled'
        } catch (e) {
          console.error('yookassa status refresh', e.message)
        }
      }

      res.json({
        bookingId: booking.id,
        code: booking.code,
        paymentId: paymentId || null,
        paymentStatus,
        price: Number(booking.price),
        venueName: booking.venue_name,
      })
    } catch (err) {
      console.error('GET /api/payments/yookassa/status', err)
      res.status(500).json({ error: 'Не удалось получить статус оплаты' })
    }
  })

  app.get('/api/payments/yookassa/webhook', (_req, res) => {
    res.status(200).json({ ok: true, hint: 'Use POST for YooKassa notifications' })
  })
}

export { randomUUID }
