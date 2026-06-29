-- Partial schema sync after enabling Payload folders + Google Font select on Branding.
-- Safe to re-run (IF NOT EXISTS). Run: pnpm db:sync-folders-schema

BEGIN;

-- ── Folders: rel columns Payload expects ─────────────────────────────────────
ALTER TABLE payload_locked_documents_rels
  ADD COLUMN IF NOT EXISTS payload_folders_id integer;

CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_payload_folders_id_idx
  ON payload_locked_documents_rels (payload_folders_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_payload_folders_fk'
  ) THEN
    ALTER TABLE payload_locked_documents_rels
      ADD CONSTRAINT payload_locked_documents_rels_payload_folders_fk
      FOREIGN KEY (payload_folders_id) REFERENCES payload_folders (id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE media ADD COLUMN IF NOT EXISTS folder_id integer;

CREATE INDEX IF NOT EXISTS media_folder_idx ON media (folder_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'media_folder_id_payload_folders_id_fk'
  ) THEN
    ALTER TABLE media
      ADD CONSTRAINT media_folder_id_payload_folders_id_fk
      FOREIGN KEY (folder_id) REFERENCES payload_folders (id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payload_folders_folder_id_payload_folders_id_fk'
  ) THEN
    ALTER TABLE payload_folders
      ADD CONSTRAINT payload_folders_folder_id_payload_folders_id_fk
      FOREIGN KEY (folder_id) REFERENCES payload_folders (id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS payload_folders_folder_idx ON payload_folders (folder_id);

-- ── Branding: Google Font enum columns ───────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_branding_font_family') THEN
    CREATE TYPE enum_branding_font_family AS ENUM (
      'be-vietnam-pro', 'inter', 'plus-jakarta-sans', 'dm-sans', 'manrope',
      'nunito-sans', 'open-sans', 'roboto', 'source-sans-3', 'work-sans',
      'montserrat', 'lato'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_branding_frontend_theme_font_family') THEN
    CREATE TYPE enum_branding_frontend_theme_font_family AS ENUM (
      'be-vietnam-pro', 'inter', 'plus-jakarta-sans', 'dm-sans', 'manrope',
      'nunito-sans', 'open-sans', 'roboto', 'source-sans-3', 'work-sans',
      'montserrat', 'lato'
    );
  END IF;
END $$;

UPDATE branding SET font_family = 'be-vietnam-pro'
WHERE font_family IS NULL OR font_family = '' OR font_family LIKE '%,%';

ALTER TABLE branding
  ADD COLUMN IF NOT EXISTS frontend_theme_font_family varchar DEFAULT 'be-vietnam-pro';

UPDATE branding SET frontend_theme_font_family = 'be-vietnam-pro'
WHERE frontend_theme_font_family IS NULL OR frontend_theme_font_family = '' OR frontend_theme_font_family LIKE '%,%';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'branding' AND column_name = 'font_family' AND udt_name = 'varchar'
  ) THEN
    ALTER TABLE branding ALTER COLUMN font_family DROP DEFAULT;
    ALTER TABLE branding
      ALTER COLUMN font_family TYPE enum_branding_font_family
      USING font_family::enum_branding_font_family;
    ALTER TABLE branding
      ALTER COLUMN font_family SET DEFAULT 'be-vietnam-pro'::enum_branding_font_family;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'branding' AND column_name = 'frontend_theme_font_family' AND udt_name = 'varchar'
  ) THEN
    ALTER TABLE branding ALTER COLUMN frontend_theme_font_family DROP DEFAULT;
    ALTER TABLE branding
      ALTER COLUMN frontend_theme_font_family TYPE enum_branding_frontend_theme_font_family
      USING frontend_theme_font_family::enum_branding_frontend_theme_font_family;
    ALTER TABLE branding
      ALTER COLUMN frontend_theme_font_family SET DEFAULT 'be-vietnam-pro'::enum_branding_frontend_theme_font_family;
  END IF;
END $$;

COMMIT;
