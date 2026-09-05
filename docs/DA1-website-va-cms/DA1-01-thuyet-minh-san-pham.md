<!--HOSO
phu_de: Website Bioscope và Hệ quản trị nội dung
pham_vi: Dự án DA1
ngay_lap: 20/05/2026
phien_ban: 1.1
nguoi_lap: HungDV — Product Owner, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 20/05/2026 | Ban hành lần đầu
lich_su: 1.1 | 31/08/2026 | Cập nhật trạng thái và quy mô thực tế
-->
# DA1 — THUYẾT MINH SẢN PHẨM
## Website Bioscope và Hệ quản trị nội dung

---

## 0. Hai bên trong dự án

| | **Bên thực hiện** | **Bên thụ hưởng** |
| :---- | :---- | :---- |
| Công ty | **OPTIMAI** | **Bioscope** |
| Vai trò | Phân tích, thiết kế, lập trình, kiểm thử, đóng gói, triển khai, bàn giao, bảo hành | Đặt hàng, cung cấp yêu cầu nghiệp vụ, nghiệm thu, tiếp nhận, vận hành |

| Tài liệu nền | Nội dung |
| :---- | :---- |
| `00-ho-so-chung/00-1-thuyet-minh-nang-luc-va-doi-ngu.md` | Đội thực hiện và **ma trận phân công theo bảy công đoạn** |
| `00-ho-so-chung/00-7-hop-dong-ban-giao-va-quyen-so-huu.md` | Hợp đồng, nghiệm thu, bàn giao, **quyền sở hữu trí tuệ** |
| `00-ho-so-chung/00-2-quy-trinh-san-xuat-phan-mem-noi-bo.md` | Quy trình bảy công đoạn OPTIMAI áp dụng |

Trong tài liệu này, **"Bioscope"** chỉ doanh nghiệp thụ hưởng và nghiệp vụ của họ — nguyên liệu, khách hàng, dữ liệu. **"OPTIMAI"** chỉ bên thực hiện phần mềm.

---

## 1. Tên sản phẩm

**Tên đầy đủ:** Hệ thống Website và Quản trị nội dung Bioscope

**Tên rút gọn nội bộ:** `dv-cms`

**Phiên bản hiện tại:** 0.1.0

**Địa chỉ vận hành:**

| Thành phần | Địa chỉ | Đối tượng phục vụ |
| :---- | :---- | :---- |
| Cổng thông tin công khai | `bioscope.vn` | Khách hàng, đối tác, công chúng |
| Hệ quản trị nội dung | `admin.bioscope.vn` | Nhân viên công ty |

---

## 2. Sản phẩm này là gì

Hai lớp phần mềm gắn liền nhau, dựng chung một kho mã nguồn:

### Lớp 1 — Cổng thông tin công khai

Trang web giới thiệu năng lực của Bioscope trong lĩnh vực nguyên liệu thực phẩm chức năng: danh mục nguyên liệu, dịch vụ, công nghệ, chứng nhận, tình huống khách hàng, bản tin chuyên môn. Có hai ngôn ngữ Việt và Anh, có cổng dành riêng cho khách hàng doanh nghiệp đã đăng ký.

### Lớp 2 — Hệ quản trị nội dung

Phần mềm để nhân viên tự quản lý toàn bộ nội dung của cổng thông tin mà không cần lập trình viên: thêm sửa nguyên liệu, viết bài, dựng trang, quản lý người dùng, cấu hình hiển thị, xem thống kê hội thoại, điều khiển dây chuyền AI.

Đây **không phải** một hệ quản trị đóng gói sẵn đem về cài. Bộ khung nền (Payload) chỉ cung cấp cơ chế lưu trữ, xác thực và dựng giao diện quản trị. Toàn bộ **mô hình nghiệp vụ, quy tắc, phân quyền, giao diện đặc thù và các dây chuyền xử lý** do công ty tự thiết kế và viết — 51 nhóm dữ liệu, 52 điểm giao tiếp lập trình, 12 mô-đun chức năng.

---

## 3. Vấn đề sản phẩm giải quyết

