# Deploy Bioscope Website lên aaPanel (static — không cần Node.js)

## 1. Build trên máy local (hoặc VPS có Node)

```bash
cd frontend
npm ci
npm run build:static
```

Sau khi chạy xong, thư mục **`out/`** chứa toàn bộ website tĩnh.

## 2. Upload lên aaPanel

1. Vào **Files** → mở document root site (vd. `/www/wwwroot/bioscope.vn/`)
2. **Xóa** file mặc định (index.html aaPanel nếu có)
3. Upload **toàn bộ nội dung bên trong** `out/` (không upload cả folder `out`, mà upload *nội dung* của nó)
4. Cấu trúc trên VPS phải có:
   ```
   /www/wwwroot/bioscope.vn/
   ├── index.html
   ├── vi/
   ├── en/
   ├── _next/
   └── ...
   ```

## 3. Cấu hình Nginx (aaPanel)

**Website** → domain → **Config** → **xóa** block `location /` cũ (nếu có `try_files ... /index.html`) và thay bằng:

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

File mẫu đầy đủ: `deploy/nginx-aapanel.conf`

**Quan trọng:** Không dùng `try_files ... /index.html` — sẽ gây lỗi:
`rewrite or internal redirection cycle while internally redirecting to "/index.html"`

Reload Nginx sau khi sửa.

## 4. SSL

**Website** → **SSL** → Let's Encrypt → bật **Force HTTPS**.

## 5. Cập nhật site sau này

```bash
git pull
npm ci
npm run build:static
```

Upload lại nội dung `out/` lên VPS (hoặc rsync):

```bash
rsync -avz --delete out/ user@vps:/www/wwwroot/bioscope.vn/
```

---

## So sánh 2 chế độ build

| Lệnh | Kết quả | Deploy |
|------|---------|--------|
| `npm run build:static` | Thư mục `out/` | aaPanel static (Nginx) |
| `npm run build` + `npm start` | Thư mục `.next/` | PM2 + reverse proxy |

API `/api/revalidate` (webhook CMS) **chỉ có** khi chạy Node — file mẫu: `deploy/api-revalidate.route.example.ts`.

---

## Lỗi thường gặp

| Triệu chứng / log Nginx | Nguyên nhân | Cách xử lý |
|-------------------------|-------------|------------|
| `directory index of "..." is forbidden` | Thư mục **trống** hoặc **không có** `index.html` | Upload lại nội dung `out/` |
| `robots.txt ... No such file` | Chưa upload file build | Upload đủ `out/` (có `robots.txt`, `vi/`, `_next/`) |
| `redirection cycle ... /index.html` | Nginx `try_files` sai | Dùng `try_files $uri $uri/ $uri/index.html =404` |
| 403 Forbidden | Thư mục rỗng hoặc Anti-XSS aaPanel | Upload file + tắt Anti-XSS trong Site directory |
| Log `/graphql`, `/.env`, `/console` | Bot quét bảo mật — **bỏ qua** | Không phải lỗi site |
| `favicon.ico ... No such file` | Chưa có favicon | Bỏ qua hoặc thêm `public/favicon.ico` rồi build lại |

### Kiểm tra đã upload đúng chưa (SSH)

```bash
ls -la /www/wwwroot/demo.bioscope.vn/
# Phải thấy: index.html  vi/  en/  _next/  robots.txt  sitemap.xml

test -f /www/wwwroot/demo.bioscope.vn/vi/index.html && echo OK || echo MISSING
```
