-- =============================================================================
-- Migration: phân quyền động cho khoá API
--
--   api_keys.expires_at  : hạn dùng của khoá (rỗng = không hết hạn)
--   api_keys_scopes      : endpoint mà khoá được phép gọi
--
-- Chặn mặc định: khoá KHÔNG có dòng nào trong api_keys_scopes thì không gọi
-- được endpoint dữ liệu nào. Cấp thừa quyền rồi quên nguy hiểm hơn nhiều so với
-- việc phải quay lại tick thêm một ô.
--
-- DDL trích từ push chạy trên DB trống ở dev → khớp 100%.
-- AN TOÀN: chỉ CREATE/ADD, idempotent, bọc transaction.
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-api-key-scopes.sql
-- =============================================================================

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='enum_api_keys_scopes') THEN
    CREATE TYPE public.enum_api_keys_scopes AS ENUM ('search','list','detail');
  END IF;
END$$;

ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS expires_at timestamp(3) with time zone;

CREATE TABLE IF NOT EXISTS public.api_keys_scopes (
  id        serial PRIMARY KEY,
  "order"   integer NOT NULL,
  parent_id integer NOT NULL,
  value     public.enum_api_keys_scopes
);
CREATE INDEX IF NOT EXISTS api_keys_scopes_order_idx  ON public.api_keys_scopes USING btree ("order");
CREATE INDEX IF NOT EXISTS api_keys_scopes_parent_idx ON public.api_keys_scopes USING btree (parent_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='api_keys_scopes_parent_fk') THEN
    ALTER TABLE public.api_keys_scopes
      ADD CONSTRAINT api_keys_scopes_parent_fk
      FOREIGN KEY (parent_id) REFERENCES public.api_keys(id) ON DELETE CASCADE;
  END IF;
END$$;

-- Khoá đã phát TRƯỚC bản này chưa có phạm vi nào → cấp đủ 3 endpoint để không
-- bỗng dưng ngắt kết nối của đối tác đang dùng. Khoá tạo sau đã có mặc định.
INSERT INTO public.api_keys_scopes ("order", parent_id, value)
SELECT 1, k.id, 'search'::public.enum_api_keys_scopes FROM public.api_keys k
 WHERE NOT EXISTS (SELECT 1 FROM public.api_keys_scopes s WHERE s.parent_id = k.id);
INSERT INTO public.api_keys_scopes ("order", parent_id, value)
SELECT 2, k.id, 'list'::public.enum_api_keys_scopes FROM public.api_keys k
 WHERE NOT EXISTS (SELECT 1 FROM public.api_keys_scopes s WHERE s.parent_id = k.id AND s.value = 'list');
INSERT INTO public.api_keys_scopes ("order", parent_id, value)
SELECT 3, k.id, 'detail'::public.enum_api_keys_scopes FROM public.api_keys k
 WHERE NOT EXISTS (SELECT 1 FROM public.api_keys_scopes s WHERE s.parent_id = k.id AND s.value = 'detail');

COMMIT;
