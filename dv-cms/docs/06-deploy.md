# Triển khai lên server (Docker + 2 domain)

> Demo: **web.bioscope.vn** (frontend) · **admin.bioscope.vn** (CMS/admin).
> Server dùng **aaPanel** (nginx) làm reverse proxy + TLS; ứng dụng chạy bằng `docker compose`.

## 1. Kiến trúc

```
Internet ──▶ nginx (aaPanel, 443 + Let's Encrypt)
              ├─ web.bioscope.vn   ─▶ 127.0.0.1:26000  (frontend, Next :3000)
              └─ admin.bioscope.vn ─▶ 127.0.0.1:26001  (cms/admin, Payload :3001)
                                        └─ dvcms-db (Postgres :5432, chỉ nội bộ)
```
Cả 3 container chỉ mở cổng trên `127.0.0.1` — không lộ ra ngoài; nginx là lớp public + TLS duy nhất.

## 2. DNS
Tạo 2 bản ghi **A** trỏ về IP server:
- `web.bioscope.vn`   → `<IP server>`
- `admin.bioscope.vn` → `<IP server>`

## 3. Chuẩn bị env
```bash
cd /path/to/dv-cms
cp .env.server.example .env.server
# Sinh secret mạnh và điền vào .env.server:
openssl rand -hex 32   # POSTGRES_PASSWORD
openssl rand -hex 32   # PAYLOAD_SECRET
openssl rand -hex 32   # REVALIDATE_SECRET  (cms + frontend PHẢI giống nhau)
```
Kiểm tra `.env.server` đã đúng domain: `PAYLOAD_PUBLIC_SERVER_URL` + `NEXT_PUBLIC_CMS_URL` = `https://admin.bioscope.vn`, `NEXT_PUBLIC_SITE_URL` + `FRONTEND_URL` = `https://web.bioscope.vn`.

## 4. Build & chạy
```bash
docker compose --env-file .env.server build
docker compose --env-file .env.server up -d
docker compose --env-file .env.server ps        # cả 3 service Up/healthy
docker compose --env-file .env.server logs -f cms
```
Postgres tự tạo schema (dev-push) ở lần chạy đầu.

## 5. Reverse proxy (aaPanel)
Với **mỗi** domain: **Website → Add site** (trỏ domain, không cần thư mục web) → **SSL → Let's Encrypt** (bật Force HTTPS) → **Config (Reverse proxy)**.

**web.bioscope.vn** → target `http://127.0.0.1:26000`
**admin.bioscope.vn** → target `http://127.0.0.1:26001`

Chèn thêm vào block `location /` của mỗi site (đặc biệt admin — upload media lớn):
```nginx
proxy_set_header Host              $host;
proxy_set_header X-Real-IP         $remote_addr;
proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;   # rate-limit theo IP thật
proxy_set_header X-Forwarded-Proto $scheme;
proxy_http_version 1.1;
client_max_body_size 50m;            # cho upload ảnh/tài liệu trong admin
```

## 6. Sau khi lên
1. **Tạo admin đầu tiên**: mở `https://admin.bioscope.vn/admin` → tạo user.
2. **Seed dữ liệu mẫu**: đăng nhập admin → Dashboard → nút **"Chạy seed"** (hoặc `docker compose exec cms pnpm run seed`).
3. **SEO trước go-live**: vào **SEO → Lập chỉ mục**, **TẮT** "Chặn công cụ tìm kiếm" (mặc định đang tắt = cho index). Điền mã xác minh Google/Bing nếu có.
4. **Kiểm tra**:
   - `https://web.bioscope.vn/robots.txt` → có `Sitemap: https://web.bioscope.vn/sitemap.xml`
   - `https://web.bioscope.vn/sitemap.xml` → 200, có URL
   - Sửa 1 nội dung trong admin → web cập nhật (revalidate) → xác nhận `REVALIDATE_SECRET` khớp
   - Trong admin, mở 1 Page → tab **Preview** hiển thị web.bioscope.vn (CSP `frame-ancestors` đã cho phép admin nhúng)

## 7. Vận hành
- **Cập nhật code**: `git pull` → `docker compose --env-file .env.server build` → `up -d`.
- **Backup DB**: `docker compose exec db pg_dump -U dvcms dvcms > backup_$(date +%F).sql`
- **Media** (ảnh upload) nằm ở docker volume `media` — nhớ backup volume này.
- **Logs**: `docker compose --env-file .env.server logs -f <service>`.

## 8. Checklist bảo mật (đã có sẵn trong code)
- Security headers (CSP/HSTS/nosniff/Referrer/Permissions) áp mọi route qua `next.config.mjs`.
- CSP `frame-ancestors` = `'self' + admin.bioscope.vn` → chỉ admin được nhúng preview.
- Rate-limit API công khai (`/api/forms/submit`, 5 req/phút/IP) — cần nginx truyền `X-Forwarded-For` (mục 5).
- `.env.server` đã gitignore — **không commit**. Xoay secret định kỳ.
