-- =============================================================================
-- Migration: mở API nội dung website (/catalog/content/*, /catalog/site)
--
--   enum_api_keys_scopes += 'content', 'site'
--
-- KHÔNG có bảng hay cột mới: hai endpoint mới đọc lại các collection đã có
-- (faqs, services, case-studies, technologies, certifications, posts, pages,
-- ingredient-categories, partners) và global site-settings.
--
-- CỐ Ý KHÔNG cấp sẵn quyền mới cho khoá đang tồn tại.
--   migrate-api-key-scopes.sql trước đây có back-fill, vì lúc đó các endpoint
--   ĐÃ chạy và đối tác đang dùng — không cấp lại là ngắt kết nối của họ.
--   Lần này ngược lại: endpoint hoàn toàn mới, chưa ai phụ thuộc. Cấp sẵn chỉ
--   tổ mở rộng phạm vi của những khoá đã phát mà chủ khoá không hề yêu cầu.
--   Muốn dùng thì vào Admin → Khoá API tích hợp tick thêm "Nội dung website".
--
-- KHÔNG bọc transaction: ALTER TYPE ... ADD VALUE không chạy được trong khối
-- transaction trên PostgreSQL < 12. Hai câu lệnh dưới đều idempotent nên chạy
-- lại nhiều lần vẫn an toàn, không cần transaction để bảo vệ.
--
-- DDL trích từ push chạy thật trên DB trống (dvcms_schemagen) → khớp 100%.
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-api-content-scopes.sql
-- =============================================================================

ALTER TYPE public.enum_api_keys_scopes ADD VALUE IF NOT EXISTS 'content';
ALTER TYPE public.enum_api_keys_scopes ADD VALUE IF NOT EXISTS 'site';

-- Kiểm chứng: phải in ra đủ 5 dòng search/list/detail/content/site.
SELECT enumlabel AS scope_hien_co
  FROM pg_enum e
  JOIN pg_type t ON t.oid = e.enumtypid
 WHERE t.typname = 'enum_api_keys_scopes'
 ORDER BY e.enumsortorder;
