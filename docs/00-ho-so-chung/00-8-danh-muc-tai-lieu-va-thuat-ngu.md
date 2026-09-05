<!--HOSO
phu_de: Danh mục tài liệu, thuật ngữ và quy ước hồ sơ
pham_vi: Toàn bộ hồ sơ — bốn dự án
ngay_lap: 10/01/2026
phien_ban: 2.0
nguoi_lap: A Hùng — Product Owner, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 10/01/2026 | Ban hành lần đầu — quy ước đặt mã và thuật ngữ
lich_su: 1.1 | 20/06/2026 | Bổ sung danh mục dự án DA1 và DA2
lich_su: 2.0 | 03/09/2026 | Bổ sung danh mục đầy đủ 52 tài liệu, bảng phân phối và quy trình kiểm soát thay đổi
-->
# DANH MỤC TÀI LIỆU, THUẬT NGỮ VÀ QUY ƯỚC HỒ SƠ

*Tài liệu chung — điểm vào tra cứu cho toàn bộ hồ sơ.*

---

## 1. Quy ước đặt mã tài liệu

```
   00-3-doi-chieu-ho-so-theo-cong-doan
   ▲  ▲ ▲
   │  │ └─ tên rút gọn, không dấu, gạch nối
   │  └─── số thứ tự trong bộ
   └────── mã bộ hồ sơ
```

| Mã bộ | Bộ hồ sơ |
| :---- | :---- |
| `00` | Hồ sơ chung — áp dụng cho mọi dự án |
| `DA1` | Website Bioscope và Hệ quản trị nội dung |
| `DA2` | Hệ thống AI chuẩn hoá dữ liệu sản phẩm |
| `DA3` | Chatbot AI đa kênh BioBot |
| `DA4` | Chatbot Telegram và Google Workspace |

### Quy ước số thứ tự trong bộ dự án

| Số | Nội dung | Công đoạn |
| :----: | :---- | :----: |
| `01` | Thuyết minh sản phẩm | — |
| `02` | Xác định yêu cầu | 1 |
| `03` `04` `05` | Thiết kế: kiến trúc · dữ liệu · giao diện | 2 |
| `06` | Lập trình và nhật ký phát triển | 3 |
| `07` | Kiểm thử và nghiệm thu | 4 |
| `08` | Đóng gói, triển khai, bàn giao, phát hành | 5·6·7 |
| `09` | Hướng dẫn sử dụng | 6 |
| `10` | Sổ tra cứu kỹ thuật | 3·6 |
| `11` trở lên | Tài liệu thao tác bổ sung của riêng dự án | 6 |

---

## 2. Quy ước đánh số phiên bản tài liệu

| Dạng | Nghĩa |
| :---- | :---- |
| `0.x` | **Dự thảo** — chưa duyệt, chưa dùng làm căn cứ |
| `1.0` | Ban hành lần đầu, đã duyệt |
| `1.x` | Bổ sung, sửa chữa; không thay đổi kết luận |
| `2.0` | Thay đổi cấu trúc hoặc kết luận của tài liệu |

Mọi thay đổi phải ghi vào **Lịch sử sửa đổi** ở trang bìa: phiên bản, ngày, nội dung sửa đổi. Không sửa nội dung mà không ghi lịch sử.

---

## 3. Danh mục tài liệu

**52 tài liệu.** Cột *phiên bản* và *ngày* lấy từ trang bìa của chính tài liệu đó.

### 3.1 Hồ sơ chung — 9 tài liệu

