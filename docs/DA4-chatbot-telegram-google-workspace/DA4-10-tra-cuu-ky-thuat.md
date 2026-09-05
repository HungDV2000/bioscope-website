<!--HOSO
phu_de: Chatbot Bioscope trên Telegram, Google Drive và Google Sheets
pham_vi: Dự án DA4 — quản trị hệ thống và lập trình viên
ngay_lap: 03/09/2026
phien_ban: 0.1
nguoi_lap: QuanNH — Team Lead, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 0.1 | 03/09/2026 | Sổ tra cứu kỹ thuật dự thảo từ Bioscope Build Guide
-->
# DA4 — SỔ TRA CỨU KỸ THUẬT
## Chatbot Bioscope trên Telegram, Google Drive và Google Sheets

*Tài liệu tra cứu, không đọc tuần tự. Giá trị model, quota và API bên ngoài phải kiểm tra lại tại thời điểm triển khai.*

---

# PHẦN A — CẤU HÌNH

## A1. Script Properties

| Key | Bắt buộc | Giá trị mặc định | Ghi chú |
| :---- | :----: | :---- | :---- |
| `BIOSCOPE_TOKEN` | ✅ | — | Secret token của bot Telegram riêng |
| `TELEGRAM_WEBHOOK_SECRET` | ✅ đề xuất | — | Xác minh request webhook |
| `OPENROUTER_API_KEY` | ✅ | — | Secret tính phí |
| `OPENROUTER_MODEL` | ✅ | Theo Build Guide: `anthropic/claude-sonnet-4.5` | Xác minh slug/giá trước deploy |
| `OPENROUTER_SITE` | | — | Header `HTTP-Referer` |
| `OPENROUTER_APP` | | — | Header `X-Title` |
| `BIOSCOPE_SHEET_ID` | ✅ | — | Spreadsheet config/user/log |
| `OPS_SHEET_ID` | ✅ | — | Spreadsheet dữ liệu nghiệp vụ |
| `BIOSCOPE_ADMIN_ID` | ✅ | — | Telegram chat ID admin |
| `BIOSCOPE_ROOT_FOLDER_ID` | ✅ | — | Drive folder của report/export/upload |
| `SESSION_TTL_MINUTES` | | `30` đề xuất | TTL session |
| `AI_MAX_CONTEXT_ROWS` | | `200` từ starter | Không dùng như bảo đảm an toàn duy nhất |
| `AI_MAX_CONTEXT_CHARS` | | Cần chốt | Trần ký tự gửi AI |

## A2. Cấu hình nền

| Hạng mục | Giá trị |
| :---- | :---- |
| Runtime | Google Apps Script V8 |
| Timezone | `Asia/Ho_Chi_Minh` |
| OpenRouter endpoint | `https://openrouter.ai/api/v1/chat/completions` |
| Telegram API | `https://api.telegram.org/bot<TOKEN>/<method>` |
| Web App | URL deployment kết thúc `/exec` |
| Dispatcher | `biosDispatch_`, time-driven mỗi 5 phút |
| Advanced Drive | Bật khi cần convert/read Excel |

## A3. Kiểm cấu hình an toàn

- Chỉ kiểm **tên** key tồn tại; không in value ra log.
- `BIOSCOPE_SHEET_ID`, `OPS_SHEET_ID` và folder ID phải mở được bằng tài khoản deployment.
- Bot token phải thuộc đúng bot DA4.
- OpenRouter key phải có budget/hạn mức.
- Admin ID phải tồn tại trong `Bioscope_Users`, active và `allowed='*'`.
- Không dùng chung token/spreadsheet của Biochat hoặc DA3.

# PHẦN B — SHEETS VÀ DỮ LIỆU

## B1. Sheet bắt buộc

| Sheet | Header tối thiểu |
| :---- | :---- |
| `Bioscope_Users` | `chatId | Họ tên | role | allowed | status` |
| `Bioscope_Log` | `thời gian | mức | nơi | mô tả | phụ` |

## B2. Sheet đề xuất cho bản sản xuất

