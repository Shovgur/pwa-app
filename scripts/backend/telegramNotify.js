/**
 * Telegram notifications for venue managers (MVP).
 * - Link chat to venue via /start <CODE>
 * - Notify on new partner_bookings insert (pending)
 * Owner is never notified in this MVP.
 */
import crypto from 'crypto';

const CODE_TTL_MS = 30 * 60 * 1000;
let cachedBotUsername = null;

function botToken() {
  return process.env.TELEGRAM_BOT_TOKEN || '';
}

function webhookSecret() {
  return process.env.TELEGRAM_WEBHOOK_SECRET || '';
}

function publicAppUrl() {
  return (process.env.APP_PUBLIC_URL || 'https://bookingo.ru').replace(/\/$/, '');
}

/** Base for Bot API. Use a Cloudflare Worker when VPS cannot reach api.telegram.org. */
function telegramApiBase() {
  return (process.env.TELEGRAM_API_BASE || 'https://api.telegram.org').replace(/\/$/, '');
}

function proxySecret() {
  return process.env.TELEGRAM_PROXY_SECRET || process.env.TELEGRAM_WEBHOOK_SECRET || '';
}

function tgApi(method, body) {
  const token = botToken();
  if (!token) {
    return Promise.reject(new Error('TELEGRAM_BOT_TOKEN is not set'));
  }
  const headers = { 'Content-Type': 'application/json' };
  const secret = proxySecret();
  // Shared secret for our relay worker (optional for direct api.telegram.org)
  if (secret && telegramApiBase() !== 'https://api.telegram.org') {
    headers['X-Telegram-Proxy-Secret'] = secret;
  }
  return fetch(`${telegramApiBase()}/bot${token}/${method}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  }).then(async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      const msg = data.description || `Telegram ${method} failed (${res.status})`;
      const err = new Error(msg);
      err.telegram = data;
      throw err;
    }
    return data.result;
  });
}

async function getBotUsername() {
  if (process.env.TELEGRAM_BOT_USERNAME) return process.env.TELEGRAM_BOT_USERNAME.replace(/^@/, '');
  if (cachedBotUsername) return cachedBotUsername;
  if (!botToken()) return null;
  try {
    const me = await tgApi('getMe', {});
    cachedBotUsername = me.username || null;
    return cachedBotUsername;
  } catch (err) {
    console.error('telegram getMe', err.message || err);
    return null;
  }
}

function makeLinkCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 hex chars
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatRub(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '—';
  return `${Math.round(n).toLocaleString('ru-RU')} ₽`;
}

export async function ensureTelegramTables(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS partner_telegram_links (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
      staff_id INTEGER NOT NULL REFERENCES partner_staff(id) ON DELETE CASCADE,
      venue_id INTEGER NOT NULL REFERENCES partner_venues(id) ON DELETE CASCADE,
      chat_id BIGINT,
      link_code VARCHAR(32),
      link_expires_at TIMESTAMPTZ,
      linked_at TIMESTAMPTZ,
      is_active BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS partner_telegram_links_venue_uidx
      ON partner_telegram_links (venue_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS partner_telegram_links_code_idx
      ON partner_telegram_links (link_code)
      WHERE link_code IS NOT NULL
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS partner_telegram_links_chat_idx
      ON partner_telegram_links (chat_id)
      WHERE chat_id IS NOT NULL
  `);
}

async function assertVenueAccess(pool, { partnerId, role, staffId, venueId, forLink = false }) {
  const venue = await pool.query(
    `SELECT id, partner_id, name, managed_by_staff_id
     FROM partner_venues
     WHERE id = $1 AND partner_id = $2`,
    [venueId, partnerId],
  );
  if (!venue.rows.length) return { error: 'Площадка не найдена', status: 404 };
  const row = venue.rows[0];

  if (role === 'owner') {
    if (forLink) {
      return { error: 'Подключить Telegram может менеджер этой площадки', status: 403 };
    }
    return { venue: row };
  }

  // manager
  if (!staffId) return { error: 'Нет доступа', status: 403 };
  const mid = row.managed_by_staff_id;
  if (mid && Number(mid) !== Number(staffId)) {
    return { error: 'Можно управлять только своей площадкой', status: 403 };
  }
  return { venue: row };
}

function mapLinkStatus(row, botUsername) {
  const linked = Boolean(row.is_active && row.chat_id);
  const pendingCode =
    !linked && row.link_code && row.link_expires_at && new Date(row.link_expires_at) > new Date()
      ? row.link_code
      : null;
  return {
    venueId: String(row.venue_id),
    venueName: row.venue_name || null,
    staffId: row.staff_id != null ? String(row.staff_id) : null,
    linked,
    isActive: Boolean(row.is_active),
    linkedAt: row.linked_at ? new Date(row.linked_at).toISOString() : null,
    pendingCode,
    linkExpiresAt: pendingCode && row.link_expires_at
      ? new Date(row.link_expires_at).toISOString()
      : null,
    botUsername: botUsername || null,
    deepLink: pendingCode && botUsername
      ? `https://t.me/${botUsername}?start=${pendingCode}`
      : null,
  };
}

