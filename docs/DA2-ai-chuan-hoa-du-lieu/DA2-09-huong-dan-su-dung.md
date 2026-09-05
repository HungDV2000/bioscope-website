<!--HOSO
phu_de: Hệ thống AI chuẩn hoá và cập nhật dữ liệu sản phẩm
pham_vi: Dự án DA2 — biên tập viên và quản trị viên
ngay_lap: 18/08/2026
phien_ban: 1.1
nguoi_lap: A Hùng — Product Owner, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 18/08/2026 | Ban hành lần đầu
lich_su: 1.1 | 24/08/2026 | Bổ sung quy trình duyệt bốn bước
-->
# DA2 — HƯỚNG DẪN SỬ DỤNG
## Hệ thống AI chuẩn hoá và cập nhật dữ liệu sản phẩm

*Tài liệu viết cho biên tập viên nội dung. Trình bày theo việc cần làm.*

---

## 0. Đọc phần này trước khi dùng

### AI làm gì và **không** làm gì

| AI làm | AI **không** làm |
| :---- | :---- |
| Đọc hồ sơ nhà cung cấp | **Không tự đăng lên website** |
| Chép thông số kỹ thuật ra biểu mẫu | **Không quyết định thay bạn** |
| Viết mô tả, lợi ích, ứng dụng | **Không chịu trách nhiệm về nội dung** |
| Dịch sang tiếng Anh | **Không xoá dữ liệu bạn đã nhập** |
| Đề xuất chỉ tiêu, thẻ lọc | |

> ### ⚠ Điều quan trọng nhất trong tài liệu này
>
> **Kết quả AI sinh ra LUÔN là bản nháp. Bạn là người quyết định nó có được đăng hay không.**
>
> Dữ liệu nguyên liệu gửi tới khách hàng công nghiệp — họ dùng nó để tính công thức sản phẩm. Một chỉ tiêu sai không phải chuyện thẩm mỹ:
>
> | Sai ở | Hậu quả |
> | :---- | :---- |
> | Mã CAS | Khách mua nhầm hoạt chất khác |
> | Hàm lượng hoạt chất | Công thức sai liều |
> | Hạn dùng, bảo quản | Nguyên liệu hỏng trong kho khách |
> | Trạng thái pháp lý | Khách dùng nguyên liệu chưa được phép |
>
> AI có xu hướng **điền vào chỗ trống bằng thứ nghe hợp lý**. Một mã CAS bịa ra trông y hệt mã thật. Không ai phân biệt được nếu không mở tài liệu gốc đối chiếu.
>
> **Vì vậy bước duyệt ở mục 4 là bắt buộc, không phải tuỳ chọn.**

### Hai loại trường — phải phân biệt được

Đây là khái niệm quan trọng nhất. Nắm được thì duyệt nhanh và đúng; không nắm được thì hoặc duyệt hời hợt (nguy hiểm) hoặc duyệt quá kỹ (mất thời gian).

| | **LOẠI A — TRÍCH XUẤT** | **LOẠI B — BIÊN TẬP** |
| :---- | :---- | :---- |
| Gồm | Chỉ tiêu kỹ thuật, mã CAS, mã HS, mã E, hàm lượng, hạn dùng, bảo quản, đóng gói, trạng thái pháp lý, số công bố, huy hiệu, số lượng đặt tối thiểu, bảng giá, thương hiệu, xuất xứ | Phụ đề, mô tả, lợi ích, ứng dụng, cơ chế tác động, tiêu đề và mô tả tìm kiếm |
| AI được phép | **Chỉ chép từ tài liệu** | Suy luận khoa học hợp lý |
| Không có trong tài liệu | **Phải để trống** | Vẫn viết được |
| Bạn kiểm thế nào | **Mở tài liệu gốc, đối chiếu từng giá trị** | Đọc cho xuôi, soi kỹ các **con số** |
| Sai thì | Hậu quả nghiêm trọng | Sửa văn là xong |

---

## 1. Chuẩn bị: đồng bộ kho tài liệu

**AI chỉ đọc được tệp trong kho tài liệu.** Nguyên liệu chưa đồng bộ thì AI không có gì để đọc, kết quả sẽ nghèo nàn mà vẫn tốn tiền.

### Cách làm

1. Mở nguyên liệu
2. Vào thẻ **Đồng bộ**
3. Xem **Số tệp** và **Lần đồng bộ gần nhất**
4. Số tệp bằng 0 hoặc thông tin cũ → bấm **⚙ Công cụ nguyên liệu → Đồng bộ lại kho tài liệu**
5. Chờ vài giây, danh sách tệp hiện ra

### Số tệp vẫn bằng 0 thì sao