| Sheet | Mục đích |
| :---- | :---- |
| `Config` | Tham số nghiệp vụ không bí mật |
| `Bioscope_Audit` | Ai làm gì, phạm vi nào, kết quả gì |
| `Bioscope_ProcessedUpdates` | Chống xử lý Telegram update lặp |
| `Bioscope_Files` | Theo dõi report/export/upload trên Drive |
| `Report_Schedules` | Lịch báo cáo |
| `Alert_Rules` | Quy tắc cảnh báo |
| `Data_Dictionary` | Mô tả dataset/cột/quyền/sendToAI |

Schema chi tiết ở DA4-04.

## B3. Quy tắc ngày

```javascript
const TZ = 'Asia/Ho_Chi_Minh'

function toYmd_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, TZ, 'yyyy-MM-dd')
  }
  return String(value || '').trim()
}
```

Không so `Date` trực tiếp với chuỗi. Không dùng timezone mặc định của tài khoản nếu khác `TZ`.

# PHẦN C — TELEGRAM

## C1. Các method dùng

| Method | Helper | Mục đích |
| :---- | :---- | :---- |
| `sendMessage` | `sendMessage_` | Gửi tin nhắn |
| `editMessageText` | `editMessage_` | Sửa tin có bàn phím |
| `answerCallbackQuery` | `answerCallback_` | Kết thúc trạng thái loading của nút |
| `sendDocument` | `sendDocumentBlob_` | Gửi CSV/tệp |
| `getFile` | `tgDownloadBlob_` | Lấy đường dẫn tệp user gửi |
| `setWebhook` | `SET_WEBHOOK` | Đăng ký URL Web App |
| `getWebhookInfo` | Hàm quản trị | Kiểm trạng thái webhook |

## C2. Callback data

Định dạng: `<namespace>:<group>:<value...>`.

| Ví dụ | Ý nghĩa |
| :---- | :---- |
| `menu:open:home` | Mở menu chính |
| `ins:pick:revenue` | Chọn chỉ số doanh thu |
| `ins:export:req123` | Xuất kết quả request ngắn |
| `rpt:period:month` | Chọn kỳ tháng |
| `rpt:confirm:req123` | Xác nhận tạo report |

Giới hạn `callback_data` là 64 byte. Không đặt secret, dữ liệu nghiệp vụ, raw query hoặc chatId của user khác trong callback.

## C3. Router callback

| Namespace | Handler |
| :---- | :---- |
| `ins` | `insOnCallback_` |
| `rpt` | `rptOnCallback_` |
| `menu` | `menuOnCallback_` |
| `alt` | `alertOnCallback_` nếu có |

Handler phải kiểm lại user, status, quyền, ownership và expiry; callback cũ không được xem là authorization.

## C4. Giới hạn output

- Chia tin dài trước giới hạn Telegram hiện hành.
- Nếu dùng HTML, escape `<`, `>`, `&`, dấu nháy theo ngữ cảnh.
- Gửi bảng dài bằng file.
- Không đưa stack trace hoặc response API thô cho user.

# PHẦN D — HÀM LÕI

## D1. Cấu hình

| Hàm | Hợp đồng |
| :---- | :---- |
| `prop_(k)` | Trả string/null từ Script Properties |
| `setProp_(k,v)` | Ghi string; không dùng để ghi secret từ input user |
| `delProp_(k)` | Xóa đúng key đã định danh |
| `TG_API_()` | Ghép base Telegram API; không log kết quả |
| `cfgSheetId_()` | Trả `BIOSCOPE_SHEET_ID` |
| `opsSheetId_()` | Trả `OPS_SHEET_ID` |
| `adminId_()` | Trả `BIOSCOPE_ADMIN_ID` |
| `rootFolderId_()` | Trả `BIOSCOPE_ROOT_FOLDER_ID` |

## D2. Text và lệnh

`norm_(s)` bỏ dấu tiếng Việt, đổi `đ→d`, lowercase và bỏ ký tự ngoài `[a-z0-9]`. Chỉ dùng cho so khớp nhãn/lệnh; không dùng để chuẩn hóa dữ liệu lưu hoặc nội dung hiển thị.

## D3. User và quyền

