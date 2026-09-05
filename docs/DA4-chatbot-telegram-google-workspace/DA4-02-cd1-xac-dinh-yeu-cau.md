<!--HOSO
phu_de: Chatbot Bioscope trên Telegram, Google Drive và Google Sheets
pham_vi: Dự án DA4 — Công đoạn 1, dự thảo chờ phê duyệt
ngay_lap: 03/09/2026
phien_ban: 0.1
nguoi_lap: HungDV — Product Owner, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc OPTIMAI và đại diện Công ty Bioscope
lich_su: 0.1 | 03/09/2026 | Dự thảo yêu cầu từ Bioscope Build Guide
-->
# DA4 — CÔNG ĐOẠN 1: XÁC ĐỊNH YÊU CẦU
## Chatbot Bioscope trên Telegram, Google Drive và Google Sheets

---

> **Mức độ xác nhận:** các yêu cầu lõi lấy từ Build Guide. Phạm vi dữ liệu nghiệp vụ, vai trò, biểu mẫu báo cáo, ngưỡng cảnh báo và SLA phải được chủ dự án duyệt trước khi lập trình.

## 1. Bối cảnh

Bioscope đang dùng Google Drive và Google Sheets làm nơi lưu tài liệu, bảng số liệu và dữ liệu vận hành. Việc truy vấn và lập báo cáo yêu cầu người dùng biết đúng tệp, đúng sheet, đúng cột và đúng công thức. DA4 tạo một điểm vào trên Telegram để người dùng hỏi, nhận phân tích, yêu cầu báo cáo và nhận cảnh báo mà không cần mở nhiều bảng tính.

Hệ thống cần dựng nhanh, không vận hành máy chủ riêng và tái dùng khung platform đã có từ Biochat. Vì vậy Google Apps Script V8 được chọn làm runtime; Sheets/Drive là kho dữ liệu; Telegram là giao diện; OpenRouter là cổng gọi AI.

## 2. Bên liên quan

| Mã | Bên liên quan | Trách nhiệm |
| :---- | :---- | :---- |
| BLQ-01 | Ban giám đốc | Phê duyệt phạm vi dữ liệu, chỉ số, báo cáo và ngưỡng cảnh báo |
| BLQ-02 | Chủ dữ liệu nghiệp vụ | Xác nhận sheet nguồn, từ điển cột, chất lượng và quyền truy cập |
| BLQ-03 | Người dùng nghiệp vụ | Thử câu hỏi, xác nhận tính đúng và khả năng sử dụng |
| BLQ-04 | Quản trị viên | Cấu hình bot, Apps Script, Drive, Sheets, OpenRouter và quyền |
| BLQ-05 | Đội phát triển | Viết lõi, mô-đun, kiểm thử, triển khai và lưu bằng chứng |

## 3. Yêu cầu nghiệp vụ

| Mã | Yêu cầu | Nguồn | Ưu tiên |
| :---- | :---- | :---- | :---- |
| NV-01 | Người dùng hỏi dữ liệu bằng tiếng Việt trên Telegram | Build Guide §1, §11 | Bắt buộc |
| NV-02 | Câu trả lời dùng đúng dữ liệu người dùng được phép xem | Build Guide §9, §11 | Bắt buộc |
| NV-03 | Người dùng có thể nhận bảng kết quả dưới dạng tệp | Build Guide §7.5, §12 | Bắt buộc |
| NV-04 | Quản trị viên đổi model và tham số mà không sửa mã | Build Guide §1, §4 | Bắt buộc |
| NV-05 | Hệ thống chạy không cần máy chủ riêng | Build Guide §1, §3 | Bắt buộc |
| NV-06 | Có thể mở rộng bằng mô-đun độc lập | Build Guide §6, §14 | Bắt buộc |
| NV-07 | Có báo cáo định kỳ và cảnh báo theo cấu hình | Build Guide §10, §12 | Nên có |
| NV-08 | Tệp do bot tạo được lưu có tổ chức trên Drive | Build Guide §4, §8 | Bắt buộc |
| NV-09 | Lỗi được truy vết nhưng không lộ khóa bí mật | Build Guide §7.8, §15 | Bắt buộc |
| NV-10 | Mọi thao tác ghi/gửi chịu được webhook lặp | Build Guide §15 | Bắt buộc |

## 4. Yêu cầu chức năng

### 4.1 Tiếp nhận và định tuyến