| Mã | Tên tài liệu | Nội dung chính | PB | Ngày lập | Người lập |
| :---- | :---- | :---- | :----: | :----: | :---- |
| `00-1` | Năng lực nhà thầu và đội ngũ thực hiện | Quan hệ hai bên; khẳng định của bên thực hiện; bốn nhân sự và vai trò; **ma trận phân công theo bảy công đoạn**; ranh giới công cụ / sản phẩm; bằng chứng khối lượng lao động | 2.0 | 08/01/2026 | A Hùng |
| `00-2` | Quy trình sản xuất phần mềm | Bốn nguyên tắc chi phối; **bảy công đoạn**: việc làm, đầu ra, bằng chứng để lại; sơ đồ tổng quát | 1.3 | 10/01/2026 | Quân |
| `00-3` | Bảng đối chiếu hồ sơ theo công đoạn | **Đối chiếu từng công đoạn với tài liệu chứng minh và bằng chứng gốc**; lệnh kiểm chứng; danh sách kiểm tra trước khi nộp | 1.1 | 03/09/2026 | A Hùng |
| `00-4` | Hạ tầng, công cụ và môi trường phát triển | Ba tầng môi trường; hạ tầng vận hành từng dự án; công cụ; phiên bản nền tảng đã ghim; quản lý bí mật; sao lưu | 1.2 | 12/01/2026 | Quân |
| `00-5` | Quy chuẩn mã nguồn và quản lý phiên bản | Quy chuẩn viết mã; kiểm tra bắt buộc; quy ước mô tả thay đổi; **quy trình bảy bước đổi cấu trúc cơ sở dữ liệu**; sổ tra cứu sự cố | 1.3 | 10/01/2026 | Quân |
| `00-6` | Hồ sơ chi phí phát triển | Bốn nhóm chi phí; bảng kê nhân công theo vai trò; căn cứ phân bổ; đối chiếu chi phí dịch vụ AI với hoá đơn; đối chiếu chi phí với giá bán. **Mọi ô số để trống** | 2.0 | 15/01/2026 | Kế toán |
| `00-7` | Quan hệ hợp đồng, bàn giao và quyền sở hữu | Hợp đồng và phụ lục phạm vi; chuỗi nghiệm thu → bàn giao → hoá đơn; **quyền sở hữu trí tuệ**; **giao dịch liên kết**; nghĩa vụ hồ sơ từng bên | 1.1 | 15/01/2026 | A Hùng |
| `00-8` | Danh mục tài liệu, thuật ngữ và quy ước | *Tài liệu đang đọc.* Quy ước mã và phiên bản; **danh mục 52 tài liệu**; thuật ngữ; từ viết tắt; phân phối; kiểm soát thay đổi | 2.0 | 10/01/2026 | A Hùng |
| `00-9` | Kế hoạch quản lý dự án | Phạm vi; tổ chức và trách nhiệm; tiến độ theo mốc; **quản lý thay đổi phạm vi**; quản lý rủi ro; trao đổi thông tin; tiêu chí kết thúc | 1.1 | 12/01/2026 | A Hùng |

### 3.2 DA1 — Website và Hệ quản trị nội dung · 12 tài liệu

| Mã | Tên tài liệu | Nội dung chính | PB | Ngày lập | Người lập |
| :---- | :---- | :---- | :----: | :----: | :---- |
| `DA1-01` | Thuyết minh sản phẩm | Hai bên trong dự án; sản phẩm là gì; vấn đề giải quyết; người dùng và vai trò; 49 nhóm dữ liệu; 12 mô-đun; phạm vi loại trừ | 1.1 | 20/05/2026 | A Hùng |
| `DA1-02` | Công đoạn 1 — Xác định yêu cầu | Hiện trạng đo được; 8 yêu cầu nghiệp vụ; **44 yêu cầu chức năng**; 13 yêu cầu phi chức năng; 10 tiêu chí nghiệm thu; **ma trận truy vết** | 1.1 | 26/05/2026 | A Hùng |
| `DA1-03` | Công đoạn 2 — Thiết kế kiến trúc | Kiến trúc hai ứng dụng; cơ chế mô-đun; bốn luồng xử lý chính; đa ngữ; bảo mật nhiều lớp; **8 nhật ký quyết định kỹ thuật** | 1.2 | 02/06/2026 | Quân |
| `DA1-04` | Công đoạn 2 — Thiết kế cơ sở dữ liệu | Sơ đồ quan hệ; `ingredients` 73 trường; **bảng giá khoá ở tầng trường**; ba trục phân loại bài viết; phân quyền; dữ liệu cá nhân; chỉ mục | 1.3 | 05/06/2026 | Quân |
| `DA1-05` | Công đoạn 2 — Thiết kế giao diện và luồng | Hệ thống nhận diện; bản đồ 27 đường dẫn; ba luồng người dùng chính; trạng thái hiển thị; màn hình nhỏ; khả năng tiếp cận | 1.2 | 09/06/2026 | Dưỡng |
| `DA1-06` | Công đoạn 3 — Lập trình và nhật ký | Tổ chức mã nguồn; kiểm tra bắt buộc; **10 mốc phát triển**; thống kê khối lượng theo tháng; việc còn lại | 1.4 | 15/06/2026 | Quân |
| `DA1-07` | Công đoạn 4 — Kiểm thử và nghiệm thu | Chiến lược 4 lớp; **62 ca kiểm thử** đối chiếu ngược về yêu cầu; kết quả kiểm chứng hệ thống bình luận; 10 lỗi; **biên bản nghiệm thu** | 1.1 | 20/08/2026 | Thu |
| `DA1-08` | Công đoạn 5·6·7 — Đóng gói và triển khai | Rà soát 13 mục; cấu trúc ảnh chứa; biến môi trường; quy trình nâng cấp; kiểm tra sau triển khai 13 mục; lùi phiên bản; bảo trì; **biên bản bàn giao** | 1.1 | 25/08/2026 | Quân |
| `DA1-09` | Hướng dẫn sử dụng | Ba khái niệm phải hiểu; quản lý nguyên liệu; viết bài; quản lý bình luận; cấu hình website; xử lý tình huống | 1.1 | 28/08/2026 | A Hùng |
| `DA1-10` | Sổ tra cứu kỹ thuật | 8 điểm truy cập công khai và phạm vi khoá; chốt chặn dữ liệu hai lớp; **12 sự cố** có nguyên nhân đã xác minh; lệnh thường dùng | 1.2 | 31/08/2026 | Quân |
| `DA1-11` | Hướng dẫn kết nối Telegram | Bản đầy đủ: tạo bot, tạo nhóm, cấu hình, lý do từng bước, xử lý sự cố, bảo mật | 1.1 | 14/08/2026 | Dưỡng |
| `DA1-12` | Cài đặt nhanh Telegram | Bản rút gọn: **24 bước thao tác**, không giải thích | 1.0 | 14/08/2026 | Dưỡng |

