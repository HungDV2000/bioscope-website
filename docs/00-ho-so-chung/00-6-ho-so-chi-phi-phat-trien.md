<!--HOSO
phu_de: Chi phí phát triển của bên thực hiện và ghi nhận của bên thụ hưởng
pham_vi: Toàn công ty — ba dự án DA1, DA2, DA3
ngay_lap: 15/01/2026
phien_ban: 2.0
nguoi_lap: Bộ phận Kế toán — Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 15/01/2026 | Ban hành lần đầu, phục vụ dự án DA3
lich_su: 1.1 | 20/06/2026 | Bổ sung dự án DA1
lich_su: 1.2 | 09/07/2026 | Bổ sung dự án DA2
lich_su: 2.0 | 03/09/2026 | Tách chi phí bên thực hiện (OPTIMAI) và ghi nhận bên thụ hưởng (Bioscope); bổ sung đối chiếu giá bán
-->
# HỒ SƠ CHI PHÍ PHÁT TRIỂN

*Tài liệu chung — Kế toán OPTIMAI lập, phối hợp với đội phát triển.*

> **Tài liệu liên quan:** quan hệ hợp đồng, bàn giao và **giao dịch liên kết** ở `00-7-hop-dong-ban-giao-va-quyen-so-huu.md`.

---

## 1. Mục đích

Tài liệu này ghi **chi phí OPTIMAI đã bỏ ra để tạo ra phần mềm**, và là căn cứ đối chiếu với giá bán cho Bioscope.

### 1.1 Hai bên, hai nghĩa vụ khác nhau

| | **OPTIMAI — bên thực hiện** | **Bioscope — bên thụ hưởng** |
| :---- | :---- | :---- |
| Ghi nhận | Chi phí sản xuất phần mềm, doanh thu bán | Giá mua phần mềm |
| Cần chứng minh | Chi phí là có thật và phục vụ đúng dự án | Khoản chi tương ứng sản phẩm có thật đã nhận |
| Tài liệu chính | Tài liệu này, mục 3–7 | Hợp đồng, nghiệm thu, bàn giao, hoá đơn — `00-7` |

### 1.2 Vì sao chi phí bên bán lại quan trọng với cả hai bên

Đây là **giao dịch liên kết** — hai công ty có quan hệ với nhau. Cơ quan thuế sẽ đặt câu hỏi: *giá bán có tương xứng với chi phí và với mặt bằng thị trường không?*

Bảng chi phí ở tài liệu này là một trong ba căn cứ trả lời câu hỏi đó. Hai căn cứ còn lại — khối lượng công việc đo được và so sánh giá thị trường — nằm ở `00-7` mục 5.4.

### 1.3 Hồ sơ kỹ thuật và hồ sơ chi phí bổ sung cho nhau

| Chỉ có hồ sơ kỹ thuật | Chỉ có hồ sơ chi phí |
| :---- | :---- |
| Chứng minh phần mềm có thật, nhưng không chứng minh OPTIMAI đã bỏ chi phí tạo ra nó | Chứng minh có chi tiền, nhưng không chứng minh tiền đó tạo ra chính phần mềm này |

Ghép hai lại mới thành bộ hồ sơ đứng vững.

---

## 2. Cấu trúc chi phí

Chi phí phát triển phần mềm nội bộ gồm bốn nhóm:

| Nhóm | Nội dung | Chứng từ gốc |
| :---- | :---- | :---- |
| **A. Nhân công** | Lương, thưởng, bảo hiểm của **bốn nhân sự OPTIMAI** tham gia phát triển | Bảng lương, chứng từ chi trả, chứng từ đóng bảo hiểm |
| **B. Hạ tầng** | Thuê máy chủ, tên miền, dịch vụ lưu trữ | Hoá đơn nhà cung cấp |
| **C. Dịch vụ bên ngoài** | Gọi mô hình AI, dịch vụ nhận dạng chữ, nền tảng nhắn tin | Hoá đơn nhà cung cấp |
| **D. Công cụ** | Phần mềm có bản quyền, dịch vụ lưu trữ mã nguồn | Hoá đơn |

Nhóm A chiếm phần lớn và là nhóm quan trọng nhất về mặt chứng minh **OPTIMAI thực sự sản xuất** — nó gắn trực tiếp với bốn nhân sự có hợp đồng lao động tại OPTIMAI.

---

## 3. Nhóm A — Chi phí nhân công

