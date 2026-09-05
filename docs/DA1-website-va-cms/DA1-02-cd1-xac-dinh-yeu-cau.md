<!--HOSO
phu_de: Website Bioscope và Hệ quản trị nội dung
pham_vi: Dự án DA1
ngay_lap: 26/05/2026
phien_ban: 1.1
nguoi_lap: HungDV — Product Owner, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc OPTIMAI và đại diện Công ty Bioscope
lich_su: 1.0 | 26/05/2026 | Ban hành lần đầu — 44 yêu cầu chức năng, 13 yêu cầu phi chức năng
lich_su: 1.1 | 17/08/2026 | Bổ sung nhóm yêu cầu giao diện lập trình cho hệ thống ngoài
-->
# DA1 — CÔNG ĐOẠN 1: XÁC ĐỊNH YÊU CẦU
## Website Bioscope và Hệ quản trị nội dung

---

## 1. Bối cảnh

Bioscope kinh doanh nguyên liệu cho ngành thực phẩm chức năng và mỹ phẩm. Khách hàng là doanh nghiệp sản xuất — họ cần tra cứu thông số kỹ thuật của nguyên liệu, xin tài liệu, hỏi khả năng cung ứng, rồi mới liên hệ đặt hàng.

### 1.1 Hiện trạng trước khi có hệ thống

| Việc | Cách làm cũ | Vấn đề |
| :---- | :---- | :---- |
| Lưu thông tin nguyên liệu | Tệp Word, Excel trên máy từng người, thư mục dùng chung | Nhiều bản, không biết bản nào mới; người nghỉ việc là mất dữ liệu |
| Trả lời khách về nguyên liệu | Nhân viên tra tệp rồi soạn thư trả lời | Chậm, mỗi người trả lời một kiểu |
| Gửi tài liệu kỹ thuật | Đính kèm qua hộp thư | Không biết ai đã nhận gì; tài liệu nội bộ lọt ra ngoài không kiểm soát được |
| Cập nhật trang giới thiệu | Nhờ đơn vị làm web sửa | Chậm nhiều ngày, tốn chi phí mỗi lần sửa |
| Nội dung tiếng Anh | Dịch rời từng đợt | Bản Anh và bản Việt lệch nhau, không ai theo dõi được |
| Biết khách quan tâm gì | Không có cách nào | Kinh doanh đoán mò |

### 1.2 Yêu cầu từ ban giám đốc

Ba mục tiêu, ghi nguyên văn tinh thần cuộc trao đổi:

1. Công ty phải **tự chủ nội dung** — sửa gì trên web thì nhân viên tự sửa, không phụ thuộc bên ngoài.
2. Kho dữ liệu nguyên liệu phải là **tài sản của công ty**, tập trung một chỗ, dùng lại được cho nhiều mục đích.
3. Website phải phục vụ được **khách nước ngoài**, tức là song ngữ thật sự, không phải dịch máy.

---

## 2. Yêu cầu nghiệp vụ

| Mã | Yêu cầu nghiệp vụ | Từ đâu |
| :---- | :---- | :---- |
| NV-01 | Tập trung toàn bộ dữ liệu nguyên liệu về một kho duy nhất, có kiểm soát phiên bản | Ban giám đốc, bộ phận kỹ thuật |
| NV-02 | Nhân viên tự cập nhật nội dung website mà không cần lập trình viên | Ban giám đốc |
| NV-03 | Website song ngữ Việt – Anh phục vụ khách trong và ngoài nước | Ban giám đốc, kinh doanh |
| NV-04 | Kiểm soát việc phát tài liệu kỹ thuật: biết ai tải gì | Bộ phận kinh doanh |
| NV-05 | Dữ liệu nguyên liệu dùng lại được cho hệ thống khác của công ty | Bộ phận kỹ thuật |
| NV-06 | Nắm được khách quan tâm nội dung nào để định hướng kinh doanh | Bộ phận kinh doanh |
| NV-07 | Khách liên hệ được ngay khi đang xem trang | Bộ phận kinh doanh |
| NV-08 | Bảo vệ dữ liệu nội bộ và dữ liệu cá nhân của khách | Ban giám đốc |

---

## 3. Yêu cầu chức năng

### 3.1 Quản trị nội dung

