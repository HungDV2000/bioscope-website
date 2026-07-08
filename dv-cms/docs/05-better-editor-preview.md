# Better Editor — Preview trực quan khi edit CMS

Cài `payload-better-editor` để **xem preview website ngay trong admin** khi sửa nội dung, kèm **click-to-edit** (bấm block trong preview → nhảy tới field tương ứng).

## Cách dùng
1. Mở admin tại **http://localhost:3001/admin** (đăng nhập admin@bioscope.vn).
2. Vào **Pages → một trang** (vd Trang chủ), bấm nút **"Open Better Editor"** ở thanh trên.
3. Trái = preview website thật; Phải = sidebar Page / Blocks / Settings. Có nút đổi viewport (desktop/tablet/mobile).
4. **Click-to-edit** (chỉ trang chủ hiện tại — vì trang chủ render từ block): bấm một section trong preview → sidebar tự chọn đúng block để sửa.
5. Preview cập nhật **khi Lưu** (chưa bật autosave để tránh đụng schema cột autosave).

## Kiến trúc same-origin (bắt buộc cho click-to-edit)
Click-to-edit của plugin yêu cầu preview **cùng origin** với admin. Admin chạy :3001, frontend :3000 (khác origin) → dùng proxy:

- **CMS (`apps/core-cms/next.config.mjs`)** rewrite mọi path KHÔNG phải `admin|api|_next|media|...` → `FRONTEND_URL` (:3000). Nên `:3001/<path>` render frontend, cùng origin với admin.
- **Frontend (`apps/bioscope-frontend/next.config.mjs`)** đặt `assetPrefix = ASSET_PREFIX` (=`http://localhost:3000` trong `.env.local`) để asset frontend nạp từ :3000, không đụng `/_next` của admin.
- **Pages** có `admin.preview` trả path tương đối (`/`, `/ve-chung-toi`…) → plugin load `:3001/<path>` (proxy → frontend).
- **`data-better-editor-id`** gắn trên mỗi section trang chủ (`app/(site)/page.tsx`), giá trị = id block của CMS Page → plugin map click ↔ block.

## Lưu ý production
- Đặt `FRONTEND_URL` (CMS) và `ASSET_PREFIX` (frontend) theo domain thật; cần 1 reverse-proxy đưa admin + preview về cùng host để click-to-edit chạy.
- Muốn preview cập nhật **real-time khi gõ** (không cần Lưu): bật `versions.drafts.autosave` trên Pages (sẽ tạo lại cột autosave — cân nhắc migration).
- Click-to-edit chỉ chạy trên trang render-từ-block (hiện: trang chủ). Trang khác vẫn có preview (iframe) nhưng chưa click-to-edit vì render bằng component tĩnh.
