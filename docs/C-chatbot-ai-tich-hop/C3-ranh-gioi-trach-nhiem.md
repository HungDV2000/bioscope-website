# C3 — PHÂN ĐỊNH TRÁCH NHIỆM VẬN HÀNH

> Bioscope hiện có **hai hệ thống chat khác nhau**. Nhầm lẫn giữa hai cái này
> dẫn tới đùn đẩy khi có sự cố. Tài liệu này phân định rõ.

---

## 1. Hai hệ thống — không phải một

| | **Chat trên website** | **Chatbot Telegram** |
|---|---|---|
| Khách dùng ở đâu | Widget trên bioscope.vn | Ứng dụng Telegram |
| Ai trả lời | **Người** — nhân viên kinh doanh | **AI** tự động |
| Ai xây | Bioscope (nội bộ) | Bên thứ ba |
| Nền tảng | Payload CMS + Next.js | Google Apps Script |
| Dữ liệu lưu ở | PostgreSQL của Bioscope | Hệ thống của bên thứ ba |
| Tài liệu | [C1](C1-kien-truc-chat-tren-web.md) | Của bên thứ ba |

**Điểm chung duy nhất:** cả hai đều dùng Telegram. Nhưng theo cách hoàn toàn
khác nhau — hệ thống website dùng Telegram làm **giao diện cho nhân viên trả
lời**, còn chatbot dùng Telegram làm **kênh nói chuyện với khách**.

---

## 2. Điểm chạm duy nhất giữa hai bên

```
CMS Bioscope  ──── API chỉ đọc ────►  Chatbot bên thứ ba
              (khoá bsk_...)
```

Chatbot **chỉ đọc** dữ liệu qua API. Không ghi được gì vào hệ thống Bioscope.

Ngoài đường này ra, hai hệ thống **không có kết nối nào khác**.

---

## 3. Bảng phân định trách nhiệm

| Hạng mục | Bioscope | Bên chatbot |
|---|:--:|:--:|
| **Dữ liệu** | | |
| Nội dung nguyên liệu đúng và cập nhật | ✅ | |
| Xuất bản, duyệt nội dung | ✅ | |
| **API** | | |
| API hoạt động, đúng dữ liệu | ✅ | |
| Cấp và thu hồi khoá | ✅ | |
| Giữ khoá an toàn, không để lộ | | ✅ |
| Gọi API đúng cách, có giới hạn thử lại | | ✅ |
| **Chatbot** | | |
| Chatbot hoạt động | | ✅ |
| Chất lượng câu trả lời | | ✅ |
| Tuân thủ ràng buộc chống bịa số liệu | | ✅ |
| Chi phí mô hình AI của chatbot | | ✅ |
| **Chat trên website** | | |
| Widget hoạt động | ✅ | |
| Nhân viên trực và trả lời | ✅ | |
| Dữ liệu cá nhân của khách chat | ✅ | |

---

## 4. Sự cố — ai xử lý

| Hiện tượng | Thuộc về | Xử lý |
|---|---|---|
| Chatbot trả lời sai thông tin sản phẩm | **Cả hai** | Bioscope kiểm dữ liệu trong CMS. Đúng rồi thì lỗi ở chatbot |
| Chatbot bịa thông số không có trong dữ liệu | Bên chatbot | Rà lại prompt hệ thống, xem §10 tài liệu API |
| Chatbot báo lỗi kết nối | Bioscope | Kiểm API và trạng thái khoá |
| Chatbot nhận `403` | Bioscope | Khoá thiếu quyền, vào admin tick thêm |
| Chatbot nhận `401` | Bioscope | Khoá sai, bị thu hồi hoặc hết hạn |
| Chatbot nhận `429` | Bên chatbot | Gọi quá nhanh, cần thử lại có giới hạn |
| Widget trên web không hiện | Bioscope | Kiểm cài đặt chat, xem [C1](C1-kien-truc-chat-tren-web.md) |
| Khách chat trên web không ai trả lời | Bioscope | Nhân viên kinh doanh |
| Nghi khoá API bị lộ | Bioscope | Thu hồi ngay, phát khoá mới |

---

## 5. Quy trình khi Bioscope đổi dữ liệu

Bioscope **không cần báo trước** khi:
- Thêm, sửa, xoá nguyên liệu
- Thêm FAQ, dịch vụ, dự án
- Đổi thông tin công ty

Chatbot gọi API nên luôn nhận bản mới nhất.

Bioscope **phải báo trước** khi:
- Đổi hoặc thu hồi khoá API
- Đổi quyền của khoá
- Thay đổi cấu trúc dữ liệu trả về
- Thêm loại nội dung mới *(khuyến khích báo để bên kia tận dụng)*

---

## 6. Trách nhiệm về nội dung tư vấn

> Đây là ngành dược phẩm và thực phẩm chức năng.

| | |
|---|---|
| Dữ liệu gốc đúng | Trách nhiệm **Bioscope** |
| Chatbot dùng đúng dữ liệu, không bịa thêm | Trách nhiệm **bên chatbot** |
| Nội dung đến tay khách hàng cuối | **Cả hai cùng chịu** |

Bên chatbot phải cam kết tuân thủ ràng buộc ở §10 tài liệu
`dv-cms/docs/10-api-danh-muc-nguyen-lieu.md`. Nên đưa vào hợp đồng hoặc biên
bản làm việc, không chỉ dặn miệng.

---

## 7. Đầu mối liên hệ

| Việc | Đầu mối |
|---|---|
| Cấp/thu hồi khoá, đổi quyền | Quản trị hệ thống Bioscope |
| Dữ liệu sản phẩm sai | Bộ phận nội dung Bioscope |
| API lỗi | Kỹ thuật Bioscope |
| Chatbot lỗi | Bên phát triển chatbot |

> Điền tên và số điện thoại cụ thể trước khi đưa vào vận hành thật.