### 3.1 Bảng phân bổ theo dự án và thời gian

Chi phí nhân công phân bổ theo **thời gian thực tế** từng người dành cho từng dự án. Mốc thời gian lấy từ lịch sử ghi nhận thay đổi trong kho mã nguồn.

| Dự án | Khoảng thời gian | Số tháng |
| :---- | :---- | :---- |
| **DA3** — Chatbot AI đa kênh | 06/02/2026 – 12/06/2026 | ~4,2 tháng |
| **DA1** — Website và CMS | 15/06/2026 – nay | ~2,6 tháng *(tới 31/08/2026)* |
| **DA2** — AI chuẩn hoá dữ liệu | 09/07/2026 – nay | ~1,8 tháng *(tới 31/08/2026)* |

> **DA1 và DA2 chạy song song, dùng chung kho mã nguồn.** Phân bổ chi phí giữa hai dự án này cần một căn cứ khách quan — xem mục 3.3.

### 3.2 Bảng kê chi phí nhân công

*(Bộ phận Kế toán điền, đối chiếu với bảng lương)*

Bốn nhân sự tham gia — vai trò và công đoạn phụ trách ở `00-1` mục 3.1:

| Kỳ | Nhân sự | Vai trò | Dự án | Tỉ lệ thời gian | Lương + bảo hiểm | Chi phí phân bổ |
| :---- | :---- | :---- | :---- | :----: | :---- | :---- |
| 02/2026 | HungDV | Product Owner | DA3 | % | | |
| 02/2026 | QuanNH | Team Lead | DA3 | % | | |
| 02/2026 | Duong Vu | Developer | DA3 | % | | |
| 02/2026 | Thu | QA | DA3 | % | | |
| 03/2026 | *(bốn người)* | | DA3 | % | | |
| 04/2026 | *(bốn người)* | | DA3 | % | | |
| 05/2026 | *(bốn người)* | | DA3 | % | | |
| 06/2026 | *(bốn người)* | | DA3 + DA1 | % | | |
| 07/2026 | *(bốn người)* | | DA1 + DA2 | % | | |
| 08/2026 | *(bốn người)* | | DA1 + DA2 | % | | |
| **Cộng** | | | | | | |

> **Tỉ lệ thời gian phải khớp với vai trò.** Ví dụ QA chỉ tham gia nặng ở công đoạn 4, nên tỉ lệ tháng dựng nền thấp hơn tháng kiểm thử. Điền tỉ lệ đều nhau cho cả bốn người ở mọi tháng là dấu hiệu số liệu không dựa trên thực tế.

### 3.3 Căn cứ phân bổ giữa DA1 và DA2

DA1 và DA2 dùng chung kho mã nguồn nên cần căn cứ khách quan để tách chi phí. Đề xuất dùng **khối lượng mã nguồn**:

| Dự án | Dòng mã | Tỉ lệ |
| :---- | :---- | :---- |
| DA1 — Website và CMS | ~51.300 | **92,4%** |
| DA2 — AI chuẩn hoá dữ liệu | ~4.200 | **7,6%** |
| Cộng | ~55.500 | 100% |

Căn cứ này kiểm chứng được: đếm lại số dòng mã của các tệp thuộc từng dự án theo danh sách ở `DA2-01` mục 7.

Bộ phận Kế toán có thể chọn căn cứ khác (số ngày công ghi nhận, số lần ghi nhận thay đổi) nếu phù hợp hơn với cách hạch toán của công ty — miễn là **căn cứ nhất quán và kiểm chứng được**.

### 3.4 Chứng từ phải đính kèm

| # | Chứng từ | Ai cung cấp | Đã có |
| :---- | :---- | :---- | :----: |
| 1 | Hợp đồng lao động của bốn nhân sự | Nhân sự OPTIMAI | ☐ |
| 2 | Quyết định phân công tham gia dự án, ghi rõ vai trò | Nhân sự OPTIMAI | ☐ |
| 3 | Bảng lương các kỳ | Kế toán OPTIMAI | ☐ |
| 4 | Chứng từ chi trả lương | Kế toán OPTIMAI | ☐ |
| 5 | Chứng từ đóng bảo hiểm xã hội | Nhân sự OPTIMAI | ☐ |
| 6 | Bản mô tả công việc | Nhân sự OPTIMAI | ☐ |
| 7 | **Bảng đối chiếu danh tính kỹ thuật ↔ nhân sự** | Kỹ thuật + Nhân sự OPTIMAI | ☐ |

