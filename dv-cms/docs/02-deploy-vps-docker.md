# Hướng dẫn 2 — Triển khai & test trên SERVER VPS bằng Docker

CMS được đóng gói chạy bằng `docker compose`: **một container Postgres 16** + **một
container CMS** (Next 15 + Payload). Toàn bộ build từ mã nguồn trong monorepo.

---

## 0. Yêu cầu trên VPS

```bash
# Cài Docker Engine + plugin compose (Ubuntu/Debian)
curl -fsSL https://get.docker.com | sh
docker --version && docker compose version
```

Cấu hình tối thiểu khuyến nghị: **2 vCPU / 2–4 GB RAM** (bước build Next cần RAM).

---

## 1. Lấy mã nguồn

```bash
git clone <repo-url> dv-cms      # hoặc rsync/scp thư mục dv-cms lên VPS
cd dv-cms
```

---

## 2. Tạo file môi trường gốc `.env`

`docker-compose.yml` đọc các biến này (đặt ở **gốc** `dv-cms/.env`):

```env
# Bắt buộc — chuỗi ngẫu nhiên ≥ 32 ký tự
PAYLOAD_SECRET=$(openssl rand -hex 32)

# URL công khai của CMS (domain thật khi có)
PAYLOAD_PUBLIC_SERVER_URL=https://cms.bioscope.vn

# Frontend (để bật revalidate ISR; để trống nếu chưa nối)
FRONTEND_URL=https://bioscope.vn
REVALIDATE_SECRET=$(openssl rand -hex 16)

B2B_COOKIE=bio-token
```
> `DATABASE_URI` cho container CMS đã được set sẵn trong compose
> (`postgres://dvcms:dvcms@db:5432/dvcms`) — **không cần** khai báo lại.
> Đổi mật khẩu Postgres trong `docker-compose.yml` (`POSTGRES_PASSWORD`) cho production.

---

## 3. Build & chạy (profile `full` = cả Postgres + CMS)

```bash
docker compose --profile full up -d --build
```

Theo dõi log:
```bash
docker compose logs -f cms
```
Lần đầu CMS sẽ kết nối Postgres và tạo schema.

Kiểm tra container:
```bash
docker compose ps
# dvcms-db   ... healthy
# dvcms-app  ... up   0.0.0.0:3001->3001
```

---

## 4. Chạy migration & seed (lần đầu)

Khuyến nghị production dùng **migration** thay vì dev-push. Sinh migration ở local
(`pnpm cms:migrate:create`), commit, rồi trên VPS chạy trong container:

```bash
docker compose exec cms pnpm migrate     # chạy migration
docker compose exec cms pnpm seed        # nạp dữ liệu mẫu + tài khoản admin
```
> Nếu chưa có migration, schema vẫn được tạo tự động khi CMS khởi động (push mode).
> Khi đó chỉ cần chạy seed.

Sau seed: admin **admin@bioscope.vn / Bioscope@123** → **đổi mật khẩu ngay** ở
`/admin` cho production.

---

## 5. Test nhanh sau khi lên

```bash
# Trên VPS (cổng nội bộ)
curl -s 'http://localhost:3001/api/certifications?sort=order' | head -c 300
curl -s 'http://localhost:3001/api/ingredients?depth=1&locale=vi' | head -c 300

# B2B
curl -c /tmp/b2b.txt -X POST http://localhost:3001/api/b2b/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"member@acme.com","password":"Member@123"}'
curl -b /tmp/b2b.txt http://localhost:3001/api/b2b/me
```
Mở admin: `http://<IP-VPS>:3001/admin` (hoặc qua domain sau khi gắn reverse proxy).

---

## 6. Reverse proxy + HTTPS (khuyến nghị)

Đừng mở thẳng 3001 ra Internet — đặt sau **Caddy** (tự động Let's Encrypt). Tạo
`Caddyfile`:

```caddyfile
cms.bioscope.vn {
    reverse_proxy localhost:3001
}
```
Thêm service vào compose (hoặc chạy Caddy host-level):
```yaml
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports: ["80:80", "443:443"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    depends_on: [cms]
# volumes: thêm  caddy_data:
```
Sau đó CMS truy cập tại `https://cms.bioscope.vn/admin`. Nhớ cập nhật
`PAYLOAD_PUBLIC_SERVER_URL` và CORS (`FRONTEND_URL`) cho đúng domain.

---

## 7. Vận hành

```bash
# Cập nhật phiên bản mới
git pull
docker compose --profile full up -d --build

# Backup database
docker compose exec db pg_dump -U dvcms dvcms > backup_$(date +%F).sql

# Restore
cat backup.sql | docker compose exec -T db psql -U dvcms dvcms

# Xem log / khởi động lại / tắt
docker compose logs -f cms
docker compose restart cms
docker compose --profile full down          # giữ dữ liệu (volume pgdata)
docker compose --profile full down -v       # XÓA cả dữ liệu
```

File upload lưu ở volume `media`; database ở volume `pgdata` (đều bền qua restart).

---

## 8. Checklist production

- [ ] `PAYLOAD_SECRET` ngẫu nhiên, đổi `POSTGRES_PASSWORD` mặc định
- [ ] Đổi mật khẩu admin sau seed
- [ ] Reverse proxy + HTTPS (không expose 3001 trực tiếp)
- [ ] `PAYLOAD_PUBLIC_SERVER_URL` + `FRONTEND_URL` đúng domain (CORS/CSRF)
- [ ] Dùng migration thay vì push schema
- [ ] Lịch backup `pg_dump` + backup volume `media`
- [ ] (Tùy chọn) chuyển lưu trữ media sang S3-compatible khi scale
