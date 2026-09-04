<!--HOSO
phu_de: Mục lục toàn bộ hồ sơ bốn dự án
pham_vi: Toàn bộ hồ sơ
ngay_lap: 03/09/2026
phien_ban: 1.1
nguoi_lap: Bộ phận Phát triển phần mềm — Công ty Bioscope
nguoi_duyet: Ban Giám đốc
lich_su: 1.0 | 03/09/2026 | Ban hành lần đầu
lich_su: 1.1 | 03/09/2026 | Bổ sung hồ sơ thiết kế DA4 — chatbot Telegram và Google Workspace
-->
# HỒ SƠ SẢN XUẤT PHẦN MỀM NỘI BỘ — CÔNG TY BIOSCOPE

**Mục đích.** Bộ hồ sơ quản lý ba sản phẩm đã có bằng chứng phát triển (DA1–DA3) và một dự án đang ở giai đoạn thiết kế trước triển khai (DA4). Hồ sơ DA1–DA3 dùng để đối chiếu việc **đội ngũ nội bộ của công ty trực tiếp phát triển**; hồ sơ DA4 hiện là yêu cầu, thiết kế, checklist và biểu mẫu, chưa phải bằng chứng phần mềm đã hoàn thành.

**Phạm vi.** Bốn dự án độc lập, mỗi dự án có bộ xương mười tài liệu theo bảy công đoạn. Trạng thái hoàn tất của từng công đoạn được ghi riêng, không suy diễn từ việc tài liệu đã tồn tại.

---

## 1. Bốn dự án

| Mã | Sản phẩm | Bản chất | Quy mô mã nguồn | Thời gian phát triển |
| :---- | :---- | :---- | :---- | :---- |
| **DA1** | Website Bioscope & Hệ quản trị nội dung | Ứng dụng web hai lớp: cổng thông tin công khai đa ngữ + hệ quản trị nội dung tự xây trên nền Payload/Next.js | ~51.300 dòng TypeScript | 15/06/2026 – nay |
| **DA2** | Hệ thống AI chuẩn hoá và cập nhật dữ liệu sản phẩm | Dây chuyền tự động: quét kho tài liệu → bóc tách nội dung → gọi mô hình ngôn ngữ → sinh dữ liệu nguyên liệu có cấu trúc → ghi vào hệ quản trị | ~4.200 dòng TypeScript | 07/2026 – nay |
| **DA3** | Chatbot AI đa kênh BioBot | Trợ lý hội thoại có truy hồi tri thức (RAG), phục vụ đồng thời web, Zalo, Telegram, Messenger, WhatsApp; có chuyển tiếp người thật | ~47.700 dòng Python/JavaScript + 44 quy trình tự động hoá + 7.600 dòng tài liệu kỹ thuật | 06/02/2026 – 12/06/2026 |
| **DA4** | Chatbot Bioscope trên Telegram và Google Workspace | Trợ lý nội bộ chạy trên Google Apps Script; đọc Google Sheets, tạo tệp trên Google Drive, giao tiếp Telegram và gọi AI qua OpenRouter | Chưa có bằng chứng mã nguồn trong phạm vi hồ sơ | Thiết kế từ 03/09/2026 |

DA3 làm trước (02–06/2026), DA1 và DA2 làm sau (06/2026 đến nay). DA4 kế thừa kinh nghiệm chatbot nhưng chọn kiến trúc Google Apps Script nhẹ hơn. DA4 chỉ được ghi nhận là đã triển khai khi có project/version, lịch sử thay đổi, kết quả kiểm thử và biên bản nghiệm thu riêng.

---

## 2. Cấu trúc bộ hồ sơ

