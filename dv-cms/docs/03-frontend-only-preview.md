# Hướng dẫn 3 — Chỉ chạy Frontend (xem giao diện, không Docker)

Website dùng **nội dung tĩnh** trong `src/lib/content.ts` — **không cần** Postgres, CMS hay Docker
để xem giao diện.

| Mục | Giá trị |
|-----|---------|
| Domain production | `web.bioscope.vn` |
| Cổng dev | `3000` |
| Cổng gợi ý trên VPS (không Docker) | `26000` |

---

## A. Xem trên máy dev (Mac / Windows)

```bash
cd dv-cms
corepack enable
pnpm install

cd apps/bioscope-frontend
cp .env.example .env.local   # tùy chọn — CMS chưa cần

pnpm dev
```

Mở: **http://localhost:3000**

Dừng: `Ctrl + C`

---

## B. Xem trên VPS (SSH, không Docker)

### B.1 Chế độ dev (nhanh, hot reload)

```bash
cd /www/wwwroot/bioscope-website/dv-cms
git pull
corepack enable
pnpm install

cd apps/bioscope-frontend
pnpm dev -- -p 26000 -H 0.0.0.0
```

Hoặc dùng biến môi trường:

```bash
PORT=26000 pnpm dev -- -H 0.0.0.0
```

Hoặc gọi trực tiếp:

```bash
pnpm exec next dev -p 26000 -H 0.0.0.0
```

Truy cập tạm: `http://<IP-VPS>:26000` (mở firewall cổng 26000 nếu cần).

> Dev server **không nên** để chạy lâu trên production — chỉ để xem thử.

### B.2 Chế độ production (ổn định hơn)

**Chỉ build frontend** (không build CMS):

```bash
cd /www/wwwroot/bioscope-website/dv-cms
pnpm fe:build
PORT=26000 pnpm fe:start
```

Hoặc vào thư mục app:

```bash
cd apps/bioscope-frontend
pnpm build
PORT=26000 pnpm start
```

> **Lưu ý:** `pnpm build` ở **gốc** `dv-cms/` sẽ build **cả CMS + frontend** (turbo).
> `pnpm start` ở gốc **không có** — phải dùng `pnpm fe:start` hoặc `cd apps/bioscope-frontend`.

Chạy nền bằng **PM2** (bắt buộc trên VPS — đóng SSH vẫn chạy):

```bash
npm i -g pm2
cd /www/wwwroot/bioscope-website/dv-cms

# Đã build xong rồi thì chỉ cần:
pm2 start ecosystem.frontend.config.cjs
pm2 save
pm2 startup    # copy & chạy lệnh in ra để tự chạy lại sau reboot
```

Quản lý:

```bash
pm2 status
pm2 logs bioscope-web
pm2 restart bioscope-web
pm2 stop bioscope-web
```

**Không** dùng `pnpm start` trực tiếp trong terminal production — tắt SSH là web dừng.

Kiểm tra:

```bash
curl -sI http://127.0.0.1:26000 | head -5
```

---

## C. Trỏ domain trên aaPanel → `web.bioscope.vn`

**Điều kiện:** DNS `web.bioscope.vn` trỏ A record về IP VPS.

### Cách 1 — Reverse proxy (khuyến nghị)

Frontend đã chạy tại `127.0.0.1:26000` (hoặc `3000` nếu bạn chọn cổng đó).

1. **Website** → **Add site**
2. Domain: `web.bioscope.vn`
3. PHP: **Pure static** hoặc tắt PHP (không cần PHP cho Next)
4. Vào site → **Reverse proxy** (hoặc **Config** → thêm proxy)
5. Target URL: `http://127.0.0.1:26000`
6. Bật **Websocket** nếu có (tùy chọn, dev mode cần hơn)
7. **SSL** → Let's Encrypt → Apply

Nginx tương đương (aaPanel tự sinh, tham khảo):

