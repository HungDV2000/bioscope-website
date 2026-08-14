-- =============================================================================
-- Migration: Câu chào chat chuyển sang rich text (có định dạng)
--
--   chat_settings_locales.welcome_message : varchar → jsonb (Lexical)
--   chat_settings_locales.bubble_message  : varchar → jsonb (Lexical)
--   chat_settings_locales.login_greeting  : jsonb (cột mới — lời chào ở màn
--                                           hình mời đăng nhập trong widget)
--
-- GIỮ NGUYÊN nội dung đang có: văn bản cũ được bọc thành một đoạn Lexical
-- (cấu trúc đã kiểm chứng bằng chính hàm convertLexicalToHTML mà code dùng).
--
-- DDL trích từ push chạy trên DB trống ở dev → khớp 100%.
-- AN TOÀN: idempotent (bỏ qua nếu đã là jsonb), bọc transaction.
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-chat-greeting-richtext.sql
-- =============================================================================

BEGIN;

-- Bọc một chuỗi văn bản thành tài liệu Lexical một đoạn.
CREATE OR REPLACE FUNCTION pg_temp.text_to_lexical(t text)
RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN t IS NULL OR btrim(t) = '' THEN NULL
    ELSE jsonb_build_object('root', jsonb_build_object(
      'type', 'root', 'format', '', 'indent', 0, 'version', 1, 'direction', 'ltr',
      'children', jsonb_build_array(jsonb_build_object(
        'type', 'paragraph', 'format', '', 'indent', 0, 'version', 1, 'direction', 'ltr',
        'textFormat', 0, 'textStyle', '',
        'children', jsonb_build_array(jsonb_build_object(
          'type', 'text', 'detail', 0, 'format', 0, 'mode', 'normal',
          'style', '', 'text', t, 'version', 1))))))
  END
$$;

DO $$
DECLARE
  col text;
BEGIN
  FOREACH col IN ARRAY ARRAY['welcome_message', 'bubble_message'] LOOP
    -- Chỉ đổi khi còn là varchar (chạy lại lần 2 sẽ bỏ qua).
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'chat_settings_locales' AND column_name = col AND data_type <> 'jsonb'
    ) THEN
      EXECUTE format(
        'ALTER TABLE public.chat_settings_locales ALTER COLUMN %I DROP DEFAULT, '
        'ALTER COLUMN %I TYPE jsonb USING pg_temp.text_to_lexical(%I::text)',
        col, col, col);
    END IF;
  END LOOP;
END$$;

-- Lời chào ở màn hình mời đăng nhập (cột mới, để trống = dùng câu mặc định).
ALTER TABLE public.chat_settings_locales
  ADD COLUMN IF NOT EXISTS login_greeting jsonb;

COMMIT;