| Nguyên nhân | Xử lý |
| :---- | :---- |
| Thư mục nguyên liệu trên kho tài liệu trống thật | Yêu cầu bộ phận mua hàng bổ sung hồ sơ |
| Nguyên liệu chưa gắn mã thư mục | Báo quản trị viên |
| Thư mục chưa chia sẻ cho hệ thống | Báo quản trị viên |

Ba nguyên nhân này cho **cùng một triệu chứng**, nên đừng tự đoán — báo quản trị viên kiểm.

---

## 2. Sinh nội dung cho một nguyên liệu

1. Mở nguyên liệu
2. Bấm **⚙ Công cụ nguyên liệu** (cạnh nút Lưu)
3. Chọn **Tạo nội dung tự động**
4. Hộp thoại hiện ra — **đọc số tệp nguồn**:

| Số tệp | Nên làm gì |
| :---- | :---- |
| 0 | **Dừng lại.** Đồng bộ kho tài liệu trước |
| 1–2 | Chạy được, nhưng kết quả sẽ ít thông số |
| 3 trở lên | Tốt |

5. Bấm **Bắt đầu**
6. **Làm việc khác được** — công việc chạy nền, không cần ngồi chờ
7. Theo dõi ở **Vận hành → Hàng đợi AI**

### Chín trạng thái nghĩa là gì

| Trạng thái | Đang làm gì |
| :---- | :---- |
| Đã xếp hàng | Chờ tới lượt |
| Đang tải file | Tải tệp từ kho tài liệu |
| Đang trích xuất | Đọc nội dung tệp |
| Đang sinh nội dung | Gọi AI |
| Đang sinh hình ảnh | Tạo ảnh đại diện |
| Đang lưu | Ghi vào nguyên liệu |
| **Hoàn tất** | Xong — sang bước duyệt |
| **Lỗi** | Xem nhật ký để biết nguyên nhân |
| **Hủy** | Bạn đã huỷ |

Thời gian thường: **5–15 phút** tuỳ số tệp và độ dày hồ sơ.

---

## 3. Sinh hàng loạt

1. Mở danh sách **Nguyên liệu**
2. **Lọc** ra nhóm cần xử lý — ví dụ: trạng thái Nháp, chưa có mô tả
3. Chọn một trong hai:
   - Đánh dấu từng nguyên liệu → **Tạo nội dung**
   - **Tạo cho tất cả** — áp dụng cho toàn bộ nguyên liệu khớp bộ lọc
4. Hộp thoại hiện **số lượng công việc** — đọc kỹ
5. Xác nhận

> ### ⚠ Mỗi công việc tốn tiền thật
>
> Bấm **Tạo cho tất cả** khi bộ lọc đang rỗng nghĩa là xếp hàng **toàn bộ danh mục nguyên liệu**. Tiền đã tiêu không lấy lại được.
>
> **Luôn kiểm bộ lọc trước khi bấm.** Con số trong hộp thoại xác nhận là con số thật — đọc nó.

### Nên chạy hàng loạt lúc nào

| Thời điểm | Đánh giá |
| :---- | :---- |
| Ngoài giờ làm việc | **Tốt nhất** |
| Giờ làm việc, số lượng ít | Được |
| Giờ cao điểm, số lượng lớn | **Tránh** — làm chậm hệ quản trị và cả khung chat của khách |

Lý do: hàng đợi AI chạy chung tiến trình với hệ quản trị. Xử lý tệp nặng làm chậm mọi thao tác khác.

---

## 4. Duyệt kết quả — phần quan trọng nhất

Nguyên liệu vừa chạy xong sẽ có cờ **Chờ duyệt** và trạng thái **Nháp**.

### Bước 1 — Đọc nhật ký công việc

Vào **Vận hành → Hàng đợi AI**, mở công việc vừa chạy, xem nhật ký.

| Màu | Nghĩa | Bạn cần làm gì |
| :---- | :---- | :---- |
| Xám | Bước bình thường | Không cần làm gì |
| **Cam** | **Có tệp bị bỏ qua** | **Kiểm kỹ hơn** — nội dung có thể thiếu thông số |
| Đỏ | Lỗi | Công việc không hoàn thành |

Dòng cam là tín hiệu quan trọng nhất: công việc *xong* nhưng thiếu nguồn.

### Bước 2 — Đối chiếu trường LOẠI A với tài liệu gốc

**Đây là bước bắt buộc, không được bỏ.**

1. Mở thẻ **Đồng bộ**, xem danh sách tệp nguồn
2. Mở các tệp đó trên kho tài liệu
3. Đối chiếu từng trường:

| Trường | Ở thẻ | Đối chiếu với |
| :---- | :---- | :---- |
| Mã CAS, mã HS, mã E | Kỹ thuật | Phiếu thông số kỹ thuật |
| Hàm lượng, tiêu chuẩn hoá | Kỹ thuật | Phiếu thông số kỹ thuật |
| Hình thức, độ tan, cỡ hạt | Kỹ thuật | Phiếu thông số kỹ thuật |
| Hạn dùng, bảo quản, đóng gói | Kỹ thuật | Phiếu thông số kỹ thuật |
| Chống chỉ định phối trộn | Kỹ thuật | Phiếu thông số kỹ thuật |
| Trạng thái pháp lý, số công bố | Pháp lý | Hồ sơ pháp lý |
| Huy hiệu chứng nhận | Nội dung | Giấy chứng nhận |
| Chỉ tiêu — **từng dòng** | Kỹ thuật | Phiếu thông số kỹ thuật, phiếu phân tích |
| Bảng giá, số lượng đặt tối thiểu | Tổng quan | Bảng giá |

4. Áp dụng hai quy tắc:

> **Quy tắc 1 — Có giá trị mà tài liệu không ghi → XOÁ NGAY.**
> Đây là dữ liệu bịa. Không sửa, không đoán lại — xoá.
>
> **Quy tắc 2 — Tài liệu có mà hệ thống bỏ trống → BỔ SUNG TAY.**
> Đây là thiếu sót, chấp nhận được. Bạn điền vào.

**Trường để trống là bình thường và đúng.** Nếu tài liệu không ghi mã CAS thì trường mã CAS phải trống. Đừng thấy trống mà lo — trống còn hơn sai.

### Bước 3 — Đọc trường LOẠI B

Nhanh hơn nhiều. Chỉ cần:

| Kiểm | Cách |
| :---- | :---- |
| Mô tả đọc có xuôi và đúng ngành không | Đọc lướt |
| **Có con số nào không?** | Số nào cũng phải có trong tài liệu. Không có → xoá câu đó |
| Lợi ích, ứng dụng có hợp lý không | Đọc lướt |
| Huy hiệu có đúng chứng nhận tài liệu nêu không | Đối chiếu |

Câu kiểu *"tăng hấp thu 47%"* mà tài liệu không ghi con số đó thì **xoá**.

### Bước 4 — Kiểm bản tiếng Anh

Chuyển ngôn ngữ sang tiếng Anh, đọc lại các trường loại B. Thuật ngữ chuyên ngành có đúng không.

### Hoàn tất

1. Sửa xong → **Bỏ cờ Chờ duyệt**
2. Bấm **Xuất bản**

---

## 5. Tạo lại ảnh đại diện

Dùng khi nguyên liệu chưa có ảnh thật.

1. Mở nguyên liệu → **⚙ Công cụ nguyên liệu → Tạo lại ảnh đại diện**
2. Chờ vài phút
3. Ảnh mới xuất hiện ở thẻ **Hình ảnh**

| Lưu ý | Nội dung |
| :---- | :---- |
| Chỉ tạo ảnh | Không đụng tới nội dung |
| Ảnh dựa trên nội dung thật | Nên chạy **sau** khi đã có mô tả |
| Ảnh thật luôn tốt hơn | Có ảnh chụp thật thì dùng ảnh thật, đừng dùng ảnh sinh |
| Báo lỗi thiếu khoá | Báo quản trị viên — cần khoá riêng cho chức năng này |

---

## 6. Kiểm tra trùng lặp

1. **Vận hành → Kiểm tra trùng lặp**
2. Bấm **Bắt đầu quét**
3. Xem danh sách cặp nghi trùng

**Hệ thống chỉ nghi ngờ, không tự gộp.** Hai tên gần giống có thể là hai sản phẩm thật sự khác nhau của hai nhà cung cấp. Bạn xem từng cặp và tự quyết định.

---

## 7. Xem chi phí

**Vận hành → Hàng đợi AI**. Mỗi công việc có cột chi phí, ghi cả đô-la và **đồng**.

| Thông tin | Ý nghĩa |
| :---- | :---- |
| Chi phí (đồng) | Ước tính lượt chạy đó tốn bao nhiêu |
| "Dùng bảng giá dựng sẵn" | Tính theo bảng giá tra tháng 07/2026 — có thể lệch |
| "Dùng đơn giá đã đặt" | Tính theo đơn giá quản trị viên đặt theo hợp đồng thật |

Chi phí một công việc cao bất thường thường do tệp rất lớn hoặc nhiều trang scan. Mở nhật ký xem chi tiết.

---

## 8. Xử lý tình huống thường gặp

