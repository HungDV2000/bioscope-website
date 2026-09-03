<!--HOSO
phu_de: Website Bioscope và Hệ quản trị nội dung
pham_vi: Dự án DA1
ngay_lap: 20/08/2026
phien_ban: 1.1
nguoi_lap: Bộ phận Phát triển phần mềm — Công ty Bioscope
nguoi_duyet: Ban Giám đốc
lich_su: 1.0 | 20/08/2026 | Ban hành bộ ca kiểm thử — 62 ca
lich_su: 1.1 | 03/09/2026 | Bổ sung kết quả kiểm chứng hệ thống bình luận
-->
# DA1 — CÔNG ĐOẠN 4: KIỂM TRA, THỬ NGHIỆM VÀ NGHIỆM THU
## Website Bioscope và Hệ quản trị nội dung

---

## 1. Chiến lược kiểm thử

### 1.1 Bốn lớp

| Lớp | Nội dung | Cách chạy | Tần suất |
| :---- | :---- | :---- | :---- |
| Kiểm tra tĩnh | Kiểm kiểu dữ liệu, soát lỗi cú pháp, dựng bản phát hành | Tự động | Mỗi lần ghi nhận thay đổi |
| Kiểm thử chức năng | Chạy theo bộ ca kiểm thử | Thủ công | Mỗi đợt tính năng |
| Kiểm thử phi chức năng | Tốc độ, bảo mật, đa ngữ, màn hình nhỏ, tiếp cận | Thủ công + công cụ đo | Trước mỗi lần phát hành |
| Nghiệm thu người dùng | Bộ phận nghiệp vụ dùng thử trên dữ liệu thật | Thủ công | Cuối mỗi đợt |

### 1.2 Nguyên tắc: bắt buộc có ca kiểm thử âm

Ca thử "làm đúng thì chạy được" chỉ chứng minh một nửa. Ca thử **"làm sai thì bị chặn đúng chỗ"** mới là ca có giá trị — đó là nơi phần mềm thường hỏng và cũng là nơi kẻ tấn công nhắm vào.

Trong bộ ca dưới đây, ca âm được đánh dấu **(âm)**.

---

## 2. Kết quả kiểm tra tĩnh

| Kiểm tra | Kết quả | Ghi chú |
| :---- | :---- | :---- |
| Kiểm kiểu — cổng thông tin | **0 lỗi** | |
| Kiểm kiểu — hệ quản trị | **39 cảnh báo** | Đúng bằng mức nền, không phát sinh mới. Toàn bộ nằm trong mã thư viện nền |
| Dựng — cổng thông tin | **Thành công**, 98/98 trang dựng sẵn | |
| Dựng — hệ quản trị | **Thành công** | |

---

## 3. Bộ ca kiểm thử chức năng

### 3.1 Quản trị nội dung

| Mã ca | Yêu cầu | Điều kiện đầu | Các bước | Kết quả mong đợi | Kết quả thật |
| :---- | :---- | :---- | :---- | :---- | :---- |
| TC-01 | YC-01 | Đăng nhập biên tập viên | Mở Nguyên liệu → Thêm mới → điền tên → Lưu | Tạo được bản ghi, hiện trong danh sách | ☐ |
| TC-02 **(âm)** | YC-01 | Đăng nhập biên tập viên | Thêm mới → bỏ trống Tên → Lưu | Chặn lưu, báo lỗi ngay dưới ô Tên, không tạo bản ghi | ☐ |
| TC-03 | YC-03 | Có 1 nguyên liệu ở trạng thái nháp | Mở trang danh sách nguyên liệu trên web công khai | Nguyên liệu nháp **không** xuất hiện | ☐ |
| TC-04 **(âm)** | YC-03 | Có 1 nguyên liệu nháp, biết đường dẫn | Truy cập thẳng đường dẫn nguyên liệu nháp, chưa đăng nhập | Trả về trang không tìm thấy | ☐ |
| TC-05 | YC-04 | Đăng nhập biên tập viên, có bản nháp | Bấm Xem trước | Hiện đúng nội dung nháp, đúng bố cục như khi xuất bản | ☐ |
| TC-06 | YC-05 | Nguyên liệu đã sửa ít nhất 2 lần | Mở tab Phiên bản → chọn bản cũ → Khôi phục | Nội dung trở về bản cũ | ☐ |
| TC-07 | YC-06 | Có 1 nguyên liệu | Xoá nguyên liệu → mở Thùng rác | Bản ghi nằm trong thùng rác, khôi phục được | ☐ |
| TC-08 | YC-08 | Đăng nhập biên tập viên | Tạo trang mới → xếp 3 khối → Xuất bản | Trang hiện trên web đúng thứ tự khối | ☐ |
| TC-09 | YC-09 | Đăng nhập biên tập viên | Tải lên 1 ảnh | Ảnh vào kho, tự sinh các kích thước | ☐ |
| TC-10 | YC-10 | Đăng nhập quản trị viên | Đổi số điện thoại trong Cài đặt website → Lưu | Chân trang web hiện số mới | ☐ |

