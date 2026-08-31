-- =============================================================================
-- Migration: taxonomy cho bài viết — Chủ đề, Ngành, Thẻ
--
--   industries / industries_locales : taxonomy NGÀNH (bảng mới)
--   categories                      : + order, deleted_at  (thùng rác + sắp xếp)
--   categories_locales              : + description
--   tags                            : + deleted_at
--   posts_rels                      : + industries_id
--   payload_locked_documents_rels   : + industries_id
--
-- Vì sao tách NGÀNH khỏi CHỦ ĐỀ: hai chiều phân loại độc lập. Một bài "Chứng
-- nhận GMP" (chủ đề) có thể thuộc Dược phẩm lẫn Thực phẩm chức năng. Gộp chung
-- một danh sách thì biên tập viên phải tạo tổ hợp chéo.
--
-- DDL trích từ push chạy thật trên DB trống (dvcms_schemagen) → khớp 100%.
-- AN TOÀN: chỉ CREATE/ADD, idempotent, bọc transaction.
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-post-taxonomies.sql
-- =============================================================================

BEGIN;

-- ── 1. Bảng NGÀNH ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.industries (
  id         serial PRIMARY KEY,
  "order"    numeric DEFAULT 0,
  updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
  created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
  deleted_at timestamp(3) with time zone
);
CREATE INDEX IF NOT EXISTS industries_created_at_idx ON public.industries USING btree (created_at);
CREATE INDEX IF NOT EXISTS industries_updated_at_idx ON public.industries USING btree (updated_at);
CREATE INDEX IF NOT EXISTS industries_deleted_at_idx ON public.industries USING btree (deleted_at);

CREATE TABLE IF NOT EXISTS public.industries_locales (
  name        character varying NOT NULL,
  slug        character varying,
  description character varying,
  id          serial PRIMARY KEY,
  _locale     public._locales NOT NULL,
  _parent_id  integer NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS industries_locales_locale_parent_id_unique
  ON public.industries_locales USING btree (_locale, _parent_id);
CREATE UNIQUE INDEX IF NOT EXISTS industries_slug_idx
  ON public.industries_locales USING btree (slug, _locale);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='industries_locales_parent_id_fk') THEN
    ALTER TABLE public.industries_locales
      ADD CONSTRAINT industries_locales_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.industries(id) ON DELETE CASCADE;
  END IF;
END$$;

-- ── 2. CHỦ ĐỀ: thêm thứ tự, mô tả, thùng rác ────────────────────────────────
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS "order" numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deleted_at timestamp(3) with time zone;
CREATE INDEX IF NOT EXISTS categories_deleted_at_idx ON public.categories USING btree (deleted_at);

ALTER TABLE public.categories_locales
  ADD COLUMN IF NOT EXISTS description character varying;

-- ── 3. THẺ: thùng rác ───────────────────────────────────────────────────────
ALTER TABLE public.tags
  ADD COLUMN IF NOT EXISTS deleted_at timestamp(3) with time zone;
CREATE INDEX IF NOT EXISTS tags_deleted_at_idx ON public.tags USING btree (deleted_at);

-- ── 4. Quan hệ bài viết → ngành ─────────────────────────────────────────────
ALTER TABLE public.posts_rels
  ADD COLUMN IF NOT EXISTS industries_id integer;
CREATE INDEX IF NOT EXISTS posts_rels_industries_id_idx
  ON public.posts_rels USING btree (industries_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='posts_rels_industries_fk') THEN
    ALTER TABLE public.posts_rels
      ADD CONSTRAINT posts_rels_industries_fk
      FOREIGN KEY (industries_id) REFERENCES public.industries(id) ON DELETE CASCADE;
  END IF;
END$$;

-- ── 5. Quan hệ ở BẢNG PHIÊN BẢN của bài viết ────────────────────────────────
-- Posts bật lưu bản nháp (versions.drafts) nên Payload sinh bảng bóng
-- `_posts_v_rels` song song với `posts_rels`. Thêm quan hệ mới mà QUÊN bảng này
-- thì trang danh sách bài viết trong admin trắng trơn: truy vấn phiên bản gãy
-- với lỗi "column _posts_v_rels.industries_id does not exist".
ALTER TABLE public._posts_v_rels
  ADD COLUMN IF NOT EXISTS industries_id integer;
CREATE INDEX IF NOT EXISTS _posts_v_rels_industries_id_idx
  ON public._posts_v_rels USING btree (industries_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='_posts_v_rels_industries_fk') THEN
    ALTER TABLE public._posts_v_rels
      ADD CONSTRAINT _posts_v_rels_industries_fk
      FOREIGN KEY (industries_id) REFERENCES public.industries(id) ON DELETE CASCADE;
  END IF;
END$$;

-- ── 6. Khoá tài liệu đang mở trong admin ────────────────────────────────────
ALTER TABLE public.payload_locked_documents_rels
  ADD COLUMN IF NOT EXISTS industries_id integer;
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_industries_id_idx
  ON public.payload_locked_documents_rels USING btree (industries_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='payload_locked_documents_rels_industries_fk') THEN
    ALTER TABLE public.payload_locked_documents_rels
      ADD CONSTRAINT payload_locked_documents_rels_industries_fk
      FOREIGN KEY (industries_id) REFERENCES public.industries(id) ON DELETE CASCADE;
  END IF;
END$$;

COMMIT;

-- Kiểm chứng: phải in ra 4 bảng và 2 cột industries_id.
SELECT 'bảng' AS loai, table_name AS ten FROM information_schema.tables
 WHERE table_schema='public' AND table_name IN ('industries','industries_locales','categories','tags')
UNION ALL
SELECT 'cột industries_id', table_name FROM information_schema.columns
 WHERE column_name='industries_id' AND table_schema='public'
 ORDER BY 1, 2;
-- Phải in ra ĐỦ BA bảng: posts_rels, _posts_v_rels, payload_locked_documents_rels.
