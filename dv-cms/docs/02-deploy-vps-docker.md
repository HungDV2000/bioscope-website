# Hướng dẫn triển khai dv-cms trên SERVER (Docker)

CMS chạy bằng **Docker Compose**: Postgres 16 + **CMS** (`core-cms`) + **Frontend**
(`bioscope-frontend`). Profile `full` khởi động cả ba service.

| Tài liệu | Mục đích |
|---|---|
| [01-local-development.md](./01-local-development.md) | Dev trên máy: `pnpm cms:dev` + Postgres Docker |
| [03-frontend-only-preview.md](./03-frontend-only-preview.md) | Chỉ frontend Next.js — xem giao diện, trỏ domain aaPanel |

---

## 0. Yêu cầu trên server

```bash
# Docker Engine + Compose plugin (Ubuntu/Debian)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # logout/login lại
docker --version && docker compose version
```

Khuyến nghị: **2 vCPU / 4 GB RAM** trở lên (bước build Next tốn RAM).

Kiểm tra cổng đang chiếm trên host:

```bash
ss -tlnp | grep -E ':26432|:26001|:26000'
# hoặc
docker ps --format 'table {{.Names}}\t{{.Ports}}'
```

---

## 1. Lấy mã nguồn

```bash
git clone <repo-url> dv-cms
cd dv-cms
```

Hoặc `rsync` / `scp` thư mục `dv-cms` lên server.

---

## 2. Cấu hình cổng Docker (tránh trùng)

`docker-compose.yml` map cổng host qua biến môi trường trong file **`.env` ở gốc `dv-cms/`**:

| Biến | Local (`.env.example`) | Server default | Container nội bộ |
|---|---|---|---|
| `DVCMS_DB_HOST_PORT` | `5432` | **`26432`** | Postgres `5432` |
| `DVCMS_CMS_HOST_PORT` | `3001` | **`26001`** | CMS `3001` |
| `DVCMS_FRONTEND_HOST_PORT` | `3000` | **`26000`** | Frontend `3000` |
| `PAYLOAD_PUBLIC_SERVER_URL` | `http://localhost:3001` | **`https://cms.bioscope.vn`** | — |
| `FRONTEND_URL` | `http://localhost:3000` | **`https://web.bioscope.vn`** | — |
| `NEXT_PUBLIC_CMS_URL` | `http://localhost:3001` | **`https://cms.bioscope.vn`** | build frontend |

Cả hai service bind **`127.0.0.1`** — chỉ truy cập từ máy host (reverse proxy), không mở
ra Internet trực tiếp.

> **Lưu ý:** Cổng **bên trong container** không đổi. CMS vẫn kết nối DB qua
> `postgres://dvcms:...@db:5432/dvcms` (mạng Docker nội bộ). Chỉ cổng **host** thay đổi.

### Tạo `.env` cho server

```bash
cp .env.server.example .env
nano .env
```

Nội dung mẫu (điều chỉnh cổng nếu vẫn trùng):

```env
DVCMS_DB_HOST_PORT=26432
DVCMS_CMS_HOST_PORT=26001
DVCMS_FRONTEND_HOST_PORT=26000
NEXT_PUBLIC_CMS_URL=https://cms.bioscope.vn

POSTGRES_PASSWORD=<mat-khau-manh>
PAYLOAD_SECRET=<openssl rand -hex 32>
PAYLOAD_PUBLIC_SERVER_URL=https://cms.bioscope.vn
FRONTEND_URL=https://web.bioscope.vn
REVALIDATE_SECRET=<openssl rand -hex 16>
B2B_COOKIE=bio-token
```

Sinh secret nhanh:

```bash
openssl rand -hex 32    # PAYLOAD_SECRET
openssl rand -hex 16    # REVALIDATE_SECRET
```

---

## 3. Build & chạy

```bash
docker compose up -d --build
```

Theo dõi log lần đầu:

```bash
docker compose logs -f cms frontend
```

Kiểm tra container và cổng thực tế:

```bash
docker compose ps
# dvcms-db        ... 127.0.0.1:26432->5432/tcp
# dvcms-app       ... 127.0.0.1:26001->3001/tcp
# dvcms-frontend  ... 127.0.0.1:26000->3000/tcp
```

Test trên server (thay `26001` bằng `DVCMS_CMS_HOST_PORT` của bạn):

```bash
curl -s "http://127.0.0.1:26001/api/certifications?sort=order" | head -c 300
curl -sI "http://127.0.0.1:26000" | head
```

Admin: sau khi gắn reverse proxy → `https://cms.bioscope.vn/admin`.

---

## 4. Migration & seed (lần đầu)

```bash
docker compose exec cms pnpm exec payload migrate
docker compose exec cms pnpm exec payload run src/seed/index.ts
```

Sau seed: **admin@bioscope.vn / Bioscope@123** → đổi mật khẩu ngay tại `/admin`.

---

## 5. Reverse proxy + HTTPS (bắt buộc production)