### 3.2 Đa ngữ

| Mã ca | Yêu cầu | Điều kiện đầu | Các bước | Kết quả mong đợi | Kết quả thật |
| :---- | :---- | :---- | :---- | :---- | :---- |
| TC-11 | YC-11 | Đăng nhập biên tập viên | Mở 1 nguyên liệu → chuyển sang tiếng Anh → sửa Tên → Lưu | Tên tiếng Việt **không đổi**; hai bản độc lập | ☐ |
| TC-12 | YC-12 | Có bài viết đã xuất bản cả hai ngôn ngữ | Mở `/ban-tin` và `/news` | Cả hai đường dẫn hoạt động, nội dung đúng ngôn ngữ | ☐ |
| TC-13 **(âm)** | YC-13 | Có bài viết **chỉ có** bản tiếng Việt | Mở `/news` | Bài đó **không** xuất hiện trong danh sách | ☐ |
| TC-14 **(âm)** | YC-13 | Như trên | Truy cập thẳng `/news/<slug>` | Trả về trang không tìm thấy, **không** hiện trang trắng | ☐ |
| TC-15 | YC-12 | — | Truy cập đường dẫn cũ `/tai-nguyen/blog-chuyen-mon` | Chuyển hướng mã **308** sang đường dẫn mới, đúng theo ngôn ngữ | ☐ |
| TC-16 | YC-14 | Đang xem 1 trang tiếng Việt | Bấm nút chuyển ngôn ngữ | Sang trang tương ứng tiếng Anh, không về trang chủ | ☐ |

### 3.3 Cổng thông tin công khai

| Mã ca | Yêu cầu | Điều kiện đầu | Các bước | Kết quả mong đợi | Kết quả thật |
| :---- | :---- | :---- | :---- | :---- | :---- |
| TC-17 | YC-17 | Có ≥ 9 nguyên liệu đã xuất bản | Mở `/nguyen-lieu` trên màn hình 1366×768 | Danh sách nguyên liệu **thấy được ngay**, không phải cuộn | ☐ |
| TC-18 | YC-16 | Như trên | Gõ từ khoá vào ô tìm kiếm | Danh sách lọc lại, chỉ còn kết quả khớp | ☐ |
| TC-19 | YC-16 | Như trên | Chọn 1 thẻ lọc | Danh sách lọc theo thuộc tính đã chọn | ☐ |
| TC-20 | YC-18 | Có 1 nguyên liệu đủ dữ liệu | Mở trang chi tiết | Hiện đủ: tên, mô tả, lợi ích, ứng dụng, chỉ tiêu kỹ thuật | ☐ |
| TC-21 **(âm)** | NV-08 | Nguyên liệu đó **có bảng giá** | Mở trang chi tiết khi chưa đăng nhập nhân viên | Bảng giá **không** hiển thị | ☐ |
| TC-22 **(âm)** | NV-08 | Như trên | Gọi `/api/ingredients` bằng lệnh dòng lệnh, không xác thực | Phản hồi **không chứa** trường `pricing` | ☐ |
| TC-23 | YC-21 | Có ≥ 4 bài viết | Đặt khối "Bài viết mới" giới hạn 3 bài | Hiện 3 bài, chuyển sang dạng trượt ngang | ☐ |
| TC-24 | YC-20 | Có bài viết dài, nhiều đầu đề | Mở trang chi tiết bài viết | Mục lục bên cạnh hiện đủ đầu đề; bấm vào nhảy đúng chỗ, tiêu đề không bị thanh đầu trang che | ☐ |
| TC-25 | YC-22 | — | Xem mã nguồn trang | Có thẻ mô tả, dữ liệu có cấu trúc, đường dẫn chuẩn | ☐ |

