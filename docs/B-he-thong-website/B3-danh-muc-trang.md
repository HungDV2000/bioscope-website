# B3 — DANH MỤC TRANG VÀ CHỨC NĂNG

> Nguồn: `dv-cms/apps/bioscope-frontend/src/app/`
> **25 route**, sinh ra **76 trang tĩnh** khi build (do nhân đôi cho vi/en và
> các trang chi tiết).

---

## 1. Trang công khai

| Đường dẫn | Trang | Nguồn nội dung |
|---|---|---|
| `/` | Trang chủ | Pages + khối, chọn trang chủ trong Site Settings |
| `/nguyen-lieu` | **Danh mục nguyên liệu** | `ingredients`, lọc và phân trang phía máy chủ |
| `/nguyen-lieu/[slug]` | Chi tiết nguyên liệu | `ingredients` |
| `/giai-phap` | Giải pháp | `services` |
| `/giai-phap/[slug]` | Chi tiết giải pháp | `services` |
| `/dong-kien-tao` | Đồng kiến tạo | Pages + khối |
| `/rd` | Nghiên cứu & Phát triển | Pages + khối |
| `/tai-nguyen` | Tài nguyên | `posts` |
| `/tai-nguyen/[slug]` | Chi tiết tài nguyên | `posts` |
| `/tai-nguyen/blog-chuyen-mon` | Blog chuyên môn | `posts` |
| `/tai-nguyen/blog-chuyen-mon/[slug]` | Chi tiết bài viết | `posts` |
| `/case-study` | Dự án tiêu biểu | `case-studies` |
| `/case-study/[slug]` | Chi tiết dự án | `case-studies` |
| `/ve-chung-toi` | Về chúng tôi | Pages + khối |
| `/cau-hoi-thuong-gap` | Câu hỏi thường gặp | `faqs` |
| `/lien-he` | Liên hệ | Pages + biểu mẫu |
| `/bioscope-ai` | Bioscope AI | Pages + khối |
| `/chinh-sach-bao-mat` | Chính sách bảo mật | Pages |
| `/dieu-khoan-su-dung` | Điều khoản sử dụng | Pages |
| `/[slug]` | Trang động bất kỳ | Pages — biên tập viên tự tạo |

### Trang nguyên liệu — điểm cần biết

Đây là trang quan trọng nhất và cũng nặng nhất:

- **1.557 nguyên liệu**, phân trang phía máy chủ 12 mục mỗi trang. Không nhồi
  toàn bộ vào HTML.
- Bộ lọc theo danh mục chính, xuất xứ, nhóm công dụng, kèm tìm kiếm và bộ lọc
  nâng cao.
- Số đếm và tuỳ chọn bộ lọc lấy từ một truy vấn tóm tắt riêng, đệm dài.
- Banner rút gọn và bỏ khối giới thiệu, để danh sách nằm ngay màn hình đầu.

---

## 2. Khu thành viên

| Đường dẫn | Trang | Yêu cầu |
|---|---|---|
| `/member/login` | Đăng nhập | |
| `/member/dang-ky` | Đăng ký | |
| `/member/(portal)` | Cổng thành viên | Đã đăng nhập |
| `/member/(portal)/tai-khoan` | Hồ sơ, đổi mật khẩu | Đã đăng nhập |
| `/member/(portal)/documents` | Tài liệu B2B | Đã đăng nhập **và** được duyệt |

### Đăng nhập

Hai đường: email + mật khẩu, hoặc Google.

- Phiên ký bằng HMAC-SHA256, chống giả mạo cookie.
- Không có khoá bí mật thì hệ thống **từ chối cấp phiên**, không rơi về chế độ
  không ký.
- Đăng nhập Google mà chưa có tài khoản thì **tự tạo**, mặc định loại khách
  **cá nhân** — Google không cho biết khách là doanh nghiệp hay cá nhân, gán
  nhầm thành doanh nghiệp khiến kinh doanh chào sai ngữ cảnh. Khách tự đổi lại
  trong trang tài khoản.
- Tài khoản mới ở trạng thái **chờ duyệt**: dùng được chat và sửa hồ sơ ngay,
  nhưng khu tài liệu B2B phải chờ quản trị viên duyệt.

### Đăng ký

Phân biệt **khách doanh nghiệp** và **khách cá nhân**, hiện trường tương ứng.

Ô mật khẩu có nút hiện/ẩn, thanh đánh giá độ mạnh, và ô nhập lại. Thang điểm
trừ nặng các chuỗi nằm trong từ điển dò mật khẩu — `Password123!` đủ mọi loại
ký tự nhưng chỉ được chấm "Trung bình".

---

## 3. Thành phần dùng chung

| Thành phần | Vai trò |
|---|---|
| Header | Điều hướng, đổi ngôn ngữ, nút tài khoản, nút yêu cầu mẫu thử |
| Popup đăng nhập/đăng ký | Mở ngay tại trang đang xem, không chuyển trang |
| Widget chat | Bóng chào, khung chat, bắt buộc đăng nhập |
| Footer | Liên hệ, mạng xã hội, đăng ký bản tin |
| Banner đồng ý cookie | Từ `module-consent` |

### Ngưỡng hiển thị

| Bề rộng | Điều hướng |
|---|---|
| < 1280px | Menu thu gọn |
| ≥ 1280px | Thanh điều hướng ngang đầy đủ |

Thanh header dùng bề rộng tối đa 1440px, rộng hơn phần thân trang (1280px) —
sáu mục điều hướng tiếng Việt cần chỗ.

---

## 4. Đa ngữ

| | |
|---|---|
| Ngôn ngữ | `vi` (mặc định) · `en` |
| Cách chọn | Nút quả địa cầu trên header, lưu vào cookie |
| Cách dựng trang | Đọc cookie phía máy chủ nên trang là **động**, không đệm tĩnh |

---

## 5. Chống hỏng khi CMS ngừng

Mọi trang đọc nội dung qua `cmsFetch` có đặt thời gian chờ. CMS không phản hồi
thì trang rơi về **nội dung tĩnh dự phòng** trong `lib/content.ts` và
`lib/content-en.ts`, thay vì treo hoặc trả lỗi.

Đây là lý do hai file nội dung tĩnh vẫn được giữ dù nội dung đã chuyển sang CMS.

---

## 6. Hiệu năng

| Chỉ số | Giá trị |
|---|---|
| Số trang sinh khi build | 76 |
| Thời gian sinh trang tĩnh | ~6–8 giây |
| Thời gian chờ tối đa mỗi trang | 300 giây |

Ngưỡng 300 giây được nâng từ mặc định 60 giây sau khi build trên máy chủ thất
bại vì tranh chấp CPU khi dựng song song CMS và frontend. Khuyến nghị build
**tuần tự** — xem [B5](B5-van-hanh.md).