> **Mục 7 là mắt xích nối hai loại bằng chứng.** Nó nằm ở `00-1` mục 2, hiện **chưa điền**. Thiếu mục này thì bảng lương và lịch sử mã nguồn là hai bộ giấy tờ rời rạc, không nối được với nhau.

---

## 4. Nhóm B — Chi phí hạ tầng

| Khoản mục | Dự án | Kỳ | Số tiền | Chứng từ |
| :---- | :---- | :---- | :---- | :---- |
| Thuê máy chủ *(DA1 + DA2)* | DA1, DA2 | | | |
| Thuê máy chủ *(DA3)* | DA3 | | | |
| Tên miền `bioscope.vn` | DA1 | | | |
| Chứng chỉ bảo mật | DA1, DA3 | | | |
| Dịch vụ lưu trữ kho tài liệu | DA2, DA3 | | | |
| **Cộng** | | | | |

**Máy chủ dùng chung cho nhiều dự án** thì phân bổ theo tỉ lệ tài nguyên sử dụng, hoặc theo cùng căn cứ dùng cho nhân công. Ghi rõ căn cứ đã chọn.

---

## 5. Nhóm C — Chi phí dịch vụ bên ngoài

Đây là nhóm có **bằng chứng đối chiếu tốt nhất**, vì hệ thống tự ghi lại mức sử dụng.

| Khoản mục | Dự án | Nguồn số liệu nội bộ | Chứng từ |
| :---- | :---- | :---- | :---- |
| Gọi mô hình sinh nội dung | DA2 | **Bộ đếm trong từng công việc AI**, có quy đổi tiền Việt | Hoá đơn nhà cung cấp |
| Gọi mô hình đọc ảnh | DA2 | Như trên | Hoá đơn |
| Tạo ảnh | DA2 | Như trên | Hoá đơn |
| Nhận dạng chữ | DA2 | Như trên | Hoá đơn |
| Gọi mô hình trợ lý | DA3 | **Bảng nhật ký AI**, cột số đơn vị tiêu | Hoá đơn |
| Gọi mô hình sinh vectơ | DA3 | Như trên | Hoá đơn |
| Tài khoản chính thức các kênh nhắn tin | DA3 | — | Hoá đơn |

### 5.1 Đối chiếu số liệu nội bộ với hoá đơn

Hai dự án đều tự ghi chi phí, nên đối chiếu được:

| Dự án | Cách lấy số liệu nội bộ |
| :---- | :---- |
| DA2 | Cộng cột chi phí (đồng) của các công việc AI trong kỳ — lệnh tra ở `DA2-10` mục D2 |
| DA3 | Cộng cột số đơn vị tiêu trong bảng nhật ký AI — lệnh tra ở `DA3-10` mục F3 |

**Ngưỡng chấp nhận: lệch dưới 10%.** Lệch nhiều hơn thì kiểm ba khả năng:

| Khả năng | Cách kiểm |
| :---- | :---- |
| Bảng đơn giá trong hệ thống lạc hậu | Xem cờ *"đang dùng bảng giá dựng sẵn"* |
| Hệ thống khác dùng chung tài khoản nhà cung cấp | Xem tên ứng dụng trong bảng điều khiển nhà cung cấp |
| Có lượt gọi ngoài hệ thống (thử nghiệm thủ công) | Xem nhật ký nhà cung cấp |

> **Việc đối chiếu này chưa từng thực hiện.** Đã ghi vào danh sách việc còn lại ở `DA2-10` và `DA3-10`. Nên làm trước khi nộp hồ sơ — nó biến con số ước tính thành con số đã kiểm chứng.

### 5.2 Bảng kê theo kỳ

| Kỳ | Dự án | Số liệu nội bộ | Hoá đơn | Chênh lệch | Ghi chú |
| :---- | :---- | :---- | :---- | :---- | :---- |
| | | | | | |
| **Cộng** | | | | | |

---

## 6. Nhóm D — Chi phí công cụ

| Khoản mục | Dự án | Kỳ | Số tiền | Chứng từ |
| :---- | :---- | :---- | :---- | :---- |
| Dịch vụ lưu trữ mã nguồn | Cả ba | | | |
| Phần mềm có bản quyền *(nếu có)* | | | | |
| **Cộng** | | | | |

