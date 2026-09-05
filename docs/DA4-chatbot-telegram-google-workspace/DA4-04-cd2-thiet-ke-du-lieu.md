<!--HOSO
phu_de: Chatbot Bioscope trên Telegram, Google Drive và Google Sheets
pham_vi: Dự án DA4 — Công đoạn 2, thiết kế dữ liệu dự thảo
ngay_lap: 03/09/2026
phien_ban: 0.1
nguoi_lap: Quân — Team phát triển, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 0.1 | 03/09/2026 | Thiết kế dữ liệu nền từ Bioscope Build Guide
-->
# DA4 — CÔNG ĐOẠN 2: THIẾT KẾ DỮ LIỆU
## Chatbot Bioscope trên Telegram, Google Drive và Google Sheets

---

> Các bảng `Bioscope_Users` và `Bioscope_Log` có trong Build Guide. Các bảng còn lại dưới đây là **thiết kế nền đề xuất** để DA4 có thể vận hành, kiểm toán và chống gửi trùng; chủ dự án cần duyệt trước khi tạo dữ liệu thật.

## 1. Bốn vùng dữ liệu

| Vùng | Công nghệ | Nội dung | Tính bền vững |
| :---- | :---- | :---- | :---- |
| Cấu hình hệ thống | Script Properties | Secret, ID tài nguyên, model, session nhỏ | Bền trong project; có giới hạn dung lượng |
| Điều khiển và audit | `BIOSCOPE_SHEET_ID` | Users, Config, Log, lịch, khóa chống trùng, tệp | Bền, dễ kiểm tra |
| Dữ liệu nghiệp vụ | `OPS_SHEET_ID` | Các bảng nguồn mà Insight/Report/Alert truy vấn | Bền; schema do chủ dữ liệu xác nhận |
| Tệp | `BIOSCOPE_ROOT_FOLDER_ID` | Report, export, upload | Bền; quyền Drive riêng |

## 2. Script Properties

### 2.1 Khóa cấu hình cố định

| Key | Bắt buộc | Bí mật | Kiểu/định dạng | Ý nghĩa |
| :---- | :----: | :----: | :---- | :---- |
| `BIOSCOPE_TOKEN` | ✅ | ✅ | chuỗi token Telegram | Gọi Telegram Bot API |
| `TELEGRAM_WEBHOOK_SECRET` | ✅ đề xuất | ✅ | chuỗi ngẫu nhiên | Xác minh webhook |
| `OPENROUTER_API_KEY` | ✅ | ✅ | chuỗi khóa | Gọi OpenRouter |
| `OPENROUTER_MODEL` | ✅ | | model slug | Model đang dùng |
| `OPENROUTER_SITE` | | | URL HTTPS | Nhận diện site trên OpenRouter |
| `OPENROUTER_APP` | | | chuỗi ngắn | Tên ứng dụng trên OpenRouter |
| `BIOSCOPE_SHEET_ID` | ✅ | | Google spreadsheet ID | Kho cấu hình/audit |
| `OPS_SHEET_ID` | ✅ | | Google spreadsheet ID | Kho dữ liệu nghiệp vụ |
| `BIOSCOPE_ADMIN_ID` | ✅ | Dữ liệu cá nhân | Telegram chat ID | Quản trị viên chính |
| `BIOSCOPE_ROOT_FOLDER_ID` | ✅ | | Google Drive folder ID | Thư mục tệp DA4 |
| `SESSION_TTL_MINUTES` | | | số nguyên, mặc định 30 | Hết hạn session |
| `AI_MAX_CONTEXT_ROWS` | | | số nguyên dương | Trần số dòng đưa vào context |
| `AI_MAX_CONTEXT_CHARS` | | | số nguyên dương | Trần ký tự context |

Không ghi giá trị thật của các khóa này vào tài liệu, source, ảnh chụp hoặc log.

### 2.2 Khóa session động

Quy ước: `<namespace>_<chatId>`. Ví dụ `ins_123456`, `rpt_123456`.

```json
{
  "v": 1,
  "step": "ask",
  "t": 1788432000000,
  "requestId": "req_example",
  "data": {}
}
```

Giới hạn:

- Không lưu token, file blob, toàn bộ sheet hoặc prompt lớn.
- JSON hỏng được xóa riêng, không làm sập router.
- Dispatcher xóa session quá TTL.
- Khi quyền user bị thu hồi, session cũ không được tiếp tục.

## 3. Spreadsheet cấu hình `BIOSCOPE_SHEET_ID`

### 3.1 `Bioscope_Users`

