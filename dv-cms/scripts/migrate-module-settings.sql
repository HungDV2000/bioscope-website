-- =============================================================================
-- Migration: cờ bật/tắt module (tab "Quản lý Module" trong Site Settings)
--
-- VÌ SAO
--   Thêm 4 checkbox bật/tắt module vào global site-settings. Production tắt
--   Drizzle push nên thiếu file này thì admin lỗi khi mở Site Settings:
--     column site_settings.module_ai_generate does not exist
--
-- AN TOÀN
--   * Chỉ ADD COLUMN boolean (nullable) vào bảng global CÓ SẴN — mẫu ADD COLUMN
--     đã dùng nhiều lần (favicon, hidden, footer). Idempotent, bọc transaction.
--   * NULL = coi như BẬT (helper isModuleEnabled: chỉ tắt khi = false) → bản
--     ghi cũ vẫn chạy bình thường.
--   * Field `moduleStatus` là UI (widget), KHÔNG có cột.
--
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-module-settings.sql
-- =============================================================================

BEGIN;

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS module_ai_generate    boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS module_duplicate_scan boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS module_drive_sync     boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS module_clear_cache    boolean DEFAULT true;

COMMIT;

-- Kiểm tra:
--   select column_name from information_schema.columns
--     where table_name='site_settings' and column_name like 'module_%';
