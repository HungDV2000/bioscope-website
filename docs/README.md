<!--HOSO
phu_de: Mục lục và hướng dẫn đọc toàn bộ hồ sơ
pham_vi: Bốn dự án — OPTIMAI thực hiện, Bioscope thụ hưởng
ngay_lap: 03/09/2026
phien_ban: 2.0
nguoi_lap: A Hùng — Product Owner, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc OPTIMAI và đại diện Công ty Bioscope
lich_su: 1.0 | 03/09/2026 | Ban hành lần đầu
lich_su: 1.1 | 03/09/2026 | Bổ sung hồ sơ thiết kế DA4
lich_su: 2.0 | 03/09/2026 | Xác lập quan hệ nhà thầu OPTIMAI — chủ đầu tư Bioscope; bổ sung mục lục đầy đủ 50 tài liệu
-->
# HỒ SƠ SẢN XUẤT PHẦN MỀM
## Công ty OPTIMAI thực hiện — Công ty Bioscope thụ hưởng

---

## 1. Hai bên và mục đích bộ hồ sơ

| | **Bên thực hiện** | **Bên thụ hưởng** |
| :---- | :---- | :---- |
| Công ty | **OPTIMAI** | **Bioscope** |
| Vai trò | Phân tích, thiết kế, lập trình, kiểm thử, đóng gói, triển khai, bàn giao, bảo hành | Đặt hàng, cung cấp yêu cầu nghiệp vụ, nghiệm thu, tiếp nhận, vận hành |

### Bộ hồ sơ phục vụ hai mục đích

| | Với hồ sơ của **OPTIMAI** | Với hồ sơ của **Bioscope** |
| :---- | :---- | :---- |
| Trả lời câu hỏi | Công ty có thực hiện hoạt động sản xuất phần mềm không? | Khoản chi mua phần mềm có tương ứng sản phẩm có thật không? |
| Tài liệu then chốt | Bảy công đoạn `-02` → `-08` của từng dự án | Hợp đồng, nghiệm thu, bàn giao, hoá đơn |
| Bằng chứng gốc | Kho mã nguồn — **381 lần ghi nhận thay đổi trải 7 tháng** | Hệ thống đang vận hành, có người dùng và dữ liệu thật |

> **Giao dịch liên kết.** OPTIMAI và Bioscope là hai pháp nhân có quan hệ liên kết. Giao dịch mua bán phần mềm giữa hai bên kéo theo nghĩa vụ riêng về hồ sơ xác định giá — xem `00-ho-so-chung/00-7-hop-dong-ban-giao-va-quyen-so-huu.md` mục 5.

---

## 2. Đội ngũ thực hiện

| Nhân sự | Vai trò | Công đoạn phụ trách | Tài liệu chịu trách nhiệm |
| :---- | :---- | :---- | :---- |
| **A Hùng** | Product Owner | **1** · chủ trì nghiệm thu ở **4** · phát hành **7** | `-01` `-02` `-09` |
| **Quân** | Team phát triển | **2** kiến trúc và dữ liệu · **3** · **5** · **6** | `-03` `-04` `-06` `-08` `-10` |
| **Dưỡng** | Team phát triển | **2** giao diện và luồng · **3** | `-05` `-11` `-12` |
| **Thu** | QA | **4** · **quyền chặn phát hành** | `-07` |

Ma trận phân công công việc theo công đoạn và hồ sơ nhân sự: `00-ho-so-chung/00-1-thuyet-minh-nang-luc-va-doi-ngu.md` mục 4.

---

## 3. Bốn dự án

| Mã | Sản phẩm | Bản chất | Quy mô mã nguồn | Thời gian |
| :---- | :---- | :---- | :---- | :---- |
| **DA1** | Website Bioscope và Hệ quản trị nội dung | Cổng thông tin công khai đa ngữ + hệ quản trị nội dung dựng trên nền Payload/Next.js | ~51.300 dòng TypeScript | 15/06/2026 – nay |
| **DA2** | Hệ thống AI chuẩn hoá và cập nhật dữ liệu sản phẩm | Dây chuyền tự động: quét kho tài liệu → bóc tách → gọi mô hình → sinh dữ liệu có cấu trúc → ghi vào hệ quản trị | ~4.200 dòng TypeScript | 09/07/2026 – nay |
| **DA3** | Chatbot AI đa kênh BioBot | Trợ lý hội thoại có truy hồi tri thức, phục vụ 6 kênh, có chuyển tiếp người thật | ~47.700 dòng Python/JS + 44 quy trình + 7.600 dòng tài liệu | 06/02/2026 – 12/06/2026 |
| **DA4** | Chatbot Telegram và Google Workspace | Trợ lý nội bộ trên Google Apps Script | *Chưa có bằng chứng mã nguồn* | Thiết kế từ 03/09/2026 |

