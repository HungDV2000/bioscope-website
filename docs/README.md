<!--HOSO
phu_de: Mục lục toàn bộ hồ sơ ba dự án
pham_vi: Toàn bộ hồ sơ
ngay_lap: 03/09/2026
phien_ban: 1.0
nguoi_lap: Bộ phận Phát triển phần mềm — Công ty Bioscope
nguoi_duyet: Ban Giám đốc
lich_su: 1.0 | 03/09/2026 | Ban hành lần đầu
-->
# HỒ SƠ SẢN XUẤT PHẦN MỀM NỘI BỘ — CÔNG TY BIOSCOPE

**Mục đích.** Bộ hồ sơ này chứng minh ba sản phẩm phần mềm dưới đây do **đội ngũ nội bộ của công ty trực tiếp phát triển**, không mua lại, không thuê ngoài trọn gói, không lắp ghép từ sản phẩm đóng gói sẵn.

**Phạm vi.** Ba dự án độc lập, mỗi dự án có một bộ hồ sơ riêng đi đủ bảy công đoạn của quy trình sản xuất phần mềm.

---

## 1. Ba sản phẩm

| Mã | Sản phẩm | Bản chất | Quy mô mã nguồn | Thời gian phát triển |
| :---- | :---- | :---- | :---- | :---- |
| **DA1** | Website Bioscope & Hệ quản trị nội dung | Ứng dụng web hai lớp: cổng thông tin công khai đa ngữ + hệ quản trị nội dung tự xây trên nền Payload/Next.js | ~51.300 dòng TypeScript | 15/06/2026 – nay |
| **DA2** | Hệ thống AI chuẩn hoá và cập nhật dữ liệu sản phẩm | Dây chuyền tự động: quét kho tài liệu → bóc tách nội dung → gọi mô hình ngôn ngữ → sinh dữ liệu nguyên liệu có cấu trúc → ghi vào hệ quản trị | ~4.200 dòng TypeScript | 07/2026 – nay |
| **DA3** | Chatbot AI đa kênh BioBot | Trợ lý hội thoại có truy hồi tri thức (RAG), phục vụ đồng thời web, Zalo, Telegram, Messenger, WhatsApp; có chuyển tiếp người thật | ~47.700 dòng Python/JavaScript + 44 quy trình tự động hoá | 06/02/2026 – 12/06/2026 |

Ba dự án nối tiếp nhau về thời gian: DA3 làm trước (02–06/2026), DA1 và DA2 làm sau (06/2026 đến nay). Đây là dòng chảy phát triển liên tục của cùng một đội.

---

## 2. Cấu trúc bộ hồ sơ

```
docs/
├── README.md                          ← đang đọc: mục lục và bảng đối chiếu
│
├── 00-ho-so-chung/                    Hồ sơ nền, dùng chung cho cả ba dự án
│   ├── 00-1-thuyet-minh-nang-luc-va-doi-ngu.md
│   ├── 00-2-quy-trinh-san-xuat-phan-mem-noi-bo.md
│   ├── 00-3-doi-chieu-ho-so-theo-cong-doan.md
│   ├── 00-4-ha-tang-cong-cu-va-moi-truong.md
│   └── 00-5-quy-chuan-ma-nguon-va-quan-ly-phien-ban.md
│
├── DA1-website-va-cms/                10 tài liệu
├── DA2-ai-chuan-hoa-du-lieu/          10 tài liệu
├── DA3-chatbot-ai-da-kenh/            10 tài liệu
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

---

## 3. Bảy công đoạn sản xuất phần mềm

Bộ hồ sơ bám theo quy trình sản xuất sản phẩm phần mềm gồm bảy công đoạn:

| # | Công đoạn | Công ty có thực hiện |
| :---- | :---- | :---- |
| 1 | Xác định yêu cầu | ✅ Cả ba dự án |
| 2 | Phân tích và thiết kế | ✅ Cả ba dự án |
| 3 | Lập trình, viết mã lệnh | ✅ Cả ba dự án |
| 4 | Kiểm tra, thử nghiệm phần mềm | ✅ Cả ba dự án |
| 5 | Hoàn thiện, đóng gói sản phẩm | ✅ Cả ba dự án |
| 6 | Cài đặt, chuyển giao, hướng dẫn sử dụng, bảo trì, bảo hành | ✅ Cả ba dự án |
| 7 | Phát hành, phân phối sản phẩm | ✅ DA1, DA3 (đã đưa vào vận hành thật) |

Bảng đối chiếu chi tiết từng công đoạn với tài liệu chứng minh tương ứng nằm ở `00-ho-so-chung/00-3-doi-chieu-ho-so-theo-cong-doan.md`.

> **Lưu ý pháp lý.** Văn bản quy định quy trình sản xuất sản phẩm phần mềm và danh mục sản phẩm phần mềm có thể được sửa đổi theo thời gian. Trước khi nộp hồ sơ, bộ phận kế toán cần đối chiếu lại với văn bản đang có hiệu lực tại thời điểm nộp. Bộ hồ sơ này được soạn theo cấu trúc bảy công đoạn — cấu trúc này ổn định qua các lần sửa đổi, nhưng tên gọi và số hiệu văn bản thì cần kiểm tra lại.

---

## 4. Bằng chứng gốc kèm theo hồ sơ

Hồ sơ giấy chỉ có giá trị khi đối chiếu được với bằng chứng gốc còn nguyên vẹn. Ba nguồn bằng chứng gốc:

| Bằng chứng | Nơi lưu | Nội dung |
| :---- | :---- | :---- |
| Kho mã nguồn DA1 + DA2 | Git, 218 lần ghi nhận thay đổi, 15/06/2026 → 31/08/2026 | Toàn bộ lịch sử phát triển, từng dòng sửa đổi, thời điểm, người sửa |
| Kho mã nguồn DA3 | Git, 163 lần ghi nhận thay đổi, 06/02/2026 → 12/06/2026 | Như trên |
| Hệ thống đang vận hành | Máy chủ sản xuất | Bản chạy thật của DA1, DA2, DA3 |

Lịch sử ghi nhận thay đổi là bằng chứng mạnh nhất: nó cho thấy phần mềm được **dựng dần từng bước trong nhiều tháng**, không phải mua về rồi đổi tên.

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
