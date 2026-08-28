# D4 — CÔNG ĐOẠN 3: LẬP TRÌNH, VIẾT MÃ LỆNH

> Tài liệu này trình bày **lộ trình phát triển theo giai đoạn** — làm gì, giải
> quyết vấn đề gì, kết quả ra sao. Mốc thời gian đối chiếu với hệ thống quản lý
> phiên bản để không sai ngày.

---

## 1. Lưu trữ mã nguồn

| Mục | Nội dung |
|---|---|
| Nền tảng | GitHub |
| Địa chỉ kho mã | `https://github.com/HungDV2000/bioscope-website` |
| Nhánh chính | `main` |
| Số bản ghi thay đổi | **208** |
| Khoảng thời gian | 15/06/2026 – 25/08/2026 |
| Chế độ | Riêng tư |

Kho mã lưu đầy đủ lịch sử thay đổi: mỗi lần thay đổi ghi nhận thời điểm, người
thực hiện, nội dung thay đổi và toàn bộ mã bị ảnh hưởng.

### ⚠️ Hai điểm cần xử lý

| Vấn đề | Cần làm |
|---|---|
| Kho mã đặt dưới tài khoản cá nhân `HungDV2000` | Chuyển sang tài khoản tổ chức của công ty, hoặc lập văn bản xác nhận quyền sở hữu |
| Bản ghi gắn email máy cá nhân `kcode@MacBook-Pro-cua-KCODE.local` | Văn bản xác nhận danh tính kèm hợp đồng lao động. Từ nay đặt cấu hình dùng email công ty |

---

## 2. Quy mô mã nguồn tự viết

| Chỉ tiêu | Giá trị |
|---|---:|
| Tệp mã nguồn | 452 |
| Dòng mã | ~51.300 |
| Module nghiệp vụ | 12 |
| Tệp chuyển đổi cấu trúc dữ liệu | 25 |

Số liệu đã loại trừ thư viện bên thứ ba, tệp sinh tự động và sản phẩm biên dịch.

---

## 3. Lộ trình phát triển

### Giai đoạn 1 — Khảo sát và dựng nền
**15/06 – 29/06/2026**

Khảo sát yêu cầu khách hàng, lập đặc tả, dựng khung website và hệ quản trị.

| Kết quả |
|---|
| Tài liệu khảo sát yêu cầu và đặc tả hệ thống — xem [D2](D2-cong-doan-1-xac-dinh-yeu-cau.md) |
| Khung website 14 trang, song ngữ Việt–Anh, đã kiểm tra trên điện thoại, máy tính bảng, máy tính |
| Hệ quản trị Payload phân thành module: nền chung, thương hiệu, bảng điều khiển, khối dựng trang, danh mục, nghiệp vụ Bioscope, thành viên B2B, ngôn ngữ, phân quyền |
| Các nhóm dữ liệu chính: nguyên liệu, danh mục, công nghệ, dịch vụ, chứng nhận, dự án, câu hỏi thường gặp, đối tác, bài viết, trang, biểu mẫu, thành viên, tài liệu B2B |
| Trang chủ quản trị hoàn toàn bằng khối, sửa trong quản trị là web cập nhật ngay |

### Giai đoạn 2 — Đóng gói và nạp dữ liệu
**08/07 – 09/07/2026**

Chuẩn bị đưa hệ thống lên máy chủ và nạp dữ liệu nguyên liệu thật.

| Kết quả |
|---|
| Đóng gói bằng Docker Compose, có proxy ngược và chứng chỉ bảo mật |
| Quy hoạch cổng dải 26xxx tránh xung đột với dịch vụ khác trên cùng máy chủ |
| Đồng bộ dữ liệu từ CSV và Google Drive |
| Xử lý lưu tên nguyên liệu theo từng ngôn ngữ |
| Dữ liệu mẫu song ngữ cho 8 nhóm dữ liệu |

### Giai đoạn 3 — Sinh nội dung tự động, bảo mật, tối ưu tìm kiếm
**13/07 – 18/07/2026**

Giai đoạn có khối lượng lớn nhất. Giải bài toán trọng tâm: **1.557 nguyên liệu
không thể nhập nội dung thủ công**.

| Nhóm | Kết quả |
|---|---|
| Sinh nội dung | Đọc tài liệu nhà cung cấp từ Drive, sinh mô tả, tên INCI, thông số, nội dung tìm kiếm, hình ảnh. Sinh hàng loạt cho nhiều nguyên liệu |
| Bảo mật | Module tường lửa ứng dụng tự phát triển: chặn dò mật khẩu, chặn IP, quét tệp tải lên, xác thực hai lớp, bảng điều khiển bảo mật |
| Tối ưu tìm kiếm | Phân tích nội dung theo từ khoá, dữ liệu có cấu trúc, đường dẫn phân cấp, gợi ý liên kết nội bộ |
| Xử lý ảnh | Chuyển đổi định dạng nén tốt hơn |
| Đồng ý cookie | Module riêng theo hướng tuân thủ quy định bảo vệ dữ liệu |
| Biên tập | Toàn bộ trang tĩnh chuyển thành nội dung sửa được trong quản trị |
| Giao diện quản trị | Thanh bên gom nhóm, thao tác nhanh |
| Xem trước | Chuyển sang cơ chế xem trước trực tiếp của nền tảng, bấm vào khối là cuộn tới đúng vị trí |

### Giai đoạn 4 — Hồ sơ nguyên liệu, hiệu năng, công cụ vận hành
**21/07 – 29/07/2026**

