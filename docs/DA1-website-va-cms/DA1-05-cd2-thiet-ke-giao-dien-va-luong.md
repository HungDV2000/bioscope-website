<!--HOSO
phu_de: Website Bioscope và Hệ quản trị nội dung
pham_vi: Dự án DA1
ngay_lap: 09/06/2026
phien_ban: 1.2
nguoi_lap: Dưỡng — Team phát triển, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 09/06/2026 | Ban hành lần đầu
lich_su: 1.1 | 17/08/2026 | Bổ sung luồng đăng ký và cửa sổ đăng nhập tại chỗ
lich_su: 1.2 | 31/08/2026 | Cập nhật bố cục trang bản tin và trang bài viết
-->
# DA1 — CÔNG ĐOẠN 2: THIẾT KẾ GIAO DIỆN VÀ LUỒNG NGƯỜI DÙNG
## Website Bioscope và Hệ quản trị nội dung

---

## 1. Nguyên tắc thiết kế giao diện

| # | Nguyên tắc | Áp dụng cụ thể |
| :---- | :---- | :---- |
| 1 | Nội dung quan trọng nhất phải thấy ngay, không phải cuộn | Trang nguyên liệu: danh sách đập ngay vào mắt, banner thu gọn |
| 2 | Người dùng không bị mất chỗ đang đứng | Cửa sổ đăng nhập mở tại chỗ, không chuyển trang |
| 3 | Mỗi trạng thái đều có hình hài riêng | Đang tải, rỗng, lỗi, thành công — không để màn hình trắng |
| 4 | Thao tác được bằng bàn phím | Viền tiêu điểm rõ ràng ở mọi phần tử tương tác |
| 5 | Màn hình nhỏ không phải bản rút gọn tuỳ tiện | Sắp xếp lại bố cục, không cắt bớt chức năng |
| 6 | Nhận diện thương hiệu thống nhất | Màu, chữ, bo góc, đổ bóng khai một chỗ |

---

## 2. Hệ thống nhận diện

Toàn bộ giá trị thiết kế khai tập trung ở một nơi, không rải rác trong từng thành phần:

```css
@theme {
  --color-primary: #008e4d;         /* Xanh Bioscope */
  --color-primary-dark: #036f3d;
  --color-primary-tint: #eef6f1;
  --color-primary-border: #cfe3d8;
  --color-accent: #f58e33;          /* Cam điểm nhấn */
  --color-accent-soft: #fff4e8;
  --color-ink: #101814;             /* Chữ */
  --color-mist: #f4f8f6;            /* Nền phụ */

  --font-sans: var(--font-cms, 'Be Vietnam Pro'), ui-sans-serif, system-ui, sans-serif;

  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-2xl: 28px;

  --shadow-card: 0 18px 48px -24px rgba(16, 24, 20, 0.22);
  --shadow-soft: 0 8px 30px -18px rgba(16, 24, 20, 0.18);
}
```

Màu chủ đạo lấy từ logo công ty. Phông chữ chọn bộ có dấu tiếng Việt đầy đủ.

**Vì sao khai tập trung:** đổi màu thương hiệu chỉ sửa một dòng, toàn bộ 68 thành phần đổi theo. Nếu mỗi thành phần tự viết mã màu thì đổi màu là công việc nhiều ngày và chắc chắn sót chỗ.

### Viền tiêu điểm cho bàn phím

```css
:where(a, button, input, textarea, select, summary, [tabindex]):focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 4px;
}
```

Dùng `:where()` để độ ưu tiên bằng không — thành phần nào cần kiểu riêng vẫn ghi đè được mà không phải chống lại quy tắc chung. Dùng `:focus-visible` thay vì `:focus` để người bấm chuột không thấy viền, chỉ người dùng bàn phím mới thấy.

---

## 3. Bản đồ trang — cổng thông tin công khai

27 đường dẫn, mỗi đường có bản tiếng Việt và tiếng Anh.

### 3.1 Nhóm giới thiệu

