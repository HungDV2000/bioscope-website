-- =============================================================================
-- Migration: hệ thống bình luận bài viết
--
--   post_comments                      : bình luận khách gửi (bảng mới)
--   site_settings.comments_*           : 5 ô cấu hình khu bình luận
--   site_settings_locales.comments_notice : ghi chú dưới khung nhập (đa ngữ)
--   payload_locked_documents_rels      : + post_comments_id
--
-- Bình luận KHÔNG có bản nháp (versions) nên không sinh bảng _post_comments_v.
-- Đã đối chiếu toàn bộ schema để chắc chắn, sau bài học bỏ sót _posts_v_rels ở
-- migrate-post-taxonomies.sql.
--
-- MẶC ĐỊNH AN TOÀN: comments_enabled = false. Bật bình luận là mở một đường ghi
-- cho người lạ, phải là quyết định có chủ đích chứ không tự bật sau khi deploy.
-- comments_require_approval = true để bình luận phải duyệt mới hiện.
--
-- Khoá ngoại post_id dùng ON DELETE SET NULL theo đúng bản push — xoá bài thì
-- bình luận còn lại trong admin để soát, không biến mất im lặng.
--
-- DDL trích từ push chạy thật trên DB trống (dvcms_schemagen) → khớp 100%.
-- AN TOÀN: chỉ CREATE/ADD, idempotent, bọc transaction.
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-post-comments.sql
-- =============================================================================

BEGIN;

-- ── 1. Kiểu trạng thái ──────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='enum_post_comments_status') THEN
    CREATE TYPE public.enum_post_comments_status AS ENUM ('pending','approved','spam');
  END IF;
END$$;

-- ── 2. Bảng bình luận ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.post_comments (
  id           serial PRIMARY KEY,
  post_id      integer NOT NULL,
  status       public.enum_post_comments_status DEFAULT 'pending'::public.enum_post_comments_status NOT NULL,
  author_name  character varying NOT NULL,
  author_email character varying,
  content      character varying NOT NULL,
  author_ip    character varying,
  locale       character varying,
  updated_at   timestamp(3) with time zone DEFAULT now() NOT NULL,
  created_at   timestamp(3) with time zone DEFAULT now() NOT NULL,
  deleted_at   timestamp(3) with time zone
);
CREATE INDEX IF NOT EXISTS post_comments_created_at_idx ON public.post_comments USING btree (created_at);
CREATE INDEX IF NOT EXISTS post_comments_updated_at_idx ON public.post_comments USING btree (updated_at);
CREATE INDEX IF NOT EXISTS post_comments_deleted_at_idx ON public.post_comments USING btree (deleted_at);
CREATE INDEX IF NOT EXISTS post_comments_post_idx       ON public.post_comments USING btree (post_id);
CREATE INDEX IF NOT EXISTS post_comments_status_idx     ON public.post_comments USING btree (status);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='post_comments_post_id_posts_id_fk') THEN
    ALTER TABLE public.post_comments
      ADD CONSTRAINT post_comments_post_id_posts_id_fk
      FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE SET NULL;
  END IF;
END$$;

-- ── 3. Cấu hình trong Cài đặt website ───────────────────────────────────────
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS comments_enabled          boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS comments_require_approval boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS comments_require_email    boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS comments_max_length       numeric DEFAULT 1500,
  ADD COLUMN IF NOT EXISTS comments_per_hour_per_ip  numeric DEFAULT 5;

ALTER TABLE public.site_settings_locales
  ADD COLUMN IF NOT EXISTS comments_notice character varying;

-- ── 4. Khoá tài liệu đang mở trong admin ────────────────────────────────────
ALTER TABLE public.payload_locked_documents_rels
  ADD COLUMN IF NOT EXISTS post_comments_id integer;
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_post_comments_id_idx
  ON public.payload_locked_documents_rels USING btree (post_comments_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='payload_locked_documents_rels_post_comments_fk') THEN
    ALTER TABLE public.payload_locked_documents_rels
      ADD CONSTRAINT payload_locked_documents_rels_post_comments_fk
      FOREIGN KEY (post_comments_id) REFERENCES public.post_comments(id) ON DELETE CASCADE;
  END IF;
END$$;

COMMIT;

-- Kiểm chứng: phải in ra bảng post_comments và 5 ô cấu hình + 1 ô ghi chú.
SELECT 'bảng' AS loai, table_name AS ten FROM information_schema.tables
 WHERE table_schema='public' AND table_name='post_comments'
UNION ALL
SELECT 'cấu hình', column_name FROM information_schema.columns
 WHERE table_name IN ('site_settings','site_settings_locales') AND column_name LIKE 'comments%'
 ORDER BY 1, 2;