| Cột | Kiểu | Bắt buộc | Ràng buộc | Ví dụ giả |
| :---- | :---- | :----: | :---- | :---- |
| `chatId` | chuỗi | ✅ | duy nhất; không đổi sang số khi so sánh | `123456789` |
| `Họ tên` | chuỗi | ✅ | 1–150 ký tự | `Người dùng A` |
| `role` | enum | ✅ | giá trị trong danh mục vai trò đã duyệt | `analyst` |
| `allowed` | chuỗi | ✅ | `*` hoặc danh sách lệnh cách nhau bằng dấu phẩy | `hoi,baocao` |
| `status` | enum | ✅ | `active`, `disabled`, `pending` | `active` |
| `dataScope` | chuỗi | Đề xuất | danh sách scope/dataset | `sales_north` |
| `updatedAt` | datetime | Đề xuất | ISO hoặc datetime Sheets | `2026-09-03 10:00:00` |
| `updatedBy` | chuỗi | Đề xuất | chatId/email quản trị | `admin` |

Khóa logic: `chatId`. Không cấp quyền chỉ vì user biết lệnh. `status` và `dataScope` phải được kiểm cùng `allowed`.

### 3.2 `Bioscope_Log`

Build Guide quy định năm cột đầu. Thiết kế sản xuất đề xuất mở rộng nhưng giữ tương thích:

| Cột | Kiểu | Nội dung |
| :---- | :---- | :---- |
| `thời gian` | datetime | `yyyy-MM-dd HH:mm:ss` theo `Asia/Ho_Chi_Minh` |
| `mức` | enum | `INFO`, `WARN`, `ERROR` |
| `nơi` | chuỗi | hàm hoặc mô-đun |
| `mô tả` | chuỗi ≤ 500 | mô tả đã loại secret |
| `phụ` | chuỗi/JSON ngắn | metadata an toàn |
| `requestId` | chuỗi, đề xuất | nối một lượt xử lý |
| `updateId` | chuỗi, đề xuất | Telegram update ID |
| `chatIdHash` | chuỗi, đề xuất | định danh đã băm khi không cần chatId thật |

Không ghi raw request, prompt, context, token hoặc toàn bộ response AI vào log lỗi.

### 3.3 `Config`

| Cột | Kiểu | Ý nghĩa |
| :---- | :---- | :---- |
| `key` | chuỗi duy nhất | Tên tham số |
| `value` | chuỗi | Giá trị |
| `type` | enum | `string`, `number`, `boolean`, `json` |
| `module` | chuỗi | `core`, `ins`, `rpt`, `alert`, `import`, `dashboard` |
| `active` | boolean | Có áp dụng không |
| `description` | chuỗi | Ý nghĩa và đơn vị |
| `updatedAt` | datetime | Thời điểm sửa |
| `updatedBy` | chuỗi | Người sửa |

Không lưu secret trong `Config`; secret ở Script Properties.

### 3.4 `Bioscope_Audit`

| Cột | Kiểu | Ý nghĩa |
| :---- | :---- | :---- |
| `auditId` | chuỗi duy nhất | ID sự kiện |
| `time` | datetime | Thời điểm |
| `requestId` | chuỗi | ID lượt yêu cầu |
| `chatId` | chuỗi | Người thực hiện; có thể mã hóa/băm theo chính sách |
| `role` | chuỗi | Vai trò tại thời điểm gọi |
| `command` | chuỗi | `hoi`, `baocao`, ... |
| `dataScope` | chuỗi | Phạm vi được áp dụng |
| `action` | chuỗi | query/export/create/share |
| `targetId` | chuỗi | sheet/file/job ID nếu có |
| `status` | enum | `success`, `denied`, `error` |
| `reason` | chuỗi | Lý do ngắn, không chứa dữ liệu nguồn |

### 3.5 `Bioscope_ProcessedUpdates`

| Cột | Kiểu | Ràng buộc |
| :---- | :---- | :---- |
| `updateId` | chuỗi | duy nhất |
| `receivedAt` | datetime | bắt buộc |
| `status` | enum | `processing`, `done`, `error` |
| `requestId` | chuỗi | duy nhất |
| `expiresAt` | datetime | phục vụ dọn retention |

Sheet này là lớp bền cho idempotency. CacheService vẫn được dùng ở lớp nhanh.

### 3.6 `Bioscope_Files`

