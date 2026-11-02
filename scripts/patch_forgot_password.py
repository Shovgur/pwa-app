#!/usr/bin/env python3
"""Add forgot-password + reset-password endpoints to bookingo-api."""
from pathlib import Path

path = Path('/opt/bookingo-api/src/index.js')
text = path.read_text()

EMAIL_HELPER = r'''
function buildPasswordResetHtml(code) {
  return [
    '<html><body style="margin:0;padding:0;background-color:#0f172a;font-family:Arial,sans-serif;">',
    '<table width="100%" style="background-color:#0f172a;"><tr><td align="center" style="padding:32px 16px;">',
    '<table width="100%" style="max-width:600px;background-color:#1e293b;border-radius:16px;border:1px solid #334155;">',
    '<tr><td style="height:4px;background:#22c55e;">&nbsp;</td></tr>',
    '<tr><td align="center" style="padding:32px 32px 8px;"><span style="font-size:26px;font-weight:900;color:#fff;">BookinGo</span></td></tr>',
    '<tr><td align="center" style="padding:8px 32px 0;"><h1 style="margin:0;font-size:22px;color:#f8fafc;">Сброс пароля</h1></td></tr>',
    '<tr><td align="center" style="padding:12px 32px 0;"><p style="margin:0;font-size:15px;color:#94a3b8;">Введите этот код на сайте BookinGo, чтобы задать новый пароль</p></td></tr>',
    '<tr><td align="center" style="padding:28px 32px;">',
    '<table><tr><td style="background-color:#0f172a;border:2px solid #22c55e;border-radius:14px;padding:20px 36px;">',
    '<span style="font-size:36px;font-weight:800;color:#22c55e;letter-spacing:10px;font-family:monospace;">' + code + '</span>',
    '</td></tr></table></td></tr>',
    '<tr><td align="center" style="padding:0 32px 36px;"><p style="margin:0;font-size:13px;color:#64748b;">Код действует 10 минут. Если вы не запрашивали сброс — просто игнорируйте письмо.</p></td></tr>',
    '</table></td></tr></table></body></html>'
  ].join('');
}

function sendPasswordResetEmail(email, code) {
  const subject = 'Сброс пароля — BookinGo';
  const textBody = 'Код для сброса пароля BookinGo: ' + code + '\n\nКод действует 10 минут.\nhttps://bookingo.ru/forgot-password';
  const html = buildPasswordResetHtml(code);

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      resend.emails.send({
        from: 'BookinGo <noreply@bookingo.ru>',
        to: email,
        subject,
        text: textBody,
        html,
      }).then((result) => {
        if (result && result.error) {
          console.error('Resend reset error for ' + email + ':', JSON.stringify(result.error));
          sendViaGmailFallback(email, subject, textBody, html);
          return;
        }
        console.log('✅ Resend password reset to ' + email + ':', result && result.data && result.data.id);
      }).catch((err) => {
        console.error('Resend reset error for ' + email + ':', err && err.message ? err.message : err);
        sendViaGmailFallback(email, subject, textBody, html);
      });
      return;
    } catch (err) {
      console.error('Resend reset init error:', err && err.message ? err.message : err);
    }
  }

  sendViaGmailFallback(email, subject, textBody, html);
}

'''

ROUTES = r'''
// ─── Auth: Forgot password ───────────────────────────────────────────────────

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const emailRaw = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!emailRaw || !emailRaw.includes('@')) {
      return res.status(400).json({ error: 'Укажите корректный email' });
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
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000);

    await pool.query(
      `UPDATE verification_codes
       SET is_used = true
       WHERE email = $1 AND code_type = 'password_reset' AND is_used = false`,
      [user.email],
    );

    await pool.query(
      `INSERT INTO verification_codes (user_id, email, code, code_type, expires_at)
       VALUES ($1, $2, $3, 'password_reset', $4)`,
      [user.id, user.email, code, expiresAt],
    );

    sendPasswordResetEmail(user.email, code);
    res.json(okMessage);
  } catch (err) {
    console.error('POST /api/auth/forgot-password', err);
    res.status(500).json({ error: 'Не удалось отправить код. Попробуйте позже.' });
  }
});

// ─── Auth: Reset password ────────────────────────────────────────────────────

app.post('/api/auth/reset-password', async (req, res) => {
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

if 'sendPasswordResetEmail' not in text:
    anchor = 'function sendVerificationEmail(email, code) {'
    if anchor not in text:
        raise SystemExit('sendVerificationEmail not found')
    text = text.replace(anchor, EMAIL_HELPER + anchor, 1)

if "/api/auth/forgot-password" not in text:
    # Insert after send-code block, before verify-code
    marker = "// ─── Auth: Verify code ───────────────────────────────────────────────────────"
    if marker not in text:
        # fallback after send-code route closing
        marker2 = "app.post('/api/auth/verify-code'"
        if marker2 not in text:
            raise SystemExit('verify-code marker not found')
        text = text.replace(marker2, ROUTES + marker2, 1)
    else:
        text = text.replace(marker, ROUTES + marker, 1)

path.write_text(text)
print('patched ok')