### 3.3 DA2 — AI chuẩn hoá dữ liệu sản phẩm · 10 tài liệu

| Mã | Tên tài liệu | Nội dung chính | PB | Ngày lập | Người lập |
| :---- | :---- | :---- | :----: | :----: | :---- |
| `DA2-01` | Thuyết minh sản phẩm | Hai bên; bảy bước dây chuyền; hiệu quả đo được; **nguyên tắc máy đề xuất người quyết định**; **chia trường thành hai loại**; ranh giới dịch vụ ngoài | 1.1 | 20/06/2026 | A Hùng |
| `DA2-02` | Công đoạn 1 — Xác định yêu cầu | Đo hiện trạng 2–3,5 giờ/nguyên liệu; 8 yêu cầu nghiệp vụ; **40 yêu cầu chức năng**; 12 yêu cầu phi chức năng; 8 rủi ro; **ma trận truy vết** | 1.1 | 24/06/2026 | A Hùng |
| `DA2-03` | Công đoạn 2 — Thiết kế kiến trúc | Bảy bước dây chuyền; **ba cơ chế bảo vệ dữ liệu**; cấu hình động nhà cung cấp; ước tính chi phí; xử lý lỗi; **7 nhật ký quyết định** | 1.2 | 30/06/2026 | Quân |
| `DA2-04` | Công đoạn 2 — Thiết kế dữ liệu | Hàng đợi công việc **9 trạng thái**; bộ đếm chi phí; nhật ký ba mức; cấu hình AI; **trường loại A và loại B**; vòng đời bản ghi | 1.2 | 02/07/2026 | Quân |
| `DA2-05` | Công đoạn 2 — Thiết kế giao diện và luồng | Bốn thành phần giao diện tự viết; luồng sinh nội dung; sinh hàng loạt; **luồng duyệt kết quả bốn bước**; cấu hình nhà cung cấp | 1.1 | 04/07/2026 | Dưỡng |
| `DA2-06` | Công đoạn 3 — Lập trình và nhật ký | Tổ chức mã nguồn; ranh giới hai tệp lõi; **7 mốc phát triển**; giải thích tỉ lệ sửa lỗi 40%; việc còn lại | 1.4 | 09/07/2026 | Quân |
| `DA2-07` | Công đoạn 4 — Kiểm thử và nghiệm thu | Vì sao kiểm thử khác DA1; **63 ca**, nhóm chống bịa dữ liệu quan trọng nhất; **kiểm thử đối chiếu tài liệu gốc**; 16 lỗi; biên bản nghiệm thu | 1.1 | 10/08/2026 | Thu |
| `DA2-08` | Công đoạn 5·6·7 — Đóng gói và triển khai | Rà soát 7 mục riêng; biến môi trường; tài khoản dịch vụ Google; kiểm tra sau triển khai; **kiểm soát chi phí hàng tháng**; bàn giao | 1.1 | 15/08/2026 | Quân |
| `DA2-09` | Hướng dẫn sử dụng | AI làm gì và không làm gì; **hai loại trường**; đồng bộ kho tài liệu; sinh nội dung; **duyệt kết quả bốn bước**; xem chi phí | 1.1 | 18/08/2026 | A Hùng |
| `DA2-10` | Sổ tra cứu kỹ thuật | 14 điểm truy cập; bảng cấu hình ↔ biến môi trường; bảng đơn giá mô hình; **16 sự cố**; lệnh tra cứu chi phí và chất lượng | 1.0 | 24/08/2026 | Quân |