### 3.4 Cổng khách hàng

| Mã ca | Yêu cầu | Điều kiện đầu | Các bước | Kết quả mong đợi | Kết quả thật |
| :---- | :---- | :---- | :---- | :---- | :---- |
| TC-26 | YC-23 | Chưa có tài khoản | Mở cửa sổ đăng ký → chọn Doanh nghiệp | Hiện thêm ô: tên công ty, mã số thuế, chức vụ | ☐ |
| TC-27 | YC-23 | Như trên | Chọn Cá nhân | Ba ô doanh nghiệp **ẩn đi** | ☐ |
| TC-28 **(âm)** | YC-26 | Đang ở biểu mẫu đăng ký | Nhập mật khẩu 5 ký tự → Đăng ký | Chặn, báo mật khẩu quá ngắn | ☐ |
| TC-29 **(âm)** | YC-26 | Như trên | Nhập hai ô mật khẩu khác nhau → Đăng ký | Chặn, báo mật khẩu nhập lại chưa khớp | ☐ |
| TC-30 | YC-26 | Như trên | Gõ `Password123!` | Thanh độ mạnh **không** báo mức cao nhất — chuỗi này nằm trong danh sách mật khẩu phổ biến | ☐ |
| TC-31 | YC-26 | Như trên | Bấm nút con mắt | Mật khẩu hiện dạng chữ; bấm lại thì ẩn | ☐ |
| TC-32 | YC-26 | Như trên | Từ ô mật khẩu bấm phím Tab | Tiêu điểm sang ô kế tiếp, **không** mắc ở nút con mắt | ☐ |
| TC-33 | YC-29 | Đang xem 1 trang nguyên liệu | Bấm Đăng nhập trên thanh đầu trang → đăng nhập xong | Cửa sổ đóng, **vẫn ở đúng trang nguyên liệu cũ** | ☐ |
| TC-34 | YC-25 | Chưa có tài khoản | Bấm Đăng nhập bằng Google | Tự tạo tài khoản rồi vào, không báo lỗi "chưa đăng ký" | ☐ |
| TC-35 **(âm)** | YC-27 | Có 1 tài liệu kiểm soát, chưa đăng nhập | Bấm Tải | Yêu cầu đăng nhập, **không** tải được tệp | ☐ |
| TC-36 | YC-28 | Đã đăng nhập | Tải 1 tài liệu | Tệp tải về; hệ quản trị ghi nhận: ai, tài liệu nào, lúc nào | ☐ |

### 3.5 Giao diện lập trình

| Mã ca | Yêu cầu | Điều kiện đầu | Các bước | Kết quả mong đợi | Kết quả thật |
| :---- | :---- | :---- | :---- | :---- | :---- |
| TC-37 | YC-30 | Có 1 khoá hợp lệ | Gọi `/api/catalog/ingredients` kèm khoá | Trả về danh sách nguyên liệu | ☐ |
| TC-38 **(âm)** | YC-31 | — | Gọi **không** kèm khoá | Trả về lỗi từ chối truy cập | ☐ |
| TC-39 **(âm)** | YC-31 | Có 1 khoá đã thu hồi | Gọi kèm khoá đó | Trả về lỗi từ chối truy cập | ☐ |
| TC-40 **(âm)** | YC-31 | Khoá chỉ có phạm vi `content` | Gọi điểm truy cập thuộc phạm vi `site` | Trả về lỗi từ chối truy cập | ☐ |
| TC-41 **(âm)** | YC-33 | Có 1 nguyên liệu nháp | Gọi giao diện lập trình danh mục | Nguyên liệu nháp **không** có trong kết quả | ☐ |
| TC-42 **(âm)** | YC-32 | — | Gọi `/api/catalog/site` | **Không** chứa mã theo dõi, không chứa khoá, không chứa dữ liệu nội bộ | ☐ |
| TC-43 **(âm)** | YC-32 | Cấu hình cố ý đưa 1 trường cấm vào danh sách được phép | Khởi động ứng dụng | Ứng dụng **không khởi động**, báo lỗi rõ ràng | ☐ |
| TC-44 | YC-41 | Có 1 khoá hợp lệ | Gọi vượt ngưỡng tần suất | Trả về mã 429 | ☐ |
| TC-45 | YC-34 | Có 1 khoá hợp lệ | Gọi `/api/catalog/manifest` | Trả về bản mô tả danh mục dữ liệu | ☐ |

