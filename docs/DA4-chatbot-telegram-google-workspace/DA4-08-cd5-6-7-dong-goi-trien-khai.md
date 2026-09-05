<!--HOSO
phu_de: Chatbot Bioscope trên Telegram, Google Drive và Google Sheets
pham_vi: Dự án DA4 — Công đoạn 5, 6, 7; kế hoạch triển khai và bàn giao
ngay_lap: 03/09/2026
phien_ban: 0.1
nguoi_lap: QuanNH — Team Lead, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 0.1 | 03/09/2026 | Lập checklist đóng gói, triển khai và phát hành dự thảo
-->
# DA4 — CÔNG ĐOẠN 5, 6, 7
## Hoàn thiện · Đóng gói · Cài đặt · Chuyển giao · Bảo trì · Phát hành

---

# PHẦN A — CÔNG ĐOẠN 5: HOÀN THIỆN VÀ ĐÓNG GÓI

## A1. Đơn vị đóng gói

DA4 không đóng gói thành container. Một bản phát hành gồm:

| Thành phần | Đơn vị phiên bản |
| :---- | :---- |
| Mã Google Apps Script | Git commit/tag hoặc bản export + Apps Script version |
| Web App | Deployment ID và URL `/exec` |
| Cấu hình | Danh mục tên Script Properties, không gồm secret thật |
| Google Sheets | Phiên bản schema/header và data dictionary |
| Google Drive | Cấu trúc thư mục và ma trận quyền |
| Telegram | Bot username, command list, webhook status đã che token |
| Trigger | Handler, lịch chạy và ảnh/trích xuất cấu hình |
| Tài liệu | Bộ DA4-01 đến DA4-10 cùng phiên bản |

## A2. Checklist trước đóng gói

| # | Kiểm tra | Bằng chứng | Đạt |
| :----: | :---- | :---- | :----: |
| 1 | Tất cả yêu cầu bắt buộc có mã và ca test | Ma trận YC ↔ TC | ☐ |
| 2 | FIX-01 đến FIX-12 trong DA4-06 đã xử lý | Diff + test | ☐ |
| 3 | Không có secret trong source/tài liệu/log mẫu | Báo cáo secret scan | ☐ |
| 4 | `appsscript.json` đúng timezone và service | Tệp manifest | ☐ |
| 5 | Chỉ một `doPost`, một router và một dispatcher chính | Rà source | ☐ |
| 6 | Bot/config/ops/folder là tài nguyên riêng của DA4 | Biên bản tài nguyên | ☐ |
| 7 | Header sheet đúng schema đã duyệt | Schema check | ☐ |
| 8 | Drive mặc định private | Ma trận quyền | ☐ |
| 9 | Webhook secret và idempotency hoạt động | TC-03, TC-43 | ☐ |
| 10 | Trigger không trùng | TC-40 | ☐ |
| 11 | Cấu hình model và hạn mức chi phí đã duyệt | Ảnh dashboard đã che key | ☐ |
| 12 | UAT đạt và biên bản có chữ ký | DA4-07 | ☐ |
| 13 | Rollback đã thử trên môi trường test | Biên bản diễn tập | ☐ |
| 14 | Changelog và version release đã lập | Tệp phát hành | ☐ |

## A3. Cấu trúc gói bàn giao

```
DA4-release-x.y.z/
├── source/                  # mã Apps Script, không có secret
├── manifests/
│   ├── appsscript.json
│   ├── script-properties.example.md
│   ├── sheet-schema.md
│   └── drive-permissions.md
├── tests/
│   ├── test-report.md
│   └── fixtures/            # dữ liệu giả đã ẩn danh
├── docs/                    # DA4-01 ... DA4-10
├── CHANGELOG.md
└── RELEASE.md
```

Không đặt bản export Script Properties có giá trị thật, token BotFather, API key hoặc file dữ liệu nghiệp vụ trong gói.

## A4. Phiên bản và changelog

Mỗi release record:

| Trường | Nội dung |
| :---- | :---- |
| Version | `MAJOR.MINOR.PATCH` |
| Commit/export | Hash hoặc checksum |
| Apps Script version | Số version |
| Deployment ID | Giá trị quản trị nội bộ |
| Schema version | Phiên bản sheet/session |
| Thay đổi | Added/Changed/Fixed/Security |
| Migration | Có/không và cách chạy |
| Rollback | Version/deployment trước |
| Người duyệt | Họ tên và ngày |

# PHẦN B — CÔNG ĐOẠN 6: CÀI ĐẶT, CHUYỂN GIAO VÀ BẢO TRÌ

## B1. Điều kiện trước cài đặt

- Tài khoản Google do công ty quản lý, có quyền tạo Apps Script, Sheets và Drive folder.
- Bot Telegram riêng đã tạo qua BotFather.
- OpenRouter account/key có budget và giới hạn chi tiêu.
- Hai spreadsheet riêng: cấu hình và nghiệp vụ.
- Một Drive folder gốc riêng, quyền tối thiểu.
- Chủ dữ liệu đã duyệt data dictionary, role, dataScope và ba câu hỏi UAT.
- Người triển khai có danh sách secret qua kênh quản lý bí mật, không qua tài liệu này.

