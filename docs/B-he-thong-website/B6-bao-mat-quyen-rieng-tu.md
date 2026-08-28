# B6 — BẢO MẬT VÀ QUYỀN RIÊNG TƯ

> Bổ sung cho `dv-cms/docs/07-security.md` (module chặn tấn công).
> Tài liệu này tập trung vào **dữ liệu cá nhân** và **kiểm soát truy cập** —
> phần chưa có tài liệu riêng.

---

## 1. Bốn lớp xác thực

| Đối tượng | Cách xác thực | Nơi lưu |
|---|---|---|
| Nhân viên | Tài khoản Payload + phân quyền theo vai trò | `users`, `staff-roles` |
| Thành viên B2B | Email + mật khẩu, hoặc Google | `members` |
| Hệ thống ngoài | Khoá API `bsk_...` | `api-keys` |
| Khách chat | Mã phiên gắn với thành viên | `chat-conversations` |

### Phiên thành viên

- Cookie ký bằng **HMAC-SHA256**.
- Không có khoá bí mật thì hệ thống **từ chối cấp phiên**, không rơi về chế độ
  không ký. Đây là lựa chọn có chủ đích: thà không đăng nhập được còn hơn cấp
  phiên giả mạo được.

### Khoá API

| Cơ chế | Chi tiết |
|---|---|
| Truyền | Header `x-api-key`. **Không** nhận qua query string — query string bị ghi vào log máy chủ và lịch sử trình duyệt |
| Lưu | Chỉ lưu **băm SHA-256**. Cơ sở dữ liệu không có khoá gốc |
| Hiển thị | Khoá gốc hiện **đúng một lần** lúc phát |
| Phân quyền | 5 quyền độc lập, **chặn mặc định** — không tick gì thì không gọi được gì |
| Hạn dùng | Tuỳ chọn, kiểm trước cả giới hạn tần suất |
| Giới hạn tần suất | Theo **từng khoá**, không theo IP — bên gọi là máy chủ nên mọi lượt gọi chung một IP |
| Thu hồi | Bỏ tick "Đang hiệu lực", có hiệu lực ngay |

Thông báo lỗi cho "khoá sai" và "khoá bị tắt" **giống hệt nhau** — không hé lộ
khoá nào đang tồn tại trong hệ thống.

---

## 2. Ba lớp chặn rò rỉ dữ liệu

Áp dụng cho mọi endpoint công khai:

| Lớp | Cơ chế | Chặn |
|---|---|---|
| 1 | `overrideAccess: false` | Bản nháp, trường gắn quyền chỉ-nhân-viên |
| 2 | Danh sách trường `select` | Dữ liệu không rời khỏi cơ sở dữ liệu |
| 3 | Hàm nặn dữ liệu liệt kê tay | Thêm trường nhạy cảm sau này cũng không tự lọt ra |

Ba lớp **độc lập**: sai một lớp vẫn còn hai lớp chặn.

### Danh sách trắng ở tầng máy chủ

API nội dung dùng **danh sách trắng**, không phải danh sách đen. Nhóm dữ liệu
không khai báo thì trả `404`.

Kèm chốt chặn thứ hai: khai nhầm dữ liệu cá nhân vào danh sách thì **máy chủ
không khởi động được**, thay vì âm thầm đẩy dữ liệu lên mạng.

### Bảng giá

Mặc định **tắt** cho mọi khoá. Chỉ bật riêng từng khoá khi có chủ đích. Lấy giá
đi theo một nhánh truy vấn hẹp riêng, dễ soát và dễ tắt.

---

## 3. ⚠️ Dữ liệu cá nhân đang thu thập

Hệ thống thu thập ở mức **chi tiết**. Cần biết rõ để làm đúng nghĩa vụ pháp lý.

### Thành viên B2B — `members`

Email, họ tên, điện thoại, tên công ty, mã số thuế, chức vụ, loại khách, mã
Google, mật khẩu đã băm.

### Phiên chat — `chat-conversations`

| Nhóm | Trường |
|---|---|
| Định danh | Tên, email, liên kết tài khoản thành viên, công ty |
| Mạng | **Địa chỉ IP**, nhà mạng |
| Vị trí | **Quốc gia, tỉnh/thành, thành phố, mã bưu chính, múi giờ, vĩ độ, kinh độ** |
| Thiết bị | Trình duyệt và phiên bản, hệ điều hành, loại thiết bị, độ phân giải, ngôn ngữ, chuỗi User-Agent gốc |
| Hành vi | Trang bắt đầu chat, trang giới thiệu, trang vào đầu tiên, số trang đã xem |