| Mã | Yêu cầu | Tiêu chí chính |
| :---- | :---- | :---- |
| YC-01 | Web App nhận Telegram update qua `doPost(e)` | Update hợp lệ được parse và chuyển cho `processUpdate_` |
| YC-02 | Router xử lý callback trước tin nhắn thường | Callback được định tuyến theo namespace |
| YC-03 | Mỗi mô-đun có hàm intercept trả boolean | `true` dừng chuỗi; `false` chuyển mô-đun sau |
| YC-04 | `/huy` và `/cancel` thoát mọi phiên | Session đang mở được xóa và người dùng nhận xác nhận |
| YC-05 | `/hi`, `/menu` và nhãn nút mở menu | Bàn phím phù hợp quyền được hiển thị |
| YC-06 | Lệnh không biết được trả hướng dẫn | Không im lặng và không chuyển nhầm sang AI |

### 4.2 Người dùng và phân quyền

| Mã | Yêu cầu | Tiêu chí chính |
| :---- | :---- | :---- |
| YC-07 | Tra người dùng theo `chatId` | Chỉ dùng một bản ghi khớp trong `Bioscope_Users` |
| YC-08 | Từ chối người dùng chưa đăng ký hoặc không `active` | Không đọc dữ liệu, không gọi AI |
| YC-09 | `allowed='*'` cấp mọi lệnh cho admin | Chỉ áp dụng cho tài khoản còn hoạt động |
| YC-10 | User thường chỉ dùng lệnh liệt kê trong `allowed` | So khớp không phân biệt dấu/hoa thường |
| YC-11 | Câu hỏi tự nhiên phải qua cùng kiểm quyền như `#hoi` | Không được dùng fallback để vượt quyền |
| YC-12 | Dữ liệu đưa vào AI được lọc theo vai trò/phạm vi | Không chỉ kiểm tên lệnh ở lớp giao diện |

### 4.3 Insight và AI

| Mã | Yêu cầu | Tiêu chí chính |
| :---- | :---- | :---- |
| YC-13 | `#hoi` mở phiên hỏi dữ liệu | Bot nhắc nhập câu hỏi và cách hủy |
| YC-14 | Câu hỏi tự nhiên đủ điều kiện có thể vào Insight | Có quyền, có ít nhất 4 ký tự và có khoảng trắng |
| YC-15 | Bộ dựng ngữ cảnh đọc dữ liệu từ `OPS_SHEET_ID` | Sheet và cột nguồn được cấu hình rõ |
| YC-16 | Ngữ cảnh có giới hạn kích thước | Không mặc định gửi toàn bộ workbook cho AI |
| YC-17 | AI được gọi qua OpenRouter Chat Completions | Gửi `model`, `messages`, `max_tokens` và Bearer key |
| YC-18 | Lỗi AI trả thông báo an toàn | Không lộ response thô, key hoặc dữ liệu nhạy cảm |
| YC-19 | AI không được bịa số liệu khi nguồn không có | Trả “không đủ dữ liệu” và nêu phạm vi đã kiểm |
| YC-20 | Câu trả lời dài được chia theo giới hạn Telegram | Không làm hỏng toàn bộ lượt gửi |
| YC-21 | Nội dung gửi với HTML phải được escape hoặc dùng plain text | Dữ liệu/AI không thể phá parse mode |

### 4.4 Tệp, Drive và Google Sheets

| Mã | Yêu cầu | Tiêu chí chính |
| :---- | :---- | :---- |
| YC-22 | Tách khối `[[FILE name="..."]]...[[/FILE]]` | Chỉ tên tệp an toàn, loại tệp được cho phép |
| YC-23 | CSV có BOM UTF-8 | Mở trong Excel không lỗi dấu tiếng Việt |
| YC-24 | Tệp sinh được lưu vào `BIOSCOPE_ROOT_FOLDER_ID` | Có metadata người yêu cầu, thời gian, nguồn |
| YC-25 | Bot gửi tệp hoặc liên kết Drive theo quyền | Không bật link-sharing rộng hơn nhu cầu |
| YC-26 | Tệp Telegram tải về được kiểm tra loại và kích thước | Từ chối tệp vượt ngưỡng hoặc định dạng không hỗ trợ |
| YC-27 | Đọc Excel chỉ khi Advanced Drive Service được bật | Nếu chưa bật, bot hướng dẫn hoặc chỉ nhận CSV/TXT |
| YC-28 | Ghi Google Sheets có khóa khi có nguy cơ tranh chấp | Dùng `LockService` cho append/update quan trọng |

### 4.5 Báo cáo, cảnh báo và Dispatcher

