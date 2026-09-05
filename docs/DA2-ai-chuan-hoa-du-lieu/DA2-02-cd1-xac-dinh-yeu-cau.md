<!--HOSO
phu_de: Hệ thống AI chuẩn hoá và cập nhật dữ liệu sản phẩm
pham_vi: Dự án DA2
ngay_lap: 24/06/2026
phien_ban: 1.1
nguoi_lap: A Hùng — Product Owner, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc OPTIMAI và đại diện Công ty Bioscope
lich_su: 1.0 | 24/06/2026 | Ban hành lần đầu
lich_su: 1.1 | 20/07/2026 | Bổ sung yêu cầu nhận dạng chữ trong ảnh và ước tính chi phí
-->
# DA2 — CÔNG ĐOẠN 1: XÁC ĐỊNH YÊU CẦU
## Hệ thống AI chuẩn hoá và cập nhật dữ liệu sản phẩm

---

## 1. Bối cảnh

Dự án DA1 đã dựng xong kho dữ liệu nguyên liệu tập trung với mô hình 73 trường. Kho có rồi nhưng **rỗng** — phải có người ngồi điền.

### 1.1 Đo hiện trạng

Khảo sát thời gian thực tế nhân viên bỏ ra cho **một** nguyên liệu:

| Công đoạn | Thời gian đo được | Ghi chú |
| :---- | :---- | :---- |
| Mở và đọc hồ sơ nhà cung cấp | 15–30 phút | Hồ sơ 5–20 trang, nhiều định dạng |
| Chép chỉ tiêu kỹ thuật | 20–40 phút | 10–25 dòng thông số, phải chép chính xác |
| Viết mô tả, lợi ích, ứng dụng | 30–60 phút | Cần hiểu ngành |
| Dịch sang tiếng Anh | 30–60 phút | Thuật ngữ chuyên ngành |
| Viết phần tối ưu tìm kiếm | 10 phút | |
| **Tổng mỗi nguyên liệu** | **2–3,5 giờ** | |

Với quy mô danh mục nguyên liệu của công ty, đây là **hàng trăm giờ công**.

### 1.2 Ba vấn đề, xếp theo mức nghiêm trọng

| # | Vấn đề | Vì sao nghiêm trọng |
| :---- | :---- | :---- |
| 1 | **Sai sót khi chép tay** | Chép nhầm một chữ số chỉ tiêu kỹ thuật là gửi sai thông tin cho khách hàng công nghiệp. Khách dùng số đó để tính công thức |
| 2 | **Chậm** | Nguyên liệu mới về nằm chờ hàng tuần mới lên website. Cơ hội kinh doanh trôi qua |
| 3 | **Không đồng đều** | Mỗi người viết một kiểu, nguyên liệu này chi tiết nguyên liệu kia sơ sài. Khách không so sánh được |

### 1.3 Điều kiện thuận lợi

Toàn bộ hồ sơ nhà cung cấp **đã được lưu tập trung** trên kho tài liệu Google Drive, tổ chức theo thư mục từng nguyên liệu. Đây là điều kiện tiên quyết — không có kho tài liệu có tổ chức thì không tự động hoá được.

---

## 2. Yêu cầu nghiệp vụ

| Mã | Yêu cầu nghiệp vụ | Từ đâu |
| :---- | :---- | :---- |
| NV-01 | Giảm mạnh thời gian đưa một nguyên liệu mới lên website | Ban giám đốc Bioscope |
| NV-02 | Loại bỏ sai sót do chép tay chỉ tiêu kỹ thuật | Bộ phận kỹ thuật sản phẩm Bioscope |
| NV-03 | Nội dung các nguyên liệu đồng đều về cấu trúc và độ chi tiết | Bộ phận kinh doanh Bioscope |
| NV-04 | Có nội dung song ngữ ngay, không phải dịch riêng một lượt | Bộ phận kinh doanh Bioscope |
| NV-05 | **Không được để thông tin sai lọt ra khách hàng** | Bộ phận kỹ thuật sản phẩm Bioscope, Ban giám đốc Bioscope |
| NV-06 | Kiểm soát được chi phí gọi dịch vụ AI | Ban giám đốc Bioscope, kế toán Bioscope |
| NV-07 | Xử lý được cả hồ sơ dạng ảnh scan, không chỉ tệp chữ | Bộ phận kỹ thuật sản phẩm Bioscope |
| NV-08 | Đổi được nhà cung cấp AI khi giá hoặc chất lượng thay đổi | Bộ phận kỹ thuật Bioscope |

