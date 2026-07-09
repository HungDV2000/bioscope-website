# Triển khai bioscope-website lên VPS (Docker + aaPanel + 2 domain)

> **Stack production:** Docker Compose (cms + frontend + db) **+ aaPanel nginx** làm reverse proxy + Let's Encrypt.
> - **web.bioscope.vn** — frontend Next.js (storefront).
> - **admin.bioscope.vn** — Payload CMS + admin UI.
>
> **Kiến trúc:** aaPanel (host) nhận HTTPS public (port 443), reverse proxy `http://127.0.0.1:26080` (web) / `127.0.0.1:26081` (admin) → Docker containers. Docker KHÔNG tự xin cert, KHÔNG tự handle TLS — đó là việc của aaPanel.
>
> Port dải `26xxx` (không xung đột với BioBot đang chiếm `5432/6379/80/443/15678/...`).

---

## 0. Tổng quan kiến trúc

```
Internet
   │  (DNS A record → IP VPS)
   ▼
┌────────────────────────────────────────────────┐
│ Host (VPS)                                     │
│                                                │
│  aaPanel (nginx host-level)                    │
│   - Let's Encrypt cert cho 2 domain           │
│   - Listen 80/443 public                       │
│   - Reverse proxy theo Host header:            │
│       web.bioscope.vn   → 127.0.0.1:26080      │
│       admin.bioscope.vn → 127.0.0.1:26081      │
│                                                │
│  Docker (3 services)                            │
│   - frontend  : 127.0.0.1:26080 → :26300       │
│   - cms       : 127.0.0.1:26081 → :26301       │
│   - db        : 127.0.0.1:26432 → :5432        │
│                                                │
│  Volumes: pgdata (DB), media (uploads)         │
└────────────────────────────────────────────────┘
```

**Port quy ước** (dải `26xxx` tránh xung đột):

| Service | Container port | Host port (chỉ localhost) |
|---|---|---|
| Frontend (Next.js) | `26300` | `127.0.0.1:26080` |
| Core CMS (Payload) | `26301` | `127.0.0.1:26081` |
| Postgres | `5432` | `127.0.0.1:26432` |

> Host ports `26080/26081/26432` **chỉ bind `127.0.0.1`** — KHÔNG lộ ra ngoài Internet. aaPanel (cũng ở host) mới là layer duy nhất được expose public qua 80/443.

---

## 1. Chuẩn bị VPS

### 1.1. Yêu cầu tối thiểu
- **OS:** Ubuntu 22.04+ / Debian 12+ (Ubuntu 20.04 OK nếu apt mirror ổn định)
- **RAM:** ≥ 2 GB (khuyến nghị 4 GB nếu chạy song song BioBot)
- **Disk:** ≥ 20 GB trống
- **aaPanel:** đã cài (Website module + Nginx)
- **User:** có quyền `sudo` (KHÔNG chạy root trực tiếp)
- **Cổng mở ngoài:** `22` (SSH), `80` (HTTP), `443` (HTTPS) — chỉ aaPanel cần

### 1.2. Trỏ DNS
Tạo **2 bản ghi A** trỏ về IP server (TTL 300–600):

| Host | Type | Value |
|---|---|---|
| `web.bioscope.vn` | A | `<IP_VPS>` |
| `admin.bioscope.vn` | A | `<IP_VPS>` |

Verify (chờ 5–10 phút cho DNS propagate):
```bash
dig +short web.bioscope.vn
dig +short admin.bioscope.vn
# Cả 2 phải trả về cùng IP VPS
```

### 1.3. Mở firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp comment "aaPanel HTTP (Let's Encrypt ACME + redirect)"
sudo ufw allow 443/tcp comment "aaPanel HTTPS"
sudo ufw enable
sudo ufw status
```

> Lưu ý: **KHÔNG cần** mở `26080/26081/26432` ra ngoài Internet — Docker chỉ bind `127.0.0.1`. aaPanel (cũng ở host) tự kết nối nội bộ.

---

## 2. Chuẩn bị source code + secrets

### 2.1. Clone repo
```bash
cd /opt
sudo git clone <REPO_URL> bioscope-website
sudo chown -R $USER:$USER bioscope-website
cd bioscope-website/dv-cms
```

### 2.2. Chuẩn bị `service-account.json` (Google Drive sync)
Nếu dùng chức năng đồng bộ Google Drive, copy file credentials từ local:
```bash
mkdir -p apps/core-cms/credentials
scp user@local:/path/to/service-account.json \
   apps/core-cms/credentials/service-account.json
