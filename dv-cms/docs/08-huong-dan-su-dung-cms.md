# Hướng dẫn 8 — Sử dụng CMS Bioscope

Tài liệu dành cho **người biên tập nội dung** (không cần biết lập trình). Mỗi phần
đều có **các bước thao tác cụ thể**. Các mục đánh dấu 🔒 chỉ tài khoản **Admin**
mới thao tác được.

| | |
|---|---|
| Trang quản trị | https://admin.bioscope.vn/admin |
| Website | https://web.bioscope.vn |

> 💡 Trong tài liệu, ký hiệu **→** nghĩa là "bấm vào tiếp". Ví dụ **Nội dung → Trang**
> = ở thanh menu bên trái, mở nhóm *Nội dung*, rồi bấm *Trang*.

---

## 1. Đăng nhập & bố cục màn hình

### Các bước đăng nhập

1. Mở trình duyệt, vào `https://admin.bioscope.vn/admin`.
2. Nhập **Email** và **Mật khẩu** được cấp → bấm **Login / Đăng nhập**.
3. Nếu nhập sai **5 lần**, hệ thống khóa tài khoản **15 phút** — đợi hoặc nhờ Admin mở khóa.
4. Quên mật khẩu → bấm **Forgot password**, nhập email để nhận link đặt lại (cần máy chủ đã cấu hình gửi mail).

### Ba khu vực màn hình

- **Thanh bên trái** — menu chính, gom theo nhóm (xem mục 2). Có thể thu gọn thành dải icon; rê chuột vào icon để mở menu con.
- **Khu giữa** — danh sách bản ghi hoặc biểu mẫu chỉnh sửa.
- **Cột phải** — trạng thái xuất bản, slug, ảnh sidebar, nút **Save draft** / **Publish**.

### Nút "Ngôn ngữ nội dung" — quan trọng nhất

Góc trên bên phải có bộ chọn **Ngôn ngữ nội dung: Tiếng Việt / English**.

> Đây **không phải** ngôn ngữ giao diện. Nó quyết định bạn đang nhập nội dung cho
> **phiên bản tiếng nào**. Website có 2 ngôn ngữ (VI mặc định, EN); phần lớn các
> trường văn bản được lưu **riêng cho từng ngôn ngữ**.

**Quy trình song ngữ đúng — làm cho MỌI bản ghi:**

1. Chọn **Tiếng Việt** → nhập đầy đủ các trường → **Save/Publish**.
2. Chuyển bộ chọn sang **English** → dịch/nhập lại các trường → **Save/Publish**.

> ⚠️ Nếu bỏ qua bước 2, khách xem bản EN sẽ thấy nội dung trống hoặc rơi về bản
> mặc định. **Không** gõ hai thứ tiếng vào cùng một ô. Trường nào có bản riêng
> theo ngôn ngữ sẽ **đổi nội dung khi bạn đổi bộ chọn**; trường dùng chung (MST,
> hotline, email, ảnh…) thì giữ nguyên.

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
| **Hệ thống** 🔒 | Người dùng, Thư viện Media, Cấu hình site, Menu & thông tin công ty, Thương hiệu |

---

## 3. Bản nháp, xuất bản & khôi phục phiên bản

Trang và Nguyên liệu có cơ chế **bản nháp**.

### Lưu nháp và xuất bản

1. Ở cột phải, trạng thái hiện **Draft** (nháp) hoặc **Published** (đã đăng).
2. Bấm **Save draft** để lưu tạm — website **chưa** đổi, chỉ nội bộ thấy.
3. Bấm **Publish** (hoặc **Publish changes**) để đưa nội dung lên website.
4. Muốn gỡ khỏi website: mở lại bản ghi → **Unpublish**.

### Khôi phục bản cũ (Versions)

1. Mở bản ghi → bấm nút **Versions** (cạnh tên bản ghi).
2. Chọn một phiên bản trong danh sách → xem nội dung.
3. Bấm **Restore this version** để khôi phục.

> Hệ thống giữ **20 phiên bản** gần nhất cho Trang, **10** cho Nguyên liệu.
> Lỡ sửa hỏng thì khôi phục — **đừng gõ lại từ đầu**.

---

## 4. Trang (Pages)

Mỗi trang tĩnh là một bản ghi trong **Nội dung → Trang**: Trang chủ, Về chúng tôi,
Giải pháp, R&D, Tài nguyên, Liên hệ…

### Trường của một trang

