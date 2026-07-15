# Better Editor — bật click-to-edit (same-origin preview)

## Vấn đề
Better Editor mở iframe preview trỏ tới frontend. **Click-to-edit đọc DOM của iframe**, mà trình duyệt chỉ cho phép khi iframe **cùng origin** với admin. Hiện admin (`admin.bioscope.vn`) và frontend (`web.bioscope.vn`) khác origin → click-to-edit bị chặn, dù các block ở home page đã gắn `data-better-editor-id`.

## Giải pháp: proxy same-origin
`apps/core-cms/scripts/preview-proxy.mjs` phục vụ **cả hai app dưới 1 origin**:

| Đường dẫn | Đích |
|---|---|
| `/admin`, `/api`, `/cms-static`, `/_payload` | CMS (Payload admin) |
| còn lại (route frontend + `/_next/*`) | Frontend |

Để admin không đụng asset với frontend, CMS phải chạy với **`CMS_ASSET_PREFIX=/cms-static`** (asset admin sẽ ở `/cms-static/_next`).

## Cách bật (Docker/VPS)
1. **Build lại CMS với asset prefix**: đặt env cho service `cms`:
   ```
   CMS_ASSET_PREFIX=/cms-static
   ```
   rồi `docker compose build cms && docker compose up -d cms`.

2. **Chạy proxy** (trên VPS, cạnh 2 container). Ví dụ port 3002:
   ```bash
   cd apps/core-cms
   PROXY_PORT=3002 \
   CMS_TARGET=http://localhost:26301 \
   FRONTEND_TARGET=http://localhost:26300 \
   npm run preview-proxy
   ```
   (hoặc thêm 1 service Docker chạy `node scripts/preview-proxy.mjs`).

3. **Trỏ domain admin vào proxy**: trong nginx/aaPanel, `admin.bioscope.vn` → **port proxy (3002)** thay vì thẳng vào CMS.

4. **Đặt PREVIEW_ORIGIN = origin admin** cho service `cms`:
   ```
   PREVIEW_ORIGIN=https://admin.bioscope.vn
   ```
   → `Pages.preview` sẽ tạo URL preview cùng origin với admin → click-to-edit hoạt động.

## Cách khác: nginx thuần (không cần Node proxy)
Trên server block `admin.bioscope.vn` (vẫn cần `CMS_ASSET_PREFIX=/cms-static`):
```nginx
location /cms-static/ { proxy_pass http://127.0.0.1:26301; }
location /admin       { proxy_pass http://127.0.0.1:26301; }
location /api         { proxy_pass http://127.0.0.1:26301; }
location /            { proxy_pass http://127.0.0.1:26300; }  # frontend
```
rồi `PREVIEW_ORIGIN=https://admin.bioscope.vn`.

## Lưu ý về phạm vi block
- **Home page** (`layout` blocks map sang section) đã render kèm `data-better-editor-id` → sửa được từng block.
- **Trang khác**: hiện dùng route hardcode, **chưa render `layout` blocks** → Better Editor không thấy block để sửa. Muốn sửa-trực-quan cho mọi page cần thêm renderer block chung ở frontend (việc riêng, chưa làm).
