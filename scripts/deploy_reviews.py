#!/usr/bin/env python3
"""Deploy Stage 1 reviews foundation: SQL + modules + index/partnerVenues patches."""

from __future__ import annotations

from datetime import datetime
from pathlib import Path
import shutil
import subprocess
import sys

API_ROOT = Path("/opt/bookingo-api/src")
INDEX = API_ROOT / "index.js"
PARTNER = API_ROOT / "partnerVenues.js"
LOCAL_DIR = Path(__file__).resolve().parent / "backend"
MIGRATE = Path(__file__).resolve().parent / "migrate_reviews.sql"

MODULES = [
    "reviewConstants.js",
    "reviewModeration.js",
    "reviews.js",
]


def run(cmd: list[str]) -> None:
    print("+", " ".join(cmd))
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.stdout:
        print(r.stdout)
    if r.returncode != 0:
        print(r.stderr, file=sys.stderr)
        raise SystemExit(r.returncode)


def main() -> None:
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    shutil.copy2(INDEX, INDEX.with_suffix(f".js.bak_reviews_{stamp}"))
    shutil.copy2(PARTNER, PARTNER.with_suffix(f".js.bak_reviews_{stamp}"))
    print("backed up index.js + partnerVenues.js")

    if not MIGRATE.exists():
        raise SystemExit(f"missing {MIGRATE}")
    run(
        [
            "sudo",
            "-u",
            "postgres",
            "psql",
            "-d",
            "bookingo",
            "-v",
            "ON_ERROR_STOP=1",
            "-f",
            str(MIGRATE),
        ]
    )
    print("DB migration OK")

    for name in MODULES:
        src = LOCAL_DIR / name
        if not src.exists():
            raise SystemExit(f"missing {src}")
        shutil.copy2(src, API_ROOT / name)
        print(f"installed {name}")

    # node --check
    for name in MODULES:
        run(["node", "--check", str(API_ROOT / name)])

    idx = INDEX.read_text()
    if "registerReviewRoutes" not in idx:
        if "import { registerPartnerPromotionRoutes } from './partnerPromotions.js';" not in idx:
            raise SystemExit("partnerPromotions import anchor missing")
        idx = idx.replace(
            "import { registerPartnerPromotionRoutes } from './partnerPromotions.js';",
            "import { registerPartnerPromotionRoutes } from './partnerPromotions.js';\n"
            "import { registerReviewRoutes } from './reviews.js';",
            1,
        )

    register_anchor = """registerPartnerPromotionRoutes(app, pool, {
  authenticateToken,
  requirePartner,
  helpers: {
    toISO: (value) => (value instanceof Date ? value.toISOString() : value ? new Date(value).toISOString() : null),
    toTimeHHMM: (value) => (value ? String(value).slice(0, 5) : ''),
  },
});"""
    if "registerReviewRoutes(app, pool" not in idx:
        if register_anchor not in idx:
            raise SystemExit("registerPartnerPromotionRoutes call anchor missing")
        idx = idx.replace(
            register_anchor,
            register_anchor
            + "\n\nregisterReviewRoutes(app, pool, { authenticateToken, requirePartner });",
            1,
        )

    # partner_bookings INSERT: add user_id
    old_insert = """        `INSERT INTO partner_bookings (
          partner_id, code, customer_name, customer_phone, venue_id, venue_name, venue_kind,
          date, time_from, time_to, guests, amount, paid_amount, payment_method, status, comment, request_callback
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          partnerId, code, user.name || 'Клиент', user.phone || '', partnerVenueId, venueName, venueKind,
          date, time, timeTo, guests, price, paidAmount, paymentMethod, partnerStatus, fullComment,
          Boolean(requestCallback),
        ],"""
    new_insert = """        `INSERT INTO partner_bookings (
          partner_id, user_id, code, customer_name, customer_phone, venue_id, venue_name, venue_kind,
          date, time_from, time_to, guests, amount, paid_amount, payment_method, status, comment, request_callback
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [
          partnerId, userId, code, user.name || 'Клиент', user.phone || '', partnerVenueId, venueName, venueKind,
          date, time, timeTo, guests, price, paidAmount, paymentMethod, partnerStatus, fullComment,
          Boolean(requestCallback),
        ],"""
    if "user_id, code, customer_name" not in idx:
        if old_insert not in idx:
            raise SystemExit("partner_bookings INSERT anchor missing — manual patch needed")
        idx = idx.replace(old_insert, new_insert, 1)
        print("patched partner_bookings INSERT with user_id")
    else:
        print("partner_bookings INSERT already has user_id")

    # completed_at on Complete
    old_status_upd = (
        "'UPDATE partner_bookings SET status = $1, paid_amount = $2 "
        "WHERE id = $3 AND partner_id = $4 RETURNING *',\n"
        "      [nextStatus, paidAmount, bookingId, partnerId]"
    )
    new_status_upd = (
        "`UPDATE partner_bookings SET status = $1, paid_amount = $2, "
        "completed_at = CASE WHEN $1 = 'completed' THEN COALESCE(completed_at, NOW()) ELSE completed_at END "
        "WHERE id = $3 AND partner_id = $4 RETURNING *`,\n"
        "      [nextStatus, paidAmount, bookingId, partnerId]"
    )
    # handle both quote styles
    if "completed_at = CASE WHEN" not in idx:
        alt_old = (
            "'UPDATE partner_bookings SET status = $1, paid_amount = $2 WHERE id = $3 AND partner_id = $4 RETURNING *',\n"
            "      [nextStatus, paidAmount, bookingId, partnerId]"
        )
        alt_new = (
            "`UPDATE partner_bookings SET status = $1, paid_amount = $2, "
            "completed_at = CASE WHEN $1 = 'completed' THEN COALESCE(completed_at, NOW()) ELSE completed_at END "
            "WHERE id = $3 AND partner_id = $4 RETURNING *`,\n"
            "      [nextStatus, paidAmount, bookingId, partnerId]"
        )
        if alt_old not in idx and old_status_upd not in idx:
            # try without line break nuances
            needle = "UPDATE partner_bookings SET status = $1, paid_amount = $2 WHERE id = $3 AND partner_id = $4 RETURNING *"
            if needle not in idx:
                raise SystemExit("status UPDATE anchor missing")
            idx = idx.replace(
                needle,
                "UPDATE partner_bookings SET status = $1, paid_amount = $2, "
                "completed_at = CASE WHEN $1 = 'completed' THEN COALESCE(completed_at, NOW()) ELSE completed_at END "
                "WHERE id = $3 AND partner_id = $4 RETURNING *",
                1,
            )
        else:
            idx = idx.replace(alt_old if alt_old in idx else old_status_upd, alt_new if alt_old in idx else new_status_upd, 1)
        print("patched completed_at on status update")
    else:
        print("completed_at patch already present")

    INDEX.write_text(idx)
    run(["node", "--check", str(INDEX)])

    # partnerVenues mapVenueRow: expose ratingAvg / ratingCount
    pv = PARTNER.read_text()
    if "ratingAvg:" not in pv:
        old_tail = """    promotions: extras.promotions || [],
  };
}"""
        new_tail = """    promotions: extras.promotions || [],
    ratingAvg: row.rating_avg != null ? Number(row.rating_avg) : null,
    ratingCount: Number(row.rating_count || 0),
  };
}"""
        if old_tail not in pv:
            raise SystemExit("mapVenueRow promotions tail not found")
        pv = pv.replace(old_tail, new_tail, 1)
        PARTNER.write_text(pv)
        print("patched mapVenueRow rating fields")
    else:
        print("mapVenueRow rating fields already present")
    run(["node", "--check", str(PARTNER)])

    print(
        "\nDone. Enable later with FEATURE_VENUE_REVIEWS=true (and VITE_FEATURE_VENUE_REVIEWS).\n"
        "Restart: pm2 restart bookingo-api --update-env\n"
        "Flags stay OFF for Stage 1 — API returns 404 feature_disabled."
    )


if __name__ == "__main__":
    main()
