<!--HOSO
phu_de: Hệ thống AI chuẩn hoá và cập nhật dữ liệu sản phẩm
pham_vi: Dự án DA2
ngay_lap: 10/08/2026
phien_ban: 1.1
nguoi_lap: Thu — QA, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc OPTIMAI và đại diện Công ty Bioscope
lich_su: 1.0 | 10/08/2026 | Ban hành bộ ca kiểm thử — 58 ca
lich_su: 1.1 | 24/08/2026 | Bổ sung quy trình kiểm thử đối chiếu tài liệu gốc
-->
# DA2 — CÔNG ĐOẠN 4: KIỂM TRA, THỬ NGHIỆM VÀ NGHIỆM THU
## Hệ thống AI chuẩn hoá và cập nhật dữ liệu sản phẩm

---

## 1. Chiến lược kiểm thử

### 1.1 Vì sao DA2 phải kiểm thử khác DA1

| | DA1 | DA2 |
| :---- | :---- | :---- |
| Đầu ra | **Xác định** — cùng đầu vào cho cùng đầu ra | **Không xác định** — mô hình có thể trả kết quả khác nhau |
| Cách kiểm | Chạy một lần, so kết quả với kỳ vọng | Phải chạy **nhiều lần trên nhiều dữ liệu thật** |
| Tiêu chí đạt | Đúng hoặc sai | Đúng, hoặc **để trống đúng cách** |
| Rủi ro chính | Chức năng không chạy | **Chạy được nhưng cho ra dữ liệu bịa** |

Dòng cuối là điều làm DA2 khác biệt: **một dây chuyền chạy trơn tru vẫn có thể là dây chuyền hỏng**, nếu nó điền vào những trường mà tài liệu không hề ghi.

### 1.2 Năm lớp kiểm thử

| Lớp | Nội dung | Cách chạy |
| :---- | :---- | :---- |
| Kiểm tra tĩnh | Kiểu dữ liệu, soát lỗi, dựng bản phát hành | Tự động |
| Kiểm thử chức năng | Từng bước của dây chuyền chạy đúng | Thủ công theo ca |
| **Kiểm thử đối chiếu tài liệu gốc** | **Từng trường loại A khớp tài liệu, hoặc để trống** | Thủ công, mục 4 |
| Kiểm thử chịu lỗi | Tệp hỏng, dịch vụ lỗi, quá hạn giờ | Thủ công, có gây lỗi chủ ý |
| Nghiệm thu người dùng | Biên tập viên dùng thật trên nguyên liệu thật | Bộ phận nghiệp vụ |

Lớp thứ ba là lớp quan trọng nhất và cũng là lớp tốn công nhất. Không có cách nào tự động hoá nó — phải có người mở tài liệu gốc ra đối chiếu.

---

## 2. Kết quả kiểm tra tĩnh

| Kiểm tra | Kết quả |
| :---- | :---- |
| Kiểm kiểu — hệ quản trị | **39 cảnh báo**, đúng bằng mức nền |
| Dựng bản phát hành | **Thành công** |
| Rà soát khoá bí mật trong mã nguồn | **Không có** |
| Rà soát khoá bí mật trong nhật ký công việc | **Không có** |

---

## 3. Bộ ca kiểm thử chức năng

### 3.1 Thu thập và bóc tách

*Kiểm chứng: `YC-01` `YC-02` `YC-03` `YC-04` `YC-05` `YC-06` `YC-07` `YC-08`*

| Mã ca | Yêu cầu | Điều kiện đầu | Các bước | Kết quả mong đợi | Thật |
| :---- | :---- | :---- | :---- | :---- | :---- |
| TC-01 | YC-01 | Có thư mục kho tài liệu | Chạy đồng bộ | Liệt kê đúng số tệp | ☐ |
| TC-02 | YC-02 | Như trên | Xem thẻ Đồng bộ của nguyên liệu | Danh sách tệp và thời điểm đồng bộ đúng | ☐ |
| TC-03 | YC-03 | Nguyên liệu có PDF dạng chữ | Chạy dây chuyền | Nội dung PDF được đọc | ☐ |
| TC-04 | YC-04 | Nguyên liệu có **PDF scan** | Chạy dây chuyền | Đọc được chữ trong ảnh scan | ☐ |
| TC-05 | YC-04 | Nguyên liệu có **ảnh chụp** hồ sơ | Chạy dây chuyền | Đọc được | ☐ |
| TC-06 | YC-05 | Có Google Docs | Chạy dây chuyền | Đọc được | ☐ |
| TC-07 | YC-05 | Có Google Sheets | Chạy dây chuyền | Đọc được | ☐ |
| TC-08 | YC-06 | Có tệp CSV | Chạy dây chuyền | Đọc được | ☐ |
| TC-09 **(âm)** | YC-01 | Nguyên liệu **không có tệp nào** | Bấm Tạo nội dung | Cảnh báo 0 tệp nguồn trước khi chạy | ☐ |
| TC-10 | YC-07 | Có tệp bảng danh sách nguyên liệu | Nhập tệp bảng | Tạo đúng số nguyên liệu | ☐ |

