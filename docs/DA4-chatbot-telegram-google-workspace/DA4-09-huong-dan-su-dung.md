<!--HOSO
phu_de: Chatbot Bioscope trên Telegram, Google Drive và Google Sheets
pham_vi: Dự án DA4 — người dùng và quản trị viên
ngay_lap: 03/09/2026
phien_ban: 0.1
nguoi_lap: HungDV — Product Owner, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 0.1 | 03/09/2026 | Hướng dẫn dự thảo theo luồng Telegram và Google Workspace
-->
# DA4 — HƯỚNG DẪN SỬ DỤNG
## Chatbot Bioscope trên Telegram, Google Drive và Google Sheets

*Tài liệu viết theo việc cần làm. Các lệnh ngoài `#hoi` chỉ dùng khi quản trị viên xác nhận mô-đun tương ứng đã được bật.*

---

## 0. Đọc trước khi dùng

### Bot làm gì

- Nhận câu hỏi trên Telegram.
- Tra dữ liệu Google Sheets trong phạm vi bạn được phép xem.
- Diễn giải số liệu bằng AI.
- Xuất bảng CSV và lưu báo cáo vào Google Drive.
- Gửi báo cáo/cảnh báo đã được quản trị viên cấu hình.

### Bot không làm gì

- Không thay bạn phê duyệt quyết định nghiệp vụ.
- Không bảo đảm AI đúng nếu dữ liệu nguồn thiếu hoặc sai.
- Không cho bạn xem mọi sheet chỉ vì bạn dùng được lệnh `#hoi`.
- Không tự chia sẻ báo cáo công khai.
- Không yêu cầu bạn gửi token, API key hoặc mật khẩu trong Telegram.

> **Ba nguyên tắc an toàn:** kiểm tra kỳ và nguồn trong câu trả lời; không chuyển tiếp tệp nhạy cảm cho người không có quyền; nếu số liệu dùng để quyết định quan trọng, đối chiếu lại với sheet nguồn hoặc chủ dữ liệu.

## 1. Bắt đầu

### Bước 1: Mở bot

Mở đúng bot do quản trị viên Bioscope cung cấp. Không tìm và dùng bot có tên gần giống.

### Bước 2: Gửi `/start` hoặc `/hi`

Bot trả một trong ba trạng thái:

| Trạng thái | Bạn làm gì |
| :---- | :---- |
| Đã được cấp quyền | Bấm `/menu` và chọn tác vụ |
| Đang chờ duyệt | Liên hệ quản trị viên, không gửi lại nhiều lần |
| Chưa đăng ký/đã khóa | Gửi chat ID cho quản trị viên theo kênh nội bộ |

### Bước 3: Mở `/menu`

Bạn chỉ thấy chức năng được cấp. Không thấy một nút không có nghĩa hệ thống lỗi; có thể quyền chưa được cấp hoặc mô-đun chưa bật.

## 2. Hỏi dữ liệu

### Cách 1: Dùng `#hoi`

1. Gửi `#hoi` hoặc bấm **🔎 Hỏi dữ liệu**.
2. Chờ bot nhắn: `Hãy đặt câu hỏi về dữ liệu. Gõ /huy để thoát.`
3. Gửi một câu hỏi có đủ **chỉ số + kỳ + phạm vi**.

Ví dụ tốt:

- `Doanh thu thuần tháng 8/2026 theo khu vực là bao nhiêu?`
- `So sánh số đơn tuần này với tuần trước trong phạm vi miền Bắc.`
- `Liệt kê 10 mục có giá trị cao nhất trong quý 3, xuất CSV.`

Ví dụ cần sửa:

| Câu hỏi | Vì sao chưa rõ | Viết lại |
| :---- | :---- | :---- |
| `Doanh thu thế nào?` | Thiếu kỳ, loại doanh thu, phạm vi | `Doanh thu thuần tháng 8 theo khu vực?` |
| `Báo cáo tháng trước` | Thiếu loại báo cáo | `Tạo báo cáo doanh thu tháng trước dạng CSV` |
| `Cho tôi tất cả dữ liệu` | Không có mục đích/phạm vi | Nêu chỉ số và kỳ cụ thể |

### Cách 2: Hỏi trực tiếp

Nếu bạn có quyền Insight, có thể gửi câu hỏi tự nhiên ngay ngoài menu. Nếu bot không nhận, dùng `#hoi` để vào đúng luồng.

### Hỏi tiếp