### 3.4 DA3 — Chatbot AI đa kênh · 10 tài liệu

| Mã | Tên tài liệu | Nội dung chính | PB | Ngày lập | Người lập |
| :---- | :---- | :---- | :----: | :----: | :---- |
| `DA3-01` | Thuyết minh sản phẩm | Hai bên; kiến trúc sáu dịch vụ; 44 quy trình; hai miền nghiệp vụ; **phân quyền ở tầng công cụ**; **chốt chặn dược**; tài liệu gốc sẵn có 7.600 dòng | 1.2 | 12/01/2026 | A Hùng |
| `DA3-02` | Công đoạn 1 — Xác định yêu cầu | Hiện trạng bốn kênh rời rạc; **rủi ro đặc thù ngành dược**; 10 yêu cầu nghiệp vụ; **54 yêu cầu chức năng**; 14 yêu cầu phi chức năng; **ma trận truy vết** | 1.2 | 15/01/2026 | A Hùng |
| `DA3-03` | Công đoạn 2 — Thiết kế kiến trúc | Ranh giới quy trình / mã; **vòng lặp trợ lý**; **ba lớp chốt chặn an toàn**; kiến trúc đa kênh; dây chuyền tri thức; **9 nhật ký quyết định** | 1.3 | 22/01/2026 | Quân |
| `DA3-04` | Công đoạn 2 — Thiết kế dữ liệu | Ba kho dữ liệu; **30 bảng**; nhật ký AI; **hai bộ sưu tập vectơ tách biệt**; phân quyền ba tầng; dữ liệu cá nhân | 1.2 | 26/01/2026 | Quân |
| `DA3-05` | Công đoạn 2 — Thiết kế giao diện và luồng | Sáu kênh hai kiểu trải nghiệm; bản đồ màn hình theo vai trò; **sáu luồng hội thoại**; quy tắc hiển thị; giao diện quản trị | 1.2 | 29/01/2026 | Dưỡng |
| `DA3-06` | Công đoạn 3 — Lập trình và nhật ký | Tổ chức mã nguồn; bốn tệp lõi trợ lý; **6 mốc phát triển**; thống kê khối lượng; ghi trung thực về chất lượng nhật ký | 1.5 | 06/02/2026 | Quân |
| `DA3-07` | Công đoạn 4 — Kiểm thử và nghiệm thu | Hai nhóm rủi ro; **91 ca**, gồm **6 ca cố tình vượt rào chốt chặn dược**; kiểm phân quyền công cụ; 10 lỗi; biên bản nghiệm thu | 1.1 | 20/05/2026 | Thu |
| `DA3-08` | Công đoạn 5·6·7 — Đóng gói và triển khai | Rà soát 11 mục; sáu dịch vụ và phiên bản ghim; **quy tắc cổng chỉ mở nội bộ**; cài đặt; kiểm tra sau triển khai 15 mục; bảo trì | 1.1 | 05/06/2026 | Quân |
| `DA3-09` | Hướng dẫn sử dụng | Ba điều quan trọng nhất; cách hỏi; đọc câu trả lời; **khi bị chặn vì câu hỏi y tế**; chuyển người thật; nạp tài liệu; dành cho quản trị viên | 1.1 | 08/06/2026 | A Hùng |
| `DA3-10` | Sổ tra cứu kỹ thuật | **14 công cụ và bảng phân quyền**; 44 quy trình theo dải số; điểm truy cập; hằng số quan trọng; **14 sự cố**; lệnh kiểm bảo mật | 1.0 | 12/06/2026 | Quân |

### 3.5 DA4 — Chatbot Telegram và Google Workspace · 10 tài liệu

> **Toàn bộ ở phiên bản `0.1` — dự thảo, chưa duyệt.** Chưa thuộc phạm vi bàn giao. Không dùng làm căn cứ nghiệm thu hay thanh toán.

