#!/usr/bin/env python3
"""Harden forgot/reset password routes: rate limits, crypto RNG, collision retry."""
from pathlib import Path

path = Path('/opt/bookingo-api/src/index.js')
text = path.read_text()

IMPORT = "import { randomInt } from 'crypto';\n"
if "import { randomInt } from 'crypto'" not in text:
    text = text.replace("import bcrypt from 'bcrypt';\n", "import bcrypt from 'bcrypt';\n" + IMPORT, 1)

HELPERS = r'''
// ─── Simple in-memory rate limit (per key) ───────────────────────────────────
const __rateBuckets = new Map();

function takeRateToken(key, max, windowMs) {
  const now = Date.now();
  let bucket = __rateBuckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    __rateBuckets.set(key, bucket);
  }
  if (bucket.count >= max) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  bucket.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

function clientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.trim()) return xf.split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function generateOtpCode() {
  return String(randomInt(100000, 1000000));
}

async function insertPasswordResetCode(userId, email, expiresAt) {
  let lastErr = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateOtpCode();
    try {
      await pool.query(
        `INSERT INTO verification_codes (user_id, email, code, code_type, expires_at)
         VALUES ($1, $2, $3, 'password_reset', $4)`,
        [userId, email, code, expiresAt],
      );
      return code;
    } catch (err) {
      lastErr = err;
      // unique_violation on global code constraint — retry with new code
      if (err && err.code === '23505') continue;
      throw err;
    }
  }
  throw lastErr || new Error('Failed to allocate reset code');
}

'''

if 'function takeRateToken(' not in text:
    # Insert before sendPasswordReset / after JWT_SECRET block near first email helper
    anchor = 'function buildPasswordResetHtml(code) {'
    if anchor not in text:
        raise SystemExit('buildPasswordResetHtml not found')
    text = text.replace(anchor, HELPERS + anchor, 1)

# Replace Math.random in forgot-password block only (between forgot-password and reset-password)
forgot_start = text.find("app.post('/api/auth/forgot-password'")
reset_start = text.find("app.post('/api/auth/reset-password'")
if forgot_start < 0 or reset_start < 0:
    raise SystemExit('forgot/reset routes not found')

forgot_block = text[forgot_start:reset_start]
reset_end_marker = "app.post('/api/auth/verify-code'"
# reset block ends before verify-code OR next major section - our routes were inserted BEFORE verify-code
# Actually order is: send-code, forgot, reset, verify-code
verify_start = text.find("// ─── Auth: Verify code", reset_start)
if verify_start < 0:
    verify_start = text.find("app.post('/api/auth/verify-code'", reset_start)
if verify_start < 0:
    raise SystemExit('verify-code after reset not found')

reset_block = text[reset_start:verify_start]

NEW_FORGOT = r'''app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const emailRaw = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!emailRaw || !emailRaw.includes('@')) {
      return res.status(400).json({ error: 'Укажите корректный email' });
    }

    const ip = clientIp(req);
    const ipLimit = takeRateToken('forgot:ip:' + ip, 8, 15 * 60 * 1000);
    if (!ipLimit.ok) {
      return res.status(429).json({ error: 'Слишком много запросов. Попробуйте позже.' });
    }
    const emailLimit = takeRateToken('forgot:email:' + emailRaw, 3, 15 * 60 * 1000);
    if (!emailLimit.ok) {
      // Не раскрываем существование аккаунта
      return res.json({ success: true, message: 'Если аккаунт с таким email есть, мы отправили код на почту' });
    }

    // Не раскрываем, есть ли аккаунт
    const okMessage = { success: true, message: 'Если аккаунт с таким email есть, мы отправили код на почту' };

    const userResult = await pool.query(
      'SELECT id, email, password_hash FROM users WHERE LOWER(email) = $1',
      [emailRaw],
    );
    if (!userResult.rows.length || !userResult.rows[0].password_hash) {
      return res.json(okMessage);
    }

    const user = userResult.rows[0];
    const expiresAt = new Date(Date.now() + 10 * 60000);

    await pool.query(
      `UPDATE verification_codes
       SET is_used = true
       WHERE email = $1 AND code_type = 'password_reset' AND is_used = false`,
      [user.email],
    );

    const code = await insertPasswordResetCode(user.id, user.email, expiresAt);
    sendPasswordResetEmail(user.email, code);
    res.json(okMessage);
  } catch (err) {
    console.error('POST /api/auth/forgot-password', err);
    res.status(500).json({ error: 'Не удалось отправить код. Попробуйте позже.' });
  }
});

'''

NEW_RESET = r'''app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const emailRaw = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
    const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';

    if (!emailRaw || !emailRaw.includes('@')) {
      return res.status(400).json({ error: 'Укажите корректный email' });
    }
    if (!code || code.length < 4) {
      return res.status(400).json({ error: 'Введите код из письма' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Пароль должен быть не короче 6 символов' });
    }

    const ip = clientIp(req);
    const ipLimit = takeRateToken('reset:ip:' + ip, 20, 15 * 60 * 1000);
    if (!ipLimit.ok) {
      return res.status(429).json({ error: 'Слишком много попыток. Попробуйте позже.' });
    }
    const emailLimit = takeRateToken('reset:email:' + emailRaw, 8, 15 * 60 * 1000);
    if (!emailLimit.ok) {
      return res.status(429).json({ error: 'Слишком много попыток для этого email. Запросите новый код позже.' });
    }

    const codeResult = await pool.query(
      `SELECT * FROM verification_codes
       WHERE LOWER(email) = $1
         AND code = $2
         AND code_type = 'password_reset'
         AND is_used = false
         AND expires_at > NOW()
       ORDER BY id DESC
       LIMIT 1`,
      [emailRaw, code],
    );
    if (!codeResult.rows.length) {
      return res.status(400).json({ error: 'Неверный или просроченный код' });
    }

    const row = codeResult.rows[0];
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await pool.query('BEGIN');
    try {
      await pool.query(
        `UPDATE users
         SET password_hash = $1, updated_at = NOW()
         WHERE id = $2`,
        [passwordHash, row.user_id],
      );
      await pool.query('UPDATE verification_codes SET is_used = true WHERE id = $1', [row.id]);
      await pool.query(
        `UPDATE verification_codes
         SET is_used = true
         WHERE email = $1 AND code_type = 'password_reset' AND is_used = false`,
        [row.email],
      );
      await pool.query('COMMIT');
    } catch (e) {
      await pool.query('ROLLBACK');
      throw e;
    }

    res.json({ success: true, message: 'Пароль обновлён. Теперь можно войти.' });
  } catch (err) {
    console.error('POST /api/auth/reset-password', err);
    res.status(500).json({ error: 'Не удалось сменить пароль. Попробуйте позже.' });
  }
});

'''

text = text[:forgot_start] + NEW_FORGOT + NEW_RESET + text[verify_start:]
path.write_text(text)
print('hardened ok')
