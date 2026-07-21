-- =============================================================================
-- Migration: hồ sơ nguyên liệu (Kỹ thuật / Pháp lý / Nghiên cứu)
--
-- Tạo schema cho các nhóm trường mới của collection `ingredients`:
--   technical.*   → cột trên ingredients / ingredients_locales (+ bản _v)
--   regulatory.*  → cột + 3 bảng con (status, documents, documents_locales)
--   research.*    → cột + 2 bảng con (studies, studies_locales)
--   relatedIngredients → dùng lại bảng ingredients_rels sẵn có (không cần tạo)
--
-- VÌ SAO CẦN FILE NÀY
--   Bản production chạy `next start`; Payload khởi tạo DB theo kiểu lười nên
--   Drizzle `push` không tự chạy lúc boot như ở dev. Kết quả: code mới mong đợi
--   các bảng/cột này nhưng DB chưa có → admin lỗi
--   `relation "_ingredients_v_version_regulatory_status" does not exist`.
--
--   DDL dưới đây được trích XUẤT TỪ SCHEMA THẬT do chính `push` sinh ra ở môi
--   trường dev, nên khớp 100% với thứ Payload mong đợi (tên bảng, cột, index,
--   enum, khoá ngoại).
--
-- AN TOÀN
--   * Chỉ CREATE / ADD COLUMN — không xoá, không sửa dữ liệu sẵn có.
--   * Idempotent: chạy lại nhiều lần không lỗi.
--   * Bọc trong một transaction — sai là rollback sạch.
--   * Vẫn nên backup trước:
--       docker exec dvcms-db pg_dump -U dvcms -Fc dvcms > backup.dump
--
-- CÁCH CHẠY
--   docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-ingredient-dossier.sql
-- =============================================================================

BEGIN;

-- ── 1) Enum cho regulatory.status ───────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_ingredients_regulatory_status') THEN
    CREATE TYPE public.enum_ingredients_regulatory_status
      AS ENUM ('fda_gras', 'efsa', 'vn_moh', 'novel_food');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum__ingredients_v_version_regulatory_status') THEN
    CREATE TYPE public.enum__ingredients_v_version_regulatory_status
      AS ENUM ('fda_gras', 'efsa', 'vn_moh', 'novel_food');
  END IF;
END $$;

-- ── 2) Cột vô hướng trên bảng chính + bảng phiên bản ────────────────────────
ALTER TABLE public.ingredients
  ADD COLUMN IF NOT EXISTS technical_cas_number varchar,
  ADD COLUMN IF NOT EXISTS technical_hs_code varchar,
  ADD COLUMN IF NOT EXISTS technical_e_number varchar,
  ADD COLUMN IF NOT EXISTS technical_particle_size varchar,
  ADD COLUMN IF NOT EXISTS regulatory_registration_no varchar;

ALTER TABLE public.ingredients_locales
  ADD COLUMN IF NOT EXISTS technical_assay varchar,
  ADD COLUMN IF NOT EXISTS technical_standardization varchar,
  ADD COLUMN IF NOT EXISTS technical_appearance varchar,
  ADD COLUMN IF NOT EXISTS technical_solubility varchar,
  ADD COLUMN IF NOT EXISTS technical_shelf_life varchar,
  ADD COLUMN IF NOT EXISTS technical_storage varchar,
  ADD COLUMN IF NOT EXISTS technical_packaging varchar,
  ADD COLUMN IF NOT EXISTS technical_lead_time varchar,
  ADD COLUMN IF NOT EXISTS technical_incompatibility varchar,
  ADD COLUMN IF NOT EXISTS regulatory_usage_limit varchar,
  ADD COLUMN IF NOT EXISTS research_mechanism jsonb;

ALTER TABLE public._ingredients_v
  ADD COLUMN IF NOT EXISTS version_technical_cas_number varchar,
  ADD COLUMN IF NOT EXISTS version_technical_hs_code varchar,
  ADD COLUMN IF NOT EXISTS version_technical_e_number varchar,
  ADD COLUMN IF NOT EXISTS version_technical_particle_size varchar,
  ADD COLUMN IF NOT EXISTS version_regulatory_registration_no varchar;

