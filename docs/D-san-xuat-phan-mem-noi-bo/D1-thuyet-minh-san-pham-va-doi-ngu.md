# D1 — THUYẾT MINH SẢN PHẨM PHẦN MỀM VÀ ĐỘI NGŨ THỰC HIỆN

> **Mục đích:** chứng minh sản phẩm phần mềm do đội ngũ nội bộ của công ty phát triển.
> **Ngày lập hồ sơ:** 28/08/2026

---

## 1. Thông tin chung

| Mục | Nội dung |
|---|---|
| Tên công ty | ☐ *nhân sự điền* |
| Mã số thuế | ☐ *nhân sự điền* |
| Địa chỉ trụ sở | ☐ *nhân sự điền* |
| Người đại diện | ☐ *nhân sự điền* |

---

## 2. Sản phẩm phần mềm

| Mục | Nội dung |
|---|---|
| Tên sản phẩm | Hệ thống website và quản trị nội dung Bioscope |
| Thành phần | Website công khai `bioscope.vn` · Hệ thống quản trị `admin.bioscope.vn` |
| Loại hình | Phần mềm ứng dụng trên nền web |
| Thời gian phát triển | **15/06/2026 – 25/08/2026** |
| Trạng thái | Đang vận hành |

### Chức năng chính

| Nhóm | Nội dung |
|---|---|
| Quản trị nội dung | Hệ quản trị đa ngữ Việt–Anh cho ~35 nhóm dữ liệu, dựng trang bằng khối, xem trước trực tiếp |
| Danh mục nguyên liệu | 1.557 nguyên liệu, lọc nhiều chiều, tìm kiếm, phân trang phía máy chủ |
| Sinh nội dung tự động | Đọc tài liệu nhà cung cấp kể cả PDF scan, sinh mô tả và hình ảnh, chạy nền có hàng đợi |
| Đồng bộ dữ liệu | Google Drive, CSV, từ hệ thống nguồn khác |
| Thành viên B2B | Đăng ký phân loại khách, đăng nhập mật khẩu và Google, khu tài liệu giới hạn |
| Trò chuyện trực tuyến | Widget trên web nối với Telegram, mỗi khách một chủ đề riêng |
| API tích hợp | Cấp dữ liệu cho hệ thống ngoài, phân quyền động theo từng khoá |
| Bảo mật | Tường lửa ứng dụng, xác thực hai lớp, chặn IP, nhật ký thao tác |
| SEO | Phân tích nội dung, dữ liệu có cấu trúc, gợi ý liên kết nội bộ |

---

## 3. Quy mô công việc

Số liệu trích từ kho mã nguồn, không ước lượng.

| Chỉ tiêu | Giá trị |
|---|---|
| Số bản ghi thay đổi mã nguồn | **208** |
| Khoảng thời gian | 15/06/2026 – 25/08/2026 |
| Số tệp mã nguồn tự phát triển | **452** |
| Số dòng mã tự phát triển | **~51.300** |
| Số module nghiệp vụ tự xây | **12** |
| Số tệp chuyển đổi cấu trúc dữ liệu | **25** |
| Số bảng trong cơ sở dữ liệu | **403** |
| Số trang website | 25 route → 76 trang |

### Phân bổ theo thành phần

| Thành phần | Số dòng |
|---|---:|
| Hệ quản trị và API | 20.245 |
| Website | 20.117 |
| Module nền dùng chung | 4.137 |
| Module nghiệp vụ Bioscope | 2.379 |
| Module bảo mật | 1.279 |
| Module kiểu nội dung tuỳ biến | 1.256 |
| Module thành viên B2B | 605 |
| Module khối dựng trang | 247 |
| Module danh mục | 186 |

---

## 4. ⚠️ Ranh giới "tự phát triển"

> Mục này viết đúng sự thật để hồ sơ không bị bác bỏ vì nói quá.

Hệ thống xây trên nền phần mềm mã nguồn mở phổ biến:

| Nền tảng | Vai trò |
|---|---|
| Node.js, TypeScript | Môi trường và ngôn ngữ |
| Payload CMS 3.85.1 | Khung quản trị nội dung |
| Next.js 16.2.9, React 19.2.7 | Khung ứng dụng web |
| PostgreSQL | Hệ quản trị cơ sở dữ liệu |
| Docker | Đóng gói triển khai |

**Phần do công ty tự phát triển** là toàn bộ ~51.300 dòng mã trong `apps/` và
`packages/`: mô hình dữ liệu nghiệp vụ, logic nghiệp vụ, giao diện, API tích
hợp, hệ thống trò chuyện, quy trình đồng bộ và sinh nội dung, cơ chế phân quyền.

Việc xây dựng ứng dụng trên nền mã nguồn mở là thông lệ của toàn ngành. Hồ sơ
này **không** tuyên bố công ty viết ra các nền tảng nêu trên.

---

## 5. Đội ngũ thực hiện

| Mục | Nội dung |
|---|---|
| Hình thức | Đội ngũ nội bộ của công ty |
| Thuê ngoài | **Không** — không có hợp đồng thuê gia công phần mềm |
| Mua sẵn | **Không** — không có hoá đơn mua phần mềm thành phẩm |

### Nhân sự tham gia

| Họ tên | Chức danh | Vai trò | Thời gian |
|---|---|---|---|
| ☐ | ☐ | Phát triển toàn phần | 15/06 – 25/08/2026 |
| ☐ | ☐ | ☐ | ☐ |

> Bảng này do **bộ phận nhân sự** điền, kèm hồ sơ chứng minh ở
> [D7](D7-ho-so-doi-ngu-noi-bo.md).

### ⚠️ Điểm cần xử lý trước khi nộp hồ sơ

Ba điểm dưới đây là chỗ yếu nhất trong việc chứng minh **tính nội bộ**. Cần xử
lý trước, không để đến khi bị hỏi.

| Vấn đề | Hiện trạng | Cần làm |
|---|---|---|
| Danh tính người viết mã | Bản ghi mã nguồn gắn với email máy cá nhân `kcode@MacBook-Pro-cua-KCODE.local`, không phải email công ty | Lập văn bản xác nhận danh tính, kèm hợp đồng lao động. Từ nay đặt lại cấu hình dùng email công ty |
| Quyền sở hữu kho mã | Kho mã đặt dưới tài khoản GitHub cá nhân `HungDV2000` | Chuyển sang tài khoản tổ chức của công ty, hoặc lập văn bản xác nhận quyền sở hữu thuộc công ty |
| Văn bản giao nhiệm vụ | Chưa có | Quyết định triển khai dự án và phân công nhiệm vụ |

---

## 6. Bảy công đoạn sản xuất

| Công đoạn | Tài liệu | Trạng thái |
|---|---|---|
| 1. Xác định yêu cầu | [D2](D2-cong-doan-1-xac-dinh-yeu-cau.md) | ✅ Đầy đủ |
| 2. Phân tích và thiết kế | [D3](D3-cong-doan-2-phan-tich-thiet-ke.md) | ✅ Lập bổ sung 28/08/2026 |
| 3. Lập trình, viết mã lệnh | [D4](D4-cong-doan-3-lap-trinh.md) | ✅ Đầy đủ |
| 4. Kiểm tra, thử nghiệm | [D5](D5-cong-doan-4-kiem-thu.md) | ⚠️ Lập bổ sung — xem ghi chú trong tài liệu |
| 5. Hoàn thiện, đóng gói | [D6](D6-cong-doan-5-6-7-dong-goi-trien-khai.md) | ✅ Đầy đủ |
| 6. Cài đặt, chuyển giao, hướng dẫn | [D6](D6-cong-doan-5-6-7-dong-goi-trien-khai.md) | ✅ Đầy đủ |
| 7. Phát hành | [D6](D6-cong-doan-5-6-7-dong-goi-trien-khai.md) | ✅ Đang vận hành |

---

## 7. Xác nhận

| | Người lập | Người duyệt |
|---|---|---|
| Họ tên | ☐ | ☐ |
| Chức danh | ☐ | ☐ |
| Ngày | ☐ | ☐ |
| Chữ ký | | |
