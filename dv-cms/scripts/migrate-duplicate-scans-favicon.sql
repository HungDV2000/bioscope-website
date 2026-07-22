-- =============================================================================
-- Migration: `duplicate-scans` + `branding.favicon` + `ai_generate_jobs.usage`
--
-- VÌ SAO CẦN FILE NÀY
--   Production chạy với NODE_ENV=production. Trong @payloadcms/db-postgres
--   (dist/connect.js dòng ~110) Drizzle push bị chặn thẳng ở điều kiện:
--     if (process.env.NODE_ENV !== 'production' && ... && this.push !== false)
--   Nghĩa là `push: true` trong payload.config.ts CHỈ có tác dụng ở dev. Trên
--   server, mọi bảng/cột mới phải được tạo bằng tay hoặc bằng migration.
--   Không chạy file này thì admin lỗi:
--     relation "duplicate_scans" does not exist
--     column branding.favicon_id does not exist
--     column ai_generate_jobs.usage does not exist
--
--   DDL dưới đây được TRÍCH TỪ SCHEMA THẬT do chính `push` sinh ra trên một DB
--   trống ở môi trường dev, nên khớp 100% với thứ Payload mong đợi (tên bảng,
--   cột, kiểu, enum, index, khoá ngoại).
--
-- AN TOÀN
--   * Chỉ CREATE / ADD COLUMN — không xoá, không sửa dữ liệu sẵn có.
--   * Idempotent: chạy lại nhiều lần không lỗi.
--   * Bọc trong một transaction — sai là rollback sạch.
--   * Vẫn nên backup trước:
--       docker exec dvcms-db pg_dump -U dvcms -Fc dvcms > backup.dump
--
-- CÁCH CHẠY
--   docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-duplicate-scans-favicon.sql
-- =============================================================================

BEGIN;

-- ── 1) Enum ─────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_duplicate_scans_status') THEN
    CREATE TYPE public.enum_duplicate_scans_status
      AS ENUM ('queued', 'running', 'done', 'error', 'cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_duplicate_scans_logs_level') THEN
    CREATE TYPE public.enum_duplicate_scans_logs_level
      AS ENUM ('info', 'warn', 'error');
  END IF;
END$$;

-- ── 2) Bảng chính ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.duplicate_scans (
  id                serial PRIMARY KEY,
  target_collection varchar NOT NULL,
  target_label      varchar,
  status            public.enum_duplicate_scans_status NOT NULL DEFAULT 'queued',
  phase             varchar,
  config            jsonb,
  groups_found      numeric,
  docs_scanned      numeric,
  docs_in_groups    numeric,
  results           jsonb,
  error_message     varchar,
  started_at        timestamp(3) with time zone,
  finished_at       timestamp(3) with time zone,
  updated_at        timestamp(3) with time zone NOT NULL DEFAULT now(),
  created_at        timestamp(3) with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS duplicate_scans_created_at_idx        ON public.duplicate_scans (created_at);
CREATE INDEX IF NOT EXISTS duplicate_scans_updated_at_idx        ON public.duplicate_scans (updated_at);
CREATE INDEX IF NOT EXISTS duplicate_scans_status_idx            ON public.duplicate_scans (status);
CREATE INDEX IF NOT EXISTS duplicate_scans_target_collection_idx ON public.duplicate_scans (target_collection);

-- ── 3) Bảng con cho mảng `logs` ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.duplicate_scans_logs (
  _order     integer NOT NULL,
  _parent_id integer NOT NULL,
  id         varchar PRIMARY KEY,
  ts         varchar,
  level      public.enum_duplicate_scans_logs_level,
  message    varchar
);

CREATE INDEX IF NOT EXISTS duplicate_scans_logs_order_idx     ON public.duplicate_scans_logs (_order);
CREATE INDEX IF NOT EXISTS duplicate_scans_logs_parent_id_idx ON public.duplicate_scans_logs (_parent_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'duplicate_scans_logs_parent_id_fk'
  ) THEN
    ALTER TABLE public.duplicate_scans_logs
      ADD CONSTRAINT duplicate_scans_logs_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.duplicate_scans(id) ON DELETE CASCADE;
  END IF;
END$$;

-- ── 4) Liên kết vào payload_locked_documents_rels ───────────────────────────
-- Payload thêm một cột FK cho MỌI collection ở bảng này (cơ chế khoá tài liệu
-- khi có người đang sửa). Thiếu cột này thì mở bất kỳ document nào cũng lỗi.
ALTER TABLE public.payload_locked_documents_rels
  ADD COLUMN IF NOT EXISTS duplicate_scans_id integer;

CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_duplicate_scans_id_idx
  ON public.payload_locked_documents_rels (duplicate_scans_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_duplicate_scans_fk'
  ) THEN
    ALTER TABLE public.payload_locked_documents_rels
      ADD CONSTRAINT payload_locked_documents_rels_duplicate_scans_fk
      FOREIGN KEY (duplicate_scans_id) REFERENCES public.duplicate_scans(id) ON DELETE CASCADE;
  END IF;
END$$;

-- ── 5) branding.favicon ─────────────────────────────────────────────────────
ALTER TABLE public.branding
  ADD COLUMN IF NOT EXISTS favicon_id integer;

CREATE INDEX IF NOT EXISTS branding_favicon_idx ON public.branding (favicon_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'branding_favicon_id_media_id_fk'
  ) THEN
    ALTER TABLE public.branding
      ADD CONSTRAINT branding_favicon_id_media_id_fk
      FOREIGN KEY (favicon_id) REFERENCES public.media(id) ON DELETE SET NULL;
  END IF;
END$$;

-- ── 6) ai_generate_jobs.usage ───────────────────────────────────────────────
-- Thêm ở commit "AI sinh đủ hồ sơ nguyên liệu" để lưu số token + chi phí mỗi
-- job. Cùng lý do như trên: push không chạy ở production nên cột chưa tồn tại,
-- và job AI sẽ lỗi khi ghi kết quả.
ALTER TABLE public.ai_generate_jobs
  ADD COLUMN IF NOT EXISTS usage jsonb;

COMMIT;

-- ── Kiểm tra sau khi chạy ───────────────────────────────────────────────────
--   \d duplicate_scans
--   select column_name from information_schema.columns
--     where table_name='branding' and column_name='favicon_id';
