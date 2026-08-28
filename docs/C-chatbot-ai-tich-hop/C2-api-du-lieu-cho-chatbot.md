# C2 — API DỮ LIỆU CHO CHATBOT

> **Tài liệu tích hợp đầy đủ nằm ở:**
> **`dv-cms/docs/10-api-danh-muc-nguyen-lieu.md`**
>
> File này chỉ tóm tắt và dẫn đường. Tài liệu kia đã đủ để một AI đọc và tự
> tích hợp — có sơ đồ dữ liệu, mã lỗi, code chạy được, ràng buộc bắt buộc.
> Không chép lại ở đây để tránh hai bản lệch nhau.

---

## 1. API này dành cho ai

Bên phát triển **chatbot Telegram của Bioscope** — hệ thống chạy trên Google
Apps Script, do một đội khác xây dựng.

Chatbot đó cần dữ liệu sản phẩm để tư vấn khách. Thay vì chép dữ liệu sang, họ
gọi API lấy trực tiếp, luôn được bản mới nhất.

⚠️ **Không nhầm với hệ thống chat trên website** ở [C1](C1-kien-truc-chat-tren-web.md).
Phân định rõ ở [C3](C3-ranh-gioi-trach-nhiem.md).

---

## 2. Ba nhóm dữ liệu

| Nhóm | Nội dung | Quyền cần |
|---|---|---|
| **Nguyên liệu** | ~1.557 nguyên liệu, thông số kỹ thuật, INCI, MOQ | `Tìm kiếm` / `Danh sách` / `Chi tiết` |
| **Nội dung website** | 10 loại: FAQ, dịch vụ, dự án, công nghệ, chứng nhận, bài viết, trang, danh mục, thẻ phân loại, đối tác | `Nội dung website` |
| **Thông tin công ty** | Địa chỉ, điện thoại, email, mã số thuế, mạng xã hội | `Thông tin công ty` |

---

## 3. Endpoint

Địa chỉ gốc: `https://admin.bioscope.vn/api/catalog`

| Endpoint | Việc |
|---|---|
| `GET /manifest` | Tổng số và thời điểm cập nhật cuối |
| `GET /search?q=` | **Tìm theo câu hỏi** — dùng chính cho chatbot |
| `GET /ingredients` | Danh sách, phân trang, đồng bộ |
| `GET /ingredients/{slug}` | Chi tiết một nguyên liệu |
| `GET /content` | Các loại nội dung đang mở |
| `GET /content/{type}` | Danh sách một loại |
| `GET /content/{type}/{key}` | Chi tiết theo slug hoặc id |
| `GET /site` | Thông tin công ty |

Mọi endpoint hỗ trợ `locale=vi|en` và `format=text` — dạng văn bản gọn đưa
thẳng vào ngữ cảnh AI, nhẹ hơn JSON khoảng một nửa.

---

## 4. Chatbot hỏi gì thì lấy ở đâu

| Khách hỏi | Endpoint |
|---|---|
| "Có nguyên liệu nào kháng viêm?" | `/search?q=` |
| "Đặt tối thiểu bao nhiêu?", "Có mẫu thử không?" | `/content/faqs` |
| "Bioscope làm được gì cho tôi?" | `/content/services` |
| "Đã làm cho thương hiệu nào?" | `/content/case-studies` |
| "Địa chỉ ở đâu?", "Gọi số nào?" | `/site` |

Khuyến nghị: gọi **song song** `/search` và `/content/faqs` rồi ghép cả hai vào
ngữ cảnh. Câu "đặt tối thiểu bao nhiêu" không khớp nguyên liệu nào — câu trả
lời nằm bên FAQ. Chỉ tra một nguồn thì chatbot trả lời hụt đúng những câu
thường gặp nhất.

---

## 5. Cấp và quản lý khoá

**Admin → Hệ thống → Khoá API tích hợp**

| Thao tác | |
|---|---|
| Phát khoá | Tạo bản ghi → đặt tên bên sử dụng → chọn quyền → Lưu → bấm "🔑 Phát khoá mới" |
| Xem lại khoá | **Không được** — hệ thống chỉ lưu băm. Mất thì phát lại |
| Thu hồi | Bỏ tick "Đang hiệu lực", có hiệu lực ngay |
| Đổi quyền | Tick lại, có hiệu lực ngay, bên dùng không phải làm gì |

### Nguyên tắc cấp quyền

> **Cấp ít nhất có thể.** Chatbot tư vấn thường chỉ cần `Tìm kiếm` +
> `Nội dung website` + `Thông tin công ty`.

Không cấp `Danh sách & đồng bộ` nếu bên đó không thật sự cần kéo cả kho về.

**Bảng giá mặc định TẮT.** Chỉ bật khi có quyết định rõ ràng — đây là dữ liệu
thương mại.

---

## 6. ❌ API không bao giờ trả về

| Dữ liệu | Vì sao |
|---|---|
| Tài khoản thành viên, nhân viên | Dữ liệu cá nhân |
| Lịch sử chat, tin nhắn | Dữ liệu cá nhân của khách |
| Form khách gửi | Dữ liệu cá nhân |
| Nhật ký bảo mật, thao tác | Dữ liệu an ninh |
| Tài liệu B2B | Chỉ đối tác đã duyệt |
| Bản nháp chưa xuất bản | Chưa được duyệt công bố |
| Bảng giá | Trừ khi bật riêng cho khoá đó |

Chặn ở **tầng máy chủ** bằng danh sách trắng, không phụ thuộc tham số bên gọi
truyền lên.

---

## 7. Điều cần dặn bên tích hợp

Tài liệu `10-api-danh-muc-nguyen-lieu.md` có mục §10 nêu ràng buộc bắt buộc khi
cho AI trả lời khách. **Đây là mục quan trọng nhất**, cần bên tích hợp cam kết
tuân thủ:

- Chỉ trả lời dựa trên dữ liệu API cung cấp
- Không bịa tên nguyên liệu, hàm lượng, liều dùng, số CAS
- Không có dữ liệu thì nói rõ, mời liên hệ kinh doanh — **không suy đoán**
- Hỏi giá thì chuyển đội kinh doanh, **không đoán giá**
- Hỏi chữa bệnh thì nêu rõ đây là nguyên liệu, không phải thuốc

Đây là ngành dược phẩm và thực phẩm chức năng. Mô hình bịa một con số hàm lượng
là rủi ro thật cho sức khoẻ người dùng và cho uy tín Bioscope.
