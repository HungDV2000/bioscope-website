# Triển khai bioscope-website lên VPS (Docker + 2 domain)

> **Stack production:** Docker Compose + nginx container nội bộ + Let's Encrypt + 2 domain.
> - **web.bioscope.vn** — frontend Next.js (storefront).
> - **admin.bioscope.vn** — Payload CMS + admin UI.
>
> Toàn bộ stack chạy bằng Docker; **không cần aaPanel/nginx ngoài** — `install.sh` tự xin SSL, mount cert vào nginx container, expose ra host ở dải port `26xxx` để không xung đột với BioBot (đang chiếm `5432/6379/80/443/15678/...`).

---

## 0. Tổng quan kiến trúc

```
Internet
   │  (DNS A record → IP VPS)
   ▼
┌────────────────────────────────────────────┐
│ Host (VPS)                                 │
│                                            │
│  127.0.0.1:26080  ─┐                      │
│  127.0.0.1:26443  ─┤  →  nginx container  │
│                    │     (dvcms-nginx)     │
│                    │     - ACME challenge  │
│                    │     - TLS terminate   │
│                    │     - route theo Host │
│                    │                       │
│                    │     web.bioscope.vn   │──→ frontend:26300
│                    │     admin.bioscope.vn │──→ cms:26301
│                    │                       │
│  127.0.0.1:26432  ──→ db (postgres:16)    │
│                                            │
│  Volumes: pgdata (DB), media (uploads)     │
└────────────────────────────────────────────┘
```

**Port quy ước** (dải `26xxx` tránh xung đột):

| Service | Container port | Host port (chỉ nginx) |
|---|---|---|
| nginx (public) | 80 + 443 | `26080` / `26443` |
| core-cms (Payload) | `26301` | (chỉ nginx mới truy cập) |
| frontend (Next) | `26300` | (chỉ nginx mới truy cập) |
| postgres | 5432 | `26432` (chỉ `127.0.0.1`) |

---

## 1. Chuẩn bị VPS

### 1.1. Yêu cầu tối thiểu
- **OS:** Ubuntu 22.04+ / Debian 12+
- **RAM:** ≥ 2 GB (khuyến nghị 4 GB nếu chạy song song BioBot)
- **Disk:** ≥ 20 GB trống
- **User:** có quyền `sudo` (KHÔNG chạy root trực tiếp)
- **Cổng mở ngoài:** `22` (SSH), `26080` (HTTP), `26443` (HTTPS) — KHÔNG cần mở `80/443`

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
sudo ufw allow 26080/tcp comment "bioscope HTTP"
sudo ufw allow 26443/tcp comment "bioscope HTTPS"
sudo ufw enable
sudo ufw status
```

> Lưu ý: KHÔNG mở `80/443` vì nginx container lắng nghe ở `26080/26443` (để tránh xung đột với BioBot).

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
Internal ports: 26432, 26080, 26443
URLs: https://admin.bioscope.vn/admin, https://web.bioscope.vn
BƯỚC TIẾP THEO: bash scripts/seed.sh
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

## 5. Cấu hình tên miền + proxy

> **Lưu ý quan trọng:** Trong setup này, **nginx container nội bộ đã đảm nhận reverse proxy + TLS**. Bạn **KHÔNG cần** cấu hình aaPanel/nginx ngoài trỏ vào 26000/26001 như tài liệu cũ.
>
> Chỉ cần:
> 1. DNS A record trỏ về IP VPS (mục 1.2)
> 2. Firewall mở 26080/26443 (mục 1.3)
> 3. Cert Let's Encrypt đã được `install.sh` xin sẵn (mount vào nginx container)
> 4. nginx container tự động:
>    - ACME challenge → trỏ vào `/var/www/certbot`
>    - HTTP (26080) → 301 redirect → HTTPS
>    - HTTPS (26443) → route theo `Host` header về `frontend:26300` hoặc `cms:26301`

### 5.1. Nếu ĐÃ có aaPanel/nginx trên host (xung đột 80/443)
Nếu trước đó bạn dùng aaPanel proxy `26000/26001` (theo setup cũ), hãy **gỡ bỏ** trước khi cài Docker nginx:
```bash
# Vào aaPanel → Website → xoá site web.bioscope.vn + admin.bioscope.vn
# (xoá cả reverse proxy + SSL Let's Encrypt cũ)
```

Lý do: nginx container cần bind trực tiếp port `26080/26443` trên host (đã map qua `127.0.0.1`), và cert Let's Encrypt mount từ `/etc/letsencrypt` (certbot host-level). Nếu aaPanel vẫn giữ cert ở path khác, dùng certbot host-level (mặc định `install.sh` dùng) là đủ.

### 5.2. Kiểm tra route đang hoạt động
```bash
# Host -> nginx (HTTP)
curl -v http://127.0.0.1:26080/ 2>&1 | grep -E "^< (HTTP|Location)"
# Expect: 301 + Location: https://...