**Thứ tự thực hiện:** DA3 làm trước (02–06/2026), DA1 và DA2 làm sau (06/2026 đến nay). DA4 kế thừa kinh nghiệm chatbot nhưng chọn kiến trúc nhẹ hơn.

> **DA4 chưa thuộc phạm vi bàn giao.** Hồ sơ DA4 hiện là yêu cầu, thiết kế, danh sách kiểm tra và biểu mẫu — **chưa phải bằng chứng phần mềm đã hoàn thành**. Chỉ ghi nhận là đã triển khai khi có lịch sử thay đổi, kết quả kiểm thử và biên bản nghiệm thu riêng.

---

## 4. Mục lục toàn bộ hồ sơ

**52 tài liệu**, mỗi tài liệu có bản `.md` và bản `.docx` mang nhận diện thương hiệu.

### 4.1 Hồ sơ chung — 9 tài liệu

| # | Tài liệu | Nội dung chính | Người lập |
| :----: | :---- | :---- | :---- |
| 1 | [00-1 — Năng lực nhà thầu và đội ngũ](00-ho-so-chung/00-1-thuyet-minh-nang-luc-va-doi-ngu.md) | Quan hệ hai bên; khẳng định của bên thực hiện; **bốn nhân sự và vai trò**; **ma trận phân công theo công đoạn**; ranh giới công cụ / sản phẩm; bằng chứng khối lượng lao động | A Hùng |
| 2 | [00-2 — Quy trình sản xuất phần mềm](00-ho-so-chung/00-2-quy-trinh-san-xuat-phan-mem-noi-bo.md) | Bốn nguyên tắc chi phối; **bảy công đoạn**: việc làm, đầu ra, bằng chứng để lại; sơ đồ tổng quát | Quân |
| 3 | [00-3 — Đối chiếu hồ sơ theo công đoạn](00-ho-so-chung/00-3-doi-chieu-ho-so-theo-cong-doan.md) | **Bảng đối chiếu từng công đoạn với tài liệu chứng minh và bằng chứng gốc**; lệnh kiểm chứng; danh sách kiểm tra trước khi nộp | A Hùng |
| 4 | [00-4 — Hạ tầng, công cụ, môi trường](00-ho-so-chung/00-4-ha-tang-cong-cu-va-moi-truong.md) | Ba tầng môi trường; hạ tầng vận hành từng dự án; công cụ phát triển; phiên bản nền tảng đã ghim; quản lý bí mật; sao lưu | Quân |
| 5 | [00-5 — Quy chuẩn mã nguồn và phiên bản](00-ho-so-chung/00-5-quy-chuan-ma-nguon-va-quan-ly-phien-ban.md) | Quy chuẩn viết mã; kiểm tra bắt buộc trước ghi nhận; quy ước mô tả thay đổi; **quy trình bảy bước đổi cấu trúc cơ sở dữ liệu**; sổ tra cứu sự cố | Quân |
| 6 | [00-6 — Hồ sơ chi phí phát triển](00-ho-so-chung/00-6-ho-so-chi-phi-phat-trien.md) | Bốn nhóm chi phí; bảng kê nhân công theo vai trò; **căn cứ phân bổ giữa DA1 và DA2**; đối chiếu chi phí dịch vụ AI với hoá đơn; đối chiếu chi phí với giá bán — **mọi ô số để trống, công ty tự điền** | Kế toán OPTIMAI |
| 7 | [00-7 — Hợp đồng, bàn giao, quyền sở hữu](00-ho-so-chung/00-7-hop-dong-ban-giao-va-quyen-so-huu.md) | Hợp đồng và phụ lục phạm vi; chuỗi nghiệm thu → bàn giao → hoá đơn; **quyền sở hữu trí tuệ**; **giao dịch liên kết**; nghĩa vụ hồ sơ từng bên | A Hùng |
| 8 | [00-8 — Danh mục tài liệu, thuật ngữ và quy ước](00-ho-so-chung/00-8-danh-muc-tai-lieu-va-thuat-ngu.md) | Quy ước mã và phiên bản tài liệu; **danh mục đầy đủ 52 tài liệu kèm nội dung chính**; thuật ngữ; từ viết tắt; phân phối; **kiểm soát thay đổi tài liệu** | A Hùng |
| 9 | [00-9 — Kế hoạch quản lý dự án](00-ho-so-chung/00-9-ke-hoach-quan-ly-du-an.md) | Phạm vi và ranh giới; tổ chức và trách nhiệm; **7 mốc kiểm soát M1–M7**; **quản lý thay đổi phạm vi**; quản lý rủi ro; trao đổi thông tin; tiêu chí kết thúc; **8 bài học rút ra** | A Hùng |