Không expose cổng CMS ra `0.0.0.0`. Reverse proxy trỏ vào **localhost + cổng host**.

### Caddy (ví dụ)

`Caddyfile`:

```caddyfile
cms.bioscope.vn {
    reverse_proxy 127.0.0.1:26001
}

web.bioscope.vn {
    reverse_proxy 127.0.0.1:26000
}
```

```bash
sudo caddy validate --config Caddyfile
sudo systemctl reload caddy
```

### Nginx (ví dụ)

```nginx
server {
    listen 443 ssl http2;
    server_name cms.bioscope.vn;
    # ssl_certificate ... (certbot hoặc Cloudflare)

    location / {
        proxy_pass http://127.0.0.1:26001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name web.bioscope.vn;

    location / {
        proxy_pass http://127.0.0.1:26000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Nhớ cập nhật `PAYLOAD_PUBLIC_SERVER_URL`, `FRONTEND_URL`, `NEXT_PUBLIC_CMS_URL` đúng domain HTTPS.

---

## 6. Frontend (đã gồm trong compose)

Service `frontend` build từ `apps/bioscope-frontend/Dockerfile`, cổng host
`DVCMS_FRONTEND_HOST_PORT` (mặc định server: `26000`).

`NEXT_PUBLIC_CMS_URL` trong `.env` được truyền lúc **build** — nếu đổi domain CMS,
phải rebuild:

```bash
docker compose up -d --build frontend
```

Reverse proxy website: `web.bioscope.vn` → `127.0.0.1:26000`.

---

## 7. Vận hành hàng ngày

```bash
# Cập nhật phiên bản
git pull
docker compose up -d --build

# Log / restart
docker compose logs -f cms frontend
docker compose restart cms frontend

# Dừng (giữ volume dữ liệu)
docker compose down

# Dừng + XÓA dữ liệu (cẩn thận!)
docker compose down -v
```

### Backup Postgres

```bash
docker compose exec db pg_dump -U dvcms dvcms > backup_$(date +%F).sql
```

### Restore

```bash
cat backup.sql | docker compose exec -T db psql -U dvcms dvcms
```

Upload media lưu ở volume `media`; database ở volume `pgdata`.

---

## 8. Xử lý sự cố thường gặp

| Triệu chứng | Cách xử lý |
|---|---|
| aaPanel **list index out of range** | Deploy qua SSH — mục **8.1**, không dùng GUI panel |
| Container **Paused** trên aaPanel | Mục **8.2** |
| `sh: cross-env: not found` khi build | Đã sửa Dockerfile — `git pull` rồi build lại |
| `Bind for 127.0.0.1:5432 failed: port is already allocated` | Đổi `DVCMS_DB_HOST_PORT` (vd. `26432`) |
| `Bind for 127.0.0.1:3001 failed` | Đổi `DVCMS_CMS_HOST_PORT` (vd. `26001`) |
| `Bind for 127.0.0.1:26000 failed` | Đổi `DVCMS_FRONTEND_HOST_PORT` (vd. `26002`) |
| CMS không kết nối DB | Kiểm tra `POSTGRES_PASSWORD` khớp giữa `db` và `DATABASE_URI` trong compose |
| Admin/API 502 qua domain | Reverse proxy trỏ đúng `127.0.0.1:<DVCMS_CMS_HOST_PORT>` |
| CORS / cookie B2B lỗi | `PAYLOAD_PUBLIC_SERVER_URL`, `FRONTEND_URL` phải đúng URL HTTPS public |

### 8.1 aaPanel: **Setup failed! list index out of range**

Lỗi này đến từ **giao diện Docker của aaPanel/BT Panel** (bug Python khi parse
`docker-compose.yml`), **không phải** lỗi project hay ổ cứng.

**Không deploy qua panel** — dùng **SSH + CLI**:

```bash
cd /www/wwwroot/bioscope-website/dv-cms
git pull
cp .env.server.example .env   # nếu chưa có
bash scripts/deploy.sh
```

### 8.2 Container **Paused**

```bash
docker unpause dvcms-db dvcms-app dvcms-frontend 2>/dev/null || true
docker compose down && docker compose up -d --build
```

### 8.3 Ổ đĩa đầy (Disk 100%)

```bash
docker builder prune -af && docker image prune -af
df -h /
```

---

## 9. Checklist production

- [ ] `.env` từ `.env.server.example`, cổng host không trùng container khác
- [ ] `POSTGRES_PASSWORD` và `PAYLOAD_SECRET` ngẫu nhiên, mạnh
- [ ] Đổi mật khẩu admin sau seed
- [ ] Reverse proxy + HTTPS (không mở CMS/DB ra `0.0.0.0`)
- [ ] `PAYLOAD_PUBLIC_SERVER_URL`, `FRONTEND_URL`, `NEXT_PUBLIC_CMS_URL` đúng domain HTTPS
- [ ] Chạy `payload migrate` trước seed trên môi trường mới
- [ ] Lịch backup `pg_dump` + volume `media`