| Mã | Yêu cầu | Nghiệp vụ gốc | Mức ưu tiên |
| :---- | :---- | :---- | :---- |
| YC-01 | Quản lý nguyên liệu: thêm, sửa, xoá, tìm kiếm, phân loại | NV-01 | Bắt buộc |
| YC-02 | Mỗi nguyên liệu có đủ trường kỹ thuật: tên khoa học, xuất xứ, quy cách, chỉ tiêu, công dụng, tài liệu đính kèm | NV-01 | Bắt buộc |
| YC-03 | Nội dung có trạng thái nháp và đã xuất bản; nháp không hiện ra ngoài | NV-02 | Bắt buộc |
| YC-04 | Xem trước nội dung nháp đúng như khi đã xuất bản | NV-02 | Bắt buộc |
| YC-05 | Lưu lịch sử phiên bản, khôi phục được bản cũ | NV-01 | Bắt buộc |
| YC-06 | Thùng rác: xoá là chuyển vào thùng rác, khôi phục được | NV-01 | Bắt buộc |
| YC-07 | Quản lý bài viết bản tin, có chủ đề, ngành, thẻ | NV-02 | Bắt buộc |
| YC-08 | Dựng trang tĩnh bằng cách xếp các khối nội dung, không cần lập trình | NV-02 | Bắt buộc |
| YC-09 | Kho ảnh dùng chung, tự động tạo nhiều kích thước | NV-02 | Bắt buộc |
| YC-10 | Cấu hình được thông tin công ty, điều hướng, nhận diện thương hiệu ngay trên giao diện | NV-02 | Bắt buộc |

### 3.2 Đa ngữ

| Mã | Yêu cầu | Nghiệp vụ gốc | Mức ưu tiên |
| :---- | :---- | :---- | :---- |
| YC-11 | Mỗi trường nội dung có bản tiếng Việt và bản tiếng Anh riêng | NV-03 | Bắt buộc |
| YC-12 | Đường dẫn khác nhau theo ngôn ngữ (`/ban-tin` và `/news`) | NV-03 | Bắt buộc |
| YC-13 | Nội dung chưa dịch thì **không hiện** ở trang ngôn ngữ đó, thay vì hiện trang trắng | NV-03 | Bắt buộc |
| YC-14 | Chuyển ngôn ngữ giữ nguyên trang đang xem | NV-03 | Nên có |

### 3.3 Cổng thông tin công khai

| Mã | Yêu cầu | Nghiệp vụ gốc | Mức ưu tiên |
| :---- | :---- | :---- | :---- |
| YC-15 | Trang chủ giới thiệu năng lực, cấu hình được từng khối | NV-02 | Bắt buộc |
| YC-16 | Trang danh sách nguyên liệu có tìm kiếm và bộ lọc | NV-01 | Bắt buộc |
| YC-17 | Danh sách nguyên liệu hiện ngay khi vào trang, không bị banner đẩy xuống dưới | NV-06 | Bắt buộc |
| YC-18 | Trang chi tiết nguyên liệu hiện đủ thông số kỹ thuật | NV-01 | Bắt buộc |
| YC-19 | Trang dịch vụ, công nghệ, chứng nhận, tình huống khách hàng, câu hỏi thường gặp | NV-02 | Bắt buộc |
| YC-20 | Trang bản tin, trang chi tiết bài viết có mục lục bên cạnh | NV-02 | Bắt buộc |
| YC-21 | Khối "bài viết mới" ở trang chủ, cấu hình được tiêu đề, mô tả, số bài; quá số thì chuyển dạng trượt ngang | NV-02 | Nên có |
| YC-22 | Tối ưu công cụ tìm kiếm: thẻ mô tả, dữ liệu có cấu trúc, sơ đồ trang | NV-03 | Bắt buộc |

### 3.4 Cổng khách hàng doanh nghiệp

| Mã | Yêu cầu | Nghiệp vụ gốc | Mức ưu tiên |
| :---- | :---- | :---- | :---- |
| YC-23 | Khách tự đăng ký tài khoản, phân biệt doanh nghiệp và cá nhân | NV-04 | Bắt buộc |
| YC-24 | Đăng nhập bằng thư điện tử và mật khẩu | NV-04 | Bắt buộc |
| YC-25 | Đăng nhập bằng tài khoản Google; chưa có tài khoản thì tự tạo | NV-04 | Nên có |
| YC-26 | Ô mật khẩu có nút hiện/ẩn, thanh đánh giá độ mạnh, ô nhập lại | NV-08 | Nên có |
| YC-27 | Tài liệu có kiểm soát: chỉ tài khoản đã đăng nhập mới tải được | NV-04 | Bắt buộc |
| YC-28 | Ghi nhận lượt tải: ai, tài liệu nào, lúc nào | NV-04 | Bắt buộc |
| YC-29 | Cửa sổ đăng nhập/đăng ký mở ngay tại trang đang xem, không chuyển trang | NV-07 | Nên có |