Trong phiên Insight, bạn có thể hỏi tiếp về cùng dữ liệu. Nếu đổi kỳ hoặc phạm vi, nói rõ lại; không giả định bot vẫn nhớ mọi chi tiết.

### Kết thúc

Gửi `/huy` hoặc bấm **Kết thúc**. Session cũng tự hết hạn sau thời gian quản trị viên cấu hình.

## 3. Đọc câu trả lời

Một câu trả lời đúng mẫu gồm:

1. **Kết quả chính.** Số hoặc nhận định ngắn.
2. **Kỳ/phạm vi.** Khoảng thời gian và phần dữ liệu được đọc.
3. **Nguồn.** Sheet/tập dữ liệu và mốc cập nhật.
4. **Cảnh báo.** Dữ liệu thiếu, context bị giới hạn hoặc giả định.
5. **Tệp/link.** Khi bảng dài hoặc có báo cáo.

Nếu thiếu kỳ, nguồn hoặc phạm vi cho một quyết định quan trọng, hỏi lại trước khi dùng kết quả.

## 4. Xuất CSV

1. Sau kết quả, bấm **Xuất CSV** nếu nút có sẵn; hoặc yêu cầu `xuất CSV` trong câu hỏi.
2. Bot kiểm lại quyền tại thời điểm xuất.
3. Chờ tệp `.csv` được gửi hoặc link Drive được cấp.
4. Mở bằng Excel hoặc Google Sheets.
5. Kiểm tiêu đề cột, kỳ, đơn vị và tổng.

CSV dùng UTF-8 để giữ dấu tiếng Việt. Không sửa rồi nạp ngược vào dữ liệu nghiệp vụ trừ khi có quy trình Import riêng.

## 5. Tạo báo cáo

Chỉ áp dụng khi menu có **📊 Tạo báo cáo**.

1. Gửi `#baocao` hoặc bấm nút.
2. Chọn loại báo cáo.
3. Chọn kỳ: ngày, tuần, tháng hoặc tùy chọn.
4. Chọn phạm vi trong danh sách được phép.
5. Chọn định dạng: tin nhắn, CSV hoặc Google Sheet.
6. Kiểm màn hình xác nhận.
7. Bấm **Tạo báo cáo** một lần.
8. Lưu `requestId` nếu bot báo đang xử lý.

### Kiểm báo cáo

- Kỳ bắt đầu/kết thúc.
- Phạm vi/đơn vị.
- Nguồn và thời điểm cập nhật.
- Đơn vị tiền/tỷ lệ/số lượng.
- Quyền Drive: chỉ người cần xem mới mở được.

Nếu bấm hai lần, hệ thống phải chỉ tạo một báo cáo. Nếu nhận hai bản, báo quản trị viên kèm requestId.

## 6. Phân tích tệp

Chỉ áp dụng khi menu có **📁 Phân tích tệp**.

1. Gửi `#phantich`.
2. Đọc định dạng và kích thước bot cho phép.
3. Xóa dữ liệu cá nhân/secret không cần thiết trước khi gửi.
4. Gửi tệp dưới dạng document, không gửi ảnh chụp nếu cần đọc bảng.
5. Đọc tóm tắt số dòng/cột bot nhận diện.
6. Xác nhận câu hỏi phân tích.
7. Tải kết quả và kiểm nguồn.

Không gửi token, mật khẩu, căn cước, thông tin sức khỏe hoặc dữ liệu bị phân loại “hạn chế”. Excel chỉ dùng khi quản trị viên đã bật Drive Service; nếu chưa, chuyển sang CSV.

## 7. Dashboard

Chỉ áp dụng khi menu có **📈 Tạo dashboard**.

1. Chọn chỉ số, kỳ và phạm vi.
2. Bot tạo Google Sheet/chart trong thư mục Drive DA4.
3. Bot gửi link có quyền phù hợp.
4. Kiểm mốc dữ liệu và quyền truy cập.

Không tự chuyển link sang chế độ “ai có link cũng xem được”. Yêu cầu admin thêm người cụ thể nếu cần cộng tác.

## 8. Cảnh báo tự động

Một cảnh báo hợp lệ phải có:

- Tên chỉ số.
- Giá trị hiện tại.
- Ngưỡng đã vượt.
- Kỳ và phạm vi.
- Nguồn/thời điểm cập nhật.
- Hành động hoặc đầu mối xử lý.

Nếu cùng cảnh báo bị gửi lặp trong thời gian ngắn, chuyển một bản cho admin. Không bấm link lạ ngoài domain Google/Telegram đã thống nhất.