### 4.2 DA1 — Website và Hệ quản trị nội dung · 12 tài liệu

| # | Tài liệu | Nội dung chính | CĐ |
| :----: | :---- | :---- | :----: |
| 1 | [DA1-01 — Thuyết minh sản phẩm](DA1-website-va-cms/DA1-01-thuyet-minh-san-pham.md) | Sản phẩm là gì; vấn đề giải quyết; người dùng và vai trò; 49 nhóm dữ liệu; 12 mô-đun; **nguyên tắc mặc định đóng**; **ranh giới công cụ / sản phẩm OPTIMAI tự viết** | — |
| 2 | [DA1-02 — Xác định yêu cầu](DA1-website-va-cms/DA1-02-cd1-xac-dinh-yeu-cau.md) | Hiện trạng đo được; 8 yêu cầu nghiệp vụ; **44 yêu cầu chức năng**; 13 yêu cầu phi chức năng; 10 tiêu chí nghiệm thu; **ma trận truy vết — độ phủ 100%** | 1 |
| 3 | [DA1-03 — Thiết kế kiến trúc](DA1-website-va-cms/DA1-03-cd2-thiet-ke-kien-truc.md) | Kiến trúc hai ứng dụng; cơ chế mô-đun; bốn luồng xử lý chính; đa ngữ; bảo mật nhiều lớp; **8 nhật ký quyết định kỹ thuật** | 2 |
| 4 | [DA1-04 — Thiết kế dữ liệu](DA1-website-va-cms/DA1-04-cd2-thiet-ke-du-lieu.md) | Sơ đồ quan hệ; **`ingredients` 73 trường**; bảng giá khoá ở tầng trường; ba trục phân loại bài viết; phân quyền; dữ liệu cá nhân; chỉ mục | 2 |
| 5 | [DA1-05 — Giao diện và luồng](DA1-website-va-cms/DA1-05-cd2-thiet-ke-giao-dien-va-luong.md) | Hệ thống nhận diện; bản đồ 27 đường dẫn; ba luồng người dùng chính; trạng thái hiển thị; màn hình nhỏ; khả năng tiếp cận | 2 |
| 6 | [DA1-06 — Lập trình và nhật ký](DA1-website-va-cms/DA1-06-cd3-lap-trinh-va-nhat-ky.md) | Tổ chức mã nguồn; kiểm tra bắt buộc; **10 mốc phát triển**; thống kê khối lượng theo tháng; việc còn lại | 3 |
| 7 | [DA1-07 — Kiểm thử và nghiệm thu](DA1-website-va-cms/DA1-07-cd4-kiem-thu-va-uat.md) | Chiến lược 4 lớp; **62 ca kiểm thử** có mã đối chiếu ngược về yêu cầu; kết quả kiểm chứng hệ thống bình luận; 10 lỗi đã phát hiện; **biên bản nghiệm thu** | 4 |
| 8 | [DA1-08 — Đóng gói và triển khai](DA1-website-va-cms/DA1-08-cd5-6-7-dong-goi-trien-khai.md) | Danh sách rà soát 13 mục; cấu trúc ảnh chứa; biến môi trường; quy trình nâng cấp; **kiểm tra sau triển khai 13 mục**; lùi phiên bản; bảo trì; bàn giao | 5·6·7 |
| 9 | [DA1-09 — Hướng dẫn sử dụng](DA1-website-va-cms/DA1-09-huong-dan-su-dung.md) | Ba khái niệm phải hiểu; quản lý nguyên liệu; viết bài; quản lý bình luận; cấu hình website; xử lý tình huống | 6 |
| 10 | [DA1-10 — Tra cứu kỹ thuật](DA1-website-va-cms/DA1-10-tra-cuu-ky-thuat.md) | 8 điểm truy cập công khai và phạm vi khoá; chốt chặn dữ liệu hai lớp; **12 sự cố** có nguyên nhân đã xác minh; lệnh thường dùng | 3·6 |
| 11 | [DA1-11 — Hướng dẫn kết nối Telegram](DA1-website-va-cms/DA1-11-huong-dan-ket-noi-telegram.md) | Bản đầy đủ: tạo bot, tạo nhóm, cấu hình, lý do từng bước, xử lý sự cố, bảo mật | 6 |
| 12 | [DA1-12 — Cài đặt nhanh Telegram](DA1-website-va-cms/DA1-12-cai-dat-nhanh-telegram.md) | Bản rút gọn: **24 bước thao tác**, không giải thích | 6 |