### 3.2 Sinh nội dung

*Kiểm chứng: `YC-09` `YC-10` `YC-11` `YC-12` `YC-13` `YC-14` `YC-15` `YC-16` `YC-17` `YC-18` `YC-19`*

| Mã ca | Yêu cầu | Điều kiện đầu | Các bước | Kết quả mong đợi | Thật |
| :---- | :---- | :---- | :---- | :---- | :---- |
| TC-11 | YC-09 | Nguyên liệu có hồ sơ đầy đủ | Chạy dây chuyền | Sinh đủ 20 nhóm trường | ☐ |
| TC-12 | YC-10 | Như trên | Kiểm từng trường ngôn ngữ | **Cả tiếng Việt và tiếng Anh đều có** | ☐ |
| TC-13 | YC-14 | Nguyên liệu tên `1. Đường Erythritol - TQ(TM)` | Chạy dây chuyền | Tên chuẩn hoá thành `Đường Erythritol` | ☐ |
| TC-14 | YC-16 | Hồ sơ có 20 dòng thông số | Chạy dây chuyền | Lấy hết, không cắt còn 3–6 dòng | ☐ |
| TC-15 | YC-17 | — | Kiểm phần tối ưu tìm kiếm | Tiêu đề ≤ 60 ký tự, mô tả 120–155 ký tự, cả hai ngôn ngữ | ☐ |
| TC-16 | YC-09 | — | Kiểm mô tả | 250–400 từ, 2–3 đoạn | ☐ |
| TC-17 | YC-09 | — | Kiểm lợi ích và ứng dụng | Lợi ích 4–8 mục, ứng dụng 3–6 mục | ☐ |
| TC-18 | YC-18 | Nguyên liệu chưa có ảnh | Chạy chế độ đầy đủ | Sinh ảnh đại diện | ☐ |
| TC-19 | YC-18 | Nguyên liệu **đã có** ảnh thật | Chạy chế độ đầy đủ | **Không đè lên ảnh thật** | ☐ |

### 3.3 Chống bịa dữ liệu — nhóm ca quan trọng nhất

Toàn bộ nhóm này là **ca âm**: kiểm rằng hệ thống **không** làm điều nó không được phép làm.

| Mã ca | Yêu cầu | Điều kiện đầu | Các bước | Kết quả mong đợi | Thật |
| :---- | :---- | :---- | :---- | :---- | :---- |
| TC-20 **(âm)** | YC-12 | Hồ sơ **không ghi mã CAS** | Chạy dây chuyền | Trường mã CAS **để trống**, không có giá trị nào | ☐ |
| TC-21 **(âm)** | YC-12 | Hồ sơ **không ghi mã HS** | Chạy dây chuyền | Trường mã HS **để trống** | ☐ |
| TC-22 **(âm)** | YC-12 | Hồ sơ **không ghi hạn dùng** | Chạy dây chuyền | Trường hạn dùng **để trống** | ☐ |
| TC-23 **(âm)** | YC-12 | Hồ sơ **không ghi số công bố** | Chạy dây chuyền | Trường số công bố **để trống** | ☐ |
| TC-24 **(âm)** | YC-12 | Hồ sơ **không nêu trạng thái pháp lý** | Chạy dây chuyền | Trường trạng thái pháp lý **rỗng** | ☐ |
| TC-25 **(âm)** | YC-12 | Hồ sơ **không nêu chứng nhận nào** | Chạy dây chuyền | Huy hiệu là **mảng rỗng** | ☐ |
| TC-26 **(âm)** | YC-13 | Hồ sơ **không có con số hiệu quả** | Đọc phần mô tả và lợi ích | **Không có con số nào** kiểu "tăng 47%" | ☐ |
| TC-27 **(âm)** | YC-15 | — | Kiểm thẻ lọc đã gán | Mọi thẻ đều **có trong danh mục**, không có tên lạ | ☐ |
| TC-28 **(âm)** | YC-23 | — | Kiểm trạng thái pháp lý | Chỉ nằm trong 4 giá trị hợp lệ | ☐ |
| TC-29 **(âm)** | YC-19 | Tài liệu chứa **2 biến thể** sản phẩm | Chạy cho biến thể A | Không lấy giá và số lượng tối thiểu của biến thể B | ☐ |
| TC-30 **(âm)** | YC-19 | Tài liệu nhiều biến thể, khó phân biệt | Chạy dây chuyền | **Bảng giá để trống** thay vì đoán | ☐ |

