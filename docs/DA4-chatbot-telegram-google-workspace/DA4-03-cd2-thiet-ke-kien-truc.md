<!--HOSO
phu_de: Chatbot Bioscope trên Telegram, Google Drive và Google Sheets
pham_vi: Dự án DA4 — Công đoạn 2, thiết kế kiến trúc dự thảo
ngay_lap: 03/09/2026
phien_ban: 0.1
nguoi_lap: QuanNH — Team Lead, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 0.1 | 03/09/2026 | Thiết kế kiến trúc từ Bioscope Build Guide và bổ sung chốt an toàn
-->
# DA4 — CÔNG ĐOẠN 2: THIẾT KẾ KIẾN TRÚC
## Chatbot Bioscope trên Telegram, Google Drive và Google Sheets

---

## 1. Mục tiêu kiến trúc

Kiến trúc phải cho phép dựng bản đầu nhanh trên Google Apps Script nhưng vẫn giữ bốn ranh giới: kênh Telegram tách khỏi nghiệp vụ; quyền tách khỏi AI; dữ liệu nguồn tách khỏi file xuất; mô-đun mới không làm thay đổi lõi router.

```
┌──────────────────────┐
│ Người dùng Telegram  │
└──────────┬───────────┘
           │ update/callback
           ▼
┌─────────────────────────────────────────────┐
│ Telegram Bot API                            │
│ webhook + sendMessage/edit/sendDocument     │
└──────────┬──────────────────────────────────┘
           │ HTTPS
           ▼
┌─────────────────────────────────────────────┐
│ Google Apps Script Web App                  │
│ doPost → xác thực → chống lặp → router       │
│                                             │
│ cancel → menu → insight → report → ...      │
└───────┬──────────────┬──────────────┬───────┘
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌─────────────┐ ┌──────────────┐
│Google Sheets │ │Google Drive │ │ OpenRouter   │
│config/ops/log│ │reports/files│ │ Chat API     │
└──────────────┘ └─────────────┘ └──────────────┘
        ▲
        │
┌───────┴─────────────────────────────────────┐
│ Time-driven trigger: biosDispatch_ / 5 phút │
└─────────────────────────────────────────────┘
```

## 2. Phân rã tệp

| Tệp | Trách nhiệm | Không được làm |
| :---- | :---- | :---- |
| `Bioscope.gs` | Hằng, helper lõi, router, user, quyền, log, AI | Chứa logic báo cáo cụ thể |
| `BioscopeWebhook.gs` | `doPost`, xác minh request, phản hồi `ok` | Đọc sheet nghiệp vụ trực tiếp |
| `Home.gs` / `Menu.gs` | Menu, bàn phím, định tuyến nhãn | Tự gọi AI |
| `Dispatcher.gs` | `biosDispatch_`, `bcSafe_`, cài trigger | Chứa logic chi tiết của từng scan |
| `Help.gs` | Trợ giúp và callback chung | Sửa session mô-đun khác |
| `Insight.gs` | `#hoi`, dựng context, gọi AI, xuất CSV | Đọc dữ liệu ngoài quyền |
| `Report.gs` | `#baocao`, lịch báo cáo, tạo tệp | Tự chia sẻ công khai |
| `Alert.gs` | Quét ngưỡng, chống gửi trùng | Hard-code người nhận/ngưỡng |
| `Import.gs` | Nhận CSV/XLSX, kiểm và chuyển đổi | Ghi dữ liệu trước validate |
| `Dashboard.gs` | Sinh sheet/chart và trả link | Cấp quyền Drive rộng mặc định |

## 3. Vòng đời một Telegram update

```
doPost(e)
  ├─ parse JSON thất bại → log tối thiểu → trả ok
  ├─ xác minh X-Telegram-Bot-Api-Secret-Token
  ├─ lấy update_id → kiểm khóa idempotency
  ├─ đánh dấu đang xử lý bằng LockService
  ├─ processUpdate_(update)
  │    ├─ callback_query → biosOnCallback_
  │    └─ message
  │         ├─ lấy user + kiểm status
  │         ├─ cancel intercept
  │         ├─ menu intercept
  │         ├─ insight intercept
  │         ├─ report/import/... intercept
  │         ├─ slash command chung
  │         └─ fallback câu tự nhiên có kiểm quyền
  ├─ đánh dấu update đã hoàn tất
  └─ trả ContentService "ok"
```

