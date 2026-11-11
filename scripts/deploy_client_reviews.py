#!/usr/bin/env python3
"""Deploy Stage 3 client reviews: SQL + modules + register routes."""

from datetime import datetime
from pathlib import Path
import shutil
import subprocess
import sys

API = Path("/opt/bookingo-api/src")
INDEX = API / "index.js"
LOCAL = Path(__file__).resolve().parent / "backend"
MIGRATE = Path(__file__).resolve().parent / "migrate_client_reviews.sql"
MODULES = ["clientRisk.js", "clientReviews.js"]


def run(cmd):
    print("+", " ".join(cmd))
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.stdout:
        print(r.stdout)
    if r.returncode:
        print(r.stderr, file=sys.stderr)
        raise SystemExit(r.returncode)


def main():
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    shutil.copy2(INDEX, INDEX.with_suffix(f".js.bak_client_reviews_{stamp}"))

    run(["sudo", "-u", "postgres", "psql", "-d", "bookingo", "-v", "ON_ERROR_STOP=1", "-f", str(MIGRATE)])

    for name in MODULES:
        shutil.copy2(LOCAL / name, API / name)
        run(["node", "--check", str(API / name)])

    idx = INDEX.read_text()
    if "registerClientReviewRoutes" not in idx:
        if "import { registerReviewRoutes } from './reviews.js';" not in idx:
            raise SystemExit("reviews import missing — deploy stage 1 first")
        idx = idx.replace(
            "import { registerReviewRoutes } from './reviews.js';",
            "import { registerReviewRoutes } from './reviews.js';\n"
            "import { registerClientReviewRoutes } from './clientReviews.js';",
            1,
        )
        anchor = "registerReviewRoutes(app, pool, { authenticateToken, requirePartner });"
        if anchor not in idx:
            raise SystemExit("registerReviewRoutes call missing")
        idx = idx.replace(
            anchor,
            anchor + "\nregisterClientReviewRoutes(app, pool, { authenticateToken, requirePartner });",
            1,
        )
        INDEX.write_text(idx)
        print("registered client review routes")
    run(["node", "--check", str(INDEX)])
    print("Done. Keep FEATURE_CLIENT_REVIEWS=false until stage 4. pm2 restart bookingo-api --update-env")


if __name__ == "__main__":
    main()