### 3.4 Bảo vệ dữ liệu đã có

*Kiểm chứng: `YC-20` `YC-22` `YC-23` `YC-24` `YC-25`*

| Mã ca | Yêu cầu | Điều kiện đầu | Các bước | Kết quả mong đợi | Thật |
| :---- | :---- | :---- | :---- | :---- | :---- |
| TC-31 **(âm)** | YC-22 | Nguyên liệu **đã có mã CAS** người nhập tay; bộ tệp mới **không** chứa mã CAS | Chạy lại dây chuyền | **Mã CAS cũ được giữ nguyên**, không bị xoá | ☐ |
| TC-32 **(âm)** | YC-22 | Nguyên liệu đã có mô tả người viết | Chạy lại, AI trả mô tả rỗng | Mô tả cũ giữ nguyên | ☐ |
| TC-33 **(âm)** | YC-20 | — | Chạy dây chuyền, kiểm trạng thái nguyên liệu | **Luôn là NHÁP**, không bao giờ tự xuất bản | ☐ |
| TC-34 | YC-24 | — | Sau khi chạy xong | Cờ **Chờ duyệt** được bật | ☐ |
| TC-35 **(âm)** | — | Nguyên liệu **đang ở trạng thái đã xuất bản** | Chạy dây chuyền | Bản đã xuất bản **không đổi**; thay đổi nằm ở bản nháp | ☐ |
| TC-36 **(âm)** | — | — | Kiểm các trường DA2 không được ghi | `slug`, `category`, `partner`, cờ ẩn website **không đổi** | ☐ |

### 3.5 Chuẩn hoá kết quả

| Mã ca | Yêu cầu | Điều kiện đầu | Các bước | Kết quả mong đợi | Thật |
| :---- | :---- | :---- | :---- | :---- | :---- |
| TC-37 | YC-21 | Đổi sang mô hình khác | Chạy dây chuyền | Kết quả vẫn ghi đúng, không lỗi hình dạng | ☐ |
| TC-38 | YC-21 | Mô hình trả trường song ngữ dạng **chuỗi đơn** | Chạy dây chuyền | Nhân đôi thành hai ngôn ngữ, không lỗi | ☐ |
| TC-39 | YC-21 | Mô hình trả nhóm kỹ thuật dạng **phẳng** | Chạy dây chuyền | Gom đúng thành nhóm | ☐ |
| TC-40 | YC-21 | Mô hình trả danh sách chứa **đối tượng** thay vì chuỗi | Chạy dây chuyền | Lấy đúng phần chữ | ☐ |

### 3.6 Vận hành và chịu lỗi

*Kiểm chứng: `YC-26` `YC-27` `YC-28` `YC-29` `YC-30` `YC-31` `YC-32` `YC-33`*

