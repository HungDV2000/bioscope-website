# B2 — MÔ HÌNH DỮ LIỆU TOÀN HỆ THỐNG

> Nguồn: các file `collections/` và `globals/` trong `dv-cms/packages/` và
> `dv-cms/apps/core-cms/src/`.
> Cơ sở dữ liệu PostgreSQL hiện có **403 bảng** (gồm cả bảng phụ cho trường đa
> ngữ, mảng và quan hệ).

---

## Cách đọc bảng

| Cột | Ý nghĩa |
|---|---|
| **Công khai** | Ra được API và website |
| **Nội bộ** | Chỉ nhân viên xem trong admin |
| **Cá nhân** | Chứa dữ liệu cá nhân — có nghĩa vụ pháp lý kèm theo |

---

## 1. Nội dung công khai

| Nhóm dữ liệu | Nội dung | Nháp | Ra API |
|---|---|:--:|:--:|
| `ingredients` | Nguyên liệu — 1.557 bản ghi | ✅ | ✅ |
| `ingredient-categories` | Danh mục nguyên liệu | | ✅ |
| `ingredient-facets` | Thẻ phân loại: công dụng, bản chất, dạng, đặc tính | | ✅ |
| `technologies` | Công nghệ áp dụng | ✅ | ✅ |
| `services` | Dịch vụ | | ✅ |
| `certifications` | Chứng nhận và năng lực | | ✅ |
| `case-studies` | Dự án tiêu biểu | ✅ | ✅ |
| `faqs` | Câu hỏi thường gặp | ✅ | ✅ |
| `posts` | Bài viết, blog | ✅ | ✅ |
| `pages` | Trang nội dung dựng bằng khối | ✅ | ✅ |
| `categories`, `tags` | Phân loại bài viết | | |
| `partners` | Đối tác | | ✅ |
| `media` | Ảnh và tệp | | *(qua URL)* |

> ⚠️ Bản nháp **không bao giờ** ra API hay website. Bảo đảm ở tầng quyền Payload
> bằng `overrideAccess: false`, không phụ thuộc bên gọi.

### Global công khai

| Global | Nội dung |
|---|---|
| `site-settings` | Tên site, liên hệ, mạng xã hội, chân trang, ⚠️ *và mã đo lường GA4/GTM/Pixel — phần này không ra API* |
| `navigation` | Menu |
| `branding` | Logo, màu |
| `seo-settings` | SEO mặc định |
| `home` | Trang chủ *(giữ lại, đã ẩn trong admin)* |

---

## 2. ⛔ Dữ liệu cá nhân — không ra API

| Nhóm dữ liệu | Chứa gì |
|---|---|
| `members` | **Tài khoản thành viên B2B**: email, họ tên, điện thoại, công ty, mã số thuế, chức vụ, loại khách, trạng thái duyệt, mã Google, mật khẩu đã băm |
| `chat-conversations` | **Phiên chat khách**: tên, email, IP, quốc gia/tỉnh/thành phố, mã bưu chính, múi giờ, toạ độ, nhà mạng, trình duyệt, hệ điều hành, loại thiết bị, độ phân giải, User-Agent, trang vào đầu tiên, trang giới thiệu, số trang đã xem |
| `chat-messages` | Toàn bộ nội dung tin nhắn khách |
| `form-submissions` | Nội dung khách gửi qua biểu mẫu |
| `consent-log` | Nhật ký đồng ý cookie |
| `users` | Tài khoản nhân viên |

**Đây là nhóm nhạy cảm nhất của hệ thống.** Nghĩa vụ pháp lý đi kèm ở
[B6](B6-bao-mat-quyen-rieng-tu.md).

Mức tracking trong `chat-conversations` là **chi tiết tới toạ độ địa lý và cấu
hình thiết bị**. Việc này bắt buộc phải được nêu trong chính sách quyền riêng tư
và có cơ chế đồng ý.

---