| Mã | Yêu cầu | Tiêu chí chính |
| :---- | :---- | :---- |
| YC-29 | `biosDispatch_` chạy mỗi 5 phút | Một trigger hoạt động, không tạo trùng trigger |
| YC-30 | Mỗi scan được bọc bằng `bcSafe_` | Một scan lỗi không chặn scan khác |
| YC-31 | Session hết hạn được dọn | Có trường `t`, TTL mặc định 30 phút hoặc theo cấu hình |
| YC-32 | Báo cáo kỳ chỉ gửi cho người nhận được cấu hình | Kỳ, mẫu, phạm vi và người nhận có thể truy vết |
| YC-33 | Cảnh báo chỉ gửi khi vượt ngưỡng đã duyệt | Có chống gửi trùng theo mốc/người nhận |
| YC-34 | Dispatcher tôn trọng quota Apps Script | Có giới hạn số việc mỗi lượt và cơ chế tiếp tục |

### 4.6 Nhật ký và quản trị

| Mã | Yêu cầu | Tiêu chí chính |
| :---- | :---- | :---- |
| YC-35 | Tạo tự động `Bioscope_Users` và `Bioscope_Log` | Header đúng khi sheet chưa tồn tại |
| YC-36 | Ghi lỗi với thời gian, mức, nơi, mô tả | Mô tả được cắt độ dài và không chứa secret |
| YC-37 | Ghi audit cho truy vấn nhạy cảm và tệp xuất | Ai, khi nào, lệnh, phạm vi, trạng thái |
| YC-38 | Quản trị viên có thể thu hồi quyền tức thời | Lần gọi sau bị từ chối, không cần deploy lại |

## 5. Yêu cầu phi chức năng

| Mã | Nhóm | Yêu cầu |
| :---- | :---- | :---- |
| YCP-01 | Bảo mật | Token và API key chỉ ở Script Properties; không xuất hiện trong mã, log hoặc tài liệu thật |
| YCP-02 | Bảo mật | Webhook dùng secret token của Telegram hoặc cơ chế xác thực tương đương; không chỉ dựa vào URL khó đoán |
| YCP-03 | Riêng tư | Chỉ gửi sang OpenRouter phần dữ liệu tối thiểu cần cho câu hỏi |
| YCP-04 | Tin cậy | Mọi thao tác có side effect phải idempotent trước update lặp |
| YCP-05 | Tin cậy | Lỗi mạng tạm thời có retry giới hạn và backoff; lỗi vĩnh viễn dừng rõ ràng |
| YCP-06 | Hiệu năng | Đặt timeout và giới hạn context; ngưỡng cụ thể xác nhận sau đo thử |
| YCP-07 | Khả dụng | Tin nhắn lỗi nói người dùng nên làm gì tiếp theo |
| YCP-08 | Bảo trì | Tên hàm, namespace callback, prefix session và tên sheet theo một quy ước |
| YCP-09 | Quan sát | Có correlation/update ID để nối webhook, AI, tệp và báo cáo trong log |
| YCP-10 | Chi phí | Có giới hạn chi tiêu OpenRouter và theo dõi model/usage theo lượt gọi |
| YCP-11 | Tương thích | Múi giờ `Asia/Ho_Chi_Minh`; ngày lưu dạng `yyyy-MM-dd` |
| YCP-12 | Tuân thủ | Chính sách lưu log, dữ liệu cá nhân và quyền chia sẻ Drive phải được chủ dữ liệu duyệt |

## 6. Quy tắc nghiệp vụ

| Mã | Quy tắc |
| :---- | :---- |
| QT-01 | `chatId` không có trong `Bioscope_Users` hoặc `status != active` không được truy vấn dữ liệu |
| QT-02 | Kiểm quyền thực hiện trước khi đọc sheet và trước khi gọi AI |
| QT-03 | `allowed='*'` là quyền đặc biệt; mọi giá trị khác là danh sách lệnh phân tách bằng dấu phẩy |
| QT-04 | Mỗi namespace callback thuộc đúng một mô-đun và callback data không vượt 64 byte |
| QT-05 | Session phải có `step`, `t` và phiên bản schema nếu luồng có thể thay đổi |
| QT-06 | File do AI đề nghị chỉ được tạo khi tên và định dạng qua danh sách trắng |
| QT-07 | Báo cáo/cảnh báo cùng khóa nghiệp vụ không được gửi lặp trong một chu kỳ |
| QT-08 | Không dùng câu trả lời AI làm đầu vào ghi dữ liệu nghiệp vụ nếu chưa có kiểm tra/duyệt phù hợp |

## 7. Tiêu chí nghiệm thu bản đầu