> **NV-05 là yêu cầu chi phối toàn bộ thiết kế.** Ban giám đốc Bioscope nêu rõ: thà chậm hơn còn hơn sai. Một mã CAS bịa ra đăng công khai cho khách hàng công nghiệp gây hậu quả lớn hơn nhiều so với việc để trống trường đó.

---

## 3. Yêu cầu chức năng

### 3.1 Nhóm thu thập dữ liệu nguồn

| Mã | Yêu cầu | Nghiệp vụ gốc | Ưu tiên |
| :---- | :---- | :---- | :---- |
| YC-01 | Quét thư mục kho tài liệu, liệt kê tệp của từng nguyên liệu | NV-01 | Bắt buộc |
| YC-02 | Đối chiếu tệp với nguyên liệu tương ứng trong hệ quản trị | NV-01 | Bắt buộc |
| YC-03 | Đọc được PDF dạng chữ | NV-01 | Bắt buộc |
| YC-04 | Đọc được **PDF dạng scan** và **ảnh chụp** | NV-07 | Bắt buộc |
| YC-05 | Đọc được Google Docs, Sheets, Slides | NV-01 | Bắt buộc |
| YC-06 | Đọc được tệp văn bản và CSV | NV-01 | Nên có |
| YC-07 | Nhập danh sách nguyên liệu từ tệp bảng | NV-01 | Nên có |
| YC-08 | Ghi lại số tệp và thời điểm đồng bộ gần nhất của mỗi nguyên liệu | NV-01 | Nên có |

### 3.2 Nhóm sinh nội dung

| Mã | Yêu cầu | Nghiệp vụ gốc | Ưu tiên |
| :---- | :---- | :---- | :---- |
| YC-09 | Sinh đủ 20 nhóm trường của hồ sơ nguyên liệu | NV-03 | Bắt buộc |
| YC-10 | Mọi trường có tính ngôn ngữ đều sinh **đồng thời tiếng Việt và tiếng Anh** | NV-04 | Bắt buộc |
| YC-11 | **Chia trường thành hai loại**: trích xuất và biên tập, với hai tiêu chuẩn khác nhau | NV-05 | **Bắt buộc** |
| YC-12 | Trường loại trích xuất không có trong tài liệu thì **để trống**, không đoán | NV-05 | **Bắt buộc** |
| YC-13 | Trường loại biên tập được suy luận, nhưng **mọi con số phải có trong tài liệu** | NV-05 | **Bắt buộc** |
| YC-14 | Chuẩn hoá tên nguyên liệu: bỏ số thứ tự, bỏ mã nội bộ, bỏ hậu tố | NV-03 | Bắt buộc |
| YC-15 | Chỉ chọn thẻ lọc từ danh mục có sẵn, không được tạo tên mới | NV-03 | Bắt buộc |
| YC-16 | Sinh chỉ tiêu kỹ thuật đầy đủ, lấy hết thông số có trong tài liệu | NV-03 | Bắt buộc |
| YC-17 | Sinh tiêu đề và mô tả tối ưu tìm kiếm, đúng giới hạn độ dài | NV-03 | Nên có |
| YC-18 | Sinh ảnh đại diện khi nguyên liệu chưa có ảnh | NV-01 | Nên có |
| YC-19 | Xử lý đúng khi một tài liệu chứa **nhiều biến thể sản phẩm** | NV-05 | Bắt buộc |