| Đường dẫn | Nội dung | Nguồn dữ liệu |
| :---- | :---- | :---- |
| `/` | Trang chủ | Bảng cấu hình `home` |
| `/ve-chung-toi` | Giới thiệu công ty | `pages` |
| `/dong-kien-tao` | Mô hình hợp tác | `pages` |
| `/rd` | Nghiên cứu phát triển | `pages` |
| `/lien-he` | Liên hệ | `pages` + biểu mẫu |

### 3.2 Nhóm nghiệp vụ

| Đường dẫn | Nội dung | Nguồn dữ liệu |
| :---- | :---- | :---- |
| `/nguyen-lieu` | Danh sách nguyên liệu, có lọc | `ingredients` |
| `/nguyen-lieu/[slug]` | Chi tiết nguyên liệu | `ingredients` |
| `/giai-phap` | Danh sách dịch vụ | `services` |
| `/giai-phap/[slug]` | Chi tiết dịch vụ | `services` |
| `/case-study` | Danh sách tình huống khách hàng | `case-studies` |
| `/case-study/[slug]` | Chi tiết tình huống | `case-studies` |
| `/cau-hoi-thuong-gap` | Câu hỏi thường gặp | `faqs` |
| `/bioscope-ai` | Giới thiệu trợ lý AI | Bảng cấu hình `bioscope-ai` |

### 3.3 Nhóm nội dung

| Đường dẫn (vi) | Đường dẫn (en) | Nội dung |
| :---- | :---- | :---- |
| `/ban-tin` | `/news` | Danh sách bài viết |
| `/ban-tin/[slug]` | `/news/[slug]` | Chi tiết bài viết |
| `/tai-nguyen` | `/tai-nguyen` | Trang tài nguyên |
| `/tai-nguyen/[slug]` | | Chi tiết tài nguyên |
| `/[slug]` | | Trang tĩnh dựng bằng khối |

### 3.4 Nhóm khách hàng

| Đường dẫn | Nội dung | Yêu cầu đăng nhập |
| :---- | :---- | :----: |
| `/member/login` | Đăng nhập | Không |
| `/member/dang-ky` | Đăng ký | Không |
| `/member` | Trang chính của khách | ✅ |
| `/member/documents` | Tài liệu có kiểm soát | ✅ |
| `/member/tai-khoan` | Thông tin tài khoản | ✅ |

### 3.5 Nhóm pháp lý

| Đường dẫn | Nội dung |
| :---- | :---- |
| `/chinh-sach-bao-mat` | Chính sách bảo mật |
| `/dieu-khoan-su-dung` | Điều khoản sử dụng |

---

## 4. Luồng người dùng chính

### 4.1 Khách tìm nguyên liệu

```
Trang chủ
   │
   ├─→ Bấm "Nguyên liệu" trên thanh điều hướng
   ↓
Trang danh sách nguyên liệu
   │  ← DANH SÁCH HIỆN NGAY, không phải cuộn qua banner
   │
   ├─→ Gõ từ khoá tìm kiếm ──┐
   ├─→ Chọn bộ lọc ──────────┤
   │                          ↓
   │                    Danh sách lọc lại tại chỗ
   ↓
Bấm vào một nguyên liệu
   ↓
Trang chi tiết nguyên liệu
   │  Tên, phụ đề, ảnh, mô tả, lợi ích, ứng dụng,
   │  chỉ tiêu kỹ thuật, trạng thái pháp lý
   │  ── KHÔNG hiện bảng giá (khoá ở tầng trường)
   │
   ├─→ Bấm "Tải tài liệu kỹ thuật"
   │      ├─ chưa đăng nhập → mở cửa sổ đăng nhập TẠI CHỖ
   │      └─ đã đăng nhập  → tải tệp, ghi nhận lượt tải
   │
   └─→ Bấm nút chat → mở khung chat, nối với nhân viên kinh doanh
```

**Điểm thiết kế quan trọng ở trang danh sách.** Yêu cầu YC-17 đòi danh sách phải hiện ngay. Ban đầu trang có banner lớn kèm đoạn mô tả dài, đẩy danh sách xuống dưới màn hình đầu tiên — khách vào phải cuộn mới thấy thứ mình cần. Đã sửa: thu gọn banner, bỏ hẳn đoạn mô tả, đưa danh sách lên trên.

