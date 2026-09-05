<!--HOSO
phu_de: Chatbot Bioscope trên Telegram, Google Drive và Google Sheets
pham_vi: Dự án DA4 — hồ sơ thiết kế trước triển khai
ngay_lap: 03/09/2026
phien_ban: 0.1
nguoi_lap: HungDV — Product Owner, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 0.1 | 03/09/2026 | Dự thảo ban đầu từ Bioscope Build Guide
-->
# DA4 — THUYẾT MINH SẢN PHẨM
## Chatbot Bioscope trên Telegram, Google Drive và Google Sheets

---

> **Trạng thái hồ sơ:** tài liệu thiết kế trước triển khai. Những mục ghi “cần xác nhận” hoặc “đề xuất” chưa phải bằng chứng hệ thống đã vận hành.

## 0. Hai bên trong dự án

| | **Bên thực hiện** | **Bên thụ hưởng** |
| :---- | :---- | :---- |
| Công ty | **OPTIMAI** | **Bioscope** |
| Vai trò | Phân tích, thiết kế, lập trình, kiểm thử, đóng gói, triển khai, bàn giao | Đặt hàng, cung cấp yêu cầu nghiệp vụ, nghiệm thu, vận hành |

Đội thực hiện và ma trận phân công theo công đoạn: `00-ho-so-chung/00-1-thuyet-minh-nang-luc-va-doi-ngu.md` mục 3 và 4.

Quan hệ hợp đồng, bàn giao và quyền sở hữu: `00-ho-so-chung/00-7-hop-dong-ban-giao-va-quyen-so-huu.md`.

> **DA4 chưa thuộc phạm vi bàn giao.** Dự án đang ở giai đoạn thiết kế trước triển khai, chưa có bằng chứng mã nguồn. Không đưa vào phụ lục nghiệm thu cho tới khi hoàn thành.

---

## 1. Tên và định vị sản phẩm

**Tên đầy đủ:** Hệ thống trợ lý truy vấn, phân tích và báo cáo Bioscope qua Telegram

**Tên rút gọn:** Bioscope Bot

**Mã hồ sơ:** DA4

**Định vị:** trợ lý nội bộ thiên về **truy vấn, phân tích và báo cáo**. Người dùng đặt câu hỏi hoặc chọn tác vụ trên Telegram; hệ thống đọc dữ liệu được phép từ Google Sheets, tạo báo cáo trong Google Drive và dùng mô hình ngôn ngữ qua OpenRouter để diễn giải kết quả.

DA4 không thay thế DA3. DA3 là BioBot đa kênh có kiến trúc nhiều dịch vụ. DA4 là một sản phẩm riêng, chỉ dùng Telegram làm kênh hội thoại và Google Apps Script làm môi trường chạy, nhằm giảm chi phí hạ tầng và thời gian dựng bản đầu.

## 2. Vấn đề sản phẩm giải quyết

| Hiện trạng | Hệ quả | Cách DA4 xử lý |
| :---- | :---- | :---- |
| Dữ liệu vận hành nằm trong nhiều bảng tính | Nhân viên phải mở nhiều tệp, lọc và cộng thủ công | Hỏi bằng ngôn ngữ tự nhiên hoặc dùng lệnh có cấu trúc ngay trên Telegram |
| Báo cáo lặp lại được làm thủ công | Chậm, dễ lệch công thức và khó truy vết | Sinh báo cáo theo mẫu, lưu tệp vào thư mục Drive được chỉ định |
| Không có một điểm vào thống nhất | Người dùng phải biết tệp và cột nào chứa dữ liệu | Bot định tuyến yêu cầu tới mô-đun nghiệp vụ phù hợp |
| Quyền truy cập phụ thuộc việc chia sẻ tệp | Có nguy cơ đọc nhầm dữ liệu ngoài phạm vi | Lọc người dùng, lệnh và phạm vi dữ liệu trước khi dựng ngữ cảnh AI |
| Việc nhắc báo cáo/cảnh báo phụ thuộc con người | Bỏ sót mốc hoặc phản ứng chậm | Dispatcher chạy định kỳ để gửi báo cáo và cảnh báo theo cấu hình |

