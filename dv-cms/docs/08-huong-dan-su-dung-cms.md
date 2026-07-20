# Hướng dẫn 8 — Sử dụng CMS Bioscope

Tài liệu dành cho **người biên tập nội dung** (không cần biết lập trình). Các phần
đánh dấu 🔒 chỉ tài khoản **Admin** mới thao tác được.

| | |
|---|---|
| Trang quản trị | https://admin.bioscope.vn/admin |
| Website | https://web.bioscope.vn |

---

## 1. Đăng nhập & bố cục màn hình

Đăng nhập bằng email + mật khẩu được cấp. Sau khi vào, màn hình có 3 khu vực:

- **Thanh bên trái** — menu chính, gom theo nhóm (xem mục 2).
- **Khu giữa** — danh sách bản ghi hoặc biểu mẫu chỉnh sửa.
- **Cột phải** — trạng thái xuất bản, slug, phân loại, nút Lưu/Xuất bản.

Thanh bên có thể **thu gọn thành dải icon**. Ở chế độ thu gọn, rê chuột vào một
icon sẽ mở menu con nổi bên cạnh.

### Nút "Ngôn ngữ nội dung" — quan trọng nhất

Góc trên bên phải có bộ chọn **Ngôn ngữ nội dung: Tiếng Việt / English**.

> Đây **không phải** ngôn ngữ giao diện. Nó quyết định bạn đang nhập nội dung cho
> **phiên bản tiếng nào**. Website có 2 ngôn ngữ (VI mặc định, EN), và phần lớn
> các trường văn bản được lưu **riêng cho từng ngôn ngữ**.

Quy trình đúng khi tạo/sửa nội dung:

1. Chọn **Tiếng Việt** → nhập đầy đủ → **Lưu**.
2. Chuyển sang **English** → nhập bản tiếng Anh → **Lưu**.

Nếu bỏ qua bước 2, khách xem site bản EN sẽ thấy nội dung trống hoặc rơi về bản
mặc định.

**Không** gõ hai thứ tiếng vào cùng một ô (kiểu `VI: … | EN: …`). Mỗi ngôn ngữ có
ô riêng của nó.

---

## 2. Bản đồ menu

| Nhóm | Dùng để làm gì |
|---|---|
| **Nội dung** | Trang, Bài viết, Danh mục, Thẻ, Biểu mẫu, Lượt gửi biểu mẫu |
| **Bioscope** | Nguyên liệu, Danh mục nguyên liệu, Công nghệ, Dịch vụ, Chứng nhận, Case study, Câu hỏi thường gặp, Đối tác |
| **Cổng B2B** | Thành viên, Tài liệu giới hạn (cần đăng nhập mới tải được) |
| **SEO & Marketing** | Cấu hình SEO, Chuyển hướng (redirect), Cấu hình ảnh, Bioscope AI |
| **Bảo mật** 🔒 | Cấu hình bảo mật, IP bị chặn, Nhật ký bảo mật, Cookie/Consent |
| **Loại tùy chỉnh** 🔒 | Tạo kiểu nội dung mới mà không cần lập trình |
| **Vận hành** 🔒 | Tiến trình AI, Đồng bộ Google Drive, Lịch sử đồng bộ CMS |
| **Hệ thống** 🔒 | Người dùng, Thư viện Media, Cấu hình site, **Menu & thông tin công ty**, Thương hiệu |

---

## 3. Bản nháp & xuất bản

Trang và Nguyên liệu có cơ chế **bản nháp**:

- **Lưu bản nháp** — chỉ bạn và nhân sự nội bộ thấy. Website chưa đổi.
- **Xuất bản** — nội dung lên website.
- **Danh sách phiên bản** (nút cạnh tên bản ghi) — xem lại và **khôi phục** bản cũ.
  Hệ thống giữ 20 phiên bản gần nhất cho Trang, 10 cho Nguyên liệu.

Nếu lỡ sửa hỏng, vào Danh sách phiên bản → chọn bản trước đó → Khôi phục.

---

## 4. Trang (Pages)

Mỗi trang tĩnh của website là một bản ghi trong **Nội dung → Trang**: Trang chủ,
Về chúng tôi, Giải pháp, R&D, Tài nguyên, Liên hệ…

### Các phần trong màn hình sửa trang

| Trường | Ý nghĩa |
|---|---|
| **Title** | Tên trang (hiển thị trong CMS và làm tiêu đề mặc định) |
| **Slug** | Đường dẫn, ví dụ `tai-nguyen` → `/tai-nguyen`. **Đổi slug sẽ làm hỏng link cũ** — nếu buộc phải đổi, tạo Redirect ở mục SEO |
| **Layout** | Danh sách **khối (block)** ghép nên nội dung trang |
| **SEO** | Tiêu đề, mô tả, ảnh chia sẻ mạng xã hội |

### Đổi ảnh phần đầu trang (header/hero)

Ảnh lớn ở đầu trang nằm trong **khối `Hero`** của phần Layout, ở trường **Media**.

