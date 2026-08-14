-- =============================================================================
-- Migration: Nhận ảnh/tệp sales gửi từ Telegram
--
--   chat_messages: telegram_file_id, attachment_kind, attachment_name
--
-- Chỉ lưu file_id của Telegram, KHÔNG lưu file vào thư viện Media: tệp sales
-- gửi có thể là báo giá/hợp đồng riêng của một khách, mà Media thì đọc công
-- khai. Nội dung tải theo yêu cầu qua /api/chat/file (kiểm phiên của khách).
--
-- DDL trích từ push chạy trên DB trống ở dev → khớp 100%.
-- AN TOÀN: chỉ CREATE/ADD, idempotent, bọc transaction.
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-chat-attachments.sql
-- =============================================================================

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='enum_chat_messages_attachment_kind') THEN
    CREATE TYPE public.enum_chat_messages_attachment_kind AS ENUM ('photo','document','voice','video');
  END IF;
END$$;

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS telegram_file_id varchar,
  ADD COLUMN IF NOT EXISTS attachment_kind  public.enum_chat_messages_attachment_kind,
  ADD COLUMN IF NOT EXISTS attachment_name  varchar;

COMMIT;
