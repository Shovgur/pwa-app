#!/usr/bin/env python3
"""Add POST /api/user/change-password to bookingo-api."""
from pathlib import Path

path = Path('/opt/bookingo-api/src/index.js')
text = path.read_text()

ROUTE = r'''
// ─── User change password ─────────────────────────────────────────────────────

app.post('/api/user/change-password', authenticateToken, async (req, res) => {
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

    if (typeof takeRateToken === 'function') {
      const ip = typeof clientIp === 'function' ? clientIp(req) : (req.ip || 'unknown');
      const ipLimit = takeRateToken('user-chpass:ip:' + ip, 20, 15 * 60 * 1000);
      if (!ipLimit.ok) {
        return res.status(429).json({ error: 'Слишком много попыток. Попробуйте позже.' });
      }
      const userLimit = takeRateToken('user-chpass:uid:' + userId, 8, 15 * 60 * 1000);
      if (!userLimit.ok) {
        return res.status(429).json({ error: 'Слишком много попыток. Попробуйте позже.' });
      }
    }

    const result = await pool.query(
      'SELECT id, password_hash FROM users WHERE id = $1',
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
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, userId],
    );

    res.json({ success: true, message: 'Пароль обновлён' });
  } catch (err) {
    console.error('POST /api/user/change-password', err);
    res.status(500).json({ error: 'Не удалось сменить пароль. Попробуйте позже.' });
  }
});

'''

if "/api/user/change-password" in text:
    print('already present')
else:
    marker = "// ─── Bookings ─────────────────────────────────────────────────────────────────"
    if marker not in text:
        raise SystemExit('bookings marker not found')
    text = text.replace(marker, ROUTE + marker, 1)
    path.write_text(text)
    print('patched ok')