### 4.3 DA2 — AI chuẩn hoá dữ liệu sản phẩm · 10 tài liệu

| # | Tài liệu | Nội dung chính | CĐ |
| :----: | :---- | :---- | :----: |
| 1 | [DA2-01 — Thuyết minh sản phẩm](DA2-ai-chuan-hoa-du-lieu/DA2-01-thuyet-minh-san-pham.md) | Bảy bước dây chuyền; hiệu quả đo được; **nguyên tắc máy đề xuất người quyết định**; **chia trường thành hai loại**; ranh giới dịch vụ ngoài | — |
| 2 | [DA2-02 — Xác định yêu cầu](DA2-ai-chuan-hoa-du-lieu/DA2-02-cd1-xac-dinh-yeu-cau.md) | Đo hiện trạng 2–3,5 giờ/nguyên liệu; 8 yêu cầu nghiệp vụ; **40 yêu cầu chức năng**; 12 yêu cầu phi chức năng; 8 rủi ro nhận diện từ đầu; **ma trận truy vết — độ phủ 100%** | 1 |
| 3 | [DA2-03 — Thiết kế kiến trúc](DA2-ai-chuan-hoa-du-lieu/DA2-03-cd2-thiet-ke-kien-truc.md) | Bảy bước dây chuyền chi tiết; **ba cơ chế bảo vệ dữ liệu**; cấu hình động nhà cung cấp; ước tính chi phí; xử lý lỗi; **7 nhật ký quyết định** | 2 |
| 4 | [DA2-04 — Thiết kế dữ liệu](DA2-ai-chuan-hoa-du-lieu/DA2-04-cd2-thiet-ke-du-lieu.md) | Hàng đợi công việc **9 trạng thái**; bộ đếm chi phí; nhật ký ba mức; cấu hình AI; **trường loại A và loại B**; vòng đời bản ghi | 2 |
| 5 | [DA2-05 — Giao diện và luồng](DA2-ai-chuan-hoa-du-lieu/DA2-05-cd2-thiet-ke-giao-dien-va-luong.md) | Bốn thành phần giao diện tự viết; luồng sinh nội dung; sinh hàng loạt; **luồng duyệt kết quả bốn bước**; cấu hình nhà cung cấp | 2 |
| 6 | [DA2-06 — Lập trình và nhật ký](DA2-ai-chuan-hoa-du-lieu/DA2-06-cd3-lap-trinh-va-nhat-ky.md) | Tổ chức mã nguồn; ranh giới hai tệp lõi; **7 mốc phát triển**; giải thích tỉ lệ sửa lỗi 40%; việc còn lại | 3 |
| 7 | [DA2-07 — Kiểm thử và nghiệm thu](DA2-ai-chuan-hoa-du-lieu/DA2-07-cd4-kiem-thu-va-uat.md) | Vì sao kiểm thử khác DA1; **63 ca**, trong đó nhóm chống bịa dữ liệu là quan trọng nhất; **kiểm thử đối chiếu tài liệu gốc**; 16 lỗi; biên bản nghiệm thu | 4 |
| 8 | [DA2-08 — Đóng gói và triển khai](DA2-ai-chuan-hoa-du-lieu/DA2-08-cd5-6-7-dong-goi-trien-khai.md) | Rà soát 7 mục riêng; biến môi trường; tài khoản dịch vụ Google; **quy trình nâng cấp và lùi phiên bản**; kiểm tra sau triển khai; **kiểm soát chi phí hàng tháng**; bàn giao | 5·6·7 |
| 9 | [DA2-09 — Hướng dẫn sử dụng](DA2-ai-chuan-hoa-du-lieu/DA2-09-huong-dan-su-dung.md) | AI làm gì và không làm gì; **hai loại trường**; đồng bộ kho tài liệu; sinh nội dung; **duyệt kết quả bốn bước**; xem chi phí | 6 |
| 10 | [DA2-10 — Tra cứu kỹ thuật](DA2-ai-chuan-hoa-du-lieu/DA2-10-tra-cuu-ky-thuat.md) | 14 điểm truy cập; bảng cấu hình ↔ biến môi trường; bảng đơn giá mô hình; **16 sự cố**; lệnh tra cứu chi phí và chất lượng | 3·6 |