chmod 600 apps/core-cms/credentials/service-account.json
```
> Nếu KHÔNG dùng Drive sync, có thể bỏ qua. Sẽ không có lỗi vì field là optional.

### 2.3. Tạo secrets mạnh
```bash
# 3 secret bắt buộc — sinh 32 bytes hex ngẫu nhiên
openssl rand -hex 32   # POSTGRES_PASSWORD
openssl rand -hex 32   # PAYLOAD_SECRET
openssl rand -hex 32   # REVALIDATE_SECRET (cms + frontend PHẢI giống nhau)
openssl rand -hex 32   # (tuỳ chọn) B2B_COOKIE
```

Ghi lại các giá trị này — sẽ paste vào `.env` ở bước sau.

---

## 3. Chạy `install.sh` (một lần duy nhất)

Script `install.sh` tự động:
- Cài Docker (nếu chưa có)
- Tạo `.env` từ `.env.example` + auto-fill domain
- Xin SSL Let's Encrypt (standalone)
- Build + start Docker Compose
- Verify health

### 3.1. Chạy
```bash
cd /opt/bioscope-website/dv-cms
bash scripts/install.sh
```

Output mong đợi cuối script:
```
✅ CÀI ĐẶT HOÀN TẤT
Stack đang chạy ở host port (HTTP, nội bộ):
  - Frontend   : 127.0.0.1:26080  (chỉ aaPanel proxy)
  - CMS        : 127.0.0.1:26081  (chỉ aaPanel proxy)
  - Postgres   : 127.0.0.1:26432  (chỉ ops)

BƯỚC TIẾP THEO:
  1. Sửa secrets trong .env
  2. bash scripts/seed.sh
  3. Cấu hình aaPanel reverse proxy (mục 5)
```

### 3.2. Sau khi install: sửa secrets
Mở file `.env` vừa được tạo, paste các secret đã sinh ở bước 2.3:
```bash
nano .env
```

Tìm và thay thế:
```bash
POSTGRES_PASSWORD=<paste_secret_1>
PAYLOAD_SECRET=<paste_secret_2>
REVALIDATE_SECRET=<paste_secret_3>
```

Restart để các biến môi trường mới có hiệu lực:
```bash
docker compose down
docker compose up -d
```

### 3.3. Verify sau install
```bash
docker compose ps                          # 4 services Up/healthy
curl -I http://127.0.0.1:26080/            # 301 redirect to HTTPS
curl -I http://127.0.0.1:26080/admin       # 301 redirect to HTTPS
curl -I https://web.bioscope.vn/          # 200
curl -I https://admin.bioscope.vn/admin   # 200
```

> Lần đầu truy cập có thể chậm 5–10s do Payload Next.js dev-push DB schema.

---

## 4. Seed data (CMS + Frontend)

Sau khi `install.sh` chạy xong, **bắt buộc** chạy `seed.sh` để có data cho frontend.

### 4.1. Chuẩn bị CSV ingredients
CSV chứa toàn bộ danh mục + nguyên liệu (≈1.594 dòng) từ crawler Google Drive. Copy lên VPS:
```bash
# Trên local
scp /Users/kcode/Documents/Sources/DeepViewJSC/CrawlerDriveData/output/danh_sach_san_pham.csv \
    user@vps:/opt/bioscope-data/CrawlerDriveData/output/