ALTER TABLE public._ingredients_v_locales
  ADD COLUMN IF NOT EXISTS version_technical_assay varchar,
  ADD COLUMN IF NOT EXISTS version_technical_standardization varchar,
  ADD COLUMN IF NOT EXISTS version_technical_appearance varchar,
  ADD COLUMN IF NOT EXISTS version_technical_solubility varchar,
  ADD COLUMN IF NOT EXISTS version_technical_shelf_life varchar,
  ADD COLUMN IF NOT EXISTS version_technical_storage varchar,
  ADD COLUMN IF NOT EXISTS version_technical_packaging varchar,
  ADD COLUMN IF NOT EXISTS version_technical_lead_time varchar,
  ADD COLUMN IF NOT EXISTS version_technical_incompatibility varchar,
  ADD COLUMN IF NOT EXISTS version_regulatory_usage_limit varchar,
  ADD COLUMN IF NOT EXISTS version_research_mechanism jsonb;

-- ── 3) regulatory.status (select hasMany) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ingredients_regulatory_status (
  "order" integer NOT NULL,
  parent_id integer NOT NULL,
  value public.enum_ingredients_regulatory_status,
  id serial PRIMARY KEY
);
CREATE INDEX IF NOT EXISTS ingredients_regulatory_status_order_idx
  ON public.ingredients_regulatory_status USING btree ("order");
CREATE INDEX IF NOT EXISTS ingredients_regulatory_status_parent_idx
  ON public.ingredients_regulatory_status USING btree (parent_id);

CREATE TABLE IF NOT EXISTS public._ingredients_v_version_regulatory_status (
  "order" integer NOT NULL,
  parent_id integer NOT NULL,
  value public.enum__ingredients_v_version_regulatory_status,
  id serial PRIMARY KEY
);
CREATE INDEX IF NOT EXISTS _ingredients_v_version_regulatory_status_order_idx
  ON public._ingredients_v_version_regulatory_status USING btree ("order");
CREATE INDEX IF NOT EXISTS _ingredients_v_version_regulatory_status_parent_idx
  ON public._ingredients_v_version_regulatory_status USING btree (parent_id);

-- ── 4) regulatory.documents (array + locales) ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.ingredients_regulatory_documents (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id varchar PRIMARY KEY,
  file_id integer
);
CREATE INDEX IF NOT EXISTS ingredients_regulatory_documents_order_idx
  ON public.ingredients_regulatory_documents USING btree (_order);
CREATE INDEX IF NOT EXISTS ingredients_regulatory_documents_parent_id_idx
  ON public.ingredients_regulatory_documents USING btree (_parent_id);
CREATE INDEX IF NOT EXISTS ingredients_regulatory_documents_file_idx
  ON public.ingredients_regulatory_documents USING btree (file_id);