### 4.2 Khách đăng ký tài khoản

```
Bấm "Đăng nhập" trên thanh đầu trang
   ↓
Cửa sổ mở ĐÈ LÊN trang đang xem (không chuyển trang)
   │
   ├─→ Bấm "Đăng nhập bằng Google"
   │      ├─ đã có tài khoản → vào thẳng
   │      └─ chưa có        → TỰ TẠO tài khoản rồi vào
   │
   └─→ Chuyển sang thẻ "Đăng ký"
          ↓
       Chọn loại khách: Doanh nghiệp / Cá nhân
          │
          ├─ Doanh nghiệp → hiện thêm ô: tên công ty, mã số thuế, chức vụ
          └─ Cá nhân      → ẩn các ô đó đi
          ↓
       Điền thông tin, đặt mật khẩu
          │  ← thanh đánh giá độ mạnh cập nhật khi gõ
          │  ← nút con mắt để xem mật khẩu đã gõ
          │  ← ô nhập lại, báo khớp/không khớp ngay
          ↓
       Bấm "Đăng ký"
          │  ← kiểm ở trình duyệt: đủ 8 ký tự, hai ô khớp nhau
          │  ← kiểm lại ở máy chủ (chốt chặn thật)
          ↓
       Vào tài khoản, cửa sổ đóng, VẪN Ở ĐÚNG TRANG CŨ
```

**Vì sao mở cửa sổ tại chỗ thay vì chuyển sang trang đăng nhập.** Khách đang đọc một nguyên liệu, muốn tải tài liệu. Nếu chuyển sang trang đăng nhập rồi quay lại, khách mất mạch đọc và nhiều người bỏ luôn. Cửa sổ tại chỗ giữ nguyên ngữ cảnh.

**Vì sao ô mật khẩu có ba chi tiết đó.** Thanh độ mạnh giúp khách hiểu vì sao mật khẩu bị từ chối. Nút con mắt giúp khách tự kiểm khi gõ sai — đây là chi tiết quan trọng trên điện thoại. Ô nhập lại chặn lỗi gõ nhầm mà đến lúc đăng nhập lần sau mới phát hiện.

### 4.3 Biên tập viên xuất bản nội dung

```
Đăng nhập admin.bioscope.vn
   ↓
Danh sách nhóm dữ liệu ở cột trái
   │  Bài viết
   │    ├─ Chủ đề       ← lồng vào dưới Bài viết
   │    ├─ Ngành
   │    ├─ Thẻ
   │    └─ Bình luận
   ↓
Mở một nguyên liệu / bài viết
   ↓
Biểu mẫu chia THẺ — không dồn 73 trường vào một trang dài
   │  Tổng quan · Nội dung · Hình ảnh · Kỹ thuật ·
   │  Pháp lý · Tài liệu · Nghiên cứu · Đồng bộ
   ↓
Sửa nội dung
   ├─→ Bấm "Lưu nháp"  → lưu, KHÔNG hiện ra ngoài
   ├─→ Bấm "Xem trước" → mở cổng xem trước, thấy đúng như khi xuất bản
   └─→ Bấm "Xuất bản"  → hiện ra ngoài + xoá đệm trang liên quan
```

**Vì sao chia thẻ.** Bảng nguyên liệu có 73 trường. Dồn vào một trang thì biểu mẫu dài hàng chục màn hình, biên tập viên cuộn mỏi tay và không tìm được trường cần sửa. Chia tám thẻ theo nhóm nghĩa thì mỗi thẻ vừa một màn hình.

**Vì sao lồng phân loại vào dưới Bài viết.** Trước đây Chủ đề và Thẻ nằm ngang hàng với Bài viết ở cột trái, không thấy được quan hệ giữa chúng. Đưa vào lồng bên dưới thì nhìn là hiểu ngay — cách sắp xếp này quen thuộc với người đã dùng các hệ quản trị nội dung phổ biến.

---

## 5. Quy tắc hiển thị theo trạng thái