| Hàm | Điều kiện |
| :---- | :---- |
| `bioscopeUser_(chatId)` | So `chatId` như chuỗi; trả role/allowed/status/dataScope |
| `canUseCommand_(u,cmd)` | User tồn tại, active; `*` hoặc danh sách chứa lệnh |
| `resolveDataScope_(u,cmd)` | Trả dataset/filter/cột được phép; bắt buộc bổ sung |
| `permDeny_(chatId,cmd)` | Tin từ chối không tiết lộ dữ liệu |

## D4. Session

| Hàm | Hợp đồng |
| :---- | :---- |
| `sess_(prefix,chatId)` | Parse JSON an toàn; lỗi JSON trả null và dọn key |
| `setSess_(prefix,chatId,o)` | Yêu cầu `step`, `t`, `v`; giới hạn size |
| `clearSess_(prefix,chatId)` | Xóa đúng session của user/module |
| `insTimeoutScan_()` | Xóa `ins_*` quá TTL theo lô |

## D5. Sheet và log

| Hàm | Hợp đồng |
| :---- | :---- |
| `ensureSheet_(id,name,headers)` | Tạo sheet/header nếu thiếu; production phải kiểm mismatch |
| `logError_(where,err)` | Không throw ngược; redaction; mô tả ≤ 500 |
| `appendAudit_(event)` | Đề xuất; ghi whitelist field dưới LockService |

## D6. AI

| Hàm | Hợp đồng |
| :---- | :---- |
| `callAiBioscope_(system,userText)` | Chat Completions, timeout/retry/status check |
| `biosSendReply_(chatId,aiText)` | Validate text/file, escape/chia tin |
| `insBuildContext_(u,question)` | Lọc dataset/dòng/cột và giới hạn context |
| `insAsk_(chatId,u,question)` | Guard quyền → context → AI → output → audit |

# PHẦN E — OPENROUTER

## E1. Request

```json
{
  "model": "<OPENROUTER_MODEL>",
  "max_tokens": 2000,
  "messages": [
    {"role": "system", "content": "<system instruction>"},
    {"role": "user", "content": "<filtered context and question>"}
  ]
}
```

Headers:

- `Authorization: Bearer <OPENROUTER_API_KEY>`
- `HTTP-Referer: <OPENROUTER_SITE>` nếu có
- `X-Title: <OPENROUTER_APP>` nếu có

## E2. Phân loại lỗi

| HTTP/tình huống | Xử lý |
| :---- | :---- |
| 200 + choices hợp lệ | Lấy `choices[0].message.content` |
| 400 | Lỗi request/model; không retry mù |
| 401/403 | Key/quyền; không retry, cảnh báo admin |
| 408/429 | Retry giới hạn với backoff |
| 5xx | Retry giới hạn; sau đó thông báo tạm lỗi |
| 200 nhưng thiếu choices | `AI_INVALID_RESPONSE`, ghi metadata an toàn |
| JSON parse lỗi | `AI_INVALID_JSON`, không đưa raw body cho user |

## E3. Quy ước file

```
[[FILE name="ketqua.csv"]]
cot_a,cot_b
1,2
[[/FILE]]
```

Chỉ là hợp đồng giữa prompt và parser. Parser vẫn phải:

- Giới hạn số khối và kích thước.
- Chỉ cho extension/MIME trong danh sách trắng.
- Làm sạch filename.
- Thêm BOM UTF-8 cho CSV.
- Chống formula injection.
- Không thực thi nội dung.

# PHẦN F — DEPLOYMENT VÀ VẬN HÀNH

## F1. Setup

| Hàm | Tác dụng |
| :---- | :---- |
| `BIOSCOPE_SETUP()` | Tạo sheet nền và schema đã duyệt |
| `SET_WEBHOOK(webAppExecUrl)` | Đăng ký webhook `/exec` cùng secret/allowed updates |
| `INSTALL_DISPATCHER()` | Xóa trigger trùng rồi tạo trigger 5 phút |

## F2. Smoke test

1. `/start` từ admin.
2. `/start` từ chat chưa đăng ký.
3. `#hoi` và câu hỏi chuẩn.
4. Fallback tự nhiên của user không có quyền.
5. Xuất CSV có tiếng Việt và chuỗi bắt đầu `=`.
6. Replay cùng update ID.
7. Chạy dispatcher thủ công.
8. Kiểm Drive permission, log và OpenRouter usage.