CREATE TABLE IF NOT EXISTS public.ingredients_regulatory_documents_locales (
  title varchar,
  id serial PRIMARY KEY,
  _locale public._locales NOT NULL,
  _parent_id varchar NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS ingredients_regulatory_documents_locales_locale_parent_id_un
  ON public.ingredients_regulatory_documents_locales USING btree (_locale, _parent_id);

CREATE TABLE IF NOT EXISTS public._ingredients_v_version_regulatory_documents (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id serial PRIMARY KEY,
  file_id integer,
  _uuid varchar
);
CREATE INDEX IF NOT EXISTS _ingredients_v_version_regulatory_documents_order_idx
  ON public._ingredients_v_version_regulatory_documents USING btree (_order);
CREATE INDEX IF NOT EXISTS _ingredients_v_version_regulatory_documents_parent_id_idx
  ON public._ingredients_v_version_regulatory_documents USING btree (_parent_id);
CREATE INDEX IF NOT EXISTS _ingredients_v_version_regulatory_documents_file_idx
  ON public._ingredients_v_version_regulatory_documents USING btree (file_id);

CREATE TABLE IF NOT EXISTS public._ingredients_v_version_regulatory_documents_locales (
  title varchar,
  id serial PRIMARY KEY,
  _locale public._locales NOT NULL,
  _parent_id integer NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS _ingredients_v_version_regulatory_documents_locales_locale_p
  ON public._ingredients_v_version_regulatory_documents_locales USING btree (_locale, _parent_id);

-- ── 5) research.studies (array + locales) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ingredients_research_studies (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id varchar PRIMARY KEY,
  url varchar
);
CREATE INDEX IF NOT EXISTS ingredients_research_studies_order_idx
  ON public.ingredients_research_studies USING btree (_order);
CREATE INDEX IF NOT EXISTS ingredients_research_studies_parent_id_idx
  ON public.ingredients_research_studies USING btree (_parent_id);

CREATE TABLE IF NOT EXISTS public.ingredients_research_studies_locales (
  title varchar,
  summary varchar,
  id serial PRIMARY KEY,
  _locale public._locales NOT NULL,
  _parent_id varchar NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS ingredients_research_studies_locales_locale_parent_id_unique
  ON public.ingredients_research_studies_locales USING btree (_locale, _parent_id);

CREATE TABLE IF NOT EXISTS public._ingredients_v_version_research_studies (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id serial PRIMARY KEY,
  url varchar,
  _uuid varchar
);
CREATE INDEX IF NOT EXISTS _ingredients_v_version_research_studies_order_idx
  ON public._ingredients_v_version_research_studies USING btree (_order);
CREATE INDEX IF NOT EXISTS _ingredients_v_version_research_studies_parent_id_idx
  ON public._ingredients_v_version_research_studies USING btree (_parent_id);

CREATE TABLE IF NOT EXISTS public._ingredients_v_version_research_studies_locales (
  title varchar,
  summary varchar,
  id serial PRIMARY KEY,
  _locale public._locales NOT NULL,
  _parent_id integer NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS _ingredients_v_version_research_studies_locales_locale_paren
  ON public._ingredients_v_version_research_studies_locales USING btree (_locale, _parent_id);

-- ── 6) Khoá ngoại (bỏ qua nếu đã có) ────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ingredients_regulatory_status_parent_fk') THEN
    ALTER TABLE public.ingredients_regulatory_status
      ADD CONSTRAINT ingredients_regulatory_status_parent_fk
      FOREIGN KEY (parent_id) REFERENCES public.ingredients(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ingredients_regulatory_documents_parent_id_fk') THEN
    ALTER TABLE public.ingredients_regulatory_documents
      ADD CONSTRAINT ingredients_regulatory_documents_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.ingredients(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ingredients_regulatory_documents_locales_parent_id_fk') THEN
    ALTER TABLE public.ingredients_regulatory_documents_locales
      ADD CONSTRAINT ingredients_regulatory_documents_locales_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.ingredients_regulatory_documents(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ingredients_research_studies_parent_id_fk') THEN
    ALTER TABLE public.ingredients_research_studies
      ADD CONSTRAINT ingredients_research_studies_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.ingredients(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ingredients_research_studies_locales_parent_id_fk') THEN
    ALTER TABLE public.ingredients_research_studies_locales
      ADD CONSTRAINT ingredients_research_studies_locales_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.ingredients_research_studies(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_ingredients_v_version_regulatory_status_parent_fk') THEN
    ALTER TABLE public._ingredients_v_version_regulatory_status
      ADD CONSTRAINT _ingredients_v_version_regulatory_status_parent_fk
      FOREIGN KEY (parent_id) REFERENCES public._ingredients_v(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_ingredients_v_version_regulatory_documents_parent_id_fk') THEN
    ALTER TABLE public._ingredients_v_version_regulatory_documents
      ADD CONSTRAINT _ingredients_v_version_regulatory_documents_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public._ingredients_v(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_ingredients_v_version_regulatory_documents_locales_parent_fk') THEN
    ALTER TABLE public._ingredients_v_version_regulatory_documents_locales
      ADD CONSTRAINT _ingredients_v_version_regulatory_documents_locales_parent_fk
      FOREIGN KEY (_parent_id) REFERENCES public._ingredients_v_version_regulatory_documents(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_ingredients_v_version_research_studies_parent_id_fk') THEN
    ALTER TABLE public._ingredients_v_version_research_studies
      ADD CONSTRAINT _ingredients_v_version_research_studies_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public._ingredients_v(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_ingredients_v_version_research_studies_locales_parent_fk') THEN
    ALTER TABLE public._ingredients_v_version_research_studies_locales
      ADD CONSTRAINT _ingredients_v_version_research_studies_locales_parent_fk
      FOREIGN KEY (_parent_id) REFERENCES public._ingredients_v_version_research_studies(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ── 7) relatedIngredients: cột quan hệ trong bảng rels sẵn có ───────────────
ALTER TABLE public.ingredients_rels    ADD COLUMN IF NOT EXISTS ingredients_id integer;
ALTER TABLE public._ingredients_v_rels ADD COLUMN IF NOT EXISTS ingredients_id integer;

COMMIT;

-- Kiểm tra sau khi chạy:
--   SELECT tablename FROM pg_tables
--    WHERE tablename LIKE '%regulatory%' OR tablename LIKE '%research_studies%'
--    ORDER BY 1;      -- kỳ vọng: 10 bảng