### Nội dung — `chat-messages`, `form-submissions`

Toàn bộ nội dung khách gõ.

---

## 4. Nghĩa vụ pháp lý — việc của doanh nghiệp

> Đây là **nghĩa vụ pháp lý của Bioscope**, không phải hạng mục kỹ thuật.
> Nêu ở đây để không bị bỏ sót.

Mức thu thập ở mục 3 — đặc biệt là **toạ độ địa lý và cấu hình thiết bị** —
vượt xa mức "ghi nhận cơ bản". Cần:

- [ ] **Chính sách quyền riêng tư nêu đúng và đủ** những gì đang thu thập.
      Trang `/chinh-sach-bao-mat` đã có, nhưng phải **rà lại xem có liệt kê đủ
      danh sách ở mục 3 không**.
- [ ] Cơ chế **đồng ý** trước khi thu thập. Module đồng ý cookie đã có, cần
      kiểm tra phạm vi đã phủ hết chưa.
- [ ] **Thời hạn lưu trữ** — hiện chưa có quy định xoá dữ liệu chat cũ.
- [ ] Quy trình đáp ứng khi khách **yêu cầu xem hoặc xoá** dữ liệu của họ.
- [ ] Rà soát theo **Nghị định 13/2023/NĐ-CP** về bảo vệ dữ liệu cá nhân.

**Em không phải chuyên gia pháp lý.** Danh sách trên là để bộ phận pháp chế
hoặc luật sư của công ty rà, không thay thế tư vấn pháp lý.

---

## 5. Lỗ hổng đã phát hiện và đã vá

Ghi lại làm bằng chứng kiểm soát chất lượng, và để không tái diễn.

| Lỗ hổng | Nguy cơ | Đã xử lý |
|---|---|---|
| Xác thực thành viên là **giả lập** — tài khoản cứng trong mã, cookie base64 không ký | Ai cũng giả mạo được phiên | Nối API thật, ký HMAC-SHA256 |
| Hàm gọi API nội bộ để trong file server action | Client gọi được với đường dẫn tuỳ ý — lỗ hổng SSRF | Chuyển sang module chỉ chạy phía máy chủ |
| Mã phiên chat để trong bộ nhớ trình duyệt **không xoá khi đăng xuất**, endpoint lấy tin nhắn không xác thực | Máy dùng chung: người sau đọc được hội thoại của người trước | Xoá mã khi đăng xuất, thêm kiểm tra quyền sở hữu phiên |
| Trường "Tên công ty" bắt buộc ở tầng ứng dụng nhưng cột cơ sở dữ liệu vẫn `NOT NULL` | Đăng nhập Google thất bại | Bổ sung migration |
| Địa chỉ chuyển hướng Google suy ra sai qua nhiều tầng proxy | Không đăng nhập được bằng Google | Xử lý header dạng danh sách, thêm biến ghi đè |

---

## 6. Danh sách kiểm tra bảo mật định kỳ

### Hàng tháng
- [ ] Rà `api-keys`: khoá nào không còn dùng thì thu hồi
- [ ] Xem số lượt gọi từng khoá, tìm bất thường
- [ ] Xem `security-events` và `blocked-ips`
- [ ] Kiểm `audit-logs` xem có thao tác lạ

### Mỗi khi triển khai
- [ ] `.env` không nằm trong git
- [ ] Chạy kiểm tra **âm tính**: khoá thiếu quyền phải trả `403`
- [ ] Bảng giá không lọt ra khi khoá chưa bật quyền giá

### Khi nghi lộ khoá
1. Bỏ tick "Đang hiệu lực" — chặn ngay lập tức
2. Phát khoá mới cho bên đang dùng hợp lệ
3. Rà `audit-logs` xem khoá đó đã làm gì

### Bí mật cần xoay định kỳ
`PAYLOAD_SECRET` · `REVALIDATE_SECRET` · `POSTGRES_PASSWORD` · khoá AI ·
Telegram bot token · Google OAuth client secret

⚠️ Đổi `PAYLOAD_SECRET` sẽ **vô hiệu mọi phiên đang đăng nhập**. Làm vào giờ thấp điểm.
