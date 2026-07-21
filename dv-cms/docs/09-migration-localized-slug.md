# Migration 9 — Slug theo ngôn ngữ (localized slug)

Chuyển trường `slug` từ **một đường dẫn chung** sang **đường dẫn riêng cho từng
ngôn ngữ** (vi/en). Áp dụng cho 10 collection: `pages`, `posts`, `tags`,
`categories`, `ingredients`, `ingredient_categories`, `case_studies`,
`technologies`, `services`, `product_categories`.

## Thay đổi code

- `packages/core/src/fields/slug.ts` → thêm `localized: true`. Hook tự sinh slug
  chạy **theo từng ngôn ngữ** (từ tiêu đề của ngôn ngữ đang chỉnh).
- Frontend không cần sửa: `cmsFetch` đã gắn `?locale=`, nên truy vấn
  `where[slug][equals]` tự khớp slug theo đúng ngôn ngữ.

## ⚠️ Vì sao phải chạy SQL TRƯỚC khi deploy

CMS đang dùng Drizzle **`push`** (tự đồng bộ schema khi khởi động). Khi deploy code
mới, push sẽ **xoá cột `slug` ở bảng chính** và thêm `slug` vào bảng `*_locales`.
Nếu dữ liệu chưa nằm sẵn trong `*_locales`, **toàn bộ slug sẽ mất → cả site 404**.

Script `scripts/migrate-localized-slug.sql` copy slug hiện tại sang locale `vi`
(và seed `en` = `vi`) **trước**, để push chỉ còn xoá cột cũ (dữ liệu đã an toàn).

## Quy trình deploy an toàn

1. **Backup DB** (bắt buộc):
   ```bash
   docker exec dv-cms-db pg_dump -U <user> -Fc <db> > backup_before_slug.dump
   ```
2. **Chạy trên STAGING trước.** Nạp script:
   ```bash
   docker exec -i dv-cms-db psql -U <user> -d <db> < scripts/migrate-localized-slug.sql
   ```
3. **Deploy code** đã có `localized: true`. Push sẽ xoá cột `slug` cũ (an toàn) và
   tạo unique index theo locale.
4. **Kiểm tra:** mở vài trang ở **cả vi và en** (vd `/ve-chung-toi`, một nguyên
   liệu, một case study). Slug vi giữ nguyên; slug en ban đầu = vi.
5. Nếu OK trên staging → lặp lại bước 1–4 trên **production**.
6. Vào admin, chỉnh slug **English** cho các trang muốn URL tiếng Anh khác (tùy chọn).

## Rollback

- Nếu lỗi: `pg_restore -c -d <db> backup_before_slug.dump` và deploy lại bản code cũ
  (bỏ `localized: true`).

## Ghi chú kỹ thuật

- Cả 10 collection đều đã có bảng `*_locales` (vì đã có trường localized khác), nên
  không tạo bảng mới — chỉ thêm cột `slug`.
- Nếu `ON CONFLICT (_parent_id, _locale)` báo lỗi tên ràng buộc, kiểm tra bằng
  `\d+ pages_locales` rồi thay bằng unique constraint thực tế.
- `generateStaticParams` ở frontend dùng nội dung tĩnh nên build không bị ảnh hưởng;
  trang chi tiết (nguyên liệu, case study, giải pháp) resolve theo slug + locale khi
  truy cập.
