# Hướng dẫn deploy Bioscope Website lên server (aaPanel)

Tài liệu này mô tả cách deploy project **Next.js 14** (`frontend/`) lên VPS dùng **aaPanel**, gồm cài mới và **cập nhật sau này**.

---

## Tổng quan 2 cách deploy

| Cách | Lệnh build | Chạy trên VPS | Khuyến nghị |
|------|------------|---------------|-------------|
| **A. PM2 + Node** | `npm run build` | `npm start` qua PM2 | ✅ **Khuyến nghị** — dễ update bằng `git pull` |
| **B. Static** | `npm run build:static` | Nginx serve thư mục `out/` | VPS không cần Node; upload file tĩnh |

> API webhook CMS (`/api/revalidate`) **chỉ hoạt động** với cách A (PM2 + Node).

File cấu hình mẫu thêm trong thư mục `deploy/`:
- `deploy/DEPLOY-PM2-AAPANEL.md` — bản rút gọn PM2
- `deploy/DEPLOY-AAPANEL.md` — bản rút gọn static
- `deploy/nginx-aapanel.conf` — Nginx cho static export

---

## Yêu cầu server

- **OS:** Ubuntu 22.04+ (aaPanel)
- **Node.js:** 20 LTS (cài qua aaPanel → Node.js Version Manager)
- **PM2:** cài qua aaPanel → PM2 Manager
- **RAM:** tối thiểu ~1GB trống cho Next.js (~200–400MB khi chạy)
- **Domain:** trỏ A record về IP VPS

---

# Cách A — PM2 + Node (khuyến nghị)

## A1. Cài đặt lần đầu trên aaPanel

1. **App Store** → cài **Node.js Version Manager** → chọn **Node 20**
2. **App Store** → cài **PM2 Manager**
3. **Website** → **Add site** → tạo domain (vd. `demo.bioscope.vn`)
4. Bật **SSL** → Let's Encrypt → **Force HTTPS**

## A2. Clone source lên VPS

```bash
cd /www/wwwroot
git clone git@github.com:HungDV2000/bioscope-website.git bioscope-website
cd bioscope-website/frontend
```

> Nếu dùng HTTPS thay SSH: `git clone https://github.com/HungDV2000/bioscope-website.git`

## A3. Build production

```bash
cd /www/wwwroot/bioscope-website/frontend

npm ci
npm run build          # KHÔNG dùng build:static
```

Kiểm tra:

```bash
test -f .next/BUILD_ID && echo "Build OK"
```

## A4. Chọn port — quan trọng

**Không dùng port 3000** nếu VPS đã có app khác (vd. `PersonalAdvisorBot`).

Kiểm tra port đang bận:

```bash
ss -tlnp | grep 3000
```

Khuyến nghị Bioscope dùng **port 31002**:

```bash
PORT=31002 NODE_ENV=production pm2 start npm --name bioscope-frontend -- start
pm2 save
pm2 list
```

Test local:

```bash
curl -I http://127.0.0.1:31002/vi
# Kỳ vọng: HTTP/1.1 200 OK
```

### Lưu ý PM2

- **Chỉ tạo 1 process** tên `bioscope-frontend` — không tạo thêm qua aaPanel UI **và** SSH cùng lúc (dễ tranh port → `EADDRINUSE`).
- Thứ tự đúng: **`npm run build` trước** → `pm2 start` sau.
- Nếu thấy cảnh báo PM2 version mismatch: chạy `pm2 update`.

## A5. Cấu hình Nginx (reverse proxy)

**Website** → domain → **Config**

Xóa/comment block `location /` cũ (try_files, PHP). Thêm:

```nginx
location / {
    proxy_pass http://127.0.0.1:31002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

Comment PHP (Next.js không cần):

```nginx
# include enable-php-83.conf;
```

Reload Nginx trong aaPanel.

## A6. Kiểm tra sau deploy

```bash
pm2 logs bioscope-frontend --lines 30
curl -I http://127.0.0.1:31002/vi
```

Trình duyệt: mở `https://demo.bioscope.vn/vi` → **Ctrl+Shift+R** (hard refresh).

---

# Cập nhật code mới (hàng ngày)

Sau khi `git push` từ máy dev:

```bash
cd /www/wwwroot/bioscope-website/frontend

git pull origin main
npm ci
npm run build
pm2 restart bioscope-frontend
pm2 list
```

Script một dòng:

