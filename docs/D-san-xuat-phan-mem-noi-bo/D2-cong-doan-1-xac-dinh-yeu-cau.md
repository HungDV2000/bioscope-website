# D2 — CÔNG ĐOẠN 1: XÁC ĐỊNH YÊU CẦU

> **Đây là công đoạn có bằng chứng mạnh nhất của hồ sơ.**
> Tài liệu được lập **trước** giai đoạn lập trình chính, đúng trình tự sản xuất
> phần mềm.

---

## 1. Bằng chứng gốc

| Tài liệu | Vị trí | Dung lượng | Ngày lập |
|---|---|---:|---|
| Khảo sát và tư vấn thiết kế website | `BIOSCOPE - Tài liệu khảo sát tư vấn thiết kế website.md` | **144.985 byte** | 26/06/2026 |
| Đặc tả yêu cầu hệ thống | `SRS_BIOSCOPE.md` | 18.229 byte | 27/06/2026 |
| Đặc tả phương án nền tảng ban đầu | `SRS_BIOSCOPE_STRAPI.md` | 14.292 byte | 21/06/2026 |

Cả ba đều nằm trong kho mã nguồn, có mốc thời gian ghi nhận trong hệ thống quản
lý phiên bản — không thể tạo lùi ngày.

### Ý nghĩa của mốc thời gian

| Ngày | Sự kiện |
|---|---|
| 15/06/2026 | Bắt đầu dựng mã nguồn |
| 21/06/2026 | Đặc tả phương án nền tảng ban đầu |
| **26/06/2026** | **Tài liệu khảo sát yêu cầu — 145 KB** |
| **27/06/2026** | **Đặc tả yêu cầu hệ thống** |
| 28/06/2026 trở đi | Giai đoạn phát triển chính |

Tài liệu yêu cầu hoàn tất **trước** khối lượng lập trình lớn nhất — đây là dấu
hiệu của quy trình sản xuất thật, không phải hợp thức hoá sau.

---

## 2. Nội dung tài liệu khảo sát

`BIOSCOPE - Tài liệu khảo sát tư vấn thiết kế website.md` gồm hai phần.

### Phần 1 — Bộ câu hỏi khai thác yêu cầu

| Nhóm | Nội dung khai thác |
|---|---|
| **A** | Chiến lược và mục tiêu tổng thể |
| **B** | Nội dung và dữ liệu |
| **C** | Chức năng và tích hợp kỹ thuật |
| Tổng kết | Danh sách hạng mục khách hàng cần chốt và cung cấp |

### Phần 2 — Nội dung website bản điền hoàn chỉnh

Đặc tả nội dung chi tiết cho từng trang:

| Trang | |
|---|---|
| 0 | Hệ thống điều hướng và thông tin chung |
| 1 | Trang chủ |
| 2 | Nguyên liệu |
| 3 | Giải pháp |
| 4 | Về chúng tôi |
| 5 | Đồng kiến tạo |
| … | Các trang còn lại |

---

## 3. Nội dung đặc tả yêu cầu hệ thống

`SRS_BIOSCOPE.md` — 14 chương:

| Chương | Nội dung |
|---|---|
| 0 | Tóm tắt các quyết định đã chốt |
| 1 | Kiến trúc tổng thể bốn tầng |
| 2 | Tầng hệ quản trị nội dung dùng chung |
| 3 | Tầng module bật tắt theo dự án |
| 4 | Tầng giao diện người dùng |
| 5 | Tầng dịch vụ nghiệp vụ |
| 6 | Chiến lược quản trị |
| 7 | Nguyên tắc chống lệ thuộc nền tảng |
| 8 | Module trí tuệ nhân tạo dùng chung |
| 9 | Bioscope — dự án áp dụng đầu tiên |
| 10 | Ánh xạ dự án vào kiến trúc |
| 11 | Nền tảng và phiên bản |
| 12 | Yêu cầu phi chức năng |
| 13 | Hạ tầng và triển khai |
| 14 | Lộ trình |

---

## 4. Yêu cầu bổ sung trong quá trình phát triển

Ngoài hai tài liệu gốc, yêu cầu còn được chốt qua trao đổi với khách hàng trong
suốt dự án. Bằng chứng nằm ở chính lịch sử phát triển — mỗi hạng mục mới đều có
bản ghi thay đổi mã nguồn tương ứng, ghi rõ ngày và nội dung.

Ví dụ các yêu cầu phát sinh có mốc thời gian rõ ràng:

| Ngày | Yêu cầu phát sinh |
|---|---|
| 13/07/2026 | Sinh nội dung nguyên liệu tự động từ tài liệu nhà cung cấp |
| 24/07/2026 | Bảng giá nhiều bậc, chỉ nhân viên xem được |
| 24/07/2026 | Tách email liên hệ và email nhận hoá đơn |
| 27/07/2026 | Công tắc ẩn nguyên liệu khỏi website |
| 05/08/2026 | Hệ thống trò chuyện trực tuyến nối Telegram |
| 13/08/2026 | Tài khoản thành viên, đăng nhập Google |
| 14/08/2026 | Phân loại khách cá nhân và doanh nghiệp |
| 17/08/2026 | API cấp dữ liệu cho hệ thống chatbot bên ngoài |

Danh sách đầy đủ ở [D4](D4-cong-doan-3-lap-trinh.md).

### ☐ Bằng chứng bổ sung nên đính kèm

Nếu có, đính kèm để hồ sơ chắc hơn:

- [ ] Biên bản họp chốt yêu cầu với khách hàng
- [ ] Thư điện tử trao đổi yêu cầu
- [ ] Ảnh chụp tin nhắn chốt tính năng
- [ ] Hợp đồng hoặc phụ lục hợp đồng với khách hàng

---

## 5. Kế hoạch triển khai đã lập

`dv-cms/docs/04-backlog-ton-dong.md`, cập nhật 03/07/2026, là bằng chứng bổ sung
cho công đoạn này. Tài liệu gồm:

- Danh sách hạng mục đã hoàn thành để đối chiếu tiến độ
- Danh sách hạng mục còn lại, **có ước lượng giờ công** cho từng hạng mục
- Mục tiêu đưa hệ thống vào vận hành thật

Đây là tài liệu **lập kế hoạch nội bộ** — chứng minh công ty tự tổ chức và quản
lý công việc phát triển, không phải nhận bàn giao từ bên ngoài.

---

## 6. Kết luận công đoạn 1

| Tiêu chí | Đánh giá |
|---|---|
| Có tài liệu yêu cầu | ✅ Ba tài liệu, tổng gần **178 KB** |
| Lập trước giai đoạn lập trình chính | ✅ 21–27/06, trước mốc 28/06 |
| Có mốc thời gian kiểm chứng được | ✅ Trong hệ thống quản lý phiên bản |
| Có kế hoạch triển khai | ✅ Kèm ước lượng giờ công |
| Do công ty tự lập | ✅ Nằm trong kho mã nguồn của công ty |

**Công đoạn 1 đầy đủ bằng chứng.**
