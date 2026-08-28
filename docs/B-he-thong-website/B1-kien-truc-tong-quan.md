# B1 — KIẾN TRÚC TỔNG QUAN

> Nguồn: `dv-cms/apps/core-cms/src/payload.config.ts`, `dv-cms/package.json`

---

## 1. Hai ứng dụng, một kho mã

```
bioscope-website/
├── SRS_BIOSCOPE.md                    đặc tả yêu cầu
├── BIOSCOPE - Tài liệu khảo sát...md  khảo sát khách hàng
├── docs/                              bộ hồ sơ này
└── dv-cms/                            kho mã đơn thể (monorepo)
    ├── apps/
    │   ├── core-cms/                  CMS + API   → admin.bioscope.vn
    │   └── bioscope-frontend/         website     → bioscope.vn
    ├── packages/                      12 module dùng chung
    ├── scripts/                       25 migration SQL
    └── docs/                          tài liệu kỹ thuật vận hành
```

Quản lý bằng **pnpm workspace + Turborepo**. Hai ứng dụng dùng chung các module
trong `packages/`, không sao chép mã.

---

## 2. Nền tảng

| Thành phần | Phiên bản | Vai trò |
|---|---|---|
| Node.js | ≥ 22 | Môi trường chạy |
| pnpm | 9.15.9 | Quản lý gói |
| TypeScript | 5.9.3 | Ngôn ngữ |
| Payload CMS | 3.85.1 | Nền quản trị nội dung |
| Next.js | 16.2.9 | Nền web, cả hai ứng dụng |
| React | 19.2.7 | Giao diện |
| PostgreSQL + Drizzle | | Cơ sở dữ liệu |
| Docker Compose | | Đóng gói và triển khai |

Phần **tự phát triển** nằm ở `apps/` và `packages/` — xem
[D4](../D-san-xuat-phan-mem-noi-bo/D4-cong-doan-3-lap-trinh.md) để biết khối lượng cụ thể.

---

## 3. Ba tầng

```
┌─────────────────────────────────────────────────────┐
│  NGƯỜI DÙNG                                          │
│  Khách · Thành viên B2B · Biên tập viên · Quản trị   │
└───────────────┬─────────────────────┬───────────────┘
                │                     │
┌───────────────▼──────────┐  ┌───────▼───────────────┐
│  bioscope.vn             │  │  admin.bioscope.vn    │
│  bioscope-frontend       │  │  core-cms             │
│                          │  │                       │
│  · 25 route, song ngữ    │  │  · Giao diện quản trị │
│  · Khu thành viên        │  │  · API danh mục       │
│  · Widget chat           │  │  · API nội dung       │
└───────────────┬──────────┘  └───────┬───────────────┘
                │                     │
                └──────────┬──────────┘
                           │
                ┌──────────▼──────────┐
                │  PostgreSQL         │
                └─────────────────────┘
```

Frontend gọi CMS qua HTTP nội bộ. Trong Docker dùng tên dịch vụ, không đi vòng
ra Internet.

---

## 4. Bản đồ 12 module

Module là plugin Payload, bật tắt theo dự án. Thứ tự nạp trong
`payload.config.ts` có ý nghĩa — module sau vá cấu hình module trước.

| # | Module | Vai trò |
|---:|---|---|
| 1 | `core` | Nền chung: Pages, Posts, Media, Users, Forms, Redirects, điều hướng, thương hiệu |
| 2 | `module-image` | Xử lý và tối ưu ảnh |
| 3 | `module-custom-types` | Cho phép định nghĩa kiểu nội dung ngay trong admin |
| 4 | `module-blocks` | Bộ khối dựng trang: hero, stats, feature grid, gallery, CTA, rich text, video, logo cloud |
| 5 | `module-catalog` | Đối tác. *(Danh mục sản phẩm tắt — Bioscope có danh mục riêng)* |
| 6 | `module-bioscope` | **Nghiệp vụ riêng Bioscope**: nguyên liệu, thẻ phân loại, công nghệ, dịch vụ, chứng nhận, dự án, FAQ, đồng bộ, sinh nội dung AI, quét trùng |
| 7 | `module-b2b` | Thành viên và tài liệu giới hạn |
| 8 | `module-seo` | Thẻ SEO, sitemap |
| 9 | `module-languages` | Đa ngữ vi/en |
| 10 | `module-security` | Chặn IP, nhật ký sự kiện bảo mật |
| 11 | `module-consent` | Đồng ý cookie |
| 12 | `module-permissions` | Phân quyền theo vai trò, nhật ký thao tác |

Nguyên tắc chống lệ thuộc: nghiệp vụ Bioscope nằm gọn trong `module-bioscope`.
Nâng cấp Payload không phải sửa rải rác khắp nơi.

---

## 5. Luồng dữ liệu chính

### Khách xem trang nguyên liệu

```
Trình duyệt → bioscope-frontend → HTTP nội bộ → core-cms → PostgreSQL
```

Frontend đọc qua `cmsFetch` có đặt thời gian chờ. CMS ngừng thì frontend rơi về
nội dung tĩnh dự phòng thay vì treo trang.

### Biên tập viên sửa nội dung

```
Admin → Payload → PostgreSQL
                → gọi làm mới bộ nhớ đệm frontend
```

Sửa trong admin, web cập nhật ngay, không cần triển khai lại.

### Khách chat

```
Widget → frontend → core-cms → Telegram (chủ đề riêng mỗi khách)
                             → PostgreSQL (lưu lịch sử)
```

Chi tiết ở [C1](../C-chatbot-ai-tich-hop/C1-kien-truc-chat-tren-web.md).

### Chatbot ngoài lấy dữ liệu

```
Chatbot → khoá API → core-cms → PostgreSQL
```

Chỉ đọc, ba lớp chặn rò rỉ. Chi tiết ở
`dv-cms/docs/10-api-danh-muc-nguyen-lieu.md`.

---

## 6. Nguyên tắc thiết kế

| Nguyên tắc | Thể hiện trong mã |
|---|---|
| **Chặn mặc định** | Khoá API không có quyền thì không gọi được gì. Dữ liệu không nằm trong danh sách trắng thì không ra API |
| **Ba lớp chặn rò rỉ** | Quyền Payload + danh sách trường + hàm nặn dữ liệu liệt kê tay |
| **Nội dung nháp không ra ngoài** | `overrideAccess: false` để Payload tự cắt bản nháp |
| **CMS ngừng thì web vẫn chạy** | Nội dung tĩnh dự phòng, thời gian chờ có giới hạn |
| **Đổi cấu hình không cần triển khai lại** | Nhà cung cấp AI, quyền khoá API, câu chào chat đều nằm trong admin |
| **Việc nặng chạy nền** | Đồng bộ, sinh nội dung AI, quét trùng đều là công việc chạy nền có nhật ký |