### 3.5 Giao diện lập trình

| Mã | Yêu cầu | Nghiệp vụ gốc | Mức ưu tiên |
| :---- | :---- | :---- | :---- |
| YC-30 | Cung cấp giao diện lập trình cho hệ thống khác lấy dữ liệu | NV-05 | Bắt buộc |
| YC-31 | Truy cập bằng khoá, mỗi khoá có phạm vi riêng | NV-05, NV-08 | Bắt buộc |
| YC-32 | Chỉ trả về các trường nằm trong danh sách được phép công bố | NV-08 | Bắt buộc |
| YC-33 | Không trả về nội dung nháp, không trả về dữ liệu nội bộ | NV-08 | Bắt buộc |
| YC-34 | Có bản mô tả danh mục dữ liệu để bên tích hợp tự tra | NV-05 | Nên có |

### 3.6 Tương tác khách hàng

| Mã | Yêu cầu | Nghiệp vụ gốc | Mức ưu tiên |
| :---- | :---- | :---- | :---- |
| YC-35 | Khung chat trực tuyến trên web, nhân viên kinh doanh trả lời qua kênh nhắn tin | NV-07 | Bắt buộc |
| YC-36 | Ghi nhận thông tin phiên chat: nguồn truy cập, thiết bị, vị trí ước lượng, trang đã xem | NV-06 | Bắt buộc |
| YC-37 | Biểu mẫu liên hệ, dữ liệu lưu vào hệ thống | NV-07 | Bắt buộc |
| YC-38 | Bình luận bài viết, cấu hình bật/tắt và duyệt trước khi hiển thị | NV-06 | Nên có |

### 3.7 An toàn và phân quyền

| Mã | Yêu cầu | Nghiệp vụ gốc | Mức ưu tiên |
| :---- | :---- | :---- | :---- |
| YC-39 | Phân quyền theo vai trò: quản trị viên, biên tập viên, khách hàng | NV-08 | Bắt buộc |
| YC-40 | Ghi nhật ký thao tác trên dữ liệu quan trọng | NV-08 | Bắt buộc |
| YC-41 | Giới hạn số lần gọi theo địa chỉ để chống lạm dụng | NV-08 | Bắt buộc |
| YC-42 | Chặn địa chỉ có hành vi xấu | NV-08 | Nên có |
| YC-43 | Xin phép trước khi dùng dữ liệu cá nhân, ghi nhật ký đồng ý | NV-08 | Bắt buộc |
| YC-44 | Bí mật không nằm trong mã nguồn | NV-08 | Bắt buộc |

---

## 4. Yêu cầu phi chức năng

| Mã | Loại | Yêu cầu | Cách đo |
| :---- | :---- | :---- | :---- |
| PC-01 | Tốc độ | Trang công khai hiện nội dung chính trong 3 giây trên đường truyền 10 Mbps | Đo bằng công cụ đo hiệu năng trang |
| PC-02 | Tốc độ | Thao tác trong hệ quản trị phản hồi dưới 2 giây với dữ liệu thật | Bấm giờ thủ công |
| PC-03 | Tốc độ | Giao diện lập trình trả kết quả dưới 500 mili giây cho truy vấn thường | Đo thời gian gọi |
| PC-04 | Khả dụng | Hệ thống tự khởi động lại khi máy chủ khởi động lại | Thử khởi động lại máy chủ |
| PC-05 | Khả dụng | Sao lưu được cơ sở dữ liệu và tệp tải lên | Chạy thử sao lưu và khôi phục |
| PC-06 | Bảo mật | Toàn bộ lưu lượng đi qua kết nối mã hoá | Kiểm chứng chỉ |
| PC-07 | Bảo mật | Mật khẩu lưu dạng băm, không lưu dạng đọc được | Xem cơ sở dữ liệu |
| PC-08 | Bảo mật | Dữ liệu cá nhân (thư điện tử, địa chỉ mạng) không lộ qua giao diện công khai | Kiểm thử âm |
| PC-09 | Tương thích | Hiển thị đúng trên điện thoại, máy tính bảng, máy tính | Kiểm trên ba cỡ màn hình |
| PC-10 | Tương thích | Chạy đúng trên các trình duyệt phổ biến bản mới | Kiểm chéo trình duyệt |
| PC-11 | Tiếp cận | Thao tác được bằng bàn phím, có viền khi lấy tiêu điểm | Kiểm bằng phím Tab |
| PC-12 | Bảo trì | Thay đổi cấu trúc dữ liệu bằng kịch bản kiểm chứng, không sửa tay | Xem quy trình `00-5` |
| PC-13 | Mở rộng | Thêm loại nội dung mới không phải sửa mã nền | Thử thêm một loại nội dung |

