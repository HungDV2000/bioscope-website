<!--HOSO
phu_de: Kết nối khung chat website với Telegram
pham_vi: Dự án DA1 — quản trị viên và nhân viên kinh doanh
ngay_lap: 14/08/2026
phien_ban: 1.1
nguoi_lap: QuanNH — Team Lead, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 14/08/2026 | Ban hành lần đầu
lich_su: 1.1 | 03/09/2026 | Bổ sung phần xử lý sự cố và bảng phân biệt hai chế độ nhóm
-->
# DA1 — HƯỚNG DẪN KẾT NỐI TELEGRAM
## Tạo bot · Tạo nhóm · Cấu hình chat vào website

*Tài liệu thao tác. Làm theo đúng thứ tự từ Phần A đến Phần D là chạy được.*

---

## 0. Đọc trước — hệ thống này hoạt động thế nào

```
   Khách trên bioscope.vn
          │ gõ tin trong khung chat
          ↓
   Website  ──chuyển tiếp──►  Hệ quản trị
                                   │
                                   │ đẩy sang Telegram
                                   ↓
                          Nhóm Telegram của sales
                                   │
                          Nhân viên trả lời NGAY TRONG TELEGRAM
                                   │
                                   ↓
                          Câu trả lời hiện lại cho khách trên web
```

### Ba điều cần hiểu trước khi làm

> **① Người trả lời là NHÂN VIÊN, không phải AI.**
>
> Đây là hệ thống **chat trực tuyến bắc cầu**, không phải chatbot tự động. Khách gõ gì, nhân viên đọc và trả lời nấy. Không có câu trả lời nào do máy sinh ra.
>
> *(Trợ lý AI là hệ thống riêng — xem bộ hồ sơ DA3.)*

> **② Nhân viên không cần mở hệ quản trị.**
>
> Chỉ cần dùng Telegram như bình thường trên điện thoại hoặc máy tính. Đây là lý do chọn Telegram: nhân viên kinh doanh đã dùng nó hằng ngày.

> **③ Khách phải đăng nhập mới chat được.**
>
> Cố ý thiết kế như vậy: biết khách là ai thì nhân viên mới tư vấn đúng, và tránh người lạ gửi tin rác vào nhóm nội bộ.

---

# PHẦN A — TẠO BOT TELEGRAM

Bot là "người đưa tin" giữa website và nhóm nhân viên. Mỗi công ty cần **một bot riêng**.

## A1. Các bước

| Bước | Việc làm |
| :---- | :---- |
| 1 | Mở Telegram, tìm tài khoản **`@BotFather`** — tài khoản có dấu tích xanh xác minh |
| 2 | Bấm **Start** |
| 3 | Gõ lệnh **`/newbot`** |
| 4 | BotFather hỏi **tên hiển thị** — nhập tên khách sẽ thấy, ví dụ `Bioscope Hỗ trợ` |
| 5 | BotFather hỏi **tên người dùng** — phải kết thúc bằng `bot`, ví dụ `bioscope_support_bot` |
| 6 | BotFather trả về **Bot Token** — chuỗi dài dạng `8123456789:AAH...` |
| 7 | **Sao chép token, lưu chỗ an toàn** |

## A2. Bot Token là bí mật quan trọng nhất

> ### ⚠ Ai có Bot Token thì điều khiển được bot
>
> Người cầm token có thể đọc mọi tin trong nhóm, gửi tin giả danh công ty, và lấy tệp khách gửi.
>
> | Không được | Nên |
> | :---- | :---- |
> | Gửi token qua tin nhắn thường | Bàn giao trực tiếp |
> | Chép token vào tài liệu dùng chung | Nhập thẳng vào hệ quản trị |
> | Chụp màn hình có token | Che phần sau dấu hai chấm |
>
> **Lỡ lộ token thì làm gì:** vào `@BotFather` → `/mybots` → chọn bot → **API Token** → **Revoke current token**. Token cũ mất hiệu lực ngay, rồi cập nhật token mới vào hệ quản trị.

## A3. Tuỳ chọn nên đặt thêm

Vẫn trong `@BotFather`, gõ `/mybots` → chọn bot vừa tạo:

| Lệnh | Đặt gì | Vì sao |
| :---- | :---- | :---- |
| **Edit Botpic** | Ảnh đại diện — dùng logo công ty | Nhân viên nhận ra ngay tin nào của hệ thống |
| **Edit Description** | Mô tả ngắn | |
| **Edit About** | Giới thiệu | |
| **Group Privacy** → **Turn off** | **Tắt chế độ riêng tư nhóm** | **Bắt buộc.** Xem A4 |

