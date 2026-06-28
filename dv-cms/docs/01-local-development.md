# Hướng dẫn 1 — Cài đặt & test ở LOCAL (máy dev)

CMS chạy **decoupled** ở cổng **3001** (frontend Bioscope giữ cổng 3000). Bạn chỉ cần
một Postgres để chạy; còn lại dùng `pnpm`.

---

## 0. Yêu cầu

| Thành phần | Phiên bản | Ghi chú |
|---|---|---|
| Node.js | ≥ 20.9 | `node -v` |
| pnpm | 9.x | bật bằng `corepack enable` |
| PostgreSQL | 16 | Docker, Postgres.app, hoặc Homebrew |

```bash
corepack enable          # cung cấp lệnh pnpm
node -v && pnpm -v
```

---

## 1. Cài dependencies

```bash
cd dv-cms
pnpm install
```

Monorepo tự liên kết các package nội bộ (`@dv/cms-core`, `@dv/module-*`) — không cần build riêng.

---

## 2. Chuẩn bị PostgreSQL

Chọn **một** cách:

**A. Docker (gọn nhất)** — đã có sẵn `docker-compose.yml`:
```bash
pnpm db:up               # = docker compose up -d db  (Postgres 16, cổng 5432)
```
DB mặc định: user `dvcms` / pass `dvcms` / db `dvcms`.

**B. Postgres cài sẵn (Postgres.app / Homebrew)** — tạo user + db:
```bash
createuser dvcms --createdb
createdb dvcms -O dvcms
psql -c "ALTER USER dvcms WITH PASSWORD 'dvcms';"
```

---

## 3. Cấu hình môi trường

Tạo `apps/core-cms/.env` (đã có sẵn bản dev; chỉnh nếu cần):

```env
DATABASE_URI=postgres://dvcms:dvcms@localhost:5432/dvcms
PAYLOAD_SECRET=dev-secret-please-change-0123456789abcdef
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001
PORT=3001
FRONTEND_URL=
REVALIDATE_SECRET=dev-revalidate-secret
B2B_COOKIE=bio-token
```
> `FRONTEND_URL` để trống → bỏ qua revalidate (frontend chưa nối).

---

## 4. Chạy CMS

```bash
pnpm cms:dev             # http://localhost:3001/admin
```
Lần đầu Payload **tự tạo schema** trên Postgres (dev push). Mở `/admin` để tạo tài
khoản admin đầu tiên, hoặc dùng seed ở bước 5.

---

## 5. Nạp dữ liệu mẫu (seed)

```bash
pnpm cms:seed
```
Tạo sẵn:
- Admin: **admin@bioscope.vn / Bioscope@123**
- Member B2B (approved): **member@acme.com / Member@123**
- Member B2B (pending): **pending@acme.com / Member@123**
- 3 công nghệ · 6 nguyên liệu · 4 dịch vụ · 7 chứng nhận · 3 đối tác · 1 tài liệu gated

---

## 6. Test API

Mở `apps/core-cms/requests.http` (VS Code REST Client) hoặc dùng `curl`:

```bash
# Core
curl 'http://localhost:3001/api/globals/site-settings?locale=vi'

# Bioscope
curl 'http://localhost:3001/api/ingredients?where[type][equals]=supplement&depth=2&locale=vi'
curl 'http://localhost:3001/api/technologies?sort=order&depth=2&locale=vi'
curl 'http://localhost:3001/api/certifications?sort=order&locale=vi'

# GraphQL
curl -X POST http://localhost:3001/api/graphql -H 'Content-Type: application/json' \
  -d '{"query":"{ Ingredients(locale: vi, limit:3){ docs{ id name slug type } } }"}'
```

**Luồng B2B** (giữ cookie giữa các request):
```bash
# Đăng nhập member approved → lưu cookie
curl -c /tmp/b2b.txt -X POST http://localhost:3001/api/b2b/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"member@acme.com","password":"Member@123"}'

# Thông tin member
curl -b /tmp/b2b.txt http://localhost:3001/api/b2b/me

# Tài liệu được phép xem
curl -b /tmp/b2b.txt http://localhost:3001/api/b2b/documents

# Đăng ký mới (luôn ở trạng thái pending)
curl -X POST http://localhost:3001/api/b2b/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"new@acme.com","password":"Member@123","company":"ACME","contactName":"Test","phone":"0900"}'
```
Kỳ vọng: member **chưa approve** gọi `/b2b/documents` → `401`; member approved → trả danh sách tài liệu.

---

## 6b. Whitelabel admin (branding/theme)

Admin Payload đã được whitelabel sẵn (logo, tiêu đề, theme sáng tông Bioscope,
dashboard có thẻ lối tắt + số liệu). Cấu hình **live, không cần redeploy**:

- Vào **Hệ thống → Branding / Theme** trong admin: đổi `brandName`, **logo**,
  `primaryColor`, `accentColor`, bo góc, font → `ThemeInjector` áp ngay vào admin.
- Mặc định gắn trong code ở `apps/core-cms/src/payload.config.ts`
  (`brandingPlugin({ brandName, titleSuffix, theme })`).
- Tái dùng cho site khác: chỉ cần đổi options của `brandingPlugin` + sửa global
  Branding của site đó. Lớp này nằm ở `@dv/cms-core` (export `./admin`).
- Sau khi đổi đường dẫn component admin trong code, chạy `pnpm cms:types` rồi
  `pnpm --filter @dv/core-cms generate:importmap`.

## 7. Lệnh hữu ích

```bash
pnpm cms:types            # sinh lại apps/core-cms/src/payload-types.ts
pnpm cms:migrate:create   # tạo migration (khi chuẩn bị production)
pnpm cms:migrate          # chạy migration
pnpm -r exec tsc --noEmit # typecheck toàn bộ
pnpm db:down              # tắt Postgres (nếu dùng Docker)
```

---

## 8. Lỗi thường gặp

| Triệu chứng | Cách xử lý |
|---|---|
| `ECONNREFUSED 5432` | Postgres chưa chạy → `pnpm db:up` hoặc khởi động Postgres |
| `password authentication failed` | Sai user/pass trong `DATABASE_URI` |
| Cổng 3001 bận | Sửa `PORT` trong `.env` và script dev |
| `pnpm: command not found` | `corepack enable` rồi mở terminal mới |
| Server treo khi đổi schema (log hiện `DATA LOSS WARNING … (y/N)`) | Dev "push" hỏi xác nhận khi xoá cột/bảng. Hoặc xử lý thủ công trong DB rồi restart, hoặc dùng migration (`pnpm cms:migrate:create`). |
| Cookie B2B không xác thực qua curl | Payload chỉ chấp nhận cookie khi `Origin` thuộc `csrf` (đã thêm `localhost:3001`). Gửi kèm `-H "Origin: http://localhost:3001"`, hoặc dùng header `Authorization: JWT <token>`. |