/**
 * Fire-and-forget notify after partner booking created.
 * Never throws to caller — all errors logged.
 */
export function notifyManagerNewBooking(pool, payload) {
  Promise.resolve()
    .then(() => sendManagerNewBooking(pool, payload))
    .catch((err) => {
      console.error('telegram notifyManagerNewBooking', err && err.message ? err.message : err);
    });
}

async function sendManagerNewBooking(pool, payload) {
  const {
    venueId,
    venueName,
    code,
    customerName,
    customerPhone,
    date,
    timeFrom,
    timeTo,
    amount,
    requestCallback,
  } = payload;

  if (!venueId) {
    console.log('[telegram] skip: no venueId on booking', code);
    return;
  }
  if (!botToken()) {
    console.log('[telegram] skip: TELEGRAM_BOT_TOKEN not set');
    return;
  }

  const linkRes = await pool.query(
    `SELECT l.chat_id, l.staff_id, v.managed_by_staff_id, v.name AS venue_name
     FROM partner_telegram_links l
     JOIN partner_venues v ON v.id = l.venue_id
     WHERE l.venue_id = $1
       AND l.is_active = true
       AND l.chat_id IS NOT NULL`,
    [venueId],
  );

  if (!linkRes.rows.length) {
    console.log('[telegram] skip: no active link for venue', venueId, code);
    return;
  }

  const link = linkRes.rows[0];
  // MVP: only notify if link belongs to the venue's manager (or venue has no manager assigned yet)
  if (
    link.managed_by_staff_id != null &&
    link.staff_id != null &&
    Number(link.managed_by_staff_id) !== Number(link.staff_id)
  ) {
    console.log('[telegram] skip: link staff != venue manager', venueId, code);
    return;
  }

  const crmUrl = `${publicAppUrl()}/partner/bookings?status=pending`;
  const when = `${escapeHtml(date)} · ${escapeHtml(timeFrom)}${timeTo ? '–' + escapeHtml(timeTo) : ''}`;
  const callbackLine = requestCallback
    ? '\n📞 <b>Клиент просит перезвонить</b>'
    : '';

  const text = [
    '🆕 <b>Новая заявка на бронь</b>',
    '',
    `Код: <code>${escapeHtml(code)}</code>`,
    `Площадка: ${escapeHtml(venueName || link.venue_name || '—')}`,
    `Когда: ${when}`,
    `Клиент: ${escapeHtml(customerName || '—')}`,
    `Телефон: ${escapeHtml(customerPhone || '—')}`,
    `Сумма: ${escapeHtml(formatRub(amount))}`,
    callbackLine,
    '',
    `<a href="${crmUrl}">Открыть новые заявки в кабинете</a>`,
  ]
    .filter((line) => line !== '')
    .join('\n');

  await tgApi('sendMessage', {
    chat_id: link.chat_id,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });
  console.log('[telegram] sent new booking to chat', link.chat_id, code);
}

