<!--HOSO
phu_de: Chatbot Bioscope trên Telegram, Google Drive và Google Sheets
pham_vi: Dự án DA4 — Công đoạn 2, thiết kế giao diện và luồng dự thảo
ngay_lap: 03/09/2026
phien_ban: 0.1
nguoi_lap: Bộ phận Phát triển phần mềm — Công ty Bioscope
nguoi_duyet: Chưa xác nhận
lich_su: 0.1 | 03/09/2026 | Thiết kế Telegram UI và luồng Google Workspace
-->
# DA4 — CÔNG ĐOẠN 2: THIẾT KẾ GIAO DIỆN VÀ LUỒNG NGƯỜI DÙNG
## Chatbot Bioscope trên Telegram, Google Drive và Google Sheets

---

## 1. Nguyên tắc trải nghiệm

1. Người dùng thấy tác vụ chính trong tối đa hai lần chạm từ `/menu`.
2. Bot luôn nói rõ đang chờ dữ liệu gì và cách thoát bằng `/huy`.
3. Tin nhắn phân biệt dữ liệu nguồn, diễn giải AI và trạng thái lỗi.
4. Từ chối quyền không tiết lộ tên sheet, cột hoặc dữ liệu bị chặn.
5. Tác vụ lâu xác nhận ngay, sau đó gửi kết quả khi hoàn tất.
6. Mọi tệp/link kèm kỳ dữ liệu, thời điểm tạo và phạm vi.
7. Không dùng bảng phím quá dài; callback phải phân trang và dưới 64 byte.

## 2. Bản đồ giao diện Telegram

```
/hi hoặc /menu
├── 🔎 Hỏi dữ liệu             → Insight
├── 📊 Tạo báo cáo             → Report
│   ├── Ngày
│   ├── Tuần
│   └── Tháng
├── 📁 Phân tích tệp           → Import (nếu được bật)
├── 📈 Tạo dashboard           → Dashboard (nếu được bật)
├── 🔔 Cảnh báo của tôi        → xem trạng thái đăng ký
├── ❓ Trợ giúp
└── ⚙️ Quản trị                → chỉ admin
    ├── Trạng thái cấu hình
    ├── Kiểm webhook
    ├── Kiểm trigger
    └── Hướng dẫn cấp quyền
```

Menu được dựng theo quyền. Nút không được cấp không xuất hiện; nếu user gọi lệnh trực tiếp, backend vẫn kiểm lại.

## 3. Từ điển lệnh

| Lệnh/nhãn | Người dùng | Kết quả |
| :---- | :---- | :---- |
| `/hi`, `/start` | Mọi chat | Chào, nhận diện trạng thái đăng ký, hướng dẫn tiếp |
| `/menu` | User active | Mở menu theo quyền |
| `/huy`, `/cancel` | User đang có phiên | Xóa phiên hiện tại |
| `/help` | Mọi chat | Hướng dẫn lệnh và cách liên hệ admin |
| `#hoi` | Có quyền `hoi` | Mở phiên đặt câu hỏi |
| `#baocao` | Có quyền `baocao` | Chọn loại/kỳ/định dạng báo cáo |
| `#phantich` | Có quyền `phantich` | Yêu cầu gửi tệp được hỗ trợ |
| `#dashboard` | Có quyền `dashboard` | Chọn phạm vi và tạo sheet/chart |

Tên lệnh cuối cùng phải được đăng ký với BotFather và chốt trong UAT. Các hashtag ngoài `#hoi` là mô-đun đề xuất.

## 4. Quy tắc nội dung tin nhắn

### 4.1 Mẫu phản hồi chuẩn

| Thành phần | Bắt buộc | Ví dụ |
| :---- | :----: | :---- |
| Trạng thái | ✅ | `✅ Đã tạo báo cáo` |
| Kỳ/phạm vi | Khi có | `Kỳ: 01–31/08/2026 · Phạm vi: Miền Bắc` |
| Kết quả chính | ✅ | 1–5 dòng số liệu quan trọng |
| Nguồn | Khi truy vấn dữ liệu | `Nguồn: Sales_Daily, cập nhật 18:00 03/09/2026` |
| Tệp/link | Khi có | Tên tệp và quyền truy cập |
| Hành động tiếp | Khi cần | `Chọn “Xuất CSV” hoặc gõ /huy` |

### 4.2 Trạng thái

| Ký hiệu | Ý nghĩa | Cách dùng |
| :----: | :---- | :---- |
| ✅ | Hoàn tất | Có kết quả cuối |
| ⏳ | Đang xử lý | Tác vụ lâu, chưa phải kết quả |
| ⚠️ | Hoàn tất một phần/cần chú ý | Thiếu dữ liệu hoặc cắt phạm vi |
| ⛔ | Từ chối quyền/chính sách | Không tiết lộ dữ liệu bị chặn |
| ❌ | Lỗi | Nêu bước thử lại hoặc mã hỗ trợ |