## A4. Bắt buộc: tắt chế độ riêng tư nhóm

```
/mybots → chọn bot → Bot Settings → Group Privacy → Turn off
```

**Vì sao bắt buộc.** Mặc định Telegram chỉ cho bot đọc những tin **nhắc thẳng tên bot**. Nhân viên trả lời khách bằng cách gõ bình thường, không nhắc tên bot — nên bot sẽ **không đọc được câu trả lời** và khách không nhận được gì.

Triệu chứng khi quên bước này: **tin của khách sang được nhóm, nhưng câu trả lời của nhân viên không về tới khách.** Đây là lỗi hay gặp nhất khi cài đặt lần đầu.

---

# PHẦN B — TẠO NHÓM TELEGRAM CHO NHÂN VIÊN

## B1. Tạo nhóm

| Bước | Việc làm |
| :---- | :---- |
| 1 | Telegram → menu → **New Group** |
| 2 | Đặt tên, ví dụ `Bioscope — Chat khách hàng` |
| 3 | Thêm các nhân viên kinh doanh sẽ trực chat |
| 4 | Tạo xong, mở nhóm → **Add Members** → thêm **bot vừa tạo** |
| 5 | Mở thông tin nhóm → **Administrators** → **Add Admin** → chọn bot |

## B2. Bot phải là quản trị viên của nhóm

Không cấp quyền quản trị thì bot không đọc được tin và không tạo được chủ đề riêng cho từng khách.

**Quyền tối thiểu cần cấp:**

| Quyền | Bắt buộc | Dùng để |
| :---- | :----: | :---- |
| Gửi tin nhắn | ✅ | Đẩy tin khách vào nhóm |
| Quản lý chủ đề *(Manage Topics)* | ✅ nếu bật Topics | Tạo chủ đề riêng cho mỗi khách |
| Xoá tin nhắn | Không | |
| Chặn thành viên | Không | |
| Thêm quản trị viên | Không | |

Nguyên tắc: **cấp vừa đủ, không cấp dư.**

## B3. Bật Topics — nên làm

```
Thông tin nhóm → Edit → Topics → bật
```

**Topics** là chức năng chia nhóm thành nhiều chủ đề song song. Bật lên thì **mỗi khách có một chủ đề riêng**.

### So sánh hai chế độ

| | **Có Topics** *(khuyến nghị)* | **Không Topics** |
| :---- | :---- | :---- |
| Mỗi khách | Một chủ đề riêng | Tất cả chung một dòng tin |
| Nhân viên trả lời bằng cách | Gõ bình thường trong chủ đề đó | **Phải bấm Reply vào đúng tin của bot** |
| Nhiều khách cùng lúc | Không lẫn | Dễ lẫn |
| Nhân viên quên thao tác đúng | Không có gì để quên | **Quên Reply là tin không tới khách** |
| Tìm lại hội thoại cũ | Dễ | Khó |

Hệ thống **hỗ trợ cả hai**, nhưng không bật Topics thì mọi nhân viên phải nhớ luôn bấm **Reply** — và trong lúc bận thì rất dễ quên.

> **Nhóm phải là nhóm thường, không phải kênh.** Kênh (Channel) chỉ một chiều, không dùng được.

## B4. Lấy Chat ID của nhóm

Hệ quản trị cần **Chat ID** — mã số của nhóm. Có ba cách:

### Cách 1 — Dùng bot phụ trợ *(dễ nhất)*

| Bước | Việc làm |
| :---- | :---- |
| 1 | Thêm `@getidsbot` hoặc `@RawDataBot` vào nhóm |
| 2 | Bot in ra thông tin nhóm, tìm dòng `chat id` |
| 3 | Sao chép số đó |
| 4 | **Xoá bot phụ trợ khỏi nhóm ngay sau khi lấy xong** |

Bước 4 không được bỏ — không để bot lạ ở lại trong nhóm nội bộ.

### Cách 2 — Đọc trực tiếp từ Telegram

| Bước | Việc làm |
| :---- | :---- |
| 1 | Gửi một tin bất kỳ vào nhóm |
| 2 | Mở trình duyệt, vào địa chỉ:<br>`https://api.telegram.org/bot<TOKEN>/getUpdates` |
| 3 | Tìm `"chat":{"id":-100...}` |

