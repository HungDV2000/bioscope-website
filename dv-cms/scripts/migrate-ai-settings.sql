-- =============================================================================
-- Migration: Cài đặt AI (OpenRouter / OpenAI) + quyền xem giá cho khoá API
--
--   ai_settings          : global chọn nhà cung cấp + model + khoá (bảng mới)
--   api_keys.allow_pricing : bật/tắt cho từng khoá được đọc bảng giá
--
-- allow_pricing MẶC ĐỊNH false — bảng giá là dữ liệu thương mại, phải bật có
-- chủ đích cho từng bên chứ không mở sẵn.
--
-- DDL trích từ push chạy trên DB trống ở dev → khớp 100%.
-- AN TOÀN: chỉ CREATE/ADD, idempotent, bọc transaction.
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-ai-settings.sql
-- =============================================================================

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='enum_ai_settings_provider') THEN
    CREATE TYPE public.enum_ai_settings_provider AS ENUM ('openrouter','openai');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.ai_settings (
  id                 serial PRIMARY KEY,
  provider           public.enum_ai_settings_provider NOT NULL DEFAULT 'openrouter',
  open_router_api_key varchar,
  open_ai_api_key     varchar,
  app_name           varchar DEFAULT 'Bioscope CMS',
  content_model      varchar,
  vision_model       varchar,
  image_api_key      varchar,
  image_prompt_model varchar,
  image_model        varchar,
  updated_at         timestamp(3) with time zone,
  created_at         timestamp(3) with time zone
);

-- Bảng giá chỉ mở cho khoá được bật riêng.
ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS allow_pricing boolean DEFAULT false;

COMMIT;