```

Hoặc đặt ở bất kỳ đâu, truyền path qua argument:
```bash
bash scripts/seed.sh /path/to/danh_sach_san_pham.csv
```

### 4.2. Chạy seed
```bash
cd /opt/bioscope-website/dv-cms
bash scripts/seed.sh
```

Script sẽ tự động (idempotent — chạy nhiều lần OK):
1. Đợi DB + CMS ready
2. **`runSeed.ts`** — seed toàn bộ nội dung cho frontend:
   - Admin user: `admin@bioscope.vn / Bioscope@123`
   - `site-settings` (contact, social, defaultSeo)
   - `navigation` global (header + footer, **vi + en**)
   - `branding` theme
   - `bioscope-ai` + `seo-settings` globals
   - **13 pages song ngữ**: `ve-chung-toi`, `nguyen-lieu`, `giai-phap`, `dong-kien-tao`, `rd`, `tai-nguyen`, `case-study`, `lien-he`, `cau-hoi-thuong-gap`, `blog-chuyen-mon`, `chinh-sach-bao-mat`, `dieu-khoan-su-dung`, `bioscope-ai`
   - **Trang chủ** = Page ghép 9 block (`homeHero`, `homeBrands`, `homeProcess`, ... `homeCta`) + gán `site-settings.homePage`
   - 4 partners, 3 ingredient categories, 3 technologies, 6 ingredients showcase
   - 3 services (giải pháp), 3 case studies, 9 FAQs
   - 5 post categories, 4 tags, 3 posts blog
   - Forms (Liên hệ, yêu cầu mẫu, Bioscope AI)
3. **`importCsvRun.ts`** — import CSV (nếu file tồn tại): tạo ~1.594 ingredients + ~7 categories
4. Tùy chọn: trigger Google Drive Sync

Output cuối:
```
✅ SEED HOÀN TẤT
CMS Admin : https://admin.bioscope.vn/admin
  user    : admin@bioscope.vn
  pass    : Bioscope@123
Frontend : https://web.bioscope.vn
  - Trang chủ (9 block)
  - 13 trang song ngữ (vi + en)
  - 6 ingredients mẫu + CSV (1594 ingredients)
  - 3 services, 3 case studies, 9 FAQs
  - 3 posts blog, 7 certifications, 4 partners
```

### 4.3. Đổi mật khẩu admin ngay
```bash
docker compose exec cms \
  sh -c "cd /app/apps/core-cms && pnpm payload change-password --user admin@bioscope.vn"
```

---

## 5. Cấu hình aaPanel reverse proxy

Sau khi Docker stack đã chạy (mục 3.3 verify OK), tiến hành cấu hình **aaPanel** để nhận HTTPS public + reverse proxy về Docker host port.

### 5.1. Tạo 2 Website trong aaPanel
Vào **aaPanel → Website → Add site** (LAMP/LNMP không cần — chỉ cần Website module):

| Site | Domain | PHP | Database |
|---|---|---|---|
| web | `web.bioscope.vn` | Pure-Static Host (hoặc tắt) | (bỏ qua) |
| admin | `admin.bioscope.vn` | Pure-Static Host (hoặc tắt) | (bỏ qua) |

> **Mẹo:** Bỏ chọn "Create database" và "Create FTP" — không cần.

### 5.2. Xin SSL Let's Encrypt cho từng site
Với **mỗi site** vừa tạo:
1. Vào **Site settings → SSL → Let's Encrypt** → bật **Force HTTPS**.
2. aaPanel tự động xin cert + auto-renew.

Sau bước này, browser truy cập `https://web.bioscope.vn` sẽ có khóa SSL hợp lệ (không cảnh báo).

### 5.3. Cấu hình Reverse Proxy
Với **mỗi site** (web + admin), vào **Site settings → Reverse proxy → Add reverse proxy**:

| Site | Proxy name | Target URL | Send domain |
|---|---|---|---|
| web.bioscope.vn | `frontend` | `http://127.0.0.1:26080` | `$host` |
| admin.bioscope.vn | `cms` | `http://127.0.0.1:26081` | `$host` |

> **Send domain** để `$host` (mặc định) — để backend biết domain gốc. Không cần đổi.

### 5.4. Chèn thêm Nginx config (đặc biệt quan trọng với admin)
aaPanel Reverse Proxy mặc định KHÔNG chuyển `X-Forwarded-For` (rate-limit sẽ sai IP) và `client_max_body_size` chỉ 1 MB (upload ảnh lớn sẽ fail).

Với **mỗi site** (đặc biệt admin), vào **Site settings → Config file** (file nginx conf), tìm block `location /` của reverse proxy vừa tạo, **CHÈN** thêm:

```nginx
proxy_set_header Host              $host;
proxy_set_header X-Real-IP         $remote_addr;
proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;   # rate-limit theo IP thật
proxy_set_header X-Forwarded-Proto $scheme;
proxy_http_version 1.1;
client_max_body_size 50M;            # cho upload ảnh/tài liệu trong admin (mặc định 1M sẽ 413)
proxy_read_timeout 300s;
proxy_send_timeout 300s;
```

**Mẫu config đầy đủ** (copy vào config site trong aaPanel):
```nginx
# web.bioscope.vn — reverse proxy → frontend
location / {
    proxy_pass http://127.0.0.1:26080;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
    client_max_body_size 50M;
    proxy_read_timeout 300s;
    proxy_send_timeout 300s;
}
```

