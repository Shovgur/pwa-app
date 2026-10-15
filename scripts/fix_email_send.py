#!/usr/bin/env python3
"""Fix BookinGo verification email on the VPS (/opt/bookingo-api).

Run ON the server:
  sudo python3 /tmp/fix_email_send.py

What it does:
1. Backs up email.js / auth routes / monolith index.js
2. Installs fixed email service (send when SMTP credentials exist)
3. Ensures EMAIL_DEV_LOG=false in .env (keeps existing EMAIL_* secrets)
4. Removes leaking `code` from send-code JSON if present
5. Restarts pm2 process bookingo-api / bookingo
"""

from __future__ import annotations

from datetime import datetime
from pathlib import Path
import re
import shutil
import subprocess
import sys

ROOT = Path('/opt/bookingo-api')
SRC = ROOT / 'src'
ENV = ROOT / '.env'
STAMP = datetime.now().strftime('%Y%m%d_%H%M%S')

EMAIL_JS = r'''const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!user || !pass || user === 'your_email@gmail.com') {
    return null;
  }

  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  return transporter;
}

function buildMessage(code) {
  const subject = 'Подтвердите ваш email — BookinGo';
  const text = [
    'Подтвердите ваш email — BookinGo',
    '',
    'Введите этот код на сайте для завершения регистрации:',
    '',
    String(code),
    '',
    'Код действует 10 минут.',
    '',
    'Перейти на сайт: https://bookingo.ru',
    '',
    '© 2026 BookinGo. Все права защищены.',
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="ru"><head><meta charset="UTF-8" /><title>BookinGo</title></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:sans-serif;color:#f8fafc;">
  <div style="max-width:600px;margin:32px auto;background:#1e293b;border-radius:16px;border:1px solid #334155;padding:32px;text-align:center;">
    <div style="font-size:26px;font-weight:900;margin-bottom:12px;">BookinGo</div>
    <h1 style="font-size:22px;margin:0 0 12px;">Подтвердите ваш email</h1>
    <p style="color:#94a3b8;margin:0 0 24px;">Введите этот код на сайте BookinGo для завершения регистрации</p>
    <div style="display:inline-block;border:2px solid #22c55e;border-radius:14px;padding:20px 36px;background:#0f172a;">
      <span style="font-size:36px;font-weight:800;color:#22c55e;letter-spacing:10px;font-family:monospace;">${code}</span>
    </div>
    <p style="color:#64748b;margin:20px 0;">Код действует 10 минут</p>
    <a href="https://bookingo.ru" style="display:inline-block;padding:14px 32px;background:#22c55e;color:#fff;text-decoration:none;border-radius:12px;font-weight:700;">Перейти на BookinGo</a>
    <p style="color:#64748b;font-size:12px;margin-top:28px;">© 2026 BookinGo. Все права защищены.</p>
  </div>
</body></html>`;

  return { subject, text, html };
}

function sendVerificationEmailAsync(email, code) {
  const { subject, text, html } = buildMessage(code);
  const mailer = getTransporter();

  if (!mailer) {
    console.log(`[DEV EMAIL] To: ${email} | Code: ${code}`);
    return;
  }

  mailer
    .sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject,
      text,
      html,
    })
    .then((info) => console.log(`✅ Email sent to ${email}: ${info.messageId}`))
    .catch((err) => console.error(`Email error for ${email}:`, err.message || err));
}

async function sendVerificationCode(email, code) {
  const { subject, text, html } = buildMessage(code);
  const mailer = getTransporter();
  if (!mailer) {
    console.log(`[DEV EMAIL] To: ${email} | Code: ${code}`);
    return { devMode: true };
  }
  await mailer.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject,
    text,
    html,
  });
  return { devMode: false };
}

module.exports = { sendVerificationEmailAsync, sendVerificationCode };
'''


def backup(path: Path) -> None:
    if path.exists():
        dest = path.with_suffix(path.suffix + f'.bak_{STAMP}')
        shutil.copy2(path, dest)
        print(f'backed up {path} -> {dest}')


def ensure_env() -> None:
    if not ENV.exists():
        print(f'WARN: {ENV} missing — create it with real EMAIL_USER / EMAIL_PASSWORD')
        return

    text = ENV.read_text()
    original = text

    if re.search(r'^EMAIL_DEV_LOG=', text, re.M):
        text = re.sub(r'^EMAIL_DEV_LOG=.*$', 'EMAIL_DEV_LOG=false', text, flags=re.M)
    else:
        text = text.rstrip() + '\nEMAIL_DEV_LOG=false\n'

    if text != original:
        backup(ENV)
        ENV.write_text(text)
        print('updated EMAIL_DEV_LOG=false in .env')
    else:
        print('.env EMAIL_DEV_LOG already false')

    # Soft checks without printing secrets
    for key in ('EMAIL_USER', 'EMAIL_PASSWORD', 'EMAIL_FROM'):
        m = re.search(rf'^{key}=(.*)$', text, re.M)
        val = (m.group(1).strip() if m else '')
        if not val or 'your_email' in val or 'your_app_password' in val:
            print(f'WARN: {key} looks unset/placeholder — real Gmail App Password required')