### 3.1 Chống xử lý trùng

Build Guide cảnh báo Telegram có thể gửi lặp nhưng starter chưa hiện thực hóa đầy đủ. Thiết kế DA4 bổ sung:

- Khóa chính: `update_id` của Telegram.
- Kho ngắn hạn: CacheService để loại nhanh update lặp.
- Kho bền: sheet `Bioscope_ProcessedUpdates` hoặc Script Properties theo cửa sổ giữ lại.
- Với tác vụ ghi/gửi: thêm khóa nghiệp vụ, ví dụ `report:<period>:<chatId>`.
- Bao đoạn kiểm-ghi bằng `LockService` để hai request đồng thời không cùng đi qua.

## 4. Hợp đồng intercept

```javascript
function xIntercept_(chatId, msg, u) {
  // true: đã xử lý, dừng router
  // false: không thuộc mô-đun này, chuyển tiếp
}
```

Quy tắc thứ tự:

1. Hủy phiên đứng đầu để người dùng luôn có đường thoát.
2. Menu đứng trước nghiệp vụ để nhãn nút không bị hiểu là câu hỏi.
3. Mô-đun có session đứng trước lệnh chung.
4. Fallback câu tự nhiên đứng cuối và phải gọi authorization guard của Insight.
5. Intercept không được “nuốt” lỗi rồi trả `false`; lỗi đã nhận diện là của mô-đun phải trả thông báo và `true`.

## 5. Kiến trúc phân quyền

```
chatId
  ↓
Bioscope_Users: tồn tại? active?
  ↓
canUseCommand_(u, command)
  ↓
resolveDataScope_(u, command)
  ↓
queryAllowedRows_(scope)
  ↓
redactSensitiveColumns_(scope)
  ↓
context tối thiểu cho AI
```

Ba lớp kiểm:

| Lớp | Chặn điều gì | Nơi thực hiện |
| :---- | :---- | :---- |
| Người dùng | Chat lạ hoặc tài khoản ngưng hoạt động | Trước router nghiệp vụ |
| Khả năng | Dùng lệnh không được cấp | Mỗi intercept / command guard |
| Dữ liệu | Đọc dòng/cột ngoài vai trò | Bộ truy vấn và dựng context |

Chỉ có lớp `canUseCommand_` là chưa đủ. Một user được dùng `#hoi` vẫn có thể không được xem doanh thu, giá vốn hoặc dữ liệu cá nhân.

## 6. Luồng Insight

```
Người dùng: #hoi
  → kiểm quyền "hoi"
  → setSess_('ins', chatId, {step:'ask', t: now})
  → hỏi người dùng nhập câu hỏi

Câu hỏi
  → kiểm session + kiểm quyền lại
  → phân loại phạm vi dữ liệu
  → đọc sheet/cột được phép
  → giới hạn số dòng/ký tự
  → dựng system prompt + context + câu hỏi
  → gọi OpenRouter
  → kiểm output
  → tách file an toàn nếu có
  → gửi Telegram
  → ghi audit đã che dữ liệu nhạy cảm
```

`insBuildContext_(u)` trong starter chỉ đọc 200 dòng đầu của sheet đầu tiên. Đây là ví dụ thông luồng, **không phải thiết kế sản xuất**. Bản thật phải nhận `question`, `dataScope` và data dictionary để chọn đúng sheet, cột, bộ lọc và phép tính.

## 7. Luồng gọi OpenRouter

| Bước | Thiết kế |
| :---- | :---- |
| 1 | Lấy `OPENROUTER_API_KEY` và model từ Script Properties |
| 2 | Kiểm key/model đã cấu hình; thiếu thì dừng trước khi gọi mạng |
| 3 | Dựng `messages` với system và user; không đặt dữ liệu nhạy cảm ngoài phạm vi |
| 4 | Đặt `max_tokens`, timeout và tùy chọn nhận diện app |
| 5 | Gọi API với `muteHttpExceptions: true` |
| 6 | Kiểm HTTP status, JSON, `error`, `choices[0]` và content |
| 7 | Retry giới hạn cho 429/5xx; không retry lỗi cấu hình 4xx |
| 8 | Ghi model, thời gian, trạng thái và usage nếu có; không ghi key/context thô |