### 4.3 Độ dài và định dạng

- Câu trả lời chính ưu tiên ngắn; bảng dài chuyển thành CSV.
- Nếu vượt giới hạn Telegram, chia thành nhiều tin có số thứ tự.
- Không gửi HTML do AI tạo trực tiếp. Escape hoặc dùng plain text.
- Không đặt raw URL chứa token vào tin nhắn.
- Tên file không chứa dữ liệu cá nhân hoặc nội dung câu hỏi.

## 5. Luồng đăng ký và chào

```
Người dùng → /start
  ├─ không có trong Bioscope_Users
  │    → “Tài khoản chưa được cấp quyền”
  │    → hiển thị chatId để người dùng gửi admin (nếu chính sách cho phép)
  │    → không đọc dữ liệu, không gọi AI
  ├─ status=pending/disabled
  │    → thông báo trạng thái và đầu mối hỗ trợ
  └─ status=active
       → chào theo tên
       → hiển thị menu theo allowed
```

Admin cấp quyền bằng cách thêm/sửa `Bioscope_Users`. Không có luồng tự đăng ký quyền trong bản đầu.

## 6. Luồng hỏi dữ liệu

### 6.1 Khởi động bằng lệnh

```
User → #hoi
Bot  → kiểm active + quyền hoi
Bot  → “Hãy đặt câu hỏi về dữ liệu. Gõ /huy để thoát.”
User → “Doanh thu tháng 8 theo khu vực?”
Bot  → ⏳ xác nhận đang xử lý
Bot  → câu trả lời + nguồn + nút [Xuất CSV] [Hỏi tiếp] [Kết thúc]
```

### 6.2 Câu hỏi tự nhiên

Nếu user active gửi một câu có ít nhất 4 ký tự và có khoảng trắng ngoài session:

1. Router xác định có quyền `hoi`.
2. Nếu không quyền, bot từ chối như khi gọi `#hoi`.
3. Nếu có quyền, câu được chuyển vào cùng `insAsk_`.
4. Không được tồn tại đường fallback bỏ qua phân quyền.

### 6.3 Câu hỏi mơ hồ

Bot không đoán kỳ hoặc chỉ số quan trọng. Ví dụ:

> Bạn muốn xem **doanh thu trước thuế** hay **doanh thu thuần**? Chọn một mục bên dưới.

Các lựa chọn dùng callback ngắn: `ins:metric:gross`, `ins:metric:net`.

### 6.4 Không đủ dữ liệu

Phản hồi gồm:

- Phạm vi đã kiểm.
- Mốc cập nhật gần nhất.
- Trường hoặc kỳ đang thiếu.
- Hành động tiếp: sửa câu hỏi, chọn kỳ khác hoặc liên hệ chủ dữ liệu.

Không để AI “điền” con số thiếu bằng suy luận.

## 7. Luồng xuất CSV

```
Kết quả Insight
  → [Xuất CSV]
  → callback ins:export:<request-short-id>
  → kiểm lại user + quyền + dataScope
  → lấy kết quả đã chuẩn hóa hoặc chạy truy vấn lại
  → chống formula injection + thêm BOM
  → lưu Drive/exports/YYYY/MM
  → gửi document Telegram
  → ghi Bioscope_Files + Audit
```

Nếu kết quả đã hết hạn, bot yêu cầu chạy lại truy vấn thay vì xuất từ session cũ.

## 8. Luồng báo cáo

```
User → #baocao
Bot  → chọn loại báo cáo
Bot  → chọn kỳ: ngày / tuần / tháng / tùy chọn
Bot  → chọn phạm vi (chỉ các scope được phép)
Bot  → chọn định dạng: tin nhắn / CSV / Google Sheet
Bot  → màn hình xác nhận
User → [Tạo báo cáo]
Bot  → ⏳ Đã nhận yêu cầu <requestId>
Bot  → ✅ kết quả + file/link hoặc ❌ lỗi + mã hỗ trợ
```

Nút xác nhận dùng idempotency key. Bấm hai lần không tạo hai báo cáo.

## 9. Luồng nhận tệp phân tích

| Bước | Giao diện |
| :---- | :---- |
| 1 | User gọi `#phantich` |
| 2 | Bot nêu định dạng, kích thước tối đa và dữ liệu không được gửi |
| 3 | User gửi document |
| 4 | Bot kiểm quyền, MIME, kích thước và tên |
| 5 | CSV/TXT được đọc trực tiếp; Excel chỉ nhận khi Drive Service đã bật |
| 6 | Bot hiển thị tóm tắt số dòng/cột và hỏi xác nhận phạm vi phân tích |
| 7 | Sau xác nhận, bot phân tích và gửi kết quả |
| 8 | Upload được xóa theo retention đã duyệt |

