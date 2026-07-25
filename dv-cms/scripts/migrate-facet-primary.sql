-- =============================================================================
-- Migration: thêm nhóm 'primary' vào enum thẻ lọc
--
-- Danh mục chính (Chiết xuất thực vật, Omega & dầu cá, Lợi khuẩn, Hoạt chất
-- công nghệ cao, Nguyên liệu mới) là một GIÁ TRỊ MỚI của enum group. Field
-- `primaries` trên ingredients dùng chung bảng ingredients_rels (phân biệt bằng
-- cột `path`) nên KHÔNG cần cột mới — chỉ cần thêm giá trị enum.
--
-- Sau khi chạy, chạy lại seed để tạo 5 thẻ primary + gán catch-all:
--   docker compose exec cms sh -c "cd /app/apps/core-cms && \
--     pnpm exec payload run src/scripts/facets-seed.ts"
--
-- ALTER TYPE ADD VALUE KHÔNG chạy được trong transaction block ở một số phiên
-- bản Postgres, nên file này KHÔNG bọc BEGIN/COMMIT.
--
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-facet-primary.sql
-- =============================================================================

ALTER TYPE public.enum_ingredient_facets_group ADD VALUE IF NOT EXISTS 'primary';

-- Kiểm tra:
--   select enumlabel from pg_enum e join pg_type t on t.oid=e.enumtypid
--     where t.typname='enum_ingredient_facets_group';