| Vấn đề trước khi có hệ thống | Cách hệ thống giải quyết |
| :---- | :---- |
| Thông tin nguyên liệu nằm rải rác trong tệp Word, Excel, hộp thư — mỗi người giữ một bản, không biết bản nào mới nhất | Một kho dữ liệu nguyên liệu duy nhất, có phiên bản, có trạng thái nháp/đã xuất bản |
| Muốn sửa một dòng trên trang web phải nhờ người làm kỹ thuật | Biên tập viên tự sửa trên giao diện quản trị, xem trước rồi xuất bản |
| Nội dung tiếng Anh và tiếng Việt lệch nhau, không ai kiểm soát được cái nào đã dịch | Từng trường dữ liệu có hai bản ngôn ngữ, hệ thống biết trường nào chưa dịch và ẩn nội dung chưa dịch khỏi trang ngôn ngữ tương ứng |
| Khách hỏi tài liệu kỹ thuật phải gửi tay qua hộp thư, không biết ai đã tải gì | Cổng tài liệu có kiểm soát: khách đăng ký tài khoản, hệ thống ghi nhận ai tải tài liệu nào |
| Hệ thống khác muốn lấy dữ liệu nguyên liệu phải xin tệp xuất | Giao diện lập trình có khoá truy cập, trả dữ liệu theo danh sách trường được phép công bố |
| Không biết khách vào từ đâu, xem gì, quan tâm gì | Ghi nhận nguồn truy cập, hành trình xem trang, gắn với hội thoại chat |

---

## 4. Người dùng và vai trò

| Nhóm | Số lượng ước tính | Dùng phần nào | Quyền |
| :---- | :---- | :---- | :---- |
| Khách vãng lai | Không giới hạn | Cổng thông tin công khai | Chỉ đọc nội dung đã xuất bản |
| Khách hàng đăng ký | Theo thực tế | Cổng tài liệu dành riêng | Đọc nội dung công khai + tải tài liệu có kiểm soát |
| Biên tập viên | Vài người | Hệ quản trị | Thêm/sửa nội dung, không sửa cấu hình hệ thống, không quản lý người dùng |
| Quản trị viên | 1–2 người | Toàn bộ | Mọi quyền, gồm cấu hình hệ thống, khoá truy cập, quản lý người dùng |
| Hệ thống bên ngoài | Theo khoá cấp | Giao diện lập trình | Đọc dữ liệu theo phạm vi của khoá |

---

## 5. Phạm vi chức năng

### 5.1 Nhóm nội dung nghiệp vụ

| Nhóm dữ liệu | Nội dung |
| :---- | :---- |
| `ingredients` | Nguyên liệu — hạt nhân của toàn hệ thống |
| `ingredient-categories` | Phân loại nguyên liệu |
| `ingredient-facets` | Thuộc tính lọc nguyên liệu |
| `services` | Dịch vụ công ty cung cấp |
| `technologies` | Công nghệ ứng dụng |
| `certifications` | Chứng nhận |
| `case-studies` | Tình huống khách hàng |
| `faqs` | Câu hỏi thường gặp |
| `partners` | Đối tác |
| `product-categories` | Danh mục sản phẩm |

### 5.2 Nhóm nội dung biên tập

| Nhóm dữ liệu | Nội dung |
| :---- | :---- |
| `posts` | Bài viết bản tin |
| `categories` | Chủ đề bài viết |
| `industries` | Ngành áp dụng |
| `tags` | Thẻ |
| `post-comments` | Bình luận của độc giả |
| `pages` | Trang tĩnh dựng bằng khối |
| `media` | Kho ảnh và tệp |
| `redirects` | Chuyển hướng đường dẫn |

### 5.3 Nhóm khách hàng và tương tác

| Nhóm dữ liệu | Nội dung |
| :---- | :---- |
| `members` | Tài khoản khách hàng doanh nghiệp |
| `gated-documents` | Tài liệu có kiểm soát tải |
| `forms`, `form-submissions` | Biểu mẫu và dữ liệu khách gửi |
| `chat-conversations`, `chat-messages` | Hội thoại chat trực tuyến |
| `consent-log` | Nhật ký đồng ý sử dụng dữ liệu |

### 5.4 Nhóm vận hành và an toàn

| Nhóm dữ liệu | Nội dung |
| :---- | :---- |
| `users` | Tài khoản nhân viên |
| `api-keys` | Khoá truy cập giao diện lập trình |
| `audit-logs` | Nhật ký thao tác |
| `security-events` | Sự kiện an ninh |
| `blocked-ips` | Địa chỉ bị chặn |

### 5.5 Nhóm cấu hình

12 bảng cấu hình toàn cục: thông tin công ty, nhận diện thương hiệu, điều hướng, tối ưu tìm kiếm, đăng nhập, đồng ý dữ liệu, ảnh, an ninh, chat, AI, trang chủ, trang giới thiệu trợ lý AI.

---

## 6. Phạm vi loại trừ

Nói rõ cái gì **không** thuộc sản phẩm này, tránh hiểu nhầm khi đối chiếu:

