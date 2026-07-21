-- =============================================================================
-- Migration: slug -> localized (per-language paths)
-- Run ONCE on the target database BEFORE deploying the localized-slug code.
--
-- WHAT IT DOES
--   1. Adds the localized `slug` column to every `*_locales` table.
--   2. Copies the current canonical slug into the `vi` locale row.
--   3. Seeds the `en` slug from `vi` (existing rows only) so English URLs resolve.
--   4. Does the same for draft/version tables (`_x_v.version_slug`).
--   5. DROPS the old non-localized columns.
--
-- WHY STEP 5 MATTERS
--   Drizzle `push` is INTERACTIVE: when it needs to drop a column it prints a
--   "DATA LOSS WARNING" and waits for y/N on stdin. In Docker there is no TTY, so
--   the boot HANGS. By dropping the old columns here, `push` sees no destructive
--   diff on deploy and starts cleanly (it only adds the per-locale unique index).
--
-- DESIGN NOTES (from real dry-runs against a copy of the data)
--   * UPDATE-only into `*_locales` — never INSERT. Those tables have NOT NULL
--     localized columns (e.g. tags_locales.name); inserting a bare row fails.
--     Verified every record already has a `vi` locale row.
--   * Skips collections/tables absent from this build (e.g. product_categories).
--   * Re-runnable: each step is guarded and skips work already done.
--
-- SAFETY
--   1. Backup first:  pg_dump -Fc <db> > backup_before_slug.dump
--   2. Run on STAGING, verify vi + en pages open, then run on production.
--   3. Single transaction — all-or-nothing.
-- =============================================================================

BEGIN;

-- ── 1) Published tables: X.slug -> X_locales.slug ───────────────────────────
DO $$
DECLARE
  t text;
  has_main_slug boolean;
  n_vi bigint;
  n_en bigint;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'pages', 'posts', 'tags', 'categories', 'ingredients',
    'ingredient_categories', 'case_studies', 'technologies',
    'services', 'product_categories'
  ]
  LOOP
    IF to_regclass(t) IS NULL OR to_regclass(t || '_locales') IS NULL THEN
      RAISE NOTICE 'skip %  (table not found)', t;
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS slug varchar', t || '_locales');

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = t AND column_name = 'slug'
    ) INTO has_main_slug;

    IF has_main_slug THEN
      EXECUTE format(
        'UPDATE %1$I l SET slug = m.slug
           FROM %2$I m
          WHERE l._parent_id = m.id AND l._locale = ''vi''
            AND m.slug IS NOT NULL AND (l.slug IS NULL OR l.slug = '''')',
        t || '_locales', t
      );
      GET DIAGNOSTICS n_vi = ROW_COUNT;
    ELSE
      n_vi := 0;
    END IF;

    EXECUTE format(
      'UPDATE %1$I l SET slug = v.slug
         FROM %1$I v
        WHERE l._parent_id = v._parent_id AND v._locale = ''vi'' AND l._locale = ''en''
          AND v.slug IS NOT NULL AND (l.slug IS NULL OR l.slug = '''')',
      t || '_locales'
    );
    GET DIAGNOSTICS n_en = ROW_COUNT;

    RAISE NOTICE '%: vi=% en=%', t, n_vi, n_en;
  END LOOP;
END $$;

-- ── 2) Draft/version tables: _X_v.version_slug -> _X_v_locales.version_slug ──
DO $$
DECLARE
  t text;
  has_col boolean;
  n_vi bigint;
  n_en bigint;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    '_pages_v', '_posts_v', '_ingredients_v', '_technologies_v', '_case_studies_v'
  ]
  LOOP
    IF to_regclass(t) IS NULL OR to_regclass(t || '_locales') IS NULL THEN
      RAISE NOTICE 'skip %  (table not found)', t;
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS version_slug varchar', t || '_locales');

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = t AND column_name = 'version_slug'
    ) INTO has_col;

    IF has_col THEN
      EXECUTE format(
        'UPDATE %1$I l SET version_slug = m.version_slug
           FROM %2$I m
          WHERE l._parent_id = m.id AND l._locale = ''vi''
            AND m.version_slug IS NOT NULL AND (l.version_slug IS NULL OR l.version_slug = '''')',
        t || '_locales', t
      );
      GET DIAGNOSTICS n_vi = ROW_COUNT;
    ELSE
      n_vi := 0;
    END IF;

    EXECUTE format(
      'UPDATE %1$I l SET version_slug = v.version_slug
         FROM %1$I v
        WHERE l._parent_id = v._parent_id AND v._locale = ''vi'' AND l._locale = ''en''
          AND v.version_slug IS NOT NULL AND (l.version_slug IS NULL OR l.version_slug = '''')',
      t || '_locales'
    );
    GET DIAGNOSTICS n_en = ROW_COUNT;

    RAISE NOTICE '%: vi=% en=%', t, n_vi, n_en;
  END LOOP;
END $$;

-- ── 3) Drop the old non-localized columns (keeps `push` non-interactive) ─────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'pages', 'posts', 'tags', 'categories', 'ingredients',
    'ingredient_categories', 'case_studies', 'technologies',
    'services', 'product_categories'
  ]
  LOOP
    IF to_regclass(t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE %I DROP COLUMN IF EXISTS slug', t);
    END IF;
  END LOOP;

  FOREACH t IN ARRAY ARRAY[
    '_pages_v', '_posts_v', '_ingredients_v', '_technologies_v', '_case_studies_v'
  ]
  LOOP
    IF to_regclass(t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE %I DROP COLUMN IF EXISTS version_slug', t);
    END IF;
  END LOOP;
END $$;

COMMIT;

-- Verify:
--   SELECT _locale, count(slug) FROM pages_locales GROUP BY _locale;
--   SELECT _locale, count(version_slug) FROM _pages_v_locales GROUP BY _locale;