| Mã | Tên tài liệu | Nội dung chính | PB | Người lập |
| :---- | :---- | :---- | :----: | :---- |
| `DA4-01` | Thuyết minh sản phẩm | Hai bên; định vị, phạm vi, trạng thái và đầu ra | 0.1 | A Hùng |
| `DA4-02` | Công đoạn 1 — Xác định yêu cầu | Yêu cầu, nghiệm thu và câu hỏi cần duyệt | 0.1 | A Hùng |
| `DA4-03` | Công đoạn 2 — Thiết kế kiến trúc | Router, quyền, AI, Sheets, Drive, Dispatcher | 0.1 | Quân |
| `DA4-04` | Công đoạn 2 — Thiết kế dữ liệu | Properties, cấu trúc Sheets, tệp và chính sách lưu trữ | 0.1 | Quân |
| `DA4-05` | Công đoạn 2 — Thiết kế giao diện và luồng | Menu Telegram và các luồng người dùng | 0.1 | Dưỡng |
| `DA4-06` | Công đoạn 3 — Lập trình và nhật ký | Chuẩn mã, kế hoạch và bằng chứng cần thu | 0.1 | Quân |
| `DA4-07` | Công đoạn 4 — Kiểm thử và UAT | 45 ca chức năng, 10 ca an toàn và biểu mẫu nghiệm thu | 0.1 | Thu |
| `DA4-08` | Công đoạn 5·6·7 — Đóng gói và triển khai | Cài đặt, lùi phiên bản, bàn giao và phát hành | 0.1 | Quân |
| `DA4-09` | Hướng dẫn sử dụng | Hướng dẫn người dùng và quản trị viên | 0.1 | A Hùng |
| `DA4-10` | Sổ tra cứu kỹ thuật | Cấu hình, điểm truy cập, mã lỗi và sổ sự cố | 0.1 | Quân |

### 3.6 Mục lục

| Mã | Tên tài liệu | Nội dung chính | PB |
| :---- | :---- | :---- | :----: |
| `README` | Hồ sơ sản xuất phần mềm — mục lục | Hai bên; đội ngũ; bốn dự án; **mục lục toàn bộ**; bộ xương tài liệu; bảy công đoạn; bằng chứng gốc; việc cần hoàn tất | 2.0 |

---

## 4. Thuật ngữ

| Thuật ngữ | Nghĩa dùng trong hồ sơ |
| :---- | :---- |
| **Bên thực hiện** | Công ty OPTIMAI — bên phân tích, thiết kế, lập trình, kiểm thử, bàn giao |
| **Bên thụ hưởng** | Công ty Bioscope — bên đặt hàng, nghiệm thu, tiếp nhận, vận hành |
| **Công đoạn** | Một trong bảy công đoạn của quy trình sản xuất phần mềm |
| **Nhóm dữ liệu** | Một tập bản ghi cùng loại trong hệ quản trị, có mô hình và quyền riêng |
| **Bảng cấu hình** | Thiết lập không gắn với bản ghi cụ thể, áp dụng cho toàn hệ thống |
| **Điểm truy cập** | Một địa chỉ của giao diện lập trình, nhận yêu cầu và trả kết quả |
| **Bản nháp** | Nội dung đã lưu nhưng chưa hiển thị ra ngoài |
| **Đã xuất bản** | Nội dung đang hiển thị công khai |
| **Bảng phiên bản** | Bảng song song do bộ khung sinh ra để lưu lịch sử bản nháp |
| **Kịch bản chuyển đổi** | Tệp lệnh thay đổi cấu trúc cơ sở dữ liệu, đã kiểm chứng trước khi áp |
| **Danh sách trắng** | Cơ chế chỉ cho phép những gì được liệt kê rõ; mọi thứ khác bị chặn |
| **Truy hồi tri thức** | Tìm nội dung theo nghĩa, không chỉ khớp từ khoá |
| **Kho vectơ** | Cơ sở dữ liệu lưu biểu diễn ngữ nghĩa của văn bản, phục vụ tìm theo nghĩa |
| **Công cụ trợ lý** | Một hàm tra dữ liệu mà trợ lý AI được phép gọi |
| **Trường loại A** | Trường chỉ được chép từ tài liệu, không được suy diễn *(DA2)* |
| **Trường loại B** | Trường được suy luận, nhưng mọi con số phải có trong tài liệu *(DA2)* |
| **Chốt chặn dược** | Bộ lọc chặn câu hỏi y tế, dược lý, viết bằng mã nên không vượt được *(DA3)* |
| **Chuyển người thật** | Bàn giao hội thoại từ trợ lý AI sang nhân viên |
| **Ma trận truy vết** | Bảng nối yêu cầu → thiết kế → ca kiểm thử, chứng minh không bỏ sót |
| **Giao dịch liên kết** | Giao dịch giữa hai pháp nhân có quan hệ liên kết |