```
docs/
├── README.md                          ← đang đọc: mục lục và bảng đối chiếu
│
├── 00-ho-so-chung/                    Hồ sơ nền; DA4 dùng phần quy trình phù hợp
│   ├── 00-1-thuyet-minh-nang-luc-va-doi-ngu.md
│   ├── 00-2-quy-trinh-san-xuat-phan-mem-noi-bo.md
│   ├── 00-3-doi-chieu-ho-so-theo-cong-doan.md
│   ├── 00-4-ha-tang-cong-cu-va-moi-truong.md
│   ├── 00-5-quy-chuan-ma-nguon-va-quan-ly-phien-ban.md
│   └── 00-6-ho-so-chi-phi-phat-trien.md
│                                      6 tài liệu · 1.407 dòng
│
├── DA1-website-va-cms/                11 tài liệu · 4.006 dòng
├── DA2-ai-chuan-hoa-du-lieu/          10 tài liệu · 3.154 dòng
├── DA3-chatbot-ai-da-kenh/            10 tài liệu · 3.755 dòng
├── DA4-chatbot-telegram-google-workspace/
│                                        10 tài liệu · 2.716 dòng · dự thảo v0.1
│
└── _cong-cu/                          Công cụ dựng bản .docx (không phải hồ sơ)
```

Mỗi thư mục dự án có cùng một bộ xương mười tài liệu:

| Tệp | Nội dung | Công đoạn tương ứng |
| :---- | :---- | :---- |
| `-01-thuyet-minh-san-pham` | Sản phẩm là gì, giải quyết việc gì, ai dùng, phạm vi | — |
| `-02-cd1-xac-dinh-yeu-cau` | Bối cảnh, yêu cầu nghiệp vụ, yêu cầu chức năng, yêu cầu phi chức năng, tiêu chí nghiệm thu | 1 |
| `-03-cd2-thiet-ke-kien-truc` | Kiến trúc tổng thể, phân rã thành phần, luồng xử lý, quyết định kỹ thuật và lý do | 2 |
| `-04-cd2-thiet-ke-du-lieu` | Mô hình dữ liệu đầy đủ, từng bảng, từng trường, ràng buộc, quan hệ | 2 |
| `-05-cd2-thiet-ke-giao-dien-va-luong` | Bản đồ màn hình, luồng người dùng, quy tắc hiển thị | 2 |
| `-06-cd3-lap-trinh-va-nhat-ky` | Tổ chức mã nguồn, quy ước, nhật ký phát triển theo mốc | 3 |
| `-07-cd4-kiem-thu-va-uat` | Chiến lược kiểm thử, bộ ca kiểm thử, biên bản nghiệm thu | 4 |
| `-08-cd5-6-7-dong-goi-trien-khai` | Đóng gói, phiên bản, cài đặt, chuyển giao, bảo trì, phát hành | 5, 6, 7 |
| `-09-huong-dan-su-dung` | Tài liệu hướng dẫn cho người dùng cuối và quản trị viên | 6 |
| `-10-tra-cuu-ky-thuat` | Sổ tra cứu: API, cấu hình, mã lỗi, sự cố đã gặp và cách xử lý | 3, 6 |

Riêng DA1 có thêm một tài liệu thao tác ngoài bộ xương chung:

| Tệp | Nội dung | Công đoạn |
| :---- | :---- | :---- |
| `DA1-11-huong-dan-ket-noi-telegram` | Tạo bot Telegram, tạo nhóm cho nhân viên, cấu hình khung chat vào website, xử lý sự cố | 6 |

Tách riêng vì đây là tài liệu **đưa cho người cài đặt làm theo từng bước**, khác mục đích với `DA1-09` vốn hướng dẫn dùng hệ quản trị hằng ngày.

### Quy mô bộ hồ sơ

| Bộ | Tài liệu | Dòng |
| :---- | :----: | :----: |
| Mục lục | 1 | 161 |
| Hồ sơ chung | 6 | 1.407 |
| DA1 — Website và CMS | 11 | 4.006 |
| DA2 — AI chuẩn hoá dữ liệu | 10 | 3.154 |
| DA3 — Chatbot AI đa kênh | 10 | 3.755 |
| DA4 — Chatbot Telegram và Google Workspace | 10 | 2.716 |
| **Tổng** | **48** | **15.199** |

Mỗi tài liệu có bản `.md` và bản `.docx` mang nhận diện thương hiệu công ty.

---

## 3. Bảy công đoạn sản xuất phần mềm

