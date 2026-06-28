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

Chạy nền bằng **PM2** (khuyến nghị):

```bash
npm i -g pm2
cd /www/wwwroot/bioscope-website/dv-cms/apps/bioscope-frontend
PORT=26000 pm2 start "pnpm start" --name bioscope-web
pm2 save
pm2 startup   # làm theo hướng dẫn in ra
```

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

Hoặc:

```bash
cd apps/bioscope-frontend && pnpm build && pm2 restart bioscope-web
```

---

## E. Xử lý sự cố

| Triệu chứng | Cách xử lý |
|---|---|
| `pnpm: command not found` | `corepack enable && corepack prepare pnpm@9.15.9 --activate` |
| `EADDRINUSE :26000` | Đổi cổng: `PORT=26002 pnpm start` và sửa proxy aaPanel |
| Trang trắng / 502 | `pm2 logs bioscope-web` hoặc `curl http://127.0.0.1:26000` |
| SSL lỗi | DNS phải trỏ đúng IP trước khi cấp Let's Encrypt |
