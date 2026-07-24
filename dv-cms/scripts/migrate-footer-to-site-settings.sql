-- =============================================================================
-- Migration: chuyển thông tin chân trang từ `navigation` sang `site-settings`
--
-- Production chạy NODE_ENV=production nên Drizzle push không chạy (xem
-- migrate-duplicate-scans-favicon.sql). Thiếu file này thì admin lỗi:
--   column site_settings.contact_website does not exist
--
-- ĐIỂM QUAN TRỌNG: file này CÓ CHÉP DỮ LIỆU, không chỉ tạo cột. Thông tin công
-- ty đã nhập trong Navigation (tên, MST, 2 địa chỉ, hotline, email, website)
-- được chép sang Site Settings. Không chạy thì chân trang website trống trơn.
--
-- Cột cũ bên navigation KHÔNG bị xoá — giữ làm bản sao lưu. Muốn dọn thì xoá
-- tay sau khi đã kiểm tra chân trang hiển thị đúng.
--
-- AN TOÀN: chỉ ADD COLUMN + UPDATE có điều kiện, idempotent, bọc transaction.
--   Chép dữ liệu CHỈ khi ô đích đang trống → chạy lại không đè lên sửa tay.
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-footer-to-site-settings.sql
-- =============================================================================

BEGIN;

-- ── 1) Cột mới (không localized) ─────────────────────────────────────────────
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS contact_website varchar;

-- ── 2) Cột mới (localized) ───────────────────────────────────────────────────
ALTER TABLE public.site_settings_locales
  ADD COLUMN IF NOT EXISTS contact_company_name    varchar,
  ADD COLUMN IF NOT EXISTS contact_tagline         varchar,
  ADD COLUMN IF NOT EXISTS contact_office_address  varchar,
  ADD COLUMN IF NOT EXISTS newsletter_title        varchar,
  ADD COLUMN IF NOT EXISTS newsletter_description  varchar,
  ADD COLUMN IF NOT EXISTS newsletter_placeholder  varchar,
  ADD COLUMN IF NOT EXISTS newsletter_button_label varchar,
  ADD COLUMN IF NOT EXISTS copyright               varchar;

-- ── 3) Chép dữ liệu từ navigation → site_settings ────────────────────────────
-- Payload lưu global một dòng duy nhất. Dùng LIMIT 1 phòng trường hợp bảng có
-- nhiều dòng do lịch sử.
DO $$
DECLARE
  nav_id  integer;
  set_id  integer;
BEGIN
  SELECT id INTO nav_id FROM public.navigation ORDER BY created_at LIMIT 1;
  SELECT id INTO set_id FROM public.site_settings ORDER BY created_at LIMIT 1;
  IF nav_id IS NULL OR set_id IS NULL THEN
    RAISE NOTICE 'Chưa có bản ghi navigation hoặc site_settings — bỏ qua bước chép dữ liệu.';
    RETURN;
  END IF;

  -- Cài mới thì navigation chưa từng có companyInfo → không có gì để chép.
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'navigation' AND column_name = 'company_info_tax_code'
  ) THEN
    RAISE NOTICE 'navigation không có companyInfo (cài mới) — bỏ qua bước chép dữ liệu.';
    RETURN;
  END IF;

  -- Trường không localized. COALESCE: chỉ điền khi ô đích đang trống.
  UPDATE public.site_settings s
     SET contact_mst     = COALESCE(NULLIF(s.contact_mst, ''),     n.company_info_tax_code),
         contact_phone   = COALESCE(NULLIF(s.contact_phone, ''),   n.company_info_hotline),
         contact_email   = COALESCE(NULLIF(s.contact_email, ''),   n.company_info_email),
         contact_website = COALESCE(NULLIF(s.contact_website, ''), n.company_info_website)
    FROM public.navigation n
   WHERE s.id = set_id AND n.id = nav_id;

  -- Trường localized: ghép theo _locale để không trộn lẫn vi/en.
  -- navigation_locales chỉ tồn tại khi companyInfo từng có trường localized.
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'navigation_locales') THEN
    RAISE NOTICE 'Không có navigation_locales — chỉ chép được phần không localized.';
    RETURN;
  END IF;

  UPDATE public.site_settings_locales sl
     SET contact_company_name   = COALESCE(NULLIF(sl.contact_company_name, ''),   nl.company_info_name),
         contact_address        = COALESCE(NULLIF(sl.contact_address, ''),        nl.company_info_registered_address),
         contact_office_address = COALESCE(NULLIF(sl.contact_office_address, ''), nl.company_info_office_address)
    FROM public.navigation_locales nl
   WHERE sl._parent_id = set_id
     AND nl._parent_id = nav_id
     AND sl._locale = nl._locale;

  RAISE NOTICE 'Đã chép thông tin công ty từ navigation sang site_settings.';
END$$;

COMMIT;

-- Kiểm tra sau khi chạy:
--   select contact_mst, contact_phone, contact_email, contact_website
--     from site_settings;
--   select _locale, contact_company_name, contact_address, contact_office_address
--     from site_settings_locales;
