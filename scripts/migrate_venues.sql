-- BookinGo: таблицы площадок партнёра
-- Уже применено на сервере 2026-08-24. Для DBeaver — проверь, что все 5 таблиц есть.

CREATE TABLE IF NOT EXISTS partner_venues (
  id                  SERIAL PRIMARY KEY,
  partner_id          INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  name                VARCHAR(200) NOT NULL,
  venue_kind          VARCHAR(20) NOT NULL CHECK (venue_kind IN ('sport','pool','loft','meeting')),
  city                VARCHAR(100) NOT NULL,
  address             VARCHAR(300) NOT NULL,
  description         TEXT NOT NULL DEFAULT '',
  base_price_per_hour INTEGER NOT NULL DEFAULT 0,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  amenities           JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_venue_photos (
  id          SERIAL PRIMARY KEY,
  venue_id    INTEGER NOT NULL REFERENCES partner_venues(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  is_cover    BOOLEAN NOT NULL DEFAULT false,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS partner_venue_time_prices (
  id              SERIAL PRIMARY KEY,
  venue_id        INTEGER NOT NULL REFERENCES partner_venues(id) ON DELETE CASCADE,
  label           VARCHAR(100) NOT NULL DEFAULT '',
  time_from       TIME NOT NULL,
  time_to         TIME NOT NULL,
  price_per_hour  INTEGER NOT NULL CHECK (price_per_hour > 0)
);

CREATE TABLE IF NOT EXISTS partner_venue_duration_prices (
  id          SERIAL PRIMARY KEY,
  venue_id    INTEGER NOT NULL REFERENCES partner_venues(id) ON DELETE CASCADE,
  label       VARCHAR(100) NOT NULL DEFAULT '',
  hours       INTEGER NOT NULL CHECK (hours > 0),
  price       INTEGER NOT NULL CHECK (price > 0)
);

CREATE TABLE IF NOT EXISTS partner_venue_extras (
  id          SERIAL PRIMARY KEY,
  venue_id    INTEGER NOT NULL REFERENCES partner_venues(id) ON DELETE CASCADE,
  name        VARCHAR(200) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price       INTEGER NOT NULL CHECK (price > 0),
  billing     VARCHAR(20) NOT NULL CHECK (billing IN ('per_booking','per_hour','per_person'))
);

CREATE INDEX IF NOT EXISTS idx_partner_venues_partner ON partner_venues(partner_id);
