// Snapshot of prod /opt/bookingo-api/src/index.js email helpers (15 Oct 2026). Not a runnable module.
// Full file lives on VPS; Resend primary, Gmail fallback.

import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerPartnerVenueRoutes, registerPublicVenueRoutes } from './partnerVenues.js';
import { registerPartnerPromotionRoutes } from './partnerPromotions.js';
import { hasBookingConflict, computeVenueAvailability } from './venueAvailability.js';


    );
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, userId: user.id, email: user.email, name: user.name, phone: user.phone, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});


// ─── Email helper (Gmail nodemailer primary, Resend fallback) ────────────────
let gmailTransporter = null;

function getGmailTransporter() {
  if (gmailTransporter) return gmailTransporter;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  if (!user || !pass || user === 'your_email@gmail.com') return null;
  gmailTransporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
  return gmailTransporter;
}

function buildVerificationHtml(code) {
  return [
    '<html><body style="margin:0;padding:0;background-color:#0f172a;font-family:Arial,sans-serif;">',
    '<table width="100%" style="background-color:#0f172a;"><tr><td align="center" style="padding:32px 16px;">',
    '<table width="100%" style="max-width:600px;background-color:#1e293b;border-radius:16px;border:1px solid #334155;">',
    '<tr><td style="height:4px;background:#22c55e;">&nbsp;</td></tr>',
    '<tr><td align="center" style="padding:32px 32px 8px;"><span style="font-size:26px;font-weight:900;color:#fff;">BookinGo</span></td></tr>',
    '<tr><td align="center" style="padding:8px 32px 0;"><h1 style="margin:0;font-size:22px;color:#f8fafc;">Подтвердите ваш email</h1></td></tr>',
    '<tr><td align="center" style="padding:12px 32px 0;"><p style="margin:0;font-size:15px;color:#94a3b8;">Введите этот код на сайте BookinGo для завершения регистрации</p></td></tr>',
    '<tr><td align="center" style="padding:28px 32px;">',
    '<table><tr><td style="background-color:#0f172a;border:2px solid #22c55e;border-radius:14px;padding:20px 36px;">',
    '<span style="font-size:36px;font-weight:800;color:#22c55e;letter-spacing:10px;font-family:monospace;">' + code + '</span>',
    '</td></tr></table></td></tr>',
    '<tr><td align="center" style="padding:0 32px 36px;"><p style="margin:0;font-size:13px;color:#64748b;">Код действует 10 минут</p></td></tr>',
    '</table></td></tr></table></body></html>'
  ].join('');
}

function sendVerificationEmail(email, code) {
  const subject = 'Подтвердите ваш email — BookinGo';
  const textBody = 'Код верификации BookinGo: ' + code + '\n\nКод действует 10 минут.\nhttps://bookingo.ru';
  const html = buildVerificationHtml(code);

  // Resend primary: Gmail SMTP с этого VPS обычно таймаутится (порты 465/587).
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
          console.error('Resend error for ' + email + ':', JSON.stringify(result.error));
          sendViaGmailFallback(email, subject, textBody, html);
          return;
        }
        console.log('✅ Resend sent to ' + email + ':', result && result.data && result.data.id);
      }).catch((err) => {
        console.error('Resend error for ' + email + ':', err && err.message ? err.message : err);
        sendViaGmailFallback(email, subject, textBody, html);
      });
      return;
    } catch (err) {
      console.error('Resend init error:', err && err.message ? err.message : err);
    }
  }

  sendViaGmailFallback(email, subject, textBody, html);
}

function sendViaGmailFallback(email, subject, textBody, html) {
  const mailer = getGmailTransporter();
  if (!mailer) {
    console.log('[DEV EMAIL] To: ' + email + ' | Code missing SMTP');
    return;
  }
  mailer.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject,
    text: textBody,
    html,
  }).then((info) => {
    console.log('✅ Gmail sent to ' + email + ': ' + info.messageId);
  }).catch((err) => {
    console.error('Gmail error for ' + email + ':', err && err.message ? err.message : err);
  });
}


// ─── Auth: Send code ─────────────────────────────────────────────────────────

app.post('/api/auth/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000);

    let userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    let userId;
    if (userResult.rows.length === 0) {
      userResult = await pool.query('INSERT INTO users (email) VALUES ($1) RETURNING id', [email]);
      userId = userResult.rows[0].id;
    } else {
      userId = userResult.rows[0].id;
    }

    await pool.query(
      'INSERT INTO verification_codes (user_id, email, code, code_type, expires_at) VALUES ($1, $2, $3, $4, $5)',
      [userId, email, code, 'login', expiresAt]
    );

    // Письмо в фоне: Gmail SMTP (рабочий путь), Resend — запасной.
    // HTTP отвечаем сразу, чтобы SMTP не блокировал клиента.
    sendVerificationEmail(email, code);

    res.json({ success: true, message: 'Код отправлен на почту' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send code' });
  }
});

// ─── Auth: Verify code ───────────────────────────────────────────────────────

app.post('/api/auth/verify-code', async (req, res) => {
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