Thay `<TOKEN>` bằng Bot Token thật.

### Cách 3 — Từ Telegram bản web

Mở nhóm trên `web.telegram.org`, lấy số trong địa chỉ và thêm tiền tố `-100`.

### Nhận dạng Chat ID đúng

| Dạng | Nghĩa |
| :---- | :---- |
| `-1001234567890` | ✅ Nhóm — **đúng cái cần** |
| `-1234567890` | Nhóm cũ chưa nâng cấp, vẫn dùng được |
| `1234567890` *(số dương)* | ❌ Đây là mã người dùng, **không phải nhóm** |

**Chat ID của nhóm luôn bắt đầu bằng dấu trừ.**

---

# PHẦN C — CẤU HÌNH VÀO HỆ QUẢN TRỊ

## C1. Vào màn hình cấu hình

```
admin.bioscope.vn  →  Hệ thống  →  Cài đặt Chat
```

**Chỉ quản trị viên sửa được.** Biên tập viên xem được nhưng không sửa.

## C2. Thẻ Telegram

| Ô nhập | Điền gì | Biến môi trường thay thế |
| :---- | :---- | :---- |
| **Bot Token** | Token từ Phần A | `TELEGRAM_BOT_TOKEN` |
| **Chat ID nhóm sales** | Chat ID từ Phần B4, dạng `-100...` | `TELEGRAM_SALES_CHAT_ID` |
| **Khoá webhook** | Chuỗi ngẫu nhiên tự đặt — xem C3 | `TELEGRAM_WEBHOOK_SECRET` |

> **Bỏ trống ô nào thì hệ thống lấy từ biến môi trường tương ứng.**
>
> Hai đường, chọn một. Đặt trong hệ quản trị thì đổi bot hoặc đổi nhóm ngay trên giao diện, không cần kỹ thuật viên và không cần triển khai lại. Đặt trong biến môi trường thì bí mật không nằm trong cơ sở dữ liệu.
>
> Chú thích nguyên văn trong mã nguồn:
>
> *"botToken lưu trong DB (chỉ admin đọc/sửa) — đánh đổi để cấu hình được ngay trong admin. Ai không muốn để trong DB thì bỏ trống ô này và đặt TELEGRAM_BOT_TOKEN trong .env."*

## C3. Khoá webhook — nên đặt

Khoá webhook là chuỗi bí mật để hệ thống biết tin đến **thật sự từ Telegram**, không phải kẻ giả mạo.

Sinh một chuỗi ngẫu nhiên:

```bash
openssl rand -hex 32
```

Dán kết quả vào ô **Khoá webhook**.

**Không đặt thì sao.** Hệ thống vẫn chạy, nhưng bất kỳ ai biết địa chỉ webhook đều gửi tin giả vào được — tin giả sẽ hiện ra cho khách như thể nhân viên công ty gửi. **Nên đặt.**

## C4. Bật chat

Trên cùng màn hình có ô **Bật live chat trên website**.

| Trạng thái | Kết quả |
| :---- | :---- |
| Tắt *(mặc định)* | Khung chat **ẩn hẳn** khỏi website |
| Bật | Khung chat hiện ở góc màn hình |

**Chỉ bật sau khi đã kiểm tra kết nối ở Phần D thành công.** Bật trước mà kết nối chưa xong thì khách gõ tin nhưng không ai nhận được.

---

# PHẦN D — KIỂM TRA KẾT NỐI

## D1. Bấm nút kiểm tra

Vẫn ở thẻ **Telegram**, có nút **Kiểm tra kết nối Telegram**. Bấm nút này — hệ thống tự làm ba việc và báo kết quả từng bước.

## D2. Ba bước hệ thống kiểm

| # | Bước | Đạt thì hiện | Kiểm điều gì |
| :---- | :---- | :---- | :---- |
| 1 | **Bot** | `✓ Bot @tên_bot` | Token đúng, bot còn sống |
| 2 | **Nhóm** | `✓ Nhóm "tên nhóm"…` | Chat ID đúng, bot đã vào nhóm và là quản trị viên |
| 3 | **Webhook** | `✓ Đã đăng ký webhook → …` | Telegram biết gửi tin về đâu |

**Bước 3 hệ thống tự đăng ký webhook**, không phải làm tay. Địa chỉ webhook là:

```
<địa chỉ hệ quản trị>/api/telegram/webhook
```