| Mã ca | Yêu cầu | Điều kiện đầu | Các bước | Kết quả mong đợi | Thật |
| :---- | :---- | :---- | :---- | :---- | :---- |
| TC-41 | YC-26 | — | Bấm Tạo nội dung | Giao diện **không bị treo**, dùng tiếp được | ☐ |
| TC-42 | YC-27 | Chọn 20 nguyên liệu | Sinh hàng loạt | Xếp đủ 20 việc, chạy tuần tự | ☐ |
| TC-43 | YC-28 | Đang chạy một việc | Xem bảng hàng đợi | Trạng thái đổi qua đủ các bước | ☐ |
| TC-44 | YC-29 | Việc đã xong | Mở nhật ký | Có dòng cho từng bước, có mốc thời gian |☐ |
| TC-45 | YC-30 | Việc đang chờ | Bấm Huỷ | Việc chuyển sang trạng thái huỷ, không chạy | ☐ |
| TC-46 **(âm)** | PC-03 | Một tệp **cố ý làm hỏng** | Chạy dây chuyền | Ghi cảnh báo, **bỏ qua tệp đó**, vẫn hoàn thành | ☐ |
| TC-47 **(âm)** | YC-31 | Tệp rất lớn, quá hạn giờ | Chạy dây chuyền | Huỷ tệp đó, tiếp tục, không treo hàng đợi | ☐ |
| TC-48 **(âm)** | YC-32 | Tệp gây lỗi máy chủ ở dịch vụ | Chạy dây chuyền | **Gọi lại không kèm tệp**, vẫn có kết quả | ☐ |
| TC-49 **(âm)** | PC-04 | Ba việc lỗi liên tiếp | Xếp việc thứ tư | Việc thứ tư **vẫn chạy**, hàng đợi không kẹt | ☐ |
| TC-50 **(âm)** | — | Cấu hình khoá dịch vụ **sai** | Chạy dây chuyền | Báo lỗi rõ ràng, không treo | ☐ |
| TC-51 **(âm)** | — | **Chưa có khoá tạo ảnh** | Chạy chế độ đầy đủ | Phần nội dung **vẫn xong**; chỉ báo lỗi ở bước ảnh | ☐ |

### 3.7 Chi phí và cấu hình

*Kiểm chứng: `YC-34` `YC-35` `YC-36` `YC-37` `YC-38` `YC-39` `YC-40`*

| Mã ca | Yêu cầu | Điều kiện đầu | Các bước | Kết quả mong đợi | Thật |
| :---- | :---- | :---- | :---- | :---- | :---- |
| TC-52 | YC-34 | Việc đã xong | Xem bộ đếm | Có số đơn vị của từng loại tác vụ | ☐ |
| TC-53 | YC-35 | Như trên | Xem chi phí | Có cả **đô-la và đồng** | ☐ |
| TC-54 | YC-36 | Chưa đặt đơn giá riêng | Xem chi phí | Ghi rõ **đang dùng bảng giá dựng sẵn** | ☐ |
| TC-55 | YC-36 | Đặt đơn giá riêng | Xem chi phí | Ghi rõ đang dùng đơn giá đã đặt, tính theo đó | ☐ |
| TC-56 | YC-37 | — | Đổi mô hình trên giao diện, lưu, chạy ngay | **Dùng mô hình mới, không cần khởi động lại** | ☐ |
| TC-57 **(âm)** | YC-39 | Đăng nhập vai trò **biên tập viên** | Mở Cài đặt AI | **Đọc được, không sửa được** | ☐ |
| TC-58 **(âm)** | PC-10 | Việc đã xong | Đọc toàn bộ nhật ký | **Không có khoá dịch vụ nào trong nhật ký** | ☐ |

---

## 4. Kiểm thử đối chiếu tài liệu gốc

Đây là kiểm thử đặc thù của DA2 và là bằng chứng chất lượng quan trọng nhất.

### 4.1 Cách làm

1. Chọn ngẫu nhiên **10 nguyên liệu** đã chạy dây chuyền
2. Với mỗi nguyên liệu, mở **toàn bộ tệp nguồn** ở thẻ Đồng bộ
3. Lập bảng đối chiếu từng trường loại A
4. Ghi vào một trong bốn kết quả

### 4.2 Bốn kết quả có thể

| Kết quả | Nghĩa | Đánh giá |
| :---- | :---- | :---- |
| **Khớp** | Tài liệu có, hệ thống chép đúng | ✅ Đúng |
| **Trống đúng** | Tài liệu không có, hệ thống để trống | ✅ Đúng |
| **Thiếu** | Tài liệu có, hệ thống bỏ sót | ⚠ Chấp nhận được — người duyệt bổ sung |
| **BỊA** | **Tài liệu không có, hệ thống điền vào** | ❌ **LỖI NGHIÊM TRỌNG** |

### 4.3 Ngưỡng đạt

| Chỉ số | Ngưỡng |
| :---- | :---- |
| Tỉ lệ **bịa** | **0%** — không có ngoại lệ |
| Tỉ lệ **khớp** | ≥ 85% trên các trường tài liệu có ghi |
| Tỉ lệ **thiếu** | ≤ 15% |

**Tỉ lệ bịa phải bằng 0.** Đây không phải chỉ tiêu thống kê mà là điều kiện tiên quyết: một trường bịa lọt qua nghĩa là cơ chế chống bịa không hoạt động, và mọi con số khác trở nên không đáng tin.

### 4.4 Bảng ghi kết quả