### 4.4 DA3 — Chatbot AI đa kênh · 10 tài liệu

| # | Tài liệu | Nội dung chính | CĐ |
| :----: | :---- | :---- | :----: |
| 1 | [DA3-01 — Thuyết minh sản phẩm](DA3-chatbot-ai-da-kenh/DA3-01-thuyet-minh-san-pham.md) | Kiến trúc sáu dịch vụ; 44 quy trình; hai miền nghiệp vụ; **phân quyền ở tầng công cụ**; **chốt chặn dược**; tài liệu gốc sẵn có 7.600 dòng | — |
| 2 | [DA3-02 — Xác định yêu cầu](DA3-chatbot-ai-da-kenh/DA3-02-cd1-xac-dinh-yeu-cau.md) | Hiện trạng bốn kênh rời rạc; **rủi ro đặc thù ngành dược**; 10 yêu cầu nghiệp vụ; **54 yêu cầu chức năng**; 14 yêu cầu phi chức năng; 10 rủi ro; **ma trận truy vết — độ phủ 100%** | 1 |
| 3 | [DA3-03 — Thiết kế kiến trúc](DA3-chatbot-ai-da-kenh/DA3-03-cd2-thiet-ke-kien-truc.md) | Ranh giới quy trình / mã; **vòng lặp trợ lý**; **ba lớp chốt chặn an toàn**; kiến trúc đa kênh; dây chuyền tri thức; **9 nhật ký quyết định** | 2 |
| 4 | [DA3-04 — Thiết kế dữ liệu](DA3-chatbot-ai-da-kenh/DA3-04-cd2-thiet-ke-du-lieu.md) | Ba kho dữ liệu; **30 bảng**; nhật ký AI; **hai bộ sưu tập vectơ tách biệt**; phân quyền ba tầng; dữ liệu cá nhân | 2 |
| 5 | [DA3-05 — Giao diện và luồng](DA3-chatbot-ai-da-kenh/DA3-05-cd2-thiet-ke-giao-dien-va-luong.md) | Sáu kênh hai kiểu trải nghiệm; bản đồ màn hình theo vai trò; **sáu luồng hội thoại**; quy tắc hiển thị; giao diện quản trị | 2 |
| 6 | [DA3-06 — Lập trình và nhật ký](DA3-chatbot-ai-da-kenh/DA3-06-cd3-lap-trinh-va-nhat-ky.md) | Tổ chức mã nguồn; bốn tệp lõi trợ lý; **6 mốc phát triển**; thống kê khối lượng; ghi trung thực về chất lượng nhật ký | 3 |
| 7 | [DA3-07 — Kiểm thử và nghiệm thu](DA3-chatbot-ai-da-kenh/DA3-07-cd4-kiem-thu-va-uat.md) | Hai nhóm rủi ro; **91 ca**, gồm **6 ca cố tình vượt rào chốt chặn dược**; kiểm phân quyền công cụ; 10 lỗi; biên bản nghiệm thu | 4 |
| 8 | [DA3-08 — Đóng gói và triển khai](DA3-chatbot-ai-da-kenh/DA3-08-cd5-6-7-dong-goi-trien-khai.md) | Rà soát 11 mục; sáu dịch vụ và phiên bản ghim; **quy tắc cổng chỉ mở nội bộ**; cài đặt; kiểm tra sau triển khai 15 mục; bảo trì | 5·6·7 |
| 9 | [DA3-09 — Hướng dẫn sử dụng](DA3-chatbot-ai-da-kenh/DA3-09-huong-dan-su-dung.md) | Ba điều quan trọng nhất; cách hỏi; đọc câu trả lời; **khi bị chặn vì câu hỏi y tế**; chuyển người thật; nạp tài liệu; dành cho quản trị viên | 6 |
| 10 | [DA3-10 — Tra cứu kỹ thuật](DA3-chatbot-ai-da-kenh/DA3-10-tra-cuu-ky-thuat.md) | **14 công cụ và bảng phân quyền**; 44 quy trình theo dải số; điểm truy cập; hằng số quan trọng; **14 sự cố**; lệnh kiểm bảo mật | 3·6 |

