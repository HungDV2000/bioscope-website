<!--HOSO
phu_de: Năng lực nhà thầu và đội ngũ thực hiện
pham_vi: Toàn bộ hồ sơ — bốn dự án
ngay_lap: 08/01/2026
phien_ban: 2.0
nguoi_lap: HungDV — Product Owner, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 08/01/2026 | Ban hành lần đầu, phục vụ dự án DA3
lich_su: 1.1 | 20/05/2026 | Bổ sung phạm vi dự án DA1
lich_su: 1.2 | 20/06/2026 | Bổ sung phạm vi dự án DA2
lich_su: 2.0 | 03/09/2026 | Xác lập rõ quan hệ nhà thầu OPTIMAI — chủ đầu tư Bioscope; bổ sung danh sách nhân sự theo vai trò
-->
# NĂNG LỰC NHÀ THẦU VÀ ĐỘI NGŨ THỰC HIỆN

*Tài liệu chung — áp dụng cho toàn bộ hồ sơ.*

---

## 1. Hai bên trong dự án

| | **Bên thực hiện** | **Bên thụ hưởng** |
| :---- | :---- | :---- |
| Tên | **Công ty OPTIMAI** | **Công ty Bioscope** |
| Vai trò | Phân tích, thiết kế, lập trình, kiểm thử, đóng gói, triển khai, bàn giao | Đặt hàng, cung cấp yêu cầu nghiệp vụ, nghiệm thu, tiếp nhận, vận hành |
| Sản phẩm | Tạo ra phần mềm | Sở hữu và sử dụng phần mềm sau bàn giao |
| Hồ sơ này chứng minh | **OPTIMAI thực sự sản xuất ra phần mềm** — đủ bảy công đoạn | **Bioscope đã mua và tiếp nhận sản phẩm có thật** |

### 1.1 Bộ hồ sơ phục vụ hai mục đích khác nhau

Đây là điểm cần hiểu trước khi đọc các tài liệu còn lại.

| | Với hồ sơ của **OPTIMAI** | Với hồ sơ của **Bioscope** |
| :---- | :---- | :---- |
| Câu hỏi cần trả lời | Công ty có thực hiện hoạt động sản xuất phần mềm không? | Khoản chi mua phần mềm có tương ứng với sản phẩm có thật không? |
| Tài liệu then chốt | Bảy công đoạn: `-02` đến `-08` của từng dự án | Hợp đồng, biên bản nghiệm thu, biên bản bàn giao, hoá đơn |
| Bằng chứng gốc | Kho mã nguồn, 381 lần ghi nhận thay đổi trải 7 tháng | Hệ thống đang vận hành, có người dùng và dữ liệu thật |

Cùng một bộ tài liệu, hai bên dùng cho hai việc. Vì vậy hồ sơ phải đủ chi tiết để đứng vững ở **cả hai phía**.

---

## 2. Khẳng định của bên thực hiện

Công ty OPTIMAI khẳng định bốn sản phẩm phần mềm trong bộ hồ sơ này do **đội ngũ nhân sự của OPTIMAI trực tiếp thực hiện toàn bộ**, từ khâu xác định yêu cầu đến khâu bàn giao và bảo hành.

Cụ thể:

- OPTIMAI **không mua** phần mềm đóng gói rồi đổi tên.
- OPTIMAI **không thuê ngoài** phần nào của quá trình phát triển. Không có hợp đồng giao khoán cho bên thứ ba.
- OPTIMAI **không nhận chuyển giao** mã nguồn từ đối tác nào.
- Toàn bộ mã nguồn nghiệp vụ do nhân sự OPTIMAI tự viết. Thư viện mã nguồn mở được dùng làm **nền tảng công cụ**, không phải sản phẩm — ranh giới ở mục 6.

---

## 3. Đội ngũ thực hiện

### 3.1 Bốn nhân sự và vai trò

| Nhân sự | Vai trò | Trách nhiệm chính | Công đoạn phụ trách |
| :---- | :---- | :---- | :---- |
| **HungDV** | Product Owner | Làm việc với Bioscope, chốt yêu cầu nghiệp vụ, quyết định phạm vi, chủ trì nghiệm thu | **1**, và ký nghiệm thu ở **4** |
| **QuanNH** | Team Lead | Thiết kế kiến trúc, thiết kế dữ liệu, quyết định kỹ thuật, lập trình, đóng gói, triển khai | **2**, **3**, **5**, **6** |
| **Duong Vu** | Developer | Lập trình theo thiết kế, tự kiểm tra, sửa lỗi | **3** |
| **Thu** | QA | Dựng bộ ca kiểm thử, chạy kiểm thử, ghi nhận lỗi, xác nhận đạt | **4** |