## F3. Quan sát

Theo dõi tối thiểu:

| Chỉ số | Nguồn |
| :---- | :---- |
| Webhook lỗi/pending updates | Telegram `getWebhookInfo` |
| Lỗi theo mô-đun | `Bioscope_Log` |
| Denied/success/export/share | `Bioscope_Audit` |
| Update trùng | `Bioscope_ProcessedUpdates` |
| File/report | `Bioscope_Files` |
| AI requests/usage/model | Audit/usage log đã che dữ liệu |
| Quota/runtime | Apps Script dashboard/log |
| Chi phí | OpenRouter dashboard |

# PHẦN G — MÃ LỖI

| Mã | Ý nghĩa | Hành động |
| :---- | :---- | :---- |
| `AUTH-001` | User chưa đăng ký | Thêm user theo quy trình |
| `AUTH-002` | Thiếu quyền lệnh | Sửa `allowed` nếu được duyệt |
| `AUTH-003` | Scope không cho phép | Kiểm role/dataScope, không nới tạm |
| `WEBHOOK-001` | Secret không hợp lệ | Kiểm webhook registration/secret |
| `WEBHOOK-002` | Update lặp | Không xử lý lại; kiểm idempotency log |
| `DATA-001` | Không mở được spreadsheet | Kiểm ID/quyền deployment account |
| `DATA-002` | Thiếu sheet/header | Chạy schema check/migration |
| `DATA-003` | Giá trị cấu hình sai | Sửa Config, không ép default nguy hiểm |
| `AI-001` | OpenRouter tạm lỗi | Retry theo policy |
| `AI-002` | Key/model không hợp lệ | Admin kiểm property/model |
| `AI-003` | Response không hợp đồng | Không gửi raw; log metadata |
| `TG-001` | Telegram gửi tin lỗi | Kiểm HTTP/body đã redaction |
| `FILE-001` | Loại/kích thước file không hỗ trợ | Dùng CSV/TXT hoặc giảm size |
| `FILE-002` | Drive permission lỗi | Kiểm folder/file ACL |
| `SYS-001` | Lỗi không phân loại | Tra requestId, không gửi stack trace user |

# PHẦN H — SỔ SỰ CỐ

## SC-01 — Bot không nhận tin nhắn

1. Kiểm bot đúng username.
2. Kiểm `getWebhookInfo`: URL, pending và last error.
3. Kiểm deployment còn active và là URL `/exec`.
4. Kiểm version mới đã được deploy, không chỉ lưu source.
5. Kiểm webhook secret khớp.
6. Không đăng ký lại webhook bằng cách để token vào log/source.

## SC-02 — Bot nhận nhưng không trả lời

1. Tìm requestId/updateId trong log.
2. Kiểm Telegram `sendMessage` HTTP response.
3. Kiểm output AI có HTML/ký tự gây parse lỗi.
4. Kiểm Apps Script quota/runtime.
5. Thử plain text ngắn từ bot test.

## SC-03 — User bị từ chối sai

1. So `chatId` như chuỗi.
2. Kiểm `status=active`.
3. Chuẩn hóa `allowed` bằng `norm_` nhưng không sửa dữ liệu hiển thị.
4. Kiểm role/dataScope và khoảng trắng/dấu phẩy.
5. Không đổi `allowed='*'` chỉ để chữa nhanh cho user thường.

## SC-04 — User xem được dữ liệu ngoài phạm vi

Đây là sự cố chặn phát hành/an toàn:

1. Dừng mô-đun hoặc thu hồi quyền ngay.
2. Bảo toàn audit/log.
3. Kiểm cả đường `#hoi`, fallback và callback cũ.
4. Sửa `resolveDataScope_`/query, không chỉ sửa prompt.
5. Xác định report/file đã tạo và thu hồi Drive ACL.
6. Chạy lại toàn bộ TC-14–TC-16 và AT-01–AT-05.

## SC-05 — Số liệu trả lời sai

1. Chốt câu hỏi, kỳ, timezone, phạm vi và định nghĩa chỉ số.
2. Tính expected trực tiếp từ sheet test.
3. Kiểm data dictionary, kiểu số/ngày và filter.
4. Tách lỗi truy vấn khỏi lỗi AI: log kết quả aggregate an toàn trước diễn giải.
5. Nếu truy vấn đúng nhưng AI nói sai, dùng output có cấu trúc/template thay cho text tự do.

