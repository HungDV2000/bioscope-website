-- =============================================================================
-- Migration: Thùng rác (soft-delete) — cột `deleted_at`
--
-- Bật trash: true cho 10 collection. Payload thêm field `deletedAt`; xoá là
-- đánh dấu (khôi phục được) thay vì xoá hẳn. Production tắt push nên thiếu file
-- này thì admin lỗi: column <table>.deleted_at does not exist.
--
-- Collection CÓ versions/drafts cần thêm cột ở CẢ bảng phiên bản `_<slug>_v`
-- (prefix version_), y như pattern version_hidden đã dùng trước đó.
--
-- AN TOÀN: chỉ ADD COLUMN (nullable) + INDEX, idempotent, bọc transaction.
--   NULL = chưa xoá (bình thường). Không đụng dữ liệu.
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-trash.sql
-- =============================================================================

BEGIN;

-- ── Bảng chính (mọi collection) ─────────────────────────────────────────────
ALTER TABLE public.media            ADD COLUMN IF NOT EXISTS deleted_at timestamp(3) with time zone;
ALTER TABLE public.forms            ADD COLUMN IF NOT EXISTS deleted_at timestamp(3) with time zone;
ALTER TABLE public.categories       ADD COLUMN IF NOT EXISTS deleted_at timestamp(3) with time zone;
ALTER TABLE public.ingredient_facets ADD COLUMN IF NOT EXISTS deleted_at timestamp(3) with time zone;
ALTER TABLE public.gated_documents  ADD COLUMN IF NOT EXISTS deleted_at timestamp(3) with time zone;
ALTER TABLE public.pages            ADD COLUMN IF NOT EXISTS deleted_at timestamp(3) with time zone;
ALTER TABLE public.posts            ADD COLUMN IF NOT EXISTS deleted_at timestamp(3) with time zone;
ALTER TABLE public.faqs             ADD COLUMN IF NOT EXISTS deleted_at timestamp(3) with time zone;
ALTER TABLE public.case_studies     ADD COLUMN IF NOT EXISTS deleted_at timestamp(3) with time zone;
ALTER TABLE public.ingredients      ADD COLUMN IF NOT EXISTS deleted_at timestamp(3) with time zone;

-- ── Bảng phiên bản (collection có drafts) ───────────────────────────────────
ALTER TABLE public._pages_v         ADD COLUMN IF NOT EXISTS version_deleted_at timestamp(3) with time zone;
ALTER TABLE public._posts_v         ADD COLUMN IF NOT EXISTS version_deleted_at timestamp(3) with time zone;
ALTER TABLE public._faqs_v          ADD COLUMN IF NOT EXISTS version_deleted_at timestamp(3) with time zone;
ALTER TABLE public._case_studies_v  ADD COLUMN IF NOT EXISTS version_deleted_at timestamp(3) with time zone;
ALTER TABLE public._ingredients_v   ADD COLUMN IF NOT EXISTS version_deleted_at timestamp(3) with time zone;

-- ── Index cho truy vấn thùng rác ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS media_deleted_at_idx            ON public.media (deleted_at);
CREATE INDEX IF NOT EXISTS forms_deleted_at_idx            ON public.forms (deleted_at);
CREATE INDEX IF NOT EXISTS categories_deleted_at_idx       ON public.categories (deleted_at);
CREATE INDEX IF NOT EXISTS ingredient_facets_deleted_at_idx ON public.ingredient_facets (deleted_at);
CREATE INDEX IF NOT EXISTS gated_documents_deleted_at_idx  ON public.gated_documents (deleted_at);
CREATE INDEX IF NOT EXISTS pages_deleted_at_idx            ON public.pages (deleted_at);
CREATE INDEX IF NOT EXISTS posts_deleted_at_idx            ON public.posts (deleted_at);
CREATE INDEX IF NOT EXISTS faqs_deleted_at_idx             ON public.faqs (deleted_at);
CREATE INDEX IF NOT EXISTS case_studies_deleted_at_idx     ON public.case_studies (deleted_at);
CREATE INDEX IF NOT EXISTS ingredients_deleted_at_idx      ON public.ingredients (deleted_at);

-- ── Editorial workflow: cờ "Chờ duyệt" trên Ingredients ─────────────────────
-- Checkbox needsReview (boolean) — cùng pattern hidden: cột ở bảng chính +
-- version_ ở bảng phiên bản.
ALTER TABLE public.ingredients     ADD COLUMN IF NOT EXISTS needs_review boolean;
ALTER TABLE public._ingredients_v  ADD COLUMN IF NOT EXISTS version_needs_review boolean;

COMMIT;

-- Kiểm tra:
--   select table_name from information_schema.columns
--     where column_name='deleted_at' order by table_name;