**Phần lớn công cụ dùng trong ba dự án là mã nguồn mở, không phát sinh chi phí bản quyền.** Danh mục ở `00-4` mục 4. Đây là điểm cần nói rõ khi giải trình: chi phí công cụ thấp **không phải** dấu hiệu OPTIMAI không tự sản xuất, mà là đặc điểm của việc dùng nền tảng mã nguồn mở.

---

## 7. Tổng hợp chi phí ba dự án

| Nhóm chi phí | DA1 | DA2 | DA3 | Cộng |
| :---- | :---- | :---- | :---- | :---- |
| A. Nhân công | | | | |
| B. Hạ tầng | | | | |
| C. Dịch vụ bên ngoài | | | | |
| D. Công cụ | | | | |
| **Tổng cộng** | | | | |

---

## 8. Đối chiếu chi phí với khối lượng công việc

Bảng này giúp người đọc hồ sơ đánh giá chi phí có tương xứng với khối lượng hay không.

| Chỉ số | DA1 | DA2 | DA3 |
| :---- | :---- | :---- | :---- |
| Dòng mã nguồn | ~51.300 | ~4.200 | ~47.700 |
| Số lần ghi nhận thay đổi | 218 *(chung với DA2)* | *(trong 218)* | 163 |
| Thời gian phát triển | ~2,6 tháng | ~1,8 tháng | ~4,2 tháng |
| Nhóm dữ liệu / bảng | 51 | 5 | 30 |
| Điểm giao tiếp lập trình | 52 | 14 | 12 nhóm |
| Quy trình tự động hoá | — | — | 44 |
| Tài liệu kỹ thuật kèm theo | — | — | 7.600 dòng |
| **Chi phí của OPTIMAI** | | | |
| **Chi phí / 1.000 dòng mã** | | | |
| **Giá bán cho Bioscope** | | | |
| **Chênh lệch** | | | |

Hai dòng cuối là phần cơ quan thuế quan tâm nhất trong giao dịch liên kết. Chênh lệch giữa chi phí và giá bán phải giải trình được — xem `00-7` mục 5.

Dòng *chi phí / 1.000 dòng mã* là chỉ số dễ đối chiếu nhất với mặt bằng chung của ngành.

---

## 9. Danh sách kiểm tra hồ sơ chi phí

| # | Việc | Bộ phận | Xong |
| :---- | :---- | :---- | :----: |
| 1 | Điền bảng đối chiếu danh tính kỹ thuật ↔ nhân sự ở `00-1` | Kỹ thuật + Nhân sự | ☐ |
| 2 | Tập hợp hợp đồng lao động của người có tên | Nhân sự | ☐ |
| 3 | Tập hợp quyết định phân công dự án | Nhân sự | ☐ |
| 4 | Tập hợp bảng lương và chứng từ chi trả | Kế toán | ☐ |
| 5 | Tập hợp chứng từ bảo hiểm xã hội | Nhân sự | ☐ |
| 6 | Chốt căn cứ phân bổ giữa DA1 và DA2 | Kế toán | ☐ |
| 7 | Điền bảng kê chi phí nhân công (mục 3.2) | Kế toán | ☐ |
| 8 | Tập hợp hoá đơn hạ tầng | Kế toán | ☐ |
| 9 | **Đối chiếu chi phí dịch vụ AI với hoá đơn** | Kế toán + Kỹ thuật | ☐ |
| 10 | Điền bảng tổng hợp (mục 7) | Kế toán | ☐ |
| 11 | Đối chiếu tổng chi phí với giá bán, giải trình chênh lệch | Kế toán OPTIMAI | ☐ |
| 12 | **Lập hồ sơ giao dịch liên kết** — xem `00-7` mục 5 | Kế toán hai bên | ☐ |
| 13 | Ghi nhận tài sản hoặc chi phí phần mềm đã mua | Kế toán Bioscope | ☐ |
| 14 | Ký và đóng dấu | Ban Giám đốc OPTIMAI | ☐ |

---

## 10. Xác nhận

Bộ phận Kế toán Công ty OPTIMAI xác nhận các số liệu trong tài liệu này được lập trên cơ sở chứng từ gốc hiện có tại công ty, và phù hợp với sổ sách kế toán.

*Người lập:* ..................................... *Chức danh:* .....................................

*Kế toán trưởng:* ..................................... *Ngày:* ....... /....... /...........

*Người đại diện theo pháp luật Công ty OPTIMAI ký, đóng dấu:*