### 3.6 Phân quyền

| Mã ca | Yêu cầu | Điều kiện đầu | Các bước | Kết quả mong đợi | Kết quả thật |
| :---- | :---- | :---- | :---- | :---- | :---- |
| TC-46 **(âm)** | YC-39 | Đăng nhập vai trò biên tập viên | Mở mục Người dùng | Không truy cập được | ☐ |
| TC-47 **(âm)** | YC-39 | Như trên | Mở mục Khoá truy cập | Không truy cập được | ☐ |
| TC-48 **(âm)** | YC-39 | Đăng nhập vai trò chỉ đọc | Thử sửa 1 nguyên liệu | Không lưu được | ☐ |
| TC-49 **(âm)** | NV-08 | Đăng nhập tài khoản **khách hàng** | Thử mở `admin.bioscope.vn` | Không vào được hệ quản trị | ☐ |
| TC-50 | YC-40 | Đăng nhập biên tập viên | Sửa 1 nguyên liệu → mở Nhật ký thay đổi | Có bản ghi: ai, sửa gì, lúc nào | ☐ |

---

## 4. Kiểm thử phi chức năng

| Mã ca | Yêu cầu | Cách đo | Ngưỡng đạt | Kết quả thật |
| :---- | :---- | :---- | :---- | :---- |
| TC-51 | PC-01 | Công cụ đo hiệu năng trang, mạng 10 Mbps | Nội dung chính hiện < 3 giây | ☐ |
| TC-52 | PC-02 | Bấm giờ trên dữ liệu thật | Thao tác quản trị < 2 giây | ☐ |
| TC-53 | PC-03 | Đo thời gian gọi | Giao diện lập trình < 500 mili giây | ☐ |
| TC-54 | PC-04 | Khởi động lại máy chủ | Bốn dịch vụ tự lên | ☐ |
| TC-55 | PC-05 | Diễn tập khôi phục từ bản sao lưu | Khôi phục đủ dữ liệu | ☐ |
| TC-56 | PC-06 | Kiểm chứng chỉ | Toàn bộ qua kết nối mã hoá | ☐ |
| TC-57 **(âm)** | PC-07 | Xem bảng người dùng trong cơ sở dữ liệu | **Không** thấy mật khẩu dạng đọc được | ☐ |
| TC-58 **(âm)** | PC-08 | Gọi các điểm truy cập công khai | Không lộ thư điện tử, không lộ địa chỉ mạng | ☐ |
| TC-59 | PC-09 | Kiểm trên 3 cỡ: 375px, 768px, 1440px | Bố cục đúng, không tràn ngang | ☐ |
| TC-60 | PC-10 | Kiểm trên các trình duyệt phổ biến | Hiển thị và thao tác đúng | ☐ |
| TC-61 | PC-11 | Duyệt toàn trang bằng phím Tab | Mọi phần tử tương tác có viền tiêu điểm rõ | ☐ |
| TC-62 **(âm)** | YC-44 | Rà soát kho mã nguồn tìm chuỗi bí mật | **Không** có khoá, mật khẩu, chuỗi kết nối trong mã | ☐ |

---

## 5. Kiểm chứng đã thực hiện: hệ thống bình luận

Phần này khác các mục trên: đây là **kết quả đã chạy thật**, không phải ca chờ điền.

Bình luận là đường ghi mở duy nhất cho người không đăng nhập, nên được kiểm riêng và kỹ.

### 5.1 Kết quả

