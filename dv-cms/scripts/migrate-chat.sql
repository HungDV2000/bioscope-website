-- =============================================================================
-- Migration: Live Chat (Web ↔ Telegram) — chat_conversations, chat_messages,
-- chat_settings (+ _locales)
--
-- DDL TRÍCH TỪ push chạy trên DB trống ở dev → khớp 100% (bảng, enum, index,
-- FK, cột rel ở payload_locked_documents_rels). Production tắt push nên chạy tay.
--
-- AN TOÀN: chỉ CREATE/ADD, idempotent, bọc transaction.
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-chat.sql
-- =============================================================================

BEGIN;

-- ── Enums ───────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='enum_chat_conversations_status') THEN
    CREATE TYPE public.enum_chat_conversations_status AS ENUM ('open','closed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='enum_chat_messages_sender') THEN
    CREATE TYPE public.enum_chat_messages_sender AS ENUM ('visitor','agent','system');
  END IF;
END$$;

-- ── chat_conversations ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id                serial PRIMARY KEY,
  title             varchar,
  session_token     varchar,
  status            public.enum_chat_conversations_status DEFAULT 'open',
  visitor_name      varchar,
  visitor_email     varchar,
  telegram_topic_id numeric,
  start_page        varchar,
  user_agent        varchar,
  last_message_at   timestamp(3) with time zone,
  updated_at        timestamp(3) with time zone NOT NULL DEFAULT now(),
  created_at        timestamp(3) with time zone NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_conversations_session_token_idx ON public.chat_conversations (session_token);
CREATE INDEX IF NOT EXISTS chat_conversations_status_idx        ON public.chat_conversations (status);
CREATE INDEX IF NOT EXISTS chat_conversations_visitor_email_idx ON public.chat_conversations (visitor_email);
CREATE INDEX IF NOT EXISTS chat_conversations_created_at_idx    ON public.chat_conversations (created_at);
CREATE INDEX IF NOT EXISTS chat_conversations_updated_at_idx    ON public.chat_conversations (updated_at);

-- ── chat_messages ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id                  serial PRIMARY KEY,
  conversation_id     integer NOT NULL,
  sender              public.enum_chat_messages_sender NOT NULL,
  text                varchar NOT NULL,
  agent_name          varchar,
  telegram_message_id numeric,
  updated_at          timestamp(3) with time zone NOT NULL DEFAULT now(),
  created_at          timestamp(3) with time zone NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_messages_conversation_idx ON public.chat_messages (conversation_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx   ON public.chat_messages (created_at);
CREATE INDEX IF NOT EXISTS chat_messages_updated_at_idx   ON public.chat_messages (updated_at);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='chat_messages_conversation_id_chat_conversations_id_fk') THEN
    ALTER TABLE public.chat_messages
      ADD CONSTRAINT chat_messages_conversation_id_chat_conversations_id_fk
      FOREIGN KEY (conversation_id) REFERENCES public.chat_conversations(id) ON DELETE SET NULL;
  END IF;
END$$;

-- ── chat_settings (global) + locales ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_settings (
  id             serial PRIMARY KEY,
  enabled        boolean DEFAULT false,
  bot_token      varchar,
  sales_chat_id  varchar,
  webhook_secret varchar,
  updated_at     timestamp(3) with time zone,
  created_at     timestamp(3) with time zone
);
CREATE TABLE IF NOT EXISTS public.chat_settings_locales (
  id              serial PRIMARY KEY,
  widget_title    varchar DEFAULT 'Bioscope hỗ trợ',
  welcome_message varchar DEFAULT 'Chào bạn 👋 Bioscope có thể giúp gì cho bạn về nguyên liệu / báo giá?',
  offline_message varchar DEFAULT 'Hiện chưa có nhân viên trực. Để lại email, chúng tôi sẽ liên hệ lại sớm nhất.',
  _locale         public._locales NOT NULL,
  _parent_id      integer NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS chat_settings_locales_locale_parent_id_unique
  ON public.chat_settings_locales (_locale, _parent_id);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='chat_settings_locales_parent_id_fk') THEN
    ALTER TABLE public.chat_settings_locales
      ADD CONSTRAINT chat_settings_locales_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.chat_settings(id) ON DELETE CASCADE;
  END IF;
END$$;

-- ── Liên kết payload_locked_documents_rels (cho MỌI collection) ──────────────
ALTER TABLE public.payload_locked_documents_rels
  ADD COLUMN IF NOT EXISTS chat_conversations_id integer,
  ADD COLUMN IF NOT EXISTS chat_messages_id integer;
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_chat_conversations_id_idx
  ON public.payload_locked_documents_rels (chat_conversations_id);
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_chat_messages_id_idx
  ON public.payload_locked_documents_rels (chat_messages_id);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='payload_locked_documents_rels_chat_conversations_fk') THEN
    ALTER TABLE public.payload_locked_documents_rels
      ADD CONSTRAINT payload_locked_documents_rels_chat_conversations_fk
      FOREIGN KEY (chat_conversations_id) REFERENCES public.chat_conversations(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='payload_locked_documents_rels_chat_messages_fk') THEN
    ALTER TABLE public.payload_locked_documents_rels
      ADD CONSTRAINT payload_locked_documents_rels_chat_messages_fk
      FOREIGN KEY (chat_messages_id) REFERENCES public.chat_messages(id) ON DELETE CASCADE;
  END IF;
END$$;

COMMIT;