Bộ hồ sơ bám theo quy trình sản xuất sản phẩm phần mềm gồm bảy công đoạn:

| # | Công đoạn | Công ty có thực hiện |
| :---- | :---- | :---- |
| 1 | Xác định yêu cầu | ✅ DA1–DA3; 📝 DA4 dự thảo chờ duyệt |
| 2 | Phân tích và thiết kế | ✅ DA1–DA3; 📝 DA4 dự thảo chờ duyệt |
| 3 | Lập trình, viết mã lệnh | ✅ DA1–DA3; ☐ DA4 chưa có bằng chứng |
| 4 | Kiểm tra, thử nghiệm phần mềm | ✅ DA1–DA3; ☐ DA4 mới có bộ ca chưa chạy |
| 5 | Hoàn thiện, đóng gói sản phẩm | ✅ DA1–DA3; ☐ DA4 mới có checklist |
| 6 | Cài đặt, chuyển giao, hướng dẫn sử dụng, bảo trì, bảo hành | ✅ DA1–DA3; ☐ DA4 chưa triển khai |
| 7 | Phát hành, phân phối sản phẩm | ✅ DA1, DA3; DA2 vận hành trong DA1; ☐ DA4 chưa phát hành |

Bảng đối chiếu chi tiết DA1–DA3 và phụ lục trạng thái DA4 nằm ở `00-ho-so-chung/00-3-doi-chieu-ho-so-theo-cong-doan.md`.

### Mục lục DA4

| # | Tài liệu | Mục đích |
| :----: | :---- | :---- |
| 1 | [DA4-01 — Thuyết minh sản phẩm](DA4-chatbot-telegram-google-workspace/DA4-01-thuyet-minh-san-pham.md) | Định vị, phạm vi, trạng thái và đầu ra |
| 2 | [DA4-02 — Xác định yêu cầu](DA4-chatbot-telegram-google-workspace/DA4-02-cd1-xac-dinh-yeu-cau.md) | Yêu cầu, nghiệm thu và câu hỏi cần duyệt |
| 3 | [DA4-03 — Thiết kế kiến trúc](DA4-chatbot-telegram-google-workspace/DA4-03-cd2-thiet-ke-kien-truc.md) | Router, quyền, AI, Sheets, Drive, Dispatcher |
| 4 | [DA4-04 — Thiết kế dữ liệu](DA4-chatbot-telegram-google-workspace/DA4-04-cd2-thiet-ke-du-lieu.md) | Properties, schema Sheets, tệp và retention |
| 5 | [DA4-05 — Giao diện và luồng](DA4-chatbot-telegram-google-workspace/DA4-05-cd2-thiet-ke-giao-dien-va-luong.md) | Menu Telegram và các luồng người dùng |
| 6 | [DA4-06 — Lập trình và nhật ký](DA4-chatbot-telegram-google-workspace/DA4-06-cd3-lap-trinh-va-nhat-ky.md) | Chuẩn mã, kế hoạch và bằng chứng cần thu |
| 7 | [DA4-07 — Kiểm thử và UAT](DA4-chatbot-telegram-google-workspace/DA4-07-cd4-kiem-thu-va-uat.md) | 45 ca chức năng, 10 ca an toàn và biểu mẫu UAT |
| 8 | [DA4-08 — Đóng gói và triển khai](DA4-chatbot-telegram-google-workspace/DA4-08-cd5-6-7-dong-goi-trien-khai.md) | Cài đặt, rollback, bàn giao và phát hành |
| 9 | [DA4-09 — Hướng dẫn sử dụng](DA4-chatbot-telegram-google-workspace/DA4-09-huong-dan-su-dung.md) | Hướng dẫn user và admin |
| 10 | [DA4-10 — Tra cứu kỹ thuật](DA4-chatbot-telegram-google-workspace/DA4-10-tra-cuu-ky-thuat.md) | Cấu hình, API, mã lỗi và sổ sự cố |

