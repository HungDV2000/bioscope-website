-- =============================================================================
-- Migration: phân loại khách hàng cá nhân / doanh nghiệp
--
--   members: customer_type (enum), tax_code, position
--
-- Khách DOANH NGHIỆP cần tên công ty (bắt buộc), mã số thuế, chức vụ.
-- Khách CÁ NHÂN chỉ cần họ tên + liên hệ.
--
-- Tài khoản CŨ được gán 'business': trước đây form đăng ký luôn bắt nhập tên
-- công ty nên toàn bộ đều là khách doanh nghiệp. Tài khoản tạo qua Google chưa
-- có công ty thì để trống, khách tự chọn lại ở trang Tài khoản.
--
-- DDL trích từ push chạy trên DB trống ở dev → khớp 100%.
-- AN TOÀN: chỉ CREATE/ADD, idempotent, bọc transaction.
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-member-customer-type.sql
-- =============================================================================

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='enum_members_customer_type') THEN
    CREATE TYPE public.enum_members_customer_type AS ENUM ('business','individual');
  END IF;
END$$;

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS customer_type public.enum_members_customer_type,
  ADD COLUMN IF NOT EXISTS tax_code      varchar,
  ADD COLUMN IF NOT EXISTS position      varchar;

CREATE INDEX IF NOT EXISTS members_customer_type_idx
  ON public.members USING btree (customer_type);

-- Tài khoản đã có + có tên công ty → chắc chắn là khách doanh nghiệp.
UPDATE public.members
   SET customer_type = 'business'
 WHERE customer_type IS NULL
   AND company IS NOT NULL
   AND btrim(company) <> '';

COMMIT;
