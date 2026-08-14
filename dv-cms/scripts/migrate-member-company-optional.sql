-- =============================================================================
-- Migration: cho phép members.company để trống (đăng nhập bằng Google)
--
-- Google KHÔNG cung cấp tên công ty. Trường `company` đã được đổi sang kiểm tra
-- có điều kiện ở tầng Payload (bắt buộc với người tự đăng ký, cho phép trống
-- với tài khoản Google), NHƯNG cột trong DB vẫn còn NOT NULL từ lần tạo bảng
-- đầu tiên → insert báo lỗi và khách không đăng nhập Google được.
--
-- `contact_name` GIỮ NGUYÊN NOT NULL: Google luôn có tên, và endpoint lùi về
-- phần trước @ của email nên không bao giờ rỗng.
--
-- DDL trích từ push chạy trên DB trống ở dev → khớp 100%.
-- AN TOÀN: chỉ nới lỏng ràng buộc, không đụng dữ liệu, idempotent.
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-member-company-optional.sql
-- =============================================================================

BEGIN;

ALTER TABLE public.members ALTER COLUMN company DROP NOT NULL;

COMMIT;
