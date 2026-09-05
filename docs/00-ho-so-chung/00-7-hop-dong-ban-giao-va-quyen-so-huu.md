<!--HOSO
phu_de: Quan hệ hợp đồng OPTIMAI — Bioscope, bàn giao và quyền sở hữu
pham_vi: Toàn bộ hồ sơ — bốn dự án
ngay_lap: 15/01/2026
phien_ban: 1.1
nguoi_lap: HungDV — Product Owner, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc OPTIMAI và đại diện Công ty Bioscope
lich_su: 1.0 | 15/01/2026 | Ban hành lần đầu
lich_su: 1.1 | 03/09/2026 | Bổ sung mục giao dịch liên kết và bảng nghĩa vụ hồ sơ hai bên
-->
# QUAN HỆ HỢP ĐỒNG, BÀN GIAO VÀ QUYỀN SỞ HỮU

*Tài liệu chung — nối hồ sơ kỹ thuật với hồ sơ pháp lý và kế toán của cả hai bên.*

---

## 1. Vì sao cần tài liệu này

Bốn mươi hai tài liệu kỹ thuật trong bộ hồ sơ chứng minh **phần mềm được tạo ra thế nào**. Chúng không trả lời được ba câu hỏi mà cơ quan thuế sẽ hỏi:

| Câu hỏi | Tài liệu trả lời |
| :---- | :---- |
| Ai đặt hàng, ai làm, theo thoả thuận nào? | Hợp đồng — mục 2 |
| Sản phẩm đã bàn giao chưa, bên mua đã nhận chưa? | Biên bản nghiệm thu và bàn giao — mục 3 |
| Quyền sở hữu phần mềm thuộc về ai sau bàn giao? | Điều khoản sở hữu trí tuệ — mục 4 |

Thiếu tài liệu này thì hồ sơ kỹ thuật đứng một mình: chứng minh có phần mềm, nhưng không chứng minh giao dịch giữa hai công ty là có thật và hợp lệ.

---

## 2. Hợp đồng

### 2.1 Thông tin cần có

| Mục | Nội dung | Điền |
| :---- | :---- | :---- |
| Số hiệu hợp đồng | | ............................. |
| Ngày ký | | ....... /....... /........... |
| Bên A — Bên đặt hàng | Công ty Bioscope | Mã số thuế: ..................... |
| Bên B — Bên thực hiện | Công ty OPTIMAI | Mã số thuế: ..................... |
| Giá trị hợp đồng | *(công ty điền)* | ............................. |
| Thời hạn thực hiện | | Từ ............ đến ............ |
| Thời hạn bảo hành | | ............................. |

### 2.2 Phụ lục phạm vi từng dự án

Hợp đồng nên có phụ lục riêng cho từng dự án, dẫn chiếu thẳng tới tài liệu yêu cầu trong bộ hồ sơ này:

| Dự án | Sản phẩm | Tài liệu phạm vi | Số phụ lục |
| :---- | :---- | :---- | :---- |
| **DA1** | Website Bioscope và Hệ quản trị nội dung | `DA1-02-cd1-xac-dinh-yeu-cau` — 44 yêu cầu chức năng, 13 yêu cầu phi chức năng | ............ |
| **DA2** | Hệ thống AI chuẩn hoá dữ liệu sản phẩm | `DA2-02-cd1-xac-dinh-yeu-cau` — 40 yêu cầu chức năng, 12 yêu cầu phi chức năng | ............ |
| **DA3** | Chatbot AI đa kênh BioBot | `DA3-02-cd1-xac-dinh-yeu-cau` — 54 yêu cầu chức năng, 14 yêu cầu phi chức năng | ............ |
| **DA4** | Chatbot Telegram và Google Workspace | `DA4-02-cd1-xac-dinh-yeu-cau` — *dự thảo, chưa duyệt* | ............ |

**Dẫn chiếu thẳng tới tài liệu yêu cầu là cách làm mạnh nhất.** Nó gắn hợp đồng với một danh sách yêu cầu có mã, mà mỗi mã lại đối chiếu ngược được về một ca kiểm thử ở tài liệu `-07`. Chuỗi này khép kín: *hợp đồng → yêu cầu → ca kiểm thử → biên bản nghiệm thu*.

