-- =============================================================================
-- Migration: cột `hidden` cho Ingredients (ẩn hoàn toàn khỏi website)
--
-- VÌ SAO CẦN
--   Thêm checkbox "Ẩn khỏi website" vào collection Ingredients. Production chạy
--   NODE_ENV=production nên Drizzle push KHÔNG chạy (xem
--   migrate-duplicate-scans-favicon.sql) — thiếu file này thì admin lỗi khi mở
--   nguyên liệu: column ingredients.hidden does not exist.
--
--   Ingredients bật versions/drafts nên cột phải có ở CẢ hai bảng:
--     - ingredients            (bản published/hiện hành)
--     - _ingredients_v         (snapshot phiên bản, cột prefix version_)
--   `hidden` không localized nên nằm ở bảng chính, không phải *_locales.
--
-- AN TOÀN
--   * Chỉ ADD COLUMN, không đụng dữ liệu. Idempotent. Bọc transaction.
--   * Kiểu boolean nullable — khớp cách Payload/Drizzle sinh cho checkbox
--     (featured cũng là boolean nullable). Frontend lọc where[hidden][not_equals]=true
--     nên bản ghi null (chưa set) vẫn hiển thị bình thường.
--
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-ingredient-hidden.sql
-- =============================================================================

BEGIN;

ALTER TABLE public.ingredients
  ADD COLUMN IF NOT EXISTS hidden boolean;

ALTER TABLE public._ingredients_v
  ADD COLUMN IF NOT EXISTS version_hidden boolean;

COMMIT;

-- Kiểm tra:
--   select column_name from information_schema.columns
--     where table_name='ingredients' and column_name='hidden';
--   select column_name from information_schema.columns
--     where table_name='_ingredients_v' and column_name='version_hidden';
