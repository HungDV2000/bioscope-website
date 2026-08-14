-- =============================================================================
-- Migration: tài khoản Google chưa khai loại → gán CÁ NHÂN
--
-- Google không cho biết khách là cá nhân hay doanh nghiệp và cũng không có tên
-- công ty, nên tài khoản tạo qua Google trước bản này đang để trống loại. Code
-- nay mặc định cá nhân; điền sẵn vào DB để admin nhìn danh sách thấy rõ ràng
-- thay vì ô trống trông như thiếu dữ liệu.
--
-- CHỈ đụng tài khoản CHƯA khai loại — ai đã chọn rồi thì giữ nguyên.
--
-- AN TOÀN: chỉ cập nhật giá trị NULL, idempotent (chạy lại không đổi gì thêm).
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-google-member-individual.sql
-- =============================================================================

BEGIN;

UPDATE public.members
   SET customer_type = 'individual'
 WHERE customer_type IS NULL
   AND (company IS NULL OR btrim(company) = '');

COMMIT;