```nginx
# admin.bioscope.vn — reverse proxy → cms
location / {
    proxy_pass http://127.0.0.1:26081;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
    client_max_body_size 50M;            # QUAN TRỌNG: Payload admin upload media
    proxy_read_timeout 300s;
    proxy_send_timeout 300s;
}
```

Sau khi sửa xong, **Save** và **Reload Nginx** (nút reload trong aaPanel hoặc `sudo nginx -t && sudo systemctl reload nginx`).

### 5.5. Kiểm tra route
```bash
# Host → Docker trực tiếp (HTTP)
curl -sS -o /dev/null -w "Frontend (26080) : HTTP %{http_code}\n" http://127.0.0.1:26080/
curl -sS -o /dev/null -w "CMS (26081)      : HTTP %{http_code}\n" http://127.0.0.1:26081/admin

# Public → aaPanel → Docker (HTTPS)
curl -sS -o /dev/null -w "web.bioscope.vn   : HTTP %{http_code}\n" https://web.bioscope.vn/
curl -sS -o /dev/null -w "admin.bioscope.vn : HTTP %{http_code}\n" https://admin.bioscope.vn/admin

# SSL chain
openssl s_client -connect admin.bioscope.vn:443 -servername admin.bioscope.vn < /dev/null 2>/dev/null \
  | openssl x509 -noout -subject -dates
```

Nếu `HTTPS` trả về `200/301/302/401/403` → thành công.

### 5.6. Gia hạn SSL tự động
aaPanel **tự động** tạo cronjob renew Let's Encrypt. Kiểm tra:
```bash
# Xem cronjob
crontab -l | grep -i acme
# hoặc
ls -la /www/server/panel/cron/*.json
```
Không cần cài certbot host-level, không cần acme.sh.

---

## 6. Sau khi seed — kiểm tra & go-live

### 6.1. Smoke test
```bash
echo "=== Trang chủ ==="          && curl -sS -o /dev/null -w "  HTTP %{http_code}\n" https://web.bioscope.vn/
echo "=== Nguyên liệu ==="        && curl -sS -o /dev/null -w "  HTTP %{http_code}\n" https://web.bioscope.vn/nguyen-lieu
echo "=== Giải pháp ==="          && curl -sS -o /dev/null -w "  HTTP %{http_code}\n" https://web.bioscope.vn/giai-phap
echo "=== Case studies ==="        && curl -sS -o /dev/null -w "  HTTP %{http_code}\n" https://web.bioscope.vn/case-study
echo "=== Blog ==="               && curl -sS -o /dev/null -w "  HTTP %{http_code}\n" https://web.bioscope.vn/tai-nguyen/blog-chuyen-mon
echo "=== FAQ ==="                && curl -sS -o /dev/null -w "  HTTP %{http_code}\n" https://web.bioscope.vn/cau-hoi-thuong-gap
echo "=== Admin login ==="        && curl -sS -o /dev/null -w "  HTTP %{http_code}\n" https://admin.bioscope.vn/admin
echo "=== Admin API ==="          && curl -sS -o /dev/null -w "  HTTP %{http_code}\n" https://admin.bioscope.vn/api/users/me
```

### 6.2. SEO trước go-live
1. Vào `https://admin.bioscope.vn/admin` → **Globals → SEO settings**:
   - **TẮT** "Chặn công cụ tìm kiếm" (mặc định đang tắt = cho index).
   - **BẬT** sitemap.
   - Điền mã xác minh Google/Bing (nếu có).
2. Vào **Globals → Site settings**:
   - `homeTitle` + `homeDescription` cho OG/Twitter card.
   - `defaultImage` (logo 1200×630).
   - `social.facebook`, `social.linkedin`, `social.youtube` cho `sameAs` JSON-LD.
3. Verify sitemap & robots:
   ```bash
   curl -s https://web.bioscope.vn/robots.txt
   # Expect: Sitemap: https://web.bioscope.vn/sitemap.xml
   curl -s https://web.bioscope.vn/sitemap.xml | head -40
   ```

