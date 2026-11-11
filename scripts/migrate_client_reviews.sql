-- BookinGo reviews v1 — Stage 3: manager → client reviews
BEGIN;

CREATE TABLE IF NOT EXISTS client_reviews (
  id SERIAL PRIMARY KEY,
  partner_booking_id INTEGER NOT NULL UNIQUE REFERENCES partner_bookings(id) ON DELETE CASCADE,
  partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  venue_id INTEGER REFERENCES partner_venues(id) ON DELETE SET NULL,
  author_staff_id INTEGER REFERENCES partner_staff(id) ON DELETE SET NULL,
  client_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  client_phone_norm TEXT,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  presets TEXT[] NOT NULL DEFAULT '{}',
  body VARCHAR(300) NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('published', 'hidden')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT client_reviews_identity_chk CHECK (
    client_user_id IS NOT NULL OR (client_phone_norm IS NOT NULL AND client_phone_norm <> '')
  )
);

CREATE INDEX IF NOT EXISTS idx_client_reviews_user_created
  ON client_reviews(client_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_client_reviews_phone_created
  ON client_reviews(client_phone_norm, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_client_reviews_partner
  ON client_reviews(partner_id, created_at DESC);

CREATE TABLE IF NOT EXISTS client_review_photos (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES client_reviews(id) ON DELETE CASCADE,
  partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL,
  mime TEXT NOT NULL,
  size_bytes INTEGER NOT NULL DEFAULT 0,
  sha256 TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_review_photos_review
  ON client_review_photos(review_id);

GRANT ALL ON TABLE client_reviews TO bookingo_user;
GRANT ALL ON TABLE client_review_photos TO bookingo_user;
GRANT USAGE, SELECT ON SEQUENCE client_reviews_id_seq TO bookingo_user;
GRANT USAGE, SELECT ON SEQUENCE client_review_photos_id_seq TO bookingo_user;

COMMIT;
