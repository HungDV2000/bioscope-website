-- Schema for the Navigation global's `companyInfo` group (footer company details).
--
-- The `navigation` global previously had NO localized field at its root, so the
-- `navigation_locales` table never existed. companyInfo adds three localized
-- fields (name / registeredAddress / officeAddress), which require it.
--
-- Idempotent — safe to re-run. Use this instead of dbPush when the interactive
-- schema-push prompt can't be answered (e.g. non-TTY deploys).
--
--   docker compose exec -T db psql -U dvcms -d dvcms \
--     < apps/core-cms/src/scripts/add-navigation-company-info.sql

-- Non-localized companyInfo columns on the global itself.
ALTER TABLE "navigation" ADD COLUMN IF NOT EXISTS "company_info_tax_code" varchar;
ALTER TABLE "navigation" ADD COLUMN IF NOT EXISTS "company_info_hotline"  varchar;
ALTER TABLE "navigation" ADD COLUMN IF NOT EXISTS "company_info_email"    varchar;
ALTER TABLE "navigation" ADD COLUMN IF NOT EXISTS "company_info_website"  varchar;

-- Localized companyInfo fields live in the per-locale side table.
CREATE TABLE IF NOT EXISTS "navigation_locales" (
  "company_info_name"               varchar,
  "company_info_registered_address" varchar,
  "company_info_office_address"     varchar,
  "id"         serial PRIMARY KEY,
  "_locale"    "_locales" NOT NULL,
  "_parent_id" integer NOT NULL REFERENCES "navigation"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "navigation_locales_locale_parent_id_unique"
  ON "navigation_locales" ("_locale", "_parent_id");