## 3. Người dùng

| Nhóm | Nhu cầu chính | Quyền dự kiến |
| :---- | :---- | :---- |
| Ban giám đốc | Xem số liệu tổng hợp, báo cáo kỳ, cảnh báo | Toàn bộ lệnh và phạm vi dữ liệu được phê duyệt |
| Nhân viên nghiệp vụ | Hỏi dữ liệu trong phạm vi công việc, xuất bảng | Danh sách lệnh và tập dữ liệu theo vai trò |
| Quản trị viên | Cấp quyền, cấu hình mô hình, xử lý lỗi, triển khai | Quản trị Script Properties, Sheets, Drive và Telegram webhook |
| Hệ thống định thời | Gửi báo cáo/cảnh báo không cần người dùng khởi tạo | Chỉ các tác vụ đã khai báo trong Dispatcher |

Số lượng người dùng, danh sách vai trò và phạm vi dữ liệu thực tế **cần được chủ dự án xác nhận trước khi viết mô-đun nghiệp vụ**.

## 4. Phạm vi chức năng

### 4.1 Phạm vi bắt buộc của bản đầu

| # | Chức năng | Kết quả người dùng nhận được |
| :----: | :---- | :---- |
| 1 | Bot Telegram riêng | Nhận tin nhắn, lệnh và thao tác nút |
| 2 | Đăng ký và phân quyền | Chỉ tài khoản có trong `Bioscope_Users` được dùng chức năng được cấp |
| 3 | Hỏi dữ liệu bằng `#hoi` hoặc câu tự nhiên | Câu trả lời ngắn, có số liệu từ tập dữ liệu được phép |
| 4 | Đọc Google Sheets | Dựng ngữ cảnh từ bảng nghiệp vụ đã cấu hình |
| 5 | Gọi AI qua OpenRouter | Chọn mô hình bằng cấu hình, không sửa mã nguồn |
| 6 | Xuất CSV | Bot gửi tệp CSV UTF-8 khi câu trả lời cần bảng |
| 7 | Lưu tệp vào Google Drive | Báo cáo và tệp xuất nằm trong thư mục gốc của DA4 |
| 8 | Nhật ký lỗi | Lỗi được ghi vào `Bioscope_Log`, không chứa khóa bí mật |
| 9 | Dispatcher | Dọn phiên quá hạn và làm nền cho báo cáo/cảnh báo định kỳ |
| 10 | Triển khai webhook | Telegram gửi update vào Web App `doPost(e)` |

### 4.2 Mô-đun mở rộng

| Mô-đun | Lệnh | Trạng thái hồ sơ |
| :---- | :---- | :---- |
| Insight | `#hoi` | Bắt buộc, có thiết kế mẫu trong Build Guide |
| Report | `#baocao` | Đề xuất, cần chốt mẫu và kỳ báo cáo |
| Alert | Tự động | Đề xuất, cần chốt ngưỡng và người nhận |
| Import & Analyze | `#phantich` | Đề xuất, cần bật Advanced Drive Service nếu đọc Excel |
| Dashboard | `#dashboard` | Đề xuất, cần chốt cấu trúc bảng và biểu đồ |

### 4.3 Ngoài phạm vi bản đầu

- Kênh Zalo, Messenger, WhatsApp, thư điện tử hoặc khung chat web.
- Cơ sở dữ liệu riêng, máy chủ riêng, hàng đợi phân tán hoặc kho vectơ.
- Tự động quyết định nghiệp vụ có hậu quả tài chính/pháp lý mà không có người duyệt.
- Đọc mọi tệp Drive của công ty. Bot chỉ được làm việc trong thư mục và bảng tính đã cấp.
- Cam kết chạy thời gian thực liên tục như một máy chủ chuyên dụng.

## 5. Kiến trúc sản phẩm

