-- =============================================================================
-- Migration: Nhật ký thay đổi (audit-logs)
--
-- Bảng MỚI cho collection audit-logs (ghi ai tạo/sửa/xoá nội dung nào). DDL
-- dưới đây TRÍCH TỪ SCHEMA THẬT do `push` sinh trên DB trống ở dev → khớp 100%
-- (bảng, cột, enum, index, khoá ngoại). Production tắt push nên phải chạy tay.
--
-- AN TOÀN: chỉ CREATE/ADD, idempotent, bọc transaction.
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-audit-logs.sql
-- =============================================================================

BEGIN;

-- ── Enum action ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_audit_logs_action') THEN
    CREATE TYPE public.enum_audit_logs_action AS ENUM ('create', 'update', 'delete');
  END IF;
END$$;

-- ── Bảng chính ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id              serial PRIMARY KEY,
  summary         varchar,
  action          public.enum_audit_logs_action,
  collection_slug varchar,
  document_id     varchar,
  document_title  varchar,
  user_email      varchar,
  user_name       varchar,
  updated_at      timestamp(3) with time zone NOT NULL DEFAULT now(),
  created_at      timestamp(3) with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_action_idx          ON public.audit_logs (action);
CREATE INDEX IF NOT EXISTS audit_logs_collection_slug_idx ON public.audit_logs (collection_slug);
CREATE INDEX IF NOT EXISTS audit_logs_user_email_idx      ON public.audit_logs (user_email);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx      ON public.audit_logs (created_at);
CREATE INDEX IF NOT EXISTS audit_logs_updated_at_idx      ON public.audit_logs (updated_at);

-- ── Liên kết vào payload_locked_documents_rels (Payload thêm cho MỌI collection) ─
ALTER TABLE public.payload_locked_documents_rels
  ADD COLUMN IF NOT EXISTS audit_logs_id integer;

CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_audit_logs_id_idx
  ON public.payload_locked_documents_rels (audit_logs_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_audit_logs_fk') THEN
    ALTER TABLE public.payload_locked_documents_rels
      ADD CONSTRAINT payload_locked_documents_rels_audit_logs_fk
      FOREIGN KEY (audit_logs_id) REFERENCES public.audit_logs(id) ON DELETE CASCADE;
  END IF;
END$$;

COMMIT;

-- Kiểm tra: \d audit_logs