### 7.1 Quy tắc đầu ra

- Mặc định gửi plain text hoặc escape toàn bộ HTML do AI sinh.
- Tách tin nhắn theo giới hạn Telegram mà không cắt giữa thực thể HTML.
- Khối file chỉ cho phép `.csv` trong bản đầu; chuẩn hóa tên, bỏ dấu `/`, `..` và ký tự điều khiển.
- CSV được tạo với BOM UTF-8, kiểm kích thước trước khi gửi.
- Nếu tạo báo cáo bền vững, lưu Drive trước, sau đó gửi file/link; lưu `fileId` vào log.

## 8. Tích hợp Google Sheets

Hai spreadsheet tách biệt:

| Spreadsheet | Nội dung | Quyền |
| :---- | :---- | :---- |
| `BIOSCOPE_SHEET_ID` | Users, Config, Log, audit, schedule, processed updates | Chỉ quản trị viên và Apps Script |
| `OPS_SHEET_ID` | Dữ liệu nghiệp vụ được bot truy vấn/phân tích | Theo chủ dữ liệu, Apps Script chỉ đọc/ghi phần được duyệt |

Nguyên tắc truy cập:

- Dùng header làm hợp đồng schema, không phụ thuộc số cột bí mật trong code.
- Cache data dictionary và cấu hình đọc nhiều lần.
- Đọc một vùng cần thiết thay vì toàn bộ workbook.
- Ngày chuẩn hóa `yyyy-MM-dd`; khi Sheets trả `Date`, so sánh theo timezone `Asia/Ho_Chi_Minh`.
- Dùng `LockService` khi append audit, cập nhật khóa chống trùng hoặc ghi trạng thái job.

## 9. Tích hợp Google Drive

```
BIOSCOPE_ROOT_FOLDER_ID
├── reports/YYYY/MM/
├── exports/YYYY/MM/
├── uploads/<chatId>/
└── failed/                 (tùy chọn, chỉ admin)
```

Mỗi tệp nên có tên dạng `bioscope_<type>_<yyyyMMdd_HHmmss>_<requestId>.<ext>` và metadata trong sheet `Bioscope_Files`. Không đưa `chatId`, họ tên hoặc nội dung câu hỏi nhạy cảm vào tên tệp.

Quyền Drive mặc định là riêng tư. Nếu cần chia sẻ, chia theo người/nhóm đã duyệt. Link-sharing “anyone with link” chỉ bật khi có quyết định rõ bằng văn bản.

## 10. Session và state machine

| Trường | Bắt buộc | Ý nghĩa |
| :---- | :----: | :---- |
| `step` | ✅ | Bước hiện tại của luồng |
| `t` | ✅ | Epoch milliseconds để tính timeout |
| `v` | Nên có | Phiên bản schema session |
| `requestId` | Nên có | Nối log, AI và file |
| `data` | Tùy luồng | Chỉ dữ liệu nhỏ, không lưu file/context lớn |

Script Properties không phải cơ sở dữ liệu phiên quy mô lớn. Nếu số người dùng hoặc session tăng vượt giới hạn, chuyển session sang sheet có khóa hoặc một kho ngoài là quyết định kiến trúc mới.

## 11. Dispatcher

```javascript
function biosDispatch_() {
  bcSafe_('insTimeoutScan_', insTimeoutScan_)
  bcSafe_('rptScheduleScan_', rptScheduleScan_)
  bcSafe_('alertScan_', alertScan_)
  bcSafe_('retentionScan_', retentionScan_)
}
```

Mỗi scan phải:

- Giới hạn số bản ghi mỗi lượt.
- Có checkpoint để lượt sau chạy tiếp.
- Có khóa chống hai trigger chạy đồng thời.
- Có khóa chống gửi trùng.
- Dừng trước thời hạn Apps Script và lưu trạng thái.
- Ghi số item thành công/lỗi, không ghi dữ liệu nhạy cảm.

## 12. Bảo mật