## SC-06 — Báo cáo/cảnh báo gửi trùng

1. Kiểm `update_id` và khóa nghiệp vụ.
2. Kiểm hai trigger `biosDispatch_` có tồn tại không.
3. Kiểm `LockService` bao đoạn check+write.
4. Kiểm `lastRunKey`/`lastTriggeredKey` theo đúng timezone.
5. Không chữa bằng tăng cooldown nếu idempotency vẫn sai.

## SC-07 — Session không hết hạn

1. Kiểm session có `t` dạng số milliseconds.
2. Kiểm trigger chạy và `insTimeoutScan_` được đăng ký.
3. Kiểm JSON hỏng không làm dừng vòng scan.
4. Quét theo lô nếu số properties lớn.

## SC-08 — Drive không thấy file/thư mục

1. Kiểm ID đúng tài nguyên DA4.
2. Kiểm tài khoản execute-as có quyền.
3. Nếu Shared Drive/Excel, kiểm service và tùy chọn hỗ trợ phù hợp.
4. Không bật public link để “test cho nhanh”.

## SC-09 — CSV lỗi dấu hoặc chạy công thức

1. Kiểm BOM `\uFEFF` ở đầu.
2. Escape quote/comma/newline theo CSV.
3. Trung hòa ô bắt đầu bằng `=`, `+`, `-`, `@`.
4. Test cả Excel và Google Sheets.

## SC-10 — OpenRouter lỗi hoặc chi phí tăng

1. Kiểm model slug và trạng thái key.
2. Xem HTTP code, không log raw Authorization/context.
3. Kiểm retry có nhân số request không.
4. Kiểm context rows/chars và `max_tokens`.
5. Đổi model theo release procedure và chạy UAT mẫu.
6. Dùng budget/alert của tài khoản nhà cung cấp.

## SC-11 — Apps Script hết quota/thời gian

1. Xác định quota nào hết: runtime, UrlFetch, Sheets, trigger.
2. Giảm vùng đọc, batch `getValues/setValues`, cache Config/dictionary.
3. Chia dispatcher thành lô có checkpoint.
4. Dừng trước timeout và để lượt sau tiếp tục.
5. Nếu tải thực tế vượt nền tảng, lập quyết định chuyển kiến trúc; không che lỗi bằng retry vô hạn.

## SC-12 — Nghi lộ token/key

1. Thu hồi/xoay key ngay.
2. Xóa hoặc đổi webhook nếu token Telegram lộ.
3. Giữ bằng chứng và xác định phạm vi truy cập.
4. Quét source, lịch sử commit, log, tệp, ảnh và chat.
5. Cập nhật Script Properties qua kênh an toàn.
6. Chạy test sau xoay key và lập biên bản sự cố.

# PHẦN I — VIỆC CÒN MỞ

| # | Việc | Trạng thái |
| :----: | :---- | :---- |
| 1 | Chốt schema thật của `OPS_SHEET_ID` | Chưa xác nhận |
| 2 | Chốt role/dataScope/cột nhạy cảm | Chưa xác nhận |
| 3 | Chốt report, alert, import, dashboard | Chưa xác nhận |
| 4 | Chốt SLA, quota và ngân sách | Chưa xác nhận |
| 5 | Chốt retention và quyền Drive | Chưa xác nhận |
| 6 | Triển khai FIX-01 đến FIX-12 | Chưa có bằng chứng |
| 7 | Chạy DA4-07 và ký UAT | Chưa thực hiện |
| 8 | Ghi release/deployment thật | Chưa thực hiện |

# PHẦN J — TÀI LIỆU LIÊN QUAN

- [Thiết kế kiến trúc](DA4-03-cd2-thiet-ke-kien-truc.md)
- [Thiết kế dữ liệu](DA4-04-cd2-thiet-ke-du-lieu.md)
- [Triển khai](DA4-08-cd5-6-7-dong-goi-trien-khai.md)
- [Hướng dẫn sử dụng](DA4-09-huong-dan-su-dung.md)