| Nguyên liệu | Trường kiểm | Tài liệu có? | Hệ thống điền? | Kết quả |
| :---- | :---- | :----: | :----: | :---- |
| | mã CAS | ☐ | ☐ | |
| | mã HS | ☐ | ☐ | |
| | hàm lượng | ☐ | ☐ | |
| | hạn dùng | ☐ | ☐ | |
| | bảo quản | ☐ | ☐ | |
| | đóng gói | ☐ | ☐ | |
| | trạng thái pháp lý | ☐ | ☐ | |
| | số công bố | ☐ | ☐ | |
| | huy hiệu chứng nhận | ☐ | ☐ | |
| | bảng giá | ☐ | ☐ | |
| | chỉ tiêu (từng dòng) | ☐ | ☐ | |

*(Nhân bản bảng này cho từng nguyên liệu trong mẫu 10.)*

### 4.5 Tổng hợp

| Chỉ số | Số lượng | Tỉ lệ |
| :---- | :---- | :---- |
| Tổng số trường kiểm | | |
| Khớp | | |
| Trống đúng | | |
| Thiếu | | |
| **Bịa** | | **phải là 0** |

---

## 5. Kiểm thử phi chức năng

| Mã ca | Yêu cầu | Cách đo | Ngưỡng | Thật |
| :---- | :---- | :---- | :---- | :---- |
| TC-59 | PC-01 | Bấm giờ trên nguyên liệu có 5 tệp | < 15 phút | ☐ |
| TC-60 | PC-02 | Xem cấu hình hạn giờ | Mặc định 150 giây | ☐ |
| TC-61 | PC-11 | Đối chiếu ước tính với hoá đơn nhà cung cấp một tháng | Lệch < 10% | ☐ |
| TC-62 | PC-08 | Rà soát kho mã nguồn | Không có khoá | ☐ |
| TC-63 | PC-12 | Đổi mô hình, chạy lại | Không cần triển khai lại | ☐ |

---

## 6. Nhật ký lỗi phát hiện qua kiểm thử

| # | Dấu hiệu | Nguyên nhân thật | Cách sửa |
| :---- | :---- | :---- | :---- |
| L-01 | Cửa sổ sinh nội dung không hiện | Thành phần chưa xuất ra đúng cách | Sửa khai báo xuất |
| L-02 | Bộ điều phối không truy cập được cơ sở dữ liệu | Đọc biến toàn cục chưa được gán | Truyền đối tượng truy cập từ ngữ cảnh yêu cầu |
| L-03 | Nhãn chỉ tiêu ghi vào dạng chuỗi JSON | Ghi thẳng đối tượng song ngữ | Ghi từng ngôn ngữ riêng |
| L-04 | Lỗi tạo ảnh không hiện ra | Nuốt lỗi ở tầng dưới | Đưa lỗi lên nhật ký công việc |
| L-05 | Báo `Specs N > Label` không rõ nguyên nhân | Mô hình trả nhãn khi chuỗi khi đối tượng | Ghi tạm hình dạng thật để chẩn đoán, rồi viết lớp chuẩn hoá |
| L-06 | Lỗi ghi chỉ tiêu làm hỏng cả công việc | Không tách lỗi từng phần | Lỗi ghi chỉ tiêu không làm hỏng công việc |
| L-07 | Chỉ tiêu cũ lẫn với chỉ tiêu mới | Không xoá trước khi ghi | Xoá chỉ tiêu cũ trong lượt ghi chính |
| L-08 | Khung nhật ký báo "Chưa có log" dù đã lưu | Đọc sai nguồn dữ liệu | Sửa đường đọc |
| L-09 | Chất lượng ảnh không đồng đều | Mỗi họ mô hình hiểu tham số chất lượng khác nhau | Chuẩn hoá theo họ mô hình |
| L-10 | Lợi ích và ứng dụng chỉ vào một ngôn ngữ | Bỏ sót khi ghi danh sách song ngữ | Ghi cả hai ngôn ngữ |
| L-11 | Không đọc được tệp, báo lỗi chung chung | Nuốt lý do thật | Hiện lý do thật |
| L-12 | Không nhận ra Google Docs nhập từ tệp bảng | Kiểu nội dung ghi dạng rút gọn | Nhận thêm dạng rút gọn |
| L-13 | Ảnh sinh ra không liên quan nguyên liệu | Mô tả ảnh dựng từ tên suông | Dựng từ nội dung thật |
| L-14 | Lỗi máy chủ từ dịch vụ, không rõ nguyên nhân | Thông báo lỗi quá chung | Bòn thêm mã trạng thái, loại, mã lỗi, tham số |
| L-15 | Bảng biểu trong tài liệu mất cấu trúc | Trích chữ trước khi gửi | **Gửi thẳng tệp cho mô hình** |
| L-16 | Bỏ trích chữ xong, tệp hỏng làm mất cả công việc | Không còn gì để lùi về | **Gọi lại không kèm tệp** |