Hoàn thiện chiều sâu dữ liệu và giải bài toán hiệu năng của trang danh mục.

| Nhóm | Kết quả |
|---|---|
| Hồ sơ nguyên liệu | Đường dẫn theo ngôn ngữ, hồ sơ kỹ thuật, tab tài liệu riêng, xuất nhập nội dung hàng loạt |
| Bảng giá | Nhiều bậc theo số lượng, khoá chỉ nhân viên xem được |
| Phân loại | Bốn nhóm thẻ lọc, lọc được trên web, đám mây thẻ bấm là lọc |
| Nâng cấp sinh nội dung | Đọc PDF scan bằng mô hình nhận dạng, ghi nhận chi phí từng lần chạy kèm quy đổi tiền Việt, bảng giá theo model, gom phần tĩnh của yêu cầu để tiết kiệm |
| **Hiệu năng** | Truy vấn trang nguyên liệu **8,5 giây → 3,4 giây**, sau đó chuyển sang phân trang và lọc phía máy chủ |
| Vận hành | Bật tắt module, sao lưu tự động theo lịch, thùng rác, nhật ký thay đổi, tìm kiếm toàn hệ thống, đăng bài theo lịch |
| Kiểm soát chất lượng | Màn hình kiểm tra trùng lặp nguyên liệu |

### Giai đoạn 5 — Trò chuyện trực tuyến và tài khoản thành viên
**05/08 – 14/08/2026**

Mở kênh tư vấn trực tiếp và quản lý khách hàng.

| Nhóm | Kết quả |
|---|---|
| Trò chuyện | Widget trên web nối Telegram, mỗi khách một chủ đề riêng. Gửi ảnh, tệp, tin thoại hai chiều. Song ngữ. Giới hạn tần suất chống rác |
| Theo dõi khách | Định danh, vị trí, thiết bị, hành vi duyệt web |
| Tài khoản thành viên | Xác thực thật thay cho bản giả lập, đăng nhập Google, trang tài khoản, đổi mật khẩu |
| Phân loại khách | Cá nhân và doanh nghiệp với trường thông tin riêng. Tài khoản Google mặc định là cá nhân |
| Giao diện | Nút tài khoản trên header, popup đăng nhập mở ngay tại trang, chọn ngôn ngữ |

### Giai đoạn 6 — API tích hợp và hoàn thiện
**17/08 – 25/08/2026**

Mở dữ liệu cho hệ thống chatbot bên ngoài và hoàn thiện trải nghiệm.

| Nhóm | Kết quả |
|---|---|
| API danh mục | Cấp dữ liệu nguyên liệu cho hệ thống ngoài, ba lớp chặn rò rỉ |
| Phân quyền động | Năm quyền độc lập cho từng khoá, hạn dùng, giới hạn tần suất, chặn mặc định |
| API nội dung | Mở thêm 10 loại nội dung website và thông tin công ty |
| Nhà cung cấp AI | Chuyển sang OpenRouter, tự điều phối model theo độ khó để tối ưu chi phí. Cấu hình động trong quản trị |
| Hoàn thiện | Nút đăng nhập Google ở tab đăng ký, ô nhập lại mật khẩu, đo độ mạnh mật khẩu, popup hai cột, đưa danh sách nguyên liệu lên màn hình đầu |

---

## 4. Bảng tổng hợp giai đoạn

| Giai đoạn | Thời gian | Trọng tâm |
|---|---|---|
| 1 | 15/06 – 29/06 | Khảo sát, đặc tả, dựng nền |
| 2 | 08/07 – 09/07 | Đóng gói, nạp dữ liệu |
| 3 | 13/07 – 18/07 | Sinh nội dung tự động, bảo mật, tối ưu tìm kiếm |
| 4 | 21/07 – 29/07 | Hồ sơ nguyên liệu, hiệu năng, công cụ vận hành |
| 5 | 05/08 – 14/08 | Trò chuyện trực tuyến, tài khoản thành viên |
| 6 | 17/08 – 25/08 | API tích hợp, hoàn thiện |

---

## 5. Cách tổ chức công việc

| Cách làm | Thể hiện |
|---|---|
| Ghi nhận thay đổi theo hạng mục | Mỗi thay đổi có mô tả rõ làm gì, vì sao |
| Phân loại thay đổi | Tính năng mới, sửa lỗi, tái cấu trúc, tối ưu hiệu năng |
| Lập kế hoạch có ước lượng | `dv-cms/docs/04-backlog-ton-dong.md`, ước lượng giờ công từng hạng mục |
| Tài liệu hoá song song | 12 tài liệu kỹ thuật trong `dv-cms/docs/` |
| Chuyển đổi cấu trúc dữ liệu có kiểm soát | 25 tệp, đều lặp lại được an toàn, kiểm chứng trước khi chạy thật |

---

## 6. Kết luận công đoạn 3

| Tiêu chí | Đánh giá |
|---|---|
| Có kho mã với lịch sử đầy đủ | ✅ 208 bản ghi trong hơn hai tháng |
| Tiến triển liên tục, không dồn cục | ✅ Trải đều sáu giai đoạn |
| Khối lượng tương xứng | ✅ 452 tệp, ~51.300 dòng |
| Có tổ chức công việc | ✅ Kế hoạch, phân loại, tài liệu hoá song song |
| Do công ty tự thực hiện | ⚠️ Cần bổ sung văn bản ở mục 1 |