| Cột | Kiểu | Ý nghĩa |
| :---- | :---- | :---- |
| `fileRecordId` | chuỗi duy nhất | ID bản ghi |
| `requestId` | chuỗi | Lượt tạo/nhận |
| `driveFileId` | chuỗi | Google Drive file ID |
| `kind` | enum | `report`, `export`, `upload` |
| `name` | chuỗi | Tên đã làm sạch |
| `mimeType` | chuỗi | MIME đã kiểm |
| `sizeBytes` | số | Kích thước |
| `ownerChatId` | chuỗi | Người yêu cầu |
| `dataScope` | chuỗi | Phạm vi dữ liệu |
| `sharing` | enum | `private`, `specific`, `domain`, `link` |
| `createdAt` | datetime | Thời điểm tạo |
| `expiresAt` | datetime | Hạn xóa nếu có |

### 3.7 `Report_Schedules` — đề xuất

| Cột | Kiểu | Ràng buộc |
| :---- | :---- | :---- |
| `scheduleId` | chuỗi | duy nhất |
| `active` | boolean | bắt buộc |
| `reportType` | chuỗi | mẫu đã đăng ký |
| `period` | enum | `day`, `week`, `month` hoặc cron-like đã duyệt |
| `timezone` | chuỗi | mặc định `Asia/Ho_Chi_Minh` |
| `runAt` | chuỗi | giờ/ngày theo kỳ |
| `recipients` | chuỗi | danh sách chatId/group ID được duyệt |
| `dataScope` | chuỗi | phạm vi nguồn |
| `format` | enum | `message`, `csv`, `xlsx`, `sheet` |
| `lastRunKey` | chuỗi | chống gửi trùng |
| `updatedAt` | datetime | bắt buộc |

### 3.8 `Alert_Rules` — đề xuất

| Cột | Kiểu | Ý nghĩa |
| :---- | :---- | :---- |
| `ruleId` | chuỗi duy nhất | ID quy tắc |
| `active` | boolean | bật/tắt |
| `metric` | chuỗi | chỉ số trong data dictionary |
| `operator` | enum | `>`, `>=`, `<`, `<=`, `=`, `change_pct` |
| `threshold` | số | ngưỡng |
| `dataScope` | chuỗi | tập dữ liệu |
| `recipients` | chuỗi | người nhận |
| `cooldownMinutes` | số | thời gian không gửi lại |
| `lastTriggeredKey` | chuỗi | chống gửi trùng |

## 4. Spreadsheet nghiệp vụ `OPS_SHEET_ID`

Build Guide không cung cấp schema nghiệp vụ. Trước khi code, chủ dữ liệu phải bàn giao **data dictionary** tối thiểu:

| Thuộc tính cần khai | Ví dụ giả |
| :---- | :---- |
| Tên sheet | `Sales_Daily` |
| Một dòng đại diện cho | Một ngày × một nhân viên |
| Khóa duy nhất | `date + employeeId` |
| Cột ngày | `date`, định dạng `yyyy-MM-dd` |
| Cột số | `revenue`, đơn vị VND |
| Cột phân vùng | `region`, `team`, `ownerId` |
| Cột nhạy cảm | `customerPhone`, không gửi AI |
| Công thức nghiệp vụ | Doanh thu thuần = tổng trước thuế - hoàn trả |
| Quyền đọc | `sales_north` chỉ thấy `region=north` |
| Tần suất cập nhật | Hàng ngày 18:00 |

### 4.1 Bảng `Data_Dictionary` — đề xuất

| Cột | Ý nghĩa |
| :---- | :---- |
| `dataset` | Tên tập dữ liệu logic |
| `sheetName` | Tên sheet vật lý |
| `columnName` | Header chính xác |
| `dataType` | string/number/date/boolean |
| `unit` | VND, %, kg, count... |
| `description` | Ý nghĩa nghiệp vụ |
| `sensitivity` | public/internal/confidential/restricted |
| `allowedScopes` | scope được đọc |
| `sendToAI` | true/false |
| `aggregation` | sum/avg/min/max/count/none |

Không triển khai `insBuildContext_` cho dữ liệu thật trước khi bảng này hoặc tài liệu tương đương được phê duyệt.

## 5. Quan hệ logic

```
Bioscope_Users (chatId, role, dataScope)
      │
      ├── 1:N Bioscope_Audit
      ├── 1:N Bioscope_Files
      └── được liệt kê trong Report_Schedules / Alert_Rules

Bioscope_ProcessedUpdates (updateId)
      └── 1:1 requestId ──> Audit / Log / Files

Data_Dictionary
      └── mô tả cột trong OPS_SHEET_ID
             └── được Insight / Report / Alert truy vấn theo dataScope
```

## 6. Chuẩn dữ liệu