### 3.3 Nhóm bảo đảm chất lượng

| Mã | Yêu cầu | Nghiệp vụ gốc | Ưu tiên |
| :---- | :---- | :---- | :---- |
| YC-20 | Kết quả **luôn** lưu ở trạng thái nháp, không tự xuất bản | NV-05 | **Bắt buộc** |
| YC-21 | Chuẩn hoá hình dạng dữ liệu trả về, chấp nhận khác biệt giữa các mô hình | NV-03 | Bắt buộc |
| YC-22 | **Không ghi đè dữ liệu cũ bằng giá trị rỗng** | NV-05 | **Bắt buộc** |
| YC-23 | Loại bỏ giá trị không nằm trong danh mục hợp lệ | NV-05 | Bắt buộc |
| YC-24 | Đánh dấu nguyên liệu do AI sinh là **chờ duyệt** | NV-05 | Bắt buộc |
| YC-25 | Phát hiện nguyên liệu trùng hoặc gần trùng tên | NV-03 | Nên có |

### 3.4 Nhóm vận hành

| Mã | Yêu cầu | Nghiệp vụ gốc | Ưu tiên |
| :---- | :---- | :---- | :---- |
| YC-26 | Xếp hàng công việc, chạy nền, không chặn giao diện | NV-01 | Bắt buộc |
| YC-27 | Xử lý hàng loạt: chọn nhiều nguyên liệu hoặc toàn bộ | NV-01 | Bắt buộc |
| YC-28 | Theo dõi trạng thái từng công việc theo **9 giai đoạn** | NV-01 | Bắt buộc |
| YC-29 | Nhật ký chi tiết từng bước, có mốc thời gian và mức độ | NV-01 | Bắt buộc |
| YC-30 | Huỷ được công việc đang chạy | NV-01 | Nên có |
| YC-31 | Đặt hạn giờ cho mỗi tệp, tránh treo hàng đợi | NV-01 | Bắt buộc |
| YC-32 | **Lùi phương án khi lỗi**: tệp hỏng thì gọi lại không kèm tệp thay vì mất trắng | NV-01 | Bắt buộc |
| YC-33 | Xuất và nhập nội dung dạng tệp để sửa hàng loạt | NV-03 | Nên có |

### 3.5 Nhóm chi phí và cấu hình

| Mã | Yêu cầu | Nghiệp vụ gốc | Ưu tiên |
| :---- | :---- | :---- | :---- |
| YC-34 | Đếm số đơn vị đã dùng cho từng công việc | NV-06 | Bắt buộc |
| YC-35 | Ước tính chi phí ra đô-la **và đồng Việt Nam** | NV-06 | Bắt buộc |
| YC-36 | Ghi rõ đang dùng bảng giá dựng sẵn hay giá do người quản trị đặt | NV-06 | Bắt buộc |
| YC-37 | Đổi nhà cung cấp AI **ngay trên giao diện**, không triển khai lại | NV-08 | Bắt buộc |
| YC-38 | Đổi mô hình cho từng loại tác vụ: sinh nội dung, đọc ảnh, tạo ảnh | NV-08 | Bắt buộc |
| YC-39 | Khoá truy cập dịch vụ chỉ quản trị viên đọc/sửa được | NV-06 | Bắt buộc |
| YC-40 | Bỏ trống ô cấu hình thì lấy từ biến môi trường | NV-08 | Nên có |

---

## 4. Yêu cầu phi chức năng