| Trường | Ý nghĩa |
|---|---|
| **Title** | Tên trang (song ngữ). Hiển thị trong CMS và làm tiêu đề mặc định |
| **Slug** | Đường dẫn, ví dụ `tai-nguyen` → `/tai-nguyen`. Thường tự sinh từ Title |
| **Layout** | Danh sách **khối (block)** ghép nên nội dung trang |
| **Hero** (sidebar) | ⚠️ Trường ảnh cũ ở cột phải — **KHÔNG dùng** (xem bên dưới) |
| **SEO** | Tiêu đề, mô tả, ảnh chia sẻ mạng xã hội (xem mục 12) |

### Sửa nội dung một trang có sẵn

1. **Nội dung → Trang** → bấm vào tên trang cần sửa.
2. Cuộn phần **Layout** — mỗi mục là một **khối**. Bấm vào khối để mở các trường bên trong.
3. Sửa chữ/ảnh trong khối.
4. Nhớ làm **cả hai ngôn ngữ** (đổi bộ chọn Tiếng Việt/English).
5. **Publish**.

### Thêm / xóa / sắp xếp khối

- **Thêm khối:** cuối phần Layout bấm **Add Block** → chọn loại khối → điền nội dung.
- **Đổi thứ tự:** giữ **nút kéo (⣿)** bên trái khối và kéo lên/xuống.
- **Xóa / nhân bản:** bấm nút **⋯** ở góc khối → *Remove* hoặc *Duplicate*.

### Đổi ảnh phần đầu trang (Hero)

1. Mở trang → cuộn tới khối **Hero** trong Layout.
2. Ở trường **Media** của khối → **Upload new** (tải ảnh) hoặc **Choose from existing** (chọn trong thư viện).
3. **Publish**.

> ⚠️ Cột phải có ô upload cũng tên "Hero" — **đó là trường cũ, không dùng**. Ảnh
> header luôn lấy từ **Media của khối Hero**. Website cache ~60 giây nên ảnh mới có
> thể mất tới ~1 phút mới hiện; tải lại trang sau đó.

### Xem trước trực tiếp (Live Preview)

- Bấm nút **Live Preview** để hiện website ngay cạnh biểu mẫu; nội dung cập nhật theo từng thay đổi trước khi xuất bản.
- Có thể chọn khung xem **Desktop / Tablet / Mobile**.

### Các khối có sẵn

Khối dùng chung: `Hero`, `Rich Text`, `Stats`, `Feature Grid`, `Gallery`, `CTA`,
`Logo Cloud`, `Video Embed`. Khối chuyên biệt theo trang: nhóm `home*` (trang chủ),
`about*`, `solutions*`, `coCreate*`, `rdContent`, `contactInfo`, `legalContent`.

---

## 5. Nguyên liệu (Ingredients)

Trái tim của website. Vào **Bioscope → Nguyên liệu**.

### 5.1. Các trường chính

| Trường | Ghi chú |
|---|---|
| **Name** | Tên thương mại. **Bắt buộc**, song ngữ |
| **Subtitle** | Một câu mô tả ngắn dưới tiêu đề (song ngữ) |
| **Type** | **Bắt buộc**: Supplement (TPCN) / Cosmetic (Mỹ phẩm) / Both (Đa ngành) |
| **Tag** | Nhãn nổi bật: NEW / TRENDING / EXCLUSIVE (tùy chọn) |
| **INCI** | Tên khoa học / INCI (song ngữ) |
| **Suggested Dosage** | Liều gợi ý (song ngữ) |
| **Category** | Chọn 1 Danh mục nguyên liệu |
| **Origin Country** | Mã quốc gia 2 ký tự: `JP`, `KR`, `US`, `VN`… |
| **Brand Name** | Thương hiệu OEM |
| **Partner** | Chọn Đối tác/Nhà sản xuất |
| **MOQ** | Số lượng đặt tối thiểu, ví dụ `25 kg` |
| **Description** | Mô tả dài, trình soạn thảo có thanh công cụ (song ngữ) |
| **Benefits** | Công dụng — **mỗi ý một dòng** (song ngữ) |
| **Applications** | Ứng dụng / dạng bào chế — **mỗi ý một dòng** (song ngữ) |
| **Badges** | Nhãn chứng nhận: `GMP Certified`, `ISO 22000 Certified`, `Halal`… |
| **Featured Image** | Ảnh đại diện |
| **Gallery** | Bộ ảnh bổ sung (mảng ảnh) |
| **Technologies** | Liên kết tới các Công nghệ liên quan |
| **Specs** | Bảng thông số kỹ thuật (nhãn + giá trị) |
| **Featured** (sidebar) | Đánh dấu để ưu tiên hiển thị |