| Loại | Chuẩn |
| :---- | :---- |
| Ngày nghiệp vụ | Chuỗi `yyyy-MM-dd` hoặc Date được chuẩn hóa theo `Asia/Ho_Chi_Minh` |
| Thời điểm log | `yyyy-MM-dd HH:mm:ss` trong sheet; epoch milliseconds trong session |
| Chat ID / update ID | Lưu và so sánh như chuỗi để tránh mất chính xác |
| Boolean | Giá trị boolean thật trong Sheets, không dùng chữ tùy ý |
| Enum | Danh sách trắng, không nhận giá trị tự do |
| Tiền | Số nguyên đơn vị nhỏ nhất hoặc số + cột đơn vị rõ ràng |
| CSV | UTF-8 BOM, escape RFC 4180; chống formula injection |
| JSON trong ô | Chỉ metadata nhỏ, có version schema và giới hạn độ dài |

## 7. Ràng buộc và kiểm tra

- Header bắt buộc phải khớp; thiếu header làm mô-đun dừng với `SCHEMA_MISMATCH`.
- `chatId`, `updateId`, `scheduleId`, `ruleId`, `auditId` và `fileRecordId` là duy nhất theo bảng.
- Không dùng số dòng Sheets làm ID bền vững.
- Mọi append/update quan trọng phải qua `LockService`.
- Không tin loại tệp từ tên; kiểm MIME và kích thước.
- Khi xuất CSV, ô bắt đầu bằng `=`, `+`, `-`, `@` phải được trung hòa theo chính sách.
- Không ghi đè dữ liệu nghiệp vụ bằng output AI nếu không có schema validation và quyền ghi riêng.

## 8. Phân loại dữ liệu và quyền

| Mức | Ví dụ | Có gửi AI ngoài Google Workspace? |
| :---- | :---- | :---- |
| Công khai | Nội dung đã công bố | Có, nếu câu hỏi cần |
| Nội bộ | Chỉ số vận hành tổng hợp | Theo chính sách đã duyệt |
| Mật | Giá vốn, doanh thu chi tiết | Chỉ khi có phê duyệt và redaction |
| Hạn chế | Dữ liệu cá nhân, secret, token | Không |

Mức phân loại thực tế do chủ dữ liệu phê duyệt. `sendToAI=false` trong data dictionary là chốt kỹ thuật, không chỉ là ghi chú.

## 9. Lưu giữ và xóa

| Loại | Chính sách dự thảo |
| :---- | :---- |
| Session | Xóa sau TTL, mặc định kỹ thuật 30 phút |
| Processed update | Giữ đủ cửa sổ retry, thời hạn cụ thể cần đo và duyệt |
| Log lỗi | Thời hạn cần phê duyệt; không chứa dữ liệu thô |
| Audit | Theo yêu cầu kiểm toán nội bộ; cần phê duyệt |
| Upload | Xóa sau xử lý hoặc theo thời hạn ngắn |
| Report/export | Theo phân loại và nhu cầu nghiệp vụ |

Dispatcher thực hiện retention theo lô và ghi số bản ghi/tệp đã xóa. Xóa tệp phải là thao tác được kiểm soát và có biên bản cấu hình retention.

## 10. Sao lưu và phục hồi

- Bật lịch sử phiên bản cho Apps Script và Sheets.
- Sao lưu định kỳ hai spreadsheet và thư mục DA4 sang vị trí được duyệt.
- Xuất Script Properties theo biểu mẫu **không chứa giá trị secret**; secret được quản lý riêng.
- Kiểm thử phục hồi trên bản sao, không ghi đè dữ liệu thật.
- Biên bản phục hồi ghi thời điểm, phạm vi, người thực hiện và kết quả.

## 11. Việc cần hoàn tất trước khi khóa thiết kế

1. Điền schema thật và data dictionary cho `OPS_SHEET_ID`.
2. Duyệt `dataScope` và cột nhạy cảm của từng role.
3. Duyệt việc thêm các sheet audit/idempotency/file/schedule/alert.
4. Chốt retention và quyền chia sẻ Drive.
5. Chốt hạn mức dữ liệu gửi OpenRouter.
6. Chạy thử quota với kích thước bảng dự kiến.

## 12. Tài liệu liên quan

- [Yêu cầu](DA4-02-cd1-xac-dinh-yeu-cau.md)
- [Kiến trúc](DA4-03-cd2-thiet-ke-kien-truc.md)
- [Kiểm thử](DA4-07-cd4-kiem-thu-va-uat.md)
- [Tra cứu kỹ thuật](DA4-10-tra-cuu-ky-thuat.md)
