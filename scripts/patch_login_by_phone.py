#!/usr/bin/env python3
"""Patch API: allow login with phone + password."""

from pathlib import Path

INDEX = Path('/opt/bookingo-api/src/index.js')
text = INDEX.read_text()

OLD = """app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'User not found' });
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, userId: user.id, email: user.email, name: user.name, phone: user.phone ?? null, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});"""

NEW = """app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });
    let result;
    if (phone) {
      const normalizedPhone = normalizePhone(phone);
      if (!isValidPhone(normalizedPhone)) {
        return res.status(400).json({ error: 'Укажите корректный номер телефона' });
      }
      result = await pool.query('SELECT * FROM users WHERE phone = $1', [normalizedPhone]);
    } else if (email) {
      result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    } else {
      return res.status(400).json({ error: 'Укажите email или телефон' });
    }
    if (result.rows.length === 0) return res.status(400).json({ error: 'User not found' });
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, userId: user.id, email: user.email, name: user.name, phone: user.phone ?? null, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});"""

if OLD in text:
    text = text.replace(OLD, NEW)
    INDEX.write_text(text)
    print('login by phone patched')
elif "WHERE phone = $1" in text and "app.post('/api/auth/login'" in text:
    print('already patched')
else:
    raise SystemExit('login block not found')