### 6.3. Test revalidation (CMS → Frontend)
1. Sửa 1 nội dung trong admin (vd: tên 1 nguyên liệu).
2. Web cập nhật trong vòng 60s (ISR revalidate).
3. Kiểm tra `REVALIDATE_SECRET` khớp giữa `cms` và `frontend` containers:
   ```bash
   docker compose exec cms printenv REVALIDATE_SECRET
   docker compose exec frontend printenv REVALIDATE_SECRET
   # 2 giá trị phải giống nhau
   ```

### 6.4. Test admin Preview
Vào admin → mở 1 Page → tab **Preview** phải hiển thị `web.bioscope.vn`. CSP `frame-ancestors` đã cho phép admin nhúng preview.

---

## 7. Vận hành

### 7.1. Lệnh hay dùng
```bash
cd /opt/bioscope-website/dv-cms

# Trạng thái
docker compose ps
docker compose logs -f                    # log tất cả services
docker compose logs -f cms               # log 1 service
docker compose logs -f --tail 200 cms    # 200 dòng cuối

# Restart
docker compose restart cms               # restart 1 service
docker compose up -d --force-recreate --build cms frontend nginx   # rebuild + recreate

# Vào container
docker compose exec cms sh
docker compose exec db psql -U dvcms -d dvcms

# Disk usage
docker system df
du -sh /var/lib/docker/volumes/dv-cms_*
```

### 7.2. Backup
**Tự động (khuyến nghị):**
```bash
# Thêm vào crontab -e:
# Backup DB hàng ngày lúc 3h sáng, giữ 7 ngày
0 3 * * * cd /opt/bioscope-website/dv-cms && \
  docker compose exec -T db pg_dump -U dvcms -d dvcms -F c -f /tmp/db.dump && \
  docker cp dvcms-db:/tmp/db.dump /opt/bioscope-data/backups/db_$(date +\%F).dump && \
  docker compose exec -T db rm -f /tmp/db.dump && \
  find /opt/bioscope-data/backups -name "db_*.dump" -mtime +7 -delete
```

**Media (uploads):**
```bash
docker run --rm \
  -v dv-cms_media:/from:ro \
  -v /opt/bioscope-data/backups:/to \
  alpine sh -c "tar czf /to/media_$(date +%F).tar.gz -C /from ."
```

**Khôi phục:**
```bash
# DB
docker cp /opt/bioscope-data/backups/db_2026-07-09.dump dvcms-db:/tmp/restore.dump
docker compose exec -T db sh -c "pg_restore -U dvcms -d dvcms --clean --no-owner /tmp/restore.dump"
docker compose exec -T db rm -f /tmp/restore.dump

# Media
docker run --rm \
  -v dv-cms_media:/to \
  -v /opt/bioscope-data/backups:/from \
  alpine sh -c "tar xzf /from/media_2026-07-09.tar.gz -C /to"
```

### 7.3. Upgrade (giữ nguyên data)
```bash
cd /opt/bioscope-website/dv-cms
bash scripts/upgrade.sh
```
Script tự động: backup → `git pull` → rebuild → migrate → rolling restart → verify. Có sẵn rollback nếu lỗi:
```bash
bash scripts/upgrade.sh rollback /opt/bioscope-data/backups/pre-upgrade-20260709_xxx
```

### 7.4. Re-seed (không mất data CMS)
`seed.sh` là idempotent — chạy lại OK, chỉ update/create thiếu:
```bash
bash scripts/seed.sh
```
Muốn reset hoàn toàn (XÓA data CMS + CSV đã import):
```bash
bash scripts/install.sh   # có prompt "XÓA data cũ?"
```

---

## 8. Checklist bảo mật

| Mục | Status | Vị trí |
|---|---|---|
| Security headers (CSP/HSTS/nosniff/Referrer/Permissions) | ✅ | `next.config.mjs` |
| CSP `frame-ancestors` cho phép admin nhúng preview | ✅ | `next.config.mjs` |
| Rate-limit API công khai (5 req/phút/IP) | ✅ | `/api/forms/submit` |
| `.env` đã `.gitignore` | ✅ | root repo |
| Postgres chỉ bind `127.0.0.1:26432` | ✅ | `docker-compose.yml` |
| `cms` + `frontend` chỉ bind `127.0.0.1:26080/26081` (không lộ ra ngoài) | ✅ | `docker-compose.yml` |
| aaPanel là lớp public + TLS duy nhất | ✅ | reverse proxy |
| Secret được generate ngẫu nhiên | ✅ | `openssl rand -hex 32` |
| SSL Let's Encrypt auto-renew | ✅ | aaPanel cronjob |
| Firewall chỉ mở 22/80/443 | ✅ | UFW |
| service-account.json không commit git | ✅ | `.gitignore` + `chmod 600` |