### 4.5 DA4 — Chatbot Telegram và Google Workspace · 10 tài liệu

*Hồ sơ thiết kế trước triển khai. Chưa thuộc phạm vi bàn giao.*

| # | Tài liệu | Nội dung chính |
| :----: | :---- | :---- |
| 1 | [DA4-01 — Thuyết minh sản phẩm](DA4-chatbot-telegram-google-workspace/DA4-01-thuyet-minh-san-pham.md) | Định vị, phạm vi, trạng thái và đầu ra |
| 2 | [DA4-02 — Xác định yêu cầu](DA4-chatbot-telegram-google-workspace/DA4-02-cd1-xac-dinh-yeu-cau.md) | Yêu cầu, nghiệm thu và câu hỏi cần duyệt |
| 3 | [DA4-03 — Thiết kế kiến trúc](DA4-chatbot-telegram-google-workspace/DA4-03-cd2-thiet-ke-kien-truc.md) | Router, quyền, AI, Sheets, Drive, Dispatcher |
| 4 | [DA4-04 — Thiết kế dữ liệu](DA4-chatbot-telegram-google-workspace/DA4-04-cd2-thiet-ke-du-lieu.md) | Properties, schema Sheets, tệp và retention |
| 5 | [DA4-05 — Giao diện và luồng](DA4-chatbot-telegram-google-workspace/DA4-05-cd2-thiet-ke-giao-dien-va-luong.md) | Menu Telegram và các luồng người dùng |
| 6 | [DA4-06 — Lập trình và nhật ký](DA4-chatbot-telegram-google-workspace/DA4-06-cd3-lap-trinh-va-nhat-ky.md) | Chuẩn mã, kế hoạch và bằng chứng cần thu |
| 7 | [DA4-07 — Kiểm thử và UAT](DA4-chatbot-telegram-google-workspace/DA4-07-cd4-kiem-thu-va-uat.md) | 45 ca chức năng, 10 ca an toàn và biểu mẫu UAT |
| 8 | [DA4-08 — Đóng gói và triển khai](DA4-chatbot-telegram-google-workspace/DA4-08-cd5-6-7-dong-goi-trien-khai.md) | Cài đặt, rollback, bàn giao và phát hành |
| 9 | [DA4-09 — Hướng dẫn sử dụng](DA4-chatbot-telegram-google-workspace/DA4-09-huong-dan-su-dung.md) | Hướng dẫn người dùng và quản trị viên |
| 10 | [DA4-10 — Tra cứu kỹ thuật](DA4-chatbot-telegram-google-workspace/DA4-10-tra-cuu-ky-thuat.md) | Cấu hình, API, mã lỗi và sổ sự cố |

### 4.6 Quy mô