# Host -> nginx -> frontend
curl -sS https://web.bioscope.vn/ | head -20
# Expect: HTML của trang chủ (9 block)

# Host -> nginx -> admin
curl -sS https://admin.bioscope.vn/admin | head -20
# Expect: HTML của Payload admin login

# SSL chain
openssl s_client -connect admin.bioscope.vn:26443 -servername admin.bioscope.vn < /dev/null 2>/dev/null \
  | openssl x509 -noout -subject -dates
```

### 5.3. Gia hạn SSL tự động
`install.sh` tạo cert qua certbot standalone, cert nằm ở `/etc/letsencrypt/live/{web,admin}.bioscope.vn/`. Auto-renew:
```bash
# Certbot tự cài cronjob timer. Kiểm tra:
sudo systemctl list-timers | grep certbot
# Test renew thử:
sudo certbot renew --dry-run
```
Mount vào container qua `docker-compose.yml`:
```yaml
volumes:
  - /etc/letsencrypt:/etc/letsencrypt:ro
  - /var/www/certbot:/var/www/certbot:ro
```
Đã có sẵn — không cần sửa.

> Nếu cert được renew, nginx container tự động pick up cert mới (certbot reload nginx-host). **Để nginx container nhận cert mới**, restart:
> ```bash
> docker compose restart nginx
> ```

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
| nginx chỉ bind `127.0.0.1:26080/26443` (không lộ ra ngoài) | ✅ | `docker-compose.yml` |
| `cms` + `frontend` không publish port (chỉ nginx mới truy cập) | ✅ | `docker-compose.yml` (`expose` không `ports`) |
| Secret được generate ngẫu nhiên | ✅ | `openssl rand -hex 32` |
| SSL Let's Encrypt auto-renew | ✅ | certbot timer |
| Firewall chỉ mở 22/26080/26443 | ✅ | UFW |
| service-account.json không commit git | ✅ | `.gitignore` + `chmod 600` |

**Lưu ý vận hành:**
- **Xoay secret** định kỳ (≥ 6 tháng): regen `POSTGRES_PASSWORD` + `PAYLOAD_SECRET` + `REVALIDATE_SECRET` → cập nhật `.env` → `docker compose down && up -d`. Lưu ý đổi `POSTGRES_PASSWORD` cần reset password role trong DB.
- **Đổi mật khẩu admin** ngay sau lần đăng nhập đầu tiên.
- **Không commit** `.env`, `service-account.json` lên git.

---

## 9. Troubleshooting thường gặp

### Lỗi: `502 Bad Gateway` từ nginx container
```bash
# Check container backend
docker compose ps
docker compose logs cms --tail 50
docker compose logs frontend --tail 50
```
Thường do: app chưa ready, sai env var, hoặc DB chưa migrate.

### Lỗi: SSL cert expired / không nhận cert mới
```bash
sudo certbot renew
docker compose restart nginx   # reload cert
```

### Lỗi: `permission denied` trên `/etc/letsencrypt`
Cert được mount `:ro` — chỉ nginx (user `nginx` trong container) đọc được. Nếu container fail start:
```bash
ls -la /etc/letsencrypt/live/
sudo chmod 755 /etc/letsencrypt/live
```

### Lỗi: Domain không resolve
```bash
dig +short web.bioscope.vn
# Nếu không trả IP: DNS chưa propagate hoặc A record sai
```

### Lỗi: Container `cms` restart liên tục
```bash
docker compose logs cms --tail 100
# Thường do PAYLOAD_SECRET rỗng, hoặc DB URI sai
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

---

## 10. Tóm tắt 3 lệnh "must-run" sau khi setup

```bash
# 1. Cài đặt (1 lần)
cd /opt/bioscope-website/dv-cms && bash scripts/install.sh

# 2. Seed data (sau khi sửa secret trong .env)
bash scripts/seed.sh

# 3. Verify
curl -I https://web.bioscope.vn/ && curl -I https://admin.bioscope.vn/admin
```

Sau 3 bước trên, toàn bộ stack đã sẵn sàng production. Mọi thay đổi nội dung thực hiện trong `https://admin.bioscope.vn/admin` và sẽ reflect lên `https://web.bioscope.vn` trong vòng 60s (ISR).
