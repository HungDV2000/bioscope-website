# D5 — CÔNG ĐOẠN 4: KIỂM TRA, THỬ NGHIỆM

> **⚠️ Ghi chú về tính trung thực của tài liệu này**
>
> Dự án **không có bộ kiểm thử tự động**. Việc kiểm thử được thực hiện thủ công
> trong suốt quá trình phát triển, bằng chứng là **62 lần sửa lỗi có ghi nhận
> ngày tháng và nội dung cụ thể** trong hệ thống quản lý phiên bản.
>
> Bộ kịch bản kiểm thử ở mục 2 **lập ngày 28/08/2026**, hệ thống hoá lại các
> phép kiểm đã thực hiện. Không có tài liệu nào được tạo lùi ngày.

---

## 1. Nhật ký sửa lỗi — bằng chứng gốc

Trong 208 lần ghi nhận thay đổi mã nguồn:

| Loại | Số lượng | Tỷ lệ |
|---|---:|---:|
| Tính năng mới | 90 | 43% |
| **Sửa lỗi** | **62** | **30%** |
| Khác — tái cấu trúc, tối ưu, tài liệu | 56 | 27% |

Tỷ lệ sửa lỗi 30% cho thấy quá trình kiểm thử diễn ra **liên tục và thật**,
không phải làm xong rồi mới kiểm.

### Trích nhật ký sửa lỗi tiêu biểu

| Ngày | Lỗi phát hiện và xử lý |
|---|---|
| 09/07 | Kịch bản khởi tạo dữ liệu chạy thiếu bước |
| 10/07 | Container dùng sai biến cổng |
| 11/07 | Nguyên liệu nhập vào không được xuất bản; kết nối nội bộ giữa website và hệ quản trị |
| 15/07 | Bộ sinh nội dung đọc biến toàn cục chưa gán |
| 15/07 | Nhãn thông số ghi sai định dạng, không tách theo ngôn ngữ |
| 15/07 | Trích xuất PDF không chạy trên môi trường Node 20 |
| 15/07 | Lỗi ghi thông số làm hỏng cả công việc sinh nội dung |
| 16/07 | Không phân giải được module dùng chung khi đóng gói |
| 16/07 | Proxy xem trước mất thông tin tên miền gốc |
| 18/07 | Thiếu bảng dữ liệu cho nhóm thông tin công ty |
| 18/07 | Nội dung chỉ ghi vào một ngôn ngữ |
| 21/07 | Thiếu tệp chuyển đổi cấu trúc cho hồ sơ nguyên liệu |
| 22/07 | Thiếu tệp chuyển đổi cấu trúc cho ba nhóm dữ liệu |
| 23/07 | Không đọc được tài liệu Google Docs khi nhập từ CSV |
| 25/07 | Lỗi máy chủ khi sinh nội dung |
| 27/07 | Hàng đợi sinh nội dung nằm im sau khi khởi động lại |
| 27/07 | Một tệp treo làm đơ toàn bộ công việc — bổ sung giới hạn thời gian từng tệp |
| 27/07 | Mã xuất xứ hiển thị lẫn lộn trong bộ lọc |
| 14/08 | Đăng nhập Google lỗi địa chỉ chuyển hướng do header dạng danh sách |
| 14/08 | Đăng nhập Google lỗi vì trường Tên công ty bắt buộc |
| 14/08 | Cột cơ sở dữ liệu vẫn ràng buộc bắt buộc — bổ sung tệp chuyển đổi |
| 14/08 | Không chat được vì mã thành viên bị ép sang chuỗi |
| 14/08 | Tải lại trang mất hội thoại cũ |
| 17/08 | Dựng trang tĩnh vượt thời gian chờ trên máy chủ |
| 17/08 | Thanh điều hướng tràn, che mất nút kêu gọi hành động |

Danh sách đầy đủ 62 mục truy xuất được từ lịch sử kho mã.

### Phân nhóm lỗi

| Nhóm | Số lượng ước tính | Nhận xét |
|---|---:|---|
| Sinh nội dung tự động | ~18 | Nhóm phức tạp nhất — xử lý tài liệu nhiều định dạng, nhiều mô hình |
| Đóng gói và triển khai | ~9 | Cấu hình container, biến môi trường, phân giải module |
| Cấu trúc cơ sở dữ liệu | ~6 | Thiếu tệp chuyển đổi khi đổi cấu trúc |
| Xác thực và đăng nhập | ~7 | Chủ yếu quanh đăng nhập Google qua nhiều tầng proxy |
| Giao diện | ~12 | Bố cục, hiển thị, tràn khung |
| Khác | ~10 | |

### Bài học rút ra từ nhóm lỗi cơ sở dữ liệu

Sáu lỗi cùng một nguyên nhân: **đổi ràng buộc trường trong mã mà quên tệp
chuyển đổi cấu trúc tương ứng**. Tầng ứng dụng chấp nhận, cơ sở dữ liệu từ chối,
lỗi chỉ hiện khi ghi thật.