| Mã | Tiêu chí | Bằng chứng cần lưu |
| :---- | :---- | :---- |
| NT-01 | `/hi`, `/menu`, `#hoi`, `/huy` chạy end-to-end | Video hoặc ảnh chụp + log |
| NT-02 | User không quyền không thể hỏi bằng lệnh hoặc fallback tự nhiên | Kết quả ca kiểm thử âm |
| NT-03 | Câu hỏi mẫu trả đúng số từ sheet mẫu đã chốt | Bảng đối chiếu expected/actual |
| NT-04 | CSV tiếng Việt mở đúng trong Excel/Sheets | Tệp kết quả mẫu |
| NT-05 | Tệp báo cáo nằm đúng thư mục và đúng quyền chia sẻ | ID/link và ảnh quyền truy cập |
| NT-06 | Gửi lại cùng Telegram update không tạo bản ghi/tệp/tin trùng | Log idempotency |
| NT-07 | Key không xuất hiện trong source, log và tệp xuất | Kết quả quét secret |
| NT-08 | AI, Telegram hoặc Sheets lỗi riêng không làm Web App trả lỗi dây chuyền | Log thử nghiệm chịu lỗi |
| NT-09 | Dispatcher chỉ có một trigger và dọn được session hết hạn | Ảnh trigger + log |
| NT-10 | Quản trị viên thay model qua cấu hình và bot dùng model mới | Log model trước/sau đã che key |

## 8. Phạm vi loại trừ

- Không tuyên bố DA4 đã hoàn thành chỉ từ Build Guide.
- Không dùng các con số mã nguồn, commit, hiệu năng hoặc người dùng của DA3 cho DA4.
- Không cam kết model cụ thể luôn tồn tại trên OpenRouter.
- Không đưa dữ liệu doanh nghiệp thật vào bộ test nếu chưa ẩn danh và phê duyệt.
- Không tự động chia sẻ tệp Drive công khai.

## 9. Rủi ro đầu vào

| Mã | Rủi ro | Tác động | Xử lý dự kiến |
| :---- | :---- | :---- | :---- |
| RR-01 | Sheet nghiệp vụ chưa có từ điển dữ liệu | AI hiểu sai cột | Chốt data dictionary trước module Insight |
| RR-02 | Fallback tự nhiên bỏ qua quyền | Rò dữ liệu | Bắt buộc dùng cùng authorization guard |
| RR-03 | Web App công khai nhận request giả | Lạm dụng/bị tính phí | Xác minh secret token và update ID |
| RR-04 | AI trả HTML lỗi | Telegram từ chối gửi | Escape nội dung hoặc dùng plain text |
| RR-05 | Apps Script hết quota/thời gian chạy | Bỏ dở báo cáo | Chia lô, checkpoint, cảnh báo quota |
| RR-06 | Session trong Script Properties không có TTL tự nhiên | Luồng treo | Ghi `t`, quét timeout, cho phép `/huy` |
| RR-07 | Dùng link-sharing rộng | Lộ tệp báo cáo | Quyền tối thiểu, nhóm người dùng cụ thể |
| RR-08 | OpenRouter model/giá thay đổi | Lỗi hoặc vượt chi phí | Model cấu hình, ngân sách và cảnh báo |

## 10. Câu hỏi cần phê duyệt trước lập trình

1. Danh sách vai trò và từng tập dữ liệu được xem là gì?
2. `OPS_SHEET_ID` có những sheet, cột, khóa và quy tắc tính nào?
3. Ba câu hỏi nghiệp vụ quan trọng nhất của bản đầu là gì?
4. Báo cáo nào bắt buộc, kỳ nào, người nhận nào, định dạng nào?
5. Ngưỡng cảnh báo và thời gian im lặng sau khi đã cảnh báo là bao lâu?
6. Có cho phép dữ liệu nhạy cảm đi qua OpenRouter không; nếu có, phần nào?
7. Thời gian lưu log, transcript, tệp tải lên và tệp báo cáo là bao lâu?
8. Ngưỡng chi phí/tháng và model ưu tiên là gì?
9. Ai là người phê duyệt UAT và quyền Drive?
10. DA4 dùng Apps Script project độc lập hay chung project khác?

## 11. Truy vết

- Kiến trúc đáp ứng YC-01–YC-38: [DA4-03](DA4-03-cd2-thiet-ke-kien-truc.md)
- Mô hình dữ liệu: [DA4-04](DA4-04-cd2-thiet-ke-du-lieu.md)
- Bộ ca kiểm thử cho NT-01–NT-10: [DA4-07](DA4-07-cd4-kiem-thu-va-uat.md)
- Cấu hình và xử lý sự cố: [DA4-10](DA4-10-tra-cuu-ky-thuat.md)