```bash
cd /www/wwwroot/bioscope-website/frontend && git pull && npm ci && npm run build && pm2 restart bioscope-frontend && pm2 list
```

---

# Cách B — Static export (không cần PM2)

Phù hợp khi VPS **không** chạy Node lâu dài hoặc chỉ cần site tĩnh.

## B1. Build

Trên máy có Node (local hoặc VPS):

```bash
cd frontend
npm ci
npm run build:static
```

Kết quả: thư mục **`out/`**

## B2. Upload lên aaPanel

1. **Files** → document root site (vd. `/www/wwwroot/demo.bioscope.vn/`)
2. Xóa file mặc định
3. Upload **nội dung bên trong** `out/` (không upload cả folder `out`)

Cấu trúc đúng:

```
/www/wwwroot/demo.bioscope.vn/
├── index.html
├── vi/
├── en/
├── _next/
├── robots.txt
└── sitemap.xml
```

## B3. Nginx static

```nginx
root /www/wwwroot/demo.bioscope.vn;
index index.html;

location = / {
    return 302 /vi/;
}

location / {
    try_files $uri $uri/ $uri/index.html =404;
}

error_page 404 /404.html;
```

> **Không** dùng `try_files ... /index.html` — gây redirect loop.

## B4. Cập nhật static

```bash
npm run build:static
rsync -avz --delete out/ root@vps:/www/wwwroot/demo.bioscope.vn/
```

---

# Xử lý lỗi thường gặp

## PM2 `errored` / `EADDRINUSE: port 3000`

**Nguyên nhân:** Port đã bị app khác chiếm (vd. PersonalAdvisorBot trên 3000). PM2 restart liên tục → `errored`.

**Cách xử lý:**

```bash
ss -tlnp | grep 3000          # xem app nào đang dùng
pm2 delete bioscope-frontend   # xóa process lỗi
PORT=31002 NODE_ENV=production pm2 start npm --name bioscope-frontend -- start
```

Cập nhật Nginx `proxy_pass` → `http://127.0.0.1:31002`.

**Không kill** process app khác nếu PM2 của user `www` sẽ tự restart.

## `Cannot find module './vendor-chunks/next.js'` (dev local)

Cache `.next` hỏng:

```bash
rm -rf .next
npm run dev
# hoặc: npm run dev:clean
```

## PM2 không thấy project Bioscope

Cài PM2/Node trên aaPanel **không tự** thêm app. Phải `pm2 start` thủ công hoặc **Add Project** trong PM2 Manager (chỉ chọn **một** cách).

## Nginx 403 Forbidden (static)

- Thư mục document root **trống** → upload lại `out/`
- Tắt **Anti-XSS** trong Site directory (aaPanel) nếu bị chặn

## Nginx redirect loop

Dùng `try_files $uri $uri/ $uri/index.html =404` — **không** fallback `/index.html`.

## Log bot `/graphql`, `/.env`

Bot quét bảo mật — **bỏ qua**, không phải lỗi site.

---

# Biến môi trường (tuỳ chọn)

Tạo file `.env.production` trong `frontend/` khi nối CMS:

```env
NEXT_PUBLIC_CMS_URL=https://cms.bioscope.vn
REVALIDATE_SECRET=your-secret-here
```

Sau khi sửa `.env.production`:

```bash
npm run build
pm2 restart bioscope-frontend
```

---

# Checklist deploy nhanh

### Lần đầu (PM2)

- [ ] Node 20 + PM2 đã cài trên aaPanel
- [ ] `git clone` → `cd frontend`
- [ ] `npm ci && npm run build`
- [ ] `PORT=31002 pm2 start npm --name bioscope-frontend -- start`
- [ ] `curl -I http://127.0.0.1:31002/vi` → 200
- [ ] Nginx `proxy_pass` đúng port
- [ ] SSL bật Force HTTPS

### Mỗi lần update

- [ ] `git push` từ máy dev
- [ ] SSH: `git pull && npm ci && npm run build`
- [ ] `pm2 restart bioscope-frontend`
- [ ] Hard refresh trình duyệt

---

# Tham chiếu đường dẫn (VPS Contabo mẫu)

| Mục | Đường dẫn |
|-----|-----------|
| Source | `/www/wwwroot/bioscope-website/frontend` |
| PM2 process | `bioscope-frontend` |
| Port khuyến nghị | `31002` |
| Repo | `https://github.com/HungDV2000/bioscope-website` |