> **Lưu ý pháp lý.** Văn bản quy định quy trình sản xuất sản phẩm phần mềm và danh mục sản phẩm phần mềm có thể được sửa đổi theo thời gian. Trước khi nộp hồ sơ, bộ phận kế toán cần đối chiếu lại với văn bản đang có hiệu lực tại thời điểm nộp. Bộ hồ sơ này được soạn theo cấu trúc bảy công đoạn — cấu trúc này ổn định qua các lần sửa đổi, nhưng tên gọi và số hiệu văn bản thì cần kiểm tra lại.

---

## 4. Bằng chứng gốc kèm theo hồ sơ

Hồ sơ giấy chỉ có giá trị khi đối chiếu được với bằng chứng gốc còn nguyên vẹn. Các nguồn hiện có:

| Bằng chứng | Nơi lưu | Nội dung |
| :---- | :---- | :---- |
| Kho mã nguồn DA1 + DA2 | Git, 218 lần ghi nhận thay đổi, 15/06/2026 → 31/08/2026 | Toàn bộ lịch sử phát triển, từng dòng sửa đổi, thời điểm, người sửa |
| Kho mã nguồn DA3 | Git, 163 lần ghi nhận thay đổi, 06/02/2026 → 12/06/2026 | Như trên |
| Hệ thống đang vận hành | Máy chủ sản xuất | Bản chạy thật của DA1, DA2, DA3 |
| DA4 | Chưa có | Build Guide và hồ sơ thiết kế chưa thay thế mã nguồn, log chạy, UAT hoặc deployment record |

Lịch sử ghi nhận thay đổi là bằng chứng mạnh nhất: nó cho thấy phần mềm được **dựng dần từng bước trong nhiều tháng**, không phải mua về rồi đổi tên. Khi DA4 bắt đầu lập trình, phải tạo kho/version và lưu bằng chứng riêng từ ngày đầu.

---

## 5. Điểm cần khắc phục trước khi nộp

Trung thực mà nói, bộ hồ sơ có hai điểm yếu về mặt hình thức. Cả hai đều sửa được và nên sửa trước khi nộp:

**Thứ nhất — danh tính người phát triển trong lịch sử mã nguồn.** 217/218 và 162/163 lần ghi nhận thay đổi mang danh tính `KCODE <kcode@MacBook-Pro-cua-KCODE.local>`. Đây là địa chỉ mặc định của máy tính cá nhân, không phải hòm thư công ty. Người đọc hồ sơ sẽ hỏi: người này là ai, có phải nhân viên công ty không.

*Cách khắc phục:* lập bảng đối chiếu danh tính kỹ thuật ↔ nhân sự, có xác nhận của công ty, đặt trong `00-1-thuyet-minh-nang-luc-va-doi-ngu.md`. Từ nay cấu hình lại danh tính trong công cụ quản lý mã nguồn theo hòm thư công ty.

**Thứ hai — nơi lưu kho mã nguồn.** Kho mã nguồn DA1/DA2 nằm dưới tài khoản cá nhân trên dịch vụ lưu trữ mã nguồn công cộng, không phải tài khoản tổ chức của công ty.

*Cách khắc phục:* chuyển kho về tài khoản tổ chức của công ty, hoặc lập biên bản xác nhận quyền sở hữu mã nguồn thuộc về công ty và người giữ tài khoản là nhân viên thực hiện theo phân công.

Hai việc này thuần thủ tục, không ảnh hưởng nội dung kỹ thuật, nhưng bỏ qua thì toàn bộ phần còn lại của hồ sơ mất trọng lượng.

---

## 6. Cách dựng lại bản .docx

Toàn bộ tài liệu viết bằng Markdown. Bản Word dựng tự động, giữ đúng nhận diện thương hiệu (logo, màu chủ đạo, khổ chữ):

```bash
cd docs/_cong-cu && node run.js
```

Lệnh này quét mọi tệp `.md` trong `docs/` và các thư mục con, sinh tệp `.docx` cùng tên bên cạnh. Sửa nội dung thì sửa tệp `.md` rồi chạy lại — **không sửa trực tiếp vào tệp `.docx`**, vì lần dựng sau sẽ ghi đè.
