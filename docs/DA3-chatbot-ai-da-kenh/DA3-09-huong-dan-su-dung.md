<!--HOSO
phu_de: Chatbot AI đa kênh BioBot — Bioscope Assistants
pham_vi: Dự án DA3 — người dùng cuối và quản trị viên
ngay_lap: 08/06/2026
phien_ban: 1.1
nguoi_lap: Bộ phận Phát triển phần mềm — Công ty Bioscope
nguoi_duyet: Ban Giám đốc
lich_su: 1.0 | 08/06/2026 | Ban hành lần đầu
lich_su: 1.1 | 12/06/2026 | Bổ sung hướng dẫn cho quản trị viên
-->
# DA3 — HƯỚNG DẪN SỬ DỤNG
## Chatbot AI đa kênh BioBot — Bioscope Assistants

*Tài liệu viết cho nhân viên sử dụng hệ thống. Trình bày theo việc cần làm.*

---

## 0. Đọc phần này trước

### Trợ lý làm gì và **không** làm gì

| Trợ lý làm | Trợ lý **không** làm |
| :---- | :---- |
| Tra dữ liệu sản phẩm, khách hàng, hoá đơn | **Không tư vấn y tế, dược lý** |
| Tìm thông tin trong tài liệu công ty | **Không chốt đơn hàng thay bạn** |
| So sánh, tổng hợp, phân tích | **Không báo giá cho khách** |
| Trả lời bằng tiếng Việt tự nhiên | **Không bịa khi không có dữ liệu** |
| Chuyển cho người thật khi cần | **Không thay thế bạn** |

### Ba điều quan trọng nhất

> **① Trợ lý chỉ trả lời từ dữ liệu công ty.**
>
> Không có dữ liệu thì nó **nói rõ là không có**, không đoán. Thấy nó trả lời "không tìm thấy" thì đó là **hoạt động đúng**, không phải lỗi.

> **② Trợ lý KHÔNG trả lời câu hỏi y tế.**
>
> Hỏi về tác dụng điều trị, liều dùng, chống chỉ định, tương tác thuốc — hệ thống sẽ từ chối và chỉ bạn tới nguồn đúng.
>
> Đây là **giới hạn có chủ ý**, không phải thiếu sót. Công ty bán nguyên liệu, không có thẩm quyền tư vấn y tế. Trả lời sai những câu này gây hậu quả cho sức khoẻ người dùng cuối và rủi ro pháp lý cho công ty.
>
> **Đừng tìm cách hỏi vòng để vượt qua.** Hệ thống được thiết kế để không vượt được, và mọi lượt hỏi đều có nhật ký.

> **③ Bạn chỉ thấy dữ liệu của phần việc mình.**
>
> Nhân viên kinh doanh không tra được hoá đơn. Nhân viên kế toán không tra được lịch sử khách hàng. Đây là thiết kế, không phải lỗi phân quyền.

---

## 1. Đăng nhập

1. Mở địa chỉ cổng chat
2. Đăng nhập bằng thư điện tử và mật khẩu, hoặc bằng tài khoản Google
3. Đổi mật khẩu ngay ở lần đầu

### Ba vai trò

| Vai trò | Thấy gì | Tra được gì |
| :---- | :---- | :---- |
| **Kinh doanh** | Chat, Sales, Công việc, Chức năng, Hướng dẫn | Sản phẩm, khách hàng, lịch sử trao đổi |
| **Kế toán** | Chat, Kế toán, Công việc, Chức năng, Hướng dẫn | Hoá đơn, chứng từ, báo cáo |
| **Quản trị** | Tất cả, kèm mục Quản trị | Cả hai miền |

Không thấy một mục nào đó nghĩa là vai trò của bạn không có quyền — không phải hệ thống lỗi.

---

## 2. Hỏi trợ lý

### 2.1 Cách hỏi

Gõ câu hỏi bằng **tiếng Việt bình thường**. Không có cú pháp đặc biệt, không cần từ khoá.

| Hỏi được | Ví dụ |
| :---- | :---- |
| Tra cứu | *"Sản phẩm Collagen Peptide có chỉ tiêu gì?"* |
| Liệt kê | *"Liệt kê sản phẩm trong danh mục chống oxy hoá"* |
| Tìm theo công dụng | *"Nguyên liệu nào dùng cho sản phẩm dưỡng da?"* |
| So sánh | *"So sánh sản phẩm A và sản phẩm B"* |
| Tổng hợp | *"Tổng giá trị hoá đơn tháng 3"* (vai trò kế toán) |
| Phân tích | *"Phân tích danh mục sản phẩm hiện có"* |
| Khách hàng | *"Khách hàng nào đã hỏi về collagen?"* |

### 2.2 Trong lúc chờ

Trợ lý hiện **tên việc đang làm**:

```
   Đang tra danh sách sản phẩm…
   Đang tìm trong tài liệu…
```

**Hãy đọc dòng này.** Nó cho biết trợ lý có hiểu đúng câu hỏi không. Thấy nó tra nhầm thứ thì hỏi lại luôn, đừng chờ hết.

Câu trả lời hiện **dần từng chữ**. Chữ đầu tiên trong khoảng 3 giây.

### 2.3 Hỏi tiếp trong cùng mạch

Trợ lý nhớ **15 lượt gần nhất**. Hỏi tiếp không cần nhắc lại ngữ cảnh:

```
Bạn:     Cho xem sản phẩm trong danh mục chống oxy hoá
Trợ lý:  [danh sách]
Bạn:     Cái thứ 2 có chỉ tiêu gì?          ← hiểu "cái thứ 2"
Trợ lý:  [chi tiết]
Bạn:     So sánh nó với cái đầu tiên        ← vẫn hiểu
```

Trả lời ngắn cũng hiểu được: *đúng rồi, vâng, có, ok, được, tiếp đi, cho xem*.

### 2.4 Đọc câu trả lời thế nào

| Trợ lý nói | Nghĩa là | Bạn làm gì |
| :---- | :---- | :---- |
| Trả lời kèm **dẫn nguồn** | Có dữ liệu, đáng tin | Dùng được |
| *"Không tìm thấy…"* | **Không có dữ liệu** | Kiểm lại tên, hoặc mô tả bằng cách khác |
| *"Bạn muốn xem theo tiêu chí nào?"* | Câu hỏi mơ hồ | Nói rõ hơn |
| *"Câu hỏi này liên quan y tế…"* | **Bị chặn có chủ ý** | Xem mục 3 |
| *"Bạn không có quyền…"* | Ngoài phạm vi vai trò | Nhờ người có quyền, hoặc báo quản trị viên |

> **"Không tìm thấy" là câu trả lời TỐT.** Trợ lý được thiết kế để nói rõ khi không biết, thay vì bịa một câu nghe hợp lý. Nếu bạn chắc dữ liệu có tồn tại mà trợ lý nói không tìm thấy, có thể tài liệu chưa được nạp — báo quản trị viên.

### 2.5 Cách hỏi cho kết quả tốt

| Nên | Không nên |
| :---- | :---- |
| *"Sản phẩm Collagen Peptide có chỉ tiêu gì?"* | *"cho xem"* — quá mơ hồ |
| *"Liệt kê sản phẩm danh mục chống oxy hoá"* | *"sản phẩm nào tốt"* — không có tiêu chí |
| Hỏi từng việc một | Nhồi 5 câu hỏi vào một tin |
| Nói rõ tên sản phẩm | Viết tắt hoặc gọi tên nội bộ |
| Hỏi tiếp trong cùng mạch | Bắt đầu lại từ đầu mỗi lượt |

---

## 3. Khi bị chặn vì câu hỏi y tế

### 3.1 Bạn sẽ thấy

```
Câu hỏi này liên quan đến thông tin y tế / dược lý,
nằm ngoài phạm vi hỗ trợ của hệ thống.

Để biết thông tin chính xác về tác dụng, liều dùng,
chống chỉ định, vui lòng tham khảo:
 · Tờ hướng dẫn sử dụng kèm theo sản phẩm
 · Dược sĩ hoặc bác sĩ phụ trách
 · Cục Quản lý Dược
```

### 3.2 Những câu bị chặn

| Nhóm | Ví dụ |
| :---- | :---- |
| Tác dụng, chỉ định | *chữa bệnh gì, công dụng, điều trị, triệu chứng* |
| Liều dùng | *liều dùng, uống bao nhiêu, ngày mấy lần* |
| Chống chỉ định, tương tác | *chống chỉ định, tương tác thuốc, tác dụng phụ* |
| So sánh hiệu quả điều trị | *thuốc nào tốt hơn, hiệu quả hơn* |

### 3.3 Vẫn hỏi được những câu này

| Hỏi được | Vì sao |
| :---- | :---- |
| *"Sản phẩm này có chỉ tiêu kỹ thuật gì?"* | Thông tin kỹ thuật, không phải y tế |
| *"Hàm lượng hoạt chất bao nhiêu?"* | Thông số sản phẩm |
| *"Có chứng nhận gì?"* | Thông tin chứng nhận |
| *"Quy cách đóng gói, hạn dùng?"* | Thông tin thương mại |
| *"Xuất xứ từ đâu?"* | Thông tin nguồn gốc |
| *"Điều kiện bảo quản?"* | Thông tin kỹ thuật |

### 3.4 Nếu bị chặn nhầm