Quy tắc rút ra và đã áp dụng: **sửa ràng buộc trường ⇒ bắt buộc có tệp chuyển
đổi đi kèm**. Ghi tại [B5](../B-he-thong-website/B5-van-hanh.md).

---

## 2. Bộ kịch bản kiểm thử

> Lập ngày 28/08/2026. Dùng cho kiểm thử chấp nhận và kiểm thử hồi quy sau mỗi
> lần triển khai.

### Nhóm 1 — Website công khai

| Mã | Kịch bản | Kết quả kỳ vọng | Kết quả |
|---|---|---|:--:|
| TC-01 | Mở trang chủ | Trang tải, không lỗi | ☐ |
| TC-02 | Mở trang nguyên liệu | Hiện đúng 1.557 nguyên liệu, phân trang hoạt động | ☐ |
| TC-03 | Lọc theo danh mục chính | Kết quả đúng nhóm đã chọn | ☐ |
| TC-04 | Tìm kiếm "kháng viêm" | Ra kết quả dù chữ không nằm trong tên nguyên liệu | ☐ |
| TC-05 | Mở chi tiết một nguyên liệu | Hiện đủ thông số, tài liệu, ảnh | ☐ |
| TC-06 | **Bảng giá trên trang công khai** | **KHÔNG hiển thị** | ☐ |
| TC-07 | Chuyển sang tiếng Anh | Toàn bộ nội dung đổi ngôn ngữ | ☐ |
| TC-08 | Mở trên điện thoại 375px | Không cuộn ngang, thanh điều hướng thu gọn | ☐ |
| TC-09 | Mở trên máy tính 1280px | Thanh điều hướng đầy đủ, không tràn | ☐ |

### Nhóm 2 — Tài khoản thành viên

| Mã | Kịch bản | Kết quả kỳ vọng | Kết quả |
|---|---|---|:--:|
| TC-10 | Đăng ký khách doanh nghiệp | Tạo tài khoản, trạng thái chờ duyệt | ☐ |
| TC-11 | Đăng ký khách cá nhân | Không hỏi thông tin doanh nghiệp | ☐ |
| TC-12 | Nhập mật khẩu `Password123!` | Đo độ mạnh hiện "Trung bình", không phải "Rất mạnh" | ☐ |
| TC-13 | Nhập lại mật khẩu không khớp rồi gửi | **Không gửi đi**, hiện thông báo lỗi | ☐ |
| TC-14 | Bấm nút con mắt | Mật khẩu hiện dạng chữ, nhãn đổi thành "Ẩn" | ☐ |
| TC-15 | Đăng nhập bằng mật khẩu | Vào được, header hiện tên | ☐ |
| TC-16 | Đăng nhập Google lần đầu | **Tự tạo tài khoản**, mặc định khách cá nhân | ☐ |
| TC-17 | Đăng nhập Google từ `www.bioscope.vn` | Thành công — kiểm tra khai báo địa chỉ chuyển hướng | ☐ |
| TC-18 | Sửa hồ sơ, đổi loại khách | Lưu được, hiển thị đúng | ☐ |
| TC-19 | Vào khu tài liệu khi chưa được duyệt | **Bị chặn** | ☐ |
| TC-20 | Đăng xuất rồi vào lại | Không còn phiên cũ | ☐ |

### Nhóm 3 — Trò chuyện trực tuyến

| Mã | Kịch bản | Kết quả kỳ vọng | Kết quả |
|---|---|---|:--:|
| TC-21 | Bấm chat khi chưa đăng nhập | **Hiện popup đăng nhập**, không chat được | ☐ |
| TC-22 | Chat sau khi đăng nhập | Gửi được, tin sang đúng chủ đề Telegram | ☐ |
| TC-23 | Nhân viên trả lời trong Telegram | Tin về đúng widget của khách | ☐ |
| TC-24 | Gửi ảnh hai chiều | Nhận được cả hai phía | ☐ |
| TC-25 | Tải lại trang | **Hiện lại toàn bộ hội thoại cũ** | ☐ |
| TC-26 | Xoá chủ đề trong Telegram rồi khách gửi tiếp | Hệ thống tự tạo lại, không mất tin | ☐ |
| TC-27 | Đăng xuất rồi tài khoản khác đăng nhập trên cùng máy | **Không đọc được hội thoại của người trước** | ☐ |

### Nhóm 4 — Hệ quản trị

| Mã | Kịch bản | Kết quả kỳ vọng | Kết quả |
|---|---|---|:--:|
| TC-28 | Đăng nhập quản trị | Vào được | ☐ |
| TC-29 | Sửa nội dung trang, lưu | Website cập nhật ngay | ☐ |
| TC-30 | Tạo nguyên liệu ở dạng nháp | **Không hiện trên website** | ☐ |
| TC-31 | Xuất bản nguyên liệu đó | Hiện trên website | ☐ |
| TC-32 | Chạy sinh nội dung tự động | Công việc chạy nền, có nhật ký, kết quả vào **bản nháp** | ☐ |
| TC-33 | Chạy quét trùng | Liệt kê đúng nhóm trùng tên | ☐ |
| TC-34 | Xem nhật ký thay đổi | Ghi đúng người và thời điểm | ☐ |