export function registerTelegramRoutes(app, pool, { authenticateToken, requirePartner }) {
  // Partner: list link statuses for accessible venues
  app.get('/api/partner/telegram/links', authenticateToken, requirePartner, async (req, res) => {
    try {
      const { partnerId, role, staffId } = req.user;
      const botUsername = await getBotUsername();

      let sql = `
        SELECT v.id AS venue_id, v.name AS venue_name, v.managed_by_staff_id,
               l.id, l.staff_id, l.chat_id, l.link_code, l.link_expires_at,
               l.linked_at, l.is_active
        FROM partner_venues v
        LEFT JOIN partner_telegram_links l ON l.venue_id = v.id
        WHERE v.partner_id = $1
      `;
      const params = [partnerId];
      if (role !== 'owner') {
        sql += ` AND (v.managed_by_staff_id IS NULL OR v.managed_by_staff_id = $2)`;
        params.push(staffId);
      }
      sql += ' ORDER BY v.name ASC';

      const result = await pool.query(sql, params);
      res.json({
        botUsername: botUsername || null,
        links: result.rows.map((row) => mapLinkStatus(row, botUsername)),
      });
    } catch (err) {
      console.error('GET /api/partner/telegram/links', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  });

  // Partner: create / refresh link code for a venue (manager only)
  app.post('/api/partner/telegram/links', authenticateToken, requirePartner, async (req, res) => {
    try {
      const { partnerId, role, staffId } = req.user;
      const venueId = parseInt(String(req.body?.venueId ?? ''), 10);
      if (!Number.isFinite(venueId)) {
        return res.status(400).json({ error: 'Укажите venueId' });
      }

      const access = await assertVenueAccess(pool, {
        partnerId, role, staffId, venueId, forLink: true,
      });
      if (access.error) return res.status(access.status).json({ error: access.error });

      const code = makeLinkCode();
      const expiresAt = new Date(Date.now() + CODE_TTL_MS);

      const upsert = await pool.query(
        `INSERT INTO partner_telegram_links
           (company_id, staff_id, venue_id, chat_id, link_code, link_expires_at, linked_at, is_active, updated_at)
         VALUES ($1, $2, $3, NULL, $4, $5, NULL, false, NOW())
         ON CONFLICT (venue_id) DO UPDATE SET
           staff_id = EXCLUDED.staff_id,
           chat_id = NULL,
           link_code = EXCLUDED.link_code,
           link_expires_at = EXCLUDED.link_expires_at,
           linked_at = NULL,
           is_active = false,
           updated_at = NOW()
         RETURNING *`,
        [partnerId, staffId, venueId, code, expiresAt],
      );

      const botUsername = await getBotUsername();
      const row = {
        ...upsert.rows[0],
        venue_name: access.venue.name,
      };
      res.json({ link: mapLinkStatus(row, botUsername) });
    } catch (err) {
      console.error('POST /api/partner/telegram/links', err);
      res.status(500).json({ error: 'Не удалось создать код привязки' });
    }
  });

  // Partner: unlink venue telegram
  app.delete('/api/partner/telegram/links/:venueId', authenticateToken, requirePartner, async (req, res) => {
    try {
      const { partnerId, role, staffId } = req.user;
      const venueId = parseInt(String(req.params.venueId), 10);
      if (!Number.isFinite(venueId)) {
        return res.status(400).json({ error: 'Неверный venueId' });
      }

      const access = await assertVenueAccess(pool, {
        partnerId, role, staffId, venueId, forLink: role !== 'owner',
      });
      if (access.error) return res.status(access.status).json({ error: access.error });

      await pool.query(
        `UPDATE partner_telegram_links
         SET is_active = false,
             chat_id = NULL,
             link_code = NULL,
             link_expires_at = NULL,
             linked_at = NULL,
             updated_at = NOW()
         WHERE venue_id = $1 AND company_id = $2`,
        [venueId, partnerId],
      );
      res.json({ success: true });
    } catch (err) {
      console.error('DELETE /api/partner/telegram/links/:venueId', err);
      res.status(500).json({ error: 'Не удалось отвязать Telegram' });
    }
  });

  // Telegram webhook (public)
  app.post('/api/telegram/webhook', async (req, res) => {
    try {
      const secret = webhookSecret();
      if (secret) {
        const header = req.headers['x-telegram-bot-api-secret-token'];
        if (header !== secret) {
          return res.status(401).json({ error: 'Invalid webhook secret' });
        }
      }

      // Always 200 quickly for Telegram
      res.json({ ok: true });

      const message = req.body?.message;
      if (!message || !message.chat) return;

      const chatId = message.chat.id;
      const text = typeof message.text === 'string' ? message.text.trim() : '';

      if (text === '/stop' || text.startsWith('/stop@')) {
        await pool.query(
          `UPDATE partner_telegram_links
           SET is_active = false, updated_at = NOW()
           WHERE chat_id = $1`,
          [chatId],
        );
        try {
          await tgApi('sendMessage', {
            chat_id: chatId,
            text: 'Уведомления BookinGo отключены для этого чата. В кабинете можно подключить снова.',
          });
        } catch (e) {
          console.error('telegram /stop reply', e.message || e);
        }
        return;
      }

      if (text.startsWith('/start')) {
        const parts = text.split(/\s+/);
        const code = (parts[1] || '').trim().toUpperCase();
        if (!code) {
          try {
            await tgApi('sendMessage', {
              chat_id: chatId,
              text: 'Чтобы привязать площадку, откройте кабинет BookinGo → Площадки → «Подключить Telegram» и нажмите /start с кодом.',
            });
          } catch (_) { /* ignore */ }
          return;
        }

        const found = await pool.query(
          `SELECT l.*, v.name AS venue_name
           FROM partner_telegram_links l
           JOIN partner_venues v ON v.id = l.venue_id
           WHERE UPPER(l.link_code) = $1
             AND l.link_expires_at > NOW()`,
          [code],
        );
        if (!found.rows.length) {
          try {
            await tgApi('sendMessage', {
              chat_id: chatId,
              text: 'Код не найден или просрочен. Создайте новый в кабинете BookinGo.',
            });
          } catch (_) { /* ignore */ }
          return;
        }

        const row = found.rows[0];
        await pool.query(
          `UPDATE partner_telegram_links
           SET chat_id = $1,
               is_active = true,
               linked_at = NOW(),
               link_code = NULL,
               link_expires_at = NULL,
               updated_at = NOW()
           WHERE id = $2`,
          [chatId, row.id],
        );

        try {
          await tgApi('sendMessage', {
            chat_id: chatId,
            text: `✅ Площадка «${row.venue_name}» подключена.\nНовые заявки будут приходить сюда.\n\nОтключить: /stop`,
          });
        } catch (e) {
          console.error('telegram /start reply', e.message || e);
        }
      }
    } catch (err) {
      console.error('POST /api/telegram/webhook', err);
      if (!res.headersSent) res.status(500).json({ error: 'webhook error' });
    }
  });
}