## D3. Đọc kết quả bước 2

Bước 2 cho biết nhóm có bật Topics hay không:

| Thông báo | Nghĩa |
| :---- | :---- |
| `✓ Nhóm "..." đã bật Topics — mỗi khách một topic riêng.` | Chế độ tốt nhất |
| `✓ Nhóm "..." (không bật Topics) — sales trả lời bằng cách REPLY vào tin của bot.` | Chạy được, nhưng nhân viên **phải nhớ bấm Reply** |

## D4. Bảng lỗi và cách xử lý

| Thông báo lỗi | Nguyên nhân | Cách xử lý |
| :---- | :---- | :---- |
| `Chưa có Bot Token` | Chưa điền token, chưa đặt biến môi trường | Điền ô Bot Token |
| `Chưa có Chat ID nhóm sales` | Chưa điền Chat ID | Điền ô Chat ID |
| `Token sai: ...` | Token gõ thiếu ký tự, hoặc đã bị thu hồi | Lấy lại token từ `@BotFather` |
| `Không đọc được nhóm (bot đã vào nhóm + là admin?)` | Bot chưa vào nhóm, **hoặc chưa là quản trị viên**, hoặc Chat ID sai | Kiểm ba thứ: bot có trong nhóm chưa, đã cấp quyền admin chưa, Chat ID có dấu trừ đầu không |
| `Thiếu PAYLOAD_PUBLIC_SERVER_URL để đăng ký webhook` | Máy chủ chưa khai địa chỉ công khai | Báo kỹ thuật đặt biến này |
| `Đăng ký webhook lỗi: ...` | Địa chỉ hệ quản trị chưa truy cập được từ Internet, hoặc chưa có kết nối mã hoá | **Telegram chỉ gửi tin về địa chỉ HTTPS truy cập được từ ngoài.** Kiểm tên miền và chứng chỉ |

## D5. Chạy thử toàn tuyến

Ba bước đều đạt thì thử thật:

| Bước | Việc làm | Mong đợi |
| :---- | :---- | :---- |
| 1 | Mở `bioscope.vn`, đăng nhập một tài khoản khách | Khung chat hiện ở góc |
| 2 | Gõ một tin thử | |
| 3 | Mở nhóm Telegram | **Thấy thẻ giới thiệu khách + tin vừa gửi** |
| 4 | Trả lời trong Telegram | |
| 5 | Quay lại trang web | **Câu trả lời hiện trong khung chat** |

Bước 3 không thấy gì → xem D4. Bước 5 không thấy gì → **gần như chắc chắn quên tắt chế độ riêng tư nhóm ở A4**.

---

# PHẦN E — NHÂN VIÊN LÀM VIỆC HẰNG NGÀY

## E1. Thẻ giới thiệu khách

Khi khách bắt đầu chat, hệ thống gửi vào nhóm một thẻ giới thiệu **trước** tin của khách:

| Thông tin | Ví dụ |
| :---- | :---- |
| Loại khách | Doanh nghiệp / Cá nhân |
| Tên, công ty | Nếu khách đã khai |
| Vị trí ước lượng | Thành phố, quốc gia — suy từ địa chỉ mạng |
| Thiết bị | Điện thoại hay máy tính, trình duyệt |
| Nguồn truy cập | Khách đến từ đâu |
| Trang bắt đầu chat | Khách đang xem gì lúc bấm chat |

**Đọc thẻ này trước khi trả lời.** Nó cho biết đang nói chuyện với ai và họ quan tâm gì — không phải hỏi lại từ đầu.

## E2. Trả lời

| Chế độ nhóm | Cách trả lời |
| :---- | :---- |
| **Có Topics** | Mở chủ đề của khách, gõ bình thường |
| **Không Topics** | **Bấm Reply vào tin của bot**, rồi mới gõ |

> ### ⚠ Nhóm không bật Topics: quên Reply là tin KHÔNG tới khách
>
> Hệ thống dựa vào thao tác Reply để biết câu trả lời thuộc về khách nào. Gõ thẳng không Reply thì hệ thống không map được và **bỏ qua tin đó** — khách ngồi chờ mà không biết.
>
> Đây là lý do nên bật Topics.

## E3. Gửi ảnh và tệp

Nhân viên gửi được cho khách: **ảnh, tệp, video, tin thoại**. Gửi như bình thường trong Telegram, khách nhận được trên web.

## E4. Xem lại hội thoại cũ