## B2. Tạo tài nguyên

| Bước | Việc | Ghi lại |
| :----: | :---- | :---- |
| 1 | Tạo bot Telegram DA4 | Username, người sở hữu, không ghi token |
| 2 | Tạo spreadsheet config | ID lưu trong secret inventory |
| 3 | Tạo/cấp `OPS_SHEET_ID` | Chủ dữ liệu, quyền, schema version |
| 4 | Tạo Drive root | Folder ID, owner, ma trận quyền |
| 5 | Tạo Apps Script project | Project ID, owner, timezone |
| 6 | Tạo OpenRouter key riêng | Owner, budget, ngày xoay key |

## B3. Nạp mã và cấu hình

1. Nạp đúng source của release đã duyệt vào project Apps Script.
2. Đặt timezone project là `Asia/Ho_Chi_Minh`.
3. Bật V8 runtime.
4. Nếu nhận Excel, bật Advanced Drive Service theo version được hỗ trợ.
5. Đặt Script Properties:

   - `BIOSCOPE_TOKEN`
   - `TELEGRAM_WEBHOOK_SECRET`
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_MODEL`
   - `OPENROUTER_SITE` và `OPENROUTER_APP` nếu dùng
   - `BIOSCOPE_SHEET_ID`
   - `OPS_SHEET_ID`
   - `BIOSCOPE_ADMIN_ID`
   - `BIOSCOPE_ROOT_FOLDER_ID`

6. Không chụp màn hình có giá trị secret. Nếu cần bằng chứng, chỉ chụp tên key.

## B4. Khởi tạo dữ liệu

1. Chạy `BIOSCOPE_SETUP` trên tài khoản triển khai.
2. Kiểm `Bioscope_Users`, `Bioscope_Log` và các sheet mở rộng đã duyệt.
3. Thêm admin thật với `allowed='*'`, `status='active'`.
4. Thêm user UAT theo scope test.
5. Tạo protected ranges cho log/audit/processed updates.
6. Điền `Config`, `Data_Dictionary`, schedule/rule bằng dữ liệu đã duyệt.
7. Chạy schema check; không tiếp tục nếu thiếu header.

## B5. Deploy Web App

1. Chọn **Deploy → New deployment → Web app**.
2. Execute as: tài khoản triển khai do công ty quản lý.
3. Access: theo phương án Apps Script cần để Telegram gọi; Build Guide dùng `Anyone`.
4. Ghi Apps Script version, Deployment ID và URL kết thúc `/exec`.
5. Chạy health/setup check không chứa secret.
6. Không dùng URL `/dev` cho Telegram production.

Web App có thể truy cập ẩn danh nên xác minh webhook secret ở code là chốt bắt buộc.

## B6. Đăng ký webhook

Thực hiện bằng hàm quản trị hoặc request an toàn, không đưa token vào lịch sử shell/source.

Sau đăng ký, kiểm Telegram `getWebhookInfo` và lưu các trường an toàn:

- URL domain/path đã che phần nhạy cảm.
- `pending_update_count`.
- `last_error_date` và `last_error_message` nếu có.
- `max_connections` và allowed updates nếu cấu hình.

Không lưu token trong ảnh hoặc log.

## B7. Cài Dispatcher

1. Chạy `INSTALL_DISPATCHER`.
2. Kiểm chỉ có một trigger `biosDispatch_`.
3. Xác nhận chu kỳ 5 phút và tài khoản sở hữu.
4. Chạy `biosDispatch_` thủ công với dữ liệu test.
5. Kiểm timeout, report/alert scan và `bcSafe_`.

## B8. Kiểm sau triển khai

| # | Kiểm tra | Kết quả |
| :----: | :---- | :----: |
| 1 | `/start`, `/menu` từ admin | ☐ |
| 2 | User chưa đăng ký bị từ chối | ☐ |
| 3 | User hạn chế không vượt dataScope | ☐ |
| 4 | Ba câu hỏi UAT trả đúng | ☐ |
| 5 | CSV tiếng Việt và formula-safe | ☐ |
| 6 | File nằm đúng Drive folder và quyền | ☐ |
| 7 | Replay update không gửi trùng | ☐ |
| 8 | OpenRouter 401/429/5xx được xử lý | ☐ |
| 9 | Trigger chỉ có một, session được dọn | ☐ |
| 10 | Log/audit đủ requestId, không lộ dữ liệu | ☐ |
| 11 | Budget/usage OpenRouter hiển thị đúng | ☐ |
| 12 | Rollback target còn khả dụng | ☐ |

## B9. Nâng cấp

1. Sao lưu source version, config sheet, schema và tệp liên quan.
2. Đọc changelog và migration.
3. Chạy bộ test trên deployment test với dữ liệu giả.
4. Tạo Apps Script version mới.
5. Cập nhật deployment sang version mới, giữ URL khi phù hợp.
6. Kiểm webhook, trigger, quyền và UAT smoke.
7. Theo dõi log/chi phí trong cửa sổ đã duyệt.
8. Nếu lỗi chặn phát hành, rollback ngay.

Mỗi lần sửa code webhook phải tạo version mới; lưu code nhưng không cập nhật deployment thì production vẫn chạy bản cũ.

## B10. Rollback

| Tình huống | Cách quay lại |
| :---- | :---- |
| Code lỗi | Trỏ deployment về Apps Script version trước |
| Schema lỗi | Dừng trigger/webhook, phục hồi bản sao sheet hoặc chạy migration ngược đã thử |
| Model lỗi/đắt | Đổi `OPENROUTER_MODEL` về model đã duyệt |
| Key lộ | Thu hồi/xoay key trước, sau đó điều tra log và cập nhật property |
| Bot bị lạm dụng | Xóa webhook hoặc đổi secret; không xóa dữ liệu trước khi lưu bằng chứng |
| Drive share sai | Thu hồi quyền ngay, ghi audit và đánh giá dữ liệu đã truy cập |

Rollback code không tự rollback dữ liệu. Migration phải nêu rõ tính thuận/nghịch và backup bắt buộc.

## B11. Bảo trì định kỳ

| Chu kỳ | Việc |
| :---- | :---- |
| Hàng ngày | Xem lỗi mới, webhook backlog, tác vụ gửi thất bại |
| Hàng tuần | Kiểm trigger, session tồn, file quá hạn, report/alert trùng |
| Hàng tháng | Kiểm usage/chi phí OpenRouter, quota Apps Script, quyền Drive/Sheets |
| Hàng quý | Xoay key theo chính sách, rà user/allowed/dataScope, chạy test an toàn |
| Mỗi release | Secret scan, UAT smoke, cập nhật DA4-08/10 |

## B12. Bàn giao

| Hạng mục | Bàn giao cho | Xác nhận |
| :---- | :---- | :----: |
| Quyền sở hữu bot | Quản trị công ty | ☐ |
| Quyền Apps Script project | Quản trị kỹ thuật | ☐ |
| Hai spreadsheet và Drive root | Chủ dữ liệu + quản trị | ☐ |
| OpenRouter account/budget | Quản trị tài chính/kỹ thuật | ☐ |
| Source và release package | Quản trị mã nguồn | ☐ |
| Bộ test và dữ liệu giả | QA/chủ dự án | ☐ |
| Tài liệu người dùng/runbook | Người dùng và vận hành | ☐ |
| Danh sách secret inventory | Người quản lý bí mật | ☐ |

# PHẦN C — CÔNG ĐOẠN 7: PHÁT HÀNH

## C1. Hình thức phát hành

DA4 là sản phẩm nội bộ. Phát hành là đưa một Apps Script Web App version vào vận hành, gắn webhook của bot Telegram công ty và cấp quyền cho danh sách người dùng đã duyệt. Không phát hành mã hoặc bot công khai cho người dùng bên ngoài.

## C2. Điều kiện phát hành

- DA4-07 có kết luận nghiệm thu và chữ ký.
- Không còn lỗi chặn phát hành hoặc cao chưa xử lý.
- Bot, project, Sheets và Drive thuộc tài khoản công ty.
- Secret/budget/retention/permission đã duyệt.
- Rollback được diễn tập.
- Hướng dẫn sử dụng và đầu mối hỗ trợ đã gửi người dùng.

## C3. Bằng chứng phát hành

| Bằng chứng | Trạng thái hiện tại |
| :---- | :---- |
| Release tag/commit/export checksum | Chưa có |
| Apps Script version + deployment record | Chưa có |
| Telegram webhook info | Chưa có |
| Trigger list | Chưa có |
| UAT sign-off | Chưa có |
| Thông báo phát hành nội bộ | Chưa có |
| Log lượt dùng production đầu tiên | Chưa có |

## C4. Biên bản phát hành

| Trường | Giá trị |
| :---- | :---- |
| Version | |
| Ngày/giờ | |
| Deployment | |
| Người triển khai | |
| Người phê duyệt | |
| Kết quả smoke test | |
| Rollback version | |
| Sự cố sau phát hành | |

## C5. Trạng thái hồ sơ

Tại ngày lập v0.1, chưa có bằng chứng DA4 đã được đóng gói, triển khai, bàn giao hoặc phát hành. Phần C là checklist và biểu mẫu cho công đoạn tương lai, không phải xác nhận hoàn tất.

## C6. Tài liệu liên quan

- [Nhật ký lập trình](DA4-06-cd3-lap-trinh-va-nhat-ky.md)
- [Kiểm thử và UAT](DA4-07-cd4-kiem-thu-va-uat.md)
- [Hướng dẫn sử dụng](DA4-09-huong-dan-su-dung.md)
- [Tra cứu kỹ thuật](DA4-10-tra-cuu-ky-thuat.md)
