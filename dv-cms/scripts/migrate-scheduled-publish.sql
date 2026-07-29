-- =============================================================================
-- Migration: Đăng theo lịch (scheduled publish) — cột `publish_at`
--
-- Field date publishAt trên Ingredients (lưu nháp + đặt giờ → runner tự xuất
-- bản). DDL khớp push chạy trên DB trống ở dev: cột ở bảng chính + version_ ở
-- bảng phiên bản (Ingredients có drafts). Không có index.
--
-- AN TOÀN: chỉ ADD COLUMN (nullable), idempotent, bọc transaction.
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-scheduled-publish.sql
-- =============================================================================

BEGIN;

ALTER TABLE public.ingredients
  ADD COLUMN IF NOT EXISTS publish_at timestamp(3) with time zone;

ALTER TABLE public._ingredients_v
  ADD COLUMN IF NOT EXISTS version_publish_at timestamp(3) with time zone;

COMMIT;

-- Kiểm tra:
--   select table_name,column_name from information_schema.columns
--     where column_name in ('publish_at','version_publish_at');