| # | Phép thử | Kết quả mong đợi | **Kết quả thật** |
| :---- | :---- | :---- | :---- |
| 1 | Gửi bình luận hợp lệ | Nhận và lưu | `{"ok":true,"pending":true}` mã 201 ✅ |
| 2 **(âm)** | Gửi thiếu tên | Từ chối | Mã 400 ✅ |
| 3 **(âm)** | Gửi vào bài không tồn tại | Từ chối | Mã 404 ✅ |
| 4 **(âm)** | Gửi kèm `status:"approved"` | Bỏ qua, vẫn chờ duyệt | **Lưu ở trạng thái `pending`** ✅ |
| 5 **(âm)** | Đọc danh sách khi chưa duyệt | Không trả bình luận nào | `comments: []` ✅ |
| 6 | Duyệt 1 bình luận rồi đọc lại | Trả về 1 bình luận | Trả về đúng 1 ✅ |
| 7 **(âm)** | Kiểm phản hồi có lộ thư điện tử | Không lộ | **Không lộ** ✅ |
| 8 **(âm)** | Kiểm phản hồi có lộ địa chỉ mạng | Không lộ | **Không lộ** ✅ |
| 9 **(âm)** | Kiểm phản hồi có lộ bình luận chưa duyệt | Không lộ | **Không lộ** ✅ |
| 10 | Giới hạn 5 lần/giờ theo địa chỉ | Lần thứ 6 bị chặn | 201 × 5 lần, rồi **429** ở lần 6 và 7 ✅ |
| 11 **(âm)** | Tắt bình luận rồi gửi | Từ chối | Mã 403 ✅ |
| 12 | Tắt bình luận rồi đọc | Báo đã tắt, danh sách rỗng | `{"ok":true,"enabled":false,"comments":[]}` ✅ |
| 13 | Trang bài viết hiện bình luận thật | Hiện | Hiện đúng ✅ |
| 14 **(âm)** | Trang bài viết có lộ bình luận chờ duyệt | Không lộ | **Không lộ** ✅ |
| 15 | Dữ liệu mẫu cũ đã gỡ hết | Không còn | **Đã gỡ sạch** ✅ |

**15/15 đạt.**

### 5.2 Kiểm chứng kịch bản chuyển đổi cấu trúc

| Phép thử | Kết quả |
| :---- | :---- |
| Chạy lần 1 | 0 lỗi ✅ |
| Chạy lần 2 (kiểm khả năng chạy trùng) | 0 lỗi ✅ |
| Đối chiếu **toàn bộ** danh sách cột với bản chuẩn | **Rỗng** — không thiếu cột nào ✅ |

Đây chính là bước 7 trong quy trình `00-5` mục 5.3 — bước sinh ra sau sự cố `_posts_v_rels`.

---

## 6. Nhật ký lỗi phát hiện qua kiểm thử

Các lỗi dưới đây đều được phát hiện, xác minh nguyên nhân, và sửa. Mỗi lỗi đối chiếu được với một lần ghi nhận thay đổi trong kho mã nguồn.

| # | Dấu hiệu | Nguyên nhân thật | Cách sửa |
| :---- | :---- | :---- | :---- |
| L-01 | Trang danh sách bài viết trong hệ quản trị trắng trơn | Thiếu cột `industries_id` ở bảng phiên bản `_posts_v_rels` | Bổ sung vào kịch bản chuyển đổi; thêm bước đối chiếu toàn bộ cột vào quy trình |
| L-02 | Gọi `/api/post-comments/list` trả 403 | Đường dẫn tự dựng theo tên nhóm dữ liệu che mất đường dẫn tự viết | Đổi sang `/api/blog-comments/*` |
| L-03 | Bài viết chỉ có tiếng Việt vẫn hiện ở trang tiếng Anh, mở ra thì trắng | Cơ chế lấy bản dự phòng của bộ khung | Tắt cơ chế đó khi truy vấn danh sách, tự lọc bỏ bản thiếu nội dung |
| L-04 | Thanh đầu trang tràn 222px ở bề rộng 1024px | Khung chứa tăng đệm ở màn hình rộng, khiến màn hình rộng hơn lại **ít chỗ** hơn | Đặt bề rộng tối đa riêng cho thanh đầu trang |
| L-05 | Chuyển hướng đường dẫn cũ chỉ cho mã 200 kèm thẻ làm mới | Dùng hàm chuyển hướng trong mã trang thay vì khai ở tầng cấu hình | Chuyển sang khai ở cấu hình ứng dụng, đạt mã 308 |
| L-06 | Máy chủ phát triển treo hơn 5 phút mỗi lời gọi | Chế độ tự đồng bộ cấu trúc dừng chờ trả lời câu hỏi đổi tên bảng | Áp đủ kịch bản chuyển đổi còn thiếu; thời gian phản hồi về 5 giây |
| L-07 | Nội dung bài viết hiện sai định dạng, có đoạn lạ | Dựng nội dung không đúng cấu trúc trình soạn thảo xuất ra | Dựng lại lớp hiển thị nội dung có định dạng |
| L-08 | Bộ thẻ lọc khai trong hệ quản trị nhưng không ra trang web | Truy vấn không lấy kèm dữ liệu quan hệ | Khai độ sâu truy vấn phù hợp |
| L-09 | `Cannot find module next/dist/bin/next` khi chạy trong ảnh chứa | Chạy lệnh từ thư mục thư viện thay vì thư mục ứng dụng | Sửa lệnh khởi động |
| L-10 | `argument missing` khi dựng ảnh chứa | Nhầm giữa tham số lúc dựng và biến lúc chạy | Dùng đúng loại biến |

