-- =============================================================================
-- Migration: bảng khoá API cho hệ thống bên ngoài đọc danh mục nguyên liệu
--
--   api_keys: name, enabled, key_prefix, key_hash, rate_limit_per_min,
--             last_used_at, call_count, note
--
-- BẢO MẬT: chỉ lưu SHA-256 của khoá (`key_hash`), KHÔNG lưu khoá gốc. Ai đọc
-- được cơ sở dữ liệu hay bản sao lưu cũng không lấy lại được khoá dùng thật.
-- Khoá gốc chỉ hiện đúng một lần lúc phát trong admin.
--
-- DDL trích từ push chạy trên DB trống ở dev → khớp 100%.
-- AN TOÀN: chỉ CREATE/ADD, idempotent, bọc transaction.
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-api-keys.sql
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.api_keys (
  id                 serial PRIMARY KEY,
  name               varchar NOT NULL,
  enabled            boolean DEFAULT true,
  key_prefix         varchar,
  key_hash           varchar,
  rate_limit_per_min numeric DEFAULT 60,
  last_used_at       timestamp(3) with time zone,
  call_count         numeric DEFAULT 0,
  note               varchar,
  updated_at         timestamp(3) with time zone NOT NULL DEFAULT now(),
  created_at         timestamp(3) with time zone NOT NULL DEFAULT now()
);

-- Tra khoá theo băm ở MỌI lượt gọi API → bắt buộc có index.
CREATE INDEX IF NOT EXISTS api_keys_key_hash_idx   ON public.api_keys USING btree (key_hash);
CREATE INDEX IF NOT EXISTS api_keys_updated_at_idx ON public.api_keys USING btree (updated_at);
CREATE INDEX IF NOT EXISTS api_keys_created_at_idx ON public.api_keys USING btree (created_at);

-- Liên kết khoá tài liệu của Payload (mọi collection đều cần).
ALTER TABLE public.payload_locked_documents_rels
  ADD COLUMN IF NOT EXISTS api_keys_id integer;
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_api_keys_id_idx
  ON public.payload_locked_documents_rels USING btree (api_keys_id);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='payload_locked_documents_rels_api_keys_fk') THEN
    ALTER TABLE public.payload_locked_documents_rels
      ADD CONSTRAINT payload_locked_documents_rels_api_keys_fk
      FOREIGN KEY (api_keys_id) REFERENCES public.api_keys(id) ON DELETE CASCADE;
  END IF;
END$$;

COMMIT;