| Mã | Loại | Yêu cầu | Cách đo |
| :---- | :---- | :---- | :---- |
| PC-01 | Tốc độ | Một nguyên liệu có 5 tệp xử lý xong trong 15 phút | Bấm giờ trên công việc thật |
| PC-02 | Tốc độ | Đặt hạn giờ mỗi tệp, mặc định 150 giây | Xem cấu hình |
| PC-03 | Độ tin cậy | Một tệp hỏng không làm hỏng cả công việc | Thử với tệp cố ý làm hỏng |
| PC-04 | Độ tin cậy | Công việc lỗi không làm kẹt hàng đợi | Thử gây lỗi liên tiếp |
| PC-05 | Độ tin cậy | Dịch vụ AI trả lỗi máy chủ thì thử lại theo cơ chế đã định | Xem nhật ký |
| PC-06 | Chính xác | **Tỉ lệ trường trích xuất sai bằng 0** | Đối chiếu thủ công theo mẫu |
| PC-07 | Chính xác | Trường không có trong tài liệu phải để trống, không được đoán | Kiểm thử âm |
| PC-08 | Bảo mật | Khoá dịch vụ không nằm trong mã nguồn | Rà soát kho mã nguồn |
| PC-09 | Bảo mật | Khoá dịch vụ chỉ quản trị viên đọc được | Thử với vai trò biên tập viên |
| PC-10 | Bảo mật | **Không ghi khoá vào nhật ký** | Rà soát nhật ký |
| PC-11 | Chi phí | Ước tính chi phí sai lệch dưới 10% so với hoá đơn nhà cung cấp | Đối chiếu hoá đơn |
| PC-12 | Bảo trì | Đổi mô hình không cần sửa mã, không cần triển khai lại | Thử đổi trên giao diện |

---

## 5. Tiêu chí nghiệm thu

| # | Tiêu chí | Cách kiểm |
| :---- | :---- | :---- |
| 1 | Toàn bộ yêu cầu mức "Bắt buộc" đã dựng và chạy được | Đối chiếu bộ ca kiểm thử `DA2-07` |
| 2 | Chạy trên 10 nguyên liệu thật, kết quả dùng được sau khi người duyệt | Nghiệm thu thực tế |
| 3 | **Không có trường trích xuất nào bị bịa** — đối chiếu tài liệu gốc | Kiểm thủ công 10 nguyên liệu |
| 4 | Trường không có trong tài liệu được để trống | Kiểm thủ công |
| 5 | Kết quả AI **luôn** ở trạng thái nháp | Kiểm thử âm |
| 6 | AI trả về rỗng thì dữ liệu cũ **không bị xoá** | Kiểm thử âm |
| 7 | Đọc được PDF scan và ảnh | Thử với hồ sơ scan thật |
| 8 | Xử lý được hàng loạt 20 nguyên liệu không kẹt hàng đợi | Thử tải |
| 9 | Ước tính chi phí khớp hoá đơn trong sai số 10% | Đối chiếu hoá đơn tháng |
| 10 | Đổi mô hình trên giao diện có hiệu lực ngay | Thử đổi rồi chạy |
| 11 | Không có khoá dịch vụ trong mã nguồn và trong nhật ký | Rà soát |
| 12 | Thời gian mỗi nguyên liệu giảm còn dưới 30 phút gồm cả duyệt | Bấm giờ |

---

## 6. Phạm vi loại trừ

| Không làm | Lý do |
| :---- | :---- |
| Tự xuất bản nội dung AI sinh ra | Vi phạm NV-05. Người phải duyệt |
| Huấn luyện mô hình riêng | Chi phí và dữ liệu không đủ; dùng mô hình sẵn có là đủ |
| Sinh nội dung cho bài viết bản tin | Bài viết cần giọng văn riêng của công ty |
| Dịch tự động nội dung đã có | Nội dung kỹ thuật cần dịch có kiểm soát |
| Trả lời câu hỏi khách hàng | Thuộc DA3 |
| Tự động đặt giá bán | Quyết định kinh doanh, không giao cho máy |

---

## 7. Ràng buộc

