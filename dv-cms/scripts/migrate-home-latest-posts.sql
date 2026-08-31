-- =============================================================================
-- Migration: khối "Bài viết mới" cho trang chủ
--
--   pages_blocks_home_latest_posts            + _locales
--   _pages_v_blocks_home_latest_posts         + _locales   (bảng PHIÊN BẢN)
--
-- ⚠️ BỐN bảng, không phải hai. Pages bật lưu bản nháp nên mỗi khối sinh ra một
-- bảng bóng `_pages_v_blocks_*` song song. Bỏ sót bảng phiên bản thì trang danh
-- sách Pages trong admin sẽ TRẮNG TRƠN — đúng lỗi đã xảy ra với _posts_v_rels ở
-- migrate-post-taxonomies.sql.
--
-- Khoá ngoại category_id dùng ON DELETE SET NULL (không CASCADE): xoá một chủ đề
-- thì khối mất bộ lọc và quay về "lấy bài mới nhất mọi chủ đề", chứ không tự xoá
-- khối khỏi trang chủ.
--
-- DDL trích từ push chạy thật trên DB trống (dvcms_schemagen) → khớp 100%.
-- AN TOÀN: chỉ CREATE, idempotent, bọc transaction.
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-home-latest-posts.sql
-- =============================================================================

BEGIN;

-- ── 1. Khối ở bản đang xuất bản ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pages_blocks_home_latest_posts (
  _order      integer NOT NULL,
  _parent_id  integer NOT NULL,
  _path       text NOT NULL,
  id          character varying NOT NULL PRIMARY KEY,
  "limit"     numeric DEFAULT 3,
  category_id integer,
  block_name  character varying
);
CREATE INDEX IF NOT EXISTS pages_blocks_home_latest_posts_order_idx     ON public.pages_blocks_home_latest_posts USING btree (_order);
CREATE INDEX IF NOT EXISTS pages_blocks_home_latest_posts_parent_id_idx ON public.pages_blocks_home_latest_posts USING btree (_parent_id);
CREATE INDEX IF NOT EXISTS pages_blocks_home_latest_posts_path_idx      ON public.pages_blocks_home_latest_posts USING btree (_path);
CREATE INDEX IF NOT EXISTS pages_blocks_home_latest_posts_category_idx  ON public.pages_blocks_home_latest_posts USING btree (category_id);

CREATE TABLE IF NOT EXISTS public.pages_blocks_home_latest_posts_locales (
  title       character varying,
  description jsonb,
  view_all    character varying,
  id          serial PRIMARY KEY,
  _locale     public._locales NOT NULL,
  _parent_id  character varying NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS pages_blocks_home_latest_posts_locales_locale_parent_id_uniq
  ON public.pages_blocks_home_latest_posts_locales USING btree (_locale, _parent_id);

-- ── 2. Khối ở bảng PHIÊN BẢN (bản nháp / lịch sử) ───────────────────────────
CREATE TABLE IF NOT EXISTS public._pages_v_blocks_home_latest_posts (
  _order      integer NOT NULL,
  _parent_id  integer NOT NULL,
  _path       text NOT NULL,
  id          serial PRIMARY KEY,
  "limit"     numeric DEFAULT 3,
  category_id integer,
  _uuid       character varying,
  block_name  character varying
);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_home_latest_posts_order_idx     ON public._pages_v_blocks_home_latest_posts USING btree (_order);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_home_latest_posts_parent_id_idx ON public._pages_v_blocks_home_latest_posts USING btree (_parent_id);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_home_latest_posts_path_idx      ON public._pages_v_blocks_home_latest_posts USING btree (_path);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_home_latest_posts_category_idx  ON public._pages_v_blocks_home_latest_posts USING btree (category_id);

CREATE TABLE IF NOT EXISTS public._pages_v_blocks_home_latest_posts_locales (
  title       character varying,
  description jsonb,
  view_all    character varying,
  id          serial PRIMARY KEY,
  _locale     public._locales NOT NULL,
  _parent_id  integer NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS _pages_v_blocks_home_latest_posts_locales_locale_parent_id_u
  ON public._pages_v_blocks_home_latest_posts_locales USING btree (_locale, _parent_id);

-- ── 3. Khoá ngoại ───────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='pages_blocks_home_latest_posts_parent_id_fk') THEN
    ALTER TABLE public.pages_blocks_home_latest_posts
      ADD CONSTRAINT pages_blocks_home_latest_posts_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='pages_blocks_home_latest_posts_category_id_categories_id_fk') THEN
    ALTER TABLE public.pages_blocks_home_latest_posts
      ADD CONSTRAINT pages_blocks_home_latest_posts_category_id_categories_id_fk
      FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='pages_blocks_home_latest_posts_locales_parent_id_fk') THEN
    ALTER TABLE public.pages_blocks_home_latest_posts_locales
      ADD CONSTRAINT pages_blocks_home_latest_posts_locales_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.pages_blocks_home_latest_posts(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='_pages_v_blocks_home_latest_posts_parent_id_fk') THEN
    ALTER TABLE public._pages_v_blocks_home_latest_posts
      ADD CONSTRAINT _pages_v_blocks_home_latest_posts_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public._pages_v(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='_pages_v_blocks_home_latest_posts_category_id_categories_id_fk') THEN
    ALTER TABLE public._pages_v_blocks_home_latest_posts
      ADD CONSTRAINT _pages_v_blocks_home_latest_posts_category_id_categories_id_fk
      FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='_pages_v_blocks_home_latest_posts_locales_parent_id_fk') THEN
    ALTER TABLE public._pages_v_blocks_home_latest_posts_locales
      ADD CONSTRAINT _pages_v_blocks_home_latest_posts_locales_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public._pages_v_blocks_home_latest_posts(id) ON DELETE CASCADE;
  END IF;
END$$;

COMMIT;

-- Kiểm chứng: phải in ra ĐỦ BỐN bảng.
SELECT table_name FROM information_schema.tables
 WHERE table_schema='public' AND table_name LIKE '%blocks_home_latest_posts%'
 ORDER BY 1;