```nginx
location / {
    proxy_pass http://127.0.0.1:26000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### Cách 2 — Node Project (aaPanel có sẵn)

1. **App Store** → cài **PM2 Manager** / **Node version manager**
2. Node **≥ 20.9**
3. **Add project**:
   - Path: `/www/wwwroot/bioscope-website/dv-cms/apps/bioscope-frontend`
   - Start: `pnpm start` hoặc `node node_modules/next/dist/bin/next start -p 26000`
   - Port: `26000`
4. Gắn domain `web.bioscope.vn` vào project → bật SSL

### Lưu ý aaPanel

- **Không** deploy project này qua mục **Docker Compose** của panel (dễ lỗi `list index out of range`).
- Chỉ dùng **Reverse proxy** hoặc **PM2 + Node** như trên.
- CMS (`cms.bioscope.vn`) làm sau — lúc này chỉ cần frontend.

---

## D. Cập nhật code sau này

```bash
cd /www/wwwroot/bioscope-website/dv-cms
git pull
pnpm fe:build
pm2 restart bioscope-web
```

---

## E. Xử lý sự cố

| Triệu chứng | Cách xử lý |
|---|---|
| `pnpm: command not found` | `corepack enable && corepack prepare pnpm@9.15.9 --activate` |
| `EADDRINUSE :26000` | Đổi cổng: `PORT=26002 pnpm start` và sửa proxy aaPanel |
| Trang trắng / 502 / **Connection refused (111)** | Next **không chạy** cổng 26000 — xem **E.2** |
| Ảnh `/images/...` lỗi (icon OK, logo/ảnh PNG lỗi) | Xem **E.1** bên dưới |

### E.1 Ảnh có trên server nhưng không load (HTML OK, PNG/WebP broken)

**Triệu chứng:** Icon Lucide hiện bình thường, logo đối tác / banner / ảnh section bị broken.

**Nguyên nhân phổ biến trên aaPanel:** Nginx có block cache file ảnh:

```nginx
location ~ .*\.(gif|jpg|jpeg|png|bmp|swf|webp|svg)$ { ... }
```

Block này **ưu tiên hơn** `location /` proxy → nginx tìm file trong
`/www/wwwroot/web.bioscope.vn/images/...` (thư mục site PHP) thay vì gửi về Next
(`apps/bioscope-frontend/public/images/`). File thật nằm đúng chỗ nhưng **domain trả 404**.

#### Bước 1 — Chẩn đoán (chạy trên VPS)

```bash
# Next.js serve ảnh OK?
curl -sI http://127.0.0.1:26000/images/clients/PolymerSolution.png | head -3

# Qua domain (nginx) lỗi?
curl -sI https://web.bioscope.vn/images/clients/PolymerSolution.png | head -3
```

| Kết quả | Ý nghĩa |
|---------|---------|
| `127.0.0.1:26000` → **200**, domain → **404** | Lỗi **nginx/aaPanel** (không phải thiếu file) |
| Cả hai **404** | PM2 cwd sai hoặc thiếu file trong `public/` |
| Cả hai **502** | Next chưa chạy: `pm2 restart bioscope-web` |

#### Bước 2a — Sửa nginx (khuyến nghị)

1. aaPanel → **Website** → `web.bioscope.vn` → **Config**
2. Dán nội dung file [`docs/snippets/aapanel-nginx-nextjs-proxy.conf`](snippets/aapanel-nginx-nextjs-proxy.conf)
   **trước** block cache ảnh tĩnh (hoặc comment block `location ~ .*\.(png|jpg|...)`)
3. **Save** → **Reload** nginx

#### Bước 2b — Workaround nhanh (symlink, không sửa nginx)

```bash
cd /www/wwwroot/bioscope-website/dv-cms
chmod +x scripts/vps-link-public.sh
./scripts/vps-link-public.sh /www/wwwroot/web.bioscope.vn
```

Tạo symlink `web.bioscope.vn/images` → `apps/bioscope-frontend/public/images`.

#### Bước 3 — Rebuild sau khi git pull (có `images.unoptimized`)

```bash
cd /www/wwwroot/bioscope-website/dv-cms
git pull
pnpm fe:build
pm2 restart bioscope-web
```

### E.2 `Connection refused` — nginx OK, Next.js chưa chạy

Log nginx:

```text
connect() failed (111: Connection refused) ... upstream: "http://127.0.0.1:26000/..."
```

**Nghĩa là:** proxy đúng rồi, nhưng **không có process nào lắng nghe cổng 26000**.

**Sửa trên VPS (copy từng lệnh):**

```bash
cd /www/wwwroot/bioscope-website/dv-cms

# 1. Cổng 26000 có process không?
ss -tlnp | grep 26000
# Không có dòng nào → Next chưa chạy

# 2. Build (bắt buộc trước start)
pnpm install
pnpm fe:build

# 3. Khởi động PM2
chmod +x scripts/vps-fe-start.sh
./scripts/vps-fe-start.sh

# Hoặc thủ công:
pm2 delete bioscope-web 2>/dev/null || true
pm2 start ecosystem.frontend.config.cjs
pm2 save

# 4. Phải thấy 200
curl -sI http://127.0.0.1:26000/ | head -3
pm2 logs bioscope-web --lines 30
```

| `pm2 logs` báo lỗi | Cách xử lý |
|--------------------|------------|
| `Could not find a production build` | Chạy `pnpm fe:build` |
| `EADDRINUSE` | `fuser -k 26000/tcp` rồi `pm2 restart bioscope-web` |
| `next: command not found` | `cd apps/bioscope-frontend && pnpm install` |

| SSL lỗi | DNS phải trỏ đúng IP trước khi cấp Let's Encrypt |