| Loại | Ràng buộc |
| :---- | :---- |
| Chất lượng dữ liệu nguồn | Hệ thống chỉ tốt bằng hồ sơ nhà cung cấp. Hồ sơ thiếu thông số thì không có nguồn nào để trích |
| Chi phí | Mỗi lượt gọi mô hình tốn tiền thật. Phải đo được và kiểm soát được |
| Hạ tầng | Chạy chung máy chủ với DA1, không có máy riêng |
| Phụ thuộc dịch vụ ngoài | Dịch vụ AI ngừng hoạt động thì dây chuyền dừng. Phải có đường dự phòng |
| Pháp lý | Nội dung sai về chỉ tiêu kỹ thuật hoặc trạng thái pháp lý gây hậu quả thật |

---

## 8. Rủi ro đã nhận diện từ đầu

| # | Rủi ro | Mức | Cách phòng đã thiết kế |
| :---- | :---- | :---- | :---- |
| 1 | **Mô hình bịa dữ liệu kỹ thuật** | **Cao** | Chia hai loại trường; quy tắc nghiêm ngặt trong câu lệnh; bắt buộc người duyệt |
| 2 | Chi phí vượt kiểm soát | Cao | Đếm đơn vị, ước tính chi phí mỗi công việc, để nhà cung cấp tự chọn mô hình rẻ khi câu dễ |
| 3 | Ghi đè mất dữ liệu tốt đã có | Cao | Quy tắc không ghi đè bằng giá trị rỗng |
| 4 | Một tệp hỏng làm mất cả công việc | Trung bình | Gọi lại không kèm tệp thay vì bỏ cuộc |
| 5 | Hàng đợi kẹt vì một công việc treo | Trung bình | Đặt hạn giờ từng tệp |
| 6 | Tài liệu chứa nhiều biến thể, trộn lẫn dữ liệu | Trung bình | Quy tắc riêng trong câu lệnh; không chắc thì bỏ trống |
| 7 | Dịch vụ AI đổi giá hoặc ngừng | Trung bình | Đổi được nhà cung cấp trên giao diện |
| 8 | Xử lý tệp nặng làm chậm hệ quản trị | Trung bình | **Chưa xử lý gốc** — ghi nhận và theo dõi |

---

---

## Phụ lục A — Ma trận truy vết yêu cầu

Bảng nối **yêu cầu → thiết kế → ca kiểm thử**. Mục đích: chứng minh không yêu cầu nào bị bỏ quên, và mỗi yêu cầu đều có cách kiểm chứng độc lập.

### A.1 Độ phủ

| Chỉ số | Số lượng |
| :---- | :----: |
| Tổng yêu cầu chức năng | **40** |
| Đã có ca kiểm thử | **40** |
| **Chưa có ca kiểm thử** | **0** |
| Độ phủ | **100%** |

Tài liệu thiết kế tương ứng: `DA2-03` kiến trúc · `DA2-04` dữ liệu · `DA2-05` giao diện.

### A.2 Bảng truy vết

