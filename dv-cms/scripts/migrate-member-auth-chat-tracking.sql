-- =============================================================================
-- Migration: Đăng nhập thành viên (Google) + tracking chat nâng cao + bóng chào
--
--   members            : auth_provider, google_id, email_verified, has_password
--   auth_settings      : global cấu hình đăng nhập (bảng mới)
--   chat_conversations : member_id, company + vị trí chi tiết + thiết bị + nguồn
--   chat_settings      : bubble_enabled / bubble_delay / bubble_once_per_session
--   chat_settings_locales : bubble_message (đa ngữ)
--
-- DDL trích từ push chạy trên DB trống ở dev → khớp 100%.
-- Production tắt push nên chạy tay.
--
-- AN TOÀN: chỉ CREATE/ADD, idempotent, bọc transaction.
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-member-auth-chat-tracking.sql
-- =============================================================================

BEGIN;

-- ── Enums ───────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='enum_members_auth_provider') THEN
    CREATE TYPE public.enum_members_auth_provider AS ENUM ('password','google');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='enum_chat_conversations_device_type') THEN
    CREATE TYPE public.enum_chat_conversations_device_type AS ENUM ('desktop','mobile','tablet','bot');
  END IF;
END$$;

-- ── members: nguồn đăng nhập ────────────────────────────────────────────────
-- has_password mặc định true: tài khoản đang có đều đăng ký bằng mật khẩu.
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS auth_provider  public.enum_members_auth_provider DEFAULT 'password',
  ADD COLUMN IF NOT EXISTS google_id      varchar,
  ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_password   boolean DEFAULT true;
CREATE INDEX IF NOT EXISTS members_google_id_idx ON public.members USING btree (google_id);

-- ── auth_settings (global cấu hình đăng nhập) ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.auth_settings (
  id                   serial PRIMARY KEY,
  allow_registration   boolean DEFAULT true,
  google_enabled       boolean DEFAULT false,
  google_client_id     varchar,
  google_client_secret varchar,
  updated_at           timestamp(3) with time zone,
  created_at           timestamp(3) with time zone
);

-- ── chat_conversations: tracking nâng cao ───────────────────────────────────
ALTER TABLE public.chat_conversations
  -- Khách
  ADD COLUMN IF NOT EXISTS member_id       integer,
  ADD COLUMN IF NOT EXISTS company         varchar,
  -- Vị trí (ước lượng từ IP, không phải GPS)
  ADD COLUMN IF NOT EXISTS country         varchar,
  ADD COLUMN IF NOT EXISTS region          varchar,
  ADD COLUMN IF NOT EXISTS city            varchar,
  ADD COLUMN IF NOT EXISTS postal          varchar,
  ADD COLUMN IF NOT EXISTS timezone        varchar,
  ADD COLUMN IF NOT EXISTS latitude        numeric,
  ADD COLUMN IF NOT EXISTS longitude       numeric,
  ADD COLUMN IF NOT EXISTS isp             varchar,
  -- Thiết bị
  ADD COLUMN IF NOT EXISTS browser         varchar,
  ADD COLUMN IF NOT EXISTS browser_version varchar,
  ADD COLUMN IF NOT EXISTS os              varchar,
  ADD COLUMN IF NOT EXISTS device_type     public.enum_chat_conversations_device_type,
  ADD COLUMN IF NOT EXISTS screen          varchar,
  ADD COLUMN IF NOT EXISTS language        varchar,
  -- Nguồn truy cập
  ADD COLUMN IF NOT EXISTS referrer        varchar,
  ADD COLUMN IF NOT EXISTS landing_page    varchar,
  ADD COLUMN IF NOT EXISTS page_views      numeric,
  ADD COLUMN IF NOT EXISTS utm_source      varchar,
  ADD COLUMN IF NOT EXISTS utm_medium      varchar,
  ADD COLUMN IF NOT EXISTS utm_campaign    varchar;

CREATE INDEX IF NOT EXISTS chat_conversations_member_idx
  ON public.chat_conversations USING btree (member_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='chat_conversations_member_id_members_id_fk') THEN
    ALTER TABLE public.chat_conversations
      ADD CONSTRAINT chat_conversations_member_id_members_id_fk
      FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE SET NULL;
  END IF;
END$$;

-- user_agent đổi từ varchar sang text (chuỗi UA dài hơn 255 vẫn lưu đủ).
ALTER TABLE public.chat_conversations ALTER COLUMN user_agent TYPE varchar;

-- ── chat_settings: bóng câu chào ────────────────────────────────────────────
ALTER TABLE public.chat_settings
  ADD COLUMN IF NOT EXISTS bubble_enabled           boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS bubble_delay             numeric DEFAULT 5,
  ADD COLUMN IF NOT EXISTS bubble_once_per_session  boolean DEFAULT true;

ALTER TABLE public.chat_settings_locales
  ADD COLUMN IF NOT EXISTS bubble_message varchar
    DEFAULT 'Chào bạn 👋 Cần tư vấn nguyên liệu hay báo giá? Nhắn cho Bioscope nhé!';

COMMIT;
