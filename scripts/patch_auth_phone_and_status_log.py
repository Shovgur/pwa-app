#!/usr/bin/env python3
"""Patch API: phone on register/verify/login + booking_status_log table usage fix."""

from pathlib import Path

INDEX = Path('/opt/bookingo-api/src/index.js')
text = INDEX.read_text()

HELPERS = '''
function normalizePhone(phone) {
  if (!phone) return '';
  let p = String(phone).replace(/[\\s\\-()]/g, '');
  if (p.startsWith('8') && p.length === 11) p = '+7' + p.slice(1);
  else if (p.startsWith('7') && p.length === 11 && !p.startsWith('+')) p = '+' + p;
  else if (/^\\d{10}$/.test(p)) p = '+7' + p;
  return p;
}

function isValidPhone(phone) {
  const p = normalizePhone(phone);
  return /^\\+7\\d{10}$/.test(p);
}

'''

if 'function isValidPhone' not in text:
    anchor = 'function toDateYMD(value) {'
    text = text.replace(anchor, HELPERS + anchor)

OLD_REGISTER = """app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, is_verified) VALUES ($1, $2, $3, false) RETURNING id, email, name',
      [email, hashedPassword, name]
    );
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, userId: user.id, email: user.email, name: user.name, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});"""

NEW_REGISTER = """app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password || !name || !phone) {
      return res.status(400).json({ error: 'Заполните все обязательные поля, включая телефон' });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Укажите корректный номер телефона' });
    }
    const normalizedPhone = normalizePhone(phone);
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, phone, is_verified) VALUES ($1, $2, $3, $4, false) RETURNING id, email, name, phone',
      [email, hashedPassword, name, normalizedPhone]
    );
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, userId: user.id, email: user.email, name: user.name, phone: user.phone, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});"""

OLD_VERIFY = """app.post('/api/auth/verify-code', async (req, res) => {
  try {
    const { email, code, name } = req.body;
    const codeResult = await pool.query(
      'SELECT * FROM verification_codes WHERE email = $1 AND code = $2 AND is_used = false AND expires_at > NOW()',
      [email, code]
    );
    if (codeResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }
    await pool.query('UPDATE verification_codes SET is_used = true WHERE id = $1', [codeResult.rows[0].id]);
    const userResult = await pool.query(
      'UPDATE users SET is_verified = true, name = COALESCE($1, name), updated_at = NOW() WHERE email = $2 RETURNING *',
      [name, email]
    );
    const user = userResult.rows[0];
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, userId: user.id, email: user.email, name: user.name, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});"""

NEW_VERIFY = """app.post('/api/auth/verify-code', async (req, res) => {
  try {
    const { email, code, name, phone } = req.body;
    const codeResult = await pool.query(
      'SELECT * FROM verification_codes WHERE email = $1 AND code = $2 AND is_used = false AND expires_at > NOW()',
      [email, code]
    );
    if (codeResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }
    await pool.query('UPDATE verification_codes SET is_used = true WHERE id = $1', [codeResult.rows[0].id]);
    const normalizedPhone = phone && isValidPhone(phone) ? normalizePhone(phone) : null;
    const userResult = await pool.query(
      `UPDATE users SET is_verified = true,
        name = COALESCE(NULLIF($1, ''), name),
        phone = COALESCE($2, phone),
        updated_at = NOW()
       WHERE email = $3 RETURNING *`,
      [name || null, normalizedPhone, email]
    );
    const user = userResult.rows[0];
    if (!user.phone) {
      return res.status(400).json({ error: 'Укажите номер телефона для завершения регистрации' });
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, userId: user.id, email: user.email, name: user.name, phone: user.phone, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});"""

OLD_LOGIN = """    res.json({ success: true, userId: user.id, email: user.email, name: user.name, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});"""

NEW_LOGIN = """    res.json({ success: true, userId: user.id, email: user.email, name: user.name, phone: user.phone ?? null, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});"""

# Wrap status log insert to not fail if table missing (table will be created separately)
OLD_STATUS_LOG = """    await client.query(
      'INSERT INTO booking_status_log (booking_id, from_status, to_status, changed_by_type, changed_by_id) VALUES ($1, $2, $3, $4, $5)',
      [bookingId, current.status, nextStatus, changedByType, changedById]
    );"""

NEW_STATUS_LOG = """    try {
      await client.query(
        'INSERT INTO booking_status_log (booking_id, from_status, to_status, changed_by_type, changed_by_id) VALUES ($1, $2, $3, $4, $5)',
        [bookingId, current.status, nextStatus, changedByType, changedById ?? null]
      );
    } catch (logErr) {
      console.warn('booking_status_log insert skipped:', logErr.message);
    }"""

for old, new in [
    (OLD_REGISTER, NEW_REGISTER),
    (OLD_VERIFY, NEW_VERIFY),
    (OLD_LOGIN, NEW_LOGIN),
    (OLD_STATUS_LOG, NEW_STATUS_LOG),
]:
    if old in text:
        text = text.replace(old, new)
    elif new.split('\n')[1].strip()[:30] in text:
        print('skip already patched block')
    else:
        print('WARN block not found:', old[:60])

# POST bookings: requestCallback + phone check
OLD_BOOKING_USER = """    const userResult = await client.query('SELECT name, phone FROM users WHERE id = $1', [userId]);
    if (!userResult.rows.length) return res.status(404).json({ error: 'User not found' });
    const user = userResult.rows[0];"""

NEW_BOOKING_USER = """    const userResult = await client.query('SELECT name, phone FROM users WHERE id = $1', [userId]);
    if (!userResult.rows.length) return res.status(404).json({ error: 'User not found' });
    const user = userResult.rows[0];
    if (!user.phone || !String(user.phone).trim()) {
      client.release();
      return res.status(400).json({ error: 'Укажите номер телефона в профиле для бронирования' });
    }"""

if OLD_BOOKING_USER in text:
    text = text.replace(OLD_BOOKING_USER, NEW_BOOKING_USER)

OLD_COMMENT = """    const extrasComment = Array.isArray(addOns) && addOns.length
      ? `Доп. услуги: ${addOns.map((a) => a.name).join(', ')}`
      : null;
    const fullComment = [comment, extrasComment].filter(Boolean).join('. ') || null;"""

NEW_COMMENT = """    const { requestCallback } = req.body;
    const extrasComment = Array.isArray(addOns) && addOns.length
      ? `Доп. услуги: ${addOns.map((a) => a.name).join(', ')}`
      : null;
    const callbackNote = requestCallback ? '📞 Клиент просит перезвонить для подтверждения' : null;
    const fullComment = [callbackNote, comment, extrasComment].filter(Boolean).join('. ') || null;"""

if OLD_COMMENT in text:
    text = text.replace(OLD_COMMENT, NEW_COMMENT)

INDEX.write_text(text)
print('index.js patched')
