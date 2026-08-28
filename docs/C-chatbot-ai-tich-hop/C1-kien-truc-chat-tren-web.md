# C1 — HỆ THỐNG CHAT TRÊN WEBSITE

> Nguồn: `dv-cms/apps/core-cms/src/endpoints/chat.ts`,
> `globals/ChatSettings.ts`, `collections/ChatConversations.ts`, `ChatMessages.ts`,
> `apps/bioscope-frontend/src/components/chat/`

Đây là hệ thống chat **do Bioscope tự phát triển**, chạy trên website. Khác với
chatbot Telegram của bên thứ ba — phân định ở [C3](C3-ranh-gioi-trach-nhiem.md).

---

## 1. Cách hoạt động

```
Khách trên bioscope.vn
        │
        ▼
   Widget chat  ──────► core-cms  ──────► Telegram
                            │         (mỗi khách = 1 chủ đề riêng)
                            │                  │
                            ▼                  ▼
                       PostgreSQL         Nhân viên kinh doanh
                    (lưu toàn bộ)          trả lời trong Telegram
```

Nhân viên kinh doanh **không cần vào admin**. Họ ngồi trong nhóm Telegram, mỗi
khách là một chủ đề riêng, trả lời như nhắn tin bình thường. Câu trả lời quay
ngược về widget của khách.

---

## 2. Vì sao dùng Telegram Topics

Nhóm Telegram bật **Topics**: mỗi phiên chat của khách là một chủ đề riêng
trong nhóm.

| Ưu điểm | |
|---|---|
| Không lẫn hội thoại | Mỗi khách một luồng, nhiều nhân viên trực cùng lúc không rối |
| Không cần công cụ mới | Nhân viên dùng Telegram sẵn có |
| Có lịch sử ngay trong Telegram | Đọc lại được cả luồng |

**Yêu cầu bắt buộc:** nhóm Telegram phải bật Topics. Endpoint
`/api/chat/telegram-setup` hỗ trợ thiết lập ban đầu.

Có xử lý trường hợp **chủ đề bị xoá**: hệ thống tự tạo lại thay vì báo lỗi cho khách.

---

## 3. Chín endpoint

| Endpoint | Việc |
|---|---|
| `GET /api/chat/config` | Widget lấy cấu hình: bật/tắt, câu chào, tiêu đề |
| `POST /api/chat/start` | Mở phiên mới, tạo chủ đề Telegram, ghi dữ liệu theo dõi |
| `POST /api/chat/message` | Khách gửi tin |
| `GET /api/chat/poll` | Widget hỏi tin mới từ nhân viên |
| `GET /api/chat/history` | **Tải lại toàn bộ lịch sử** khi khách quay lại |
| `POST /api/chat/file` | Khách gửi tệp |
| `POST /api/telegram/webhook` | Telegram đẩy tin nhân viên về |
| `POST /api/chat/contact` | Gửi thông tin liên hệ |
| `POST /api/chat/telegram-setup` | Thiết lập nhóm Telegram |

### Vì sao có cả `poll` và `history`

`poll` chỉ trả tin **mới** từ nhân viên và hệ thống — dùng để cập nhật liên tục.

`history` trả **toàn bộ** hội thoại — dùng khi khách tải lại trang. Trước đây
chỉ có `poll`, nên tải lại trang là khung chat trống trơn dù dữ liệu vẫn còn.

---

## 4. Bắt buộc đăng nhập

Khách **phải đăng nhập** mới chat được.

| Lý do | |
|---|---|
| Biết đang nói chuyện với ai | Kinh doanh tư vấn đúng ngữ cảnh |
| Giữ được lịch sử | Khách quay lại thấy hội thoại cũ |
| Chống rác | Không ai gửi hàng loạt vô danh |

Bấm chat khi chưa đăng nhập thì hiện **popup đăng ký/đăng nhập ngay tại trang**,
không chuyển trang. Popup mở từ chat hiển thị **câu chào riêng** do quản trị
soạn, khác với khi mở từ nút tài khoản trên header.

### Phiên chat khi quay lại

Khách đăng nhập rồi quay lại thì phiên chat **vẫn còn**, lịch sử tải lại đầy đủ.

Nút "Xoá lịch sử trò chuyện" chỉ **ẩn phía máy khách** — dữ liệu vẫn còn trong
admin để kinh doanh tra cứu. Cần nói rõ điều này trong chính sách quyền riêng tư.

---

## 5. Hai câu chào

Quản trị soạn riêng, bằng trình soạn thảo có định dạng:

| Câu chào | Xuất hiện khi |
|---|---|
| **Bóng chào** (`bubbleMessage`) | Nổi lên cạnh nút chat sau vài giây khách vào web |
| **Câu chào trong khung** (`welcomeMessage`) | Khách mở khung chat |
| **Câu chào màn đăng nhập** (`loginGreeting`) | Popup đăng nhập mở **từ chat** |

Tuỳ chọn kèm theo: độ trễ hiện bóng chào, chỉ hiện một lần mỗi phiên.

Câu chào giữ **đúng định dạng** quản trị soạn — dòng trống ngăn khổ, căn lề,
chữ đậm nghiêng đều được giữ nguyên.

---

## 6. Dữ liệu theo dõi

⚠️ Mức thu thập **chi tiết**. Danh sách đầy đủ ở
[B6](../B-he-thong-website/B6-bao-mat-quyen-rieng-tu.md) mục 3.

Tóm tắt: định danh khách, địa chỉ IP và nhà mạng, vị trí tới **toạ độ địa lý**,
cấu hình thiết bị và trình duyệt, hành vi duyệt web trước khi chat.

Mục đích: kinh doanh biết khách ở đâu, quan tâm gì, vào từ nguồn nào.

**Nghĩa vụ pháp lý đi kèm** — xem [B6](../B-he-thong-website/B6-bao-mat-quyen-rieng-tu.md) mục 4.

---

## 7. Tin nhắn

| Người gửi | Ý nghĩa |
|---|---|
| `visitor` | Khách |
| `agent` | Nhân viên kinh doanh |
| `system` | Hệ thống — câu chào, thông báo |

Đính kèm hỗ trợ: ảnh, tệp, tin thoại, video. Hai chiều.

---

## 8. Cấu hình trong admin

**Admin → Hệ thống → Cài đặt chat**

| Nhóm | Nội dung |
|---|---|
| Bật/tắt | Tắt là widget biến mất khỏi web |
| Telegram | 🔒 Bot token, chat id nhóm, khoá bí mật webhook |
| Giao diện | Tiêu đề widget, thông báo ngoài giờ |
| Câu chào | Ba câu chào ở mục 5, độ trễ, tần suất |

Sửa xong có hiệu lực ngay, không cần triển khai lại.

---

## 9. Vấn đề đã biết

| Vấn đề | Trạng thái |
|---|---|
| Tin nhắn Telegram đôi lúc đến theo cụm | Nghi do xử lý PDF bằng AI chặn vòng lặp sự kiện. **Chưa xử lý** — cần tách xử lý PDF ra tiến trình riêng |
| Chưa có quy định thời hạn lưu dữ liệu chat | Cần quyết định nghiệp vụ, xem [B6](../B-he-thong-website/B6-bao-mat-quyen-rieng-tu.md) |