> **DA4 chưa thuộc phạm vi bàn giao.** Dự án này đang ở giai đoạn thiết kế trước triển khai, chưa có bằng chứng mã nguồn. Không đưa vào phụ lục nghiệm thu cho tới khi hoàn thành.

### 2.3 Điều khoản nên có trong hợp đồng

| Điều khoản | Vì sao cần |
| :---- | :---- |
| Phạm vi công việc, dẫn chiếu tài liệu yêu cầu | Xác định rõ làm gì, tránh tranh chấp phạm vi |
| **Chuyển giao quyền sở hữu mã nguồn** | Xem mục 4 |
| Tiêu chí nghiệm thu | Đã có sẵn ở `-02` mục 5 của từng dự án |
| Quy trình nghiệm thu và thời hạn phản hồi | |
| Bảo hành, phân loại mức sự cố và thời hạn xử lý | Đã có sẵn ở `-08` phần B của từng dự án |
| Bàn giao mã nguồn và tài liệu | Danh mục ở `-08` phần B |
| Bảo mật thông tin hai chiều | OPTIMAI tiếp xúc dữ liệu kinh doanh của Bioscope |
| Xử lý dữ liệu cá nhân | Hệ thống lưu dữ liệu khách hàng của Bioscope |

---

## 3. Nghiệm thu và bàn giao

### 3.1 Chuỗi tài liệu

```
   Hợp đồng + phụ lục phạm vi
            ↓
   Tài liệu yêu cầu  -02   (yêu cầu có mã YC-xx)
            ↓
   Bộ ca kiểm thử    -07   (mỗi ca dẫn chiếu về một YC-xx)
            ↓
   Biên bản nghiệm thu     (mẫu ở -07 mục cuối)
            ↓
   Biên bản bàn giao       (mẫu ở -08 phần B)
            ↓
   Hoá đơn
```

Chuỗi này là thứ người kiểm tra sẽ lần theo. Mỗi mắt xích đều đã có sẵn trong bộ hồ sơ, chỉ còn thiếu chữ ký.

### 3.2 Trạng thái nghiệm thu

| Dự án | Bộ ca kiểm thử | Đã chạy | Biên bản nghiệm thu | Biên bản bàn giao |
| :---- | :----: | :----: | :----: | :----: |
| DA1 | 62 ca | ☐ | ☐ | ☐ |
| DA2 | 63 ca | ☐ | ☐ | ☐ |
| DA3 | 91 ca | ☐ | ☐ | ☐ |
| DA4 | *chưa áp dụng* | — | — | — |

> **Ba tiêu chí không được phép "đạt có điều kiện"** khi nghiệm thu:
>
> | Dự án | Tiêu chí |
> | :---- | :---- |
> | DA2 | Không có trường trích xuất nào bị bịa dữ liệu |
> | DA3 | Không có câu hỏi y tế nào lọt qua chốt chặn |
> | DA3 | Không có dữ liệu chéo vai trò nào lộ |
>
> Ba tiêu chí này thuộc loại "không được xảy ra dù một lần". Chi tiết ở `DA2-07` mục 7.3 và `DA3-07` mục 9.3.

### 3.3 Nội dung bàn giao

| # | Hạng mục | Có ở |
| :---- | :---- | :---- |
| 1 | Mã nguồn đầy đủ, kèm toàn bộ lịch sử phát triển | Kho mã nguồn |
| 2 | Bộ hồ sơ kỹ thuật | 50 tài liệu `.md` và `.docx` |
| 3 | Tài khoản quản trị | Bàn giao riêng |
| 4 | Tệp cấu hình hệ thống thật | Bàn giao riêng, **không** qua kho mã nguồn |
| 5 | Khoá truy cập các dịch vụ ngoài | Bàn giao riêng |
| 6 | Bản sao lưu dữ liệu tại thời điểm bàn giao | Tệp |
| 7 | Hướng dẫn sử dụng | `-09` của từng dự án |
| 8 | Sổ tra cứu kỹ thuật | `-10` của từng dự án |
| 9 | Hướng dẫn trực tiếp | Biên bản ghi nhận |

---

## 4. Quyền sở hữu trí tuệ

### 4.1 Nguyên tắc