### 3.2 Quy mô đội và ý nghĩa của nó

Bốn người cho bốn sản phẩm trải bảy tháng là **đội nhỏ, làm liên tục**. Điều này giải thích một số đặc điểm thấy được trong hồ sơ:

| Đặc điểm | Nguyên nhân |
| :---- | :---- |
| Một người đảm nhiều công đoạn | Đội nhỏ; Team Lead vừa thiết kế vừa lập trình |
| Kiến trúc ưu tiên đơn giản, dễ bảo trì | Thiết kế phải để **một người bảo trì được** |
| Dùng nhiều nền tảng mã nguồn mở | Không đủ người để viết lại những thứ đã có |
| Nhật ký phát triển giai đoạn đầu sơ sài | Quy trình trưởng thành dần — xem mục 8 |

Đây là mô tả trung thực, không phải điểm yếu cần che. Một đội bốn người tạo ra khối lượng ở mục 7 trong bảy tháng là hoàn toàn hợp lý và kiểm chứng được.

---

## 4. Phân công công việc theo vai trò

### 4.1 Ma trận phân công

Bảng dưới là phân công chính thức của dự án: mỗi công đoạn giao cho vai trò nào, sản phẩm đầu ra là gì.

| Công đoạn | HungDV<br>*Product Owner* | QuanNH<br>*Team Lead* | Duong Vu<br>*Developer* | Thu<br>*QA* | Đầu ra |
| :---- | :----: | :----: | :----: | :----: | :---- |
| **1** Xác định yêu cầu | **C** | T | | T | Tài liệu `-02` |
| **2** Phân tích và thiết kế | T | **C** | T | | Tài liệu `-03` `-04` `-05` |
| **3** Lập trình, viết mã lệnh | | **C** | **C** | | Mã nguồn, tài liệu `-06` |
| **4** Kiểm tra, thử nghiệm | T | T | T | **C** | Tài liệu `-07` |
| **5** Hoàn thiện, đóng gói | | **C** | T | T | Tài liệu `-08` phần A |
| **6** Cài đặt, chuyển giao, bảo trì | T | **C** | T | | Tài liệu `-08` phần B, `-09`, `-10` |
| **7** Phát hành | **C** | T | | | Tài liệu `-08` phần C |

**C** — chịu trách nhiệm chính  ·  **T** — tham gia

### 4.2 Phân công theo tài liệu

Mỗi tài liệu ghi rõ người lập ở trang bìa, khớp với ma trận trên:

| Nhóm tài liệu | Người lập |
| :---- | :---- |
| `-01` Thuyết minh sản phẩm · `-02` Xác định yêu cầu · `-09` Hướng dẫn sử dụng | **HungDV** — Product Owner |
| `-03` `-04` `-05` Thiết kế · `-06` Nhật ký lập trình · `-08` Đóng gói và triển khai · `-10` Tra cứu kỹ thuật | **QuanNH** — Team Lead |
| `-07` Kiểm thử và nghiệm thu | **Thu** — QA |

### 4.3 Ghi chú về danh tính trong kho mã nguồn

Kho mã nguồn ghi nhận thay đổi dưới **tài khoản kỹ thuật của đội phát triển**, không phân biệt theo từng cá nhân. Đây là cách làm phổ biến với đội nhỏ làm việc tập trung.

Vì vậy:

| Nguồn thông tin | Cho biết gì |
| :---- | :---- |
| Lịch sử kho mã nguồn | **Khối lượng và tiến độ của cả đội** — 381 lần ghi nhận, 7 tháng liên tục |
| Ma trận phân công ở mục 4.1 | **Ai chịu trách nhiệm phần nào** |
| Hồ sơ nhân sự ở mục 5 | Quan hệ lao động của từng người với OPTIMAI |

Ba nguồn này bổ sung cho nhau. Lịch sử kho mã nguồn chứng minh **công việc có thật và diễn ra theo thời gian thực**; ma trận phân công và hồ sơ nhân sự chứng minh **công việc đó do đội ngũ OPTIMAI thực hiện**.

> **Khuyến nghị cho các dự án sau.** Cấu hình danh tính theo hòm thư công ty của từng người ngay từ đầu dự án:
>
> ```bash
> git config user.name "Họ Tên"
> git config user.email "hoten@optimai.vn"
> ```
>
> Khi đó lịch sử kho mã nguồn tự nó phân tách được theo cá nhân, không cần đối chiếu qua ma trận phân công.

---

## 5. Hồ sơ nhân sự cần đính kèm

