-- =============================================================================
-- Migration: Live Chat — định danh khách + tracking + map non-topic
--   chat_conversations: logged_in, visitor_ip, location
--   chat_messages: index telegram_message_id (map reply khi nhóm KHÔNG dùng Topics)
--
-- DDL trích từ push chạy trên DB trống ở dev → khớp 100%.
-- Production tắt push nên chạy tay.
--
-- AN TOÀN: chỉ ADD, idempotent, bọc transaction.
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-chat-tracking.sql
-- =============================================================================

BEGIN;

ALTER TABLE public.chat_conversations
  ADD COLUMN IF NOT EXISTS logged_in  boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS visitor_ip varchar,
  ADD COLUMN IF NOT EXISTS location   varchar;

CREATE INDEX IF NOT EXISTS chat_messages_telegram_message_id_idx
  ON public.chat_messages USING btree (telegram_message_id);

COMMIT;