| Nội dung | Trước bàn giao | Sau bàn giao |
| :---- | :---- | :---- |
| Mã nguồn nghiệp vụ do OPTIMAI viết | OPTIMAI | **Bioscope** *(theo hợp đồng)* |
| Tài liệu kỹ thuật | OPTIMAI | **Bioscope** |
| Dữ liệu nguyên liệu, nội dung, hình ảnh | **Bioscope** | **Bioscope** |
| Dữ liệu khách hàng, hội thoại | **Bioscope** | **Bioscope** |
| Thư viện mã nguồn mở | Tác giả tương ứng | Tác giả tương ứng |
| Dịch vụ mô hình AI, nền tảng nhắn tin | Nhà cung cấp | Nhà cung cấp |

> **Hợp đồng phải nêu rõ điều khoản chuyển giao quyền sở hữu mã nguồn.** Không nêu thì mặc định quyền tác giả thuộc bên tạo ra — tức OPTIMAI — và Bioscope chỉ có quyền sử dụng. Điều này ảnh hưởng trực tiếp tới việc Bioscope hạch toán phần mềm là tài sản.

### 4.2 Vấn đề cần xử lý: nơi lưu kho mã nguồn

| Hiện trạng | Vấn đề |
| :---- | :---- |
| Kho mã nguồn DA1/DA2 nằm dưới **tài khoản cá nhân** trên dịch vụ lưu trữ mã nguồn công cộng | Không phải tài khoản tổ chức của OPTIMAI, cũng không phải của Bioscope |

**Cách xử lý — chọn một:**

| Phương án | Nội dung |
| :---- | :---- |
| 1 | Chuyển kho về tài khoản tổ chức của **OPTIMAI**, sau bàn giao chuyển tiếp cho Bioscope |
| 2 | Chuyển thẳng về tài khoản tổ chức của **Bioscope** |
| 3 | Giữ nguyên, lập **biên bản xác nhận** quyền sở hữu mã nguồn và người giữ tài khoản là nhân viên thực hiện theo phân công |

Phương án 3 là giải pháp tình thế. Hai phương án đầu sạch hơn.

---

## 5. Giao dịch liên kết — mục cần chuẩn bị kỹ nhất

### 5.1 Vấn đề

OPTIMAI và Bioscope là **hai pháp nhân riêng nhưng có quan hệ liên kết**. Giao dịch mua bán phần mềm giữa hai bên vì vậy là **giao dịch liên kết**.

Điều này **không sai và không bị cấm**. Nhưng nó kéo theo nghĩa vụ riêng về hồ sơ, và đây chính là chỗ cơ quan thuế sẽ soi kỹ nhất.

### 5.2 Ba câu hỏi sẽ được đặt ra

| # | Câu hỏi | Chuẩn bị gì |
| :---- | :---- | :---- |
| 1 | **Giá giao dịch có theo nguyên tắc giao dịch độc lập không?** | Hồ sơ xác định giá: căn cứ tính giá, so sánh với giá thị trường cho công việc tương đương |
| 2 | **Giao dịch có thực chất không, hay chỉ là chuyển chi phí giữa hai công ty?** | Toàn bộ hồ sơ kỹ thuật — đây là nơi bộ hồ sơ này phát huy giá trị mạnh nhất |
| 3 | **Chi phí bên bán có tương xứng với giá bán không?** | Bảng chi phí ở `00-6`, đối chiếu với giá trị hợp đồng |

Câu hỏi 2 là câu bộ hồ sơ này trả lời được ngay: **381 lần ghi nhận thay đổi trải bảy tháng, 15.829 dòng tài liệu, hệ thống đang vận hành có người dùng thật.** Đây không phải giao dịch trên giấy.

Câu hỏi 1 và 3 thuộc phần kế toán, **hiện chưa có**.

### 5.3 Hồ sơ cần bổ sung

| # | Tài liệu | Bộ phận | Đã có |
| :---- | :---- | :---- | :----: |
| 1 | Bản kê thông tin quan hệ liên kết | Kế toán hai bên | ☐ |
| 2 | Hồ sơ xác định giá giao dịch liên kết | Kế toán | ☐ |
| 3 | Căn cứ xác định giá hợp đồng | Kế toán + OPTIMAI | ☐ |
| 4 | Số liệu so sánh với giá thị trường | Kế toán | ☐ |
| 5 | Bảng đối chiếu chi phí bên bán với giá bán | Kế toán — khung ở `00-6` | ☐ |