1. Mở trang → cuộn tới khối **Hero** trong Layout.
2. Trường **Media** → *Tạo mới* (tải ảnh lên) hoặc *Chọn từ thư viện*.
3. **Xuất bản**.

> ⚠️ Cột phải có thể có một ô upload tên "Hero" — đó là trường cũ, **không dùng**.
> Ảnh header luôn lấy từ trường **Media của khối Hero**.

Website cache 60 giây, nên có thể mất tới ~1 phút để ảnh mới xuất hiện. Tải lại
trang sau đó.

### Xem trước trực tiếp (Live Preview)

Trang có nút **Live Preview**: hiện website ngay cạnh biểu mẫu, cập nhật theo
từng thay đổi trước khi xuất bản.

### Các khối có sẵn

Khối dùng chung: `Hero`, `Rich Text`, `Stats`, `Feature Grid`, `Gallery`, `CTA`,
`Logo Cloud`, `Video Embed`.

Khối chuyên biệt theo trang: nhóm `home*` (trang chủ), `about*` (về chúng tôi),
`solutions*` (giải pháp), `coCreate*` (đồng kiến tạo), `rdContent`, `contactInfo`,
`legalContent`.

Dùng nút kéo (⣿) bên trái mỗi khối để **đổi thứ tự**, nút ⋯ để **xóa/nhân bản**.

---

## 5. Nguyên liệu (Ingredients)

Trái tim của website. Vào **Bioscope → Nguyên liệu**.

### Nhóm trường chính

| Trường | Ghi chú |
|---|---|
| **Name** | Tên thương mại. Bắt buộc, có bản VI/EN riêng |
| **Subtitle** | Một câu mô tả ngắn, hiện ngay dưới tiêu đề |
| **INCI** | Tên khoa học / INCI |
| **Type** | Thực phẩm chức năng (TPCN) hoặc Mỹ phẩm |
| **Category** | Danh mục nguyên liệu |
| **Origin Country** | Mã quốc gia 2 ký tự: `JP`, `KR`, `US`, `VN`… |
| **Brand Name / Partner** | Nhà sản xuất, đối tác |
| **MOQ** | Số lượng đặt tối thiểu, ví dụ `25 kg` |
| **Description** | Mô tả dài, trình soạn thảo có thanh công cụ |
| **Benefits** | Công dụng — **mỗi ý một dòng**, nhập Enter để thêm |
| **Applications** | Dạng bào chế / ứng dụng — mỗi ý một dòng |
| **Badges** | Nhãn chứng nhận: `GMP Certified`, `ISO 22000 Certified`, `Halal`… |
| **Featured Image** | Ảnh đại diện |
| **Specs** | Bảng thông số kỹ thuật (nhãn + giá trị) |
| **Suggested Dosage** | Liều gợi ý |

Benefits/Applications nhập bằng **tiếng Việt khi đang ở ngôn ngữ VI**, và bằng
**tiếng Anh khi chuyển sang EN** — không gộp hai thứ tiếng vào một dòng.

### Nếu chưa có ảnh

Website tự hiển thị ảnh placeholder thương hiệu kèm nhãn "Ảnh đang cập nhật".
Không cần làm gì thêm, nhưng nên bổ sung ảnh thật khi có.

### Tạo nội dung bằng AI

Trong màn hình nguyên liệu có 2 nút:

- **Tạo nội dung tự động** — đọc tài liệu đính kèm trên Google Drive + tên sản
  phẩm, rồi sinh mô tả, công dụng, ứng dụng, INCI, thông số, SEO cho **cả VI và EN**.
- **Tạo lại ảnh** — sinh ảnh đại diện dựa trên nội dung sản phẩm.

Sau khi chạy xong, **luôn đọc lại và sửa** trước khi xuất bản. AI có thể suy đoán
sai thông số kỹ thuật.

Tiến trình chạy nền — theo dõi ở **Vận hành → Tiến trình AI** 🔒.

### Thông số kỹ thuật / Tài liệu trống

Trên website, tab "Kỹ thuật" hoặc "Ứng dụng" nếu chưa có dữ liệu sẽ hiện lời mời
liên hệ, chứ không để trống. Muốn hiện bảng thông số thì điền phần **Specs**.

---

## 6. Bài viết (Posts)

**Nội dung → Bài viết**. Các trường: `Title`, `Excerpt` (tóm tắt), `Content`,
`Cover` (ảnh bìa), `Author`, `Categories`, `Tags`, `Published At`.

`Published At` quyết định thứ tự hiển thị. Đặt ngày tương lai nếu muốn hẹn lịch
đăng (vẫn phải bấm Xuất bản).

---

## 7. Thư viện Media

**Hệ thống → Media**. Kho ảnh/tệp dùng chung.

- Ảnh được tự động tối ưu sang WebP.
- **Luôn điền Alt text** — phục vụ SEO và người khiếm thị.
- Xóa ảnh đang được dùng sẽ làm vỡ ảnh ở nơi khác. Kiểm tra trước khi xóa.