---

## 5. Tiêu chí nghiệm thu

Sản phẩm được coi là đạt khi thoả **toàn bộ** các điều kiện sau:

| # | Tiêu chí | Cách kiểm |
| :---- | :---- | :---- |
| 1 | Toàn bộ yêu cầu mức "Bắt buộc" đã dựng và chạy được | Đối chiếu bảng ca kiểm thử ở `DA1-07` |
| 2 | Biên tập viên tự thêm được một nguyên liệu mới, xuất bản, và thấy nó trên trang công khai — không cần lập trình viên | Nghiệm thu thực tế |
| 3 | Nội dung song ngữ hiển thị đúng ở cả hai ngôn ngữ | Nghiệm thu thực tế |
| 4 | Bài viết chỉ có một ngôn ngữ thì không hiện ở trang ngôn ngữ còn lại | Ca kiểm thử âm |
| 5 | Khách chưa đăng nhập không tải được tài liệu có kiểm soát | Ca kiểm thử âm |
| 6 | Giao diện lập trình không trả về nội dung nháp và không trả về dữ liệu nội bộ | Ca kiểm thử âm |
| 7 | Toàn bộ trang công khai đạt yêu cầu tốc độ PC-01 | Đo hiệu năng |
| 8 | Không có bí mật nào nằm trong mã nguồn | Rà soát kho mã nguồn |
| 9 | Dựng bản phát hành thành công, không lỗi | Chạy lệnh dựng |
| 10 | Khôi phục được hệ thống từ bản sao lưu | Diễn tập khôi phục |

---

## 6. Phạm vi loại trừ

Dứt khoát **không làm** trong phạm vi DA1:

| Không làm | Lý do |
| :---- | :---- |
| Bán hàng trực tuyến, giỏ hàng, thanh toán | Mô hình kinh doanh là bán buôn qua thương lượng, không bán lẻ |
| Quản lý kho, tồn kho, đơn hàng | Thuộc hệ thống quản trị doanh nghiệp, không thuộc website |
| Ứng dụng di động riêng | Website đáp ứng được trên điện thoại; chưa đủ nhu cầu để làm ứng dụng riêng |
| Dịch tự động nội dung | Nội dung kỹ thuật cần dịch có kiểm soát, không dịch máy |
| Trợ lý hội thoại AI | Thuộc DA3 |
| Sinh nội dung nguyên liệu bằng AI | Thuộc DA2 |

---

## 7. Ràng buộc

| Loại | Ràng buộc |
| :---- | :---- |
| Nhân lực | Đội nội bộ quy mô nhỏ; thiết kế phải đơn giản để một người bảo trì được |
| Ngân sách | Ưu tiên thư viện mã nguồn mở, hạn chế dịch vụ trả phí định kỳ |
| Hạ tầng | Một máy chủ; không dùng dịch vụ đám mây quản lý đắt tiền |
| Thời gian | Cổng thông tin phải chạy được trong quý III/2026 |
| Dữ liệu | Dữ liệu nguyên liệu là tài sản công ty, không được để lộ trường nội bộ ra ngoài |

---

## 8. Phê duyệt yêu cầu

| Vai trò | Họ tên | Ý kiến | Ngày | Ký |
| :---- | :---- | :---- | :---- | :---- |
| Người lập yêu cầu | | | | |
| Đại diện bộ phận kinh doanh | | | | |
| Đại diện bộ phận kỹ thuật | | | | |
| Ban giám đốc phê duyệt | | | | |