```
Người dùng Telegram
        │ tin nhắn / callback
        ▼
Telegram Bot API
        │ webhook HTTPS
        ▼
Google Apps Script Web App
  doPost → router → intercept theo mô-đun
        │             │
        │             ├── Google Sheets: người dùng, cấu hình, log, dữ liệu
        │             ├── Google Drive: báo cáo và tệp xuất
        │             └── OpenRouter: mô hình ngôn ngữ
        ▼
Tin nhắn / CSV / liên kết báo cáo trả về Telegram

Time-driven trigger → biosDispatch_ → timeout / báo cáo / cảnh báo
```

## 6. Ngăn xếp kỹ thuật

| Thành phần | Lựa chọn | Vai trò |
| :---- | :---- | :---- |
| Runtime | Google Apps Script V8 | Chạy webhook, tác vụ định kỳ và tích hợp Google Workspace |
| Giao diện | Telegram Bot API | Tin nhắn, nút inline, callback và gửi tệp |
| Dữ liệu | Google Sheets | Người dùng, cấu hình, nhật ký và dữ liệu nghiệp vụ |
| Tệp | Google Drive | Lưu báo cáo, CSV/XLSX và tệp người dùng gửi |
| AI | OpenRouter Chat Completions | Gọi mô hình tương thích định dạng OpenAI |
| Trạng thái phiên | Script Properties | Lưu JSON ngắn hạn theo `chatId` |
| Định thời | Apps Script time-driven trigger | Chạy `biosDispatch_` mỗi 5 phút |

Giá trị model mặc định trong Build Guide là `anthropic/claude-sonnet-4.5`. Tên model, giá và khả năng cung cấp thay đổi theo thời gian; quản trị viên phải kiểm tra lại trên OpenRouter trước khi triển khai.

## 7. Nguyên tắc thiết kế

1. **Tách bot và dữ liệu.** DA4 dùng token Telegram, spreadsheet và thư mục Drive riêng.
2. **Cấu hình thay vì hard-code.** Khóa, ID và model nằm trong Script Properties; tham số nghiệp vụ nằm trong sheet `Config`.
3. **Mỗi tính năng là một intercept.** Hàm `fn(chatId, msg, u) -> boolean` trả `true` khi đã xử lý.
4. **Quyền được kiểm trước khi đọc dữ liệu.** Không chỉ kiểm quyền lệnh; bộ dựng ngữ cảnh phải lọc từng dòng/cột theo vai trò.
5. **AI không phải nguồn dữ liệu.** AI chỉ diễn giải dữ liệu đã được bộ lọc cung cấp và phải nói rõ khi không đủ dữ liệu.
6. **Mọi tác vụ ghi phải chống lặp.** Telegram có thể gửi lại webhook; báo cáo và cảnh báo phải có khóa chống trùng.
7. **Lỗi một mô-đun không làm sập toàn bộ Dispatcher.** Mỗi scan chạy qua `bcSafe_`.

## 8. Giá trị do OPTIMAI tạo ra

Các dịch vụ Google, Telegram và OpenRouter là nền tảng đầu vào. Phần mềm DA4 do **đội ngũ OPTIMAI** thiết kế và triển khai, gồm:

- Router và hợp đồng mô-đun.
- Luồng hội thoại, callback, menu và session.
- Phân quyền lệnh và phân vùng dữ liệu.
- Bộ dựng ngữ cảnh cho từng loại dữ liệu nghiệp vụ.
- Logic báo cáo, cảnh báo, nhập tệp và dashboard.
- Cơ chế chống lặp, timeout, ghi log, theo dõi chi phí và bảo trì.
- Bộ cấu hình, bảng dữ liệu, hướng dẫn triển khai và bộ ca kiểm thử.

Build Guide cho phép tái dùng khung đã kiểm chứng từ Biochat, nhưng **việc tái dùng không đồng nghĩa DA4 đã có mã nguồn hoàn chỉnh**. Hồ sơ lập trình phải cập nhật đường dẫn và bằng chứng ghi nhận thay đổi sau khi đội OPTIMAI thực sự dựng project Apps Script.