```
admin.bioscope.vn → Hội thoại
```

Xem được toàn bộ nội dung và thông tin ngữ cảnh của mọi hội thoại, kể cả hội thoại đã cũ.

---

# PHẦN F — GIAO DIỆN VÀ CÂU CHÀO

## F1. Thẻ Giao diện chat

| Ô | Nội dung | Đa ngữ |
| :---- | :---- | :----: |
| **Tiêu đề khung chat** | Dòng chữ trên đầu khung chat | ✅ |
| **Lời nhắn ngoài giờ** | Câu hiện khi ngoài giờ làm việc | ✅ |

## F2. Thẻ Câu chào — ba câu khác nhau

Hệ thống có **ba câu chào ở ba thời điểm**, đừng nhầm lẫn:

| # | Câu chào | Hiện ở đâu | Khi nào |
| :---- | :---- | :---- | :---- |
| **①** | Bóng chào | Bong bóng nhỏ cạnh nút chat | Khách chưa mở khung chat |
| **②** | Chào khi chưa đăng nhập | Trong khung chat, kèm nút Đăng nhập | Khách mở chat nhưng chưa đăng nhập |
| **③** | Chào sau khi đăng nhập | Trong khung chat | Ngay trước khi khách gõ câu đầu tiên |

Câu ② và ③ soạn bằng **trình soạn thảo có định dạng** — chữ đậm, danh sách, liên kết đều dùng được, và hiện ra **đúng như lúc soạn**.

## F3. Cấu hình bóng chào

| Ô | Ý nghĩa |
| :---- | :---- |
| **Hiện bóng câu chào** | Bật/tắt |
| **Hiện sau (giây)** | Chờ bao lâu rồi mới bật. `0` = hiện ngay |
| **Chỉ hiện một lần mỗi lượt truy cập** | Khách đã tắt bóng chào thì không làm phiền lại |

**Nên bật mục cuối.** Bóng chào bật lại liên tục là cách nhanh nhất khiến khách khó chịu.

---

# PHẦN G — XỬ LÝ SỰ CỐ

| Dấu hiệu | Nguyên nhân thường gặp | Cách xử lý |
| :---- | :---- | :---- |
| **Khung chat không hiện trên web** | Chưa bật live chat | Cài đặt Chat → bật ô trên cùng |
| **Tin khách không sang Telegram** | Kết nối chưa xong | Bấm **Kiểm tra kết nối**, đọc bước nào hỏng |
| **Nhân viên trả lời, khách không nhận được** | **Chưa tắt chế độ riêng tư nhóm** | Xem A4 — lỗi phổ biến nhất |
| Như trên, nhóm không bật Topics | Nhân viên **quên bấm Reply** | Xem E2; nên bật Topics |
| **Tin sang chậm, dồn một lúc** | Hàng đợi AI đang xử lý tệp lớn, chạy chung tiến trình | Hạn chế chạy sinh nội dung hàng loạt giờ cao điểm — xem `DA1-10` SC-11 |
| **Chỉ một số khách sang được nhóm** | Vượt ngưỡng chống lạm dụng | Ngưỡng: 5 hội thoại / 10 phút / địa chỉ |
| **Khách gửi nhiều tin bị chặn** | Vượt ngưỡng tin nhắn | Ngưỡng: 20 tin / phút / địa chỉ |
| **Bot ngừng hoạt động đột ngột** | Token bị thu hồi, hoặc bot bị xoá khỏi nhóm | Kiểm tra kết nối; cấp lại token nếu cần |
| **Nhóm bị xoá chủ đề của khách** | Topic đã xoá | Hệ thống tự xử lý, tin về chung nhóm |
| **Nhận tin lạ không phải của khách** | Có người gửi giả vào webhook | **Đặt Khoá webhook** — xem C3 |

## G1. Kiểm nhanh bằng lệnh