Với mỗi người có tên ở mục 3.1 và mục 4.1, hồ sơ của **OPTIMAI** cần có:

| # | Tài liệu | Bộ phận cung cấp | Đã có |
| :---- | :---- | :---- | :----: |
| 1 | Hợp đồng lao động | Nhân sự OPTIMAI | ☐ |
| 2 | Quyết định phân công tham gia dự án, ghi rõ vai trò | Nhân sự OPTIMAI | ☐ |
| 3 | Bảng lương và chứng từ chi trả | Kế toán OPTIMAI | ☐ |
| 4 | Chứng từ đóng bảo hiểm xã hội | Nhân sự OPTIMAI | ☐ |
| 5 | Bản mô tả công việc | Nhân sự OPTIMAI | ☐ |
| 6 | **Ma trận phân công có xác nhận của Ban Giám đốc** | Ban Giám đốc OPTIMAI | ☐ |

Năm tài liệu đầu do bộ phận nhân sự và kế toán cung cấp. Tài liệu này không thay thế được chúng.

---

## 6. Ranh giới: cái gì OPTIMAI tự viết, cái gì là công cụ

Đây là mục dễ bị hiểu nhầm nhất, nên nói thẳng.

Phần mềm hiện đại nào cũng dựng trên nền thư viện có sẵn — không ai viết lại trình duyệt, hệ quản trị cơ sở dữ liệu hay bộ dựng giao diện từ con số không. Việc dùng thư viện mã nguồn mở **không làm mất tính tự sản xuất**, giống như xưởng cơ khí dùng máy tiện mua sẵn vẫn là xưởng tự sản xuất.

### 6.1 Nền tảng công cụ — vật tư đầu vào

| Thành phần | Vai trò | Giấy phép |
| :---- | :---- | :---- |
| TypeScript, Python | Ngôn ngữ lập trình | Mã nguồn mở |
| Next.js, React | Bộ dựng giao diện web | MIT |
| Payload | Bộ khung hệ quản trị nội dung | MIT |
| FastAPI, SQLAlchemy | Bộ khung dịch vụ máy chủ | MIT |
| PostgreSQL, Redis, Qdrant | Cơ sở dữ liệu, bộ nhớ đệm, kho vectơ | Mã nguồn mở |
| n8n | Nền tảng điều phối quy trình | Sustainable Use License |
| Docker | Đóng gói và triển khai | Apache 2.0 |

OPTIMAI không tuyên bố sở hữu các thành phần này.

### 6.2 Sản phẩm do OPTIMAI tự viết

| Nội dung | Quy mô |
| :---- | :---- |
| Mô hình dữ liệu nghiệp vụ: nguyên liệu, danh mục, dịch vụ, bài viết, hội thoại, phiên chat, công việc AI, hoá đơn | 49 nhóm dữ liệu (DA1/DA2) + 30 bảng (DA3) |
| Quy tắc nghiệp vụ: phân quyền, kiểm duyệt, đa ngữ, giới hạn truy cập, chống lạm dụng | Rải khắp mã nguồn |
| Giao diện: trang công khai, khung quản trị, khung chat, cổng trợ lý | 68 thành phần (DA1) + 95 tệp (DA3) |
| Giao diện lập trình phục vụ tích hợp | 52 điểm truy cập (DA1/DA2) + 12 nhóm (DA3) |
| Dây chuyền xử lý AI: dựng câu lệnh, kiểm chứng kết quả, chống bịa dữ liệu, ước tính chi phí | ~4.200 dòng (DA2) + ~20.400 dòng (DA3) |
| Quy trình tự động hoá của chatbot | 44 quy trình |
| Kịch bản chuyển đổi cấu trúc dữ liệu | 28 tệp |
| Tài liệu kỹ thuật viết trong quá trình phát triển | 7.600 dòng (DA3) |

Đây là **sản phẩm**. Không thư viện nào làm sẵn phần này — nó là tri thức nghiệp vụ được viết thành mã.

### 6.3 Cách kiểm chứng

Gỡ toàn bộ thư viện bên ngoài ra, phần còn lại vẫn là hàng chục nghìn dòng mã mang tên gọi và khái niệm riêng của ngành nguyên liệu thực phẩm chức năng — *nguyên liệu*, *chỉ tiêu kỹ thuật*, *nhóm quản lý*, *phiếu phân tích*, *trạng thái pháp lý*. Không sản phẩm đóng gói nào có sẵn những khái niệm đó.

---

## 7. Bằng chứng khối lượng lao động

Số liệu trích trực tiếp từ kho mã nguồn.

### 7.1 DA1 + DA2 — Website và hệ quản trị