Chi tiết đầy đủ ở `DA1-10-tra-cuu-ky-thuat.md`, mục Sự cố đã gặp.

---

## 7. Một lần chẩn đoán sai — ghi lại để rút kinh nghiệm

Ghi vào hồ sơ vì bài học có giá trị lâu dài.

**Sự việc.** Lỗi L-01, trang danh sách bài viết trắng.

**Chẩn đoán lần đầu — sai.** Kết luận nguyên nhân là phiên đăng nhập cũ trong trình duyệt, và đề nghị tải lại trang bằng cách bỏ qua bộ nhớ đệm. Căn cứ: một phép thử gọi trang quản trị **không kèm đăng nhập**, trả về nội dung bình thường nên kết luận hệ thống không lỗi.

**Vì sao sai.** Phép thử đó không tái hiện được hoàn cảnh của lỗi. Trang quản trị khi chưa đăng nhập trả về khung trang chứ không truy vấn dữ liệu — mà lỗi nằm ở khâu truy vấn. Phép thử đúng phải là: đăng nhập thật, mở trang thật, đọc nhật ký máy chủ.

**Chẩn đoán lại — đúng.** Tạo tài khoản quản trị thật, đăng nhập qua trình duyệt, tái hiện lỗi, đọc nhật ký, thấy `column _posts_v_rels.industries_id does not exist`.

**Ba bài học ghi vào quy trình:**

1. Phép thử phải **tái hiện đúng hoàn cảnh** lỗi. Không thì kết quả của nó vô nghĩa.
2. Nhật ký máy chủ là nguồn thông tin đầu tiên phải xem, không phải nguồn cuối cùng.
3. Không ghi phỏng đoán vào sổ tra cứu sự cố. Ghi phỏng đoán còn tệ hơn không ghi, vì người sau tin theo rồi đi sai hướng.

---

## 8. Biên bản nghiệm thu

**Tên sản phẩm:** Website Bioscope và Hệ quản trị nội dung (DA1)

**Phiên bản nghiệm thu:** ..............................

**Thời gian nghiệm thu:** từ ................. đến .................

### 8.1 Kết quả đối chiếu tiêu chí

| # | Tiêu chí nghiệm thu (theo `DA1-02` mục 5) | Đạt | Không đạt | Ghi chú |
| :---- | :---- | :----: | :----: | :---- |
| 1 | Toàn bộ yêu cầu mức "Bắt buộc" đã dựng và chạy được | ☐ | ☐ | |
| 2 | Biên tập viên tự thêm và xuất bản nguyên liệu, không cần lập trình viên | ☐ | ☐ | |
| 3 | Nội dung song ngữ hiển thị đúng ở cả hai ngôn ngữ | ☐ | ☐ | |
| 4 | Bài chỉ có một ngôn ngữ không hiện ở ngôn ngữ còn lại | ☐ | ☐ | |
| 5 | Khách chưa đăng nhập không tải được tài liệu kiểm soát | ☐ | ☐ | |
| 6 | Giao diện lập trình không trả nội dung nháp, không trả dữ liệu nội bộ | ☐ | ☐ | |
| 7 | Trang công khai đạt yêu cầu tốc độ | ☐ | ☐ | |
| 8 | Không có bí mật trong mã nguồn | ☐ | ☐ | |
| 9 | Dựng bản phát hành thành công | ☐ | ☐ | |
| 10 | Khôi phục được từ bản sao lưu | ☐ | ☐ | |

### 8.2 Kết luận

☐ **Đạt** — đồng ý đưa vào vận hành

☐ **Đạt có điều kiện** — đưa vào vận hành, các điểm sau khắc phục sau: ..................................................

☐ **Không đạt** — lý do: ..................................................

### 8.3 Ký xác nhận

| Vai trò | Họ tên | Ý kiến | Ngày | Ký |
| :---- | :---- | :---- | :---- | :---- |
| Người kiểm thử | | | | |
| Đại diện bộ phận kinh doanh | | | | |
| Đại diện bộ phận kỹ thuật | | | | |
| Ban giám đốc phê duyệt | | | | |