### 5.2. Tạo nguyên liệu mới (thủ công)

1. **Bioscope → Nguyên liệu** → bấm **Create New**.
2. Đang ở **Tiếng Việt**, nhập **Name** (bắt buộc) và chọn **Type** (bắt buộc).
3. Điền Subtitle, INCI, Category, Origin Country, MOQ, Description.
4. **Benefits / Applications:** gõ một ý → **Enter** để xuống dòng thêm ý mới.
5. Tải **Featured Image** (và Gallery nếu có).
6. Điền bảng **Specs**: mỗi dòng gồm *nhãn* + *giá trị* — bấm **Add row** để thêm.
7. Bấm **Save draft**.
8. Chuyển bộ chọn sang **English**, dịch lại Name/Subtitle/INCI/Description/Benefits/Applications → **Save**.
9. Kiểm tra bằng **Live Preview** (nếu có) → **Publish**.

### 5.3. Tạo nội dung bằng AI

Trong màn hình sửa nguyên liệu có 2 nút:

- **🤖 Tạo nội dung tự động** — đọc tài liệu đính kèm trên Google Drive + tên sản phẩm, rồi để OpenAI viết Subtitle, Mô tả, Lợi ích, Ứng dụng, INCI, Thông số, SEO cho **cả VI và EN**.
- **🖼️ Tạo lại ảnh** — sinh ảnh đại diện mới từ tên + subtitle (giữ nguyên nội dung chữ).

**Các bước dùng "Tạo nội dung tự động":**

1. Nhập **Name** → bấm **💾 Lưu nguyên liệu trước** (để hệ thống có Drive Files + ID).
2. Bấm **🤖 Tạo nội dung tự động** → xác nhận trong hộp thoại.
3. Tiến trình chạy **nền** — theo dõi ở **Vận hành → Tiến trình AI** 🔒.
4. Khi xong, tải lại bản ghi → **đọc lại và sửa** mọi trường.
5. **Publish**.

> ⚠️ **Luôn đọc lại** nội dung AI trước khi xuất bản — AI có thể suy đoán sai
> thông số kỹ thuật và công bố công dụng. "🖼️ Tạo lại ảnh" sẽ **thay** ảnh hiện tại.

### 5.4. Khi chưa có ảnh / thông số

- Chưa có ảnh: website tự hiển thị ảnh placeholder kèm nhãn "Ảnh đang cập nhật".
- Tab "Kỹ thuật"/"Ứng dụng" nếu trống sẽ hiện lời mời liên hệ. Muốn hiện bảng thông số thì điền phần **Specs**.

---

## 6. Bài viết (Posts)

**Nội dung → Bài viết**.

| Trường | Ghi chú |
|---|---|
| **Title** | Tiêu đề (song ngữ, bắt buộc) |
| **Excerpt** | Tóm tắt ngắn (song ngữ) |
| **Content** | Nội dung chính, trình soạn thảo rich text (song ngữ) |
| **Cover** (sidebar) | Ảnh bìa |
| **Author** | Chọn người dùng làm tác giả |
| **Categories / Tags** | Phân loại và thẻ |
| **Published At** | Ngày đăng — quyết định thứ tự hiển thị |

**Các bước đăng một bài viết:**

1. **Nội dung → Bài viết** → **Create New**.
2. (Tiếng Việt) nhập Title, Excerpt, Content; tải **Cover**; chọn Author, Categories, Tags.
3. Đặt **Published At** (để ngày tương lai nếu muốn hẹn lịch — vẫn phải bấm Publish).
4. **Save draft** → chuyển **English**, dịch Title/Excerpt/Content → **Save**.
5. **Publish**.

---

## 7. Danh mục & Thẻ (Categories & Tags)

Dùng để phân loại Bài viết.

1. **Nội dung → Danh mục** (hoặc **Thẻ**) → **Create New**.
2. Nhập **Title/Name** (song ngữ) → **Save**.
3. Khi viết Bài viết, chọn Danh mục/Thẻ ở các trường tương ứng.

---

## 8. Nội dung Bioscope (Công nghệ, Dịch vụ, Case study, Chứng nhận, FAQ, Danh mục NL, Đối tác)

Tất cả nằm trong nhóm **Bioscope**. Quy trình chung: **Create New → nhập bản VI →
Save → chuyển EN → Save → Publish**. Trường **order** (nếu có) ở cột phải quyết định
thứ tự hiển thị (số nhỏ lên trước).