---

## 5. Từ viết tắt

| Viết tắt | Đầy đủ |
| :---- | :---- |
| **CĐ** | Công đoạn |
| **NV-xx** | Mã yêu cầu nghiệp vụ |
| **YC-xx** | Mã yêu cầu chức năng |
| **PC-xx** | Mã yêu cầu phi chức năng |
| **TC-xx** | Mã ca kiểm thử |
| **QĐ-xx** | Mã nhật ký quyết định kỹ thuật |
| **SC-xx** | Mã sự cố trong sổ tra cứu |
| **L-xx** | Mã lỗi phát hiện qua kiểm thử |
| **PB** | Phiên bản |
| **PO** | Product Owner |
| **QA** | Quality Assurance — bảo đảm chất lượng |
| **UAT** | User Acceptance Testing — nghiệm thu người dùng |
| **RTM** | Requirements Traceability Matrix — ma trận truy vết yêu cầu |

---

## 6. Phân phối tài liệu

| Bộ hồ sơ | OPTIMAI | Bioscope | Cơ quan quản lý *(khi có yêu cầu)* |
| :---- | :----: | :----: | :----: |
| `00` Hồ sơ chung | ✅ | ✅ | ✅ |
| `DA1` `DA2` `DA3` | ✅ | ✅ | ✅ |
| `DA4` *(dự thảo)* | ✅ | ✅ | — |
| `00-6` Hồ sơ chi phí | ✅ | Phần liên quan | ✅ |

### Quy tắc phân phối

| Quy tắc | Nội dung |
| :---- | :---- |
| Bản chính thức | Bản `.docx` dựng từ tệp `.md` trong kho tài liệu dự án |
| Sửa nội dung | **Chỉ sửa tệp `.md`, rồi dựng lại `.docx`.** Sửa thẳng vào `.docx` sẽ bị ghi đè |
| Phân phối ra ngoài | Phải có phê duyệt của Ban Giám đốc OPTIMAI |
| Đóng dấu | Trang bìa ghi *"Tài liệu nội bộ — không phổ biến ra ngoài"* |

---

## 7. Kiểm soát thay đổi tài liệu

### 7.1 Khi nào phải cập nhật tài liệu

| Sự kiện | Tài liệu phải cập nhật |
| :---- | :---- |
| Thay đổi phạm vi, thêm hoặc bớt yêu cầu | `-02`, và `-07` nếu ảnh hưởng ca kiểm thử |
| Thay đổi kiến trúc hoặc quyết định kỹ thuật | `-03`, ghi thêm vào nhật ký quyết định |
| Thay đổi mô hình dữ liệu | `-04`, kèm kịch bản chuyển đổi |
| Thêm chức năng | `-01`, `-02`, `-06`, `-07`, `-09` |
| Phát hiện sự cố mới | `-10`, mục sổ sự cố |
| Phát hành phiên bản mới | `-08`, danh sách thay đổi theo phiên bản |
| Thay đổi nhân sự dự án | `00-1`, ma trận phân công |

### 7.2 Quy trình

```
   Phát sinh thay đổi
          ↓
   Người lập tài liệu cập nhật nội dung
          ↓
   Ghi vào Lịch sử sửa đổi: phiên bản mới, ngày, nội dung sửa
          ↓
   Người duyệt xác nhận
          ↓
   Dựng lại bản .docx
          ↓
   Phân phối bản mới, thu hồi bản cũ nếu đã phát ra ngoài
```

> **Không sửa nội dung mà không tăng phiên bản và ghi lịch sử.** Tài liệu có nội dung khác nhau ở hai bản in cùng số phiên bản là lỗi nghiêm trọng về kiểm soát tài liệu — người kiểm tra sẽ không tin bất kỳ tài liệu nào khác trong bộ.

---

## 8. Cách dựng lại bản .docx

```bash
cd docs/_cong-cu && node run.js
```

Lệnh quét mọi tệp `.md` trong `docs/` và sinh tệp `.docx` cùng tên. Bản `.docx` mang nhãn nhà thầu, mục lục tự sinh, khối kiểm soát tài liệu và lịch sử sửa đổi ở trang bìa.