---

## 8. Biểu mẫu & liên hệ

- **Nội dung → Biểu mẫu** — định nghĩa các form (liên hệ, yêu cầu mẫu thử…).
  Trong mỗi form có mục **Emails**: khai báo địa chỉ nhận thông báo và tiêu đề mail.
- **Nội dung → Lượt gửi biểu mẫu** — toàn bộ dữ liệu khách gửi lên.

Khi khách gửi form, hệ thống gửi email tới các địa chỉ đã khai báo.

> Việc gửi mail chỉ hoạt động khi quản trị viên đã cấu hình SMTP trên máy chủ.
> Nếu không nhận được mail, kiểm tra với admin — dữ liệu vẫn được lưu đầy đủ
> trong "Lượt gửi biểu mẫu", không mất.

---

## 9. Menu & thông tin công ty

**Hệ thống → Navigation** 🔒 (Admin/Editor).

| Phần | Nội dung |
|---|---|
| **Menu đầu trang** | Menu chính. Mỗi mục có Nhãn + URL, và có thể thêm **mục con** |
| **Menu chân trang** | Các cột ở footer. Mỗi mục cha = một cột, mục con = các link trong cột |
| **Thông tin công ty (chân trang)** | Tên công ty, MST, địa chỉ ĐKKD, văn phòng, hotline, email, website |

Nhãn menu và tên/địa chỉ công ty **có bản VI/EN riêng** — nhớ nhập cả hai. Mã số
thuế, hotline, email, website dùng chung cho cả hai ngôn ngữ.

Footer cache 5 phút; đợi hoặc tải lại sau ít phút để thấy thay đổi.

---

## 10. SEO

Mỗi Trang / Bài viết / Nguyên liệu có tab **SEO** riêng:

- **Title** — để trống sẽ tự lấy tiêu đề bản ghi.
- **Description** — khoảng 155 ký tự.
- **Image** — ảnh chia sẻ mạng xã hội, khuyến nghị 1200×630.
- **Focus Keyphrase** — từ khóa trọng tâm; hệ thống chấm điểm SEO và gợi ý cải thiện.
- **No Index** — bật nếu **không** muốn Google lập chỉ mục trang này.

**SEO & Marketing → Redirects**: khi đổi slug hoặc gỡ trang, tạo redirect từ đường
dẫn cũ sang mới để không mất thứ hạng và không lỗi 404.

---

## 11. Người dùng & phân quyền 🔒

**Hệ thống → Người dùng**. Ba vai trò:

| Vai trò | Quyền |
|---|---|
| **Admin** | Toàn quyền, kể cả cấu hình hệ thống và quản lý người dùng |
| **Editor** | Tạo/sửa/xuất bản nội dung; không đụng được cấu hình hệ thống |
| **Viewer** | Chỉ xem |

Chỉ Admin mới đổi được vai trò của người khác.

---

## 12. Sự cố thường gặp

| Hiện tượng | Cách xử lý |
|---|---|
| Đổi ảnh header nhưng website chưa đổi | Kiểm tra đã sửa **Media trong khối Hero** (không phải ô "Hero" cột phải), đã **Xuất bản** chưa, rồi đợi ~1 phút và tải lại |
| Sửa menu/footer chưa thấy đổi | Footer cache 5 phút — đợi rồi tải lại |
| Nội dung bản EN trống | Chuyển "Ngôn ngữ nội dung" sang English và nhập lại, rồi Lưu |
| Chip công dụng hiện cả hai thứ tiếng trong một dòng | Dữ liệu cũ do AI sinh. Mở nguyên liệu, sửa lại từng ngôn ngữ cho sạch |
| Upload ảnh xong, refresh lại mất | Báo admin — thường do máy chủ chưa cập nhật cấu trúc dữ liệu |
| Live Preview trắng / sai trang | Báo admin kiểm tra biến `PREVIEW_ORIGIN` |
| Form gửi nhưng không nhận mail | Kiểm tra mục Emails trong Biểu mẫu; nếu đúng, báo admin kiểm tra SMTP |
| Không vào được admin, báo lỗi lạ | Báo admin kèm **ảnh chụp màn hình** và **giờ xảy ra** để tra log |

---

## 13. Nguyên tắc nên nhớ

1. **Luôn nhập đủ cả hai ngôn ngữ** trước khi xuất bản.
2. **Không đổi slug** của trang đã chạy, trừ khi tạo kèm redirect.
3. **Điền Alt text** cho mọi ảnh.
4. **Đọc lại nội dung AI** trước khi xuất bản — nhất là thông số kỹ thuật và
   công bố công dụng.
5. Sửa hỏng thì dùng **Danh sách phiên bản** để khôi phục, đừng gõ lại từ đầu.
6. Nội dung mới lên website chậm 1–5 phút do cache. Chưa thấy ngay là bình thường.