Câu hỏi hợp lệ nhưng chứa từ khoá vẫn có thể bị chặn. **Hãy báo quản trị viên kèm câu hỏi cụ thể** — danh sách từ khoá sẽ được tinh chỉnh.

Đừng tìm cách hỏi vòng. Hệ thống chặn ở tầng sâu, không vượt được, và cố vượt là dấu hiệu bất thường trong nhật ký.

---

## 4. Chuyển cho người thật

### Khi nào

| Tình huống | Cách làm |
| :---- | :---- |
| Trợ lý không trả lời được | Nó tự đề nghị chuyển |
| Bạn muốn nói chuyện với người | Gõ *"cho tôi gặp nhân viên"* |
| Việc cần quyết định của người | Yêu cầu chuyển |

### Chuyện gì xảy ra

1. Nhân viên phụ trách nhận thông báo
2. **Kèm toàn bộ lịch sử hội thoại** — bạn không phải kể lại
3. Bạn thấy: *"Đã chuyển cho nhân viên phụ trách, vui lòng chờ trong giây lát."*

---

## 5. Dùng trên kênh nhắn tin

Trợ lý hoạt động trên Zalo, Telegram, Messenger, WhatsApp và thư điện tử.

**Cùng một câu hỏi trên mọi kênh cho cùng một câu trả lời.**

| Khác biệt | Web | Nhắn tin |
| :---- | :---- | :---- |
| Bảng dữ liệu | Bảng thật | Danh sách gạch đầu dòng |
| Câu trả lời dài | Hiện đủ | Cắt thành nhiều tin |
| Lịch sử | Xem lại được | Theo lịch sử nền tảng |

Nhắn từ nhiều kênh khác nhau, hệ thống vẫn **nhận ra bạn là cùng một người** nếu có thông tin đối chiếu.

---

## 6. Nạp tài liệu vào kho tri thức

Trợ lý chỉ biết những gì đã được nạp.

1. Vào mục tài liệu của miền mình
2. Tải tệp lên, hoặc đặt vào thư mục kho tài liệu
3. Chờ xử lý — trạng thái hiện trên màn hình
4. Xong thì hỏi thử một câu về nội dung tài liệu đó

### Kiểm tài liệu nạp có đúng không

Cột **"số đoạn đã cắt"** trên màn hình tài liệu:

| Số đoạn | Nghĩa |
| :---- | :---- |
| Hợp lý so với độ dài | Bóc tách tốt |
| **Rất ít so với độ dài** | **Bóc tách hỏng — phần lớn nội dung đã mất** |
| 0 | Không đọc được tệp |

Tài liệu 50 trang mà chỉ có 2 đoạn là dấu hiệu hỏng. **Báo quản trị viên** — nếu không, trợ lý sẽ trả lời thiếu mà không ai biết.

### Định dạng đọc được

| Đọc được | Ghi chú |
| :---- | :---- |
| PDF chữ | Tốt nhất |
| PDF scan, ảnh | Được, qua nhận dạng chữ |
| Tài liệu văn phòng | Được |
| Bảng tính | Được |

---

## 7. Xử lý tình huống thường gặp

| Tình huống | Nguyên nhân | Xử lý |
| :---- | :---- | :---- |
| Trợ lý nói không tìm thấy dữ liệu chắc chắn có | Tài liệu chưa nạp, hoặc tên viết khác | Kiểm tên; kiểm tài liệu đã nạp chưa |
| Trợ lý trả lời thiếu thông tin | Tài liệu bóc tách hỏng | Kiểm **số đoạn đã cắt** |
| Trợ lý trả lời chậm | Câu hỏi phức tạp, hoặc hệ thống bận | Chờ; quá 30 giây thì báo quản trị viên |
| Trợ lý hiểu sai câu hỏi | Câu hỏi mơ hồ | Xem dòng "đang làm gì", hỏi lại rõ hơn |
| Không tra được dữ liệu cần | Ngoài phạm vi vai trò | Nhờ người có quyền |
| Câu hỏi hợp lệ bị chặn | Chứa từ khoá y tế | **Báo quản trị viên kèm câu hỏi cụ thể** |
| Kênh nhắn tin không trả lời | Khoá truy cập hết hạn | Báo quản trị viên |
| Nhận hai câu trả lời giống nhau | Sự kiện bị gửi lặp | Báo quản trị viên |

---

## 8. Việc không được làm

| Không được | Vì sao |
| :---- | :---- |
| **Tìm cách hỏi vòng để lấy thông tin y tế** | Chốt chặn có lý do. Mọi lượt hỏi đều có nhật ký |
| **Chép câu trả lời gửi khách mà không kiểm** | Trợ lý hỗ trợ, bạn chịu trách nhiệm về thông tin gửi đi |
| Dùng tài khoản của người khác | Nhật ký ghi sai người, mất khả năng truy vết |
| Nạp tài liệu mật vào kho tri thức chung | Kiểm miền tài liệu trước khi nạp |
| Coi câu trả lời của trợ lý là thông tin chính thức | Là thông tin tra cứu; thông tin chính thức lấy từ hồ sơ gốc |