**Lưu ý vận hành:**
- **Xoay secret** định kỳ (≥ 6 tháng): regen `POSTGRES_PASSWORD` + `PAYLOAD_SECRET` + `REVALIDATE_SECRET` → cập nhật `.env` → `docker compose restart cms frontend`. Lưu ý đổi `POSTGRES_PASSWORD` cần reset password role trong DB.
- **Đổi mật khẩu admin** ngay sau lần đăng nhập đầu tiên.
- **Không commit** `.env`, `service-account.json` lên git.
- **aaPanel config** backup định kỳ (aaPanel → Settings → Backup).

---

## 9. Troubleshooting thường gặp

### Lỗi: `https://web.bioscope.vn` trả về 502 Bad Gateway
aaPanel proxy tới Docker nhưng container chưa chạy/sai port. Check:
```bash
docker compose ps                    # 3 services Up
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:26080/   # expect 200
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:26081/admin  # expect 200/301
# Nếu cả 2 OK mà vẫn 502 → check aaPanel config:
#   - proxy_pass đúng 127.0.0.1:26080/26081
#   - proxy_set_header Host $host có
sudo nginx -t && sudo systemctl reload nginx
```

### Lỗi: 413 Request Entity Too Large khi upload ảnh trong admin
aaPanel mặc định `client_max_body_size 1M`. Fix:
- Vào **aaPanel → Site admin.bioscope.vn → Config** → thêm `client_max_body_size 50M;` vào block `location /`.
- Reload nginx.

### Lỗi: SSL cert Let's Encrypt fail
Vào **aaPanel → Site → SSL → Let's Encrypt** → xem log. Nguyên nhân thường gặp:
- DNS chưa trỏ về IP VPS: `dig +short web.bioscope.vn`
- Port 80 bị block: `sudo ufw status` (phải mở 80)
- aaPanel nginx đang chiếm port 80 của host: bình thường, không sao.

### Lỗi: Container `cms` restart liên tục
```bash
docker compose logs cms --tail 100
# Thường do PAYLOAD_SECRET rỗng, hoặc DB URI sai
```
Check env:
```bash
docker compose exec cms printenv PAYLOAD_SECRET DATABASE_URI
```

### Lỗi: `fe_sendauth: no password supplied` (postgres)
`POSTGRES_PASSWORD` trong `.env` khác với user `dvcms` trong DB volume cũ. Fix:
```bash
# Option A: dùng lại password cũ
docker volume inspect dv-cms_pgdata
# Option B: xóa volume và re-seed (MẤT DATA)
docker compose down -v
bash scripts/install.sh
bash scripts/seed.sh
```

### Lỗi: Không truy cập được `https://admin.bioscope.vn/admin` (timeout)
```bash
# 1. DNS chưa resolve
dig +short admin.bioscope.vn
# 2. aaPanel proxy có target đúng
cat /www/server/panel/vhost/nginx/admin.bioscope.vn.conf 2>/dev/null | grep proxy_pass
# 3. Docker container đang chạy
docker compose ps
# 4. Network từ host tới container
curl -v http://127.0.0.1:26081/admin
```

### Lỗi: `seed.sh` fail ở "Đợi CMS ready" (timeout 120s)
CMS chưa migrate xong schema. Check:
```bash
docker compose logs cms --tail 50
# Thấy dòng "Payload Admin URL: http://...:26301/admin" → ready
# Nếu thấy lỗi DB → check POSTGRES_PASSWORD / DATABASE_URI
```

### Lỗi: `E: Failed to fetch ... python3-cryptography ...` khi `apt install` (trên host)
Nếu VPS là Ubuntu 20.04 và `apt-get update` fail ở package Python cũ:
```bash
# Fix mirror
sudo apt-get update
# Hoặc skip certbot (không cần — aaPanel xử lý SSL)
# Script install.sh hiện tại KHÔNG cài certbot (đã bỏ) → không cần fix.
```

### Lỗi: `fe_sendauth: no password supplied` (postgres)
`POSTGRES_PASSWORD` trong `.env` khác với user `dvcms` trong DB volume cũ. Fix:
```bash
# Option A: dùng lại password cũ (xem docker volume inspect)
docker volume inspect dv-cms_pgdata
# Option B: xóa volume và re-seed (MẤT DATA)
docker compose down -v
bash scripts/install.sh
bash scripts/seed.sh
```