| Bộ | Tài liệu | Dòng |
| :---- | :----: | :----: |
| Mục lục | 1 | *tài liệu này* |
| Hồ sơ chung | 9 | 2.342 |
| DA1 — Website và CMS | 12 | 4.388 |
| DA2 — AI chuẩn hoá dữ liệu | 10 | 3.310 |
| DA3 — Chatbot AI đa kênh | 10 | 3.883 |
| DA4 — Chatbot Telegram *(thiết kế)* | 10 | 2.731 |
| **Tổng** | **52** | **16.913** |

---

## 4.7 Cấu phần chuẩn của bộ hồ sơ

| Cấu phần | Có ở |
| :---- | :---- |
| Khối kiểm soát tài liệu — mã, phiên bản, ngày, người lập, người duyệt | Trang bìa mọi tài liệu |
| Lịch sử sửa đổi | Trang bìa mọi tài liệu |
| **Mục lục** | Tự sinh, mọi tài liệu từ 4 mục trở lên |
| **Danh mục tài liệu** | `00-8` mục 3 |
| **Thuật ngữ và từ viết tắt** | `00-8` mục 4 và 5 |
| **Ma trận truy vết yêu cầu** | Phụ lục A của `-02` từng dự án |
| **Kế hoạch quản lý dự án** | `00-9` |
| **Quản lý thay đổi phạm vi** | `00-9` mục 5 |
| **Kiểm soát thay đổi tài liệu** | `00-8` mục 7 |
| Phân phối tài liệu | `00-8` mục 6 |
| Biên bản nghiệm thu | `-07` mục cuối từng dự án |
| Biên bản bàn giao | `-08` phần B từng dự án |

---

## 5. Bộ xương tài liệu mỗi dự án

Ba dự án đã bàn giao dùng chung một bộ xương mười tài liệu:

| Tệp | Nội dung | Công đoạn |
| :---- | :---- | :----: |
| `-01-thuyet-minh-san-pham` | Sản phẩm là gì, giải quyết việc gì, ai dùng, phạm vi | — |
| `-02-cd1-xac-dinh-yeu-cau` | Bối cảnh, yêu cầu nghiệp vụ, yêu cầu chức năng có mã, tiêu chí nghiệm thu | 1 |
| `-03-cd2-thiet-ke-kien-truc` | Kiến trúc, phân rã thành phần, luồng xử lý, **nhật ký quyết định kỹ thuật** | 2 |
| `-04-cd2-thiet-ke-du-lieu` | Mô hình dữ liệu, ràng buộc, quan hệ, phân quyền, dữ liệu cá nhân | 2 |
| `-05-cd2-thiet-ke-giao-dien-va-luong` | Bản đồ màn hình, luồng người dùng, quy tắc hiển thị | 2 |
| `-06-cd3-lap-trinh-va-nhat-ky` | Tổ chức mã nguồn, quy ước, **nhật ký phát triển theo mốc** | 3 |
| `-07-cd4-kiem-thu-va-uat` | Chiến lược kiểm thử, bộ ca có mã, kết quả, **biên bản nghiệm thu** | 4 |
| `-08-cd5-6-7-dong-goi-trien-khai` | Đóng gói, cài đặt, chuyển giao, bảo trì, phát hành, **biên bản bàn giao** | 5·6·7 |
| `-09-huong-dan-su-dung` | Hướng dẫn người dùng cuối và quản trị viên | 6 |
| `-10-tra-cuu-ky-thuat` | Sổ tra cứu: điểm truy cập, cấu hình, **sổ sự cố** | 3·6 |

DA1 có thêm hai tài liệu thao tác về kết nối Telegram — `DA1-11` bản đầy đủ, `DA1-12` bản rút gọn.

---

## 6. Bảy công đoạn sản xuất phần mềm

| # | Công đoạn | Trạng thái |
| :----: | :---- | :---- |
| 1 | Xác định yêu cầu | ✅ DA1–DA3 · 📝 DA4 dự thảo chờ duyệt |
| 2 | Phân tích và thiết kế | ✅ DA1–DA3 · 📝 DA4 dự thảo chờ duyệt |
| 3 | Lập trình, viết mã lệnh | ✅ DA1–DA3 · ☐ DA4 chưa có bằng chứng |
| 4 | Kiểm tra, thử nghiệm phần mềm | ✅ DA1–DA3 · ☐ DA4 mới có bộ ca chưa chạy |
| 5 | Hoàn thiện, đóng gói sản phẩm | ✅ DA1–DA3 · ☐ DA4 mới có danh sách kiểm tra |
| 6 | Cài đặt, chuyển giao, hướng dẫn, bảo trì, bảo hành | ✅ DA1–DA3 · ☐ DA4 chưa triển khai |
| 7 | Phát hành, phân phối | ✅ DA1, DA3 · DA2 vận hành trong DA1 · ☐ DA4 chưa phát hành |

