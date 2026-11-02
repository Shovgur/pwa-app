#!/usr/bin/env python3
"""Deploy Telegram manager notifications to /opt/bookingo-api."""
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path('/opt/bookingo-api')
SRC = ROOT / 'src'
INDEX = SRC / 'index.js'
MODULE_SRC = Path(__file__).resolve().parent / 'backend' / 'telegramNotify.js'
MODULE_DST = SRC / 'telegramNotify.js'
ENV = ROOT / '.env'

if not MODULE_SRC.exists():
    # When copied to /tmp on server, look next to script
    alt = Path('/tmp/telegramNotify.js')
    if alt.exists():
        MODULE_SRC = alt
    else:
        sys.exit(f'missing module: {MODULE_SRC}')

shutil.copyfile(MODULE_SRC, MODULE_DST)
print('copied', MODULE_DST)

text = INDEX.read_text()

IMPORT = "import { registerTelegramRoutes, ensureTelegramTables, notifyManagerNewBooking } from './telegramNotify.js';\n"
if 'telegramNotify.js' not in text:
    text = text.replace(
        "import { registerYookassaRoutes } from './yookassaPayments.js';\n",
        "import { registerYookassaRoutes } from './yookassaPayments.js';\n" + IMPORT,
        1,
    )

# Hook after partner_bookings insert + commit — inject notify before res.status(201)
HOOK_OLD = """    if (partnerId) {
      await client.query(
        `INSERT INTO partner_bookings (
          partner_id, code, customer_name, customer_phone, venue_id, venue_name, venue_kind,
          date, time_from, time_to, guests, amount, paid_amount, payment_method, status, comment, request_callback
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          partnerId, code, user.name || 'Клиент', user.phone || '', partnerVenueId, venueName, venueKind,
          date, time, timeTo, guests, price, paidAmount, paymentMethod, partnerStatus, fullComment,
          Boolean(requestCallback),
        ],
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ booking: mapClientBookingRow(bookingResult.rows[0]) });"""

HOOK_NEW = """    if (partnerId) {
      await client.query(
        `INSERT INTO partner_bookings (
          partner_id, code, customer_name, customer_phone, venue_id, venue_name, venue_kind,
          date, time_from, time_to, guests, amount, paid_amount, payment_method, status, comment, request_callback
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          partnerId, code, user.name || 'Клиент', user.phone || '', partnerVenueId, venueName, venueKind,
          date, time, timeTo, guests, price, paidAmount, paymentMethod, partnerStatus, fullComment,
          Boolean(requestCallback),
        ],
      );
    }

    await client.query('COMMIT');

    if (partnerId && partnerVenueId) {
      try {
        notifyManagerNewBooking(pool, {
          venueId: partnerVenueId,
          venueName,
          code,
          customerName: user.name || 'Клиент',
          customerPhone: user.phone || '',
          date,
          timeFrom: time,
          timeTo,
          amount: price,
          requestCallback: Boolean(requestCallback),
        });
      } catch (notifyErr) {
        console.error('telegram notify hook', notifyErr && notifyErr.message ? notifyErr.message : notifyErr);
      }
    }

    res.status(201).json({ booking: mapClientBookingRow(bookingResult.rows[0]) });"""

if 'notifyManagerNewBooking(pool' not in text:
    if HOOK_OLD not in text:
        sys.exit('booking insert hook block not found — adjust patch')
    text = text.replace(HOOK_OLD, HOOK_NEW, 1)

REGISTER = """
registerTelegramRoutes(app, pool, { authenticateToken, requirePartner });
ensureTelegramTables(pool).catch((e) => console.error('ensureTelegramTables', e && e.message ? e.message : e));
"""

if "registerTelegramRoutes(app, pool" not in text:
    anchor = "registerYookassaRoutes(app, pool, { authenticateToken });"
    if anchor not in text:
        sys.exit('registerYookassaRoutes anchor not found')
    text = text.replace(anchor, REGISTER + '\n' + anchor, 1)

INDEX.write_text(text)
print('patched index.js')

# Env placeholders (do not overwrite existing)
if ENV.exists():
    env_text = ENV.read_text()
    additions = []
    for key, comment in [
        ('TELEGRAM_BOT_TOKEN', '# Telegram bot token (BotFather) — never commit'),
        ('TELEGRAM_WEBHOOK_SECRET', '# Random secret for setWebhook secret_token'),
        ('APP_PUBLIC_URL', '# Public site URL for CRM deep links'),
        ('TELEGRAM_BOT_USERNAME', '# Optional bot username without @'),
    ]:
        if f'{key}=' not in env_text:
            if key == 'APP_PUBLIC_URL':
                additions.append(f'{comment}\n{key}=https://bookingo.ru\n')
            else:
                additions.append(f'{comment}\n{key}=\n')
    if additions:
        ENV.write_text(env_text.rstrip() + '\n\n# --- Telegram manager notifications ---\n' + ''.join(additions))
        print('appended env placeholders')
    else:
        print('env keys already present')
else:
    print('WARNING: no .env at', ENV)

subprocess.run(['node', '--check', str(INDEX)], check=True)
print('syntax ok')
print('Restart: pm2 restart bookingo-api --update-env')
print('Webhook URL: https://bookingo.ru/api/telegram/webhook')