### Lỗi: Domain không resolve
```bash
dig +short web.bioscope.vn
dig +short admin.bioscope.vn
# Nếu không trả IP: DNS chưa propagate hoặc A record sai
```

### Lỗi: `dvcms-db unhealthy` — `initdb: error: could not create directory ".../pg_wal": No space left on device`
Postgres không thể init data directory vì ổ `/var/lib/docker` đầy. Nguyên nhân phổ biến: build `--no-cache` nhiều lần + dangling images từ các project khác (BioBot, dv-cms cũ, ...).

```bash
# 1. Kiểm tra disk
df -h /var/lib/docker
docker system df

# 2. Dọn toàn bộ (giữ volumes — volumes này sẽ bị xóa theo nếu -v)
cd /www/wwwroot/bioscope-website/dv-cms
docker compose down -v          # tắt containers + xóa volumes dv-cms (OK vì chưa có data)
docker system prune -af --volumes
docker builder prune -af

# 3. Logs Docker containers cũng chiếm chỗ — clear
truncate -s 0 /var/lib/docker/containers/*/*-json.log 2>/dev/null

# 4. Kiểm tra lại disk — cần ≥ 5 GB trống cho Postgres + image layers
df -h /var/lib/docker

# 5. Tìm thư mục lớn nhất nếu vẫn đầy
sudo du -sh /var/lib/docker/* 2>/dev/null | sort -hr | head -10
sudo du -sh /opt/* /www/* /home/* /root/* 2>/dev/null | sort -hr | head -10
```

Sau khi giải phóng ≥ 5 GB:
```bash
docker compose build
docker compose up -d
docker compose ps    # cả 3 services phải Up + Healthy
```

### Lỗi: `dvcms-db` restart liên tục, không bao giờ ready
Hai nguyên nhân:
- (A) Disk đầy → xem mục trên
- (B) `POSTGRES_PASSWORD` trong `.env` thay đổi nhưng volume cũ vẫn giữ user cũ. Fix: xóa volume (MẤT DATA nếu đã có):
```bash
docker compose down -v
docker compose up -d
```

### Lỗi: CMS / Frontend restart loop với `Error: Cannot find module '/app/node_modules/next/dist/bin/next'`
Dockerfile CMD sai path. pnpm hoist `next` vào `apps/<name>/node_modules/next` (symlink tới `.pnpm/next@...`), không phải `/app/node_modules/next`. Đã fix: chạy `./node_modules/next/dist/bin/next` tương đối với WORKDIR.

```bash
# Pull fix
git pull origin main
# Build lại image (chỉ rebuild 2 service này)
docker compose build cms frontend
# Up
docker compose up -d
# Verify
docker compose ps      # cả 3 phải Up + Healthy
docker compose logs cms --tail 20     # thấy "Ready in" là thành công
```

---

## 10. Tóm tắt 3 lệnh "must-run" sau khi setup

```bash
# 1. Cài đặt (1 lần) — build + start Docker
cd /opt/bioscope-website/dv-cms && bash scripts/install.sh

# 2. Sửa secrets trong .env (nếu chưa)
nano /opt/bioscope-website/dv-cms/.env   # paste POSTGRES_PASSWORD, PAYLOAD_SECRET, REVALIDATE_SECRET
docker compose restart cms frontend

# 3. Seed data (admin + 13 trang song ngữ + 1594 ingredients)
bash scripts/seed.sh

# 4. Cấu hình aaPanel reverse proxy (mục 5)
#   - Tạo 2 website trong aaPanel
#   - Bật Let's Encrypt
#   - Add reverse proxy web→26080, admin→26081
#   - Chèn proxy_set_header + client_max_body_size 50M

# 5. Verify
curl -I http://127.0.0.1:26080/    # Docker frontend (expect 200)
curl -I http://127.0.0.1:26081/admin  # Docker CMS (expect 200/301)
curl -I https://web.bioscope.vn/    # public (expect 200/301)
curl -I https://admin.bioscope.vn/admin  # public (expect 200/301)
```

Sau 5 bước trên, toàn bộ stack đã sẵn sàng production. Mọi thay đổi nội dung thực hiện trong `https://admin.bioscope.vn/admin` và sẽ reflect lên `https://web.bioscope.vn` trong vòng 60s (ISR).
