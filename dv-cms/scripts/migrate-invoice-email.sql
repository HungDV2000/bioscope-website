-- =============================================================================
-- Migration: thêm `contact.invoiceEmail` vào global Site Settings
--
-- Production chạy NODE_ENV=production nên Drizzle push không chạy (xem
-- migrate-duplicate-scans-favicon.sql). Thiếu file này thì admin lỗi:
--   column site_settings.contact_invoice_email does not exist
--
-- Cột trích từ schema thật do push sinh ở dev. Trường không localized nên chỉ
-- nằm ở bảng chính, không có bảng _locales.
--
-- AN TOÀN: chỉ ADD COLUMN, idempotent.
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-invoice-email.sql
-- =============================================================================

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS contact_invoice_email varchar;

-- Kiểm tra:
--   select column_name from information_schema.columns
--     where table_name='site_settings' and column_name like 'contact_%';
