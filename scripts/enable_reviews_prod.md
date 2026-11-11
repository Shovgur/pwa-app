# Reviews go-live checklist (Stage 4)

Do **not** flip flags until legal sign-off on оферта / политика / правила отзывов.

## Staging
1. Set on API host env:
   - `FEATURE_VENUE_REVIEWS=true`
   - `FEATURE_CLIENT_REVIEWS=true` (optional second wave)
   - `REVIEWS_ADMIN_KEY=...`
2. Rebuild FE with:
   - `VITE_FEATURE_VENUE_REVIEWS=true`
   - `VITE_FEATURE_CLIENT_REVIEWS=true`
3. Smoke:
   - Client leaves venue review after completed/paid visit
   - Review appears on `/venue/:id`
   - Partner replies on `/partner/reviews`
   - Complete booking → client review dialog
   - Client sees «Отзывы обо мне» in profile
   - Other partner cannot read client reviews (403/empty)

## Production
1. Publish PDFs under `public/docs/` (oferta, politika, pravila-otzyvov).
2. Confirm footer links in `src/content/legalDocs.ts`.
3. Enable venue flag first, then client flag.
4. Kill-switch: set flags to `false` + `pm2 restart` / redeploy FE — UI and API hide features; aggregates remain.

## Rollback SQL
Tables can stay; disabling flags is enough. Do not DROP without backup.
