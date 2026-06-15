# Deploy Bioscope bằng PM2 + Node (aaPanel) — khuyến nghị

Cách này **không cần** upload folder `out/`, **không cần** cấu hình `try_files` phức tạp.
Nginx chỉ reverse proxy → Node chạy Next.js.

---

## Bước 1 — Cài trên aaPanel

**App Store** → cài:
- **Node.js Version Manager** → chọn **Node 20**
- **PM2 Manager**

---

## Bước 2 — Đưa source lên VPS

```bash
cd /www/wwwroot/demo.bioscope.vn
git clone https://github.com/HungDV2000/bioscope-website.git repo
cd repo/frontend
```

Hoặc upload ZIP source `frontend/` (không gồm `node_modules`, `.next`).

---

## Bước 3 — Build & chạy

```bash
cd /www/wwwroot/demo.bioscope.vn/repo/frontend

npm ci
npm run build          # KHÔNG dùng build:static
PORT=3000 pm2 start npm --name bioscope-demo -- start
pm2 save
```

Kiểm tra:

```bash
curl -I http://127.0.0.1:3000/vi
# HTTP/1.1 200 OK
```

---

## Bước 4 — Nginx reverse proxy (aaPanel)

**Website** → `demo.bioscope.vn` → **Config**

**Xóa** các block `location /` với `try_files` cũ. Thay bằng:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
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

**Comment** dòng PHP:

```nginx
# include enable-php-83.conf;
```

Reload Nginx.

---

## Bước 5 — Cập nhật sau này

```bash
cd /www/wwwroot/demo.bioscope.vn/repo/frontend
git pull
npm ci
npm run build
pm2 restart bioscope-demo
```

---

## So sánh

| | Static `out/` | PM2 + Node |
|--|---------------|------------|
| Upload | Phải upload đúng `out/` | Git pull / upload source |
| Nginx | `try_files` dễ lỗi | Chỉ `proxy_pass` |
| RAM VPS | Thấp | ~200–400MB |
| Webhook CMS | Không | Có (restore API route) |