## 3. Dữ liệu nội bộ — không ra API

| Nhóm dữ liệu | Vai trò |
|---|---|
| `api-keys` | Khoá API: băm khoá, quyền, hạn dùng, giới hạn tần suất, số lượt gọi |
| `gated-documents` | Tài liệu B2B — chỉ đối tác đã duyệt |
| `audit-logs` | Nhật ký thao tác trong admin |
| `security-events` | Sự kiện bảo mật |
| `blocked-ips` | Danh sách IP bị chặn |
| `staff-roles` | Vai trò và phân quyền |
| `redirects` | Chuyển hướng URL |
| `languages` | Cấu hình ngôn ngữ |
| `forms` | Định nghĩa biểu mẫu |
| `content-type-definitions`, `taxonomy-definitions`, `field-groups` | Định nghĩa kiểu nội dung tuỳ biến |

### Bản ghi công việc chạy nền

| Nhóm dữ liệu | Ghi lại |
|---|---|
| `drive-sync-jobs` | Đồng bộ Google Drive |
| `ai-generate-jobs` | Sinh nội dung AI |
| `cms-sync-runs` | Đồng bộ từ CMS nguồn |
| `duplicate-scans` | Quét trùng nguyên liệu |

Các bảng này là **bằng chứng vận hành** — giữ lại, đừng xoá định kỳ.

### Global nội bộ

| Global | Nội dung nhạy cảm |
|---|---|
| `ai-settings` | **Khoá API OpenRouter / OpenAI** |
| `auth-settings` | **Google OAuth client secret** |
| `chat-settings` | **Telegram bot token**, cấu hình câu chào |
| `security-settings` | Cấu hình bảo mật |
| `image-settings` | Cấu hình xử lý ảnh |

⚠️ Năm global này chứa bí mật hệ thống. Chỉ quản trị viên đọc và sửa.

---

## 4. Quan hệ chính

```
ingredients ──┬─→ ingredient-categories
              ├─→ ingredient-facets   (primaries, functions, natures, forms, properties)
              ├─→ partners
              ├─→ technologies
              ├─→ media               (featuredImage, gallery, documents)
              └─← gated-documents

pages ────────→ blocks (hero, stats, featureGrid, gallery, cta, richText, videoEmbed, logoCloud)
posts ────────→ categories, tags, users, media

members ──────┬─← chat-conversations
              └─← gated-documents     (quyền truy cập)

chat-conversations ──→ chat-messages
```

---

## 5. Ranh giới ra API

Ba lớp chặn độc lập:

| Lớp | Cơ chế | Chặn được gì |
|---|---|---|
| 1 | `overrideAccess: false` | Bản nháp, trường gắn quyền chỉ-nhân-viên |
| 2 | Danh sách trường `select` | Dữ liệu không rời khỏi cơ sở dữ liệu |
| 3 | Hàm nặn dữ liệu liệt kê tay | Thêm trường nhạy cảm sau này cũng không tự lọt ra |

Ngoài ra `endpoints/content.ts` có **danh sách trắng** ở tầng máy chủ: nhóm dữ
liệu không khai báo trong danh sách thì trả `404`, kèm chốt chặn thứ hai
`NEVER_EXPOSE` — khai nhầm dữ liệu cá nhân vào danh sách thì máy chủ **không
khởi động được**, thay vì âm thầm rò rỉ.

---

## 6. Đa ngữ

Trường đánh dấu đa ngữ lưu **hai bản riêng** cho `vi` và `en`, ở bảng phụ có
cột `_locale`. Đây là lý do 403 bảng cho khoảng 35 nhóm dữ liệu.

Hệ quả cần nhớ khi viết truy vấn: lọc `like` trên trường **nhiều giá trị + đa
ngữ** sẽ sinh SQL hỏng. Chi tiết ở [A1](../A-ai-cap-nhat-san-pham/A1-mo-hinh-du-lieu-nguyen-lieu.md) mục 3.