| Tháng | Số lần ghi nhận | Dòng thêm | Dòng xoá |
| :---- | :----: | :----: | :----: |
| 06/2026 | 27 | 105.947 | 4.899 |
| 07/2026 | 148 | 81.342 | 4.910 |
| 08/2026 | 43 | 17.354 | 58.901 |
| **Tổng** | **218** | **204.643** | **68.710** |

Tháng 8 xoá nhiều hơn thêm — dấu hiệu của giai đoạn **dọn dẹp và tinh gọn**, không phải dựng mới. Một sản phẩm mua về đổi tên sẽ không có hình dạng này, vì không ai hiểu mã nguồn đủ để dám xoá.

### 7.2 DA3 — Chatbot AI đa kênh

| Tháng | Số lần ghi nhận | Dòng thêm | Dòng xoá |
| :---- | :----: | :----: | :----: |
| 02/2026 | 14 | 3.490 | 85 |
| 03/2026 | 11 | 13.494 | 1.199 |
| 04/2026 | 6 | 12.225 | 4.497 |
| 05/2026 | 1 | 11.629 | 14 |
| 06/2026 | 131 | 98.008 | 13.985 |
| **Tổng** | **163** | **138.846** | **19.780** |

Bốn tháng đầu ghi nhận thưa nhưng khối lượng lớn — làm theo khối. Tháng 6 ghi nhận dày, bước nhỏ — giai đoạn hoàn thiện và đưa vào vận hành.

### 7.3 Nhận xét

Tổng **381 lần ghi nhận thay đổi trải bảy tháng liên tục**, mỗi lần có mốc thời gian và nội dung thay đổi ở mức từng dòng.

Đây là loại bằng chứng **không làm giả được sau**: nó phải tích luỹ theo thời gian thực.

---

## 8. Sự trưởng thành của quy trình — ghi trung thực

Mô tả thay đổi trong kho mã nguồn ở giai đoạn đầu **rất sơ sài** — nhiều lần chỉ ghi `up`, `update code`, `fix home`. Với DA3 thì tình trạng này kéo dài suốt dự án.

Đây là thực tế, không che giấu. Hai điểm cần nói rõ:

**Thứ nhất — DA3 bù lại bằng tài liệu.** Kho mã nguồn DA3 chứa hơn **7.600 dòng tài liệu kỹ thuật viết ngay trong quá trình phát triển**: đặc tả yêu cầu 1.566 dòng, hướng dẫn quy trình 4.468 dòng, cùng năm tài liệu khác. Đội **có ghi chép, chỉ là ghi vào tài liệu chứ không ghi vào mô tả thay đổi**.

**Thứ hai — quy trình được siết lại từ 09/07/2026.** Từ mốc đó, mô tả thay đổi phải trả lời được câu hỏi *"vì sao sửa"*, không chỉ *"sửa gì"*. Chất lượng nhật ký đổi hẳn.

Sự chuyển biến này **tự nó là bằng chứng**: quy trình của đội trưởng thành dần trong quá trình làm — đúng đặc điểm của một đội trực tiếp sản xuất, khác hẳn một đơn vị nhận bàn giao trọn gói từ bên khác.

---

## 9. Quan hệ hợp đồng với Bioscope

Chi tiết ở `00-7-hop-dong-ban-giao-va-quyen-so-huu.md`. Tóm tắt:

| Nội dung | Trạng thái |
| :---- | :---- |
| Hợp đồng phát triển phần mềm giữa OPTIMAI và Bioscope | ☐ *(cần đính kèm)* |
| Phụ lục phạm vi từng dự án | ☐ |
| Biên bản nghiệm thu từng dự án | ☐ *(mẫu ở `-07` mục cuối)* |
| Biên bản bàn giao | ☐ *(mẫu ở `-08` phần B)* |
| Hoá đơn | ☐ |
| **Hồ sơ xác định giá giao dịch liên kết** | ☐ **xem cảnh báo ở `00-7` mục 5** |

---

## 10. Cam kết

Công ty OPTIMAI cam kết:

1. Toàn bộ nội dung trong bộ hồ sơ này phản ánh đúng thực tế phát triển.
2. Mã nguồn, lịch sử thay đổi và hệ thống đang vận hành sẵn sàng cho việc kiểm tra đối chiếu.
3. Nếu có nội dung nào không khớp với thực tế, công ty chịu trách nhiệm giải trình và điều chỉnh.

*Người lập:* ..................................... *Chức danh:* .....................................

*Ngày:* ....... /....... /...........

*Người đại diện theo pháp luật Công ty OPTIMAI ký, đóng dấu:*