| Tình huống | Nguyên nhân | Xử lý |
| :---- | :---- | :---- |
| Đồng bộ trả về 0 tệp | Thư mục trống, chưa gắn mã, hoặc chưa chia sẻ | Báo quản trị viên |
| Công việc lỗi ngay bước đầu | Chưa cấu hình khoá dịch vụ | Báo quản trị viên |
| Công việc lỗi ở bước sinh ảnh | Thiếu khoá cho chức năng tạo ảnh | Báo quản trị viên. **Phần nội dung vẫn dùng được** |
| Nội dung sinh ra rất nghèo | Ít tệp nguồn, hoặc hồ sơ sơ sài | Bổ sung hồ sơ rồi chạy lại |
| Nhiều trường bị bỏ trống | **Có thể là đúng** — tài liệu không ghi | Đối chiếu tài liệu trước khi kết luận là lỗi |
| Chỉ tiêu chỉ có 2–3 dòng | Hồ sơ chỉ có bấy nhiêu, hoặc tệp bị bỏ qua | Xem nhật ký có dòng cam không |
| Hệ quản trị chậm | Hàng đợi đang chạy nặng | Chờ, hoặc chạy hàng loạt ngoài giờ |
| Chạy lại thì dữ liệu cũ có mất không | **Không** — hệ thống không ghi đè bằng giá trị rỗng | Yên tâm chạy lại |
| Ảnh sinh ra không giống nguyên liệu | Nội dung chưa đủ để mô tả ảnh | Chạy sinh nội dung trước, rồi tạo lại ảnh |

---

## 9. Việc không được làm

| Không được | Vì sao |
| :---- | :---- |
| **Xuất bản mà chưa đối chiếu trường loại A** | Đây là toàn bộ lý do bước duyệt tồn tại |
| Bấm "Tạo cho tất cả" mà không xem bộ lọc | Tốn tiền thật cho hàng trăm công việc không cần |
| Tự điền trường loại A theo phỏng đoán | Bạn đang làm đúng cái việc mà hệ thống được thiết kế để tránh |
| Coi trường bị bỏ trống là lỗi rồi tự điền | Trống có thể là đúng. Đối chiếu tài liệu trước |
| Chạy hàng loạt lớn trong giờ cao điểm | Làm chậm hệ quản trị và khung chat của khách |
| Sửa Cài đặt AI khi không phải quản trị viên | Không có quyền, và đổi mô hình ảnh hưởng chi phí toàn hệ thống |

---

## 10. Dành cho quản trị viên: cấu hình AI

**Hệ thống → Cài đặt AI.** Chỉ quản trị viên sửa được.

| Thẻ | Cấu hình |
| :---- | :---- |
| Gốc | Nhà cung cấp: cổng trung gian hoặc gọi thẳng |
| Kết nối | Khoá truy cập, tên ứng dụng |
| Model | Mô hình sinh nội dung, mô hình đọc ảnh |
| Ảnh | Khoá riêng cho tạo ảnh, mô hình tạo ảnh |

**Lưu là áp dụng ngay**, không cần khởi động lại.

### Hai cạm bẫy

> **⚠ Ô "Model đọc ảnh / PDF scan": ĐỪNG để chế độ tự chọn.**
> Bộ định tuyến có thể chọn một mô hình chỉ xử lý chữ, và bước đọc ảnh sẽ hỏng với thông báo lỗi không nói rõ nguyên nhân. Hãy ghi rõ tên một mô hình nhìn được.

> **⚠ Cổng trung gian KHÔNG tạo được ảnh.**
> Phần tạo ảnh luôn gọi thẳng nhà cung cấp có chức năng đó. Thiếu khoá riêng ở thẻ Ảnh thì nút "Tạo lại ảnh đại diện" sẽ báo lỗi, dù mọi thứ khác đã cấu hình đúng.

### Kiểm soát chi phí

| Việc | Tần suất |
| :---- | :---- |
| Cộng chi phí trong tháng, đối chiếu hoá đơn nhà cung cấp | Hàng tháng |
| Cập nhật bảng đơn giá nếu lệch quá 10% | Khi phát hiện lệch |
| Cập nhật tỉ giá quy đổi | Hàng quý |

Tên ứng dụng khai ở thẻ Kết nối sẽ hiện trong bảng điều khiển nhà cung cấp — nhờ đó phân biệt được chi phí của hệ thống này với hệ thống khác dùng chung tài khoản.

---

## 11. Cần trợ giúp

| Loại việc | Liên hệ |
| :---- | :---- |
| Không rõ một trường thuộc loại A hay loại B | Xem bảng ở mục 0; hỏi bộ phận kỹ thuật sản phẩm |
| Nghi ngờ AI bịa dữ liệu | **Báo ngay bộ phận kỹ thuật, kèm tên nguyên liệu và trường cụ thể** |
| Công việc lỗi | Báo quản trị viên, **kèm ảnh chụp nhật ký công việc** |
| Chi phí bất thường | Báo quản trị viên |
| Đề nghị cải tiến | Gửi bộ phận kỹ thuật |

**Việc báo AI bịa dữ liệu là quan trọng nhất.** Mỗi lần như vậy là một dấu hiệu cơ chế chống bịa cần siết thêm — bộ phận kỹ thuật sẽ điều chỉnh quy tắc gửi cho mô hình.