| Không thuộc DA1 | Thuộc đâu |
| :---- | :---- |
| Dây chuyền AI sinh nội dung nguyên liệu | DA2 |
| Trợ lý hội thoại AI có truy hồi tri thức | DA3 |
| Hệ thống kế toán, xử lý chứng từ | Sản phẩm khác, không nằm trong bộ hồ sơ này |
| Bán hàng trực tuyến, giỏ hàng, thanh toán | Chưa triển khai |

DA1 và DA2 dùng chung kho mã nguồn nên có phần giao nhau về hạ tầng. Ranh giới: **DA1 là nơi dữ liệu được lưu, quản lý và hiển thị; DA2 là dây chuyền tự động sinh ra dữ liệu đó.** Tách hồ sơ theo ranh giới này để mỗi bộ mô tả đúng một sản phẩm.

---

## 7. Quy mô sản phẩm

| Chỉ số | Số liệu |
| :---- | :---- |
| Tổng số dòng mã | ~51.300 |
| Ngôn ngữ | TypeScript |
| Nhóm dữ liệu và bảng cấu hình | 51 |
| Điểm giao tiếp lập trình | 52 |
| Trang trên cổng thông tin | 27 đường dẫn (nhân đôi theo hai ngôn ngữ) |
| Thành phần giao diện | 68 |
| Khối dựng trang | 18 |
| Mô-đun chức năng | 12 gói |
| Kịch bản chuyển đổi cấu trúc dữ liệu | 28 |
| Ngôn ngữ hỗ trợ | 2 (Việt, Anh) |

---

## 8. Kiến trúc mô-đun

Sản phẩm chia thành 12 gói độc lập, mỗi gói một nhiệm vụ. Đây là quyết định thiết kế có chủ ý, không phải cách chia ngẫu nhiên.

| Gói | Nhiệm vụ |
| :---- | :---- |
| `core` | Nền chung: người dùng, trang, bài viết, ảnh, biểu mẫu, cấu hình chung |
| `module-bioscope` | Nghiệp vụ riêng của Bioscope: nguyên liệu, dịch vụ, công nghệ, chứng nhận |
| `module-b2b` | Cổng khách hàng doanh nghiệp: tài khoản, tài liệu có kiểm soát |
| `module-blocks` | Bộ khối dựng trang |
| `module-catalog` | Danh mục sản phẩm, đối tác |
| `module-consent` | Đồng ý sử dụng dữ liệu cá nhân |
| `module-custom-types` | Cho phép tự định nghĩa loại nội dung mới không cần lập trình |
| `module-image` | Xử lý ảnh, kích thước, tối ưu |
| `module-languages` | Đa ngữ |
| `module-permissions` | Phân quyền |
| `module-security` | An ninh: chặn địa chỉ, ghi sự kiện |
| `module-seo` | Tối ưu công cụ tìm kiếm |

Lợi ích của cách chia này: gói `core` và các gói `module-*` chung dùng lại được cho dự án khác; chỉ gói `module-bioscope` mang nghiệp vụ riêng. Đây là thiết kế cho **một nền tảng**, không phải cho một website đơn lẻ.

---

## 9. Trạng thái hiện tại

| Hạng mục | Trạng thái |
| :---- | :---- |
| Cổng thông tin công khai | Đang vận hành |
| Hệ quản trị nội dung | Đang vận hành |
| Đa ngữ Việt – Anh | Đang vận hành |
| Cổng khách hàng doanh nghiệp | Đang vận hành, phần đăng nhập Google còn ở dạng thử nghiệm |
| Giao diện lập trình có khoá | Đang vận hành |
| Bình luận bài viết | Đã dựng xong, mặc định tắt, chờ quyết định bật |
| Chat trực tuyến | Đang vận hành |

---

## 10. Lịch sử phát triển tóm tắt

| Mốc | Thời gian | Nội dung |
| :---- | :---- | :---- |
| Khởi tạo | 15/06/2026 | Dựng nền monorepo, gói `core`, mô hình dữ liệu cơ bản |
| Dựng nghiệp vụ | 06–07/2026 | Nguyên liệu, dịch vụ, công nghệ, chứng nhận, tình huống |
| Dựng cổng thông tin | 07/2026 | Toàn bộ trang công khai, đa ngữ, tối ưu tìm kiếm |
| Cổng khách hàng | 07–08/2026 | Đăng ký, đăng nhập, tài liệu có kiểm soát |
| Giao diện lập trình | 08/2026 | Khoá truy cập, danh sách trường được phép công bố |
| Bản tin và bình luận | 08–09/2026 | Phân loại bài viết, chuyển đường dẫn, hệ thống bình luận |

Chi tiết theo từng mốc nằm ở `DA1-06-cd3-lap-trinh-va-nhat-ky.md`.