Bảng đối chiếu chi tiết từng công đoạn với tài liệu và bằng chứng gốc: `00-ho-so-chung/00-3-doi-chieu-ho-so-theo-cong-doan.md`.

> **Lưu ý pháp lý.** Văn bản quy định quy trình sản xuất sản phẩm phần mềm, danh mục sản phẩm phần mềm và hồ sơ giao dịch liên kết có thể được sửa đổi theo thời gian. Trước khi nộp, bộ phận kế toán cần đối chiếu với văn bản đang có hiệu lực. Bộ hồ sơ soạn theo cấu trúc bảy công đoạn — cấu trúc này ổn định qua các lần sửa đổi, nhưng tên gọi và số hiệu văn bản cần kiểm tra lại.

---

## 7. Bằng chứng gốc kèm theo hồ sơ

| Bằng chứng | Nội dung |
| :---- | :---- |
| Kho mã nguồn DA1 + DA2 | **218 lần ghi nhận**, 15/06/2026 → 31/08/2026 |
| Kho mã nguồn DA3 | **163 lần ghi nhận**, 06/02/2026 → 12/06/2026 |
| Tài liệu kỹ thuật trong kho DA3 | 7.600 dòng, viết trong quá trình phát triển |
| Hệ thống đang vận hành | `bioscope.vn`, `admin.bioscope.vn`, cổng chat BioBot |
| Dữ liệu vận hành | Bản ghi công việc AI, nhật ký hỏi đáp, hội thoại thật |

Lịch sử ghi nhận thay đổi là bằng chứng mạnh nhất: **381 mốc thời gian trải bảy tháng liên tục**, không dựng ngược lại được.

---

## 8. Việc cần hoàn tất trước khi nộp

| # | Việc | Bên | Tài liệu tham chiếu |
| :----: | :---- | :---- | :---- |
| 1 | **Xác nhận ma trận phân công công việc** | OPTIMAI | `00-1` mục 4.1 |
| 2 | Tập hợp hồ sơ nhân sự bốn người | OPTIMAI | `00-1` mục 5 |
| 3 | Ký hợp đồng và phụ lục phạm vi từng dự án | Hai bên | `00-7` mục 2 |
| 4 | Chạy bộ ca kiểm thử, điền kết quả | OPTIMAI | `-07` các dự án |
| 5 | Ký biên bản nghiệm thu ba dự án | Hai bên | `-07` mục cuối |
| 6 | Ký biên bản bàn giao | Hai bên | `-08` phần B |
| 7 | Điền bảng chi phí, đối chiếu với giá bán | OPTIMAI | `00-6` |
| 8 | **Lập hồ sơ giao dịch liên kết** | Hai bên | `00-7` mục 5 |
| 9 | Xử lý nơi lưu kho mã nguồn | OPTIMAI | `00-7` mục 4.2 |
| 10 | Ghi nhận tài sản hoặc chi phí phần mềm | Bioscope | `00-6` mục 9 |

**Mục 1 và 8 là hai mục quan trọng nhất.** Mục 1 nối khối lượng công việc ghi trong kho mã nguồn với nhân sự có hợp đồng lao động tại OPTIMAI. Mục 8 là nghĩa vụ riêng của giao dịch giữa hai công ty liên kết.

---

## 9. Cách dựng lại bản .docx

Toàn bộ tài liệu viết bằng Markdown. Bản Word dựng tự động, giữ đúng nhận diện thương hiệu:

```bash
cd docs/_cong-cu && node run.js
```

Lệnh này quét mọi tệp `.md` trong `docs/` và sinh tệp `.docx` cùng tên bên cạnh. Sửa nội dung thì sửa tệp `.md` rồi chạy lại — **không sửa trực tiếp vào tệp `.docx`**, vì lần dựng sau sẽ ghi đè.
