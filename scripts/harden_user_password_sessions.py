#!/usr/bin/env python3
"""Harden client password change: mandatory rate limit + password_version session revoke."""
from pathlib import Path
import subprocess

# 1) Schema
subprocess.run(
    [
        'sudo', '-u', 'postgres', 'psql', '-d', 'bookingo', '-v', 'ON_ERROR_STOP=1', '-c',
        '''
        ALTER TABLE users
          ADD COLUMN IF NOT EXISTS password_version integer NOT NULL DEFAULT 1;
        ''',
    ],
    check=True,
)

path = Path('/opt/bookingo-api/src/index.js')
text = path.read_text()

# 2) authenticateToken — verify pwdv for client JWTs
OLD_AUTH = """const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};"""

NEW_AUTH = """const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });
  jwt.verify(token, JWT_SECRET, async (err, payload) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    try {
      // Client sessions carry userId; partner sessions carry partnerId/role.
      if (payload && payload.userId && !payload.partnerId) {
        const r = await pool.query(
          'SELECT password_version FROM users WHERE id = $1',
          [payload.userId],
        );
        if (!r.rows.length) {
          return res.status(401).json({ error: 'Сессия недействительна' });
        }
        const ver = Number(r.rows[0].password_version) || 1;
        const claim = payload.pwdv == null ? 1 : Number(payload.pwdv);
        if (claim !== ver) {
          return res.status(401).json({ error: 'Сессия истекла. Войдите снова.' });
        }
      }
      req.user = payload;
      next();
    } catch (e) {
      console.error('authenticateToken', e);
      return res.status(500).json({ error: 'Server error' });
    }
  });
};"""

if 'password_version FROM users' not in text:
    if OLD_AUTH not in text:
        raise SystemExit('authenticateToken block not found')
    text = text.replace(OLD_AUTH, NEW_AUTH, 1)

# 3) Client JWT helpers — include pwdv
# Replace the three client jwt.sign patterns carefully
replacements = [
    (
        "const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });\n    res.json({ success: true, userId: user.id, email: user.email, name: user.name, phone: user.phone, token });",
        "const token = jwt.sign({ userId: user.id, email: user.email, pwdv: Number(user.password_version) || 1 }, JWT_SECRET, { expiresIn: '7d' });\n    res.json({ success: true, userId: user.id, email: user.email, name: user.name, phone: user.phone, token });",
    ),
    (
        "const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });\n    res.json({ success: true, userId: user.id, email: user.email, name: user.name, phone: user.phone ?? null, token });",
        "const token = jwt.sign({ userId: user.id, email: user.email, pwdv: Number(user.password_version) || 1 }, JWT_SECRET, { expiresIn: '7d' });\n    res.json({ success: true, userId: user.id, email: user.email, name: user.name, phone: user.phone ?? null, token });",
    ),
]

for old, new in replacements:
    if old in text and 'pwdv:' not in old:
        text = text.replace(old, new)

# verify-code may still use old sign without password_version on RETURNING *
# Ensure SELECT * / RETURNING * already returns password_version after migration.
# Login uses SELECT * — good.
# Register INSERT RETURNING doesn't include password_version — add it
old_reg = (
    "'INSERT INTO users (email, password_hash, name, phone, is_verified) VALUES ($1, $2, $3, $4, false) "
    "RETURNING id, email, name, phone'"
)
new_reg = (
    "'INSERT INTO users (email, password_hash, name, phone, is_verified) VALUES ($1, $2, $3, $4, false) "
    "RETURNING id, email, name, phone, password_version'"
)
if old_reg in text:
    text = text.replace(old_reg, new_reg, 1)

# Any remaining client jwt.sign without pwdv (verify-code etc.)
text = text.replace(
    "jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })",
    "jwt.sign({ userId: user.id, email: user.email, pwdv: Number(user.password_version) || 1 }, JWT_SECRET, { expiresIn: '7d' })",
)

# 4) Replace change-password route body entirely
start = text.find("app.post('/api/user/change-password'")
if start < 0:
    raise SystemExit('change-password route missing')
end = text.find("// ─── Bookings", start)
if end < 0:
    raise SystemExit('bookings marker after change-password missing')

NEW_ROUTE = r'''app.post('/api/user/change-password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    if (!userId) {
      return res.status(403).json({ error: 'Доступно только клиентскому аккаунту' });
    }

    const currentPassword = typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
    const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Укажите текущий и новый пароль' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Новый пароль должен быть не короче 6 символов' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'Новый пароль должен отличаться от текущего' });
    }

    const ip = clientIp(req);
    const ipLimit = takeRateToken('user-chpass:ip:' + ip, 20, 15 * 60 * 1000);
    if (!ipLimit.ok) {
      return res.status(429).json({ error: 'Слишком много попыток. Попробуйте позже.' });
    }
    const userLimit = takeRateToken('user-chpass:uid:' + userId, 8, 15 * 60 * 1000);
    if (!userLimit.ok) {
      return res.status(429).json({ error: 'Слишком много попыток. Попробуйте позже.' });
    }

    const result = await pool.query(
      'SELECT id, email, password_hash, password_version FROM users WHERE id = $1',
      [userId],
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    const user = result.rows[0];
    if (!user.password_hash) {
      return res.status(400).json({ error: 'Пароль ещё не задан. Используйте восстановление пароля.' });
    }

    const ok = await bcrypt.compare(currentPassword, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Неверный текущий пароль' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const updated = await pool.query(
      `UPDATE users
       SET password_hash = $1,
           password_version = COALESCE(password_version, 1) + 1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING id, email, password_version`,
      [passwordHash, userId],
    );
    const next = updated.rows[0];
    const token = jwt.sign(
      { userId: next.id, email: next.email, pwdv: Number(next.password_version) || 1 },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    res.json({ success: true, message: 'Пароль обновлён', token });
  } catch (err) {
    console.error('POST /api/user/change-password', err);
    res.status(500).json({ error: 'Не удалось сменить пароль. Попробуйте позже.' });
  }
});

'''

text = text[:start] + NEW_ROUTE + text[end:]

# 5) reset-password also bumps password_version
old_reset_upd = """UPDATE users
         SET password_hash = $1, updated_at = NOW()
         WHERE id = $2"""
new_reset_upd = """UPDATE users
         SET password_hash = $1,
             password_version = COALESCE(password_version, 1) + 1,
             updated_at = NOW()
         WHERE id = $2"""
if old_reset_upd in text:
    text = text.replace(old_reset_upd, new_reset_upd, 1)

path.write_text(text)
print('hardened user password sessions ok')