| Yêu cầu | Nội dung | Thiết kế | Ca kiểm thử |
| :---- | :---- | :---- | :---- |
| `YC-01` | Quét thư mục kho tài liệu, liệt kê tệp của từng nguyên liệu | `DA2-03` `DA2-04` `DA2-05` | TC-01, TC-01–TC-10, TC-09 |
| `YC-02` | Đối chiếu tệp với nguyên liệu tương ứng trong hệ quản trị | `DA2-03` `DA2-04` `DA2-05` | TC-01–TC-10, TC-02 |
| `YC-03` | Đọc được PDF dạng chữ | `DA2-03` `DA2-04` `DA2-05` | TC-01–TC-10, TC-03 |
| `YC-04` | Đọc được PDF dạng scan và ảnh chụp | `DA2-03` `DA2-04` `DA2-05` | TC-01–TC-10, TC-04, TC-05 |
| `YC-05` | Đọc được Google Docs, Sheets, Slides | `DA2-03` `DA2-04` `DA2-05` | TC-01–TC-10, TC-06, TC-07 |
| `YC-06` | Đọc được tệp văn bản và CSV | `DA2-03` `DA2-04` `DA2-05` | TC-01–TC-10, TC-08 |
| `YC-07` | Nhập danh sách nguyên liệu từ tệp bảng | `DA2-03` `DA2-04` `DA2-05` | TC-01–TC-10, TC-10 |
| `YC-08` | Ghi lại số tệp và thời điểm đồng bộ gần nhất của mỗi nguyên liệu | `DA2-03` `DA2-04` `DA2-05` | TC-01–TC-10 |
| `YC-09` | Sinh đủ 20 nhóm trường của hồ sơ nguyên liệu | `DA2-03` `DA2-04` `DA2-05` | TC-11, TC-11–TC-19, TC-16, TC-17 |
| `YC-10` | Mọi trường có tính ngôn ngữ đều sinh đồng thời tiếng Việt và tiế… | `DA2-03` `DA2-04` `DA2-05` | TC-11–TC-19, TC-12 |
| `YC-11` | Chia trường thành hai loại: trích xuất và biên tập, với hai tiêu… | `DA2-03` `DA2-04` `DA2-05` | TC-11–TC-19 |
| `YC-12` | Trường loại trích xuất không có trong tài liệu thì để trống, khô… | `DA2-03` `DA2-04` `DA2-05` | TC-11–TC-19, TC-20, TC-21, TC-22, TC-23, TC-24, TC-25 |
| `YC-13` | Trường loại biên tập được suy luận, nhưng mọi con số phải có tro… | `DA2-03` `DA2-04` `DA2-05` | TC-11–TC-19, TC-26 |
| `YC-14` | Chuẩn hoá tên nguyên liệu: bỏ số thứ tự, bỏ mã nội bộ, bỏ hậu tố | `DA2-03` `DA2-04` `DA2-05` | TC-11–TC-19, TC-13 |
| `YC-15` | Chỉ chọn thẻ lọc từ danh mục có sẵn, không được tạo tên mới | `DA2-03` `DA2-04` `DA2-05` | TC-11–TC-19, TC-27 |
| `YC-16` | Sinh chỉ tiêu kỹ thuật đầy đủ, lấy hết thông số có trong tài liệ… | `DA2-03` `DA2-04` `DA2-05` | TC-11–TC-19, TC-14 |
| `YC-17` | Sinh tiêu đề và mô tả tối ưu tìm kiếm, đúng giới hạn độ dài | `DA2-03` `DA2-04` `DA2-05` | TC-11–TC-19, TC-15 |
| `YC-18` | Sinh ảnh đại diện khi nguyên liệu chưa có ảnh | `DA2-03` `DA2-04` `DA2-05` | TC-11–TC-19, TC-18, TC-19 |
| `YC-19` | Xử lý đúng khi một tài liệu chứa nhiều biến thể sản phẩm | `DA2-03` `DA2-04` `DA2-05` | TC-11–TC-19, TC-29, TC-30 |
| `YC-20` | Kết quả luôn lưu ở trạng thái nháp, không tự xuất bản | `DA2-03` `DA2-04` `DA2-05` | TC-31–TC-36, TC-33 |
| `YC-21` | Chuẩn hoá hình dạng dữ liệu trả về, chấp nhận khác biệt giữa các… | `DA2-03` `DA2-04` `DA2-05` | TC-37, TC-38, TC-39, TC-40 |
| `YC-22` | Không ghi đè dữ liệu cũ bằng giá trị rỗng | `DA2-03` `DA2-04` `DA2-05` | TC-31, TC-31–TC-36, TC-32 |
| `YC-23` | Loại bỏ giá trị không nằm trong danh mục hợp lệ | `DA2-03` `DA2-04` `DA2-05` | TC-28, TC-31–TC-36 |
| `YC-24` | Đánh dấu nguyên liệu do AI sinh là chờ duyệt | `DA2-03` `DA2-04` `DA2-05` | TC-31–TC-36, TC-34 |
| `YC-25` | Phát hiện nguyên liệu trùng hoặc gần trùng tên | `DA2-03` `DA2-04` `DA2-05` | TC-31–TC-36 |
| `YC-26` | Xếp hàng công việc, chạy nền, không chặn giao diện | `DA2-03` `DA2-04` `DA2-05` | TC-41, TC-41–TC-51 |
| `YC-27` | Xử lý hàng loạt: chọn nhiều nguyên liệu hoặc toàn bộ | `DA2-03` `DA2-04` `DA2-05` | TC-41–TC-51, TC-42 |
| `YC-28` | Theo dõi trạng thái từng công việc theo 9 giai đoạn | `DA2-03` `DA2-04` `DA2-05` | TC-41–TC-51, TC-43 |
| `YC-29` | Nhật ký chi tiết từng bước, có mốc thời gian và mức độ | `DA2-03` `DA2-04` `DA2-05` | TC-41–TC-51, TC-44 |
| `YC-30` | Huỷ được công việc đang chạy | `DA2-03` `DA2-04` `DA2-05` | TC-41–TC-51, TC-45 |
| `YC-31` | Đặt hạn giờ cho mỗi tệp, tránh treo hàng đợi | `DA2-03` `DA2-04` `DA2-05` | TC-41–TC-51, TC-47 |
| `YC-32` | Lùi phương án khi lỗi: tệp hỏng thì gọi lại không kèm tệp thay v… | `DA2-03` `DA2-04` `DA2-05` | TC-41–TC-51, TC-48 |
| `YC-33` | Xuất và nhập nội dung dạng tệp để sửa hàng loạt | `DA2-03` `DA2-04` `DA2-05` | TC-41–TC-51 |
| `YC-34` | Đếm số đơn vị đã dùng cho từng công việc | `DA2-03` `DA2-04` `DA2-05` | TC-52, TC-52–TC-58 |
| `YC-35` | Ước tính chi phí ra đô-la và đồng Việt Nam | `DA2-03` `DA2-04` `DA2-05` | TC-52–TC-58, TC-53 |
| `YC-36` | Ghi rõ đang dùng bảng giá dựng sẵn hay giá do người quản trị đặt | `DA2-03` `DA2-04` `DA2-05` | TC-52–TC-58, TC-54, TC-55 |
| `YC-37` | Đổi nhà cung cấp AI ngay trên giao diện, không triển khai lại | `DA2-03` `DA2-04` `DA2-05` | TC-52–TC-58, TC-56 |
| `YC-38` | Đổi mô hình cho từng loại tác vụ: sinh nội dung, đọc ảnh, tạo ản… | `DA2-03` `DA2-04` `DA2-05` | TC-52–TC-58 |
| `YC-39` | Khoá truy cập dịch vụ chỉ quản trị viên đọc/sửa được | `DA2-03` `DA2-04` `DA2-05` | TC-52–TC-58, TC-57 |
| `YC-40` | Bỏ trống ô cấu hình thì lấy từ biến môi trường | `DA2-03` `DA2-04` `DA2-05` | TC-52–TC-58 |

### A.3 Đánh giá

**Độ phủ đầy đủ** — mọi yêu cầu chức năng đều có ít nhất một ca kiểm thử dẫn chiếu tới. Không yêu cầu nào đã cam kết mà thiếu cách kiểm chứng.

---

## 9. Phê duyệt yêu cầu

| Bên | Vai trò | Họ tên | Ngày | Ký |
| :---- | :---- | :---- | :---- | :---- |
| OPTIMAI | Người lập yêu cầu — A Hùng, Product Owner | | | |
| Bioscope | Đại diện bộ phận kỹ thuật sản phẩm | | | |
| Bioscope | Đại diện bộ phận kinh doanh | | | |
| **Bioscope** | **Ban giám đốc phê duyệt yêu cầu** | | | |
| OPTIMAI | Ban giám đốc xác nhận phạm vi thực hiện | | | |
