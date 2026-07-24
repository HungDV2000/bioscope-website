-- =============================================================================
-- Migration: nhóm `pricing` (bảng giá nội bộ) cho collection `ingredients`
--
-- VÌ SAO CẦN FILE NÀY
--   Production chạy NODE_ENV=production nên Drizzle push KHÔNG chạy (xem
--   migrate-duplicate-scans-favicon.sql để biết chi tiết). Mọi cột/bảng mới
--   phải tạo bằng migration. Không chạy file này thì admin lỗi:
--     column ingredients.pricing_currency does not exist
--
--   DDL trích TỪ SCHEMA THẬT do push sinh ở dev, gồm cả bảng versions (_v) vì
--   ingredients có bật draft/publish.
--
-- BẢO MẬT
--   Nhóm `pricing` đã khoá quyền ĐỌC ở cấp trường (isStaffFieldLevel) trong
--   Ingredients.ts — Payload loại nó khỏi API công khai. Cột DB vẫn tồn tại
--   bình thường; việc ẩn xảy ra ở tầng ứng dụng, đã kiểm chứng.
--
-- AN TOÀN: chỉ CREATE / ADD COLUMN, idempotent, bọc transaction.
--   Backup trước: docker exec dvcms-db pg_dump -U dvcms -Fc dvcms > backup.dump
--
-- CÁCH CHẠY
--   docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-ingredient-pricing.sql
-- =============================================================================

BEGIN;

-- ── 1) Enum đơn vị tiền ──────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_ingredients_pricing_currency') THEN
    CREATE TYPE public.enum_ingredients_pricing_currency AS ENUM ('VND', 'USD');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum__ingredients_v_version_pricing_currency') THEN
    CREATE TYPE public.enum__ingredients_v_version_pricing_currency AS ENUM ('VND', 'USD');
  END IF;
END$$;

-- ── 2) Cột nhóm pricing trên bảng chính + bảng versions ──────────────────────
ALTER TABLE public.ingredients
  ADD COLUMN IF NOT EXISTS pricing_quote_date timestamp(3) with time zone,
  ADD COLUMN IF NOT EXISTS pricing_currency public.enum_ingredients_pricing_currency DEFAULT 'VND';

ALTER TABLE public._ingredients_v
  ADD COLUMN IF NOT EXISTS version_pricing_quote_date timestamp(3) with time zone,
  ADD COLUMN IF NOT EXISTS version_pricing_currency public.enum__ingredients_v_version_pricing_currency DEFAULT 'VND';

-- `pricing.terms` là localized → nằm ở bảng _locales.
ALTER TABLE public.ingredients_locales
  ADD COLUMN IF NOT EXISTS pricing_terms varchar;

ALTER TABLE public._ingredients_v_locales
  ADD COLUMN IF NOT EXISTS version_pricing_terms varchar;

-- ── 3) Bảng con cho mảng `pricing.tiers` (bản chính) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.ingredients_pricing_tiers (
  _order     integer NOT NULL,
  _parent_id integer NOT NULL,
  id         varchar PRIMARY KEY,
  moq        varchar,
  price      numeric,
  unit       varchar DEFAULT 'kg',
  note       varchar
);

CREATE INDEX IF NOT EXISTS ingredients_pricing_tiers_order_idx     ON public.ingredients_pricing_tiers (_order);
CREATE INDEX IF NOT EXISTS ingredients_pricing_tiers_parent_id_idx ON public.ingredients_pricing_tiers (_parent_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ingredients_pricing_tiers_parent_id_fk') THEN
    ALTER TABLE public.ingredients_pricing_tiers
      ADD CONSTRAINT ingredients_pricing_tiers_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.ingredients(id) ON DELETE CASCADE;
  END IF;
END$$;

-- ── 4) Bảng con cho `pricing.tiers` (bản versions) ───────────────────────────
-- Bảng _v dùng id serial + cột _uuid (Payload đối chiếu version với bản chính).
CREATE TABLE IF NOT EXISTS public._ingredients_v_version_pricing_tiers (
  _order     integer NOT NULL,
  _parent_id integer NOT NULL,
  id         serial PRIMARY KEY,
  moq        varchar,
  price      numeric,
  unit       varchar DEFAULT 'kg',
  note       varchar,
  _uuid      varchar
);

CREATE INDEX IF NOT EXISTS _ingredients_v_version_pricing_tiers_order_idx     ON public._ingredients_v_version_pricing_tiers (_order);
CREATE INDEX IF NOT EXISTS _ingredients_v_version_pricing_tiers_parent_id_idx ON public._ingredients_v_version_pricing_tiers (_parent_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_ingredients_v_version_pricing_tiers_parent_id_fk') THEN
    ALTER TABLE public._ingredients_v_version_pricing_tiers
      ADD CONSTRAINT _ingredients_v_version_pricing_tiers_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public._ingredients_v(id) ON DELETE CASCADE;
  END IF;
END$$;

COMMIT;

-- Kiểm tra:
--   \d ingredients_pricing_tiers
--   select column_name from information_schema.columns
--     where table_name='ingredients' and column_name like 'pricing%';