| Nguy cơ | Biện pháp |
| :---- | :---- |
| Request giả vào Web App public | Telegram secret token, chỉ nhận POST, kiểm content type và cấu trúc update |
| Token/key trong source | Script Properties, secret scan trước phát hành |
| Vượt quyền bằng câu tự nhiên | Authorization guard dùng chung cho `#hoi` và fallback |
| Prompt injection trong dữ liệu | Dữ liệu được coi là dữ liệu, không phải lệnh; system prompt cấm làm theo chỉ dẫn trong sheet |
| Lộ dữ liệu qua AI | Lọc cột/dòng, redact, context tối thiểu, chính sách nhà cung cấp |
| Lộ báo cáo Drive | Quyền riêng tư mặc định, chia sẻ theo danh sách |
| Công thức CSV/Sheets nguy hiểm | Escape ô bắt đầu bằng `=`, `+`, `-`, `@` khi xuất cho người dùng |
| HTML injection Telegram | Escape output hoặc plain text |
| Log chứa secret/context | Log whitelist field và redaction trước ghi |

## 13. Khả năng chịu lỗi

| Thành phần lỗi | Hành vi |
| :---- | :---- |
| Telegram send lỗi tạm thời | Retry giới hạn; ghi requestId và response code |
| OpenRouter 429/5xx | Backoff, tối đa số lượt cấu hình; báo người dùng nếu hết |
| OpenRouter 401/403 | Không retry; báo quản trị viên kiểm key |
| Sheet thiếu/header sai | Dừng mô-đun; không đoán cột; ghi schema error |
| Drive không có quyền | Không bật share rộng để chữa; báo đúng folderId/quyền cần kiểm |
| Một Dispatcher scan lỗi | `bcSafe_` ghi lỗi và scan khác tiếp tục |
| JSON session hỏng | Xóa riêng session đó, báo người dùng khởi động lại luồng |

## 14. Quyết định kỹ thuật

### QĐ-01 — Google Apps Script thay cho máy chủ riêng

Giảm thời gian triển khai và dùng trực tiếp Sheets/Drive. Đổi lại, hệ thống chịu quota, giới hạn thời gian chạy và ít phù hợp với tải đồng thời cao.

### QĐ-02 — Telegram là kênh duy nhất của bản đầu

Giảm số adapter và tập trung kiểm thử luồng nghiệp vụ. Đổi lại, DA4 không phải nền tảng đa kênh như DA3.

### QĐ-03 — Intercept theo mô-đun

Thêm tính năng bằng một file và một điểm đăng ký router. Đổi lại, thứ tự intercept trở thành cấu hình quan trọng cần test hồi quy.

### QĐ-04 — Tách spreadsheet cấu hình và nghiệp vụ

Giảm nguy cơ nhân viên sửa nhầm log/quyền khi làm dữ liệu. Đổi lại, triển khai phải quản lý hai ID và quyền truy cập.

### QĐ-05 — Script Properties chỉ cho session nhỏ

Tận dụng kho có sẵn và đọc nhanh. Đổi lại, phải có TTL thủ công và kế hoạch chuyển kho khi quy mô tăng.

### QĐ-06 — AI chỉ diễn giải dữ liệu đã lọc

Giảm rủi ro bịa và lộ dữ liệu. Đổi lại, đội phải viết bộ truy vấn/dictionary cho từng miền nghiệp vụ thay vì đổ nguyên sheet vào prompt.

## 15. Điểm thiết kế còn mở

1. Schema thật của `OPS_SHEET_ID` và chiến lược chọn sheet theo câu hỏi.
2. Danh sách vai trò, data scope và cột nhạy cảm.
3. Hợp đồng Report, Alert, Import và Dashboard.
4. Cơ chế xác thực webhook tương thích cách Apps Script nhận header tại thời điểm triển khai.
5. Ngưỡng chuyển khỏi Script Properties hoặc khỏi Apps Script.
6. Chính sách lưu audit, session, upload và report.

## 16. Tài liệu liên quan

- [Thiết kế dữ liệu](DA4-04-cd2-thiet-ke-du-lieu.md)
- [Thiết kế giao diện và luồng](DA4-05-cd2-thiet-ke-giao-dien-va-luong.md)
- [Triển khai](DA4-08-cd5-6-7-dong-goi-trien-khai.md)
- [Tra cứu kỹ thuật](DA4-10-tra-cuu-ky-thuat.md)
