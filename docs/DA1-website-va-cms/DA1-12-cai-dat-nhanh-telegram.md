<!--HOSO
phu_de: Bản rút gọn — chỉ các bước thao tác
pham_vi: Dự án DA1 — người cài đặt
ngay_lap: 14/08/2026
phien_ban: 1.0
nguoi_lap: Dưỡng — Team phát triển, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 14/08/2026 | Ban hành lần đầu
-->
# DA1 — CÀI ĐẶT NHANH TELEGRAM

*Bản rút gọn. Làm đúng thứ tự từ bước 1 đến bước 24.*

*Giải thích chi tiết, lý do và xử lý sự cố: xem `DA1-11-huong-dan-ket-noi-telegram`.*

---

## A · TẠO BOT

| # | Thao tác |
| :----: | :---- |
| 1 | Telegram → tìm **`@BotFather`** → **Start** |
| 2 | Gõ **`/newbot`** |
| 3 | Nhập tên hiển thị, ví dụ `Bioscope Hỗ trợ` |
| 4 | Nhập tên người dùng, phải kết thúc bằng `bot`, ví dụ `bioscope_support_bot` |
| 5 | **Sao chép Bot Token** dạng `8123456789:AAH...` và lưu chỗ an toàn |
| 6 | `/mybots` → chọn bot → **Edit Botpic** → tải logo công ty |
| 7 | `/mybots` → chọn bot → **Bot Settings** → **Group Privacy** → **Turn off** |

> **Bước 7 bắt buộc.** Bỏ qua thì câu trả lời của nhân viên không tới được khách.

---

## B · TẠO NHÓM

| # | Thao tác |
| :----: | :---- |
| 8 | Telegram → **New Group** |
| 9 | Đặt tên, ví dụ `Bioscope — Chat khách hàng` |
| 10 | Thêm nhân viên kinh doanh trực chat |
| 11 | **Add Members** → thêm bot vừa tạo |
| 12 | Thông tin nhóm → **Administrators** → **Add Admin** → chọn bot |
| 13 | Thông tin nhóm → **Edit** → **Topics** → bật |

Quyền cần cấp cho bot ở bước 12: **Gửi tin nhắn** và **Quản lý chủ đề**. Không cấp thêm.

---

## C · LẤY CHAT ID

| # | Thao tác |
| :----: | :---- |
| 14 | Thêm **`@getidsbot`** vào nhóm |
| 15 | Đọc dòng `chat id`, sao chép số — dạng `-100xxxxxxxxxx` |
| 16 | **Xoá `@getidsbot` khỏi nhóm** |

Chat ID đúng luôn **bắt đầu bằng dấu trừ**. Số dương là mã người dùng, không dùng được.

Cách khác — mở trình duyệt:

```
https://api.telegram.org/bot<TOKEN>/getUpdates
```

Tìm `"chat":{"id":-100...}`.

---

## D · CẤU HÌNH VÀO HỆ QUẢN TRỊ

Vào `admin.bioscope.vn` → **Hệ thống** → **Cài đặt Chat**. Cần quyền quản trị viên.

### Thẻ Telegram

| # | Ô nhập | Điền |
| :----: | :---- | :---- |
| 17 | **Bot Token** | Token ở bước 5 |
| 18 | **Chat ID nhóm sales** | Chat ID ở bước 15 |
| 19 | **Khoá webhook** | Chuỗi ngẫu nhiên — sinh bằng lệnh dưới |

```bash
openssl rand -hex 32
```

### Thẻ Giao diện chat

| # | Ô nhập | Điền |
| :----: | :---- | :---- |
| 20 | **Tiêu đề khung chat** | Cả tiếng Việt và tiếng Anh |
| 21 | **Lời nhắn ngoài giờ** | Cả hai ngôn ngữ |

### Thẻ Câu chào