| Mục | Trường chính |
|---|---|
| **Công nghệ** (technologies) | Name, Tagline, Description, Mechanism (cơ chế), Gallery, Order |
| **Dịch vụ** (services) | Title, Summary, CTA (nhãn nút), Receive (bạn nhận được gì — mỗi ý một dòng), Process (các bước: step + desc) |
| **Case study** (case-studies) | Brand (thương hiệu), Partner, Industry, Summary, Metrics (KPI nổi bật, vd `500K USD`), Problem, Solution |
| **Chứng nhận** (certifications) | Title, Kind (loại), Value (vd `GMP`, `23`), Suffix (vd `dự án R&D`), Image, Order |
| **Câu hỏi thường gặp** (faqs) | Question, Answer (song ngữ), Category, Order |
| **Danh mục nguyên liệu** (ingredient-categories) | Name, Scope (phạm vi áp dụng) |
| **Đối tác** (partners) | Name, Country (mã quốc gia), Logo, Website |

> Đối tác dùng chung, không song ngữ (Name/Website). Các mục còn lại **nhớ nhập cả VI và EN**.

---

## 9. Thư viện Media

**Hệ thống → Media**. Kho ảnh/tệp dùng chung.

**Tải ảnh lên:**

1. **Hệ thống → Media → Create New**.
2. Kéo–thả tệp hoặc bấm chọn tệp.
3. Điền **Alt** (văn bản thay thế — bắt buộc cho SEO/khiếm thị) và **Caption** nếu cần.
4. **Save**.

**Dùng ảnh ở nơi khác:** tại bất kỳ trường ảnh nào, chọn **Choose from existing**
để lấy ảnh từ thư viện, hoặc **Upload new** để thêm mới ngay.

- Ảnh tự động tối ưu sang WebP và tạo các cỡ (thumbnail, card, og 1200×630).
- Xóa ảnh đang được dùng sẽ **làm vỡ ảnh** ở nơi khác — kiểm tra trước khi xóa.

---

## 10. Biểu mẫu & liên hệ

### Tạo / sửa một biểu mẫu

1. **Nội dung → Biểu mẫu → Create New**.
2. Nhập **Title** (vd `Liên hệ`, `Yêu cầu mẫu thử`, `Newsletter`).
3. Ở mục **Fields**, bấm **Add** cho mỗi trường:
   - **name** = khóa dữ liệu (vd `email`, `phone`).
   - **label** = nhãn hiển thị (song ngữ).
   - **type** = text / email / textarea / number / tel / checkbox / select.
   - Bật **required** nếu bắt buộc; với `select` thêm **options** (label + value).
4. Mục **Emails**: bấm **Add**, nhập **to** (địa chỉ nhận thông báo) và **subject** (tiêu đề mail).
5. **Confirmation Message**: lời cảm ơn hiện sau khi khách gửi (song ngữ).
6. **Save**.

> 📌 Ô "Đăng ký nhận bản tin" ở chân trang website gửi về biểu mẫu có **Title đúng
> bằng `Newsletter`**. Muốn lưu được email đăng ký, hãy tạo một biểu mẫu tên
> `Newsletter` với ít nhất trường `email`.

### Xem dữ liệu khách gửi

- **Nội dung → Lượt gửi biểu mẫu** — toàn bộ dữ liệu khách gửi lên, kèm thời gian.

> Gửi mail chỉ hoạt động khi Admin đã cấu hình SMTP. Nếu không nhận được mail,
> **dữ liệu vẫn được lưu đầy đủ** trong "Lượt gửi biểu mẫu", không mất.

---

## 11. Menu & thông tin công ty (chân trang)

**Hệ thống → Navigation** 🔒 (Admin/Editor).

### Menu đầu trang (header)

1. Mở **Navigation** → phần **Menu đầu trang**.
2. Bấm **Add** để thêm mục: nhập **Label** (song ngữ) + **URL** (vd `/nguyen-lieu`).
3. Thêm **mục con**: trong một mục, mở **Children → Add** (Label + URL).
4. Kéo (⣿) để đổi thứ tự.
5. **Save**.

### Menu chân trang (footer)

- Mỗi **mục cha** = một **cột** ở footer; **mục con** = các link trong cột.
- Thao tác thêm/sửa/kéo giống trên.

### Thông tin công ty (chân trang)

Trong **Navigation → Thông tin công ty (chân trang)**:

| Trường | Song ngữ? |
|---|---|
| Tên công ty | Có |
| Địa chỉ ĐKKD | Có |
| Văn phòng | Có |
| Mã số thuế, Hotline, Email, Website | Dùng chung |

Nhập xong → **Save**.

> Nhãn menu và tên/địa chỉ công ty có bản **VI/EN riêng** — nhớ nhập cả hai. Footer
> cache **5 phút**; đợi hoặc tải lại sau ít phút để thấy thay đổi.

---

## 12. SEO & chuyển hướng (Redirects)

### Tab SEO của mỗi bản ghi

Mỗi Trang / Bài viết / Nguyên liệu có tab **SEO**:

- **Title** — để trống sẽ tự lấy tiêu đề bản ghi.
- **Description** — khoảng 155 ký tự.
- **Image** — ảnh chia sẻ mạng xã hội, khuyến nghị **1200×630**.
- **Focus Keyphrase** — từ khóa trọng tâm; hệ thống chấm điểm và gợi ý cải thiện.
- **No Index** — bật nếu **không** muốn Google lập chỉ mục trang này.

### Tạo chuyển hướng khi đổi/gỡ đường dẫn

1. **SEO & Marketing → Redirects → Create New**.
2. Nhập **From** (đường dẫn cũ) và **To** (đường dẫn mới).
3. **Save**.

> Khi đổi **slug** trang đã chạy hoặc gỡ trang, **luôn tạo redirect** để không mất
> thứ hạng và không lỗi 404.

---

## 13. Người dùng & phân quyền 🔒

**Hệ thống → Người dùng**.

| Vai trò | Quyền |
|---|---|
| **Admin** | Toàn quyền, kể cả cấu hình hệ thống và quản lý người dùng |
| **Editor** | Tạo/sửa/xuất bản nội dung; không đụng cấu hình hệ thống |
| **Viewer** | Chỉ xem |

**Tạo người dùng mới:**

1. **Hệ thống → Người dùng → Create New**.
2. Nhập **Name**, **Email**, **Password**, chọn **Role**.
3. **Save**. Gửi thông tin đăng nhập cho người đó.

> Chỉ **Admin** mới đổi được vai trò của người khác. Tài khoản bị khóa sau 5 lần
> đăng nhập sai — Admin có thể mở lại.

---

## 14. Sự cố thường gặp

| Hiện tượng | Cách xử lý |
|---|---|
| Đổi ảnh header nhưng website chưa đổi | Kiểm tra đã sửa **Media trong khối Hero** (không phải ô "Hero" cột phải), đã **Publish** chưa, rồi đợi ~1 phút và tải lại |
| Sửa menu/footer chưa thấy đổi | Footer cache 5 phút — đợi rồi tải lại |
| Nội dung bản EN trống | Chuyển "Ngôn ngữ nội dung" sang English và nhập lại, rồi Save |
| Chip công dụng hiện cả hai thứ tiếng trong một dòng | Dữ liệu cũ do AI sinh — mở nguyên liệu, sửa lại từng ngôn ngữ cho sạch |
| Upload ảnh xong, refresh lại mất | Báo Admin — thường do máy chủ chưa cập nhật cấu trúc dữ liệu |
| Live Preview trắng / sai trang | Báo Admin kiểm tra biến `PREVIEW_ORIGIN` |
| Form gửi nhưng không nhận mail | Kiểm tra mục **Emails** trong Biểu mẫu; nếu đúng, báo Admin kiểm tra SMTP |
| Đăng ký newsletter báo lỗi | Kiểm tra đã tạo biểu mẫu tên `Newsletter` có trường `email` chưa |
| Bị khóa đăng nhập | Sai 5 lần → khóa 15 phút; đợi hoặc nhờ Admin mở |
| Không vào được admin, báo lỗi lạ | Báo Admin kèm **ảnh chụp màn hình** và **giờ xảy ra** để tra log |

---

## 15. Nguyên tắc nên nhớ

1. **Luôn nhập đủ cả hai ngôn ngữ** trước khi xuất bản.
2. **Không đổi slug** của trang đã chạy, trừ khi tạo kèm redirect.
3. **Điền Alt text** cho mọi ảnh.
4. **Đọc lại nội dung AI** trước khi xuất bản — nhất là thông số kỹ thuật và công bố công dụng.
5. Sửa hỏng thì dùng **Versions** để khôi phục, đừng gõ lại từ đầu.
6. Nội dung mới lên website chậm **1–5 phút** do cache. Chưa thấy ngay là bình thường.