> **Lưu ý pháp lý.** Quy định về hồ sơ xác định giá giao dịch liên kết, ngưỡng miễn lập hồ sơ và mẫu biểu có thể được sửa đổi theo thời gian. Bộ phận kế toán cần đối chiếu với văn bản đang có hiệu lực tại thời điểm nộp, và xác định xem giao dịch có thuộc trường hợp được miễn lập hồ sơ hay không.
>
> Nội dung mục này nêu **bản chất vấn đề và việc cần chuẩn bị**, không thay thế tư vấn của người có chuyên môn về thuế.

### 5.4 Căn cứ xác định giá — gợi ý cho kế toán

Bộ hồ sơ kỹ thuật cung cấp sẵn số liệu để làm căn cứ:

| Căn cứ | Số liệu có sẵn | Ở đâu |
| :---- | :---- | :---- |
| Khối lượng mã nguồn | ~103.200 dòng cho ba dự án đã bàn giao | `00-1` mục 6.2 |
| Thời gian thực hiện | 7 tháng liên tục, 381 lần ghi nhận | `00-1` mục 7 |
| Quy mô đội | 4 người, phân vai rõ | `00-1` mục 3 |
| Khối lượng chức năng | 138 yêu cầu chức năng, 216 ca kiểm thử | `-02` và `-07` các dự án |
| Chi phí trực tiếp của bên bán | Khung bảng — **số liệu công ty tự điền** | `00-6` |

Bốn căn cứ đầu là số đo khách quan, kiểm chứng lại được từ kho mã nguồn và bộ hồ sơ — mạnh hơn nhiều so với một con số không có cơ sở. Căn cứ cuối lấy từ sổ sách kế toán.

---

## 6. Nghĩa vụ hồ sơ của từng bên

| # | Tài liệu | OPTIMAI | Bioscope |
| :---- | :---- | :----: | :----: |
| 1 | Hợp đồng và phụ lục | ✅ | ✅ |
| 2 | Bộ hồ sơ kỹ thuật 50 tài liệu | ✅ *(chứng minh có sản xuất)* | ✅ *(chứng minh sản phẩm có thật)* |
| 3 | Hồ sơ nhân sự đội thực hiện | ✅ | — |
| 4 | Bảng lương, bảo hiểm | ✅ | — |
| 5 | Bảng chi phí phát triển | ✅ | — |
| 6 | Biên bản nghiệm thu | ✅ | ✅ |
| 7 | Biên bản bàn giao | ✅ | ✅ |
| 8 | Hoá đơn | ✅ *(bên bán)* | ✅ *(bên mua)* |
| 9 | Hồ sơ giao dịch liên kết | ✅ | ✅ |
| 10 | Chứng từ thanh toán | ✅ | ✅ |
| 11 | Hồ sơ ghi nhận tài sản / chi phí | — | ✅ |

Mục 2 là mục duy nhất **dùng chung cho cả hai bên** — và đó là toàn bộ giá trị của bộ hồ sơ này.

---

## 7. Danh sách kiểm tra trước khi nộp

| # | Việc | Bên | Xong |
| :---- | :---- | :---- | :----: |
| 1 | Ký hợp đồng và phụ lục phạm vi từng dự án | Hai bên | ☐ |
| 2 | Ban Giám đốc xác nhận ma trận phân công ở `00-1` mục 4.1 | OPTIMAI | ☐ |
| 3 | Tập hợp hồ sơ nhân sự bốn người | OPTIMAI | ☐ |
| 4 | Chạy bộ ca kiểm thử, điền kết quả vào `-07` | OPTIMAI | ☐ |
| 5 | Ký biên bản nghiệm thu ba dự án | Hai bên | ☐ |
| 6 | Ký biên bản bàn giao | Hai bên | ☐ |
| 7 | Xuất hoá đơn | OPTIMAI | ☐ |
| 8 | Điền bảng chi phí `00-6` | OPTIMAI | ☐ |
| 9 | **Lập hồ sơ giao dịch liên kết** | Hai bên | ☐ |
| 10 | Xử lý nơi lưu kho mã nguồn — mục 4.2 | OPTIMAI | ☐ |
| 11 | Ghi nhận tài sản hoặc chi phí | Bioscope | ☐ |

---

## 8. Xác nhận

| Vai trò | Họ tên | Ngày | Ký |
| :---- | :---- | :---- | :---- |
| Đại diện Công ty OPTIMAI | | | |
| Đại diện Công ty Bioscope | | | |