| # | Ô nhập | Hiện ở đâu |
| :----: | :---- | :---- |
| 22 | **① Nội dung bóng chào** | Bong bóng cạnh nút chat |
| | **Hiện sau (giây)** | Đề xuất `5` |
| | **Chỉ hiện một lần mỗi lượt truy cập** | Bật |
| | **② Chào khi khách CHƯA đăng nhập** | Trong khung chat, kèm nút Đăng nhập |
| | **③ Chào SAU khi đăng nhập** | Tin đầu tiên trong khung chat |

Bấm **Lưu**.

---

## E · KIỂM TRA VÀ BẬT

| # | Thao tác | Kết quả cần thấy |
| :----: | :---- | :---- |
| 23 | Bấm **Kiểm tra kết nối Telegram** | `✓ Bot @...`<br>`✓ Nhóm "..." đã bật Topics`<br>`✓ Đã đăng ký webhook → ...` |
| 24 | Bật ô **Bật live chat trên website** → **Lưu** | Khung chat hiện trên `bioscope.vn` |

**Chỉ bật bước 24 sau khi bước 23 đủ ba dấu ✓.**

---

## F · CHẠY THỬ

| # | Thao tác | Kết quả cần thấy |
| :----: | :---- | :---- |
| 1 | Mở `bioscope.vn`, đăng nhập tài khoản khách | Khung chat hiện ở góc |
| 2 | Gõ một tin thử | |
| 3 | Mở nhóm Telegram | Thẻ giới thiệu khách + tin vừa gửi |
| 4 | Trả lời trong Telegram | |
| 5 | Quay lại trang web | Câu trả lời hiện trong khung chat |

---

## G · LỖI THƯỜNG GẶP

| Lỗi | Sửa |
| :---- | :---- |
| `Chưa có Bot Token` | Điền ô Bot Token |
| `Chưa có Chat ID nhóm sales` | Điền ô Chat ID |
| `Token sai` | Lấy lại token từ `@BotFather` |
| `Không đọc được nhóm` | Bước 11, 12 — bot vào nhóm chưa, đã là admin chưa; Chat ID có dấu trừ đầu không |
| `Thiếu PAYLOAD_PUBLIC_SERVER_URL` | Báo kỹ thuật đặt biến môi trường này |
| `Đăng ký webhook lỗi` | Địa chỉ hệ quản trị phải truy cập được từ Internet qua HTTPS |
| Khung chat không hiện trên web | Bước 24 |
| Tin khách sang nhóm, nhân viên trả lời khách không nhận | **Bước 7** |
| Nhóm chưa bật Topics, khách không nhận trả lời | Nhân viên phải bấm **Reply** vào tin của bot |

---

## H · CÁCH NHÂN VIÊN TRẢ LỜI

| Nhóm | Cách làm |
| :---- | :---- |
| **Có Topics** | Mở chủ đề của khách → gõ bình thường |
| **Không Topics** | **Bấm Reply vào tin của bot** → rồi mới gõ |

Gửi được cho khách: ảnh, tệp, video, tin thoại.

Xem lại hội thoại cũ: `admin.bioscope.vn` → **Hội thoại**.

---

## DANH SÁCH KIỂM TRA

| # | Việc | Xong |
| :----: | :---- | :----: |
| 1 | Tạo bot, lưu Bot Token | ☐ |
| 2 | Đặt logo cho bot | ☐ |
| 3 | **Tắt Group Privacy** | ☐ |
| 4 | Tạo nhóm, thêm nhân viên | ☐ |
| 5 | Thêm bot vào nhóm | ☐ |
| 6 | **Cấp quyền admin cho bot** | ☐ |
| 7 | **Bật Topics** | ☐ |
| 8 | Lấy Chat ID, xoá bot phụ trợ | ☐ |
| 9 | Điền Bot Token, Chat ID, Khoá webhook | ☐ |
| 10 | Điền tiêu đề, lời nhắn ngoài giờ, ba câu chào | ☐ |
| 11 | **Kiểm tra kết nối — đủ ba dấu ✓** | ☐ |
| 12 | **Bật live chat** | ☐ |
| 13 | Chạy thử đủ 5 bước phần F | ☐ |
| 14 | Hướng dẫn nhân viên cách trả lời | ☐ |

Ba mục **3**, **6**, **7** hay quên nhất.