### Nhóm 5 — API tích hợp *(kiểm tra âm tính — quan trọng nhất)*

| Mã | Kịch bản | Kết quả kỳ vọng | Kết quả |
|---|---|---|:--:|
| TC-35 | Gọi `/catalog/manifest` với khoá hợp lệ | `200`, trả tổng số | ☐ |
| TC-36 | Gọi `/catalog/search?q=` | `200`, trả kết quả liên quan | ☐ |
| TC-37 | Gọi bằng khoá sai | **`401`** | ☐ |
| TC-38 | Khoá chỉ có quyền Tìm kiếm gọi `/catalog/content` | **`403`** | ☐ |
| TC-39 | Khoá chỉ có quyền Tìm kiếm gọi `/catalog/site` | **`403`** | ☐ |
| TC-40 | Gọi `/catalog/content/members` | **`404`** | ☐ |
| TC-41 | Kiểm phản hồi có chứa trường `pricing` | **Không có** khi khoá chưa bật quyền giá | ☐ |
| TC-42 | Kiểm `/catalog/site` có mã đo lường GA4/GTM/Pixel | **Không có** | ☐ |
| TC-43 | Gọi `/catalog/content/faqs` khi có câu hỏi ở dạng nháp | **Bản nháp không xuất hiện** | ☐ |
| TC-44 | Gọi vượt giới hạn tần suất | `429` | ☐ |
| TC-45 | Thu hồi khoá rồi gọi lại | `401` ngay lập tức | ☐ |

> Nhóm 5 gồm nhiều **phép kiểm âm tính** — kiểm tra hệ thống *không* trả ra thứ
> không được phép. Đây là nhóm quan trọng nhất: hỏng ở đây là rò rỉ dữ liệu, chứ
> không phải lỗi hiển thị.

### Nhóm 6 — Triển khai

| Mã | Kịch bản | Kết quả kỳ vọng | Kết quả |
|---|---|---|:--:|
| TC-46 | Chạy tệp chuyển đổi cấu trúc lần một | Không lỗi | ☐ |
| TC-47 | **Chạy lại lần hai** | **Không lỗi** — phép thử lặp lại an toàn | ☐ |
| TC-48 | Dựng hệ quản trị | Biên dịch thành công | ☐ |
| TC-49 | Dựng website | Sinh đủ 76 trang | ☐ |
| TC-50 | Sao lưu và khôi phục cơ sở dữ liệu | Dữ liệu nguyên vẹn | ☐ |

---

## 3. Biên bản kiểm thử chấp nhận

| Mục | Nội dung |
|---|---|
| Ngày kiểm thử | ☐ |
| Địa điểm | ☐ |
| Phiên bản | ☐ |
| Môi trường | ☐ *máy chủ thật / thử nghiệm* |

### Thành phần tham gia

| Họ tên | Chức danh | Vai trò |
|---|---|---|
| ☐ | ☐ | Người kiểm thử |
| ☐ | ☐ | Đại diện nghiệp vụ |

### Kết quả

| Chỉ tiêu | Số lượng |
|---|---:|
| Tổng số kịch bản | 50 |
| Đạt | ☐ |
| Không đạt | ☐ |
| Không áp dụng | ☐ |

### Kết luận

☐ Đạt — chấp nhận đưa vào vận hành
☐ Đạt có điều kiện — cần khắc phục các mục sau: ☐
☐ Không đạt

### Xác nhận

| | Người kiểm thử | Đại diện nghiệp vụ |
|---|---|---|
| Họ tên | ☐ | ☐ |
| Ngày | ☐ | ☐ |
| Chữ ký | | |

---

## 4. ☐ Bằng chứng nên đính kèm

- [ ] Ảnh chụp màn hình kết quả từng nhóm kịch bản
- [ ] Ảnh chụp nhật ký công việc chạy nền trong quản trị
- [ ] Ảnh chụp kết quả kiểm tra âm tính của API — mã `401`, `403`, `404`
- [ ] Kết quả dựng hệ thống thành công

---

## 5. Kết luận công đoạn 4

| Tiêu chí | Đánh giá |
|---|---|
| Có hoạt động kiểm thử trong quá trình phát triển | ✅ 62 lần sửa lỗi có ngày tháng và nội dung cụ thể |
| Có bộ kịch bản kiểm thử | ✅ 50 kịch bản, lập 28/08/2026 |
| Có biên bản chấp nhận | ⚠️ Mẫu đã lập, **chờ thực hiện và ký** |
| Có bộ kiểm thử tự động | ❌ Không có |

**Việc cần làm:** chạy bộ 50 kịch bản, chụp màn hình kết quả, ký biên bản. Đây
là cách biến công đoạn 4 từ mức "có bằng chứng gián tiếp" thành "có bằng chứng
trực tiếp".
