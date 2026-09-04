<!--HOSO
phu_de: Chatbot Bioscope trên Telegram, Google Drive và Google Sheets
pham_vi: Dự án DA4 — Công đoạn 3, kế hoạch lập trình và nhật ký
ngay_lap: 03/09/2026
phien_ban: 0.1
nguoi_lap: Bộ phận Phát triển phần mềm — Công ty Bioscope
nguoi_duyet: Chưa xác nhận
lich_su: 0.1 | 03/09/2026 | Lập khung mã nguồn và biểu mẫu nhật ký trước triển khai
-->
# DA4 — CÔNG ĐOẠN 3: LẬP TRÌNH VÀ NHẬT KÝ PHÁT TRIỂN
## Chatbot Bioscope trên Telegram, Google Drive và Google Sheets

---

> **Lưu ý bằng chứng:** Build Guide có starter code nhưng phạm vi cung cấp chưa có project Apps Script DA4 hoặc lịch sử commit. Vì vậy tài liệu này ghi kế hoạch, chuẩn mã và biểu mẫu nhật ký; chỉ chuyển mục sang “đã làm” khi có commit/version Apps Script đối chiếu được.

## 1. Cấu trúc mã nguồn dự kiến

```
da4-bioscope-apps-script/
├── appsscript.json
├── Bioscope.gs
├── BioscopeWebhook.gs
├── Home.gs
├── Menu.gs
├── Help.gs
├── Dispatcher.gs
├── Insight.gs
├── Report.gs                 # nếu duyệt phạm vi
├── Alert.gs                  # nếu duyệt phạm vi
├── Import.gs                 # nếu duyệt phạm vi
├── Dashboard.gs              # nếu duyệt phạm vi
├── tests/                    # test chạy cục bộ/mocks nếu áp dụng
└── README.md
```

Nếu quản lý Apps Script bằng `clasp`, kho mã nguồn phải lưu `.clasp.json` ở dạng không lộ project nhạy cảm và không lưu credential. Nếu chỉnh trực tiếp trên trình duyệt, mỗi bản phát hành phải export mã nguồn hoặc gắn version Apps Script với biên bản phát hành.

## 2. Bề mặt công khai của lõi

| Nhóm | Hàm | Vai trò |
| :---- | :---- | :---- |
| Webhook | `doPost(e)` | Điểm nhận Telegram update |
| Router | `processUpdate_(update)` | Điều phối callback/tin nhắn/intercept |
| Telegram | `tgPost_`, `sendMessage_`, `editMessage_`, `answerCallback_`, `sendDocumentBlob_`, `tgDownloadBlob_` | Giao tiếp Bot API |
| AI | `callAiBioscope_`, `biosSendReply_` | Gọi model và gửi text/file |
| Session | `sess_`, `setSess_`, `clearSess_` | Trạng thái ngắn hạn theo chat |
| User/quyền | `bioscopeUser_`, `canUseCommand_`, `permDeny_` | Xác thực và quyền lệnh |
| Sheet | `ensureSheet_` | Bảo đảm sheet/header nền |
| Log | `logError_` | Ghi lỗi an toàn |
| Callback | `biosOnCallback_` | Route namespace callback |
| Dispatcher | `biosDispatch_`, `bcSafe_`, `INSTALL_DISPATCHER` | Tác vụ định kỳ |
| Setup | `BIOSCOPE_SETUP`, `SET_WEBHOOK` | Khởi tạo và triển khai |

## 3. Quy ước mã nguồn

### 3.1 Tên

| Loại | Quy ước | Ví dụ |
| :---- | :---- | :---- |
| Hàm nội bộ | camelCase + hậu tố `_` | `insBuildContext_` |
| Hàm chạy thủ công | UPPER_SNAKE hoặc tên rõ không hậu tố | `BIOSCOPE_SETUP` |
| Namespace mô-đun | 2–5 ký tự thường | `ins`, `rpt`, `alt` |
| Session key | `<ns>_<chatId>` | `ins_123456` |
| Callback | `<ns>:<group>:<value>` | `rpt:period:month` |
| Script Property hệ thống | `BIOSCOPE_` hoặc `OPENROUTER_` | `BIOSCOPE_TOKEN` |
| Sheet hệ thống | `Bioscope_` + danh từ | `Bioscope_Audit` |

### 3.2 Hợp đồng intercept

```javascript
function moduleIntercept_(chatId, msg, u) {
  const text = String(msg.text || '').trim()
  if (!isMine_(text, chatId)) return false
  // Từ đây mô-đun sở hữu update: xử lý hoặc báo lỗi rồi trả true.
  return true
}
```

