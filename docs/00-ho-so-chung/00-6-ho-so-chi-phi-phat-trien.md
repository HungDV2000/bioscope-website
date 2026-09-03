<!--HOSO
phu_de: Hồ sơ chi phí phát triển phần mềm nội bộ
pham_vi: Toàn công ty — ba dự án DA1, DA2, DA3
ngay_lap: 15/01/2026
phien_ban: 1.2
nguoi_lap: Bộ phận Kế toán — Công ty Bioscope
nguoi_duyet: Ban Giám đốc
lich_su: 1.0 | 15/01/2026 | Ban hành lần đầu, phục vụ dự án DA3
lich_su: 1.1 | 20/06/2026 | Bổ sung dự án DA1
lich_su: 1.2 | 09/07/2026 | Bổ sung dự án DA2
-->
# HỒ SƠ CHI PHÍ PHÁT TRIỂN PHẦN MỀM NỘI BỘ

*Tài liệu chung — do bộ phận Kế toán lập, phối hợp với bộ phận Phát triển phần mềm.*

---

## 1. Mục đích

Hồ sơ kỹ thuật ở các tài liệu khác chứng minh **phần mềm được tạo ra như thế nào**. Tài liệu này chứng minh **công ty đã bỏ ra chi phí gì để tạo ra nó**.

Hai loại bằng chứng này bổ sung cho nhau và **thiếu một loại thì loại kia mất phần lớn giá trị**:

| Chỉ có hồ sơ kỹ thuật | Chỉ có hồ sơ chi phí |
| :---- | :---- |
| Chứng minh có người viết phần mềm, nhưng không chứng minh công ty trả tiền cho việc đó | Chứng minh có chi tiền, nhưng không chứng minh tiền đó tạo ra phần mềm này |

Ghép hai lại mới thành một bộ hồ sơ đứng vững.

---

## 2. Cấu trúc chi phí

Chi phí phát triển phần mềm nội bộ gồm bốn nhóm:

| Nhóm | Nội dung | Chứng từ gốc |
| :---- | :---- | :---- |
| **A. Nhân công** | Lương, thưởng, bảo hiểm của người tham gia phát triển | Bảng lương, chứng từ chi trả, chứng từ đóng bảo hiểm |
| **B. Hạ tầng** | Thuê máy chủ, tên miền, dịch vụ lưu trữ | Hoá đơn nhà cung cấp |
| **C. Dịch vụ bên ngoài** | Gọi mô hình AI, dịch vụ nhận dạng chữ, nền tảng nhắn tin | Hoá đơn nhà cung cấp |
| **D. Công cụ** | Phần mềm có bản quyền, dịch vụ lưu trữ mã nguồn | Hoá đơn |

Nhóm A thường chiếm phần lớn và cũng là nhóm quan trọng nhất về mặt chứng minh **tự phát triển** — nó gắn trực tiếp với nhân sự của công ty.

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

| Kỳ | Họ tên | Chức danh | Dự án | Tỉ lệ thời gian | Lương + bảo hiểm | Chi phí phân bổ |
| :---- | :---- | :---- | :---- | :----: | :---- | :---- |
| 02/2026 | | | DA3 | % | | |
| 03/2026 | | | DA3 | % | | |
| 04/2026 | | | DA3 | % | | |
| 05/2026 | | | DA3 | % | | |
| 06/2026 | | | DA3 + DA1 | % | | |
| 07/2026 | | | DA1 + DA2 | % | | |
| 08/2026 | | | DA1 + DA2 | % | | |
| … | | | | | | |
| **Cộng** | | | | | | |

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
| 1 | Hợp đồng lao động của từng người có tên | Nhân sự | ☐ |
| 2 | Quyết định phân công tham gia dự án | Nhân sự | ☐ |
| 3 | Bảng lương các kỳ | Kế toán | ☐ |
| 4 | Chứng từ chi trả lương | Kế toán | ☐ |
| 5 | Chứng từ đóng bảo hiểm xã hội | Nhân sự | ☐ |
| 6 | Bản mô tả công việc | Nhân sự | ☐ |
| 7 | **Bảng đối chiếu danh tính kỹ thuật ↔ nhân sự** | Kỹ thuật + Nhân sự | ☐ |

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

**Phần lớn công cụ dùng trong ba dự án là mã nguồn mở, không phát sinh chi phí bản quyền.** Danh mục ở `00-4` mục 4. Đây là điểm cần nói rõ khi giải trình: chi phí công cụ thấp **không phải** dấu hiệu công ty không tự phát triển, mà là đặc điểm của việc dùng nền tảng mã nguồn mở.

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
| **Chi phí** | | | |
| **Chi phí / 1.000 dòng mã** | | | |

Dòng cuối là chỉ số dễ đối chiếu nhất với mặt bằng chung của ngành.

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
| 11 | Ký và đóng dấu | Ban Giám đốc | ☐ |

---

## 10. Xác nhận

Bộ phận Kế toán xác nhận các số liệu trong tài liệu này được lập trên cơ sở chứng từ gốc hiện có tại công ty, và phù hợp với sổ sách kế toán.

*Người lập:* ..................................... *Chức danh:* .....................................

*Kế toán trưởng:* ..................................... *Ngày:* ....... /....... /...........

*Người đại diện theo pháp luật ký, đóng dấu:*