| Trạng thái | Xử lý | Ví dụ |
| :---- | :---- | :---- |
| Đang tải | Khung xám mô phỏng bố cục sắp hiện | Danh sách nguyên liệu |
| Rỗng | Câu giải thích + gợi ý hành động, không để trống trơn | "Chưa có bài viết nào" |
| Lỗi | Câu thông báo hiểu được + cách khắc phục | "Không tải được, thử lại" |
| Đang gửi | Nút mờ đi và không bấm được nữa | Nút Đăng ký khi đang gửi |
| Thành công | Xác nhận rõ ràng, nói rõ chuyện gì xảy ra tiếp | Bình luận: "đang chờ duyệt" hoặc "đã đăng" |
| Thiếu bản dịch | **Ẩn hẳn khỏi danh sách**, không hiện trang trắng | Bài chỉ có tiếng Việt không hiện ở `/news` |

Dòng cuối là kết quả của một lỗi thật: bài viết chỉ có một ngôn ngữ vẫn lọt vào danh sách ngôn ngữ kia, mở ra thì trang trắng. Cách xử lý ở `DA1-03` mục 4.

---

## 6. Thiết kế cho màn hình nhỏ

### 6.1 Ba mốc kích thước

| Mốc | Bề rộng | Bố cục |
| :---- | :---- | :---- |
| Điện thoại | < 768px | Một cột; thanh điều hướng thu vào nút ba gạch |
| Máy tính bảng | 768–1279px | Hai cột; điều hướng vẫn thu gọn |
| Máy tính | ≥ 1280px | Bố cục đầy đủ; điều hướng trải ngang |

### 6.2 Sự cố đã gặp: thanh đầu trang tràn màn hình

**Dấu hiệu:** thêm nhãn chữ cho nút đăng nhập thì thanh đầu trang tràn ra ngoài 222px ở bề rộng 1024px.

**Nguyên nhân thật** — và đây là chỗ dễ chẩn đoán sai: khung chứa nội dung giới hạn ở 1280px, nhưng từ 1024px trở lên lại **tăng đệm hai bên**. Hệ quả nghịch lý: màn hình 1536px có **ít chỗ** cho nội dung hơn màn hình 1280px. Vì vậy lần sửa đầu tiên chỉ nới ở mốc rất rộng vẫn tràn 81px.

**Cách xử lý:** đặt bề rộng tối đa riêng cho thanh đầu trang là 1440px, đồng thời dời thanh điều hướng ngang lên mốc rộng hơn.

**Bài học:** lỗi tràn không phải lúc nào cũng do phần tử vừa thêm. Phải đo thật ở nhiều bề rộng chứ không suy đoán từ một cỡ màn hình.

### 6.3 Một quyết định đã đảo ngược

Từng thử xếp hai ô chọn cạnh nhau trên một hàng ở màn hình điện thoại để tiết kiệm chiều cao. Kết quả: mỗi ô còn 111px, nhãn bị cắt cụt và mũi tên chọn biến mất. **Đã hoàn tác.**

Ghi lại vì đây là bài học có giá trị: tiết kiệm chiều dọc không đáng để đánh đổi bằng việc người dùng không đọc được nhãn. Trên điện thoại, cuộn là thao tác rẻ; đoán mò nội dung ô chọn là thao tác đắt.

---

## 7. Thanh cuộn trong vùng cuộn nội bộ

Chi tiết nhỏ nhưng đáng ghi vì nó minh hoạ một cạm bẫy chung.

```css
.scroll-slim {
  scrollbar-width: thin;
  scrollbar-color: var(--color-primary-border) transparent;
}
.scroll-slim::-webkit-scrollbar { width: 10px; height: 10px; }
.scroll-slim::-webkit-scrollbar-thumb {
  background-color: var(--color-primary-border);
  border-radius: 9999px;
  border: 3px solid transparent;
  background-clip: content-box;
}
```

Chú thích nguyên văn trong mã:

> Thanh cuộn mặc định của Windows/Linux dày và xám, cắt ngang bo góc của popup nhìn rất thô; macOS thì ẩn nên không thấy vấn đề — **dễ bỏ sót nếu chỉ ngó trên máy Mac**.