- Không đọc `msg.text` mà không có giá trị mặc định.
- Kiểm quyền trước khi đọc dữ liệu hoặc gọi mạng.
- Intercept có side effect phải chống lặp.
- Khi trả `true`, hàm phải gửi phản hồi hoặc đã xác nhận callback.
- Namespace callback phải được đăng ký trong `biosOnCallback_`.

### 3.3 Xử lý lỗi

- Không `throw` ngược ra ngoài `doPost` cho lỗi đã biết.
- Không `catch` rỗng, trừ lớp log cuối cùng để tránh vòng lỗi.
- Response bên ngoài phải kiểm HTTP code trước khi parse logic.
- Log theo whitelist field: `requestId`, nơi, mã lỗi, trạng thái, thời gian.
- Không nối raw token, header Authorization, prompt hoặc context vào log.

### 3.4 Dữ liệu và thời gian

- Dùng `String(chatId)` và `String(updateId)` khi so sánh.
- `TZ = 'Asia/Ho_Chi_Minh'` là một hằng duy nhất.
- Ngày nghiệp vụ dùng `yyyy-MM-dd`; không so Date bằng chuỗi trực tiếp.
- Cấu hình số phải parse và kiểm min/max.
- Khi ghi nhiều ô liên tiếp, ưu tiên `setValues` theo vùng thay vì từng ô.

## 4. Các sửa đổi bắt buộc so với starter

| Mã | Điểm starter | Sửa trước khi dùng dữ liệu thật |
| :---- | :---- | :---- |
| FIX-01 | Fallback câu tự nhiên gọi `insAsk_` trực tiếp | Dùng cùng kiểm `active`, `allowed` và dataScope như `#hoi` |
| FIX-02 | `bioscopeUser_` trả user không xét `status` | Chỉ cho phép `status='active'` |
| FIX-03 | `insBuildContext_` đọc 200 dòng đầu sheet đầu | Chọn dataset/cột/bộ lọc theo data dictionary và quyền |
| FIX-04 | Session mẫu thiếu `t` | Luôn set `t: Date.now()` và version schema |
| FIX-05 | `doPost` không xác minh nguồn | Thêm webhook secret và chống update lặp |
| FIX-06 | Gửi AI text với `parse_mode='HTML'` | Escape HTML hoặc dùng plain text |
| FIX-07 | `tgDownloadBlob_` tin response `getFile` | Kiểm `ok`, path, MIME và size |
| FIX-08 | `callAiBioscope_` chưa xét HTTP/retry | Phân loại 4xx/429/5xx, timeout và backoff |
| FIX-09 | Tên file do AI quyết định | Làm sạch tên + danh sách trắng extension |
| FIX-10 | Idempotency chỉ là ghi chú | Lưu `updateId` và khóa nghiệp vụ bằng LockService |
| FIX-11 | Link-sharing chưa có chính sách | Mặc định private, share cụ thể |
| FIX-12 | Chưa chống formula injection | Trung hòa ô CSV bắt đầu bằng ký tự công thức |

## 5. Kế hoạch lập trình

| Mốc | Phạm vi | Điều kiện hoàn tất | Trạng thái |
| :---- | :---- | :---- | :---- |
| M0 | Chốt schema, quyền, câu hỏi mẫu | DA4-02/04 được duyệt | Chưa bắt đầu |
| M1 | Dựng lõi và webhook | `/hi`, `/menu`, log, auth, idempotency chạy test | Chưa bắt đầu |
| M2 | Insight đọc sheet mẫu | 3 câu hỏi UAT đúng và không vượt quyền | Chưa bắt đầu |
| M3 | CSV và Drive | Tệp UTF-8, quyền đúng, audit đủ | Chưa bắt đầu |
| M4 | Dispatcher | timeout, trigger, khóa và quota test đạt | Chưa bắt đầu |
| M5 | Report | Mẫu/kỳ/người nhận được duyệt và test | Chờ duyệt phạm vi |
| M6 | Alert/Import/Dashboard | Từng mô-đun có yêu cầu và UAT riêng | Chờ duyệt phạm vi |
| M7 | Hardening + phát hành | Bộ DA4-07 đạt, runbook và rollback thử xong | Chưa bắt đầu |

## 6. Nhật ký phát triển

### 6.1 Quy tắc ghi

Mỗi mốc hoặc thay đổi có ảnh hưởng nghiệp vụ phải ghi:

| Trường | Nội dung |
| :---- | :---- |
| Ngày/giờ | Theo `Asia/Ho_Chi_Minh` |
| Commit hoặc Apps Script version | ID đối chiếu được |
| Người thực hiện | Danh tính công ty |
| Yêu cầu | Mã YC/NV/FIX liên quan |
| Thay đổi | Tệp/hàm/schema |
| Kiểm thử | Mã TC và kết quả |
| Rủi ro/rollback | Cách quay lại |
| Bằng chứng | Link nội bộ tới diff, log, ảnh hoặc biên bản |

### 6.2 Bảng nhật ký

| Ngày | Phiên bản/commit | Yêu cầu | Nội dung | Kiểm thử | Người thực hiện | Bằng chứng |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| 03/09/2026 | Chưa có | — | Lập Build Guide và bộ hồ sơ thiết kế DA4 v0.1 | Rà tài liệu | Bộ phận Phát triển phần mềm | Bộ tài liệu DA4 |
| | | | | | | |
| | | | | | | |
| | | | | | | |

Hàng đầu chỉ chứng minh công việc tài liệu. Nó **không chứng minh đã viết mã DA4**.

## 7. Chiến lược kiểm thử trong quá trình code

| Lớp | Cách làm |
| :---- | :---- |
| Hàm thuần | Test `norm_`, parse callback, sanitize filename, CSV escape, date normalize |
| Adapter | Mock `UrlFetchApp`, `SpreadsheetApp`, `DriveApp`, Properties/Cache/Lock |
| Router | Bộ update JSON Telegram cố định cho message/callback/document/retry |
| Tích hợp | Spreadsheet và Drive test riêng, bot test riêng, OpenRouter key test có hạn mức |
| End-to-end | Webhook thật với chat test và dữ liệu giả |
| An toàn | Vượt quyền, prompt injection, HTML/file/formula injection, replay update |

## 8. Quy tắc review

Trước khi merge/version:

- [ ] Thay đổi có mã yêu cầu và ca test tương ứng.
- [ ] Không có token, ID nhạy cảm hoặc dữ liệu thật trong diff.
- [ ] Mọi đường vào dữ liệu đều kiểm user, status, command và dataScope.
- [ ] Mọi output AI được kiểm và escape.
- [ ] Mọi side effect có idempotency key.
- [ ] Mọi session set có `step`, `t`, `v`.
- [ ] Mọi callback được answer, kể cả lỗi.
- [ ] Mọi request ngoài có timeout và phân loại response.
- [ ] Log không chứa context/prompt/secret.
- [ ] Tài liệu DA4-08/10 được cập nhật khi config hoặc deploy đổi.

## 9. Quản lý phiên bản

Đề xuất dùng phiên bản `MAJOR.MINOR.PATCH`:

| Loại | Khi tăng | Ví dụ |
| :---- | :---- | :---- |
| MAJOR | Đổi hợp đồng dữ liệu/lệnh không tương thích | 1.0.0 → 2.0.0 |
| MINOR | Thêm mô-đun/lệnh tương thích | 1.0.0 → 1.1.0 |
| PATCH | Sửa lỗi không đổi giao diện | 1.1.0 → 1.1.1 |

Mỗi bản phát hành phải gắn với Apps Script deployment version. Không dùng “New deployment” không có changelog.

## 10. Bằng chứng công đoạn 3 cần thu thập

| Bằng chứng | Trạng thái |
| :---- | :---- |
| Kho mã nguồn/project Apps Script riêng | Chưa có trong phạm vi nguồn |
| Lịch sử commit/version | Chưa có |
| Pull request/code review | Chưa có |
| Báo cáo secret scan | Chưa có |
| Kết quả test tự động | Chưa có |
| Ảnh cấu hình deployment/trigger đã che secret | Chưa có |
| Changelog phát hành | Chưa có |

## 11. Không làm trong công đoạn lập trình

- Không chép token thật vào `SET_WEBHOOK(...)` trong source đã commit.
- Không dùng trực tiếp starter trên dữ liệu thật trước FIX-01 đến FIX-12.
- Không sửa lõi platform để nhét logic một báo cáo cụ thể.
- Không ghi kết quả kiểm thử “đạt” khi chưa chạy.
- Không dùng commit của DA3 làm bằng chứng cho DA4.

## 12. Tài liệu liên quan

- [Kiến trúc](DA4-03-cd2-thiet-ke-kien-truc.md)
- [Thiết kế dữ liệu](DA4-04-cd2-thiet-ke-du-lieu.md)
- [Kiểm thử và UAT](DA4-07-cd4-kiem-thu-va-uat.md)
- [Đóng gói và triển khai](DA4-08-cd5-6-7-dong-goi-trien-khai.md)