## 9. Tiêu chí thành công cấp sản phẩm

| Mã | Chỉ số | Mục tiêu dự thảo | Cách đo |
| :---- | :---- | :---- | :---- |
| SP-01 | Câu hỏi được trả lời từ đúng phạm vi dữ liệu | 100% trong bộ ca quyền | Bộ kiểm thử phân quyền |
| SP-02 | Không gửi trùng báo cáo/cảnh báo | 0 bản trùng trong kiểm thử webhook lặp | Nhật ký gửi và khóa chống trùng |
| SP-03 | Không lộ khóa bí mật trong log/tệp xuất | 0 trường hợp | Quét log và rà mã nguồn |
| SP-04 | Truy vấn mẫu hoàn tất | Ngưỡng cần xác nhận sau đo tải | Nhật ký thời gian đầu-cuối |
| SP-05 | Báo cáo có thể truy vết về dữ liệu nguồn | 100% báo cáo | Metadata kỳ, sheet, thời điểm và người yêu cầu |

Các ngưỡng về thời gian phản hồi, số người dùng đồng thời, hạn mức chi phí và thời gian lưu log chưa có trong Build Guide. Tài liệu yêu cầu ghi chúng là điểm cần xác nhận, không tự đặt số giả.

## 10. Sản phẩm bàn giao dự kiến

| Nhóm | Thành phần |
| :---- | :---- |
| Mã nguồn | Project Apps Script gồm lõi, webhook, menu, dispatcher và mô-đun nghiệp vụ |
| Cấu hình | Danh sách Script Properties; cấu trúc spreadsheet; quyền Drive |
| Triển khai | Web App `/exec`, Telegram webhook và trigger 5 phút |
| Dữ liệu | Spreadsheet cấu hình, spreadsheet nghiệp vụ, thư mục Drive DA4 |
| Tài liệu | 10 tài liệu DA4 từ thuyết minh đến sổ tra cứu kỹ thuật |
| Bằng chứng | Lịch sử commit/export Apps Script, log chạy thử, biên bản UAT và biên bản bàn giao |

## 11. Trạng thái và việc cần chốt

| Nội dung | Trạng thái ngày 03/09/2026 |
| :---- | :---- |
| Build Guide | Đã có |
| Bộ hồ sơ yêu cầu và thiết kế | Dự thảo v0.1 |
| Project Apps Script DA4 | Chưa có bằng chứng trong phạm vi tài liệu được cung cấp |
| Bot Telegram riêng | Cần xác nhận |
| Spreadsheet cấu hình và nghiệp vụ | Cần xác nhận |
| Thư mục Drive gốc | Cần xác nhận |
| Mô-đun Insight | Có mẫu thiết kế, chưa có bằng chứng triển khai |
| Report, Alert, Import, Dashboard | Chưa chốt phạm vi chi tiết |
| Kiểm thử và nghiệm thu | Chưa thực hiện |
| Phát hành | Chưa thực hiện |

## 12. Nguồn lập hồ sơ

- `Bioscope_BuildGuide (1).md`, 754 dòng, do người dùng cung cấp.
- Cấu trúc 10 tài liệu của DA1, DA2 và DA3 trong thư mục `docs/`.
- Không dùng số liệu vận hành hoặc bằng chứng từ DA3 để suy diễn cho DA4.

## 13. Tài liệu liên quan

- [DA4-02 — Xác định yêu cầu](DA4-02-cd1-xac-dinh-yeu-cau.md)
- [DA4-03 — Thiết kế kiến trúc](DA4-03-cd2-thiet-ke-kien-truc.md)
- [DA4-09 — Hướng dẫn sử dụng](DA4-09-huong-dan-su-dung.md)
- [DA4-10 — Sổ tra cứu kỹ thuật](DA4-10-tra-cuu-ky-thuat.md)