Và một mẹo kỹ thuật cũng ghi trong mã: viền trong suốt kết hợp `background-clip: content-box` làm con trượt **trông** mảnh nhưng vùng bấm vẫn đủ rộng để kéo bằng chuột.

**Cạm bẫy chung:** đội phát triển dùng máy Mac, nơi thanh cuộn tự ẩn. Lỗi chỉ xuất hiện trên hệ điều hành khác. Bài học: kiểm giao diện trên hệ điều hành mà **người dùng thật** dùng, không chỉ trên máy mình.

---

## 8. Hiển thị nội dung do biên tập viên soạn

Nội dung soạn trong trình soạn thảo phải hiện **đúng như lúc soạn**. Nghe hiển nhiên nhưng thực tế hay sai.

### 8.1 Bài viết

Bộ quy tắc `.blog-rich` định kiểu cho toàn bộ thành phần trình soạn thảo sinh ra: tiêu đề các cấp, đoạn văn, chữ đậm nghiêng, danh sách, liên kết, ảnh, chú thích ảnh, bảng, trích dẫn.

Đầu đề bài viết được gắn mã neo tự động để mục lục bên cạnh nhảy tới đúng chỗ, kèm khoảng đệm phía trên (`scroll-mt-28`) để tiêu đề không bị thanh đầu trang che mất.

### 8.2 Câu chào khung chat

Trường hợp tinh tế hơn. Trích chú thích trong mã:

> Trình soạn thảo mặc định căn trái, nên mặc định ở đây cũng căn trái — nếu để thừa hưởng `text-center` của khung bao thì admin soạn một đằng, khách thấy một nẻo.

Và một chi tiết nữa:

> Đoạn trống admin cố ý chèn để ngăn khổ — Lexical xuất ra `<p><br></p>`. Phải có chiều cao thật, nếu không hai khổ dính liền nhau.

Hai chú thích này ghi lại đúng loại lỗi khó tìm: nội dung đúng, dữ liệu đúng, chỉ có cách hiển thị lệch đi so với ý người soạn.

---

## 9. Khả năng tiếp cận

| Yêu cầu | Cách đáp ứng |
| :---- | :---- |
| Thao tác bằng bàn phím | Mọi phần tử tương tác có viền tiêu điểm rõ |
| Không bẫy tiêu điểm | Nút con mắt trong ô mật khẩu đặt `tabIndex={-1}` để phím Tab đi thẳng sang ô kế tiếp |
| Thông báo cho trình đọc màn hình | Vùng thay đổi động đánh dấu `aria-live="polite"` |
| Nhãn cho nút chỉ có biểu tượng | Nút con mắt có `aria-label` đổi theo trạng thái hiện/ẩn |
| Tôn trọng thiết lập giảm chuyển động | Hiệu ứng tắt khi hệ điều hành báo người dùng muốn giảm chuyển động |
| Độ tương phản | Màu chữ trên nền đạt mức đọc được |

Ví dụ thật về `tabIndex`:

```ts
// tabIndex -1: bấm Tab từ ô mật khẩu phải sang ô kế tiếp, không mắc kẹt ở nút này.
tabIndex={-1}
```

---

## 10. Tổ chức thành phần giao diện

68 thành phần, nhóm theo miền:

| Thư mục | Nội dung |
| :---- | :---- |
| `components/home/` | Các khối trang chủ |
| `components/resources/` | Trang bản tin, bài viết, bình luận |
| `components/member/` | Đăng nhập, đăng ký, ô mật khẩu, chọn loại khách |
| `components/chat/` | Khung chat, đính kèm, bảng đăng nhập trong chat |
| `components/ui/` | Thành phần dùng chung: nút, thẻ, nội dung có định dạng |

**Nguyên tắc gom:** thành phần dùng ở nhiều nơi thì đưa lên `ui/`; thành phần chỉ dùng trong một miền thì để trong thư mục miền đó. Tránh cả hai thái cực: gom hết vào `ui/` làm thư mục đó thành bãi rác, hoặc chép cùng một thành phần sang nhiều miền.
