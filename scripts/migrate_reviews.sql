-- BookinGo reviews v1 — Stage 1 foundation (idempotent)
-- venue_reviews + partner_bookings.user_id/completed_at + venue aggregates
-- client_reviews tables arrive in Stage 3

BEGIN;

ALTER TABLE partner_bookings
  ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE partner_bookings
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_partner_bookings_user_id
  ON partner_bookings(user_id);

CREATE INDEX IF NOT EXISTS idx_partner_bookings_partner_status
  ON partner_bookings(partner_id, status);

CREATE INDEX IF NOT EXISTS idx_partner_bookings_code
  ON partner_bookings(code);

-- Backfill user_id from client bookings by shared code
UPDATE partner_bookings pb
SET user_id = b.user_id
FROM bookings b
WHERE pb.user_id IS NULL
  AND b.code IS NOT NULL
  AND b.code = pb.code
  AND b.user_id IS NOT NULL;

-- Backfill completed_at for already completed rows (date + time_to, Europe/Moscow)
UPDATE partner_bookings
SET completed_at = (
  ((date::text || ' ' || COALESCE(time_to::text, '00:00'))::timestamp
    AT TIME ZONE 'Europe/Moscow')
)
WHERE status = 'completed'
  AND completed_at IS NULL
  AND date IS NOT NULL;

ALTER TABLE partner_venues
  ADD COLUMN IF NOT EXISTS rating_avg NUMERIC(3, 2);

ALTER TABLE partner_venues
  ADD COLUMN IF NOT EXISTS rating_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS venue_reviews (
  id SERIAL PRIMARY KEY,
  partner_booking_id INTEGER NOT NULL UNIQUE REFERENCES partner_bookings(id) ON DELETE CASCADE,
  booking_code TEXT,
  venue_id INTEGER NOT NULL REFERENCES partner_venues(id) ON DELETE CASCADE,
  partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  tags TEXT[] NOT NULL DEFAULT '{}',
  body TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'published', 'rejected', 'hidden')),
  moderation_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  moderated_at TIMESTAMPTZ,
  slot_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_reviews_venue_status_created
  ON venue_reviews(venue_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_venue_reviews_pending
  ON venue_reviews(status)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_venue_reviews_user
  ON venue_reviews(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS venue_review_replies (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL UNIQUE REFERENCES venue_reviews(id) ON DELETE CASCADE,
  partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  staff_id INTEGER REFERENCES partner_staff(id) ON DELETE SET NULL,
  author_role TEXT NOT NULL CHECK (author_role IN ('owner', 'manager')),
  body VARCHAR(1000) NOT NULL,
  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('pending', 'published', 'rejected', 'hidden')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_moderation_log (
  id SERIAL PRIMARY KEY,
  review_type TEXT NOT NULL CHECK (review_type IN ('venue', 'client')),
  review_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  actor TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT ALL ON TABLE venue_reviews TO bookingo_user;
GRANT ALL ON TABLE venue_review_replies TO bookingo_user;
GRANT ALL ON TABLE review_moderation_log TO bookingo_user;
GRANT USAGE, SELECT ON SEQUENCE venue_reviews_id_seq TO bookingo_user;
GRANT USAGE, SELECT ON SEQUENCE venue_review_replies_id_seq TO bookingo_user;
GRANT USAGE, SELECT ON SEQUENCE review_moderation_log_id_seq TO bookingo_user;

COMMIT;