## 9. Tình huống thường gặp

| Bạn thấy | Nguyên nhân có thể | Cách xử lý |
| :---- | :---- | :---- |
| `Bạn chưa được cấp quyền` | Thiếu lệnh hoặc tài khoản không active | Liên hệ admin, nêu chức năng cần dùng |
| `Không đủ dữ liệu` | Thiếu kỳ/cột, sheet chưa cập nhật, ngoài scope | Viết rõ câu hỏi hoặc hỏi chủ dữ liệu |
| Bot không trả lời | Webhook, quota hoặc dịch vụ ngoài lỗi | Chờ ngắn, thử `/start`; báo thời điểm + requestId |
| File không mở được | Tải lỗi/quyền Drive | Tải lại; yêu cầu admin kiểm fileId/quyền |
| XLSX bị từ chối | Chưa bật Drive Service hoặc vượt size | Chuyển CSV, giảm tệp hoặc hỏi admin |
| Số liệu có vẻ sai | Câu hỏi mơ hồ hoặc nguồn chưa cập nhật | Kiểm kỳ/phạm vi/nguồn, đối chiếu sheet |
| Phiên đã hết hạn | Quá TTL | Bắt đầu lại từ `/menu` |
| Nhận hai báo cáo | Khóa chống trùng lỗi | Không dùng cả hai; báo admin kèm requestId |

## 10. Việc không được làm

- Không chia sẻ bot cho người ngoài danh sách.
- Không gửi secret/mật khẩu cho bot.
- Không cố yêu cầu bot “bỏ qua quyền”.
- Không coi output AI là bằng chứng duy nhất cho quyết định quan trọng.
- Không sửa sheet Log/Audit/ProcessedUpdates.
- Không đổi quyền Drive của báo cáo nếu không được phép.
- Không dùng tệp output cũ cho kỳ mới mà không kiểm mốc dữ liệu.

## 11. Dành cho quản trị viên

### 11.1 Cấp quyền người dùng

Trong `Bioscope_Users`:

1. Thêm `chatId` dạng chuỗi.
2. Nhập họ tên, role và dataScope đã duyệt.
3. Nhập `allowed`: `hoi,baocao` hoặc `*` chỉ cho admin.
4. Đặt `status=active`.
5. Ghi `updatedAt`, `updatedBy` nếu schema có.
6. Yêu cầu user gửi `/start` để thử.

### 11.2 Thu hồi quyền

Đặt `status=disabled` hoặc bỏ lệnh/dataScope. Kiểm user bị chặn ở lượt gọi kế tiếp. Với báo cáo Drive đã chia sẻ trước đó, thu hồi quyền file riêng nếu chính sách yêu cầu.

### 11.3 Đổi model

1. Xác minh model slug, giá và chính sách dữ liệu trên OpenRouter.
2. Cập nhật `OPENROUTER_MODEL` trong Script Properties.
3. Chạy ba câu test chuẩn.
4. Kiểm usage và chất lượng.
5. Ghi thay đổi trong nhật ký release.

### 11.4 Kiểm vận hành

- Telegram `getWebhookInfo` không có lỗi tồn.
- Chỉ một trigger `biosDispatch_`.
- `Bioscope_Log` không có lỗi lặp.
- `Bioscope_ProcessedUpdates` và session được dọn.
- Usage/chi phí OpenRouter nằm trong ngân sách.
- User, allowed, dataScope và quyền Drive còn đúng.

### 11.5 Khi nghi lộ key

Thu hồi/xoay key trước. Sau đó dừng hoặc đổi webhook secret, kiểm log/audit, xác định phạm vi, cập nhật property và chạy lại test. Không chỉ xóa dòng log rồi tiếp tục.

## 12. Cần trợ giúp

Khi báo sự cố, gửi:

- Thời điểm theo giờ Việt Nam.
- Lệnh/tác vụ đã dùng.
- RequestId hoặc mã lỗi.
- Ảnh tin nhắn đã che dữ liệu nhạy cảm.
- Tên tệp, không gửi nội dung nhạy cảm nếu chưa được yêu cầu.

Không gửi token, API key, Script Property value hoặc toàn bộ dữ liệu nguồn.

## 13. Tài liệu liên quan

- [Thiết kế luồng](DA4-05-cd2-thiet-ke-giao-dien-va-luong.md)
- [Triển khai và bàn giao](DA4-08-cd5-6-7-dong-goi-trien-khai.md)
- [Sổ tra cứu kỹ thuật](DA4-10-tra-cuu-ky-thuat.md)