Dòng thứ hai quan trọng nhất: **trợ lý là công cụ tra cứu, bạn là người chịu trách nhiệm.** Thông tin gửi khách phải được bạn kiểm.

---

## 9. Dành cho quản trị viên

### 9.1 Quản lý người dùng

**Quản trị → Người dùng.**

| Việc | Cách làm |
| :---- | :---- |
| Thêm người dùng | Điền thư điện tử, họ tên, chọn vai trò |
| Đổi vai trò | Sửa trường vai trò |
| **Vô hiệu hoá** | Tắt trạng thái hoạt động — **không xoá** |

> **Cấp vai trò vừa đủ.** Vai trò quản trị thấy cả dữ liệu kinh doanh lẫn kế toán. Chỉ cấp cho người thật sự cần, giữ ở mức một đến hai người.

> **Nhân viên nghỉ việc: vô hiệu hoá ngay trong ngày, không xoá.** Xoá là mất dấu vết trong nhật ký.

### 9.2 Nhật ký AI — công cụ theo dõi quan trọng nhất

**Quản trị → Nhật ký AI.**

| Cột | Dùng để |
| :---- | :---- |
| Câu hỏi, câu trả lời | **Đọc 20 lượt ngẫu nhiên mỗi tháng** để đánh giá chất lượng thật |
| Ý định | Kiểm bộ phân loại có đúng không |
| Mô hình | Đối chiếu chất lượng với mô hình đã dùng |
| Đơn vị tiêu | **Kiểm soát chi phí**, đối chiếu hoá đơn |
| Thời gian phản hồi | **Phát hiện hệ thống chậm dần** |

Việc đọc mẫu 20 lượt mỗi tháng là cách duy nhất biết trợ lý đang trả lời tốt tới đâu — không chỉ số kỹ thuật nào thay được.

### 9.3 Theo dõi vận hành

| Màn hình | Xem gì | Tần suất |
| :---- | :---- | :---- |
| Sức khoẻ hệ thống | Sáu dịch vụ còn sống không | Hàng ngày |
| Nhật ký lỗi | Lỗi lặp lại | Hàng tuần |
| **Hàng đợi việc chết** | **Việc nằm đó là việc chưa ai xử lý** | Hàng tuần |
| Tài liệu | Trạng thái nạp, số đoạn đã cắt | Khi nạp tài liệu |
| Nhật ký sao lưu | Sao lưu có chạy không | Hàng tuần |

### 9.4 Kiểm an toàn định kỳ — bắt buộc hàng quý

| Kiểm | Cách làm |
| :---- | :---- |
| **Chốt chặn dược** | Chạy lại bộ ca ở `DA3-07` mục 3.1 — 23 ca |
| **Phân quyền công cụ** | Chạy lại bộ ca ở `DA3-07` mục 3.2 — 12 ca |
| **Cổng dịch vụ** | Quét cổng **từ máy bên ngoài** |

> **Ba mục này có thể hỏng âm thầm** sau một lần sửa mã hoặc thêm công cụ mới. Hệ thống vẫn chạy bình thường, chỉ là lớp bảo vệ không còn. Chạy lại bộ ca kiểm thử là cách duy nhất để biết.

### 9.5 Xoá dữ liệu theo yêu cầu

**Quản trị → Xoá dữ liệu.** Phục vụ yêu cầu xoá dữ liệu cá nhân của khách hàng.

Ghi lại: ai yêu cầu, xoá gì, lúc nào — làm bằng chứng đã xử lý yêu cầu.

---

## 10. Cần trợ giúp

| Loại việc | Liên hệ |
| :---- | :---- |
| Không rõ cách hỏi | Xem mục 2.5; hỏi đồng nghiệp |
| **Trợ lý trả lời sai thông tin** | **Báo ngay quản trị viên, kèm ảnh chụp câu hỏi và câu trả lời** |
| Câu hỏi hợp lệ bị chặn nhầm | Báo quản trị viên kèm câu hỏi cụ thể |
| Không tra được dữ liệu cần | Kiểm phạm vi vai trò trước; sau đó báo quản trị viên |
| Kênh nhắn tin không hoạt động | Báo quản trị viên |
| Đề nghị thêm chức năng | Gửi bộ phận kỹ thuật |

**Báo trợ lý trả lời sai là việc quan trọng nhất.** Mỗi lần như vậy là một dấu hiệu cần điều chỉnh — có thể là tài liệu nạp thiếu, có thể là công cụ tra sai, có thể là câu lệnh cần siết. Không báo thì lỗi lặp lại mãi.