def fix_modular() -> bool:
    services = SRC / 'services'
    email_path = services / 'email.js'
    auth_path = SRC / 'routes' / 'auth.js'
    changed = False

    if email_path.parent.exists() or (SRC / 'routes').exists():
        services.mkdir(parents=True, exist_ok=True)
        backup(email_path)
        email_path.write_text(EMAIL_JS)
        print(f'wrote {email_path}')
        changed = True

    if auth_path.exists():
        text = auth_path.read_text()
        backup(auth_path)
        # Prefer async fire-and-forget helper
        if 'sendVerificationEmailAsync' not in text and "require('../services/email')" in text:
            text = text.replace(
                "const { sendVerificationCode } = require('../services/email');",
                "const { sendVerificationEmailAsync } = require('../services/email');",
            )
            text = text.replace(
                'await sendVerificationCode(email, code);',
                'sendVerificationEmailAsync(email, code);',
            )
        # Do not leak code in JSON
        text = re.sub(
            r"return res\.json\(\{\s*success:\s*true,\s*message:\s*['\"]Code sent['\"],\s*code,?\s*\}\);",
            "return res.json({ success: true, message: 'Код отправлен на почту' });",
            text,
        )
        text = re.sub(
            r",\s*code\s*(?=\}\);)",
            '',
            text,
        )
        # Invert broken EMAIL_DEV_LOG gate if still inlined in auth.js
        if "EMAIL_DEV_LOG === 'false'" in text and 'sendMail' in text:
            print('NOTE: auth.js still has inline EMAIL_DEV_LOG gate — prefer email.js helper')
        auth_path.write_text(text)
        print(f'patched {auth_path}')
        changed = True

    return changed


def fix_monolith() -> bool:
    index = SRC / 'index.js'
    if not index.exists():
        return False

    text = index.read_text()
    if 'send-code' not in text and '/api/auth/send-code' not in text:
        return False

    backup(index)
    original = text

    # Stop leaking OTP in API response
    text = text.replace(
        "message: 'Code sent', code",
        "message: 'Код отправлен на почту'",
    )
    text = text.replace(
        'message: "Code sent", code',
        'message: "Код отправлен на почту"',
    )
    text = re.sub(
        r"res\.json\(\{\s*success:\s*true,\s*message:\s*['\"]Code sent['\"],\s*code\s*\}\)",
        "res.json({ success: true, message: 'Код отправлен на почту' })",
        text,
    )

    # Invert broken gate: EMAIL_DEV_LOG === 'false' → send when credentials exist
    # Replace common pattern with always-send-when-configured block marker
    if "EMAIL_DEV_LOG === 'false'" in text or 'EMAIL_DEV_LOG === "false"' in text:
        text = text.replace("process.env.EMAIL_DEV_LOG === 'false'", 'true /* always try SMTP when configured */')
        text = text.replace('process.env.EMAIL_DEV_LOG === "false"', 'true /* always try SMTP when configured */')
        print('relaxed EMAIL_DEV_LOG gate in index.js')

    if text != original:
        index.write_text(text)
        print(f'patched {index}')
        return True

    print('monolith index.js: no Code sent / EMAIL_DEV_LOG patterns found (ok)')
    return False


def restart_pm2() -> None:
    for name in ('bookingo-api', 'bookingo'):
        r = subprocess.run(['pm2', 'restart', name], capture_output=True, text=True)
        if r.returncode == 0:
            print(f'pm2 restart {name}: OK')
            print(r.stdout)
            return
        print(f'pm2 restart {name}: skip ({(r.stderr or r.stdout).strip()[:120]})')
    print('WARN: could not restart pm2 — restart manually')


def main() -> int:
    if not ROOT.exists():
        print(f'ERROR: {ROOT} not found — run this on the VPS', file=sys.stderr)
        return 1

    ensure_env()
    mod = fix_modular()
    mono = fix_monolith()
    if not mod and not mono:
        print('WARN: no modular or monolith auth files patched')

    restart_pm2()
    print('Done. Test: curl -X POST http://127.0.0.1:3000/api/auth/send-code -H "Content-Type: application/json" -d \'{"email":"you@example.com"}\'')
    print('Then check: pm2 logs --lines 40  (look for ✅ Email sent / Email error / [DEV EMAIL])')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