Tệp lỗi không được chuyển sang AI “thử xem đọc được không”.

## 10. Luồng cảnh báo tự động

```
Dispatcher → đọc Alert_Rules active
  → lấy metric theo dataScope
  → so ngưỡng
  ├─ chưa vượt → không gửi
  └─ vượt
       → kiểm cooldown + lastTriggeredKey
       → gửi người nhận đã duyệt
       → ghi audit và khóa chống trùng
```

Tin cảnh báo phải có chỉ số, giá trị, ngưỡng, kỳ, nguồn và thời điểm. Không chỉ gửi “có vấn đề”.

## 11. Luồng hủy và timeout

| Tình huống | Phản hồi |
| :---- | :---- |
| User gõ `/huy` | `Đã hủy thao tác hiện tại.` và xóa session |
| User gửi dữ liệu sau khi session hết hạn | `Phiên đã hết hạn. Hãy bắt đầu lại từ /menu.` |
| Session JSON hỏng | Xóa riêng session, ghi lỗi, yêu cầu bắt đầu lại |
| Quyền bị thu hồi giữa phiên | Từ chối tiếp tục và xóa session |

## 12. Luồng lỗi

| Mã hiển thị | Tình huống | Tin nhắn người dùng |
| :---- | :---- | :---- |
| `AUTH-001` | Chưa đăng ký | Hướng dẫn liên hệ admin |
| `AUTH-002` | Thiếu quyền | Nêu tên chức năng, không nêu dữ liệu bị chặn |
| `DATA-001` | Thiếu sheet/header | Báo dữ liệu tạm chưa sẵn sàng, gửi mã hỗ trợ |
| `AI-001` | AI tạm lỗi | Cho thử lại, không nói chắc đã xử lý |
| `FILE-001` | File không hỗ trợ | Nêu danh sách định dạng cho phép |
| `SYS-001` | Lỗi không phân loại | Xin thử lại và gửi requestId |

Chi tiết quản trị nằm ở DA4-10; tin nhắn người dùng không chứa stack trace.

## 13. Giao diện quản trị trên Google Sheets

DA4 không có màn hình web quản trị riêng trong bản đầu. Google Sheets là giao diện quản trị:

| Sheet | Ai sửa | Quy tắc giao diện |
| :---- | :---- | :---- |
| `Bioscope_Users` | Admin | Data validation cho role/status; khóa hàng header |
| `Config` | Admin kỹ thuật | Cột mô tả/đơn vị; không chứa secret |
| `Report_Schedules` | Admin/chủ báo cáo | Dropdown cho period/format/active |
| `Alert_Rules` | Admin/chủ chỉ số | Dropdown operator; định dạng số ngưỡng |
| `Bioscope_Log` | Chỉ hệ thống ghi | User chỉ đọc; bật filter view |
| `Bioscope_Audit` | Chỉ hệ thống ghi | Bảo vệ sheet, không sửa tay |

Các vùng nhập phải có validation và protected range. Không dựa vào màu ô để quyết định logic.

## 14. Khả năng tiếp cận

- Mỗi trạng thái có cả chữ và biểu tượng; không chỉ dùng màu.
- Nút ngắn, động từ rõ: `Tạo báo cáo`, `Xuất CSV`, `Hủy`.
- Tiếng Việt có dấu là chuẩn; `norm_` chỉ dùng để so khớp, không dùng để hiển thị.
- Ngày luôn ghi đủ ngày/tháng/năm; số có đơn vị.
- Câu trả lời quan trọng không chỉ nằm trong ảnh/chart; có tóm tắt text.

## 15. Bộ nội dung cần chủ dự án duyệt

1. Tên bot và lời chào chính thức.
2. Danh sách lệnh/nhãn nút.
3. Vai trò và menu tương ứng.
4. Ba câu hỏi mẫu và câu trả lời mong đợi.
5. Mẫu báo cáo, cảnh báo và thông báo lỗi.
6. Cách hiển thị nguồn dữ liệu.
7. Đầu mối hỗ trợ khi thiếu quyền hoặc dữ liệu sai.

## 16. Tài liệu liên quan

- [Yêu cầu](DA4-02-cd1-xac-dinh-yeu-cau.md)
- [Kiến trúc](DA4-03-cd2-thiet-ke-kien-truc.md)
- [Hướng dẫn sử dụng](DA4-09-huong-dan-su-dung.md)
- [Tra cứu kỹ thuật](DA4-10-tra-cuu-ky-thuat.md)
