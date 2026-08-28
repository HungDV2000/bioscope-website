# D7 — HỒ SƠ ĐỘI NGŨ NỘI BỘ

> **⚠️ TÀI LIỆU MẪU — CHỜ BỘ PHẬN NHÂN SỰ ĐIỀN**
>
> Đây là phần **quan trọng nhất** của bộ hồ sơ, vì mục đích của cả bộ là chứng
> minh sản phẩm do **đội ngũ nội bộ** phát triển. Các tài liệu D1–D6 chứng minh
> phần mềm được làm ra thật; tài liệu này chứng minh **ai làm ra nó**.
>
> Người soạn tài liệu kỹ thuật **không điền thay** phần này. Mọi thông tin phải
> do bộ phận nhân sự và kế toán cung cấp từ hồ sơ thật.

---

## 1. Quyết định triển khai dự án

| Mục | Nội dung |
|---|---|
| Số quyết định | ☐ |
| Ngày ban hành | ☐ |
| Người ký | ☐ |
| Nội dung | Phê duyệt triển khai dự án phát triển hệ thống website và quản trị nội dung Bioscope |

☐ *Đính kèm bản sao quyết định.*

> Nếu chưa có, cần lập bổ sung. Đây là văn bản thể hiện **công ty chủ động giao
> nhiệm vụ** cho đội ngũ nội bộ, không phải nhận bàn giao từ bên ngoài.

---

## 2. Quyết định thành lập nhóm dự án và phân công

| Mục | Nội dung |
|---|---|
| Số quyết định | ☐ |
| Ngày ban hành | ☐ |
| Người ký | ☐ |

### Danh sách phân công

| STT | Họ tên | Chức danh | Nhiệm vụ được giao | Thời gian |
|---:|---|---|---|---|
| 1 | ☐ | ☐ | Phát triển toàn phần: phân tích, thiết kế, lập trình, kiểm thử, triển khai | 15/06 – 25/08/2026 |
| 2 | ☐ | ☐ | ☐ | ☐ |
| 3 | ☐ | ☐ | ☐ | ☐ |

☐ *Đính kèm bản sao quyết định và bảng phân công.*

---

## 3. Hồ sơ nhân sự

Với **từng người** trong bảng ở mục 2:

| Tài liệu | Có | Ghi chú |
|---|:--:|---|
| Hợp đồng lao động | ☐ | Phải còn hiệu lực trong khoảng 15/06 – 25/08/2026 |
| Quyết định tuyển dụng hoặc bổ nhiệm | ☐ | |
| Bằng cấp, chứng chỉ chuyên môn | ☐ | |
| Bản mô tả công việc | ☐ | Nên thể hiện nhiệm vụ phát triển phần mềm |

☐ *Đính kèm bản sao.*

---

## 4. Bảng chấm công và bảng lương

Chứng minh nhân sự **nằm trong biên chế** đúng giai đoạn phát triển.

| Kỳ | Bảng chấm công | Bảng lương | Chứng từ chi trả |
|---|:--:|:--:|:--:|
| Tháng 6/2026 | ☐ | ☐ | ☐ |
| Tháng 7/2026 | ☐ | ☐ | ☐ |
| Tháng 8/2026 | ☐ | ☐ | ☐ |

☐ *Đính kèm bản sao.*

---

## 5. Xác nhận không thuê ngoài, không mua sẵn

| Nội dung | Xác nhận |
|---|:--:|
| Không có hợp đồng thuê gia công phát triển phần mềm cho sản phẩm này | ☐ |
| Không có hoá đơn mua phần mềm thành phẩm cho sản phẩm này | ☐ |
| Toàn bộ mã nguồn do nhân sự nội bộ viết | ☐ |

> Lưu ý viết đúng: hệ thống **xây trên nền phần mềm mã nguồn mở** (Payload CMS,
> Next.js, PostgreSQL). Đây là thông lệ toàn ngành và không mâu thuẫn với việc
> tự phát triển. Phần tự phát triển là ~51.300 dòng mã ứng dụng. Xem
> [D1](D1-thuyet-minh-san-pham-va-doi-ngu.md) mục 4.
>
> **Không viết** "tự viết toàn bộ hệ thống từ đầu" — nói quá là chỗ dễ bị bác bỏ nhất.

---

## 6. ⚠️ Ba việc phải xử lý trước khi nộp hồ sơ

Đây là ba điểm yếu nhất trong việc chứng minh tính nội bộ. Cần xử lý trước, đừng
để bị hỏi rồi mới lo.

### 6.1 Danh tính người viết mã

**Hiện trạng:** 207 trên 208 bản ghi thay đổi mã nguồn gắn với
`KCODE <kcode@MacBook-Pro-cua-KCODE.local>` — email máy cá nhân, không nối được
với công ty. Một bản ghi gắn với `HungDV2000 <deepviewzoom@gmail.com>`.

**Cần làm:**

- [ ] Lập **văn bản xác nhận danh tính**: xác nhận `KCODE` với email nêu trên
      chính là ông/bà ☐, nhân sự của công ty, kèm hợp đồng lao động
- [ ] Từ nay đặt lại cấu hình để bản ghi mới dùng email công ty:
      ```
      git config user.email "hoten@tencongty.com"
      ```

> **Không sửa lại lịch sử cũ.** Viết lại email trong các bản ghi đã có là can
> thiệp vào bằng chứng — rủi ro lớn hơn nhiều so với việc giải trình bằng một
> văn bản xác nhận.

### 6.2 Quyền sở hữu kho mã nguồn

**Hiện trạng:** kho mã đặt tại `https://github.com/HungDV2000/bioscope-website`
— tài khoản cá nhân, không phải tài khoản tổ chức của công ty.

**Cần làm — chọn một:**

- [ ] Chuyển kho mã sang **tài khoản tổ chức GitHub của công ty**, hoặc
- [ ] Lập **văn bản xác nhận** quyền sở hữu mã nguồn thuộc công ty, có chữ ký
      của chủ tài khoản cá nhân

### 6.3 Văn bản giao nhiệm vụ

**Hiện trạng:** chưa có.

**Cần làm:**

- [ ] Quyết định triển khai dự án — mục 1
- [ ] Quyết định phân công nhiệm vụ — mục 2

---

## 7. Danh mục hồ sơ đính kèm

| STT | Tài liệu | Số bản | Có |
|---:|---|---:|:--:|
| 1 | Quyết định triển khai dự án | ☐ | ☐ |
| 2 | Quyết định thành lập nhóm và phân công | ☐ | ☐ |
| 3 | Hợp đồng lao động của từng thành viên | ☐ | ☐ |
| 4 | Bằng cấp, chứng chỉ chuyên môn | ☐ | ☐ |
| 5 | Bảng chấm công tháng 6, 7, 8/2026 | ☐ | ☐ |
| 6 | Bảng lương và chứng từ chi trả | ☐ | ☐ |
| 7 | Văn bản xác nhận danh tính người viết mã | ☐ | ☐ |
| 8 | Văn bản xác nhận quyền sở hữu kho mã | ☐ | ☐ |
| 9 | Xác nhận không thuê ngoài, không mua sẵn | ☐ | ☐ |

---

## 8. Xác nhận

| | Bộ phận nhân sự | Người đại diện công ty |
|---|---|---|
| Họ tên | ☐ | ☐ |
| Chức danh | ☐ | ☐ |
| Ngày | ☐ | ☐ |
| Chữ ký | | |