```bash
# Bot còn sống không
curl -s "https://api.telegram.org/bot<TOKEN>/getMe"

# Webhook đang trỏ đâu, có lỗi gì không
curl -s "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

Lệnh thứ hai hữu ích nhất: nó trả về **lần lỗi gần nhất và nguyên nhân**, thường chỉ thẳng ra vấn đề.

```bash
# Nhật ký hệ quản trị, lọc phần chat
docker compose logs --tail=200 cms | grep -i "telegram\|chat"
```

---

# PHẦN H — BẢO MẬT

## H1. Ba bí mật phải giữ

| Bí mật | Lộ thì sao | Lưu ở đâu |
| :---- | :---- | :---- |
| **Bot Token** | Điều khiển được bot, đọc mọi tin, giả danh công ty | Hệ quản trị *(chỉ admin)* hoặc biến môi trường |
| **Chat ID nhóm** | Ít nghiêm trọng, nhưng không nên công bố | Như trên |
| **Khoá webhook** | Gửi được tin giả cho khách | Như trên |

## H2. Các lớp bảo vệ đã có sẵn

| Lớp | Cơ chế |
| :---- | :---- |
| Xác thực webhook | Khoá bí mật ở đầu yêu cầu — tin không có khoá đúng bị từ chối |
| Chống lạm dụng | 5 hội thoại/10 phút, 20 tin/phút, 60 lượt tải tệp/phút — tính theo địa chỉ |
| Bắt buộc đăng nhập | Khách phải đăng nhập mới chat được |
| Kiểm chủ sở hữu hội thoại | Tệp đính kèm phải **thuộc đúng hội thoại** của khách đó |
| Không lộ địa chỉ nội bộ | Trình duyệt gọi qua website, không gọi thẳng hệ quản trị |

> **Về việc kiểm chủ sở hữu hội thoại** — chú thích nguyên văn trong mã nguồn:
>
> *"Chỉ dựa vào token là không đủ: token nằm trong localStorage của trình duyệt và không mất khi đăng xuất. Trên máy dùng chung (văn phòng, quán net), người đăng nhập sau sẽ đọc được nguyên hội thoại của người trước."*
>
> Vì vậy mọi thao tác đều kiểm thêm danh tính thành viên do website đính kèm.

## H3. Việc định kỳ

| Việc | Tần suất |
| :---- | :---- |
| Rà soát thành viên trong nhóm Telegram | Hàng quý |
| Gỡ nhân viên đã nghỉ khỏi nhóm | **Ngay trong ngày nghỉ việc** |
| Kiểm bot còn hoạt động | Hàng tháng — bấm Kiểm tra kết nối |
| Đổi Bot Token nếu nghi ngờ lộ | Khi cần |

## H4. Dữ liệu cá nhân

Hội thoại lưu **tên, thư điện tử, địa chỉ mạng, vị trí ước lượng, thiết bị** của khách.

| Quy tắc | Nội dung |
| :---- | :---- |
| Ai xem được | Chỉ nhân viên công ty |
| Không được | Sao chép ra ngoài hệ thống |
| Không được | Chia sẻ ảnh chụp màn hình hội thoại ra ngoài |
| Chính sách | Phải nêu trong chính sách bảo mật của website |

---

# PHỤ LỤC — DANH SÁCH KIỂM TRA CÀI ĐẶT

| # | Việc | Xong |
| :---- | :---- | :----: |
| 1 | Tạo bot qua `@BotFather`, lưu Bot Token | ☐ |
| 2 | Đặt ảnh đại diện bot bằng logo công ty | ☐ |
| 3 | **Tắt chế độ riêng tư nhóm** *(Group Privacy → Turn off)* | ☐ |
| 4 | Tạo nhóm Telegram, thêm nhân viên trực chat | ☐ |
| 5 | Thêm bot vào nhóm | ☐ |
| 6 | **Cấp quyền quản trị viên cho bot** | ☐ |
| 7 | **Bật Topics cho nhóm** | ☐ |
| 8 | Lấy Chat ID, kiểm có dấu trừ đầu | ☐ |
| 9 | Điền Bot Token vào hệ quản trị | ☐ |
| 10 | Điền Chat ID vào hệ quản trị | ☐ |
| 11 | Sinh và điền Khoá webhook | ☐ |
| 12 | **Bấm Kiểm tra kết nối — cả ba bước đạt** | ☐ |
| 13 | Soạn ba câu chào ①②③, cả hai ngôn ngữ | ☐ |
| 14 | Đặt tiêu đề khung chat và lời nhắn ngoài giờ | ☐ |
| 15 | **Bật live chat trên website** | ☐ |
| 16 | **Chạy thử toàn tuyến** theo mục D5 | ☐ |
| 17 | Hướng dẫn nhân viên cách đọc thẻ giới thiệu và cách trả lời | ☐ |

**Mục 3, 6, 7 là ba mục hay quên nhất** — và cả ba đều gây ra lỗi khó đoán nguyên nhân.
