-- =============================================================================
-- Migration: collection `ingredient-facets` (thẻ lọc nguyên liệu)
--
-- Production chạy NODE_ENV=production nên Drizzle push không chạy (xem
-- migrate-duplicate-scans-favicon.sql). Thiếu file này thì admin lỗi:
--   relation "ingredient_facets" does not exist
--
-- DDL trích TỪ SCHEMA THẬT do push sinh ở dev, gồm cả bảng versions (_v) vì
-- ingredients có bật draft/publish.
--
-- SAU KHI CHẠY, phải seed dữ liệu thẻ + gán cho nguyên liệu cũ:
--   docker compose exec cms sh -c "cd /app/apps/core-cms && \
--     pnpm exec payload run src/scripts/facets-seed.ts"
--   (thêm --dry để chạy thử trước, không ghi gì)
--
-- AN TOÀN: chỉ CREATE / ADD COLUMN, idempotent, bọc transaction.
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-ingredient-facets.sql
-- =============================================================================

BEGIN;

-- ── 1) Enum nhóm thẻ ─────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_ingredient_facets_group') THEN
    CREATE TYPE public.enum_ingredient_facets_group
      AS ENUM ('function', 'nature', 'form', 'property');
  END IF;
END$$;

-- ── 2) Bảng chính ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ingredient_facets (
  id         serial PRIMARY KEY,
  "group"    public.enum_ingredient_facets_group NOT NULL,
  "order"    numeric DEFAULT 100,
  updated_at timestamp(3) with time zone NOT NULL DEFAULT now(),
  created_at timestamp(3) with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ingredient_facets_created_at_idx ON public.ingredient_facets (created_at);
CREATE INDEX IF NOT EXISTS ingredient_facets_updated_at_idx ON public.ingredient_facets (updated_at);
CREATE INDEX IF NOT EXISTS ingredient_facets_group_idx      ON public.ingredient_facets ("group");

-- ── 3) Bảng bản dịch (name/slug/description đều localized) ───────────────────
CREATE TABLE IF NOT EXISTS public.ingredient_facets_locales (
  name        varchar NOT NULL,
  slug        varchar,
  description varchar,
  id          serial PRIMARY KEY,
  _locale     public._locales NOT NULL,
  _parent_id  integer NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ingredient_facets_locales_parent_id_fk') THEN
    ALTER TABLE public.ingredient_facets_locales
      ADD CONSTRAINT ingredient_facets_locales_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.ingredient_facets(id) ON DELETE CASCADE;
  END IF;
END$$;

CREATE UNIQUE INDEX IF NOT EXISTS ingredient_facets_locales_locale_parent_id_unique
  ON public.ingredient_facets_locales (_locale, _parent_id);
CREATE UNIQUE INDEX IF NOT EXISTS ingredient_facets_slug_idx
  ON public.ingredient_facets_locales (slug, _locale);

-- ── 4) Bảng cho trường `keywords` (text hasMany) ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.ingredient_facets_texts (
  id        serial PRIMARY KEY,
  "order"   integer NOT NULL,
  parent_id integer NOT NULL,
  path      varchar NOT NULL,
  text      varchar
);

CREATE INDEX IF NOT EXISTS ingredient_facets_texts_order_parent
  ON public.ingredient_facets_texts ("order", parent_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ingredient_facets_texts_parent_fk') THEN
    ALTER TABLE public.ingredient_facets_texts
      ADD CONSTRAINT ingredient_facets_texts_parent_fk
      FOREIGN KEY (parent_id) REFERENCES public.ingredient_facets(id) ON DELETE CASCADE;
  END IF;
END$$;

-- ── 5) Cột quan hệ ở các bảng _rels ──────────────────────────────────────────
-- Payload lưu MỌI quan hệ hasMany của một collection trong một bảng _rels
-- chung, phân biệt bằng cột `path`. Nên 4 trường (functions/natures/forms/
-- properties) dùng CHUNG một cột ingredient_facets_id — không cần 4 cột.
ALTER TABLE public.ingredients_rels
  ADD COLUMN IF NOT EXISTS ingredient_facets_id integer;
ALTER TABLE public._ingredients_v_rels
  ADD COLUMN IF NOT EXISTS ingredient_facets_id integer;
ALTER TABLE public.payload_locked_documents_rels
  ADD COLUMN IF NOT EXISTS ingredient_facets_id integer;

CREATE INDEX IF NOT EXISTS ingredients_rels_ingredient_facets_id_idx
  ON public.ingredients_rels (ingredient_facets_id);
CREATE INDEX IF NOT EXISTS _ingredients_v_rels_ingredient_facets_id_idx
  ON public._ingredients_v_rels (ingredient_facets_id);
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_ingredient_facets_id_idx
  ON public.payload_locked_documents_rels (ingredient_facets_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ingredients_rels_ingredient_facets_fk') THEN
    ALTER TABLE public.ingredients_rels
      ADD CONSTRAINT ingredients_rels_ingredient_facets_fk
      FOREIGN KEY (ingredient_facets_id) REFERENCES public.ingredient_facets(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_ingredients_v_rels_ingredient_facets_fk') THEN
    ALTER TABLE public._ingredients_v_rels
      ADD CONSTRAINT _ingredients_v_rels_ingredient_facets_fk
      FOREIGN KEY (ingredient_facets_id) REFERENCES public.ingredient_facets(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_ingredient_facets_fk') THEN
    ALTER TABLE public.payload_locked_documents_rels
      ADD CONSTRAINT payload_locked_documents_rels_ingredient_facets_fk
      FOREIGN KEY (ingredient_facets_id) REFERENCES public.ingredient_facets(id) ON DELETE CASCADE;
  END IF;
END$$;

COMMIT;

-- Kiểm tra:
--   \d ingredient_facets
--   select column_name from information_schema.columns
--     where table_name='ingredients_rels' and column_name='ingredient_facets_id';
