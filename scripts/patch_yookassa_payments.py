#!/usr/bin/env python3
"""Patch /opt/bookingo-api for YooKassa: pending online bookings + payment routes."""

from pathlib import Path
import shutil

INDEX = Path('/opt/bookingo-api/src/index.js')
DEST_MODULE = Path('/opt/bookingo-api/src/yookassaPayments.js')
SRC_MODULE = Path(__file__).resolve().parent / 'backend' / 'yookassaPayments.js'

text = INDEX.read_text()

# 1) Copy module
if not SRC_MODULE.exists():
    raise SystemExit(f'missing {SRC_MODULE}')
shutil.copyfile(SRC_MODULE, DEST_MODULE)
print('copied yookassaPayments.js')

# 2) Online booking must NOT be paid at create time
OLD_PAID = (
    "    const partnerStatus = paymentMethod === 'online' ? 'paid' : 'pending';\n"
    "    const paidAmount = paymentMethod === 'online' ? price : 0;"
)
NEW_PAID = (
    "    // Online: ждём webhook/return ЮKassa. Paid только после payment.succeeded.\n"
    "    const partnerStatus = 'pending';\n"
    "    const paidAmount = 0;"
)
if OLD_PAID not in text:
    if "const partnerStatus = 'pending'" in text and "const paidAmount = 0" in text:
        print('paid-on-create already fixed')
    else:
        raise SystemExit('paid-on-create block not found')
else:
    text = text.replace(OLD_PAID, NEW_PAID, 1)
    print('fixed online → pending')

# 3) Import + register routes (once)
IMPORT = "import { registerYookassaRoutes } from './yookassaPayments.js';\n"
if "registerYookassaRoutes" not in text:
    # after other imports
    if "import bcrypt from 'bcrypt';" in text:
        text = text.replace("import bcrypt from 'bcrypt';\n", "import bcrypt from 'bcrypt';\n" + IMPORT, 1)
    else:
        text = IMPORT + text
    print('added import')

REGISTER = (
    "\nregisterYookassaRoutes(app, pool, { authenticateToken });\n"
)
if "registerYookassaRoutes(app, pool" not in text:
    if "app.listen(PORT" not in text:
        raise SystemExit('app.listen not found')
    text = text.replace(
        "app.listen(PORT",
        REGISTER + "app.listen(PORT",
        1,
    )
    print('registered routes')
else:
    print('routes already registered')

INDEX.write_text(text)
print('patched ok')