**16 lỗi, phần lớn thuộc một loại:** hình dạng dữ liệu mô hình trả về không như dự đoán. Đây là đặc trưng của việc phát triển hệ thống dùng mô hình ngôn ngữ, và là lý do lớp chuẩn hoá tồn tại.

---

## 7. Biên bản nghiệm thu

**Tên sản phẩm:** Hệ thống AI chuẩn hoá và cập nhật dữ liệu sản phẩm (DA2)

**Phiên bản nghiệm thu:** ..............................

**Thời gian nghiệm thu:** từ ................. đến .................

**Mẫu nghiệm thu:** ......... nguyên liệu thật

### 7.1 Đối chiếu tiêu chí

| # | Tiêu chí (theo `DA2-02` mục 5) | Đạt | Không đạt | Ghi chú |
| :---- | :---- | :----: | :----: | :---- |
| 1 | Toàn bộ yêu cầu "Bắt buộc" đã dựng và chạy được | ☐ | ☐ | |
| 2 | Chạy trên 10 nguyên liệu thật, kết quả dùng được sau khi duyệt | ☐ | ☐ | |
| 3 | **Không có trường trích xuất nào bị bịa** | ☐ | ☐ | |
| 4 | Trường không có trong tài liệu được để trống | ☐ | ☐ | |
| 5 | Kết quả **luôn** ở trạng thái nháp | ☐ | ☐ | |
| 6 | AI trả rỗng thì dữ liệu cũ **không bị xoá** | ☐ | ☐ | |
| 7 | Đọc được PDF scan và ảnh | ☐ | ☐ | |
| 8 | Xử lý hàng loạt 20 nguyên liệu không kẹt | ☐ | ☐ | |
| 9 | Ước tính chi phí khớp hoá đơn trong 10% | ☐ | ☐ | |
| 10 | Đổi mô hình có hiệu lực ngay | ☐ | ☐ | |
| 11 | Không có khoá dịch vụ trong mã và nhật ký | ☐ | ☐ | |
| 12 | Thời gian mỗi nguyên liệu dưới 30 phút gồm cả duyệt | ☐ | ☐ | |

### 7.2 Đánh giá hiệu quả

| Chỉ số | Trước | Sau | Cải thiện |
| :---- | :---- | :---- | :---- |
| Thời gian mỗi nguyên liệu | 2–3,5 giờ | ......... | ......... |
| Số nguyên liệu xử lý mỗi ngày | ......... | ......... | ......... |
| Chi phí gọi dịch vụ mỗi nguyên liệu | 0 | ......... đồng | |
| Tỉ lệ trường người duyệt phải sửa | — | ......... % | |

### 7.3 Kết luận

☐ **Đạt** — đồng ý đưa vào vận hành

☐ **Đạt có điều kiện** — khắc phục sau: ..................................................

☐ **Không đạt** — lý do: ..................................................

> **Điều kiện tiên quyết:** mục 3 của bảng 7.1 — không có trường trích xuất nào bị bịa — **không được phép "đạt có điều kiện"**. Mục này không đạt thì toàn bộ nghiệm thu không đạt.

### 7.4 Ký xác nhận

| Bên | Vai trò | Họ tên | Ngày | Ký |
| :---- | :---- | :---- | :---- | :---- |
| OPTIMAI | Người kiểm thử — Thu, QA | | | |
| OPTIMAI | Team phát triển — Quân | | | |
| **Bioscope** | **Đại diện bộ phận kỹ thuật sản phẩm** | | | |
| Bioscope | Đại diện bộ phận kinh doanh | | | |
| **Bioscope** | **Đại diện nghiệm thu** | | | |
| **Bioscope** | **Ban giám đốc xác nhận nghiệm thu** | | | |
| OPTIMAI | Ban giám đốc bàn giao | | | |

Chữ ký của bộ phận kỹ thuật sản phẩm là bắt buộc, vì đây là bộ phận đủ chuyên môn để xác nhận tính chính xác của thông số kỹ thuật được trích.
