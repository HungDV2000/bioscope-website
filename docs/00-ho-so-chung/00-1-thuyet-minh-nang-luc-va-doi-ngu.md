<!--HOSO
phu_de: Năng lực và đội ngũ phát triển nội bộ
pham_vi: Toàn công ty
ngay_lap: 08/01/2026
phien_ban: 1.2
nguoi_lap: Bộ phận Phát triển phần mềm — Công ty Bioscope
nguoi_duyet: Ban Giám đốc
lich_su: 1.0 | 08/01/2026 | Ban hành lần đầu, phục vụ dự án DA3
lich_su: 1.1 | 20/05/2026 | Bổ sung phạm vi dự án DA1
lich_su: 1.2 | 20/06/2026 | Bổ sung phạm vi dự án DA2
-->
# THUYẾT MINH NĂNG LỰC VÀ ĐỘI NGŨ PHÁT TRIỂN NỘI BỘ

*Tài liệu chung — áp dụng cho cả ba dự án DA1, DA2, DA3.*

---

## 1. Khẳng định

Ba sản phẩm phần mềm DA1, DA2, DA3 do **đội ngũ nhân sự nội bộ của công ty trực tiếp thực hiện toàn bộ**, từ khâu xác định yêu cầu đến khâu vận hành và bảo trì.

Cụ thể:

- Công ty **không mua** phần mềm đóng gói rồi đổi tên.
- Công ty **không thuê ngoài trọn gói**. Không có hợp đồng giao khoán phát triển phần mềm cho bên thứ ba.
- Công ty **không nhận chuyển giao** mã nguồn từ đối tác.
- Toàn bộ mã nguồn nghiệp vụ do nhân sự công ty tự viết. Các thư viện mã nguồn mở được sử dụng là **nền tảng công cụ**, không phải sản phẩm — sẽ nói rõ ở mục 4.

---

## 2. Bảng đối chiếu danh tính kỹ thuật và nhân sự

Lịch sử ghi nhận thay đổi mã nguồn lưu danh tính kỹ thuật của người thực hiện. Bảng dưới đối chiếu danh tính đó với nhân sự thật của công ty.

| Danh tính trong kho mã nguồn | Họ tên | Chức danh | Bộ phận | Thời gian tham gia |
| :---- | :---- | :---- | :---- | :---- |
| `KCODE <kcode@MacBook-Pro-cua-KCODE.local>` | *(công ty điền)* | *(công ty điền)* | *(công ty điền)* | 02/2026 – nay |
| `HungDV2000 <deepviewzoom@gmail.com>` | *(công ty điền)* | *(công ty điền)* | *(công ty điền)* | 08/2026 |
| `root <root@vmi2290229.contaboserver.net>` | — | Tài khoản hệ thống trên máy chủ, không phải người | — | 06/2026 |

> **Việc phải làm trước khi nộp hồ sơ.**
>
> Ba ô "công ty điền" ở trên phải được điền bằng thông tin nhân sự thật, kèm số hiệu hợp đồng lao động hoặc quyết định phân công. Đây là mắt xích nối giữa *bằng chứng kỹ thuật* (lịch sử mã nguồn) và *bằng chứng nhân sự* (hợp đồng lao động). Thiếu mắt xích này, người đọc hồ sơ không có cách nào xác nhận người viết mã là nhân viên công ty.
>
> Danh tính `KCODE <kcode@MacBook-Pro-cua-KCODE.local>` là giá trị mặc định do phần mềm quản lý mã nguồn tự sinh từ tên máy tính, không phải hòm thư công ty. Từ nay nên cấu hình lại theo hòm thư công ty:
>
> ```bash
> git config --global user.name "Họ Tên"
> git config --global user.email "hoten@bioscope.vn"
> ```
>
> Việc đổi cấu hình chỉ áp dụng cho các lần ghi nhận **về sau**; lịch sử cũ giữ nguyên và được giải thích bằng chính bảng đối chiếu này.

---

## 3. Hồ sơ chứng minh nhân sự cần đính kèm

Với mỗi người có tên ở bảng mục 2, hồ sơ cần có:

| # | Tài liệu | Ghi chú |
| :---- | :---- | :---- |
| 1 | Hợp đồng lao động | Còn hiệu lực trong khoảng thời gian phát triển |
| 2 | Quyết định phân công tham gia dự án | Ghi rõ tên dự án, vai trò, thời gian |
| 3 | Bảng lương / chứng từ chi trả | Chứng minh chi phí nhân công thực chi |
| 4 | Chứng từ đóng bảo hiểm xã hội | Chứng minh quan hệ lao động chính thức |
| 5 | Bản mô tả công việc | Nêu rõ nhiệm vụ phát triển phần mềm |

Bốn tài liệu đầu do bộ phận nhân sự và kế toán cung cấp. Tài liệu này không thay thế được chúng.

---

## 4. Ranh giới: cái gì công ty tự viết, cái gì là công cụ

Đây là mục dễ bị hiểu nhầm nhất, nên nói thẳng.

Phần mềm hiện đại nào cũng dựng trên nền thư viện có sẵn — không ai viết lại trình duyệt, hệ quản trị cơ sở dữ liệu hay bộ dựng giao diện từ con số không. Việc dùng thư viện mã nguồn mở **không làm mất tính tự phát triển**, giống như việc dùng máy tiện không làm mất tính tự sản xuất của một xưởng cơ khí.

Ranh giới cụ thể:

### 4.1 Nền tảng công cụ — không phải sản phẩm của công ty

| Thành phần | Vai trò | Giấy phép |
| :---- | :---- | :---- |
| Ngôn ngữ TypeScript, Python | Ngôn ngữ lập trình | Mã nguồn mở |
| Next.js, React | Bộ dựng giao diện web | MIT |
| Payload | Bộ khung hệ quản trị nội dung | MIT |
| FastAPI, SQLAlchemy | Bộ khung dịch vụ web phía máy chủ | MIT |
| PostgreSQL, Redis, Qdrant | Hệ quản trị dữ liệu, bộ nhớ đệm, kho vectơ | Mã nguồn mở |
| n8n | Nền tảng tự động hoá quy trình | Sustainable Use License |
| Docker | Đóng gói và triển khai | Apache 2.0 |

Đây là **vật tư đầu vào**. Công ty không tuyên bố sở hữu chúng.

### 4.2 Sản phẩm do công ty tự viết

| Nội dung | Quy mô |
| :---- | :---- |
| Toàn bộ mô hình dữ liệu nghiệp vụ: nguyên liệu, danh mục, dịch vụ, bài viết, hội thoại, phiên chat, công việc AI… | 51 nhóm dữ liệu (DA1/DA2) + 17 nhóm (DA3) |
| Toàn bộ quy tắc nghiệp vụ: phân quyền, kiểm duyệt, đa ngữ, giới hạn truy cập, chống lạm dụng | Rải khắp mã nguồn |
| Toàn bộ giao diện: trang công khai, khung quản trị, khung chat | 68 thành phần giao diện (DA1) + 60 (DA3) |
| Toàn bộ giao diện lập trình phục vụ tích hợp | 52 điểm truy cập (DA1/DA2) + 13 nhóm (DA3) |
| Toàn bộ dây chuyền xử lý AI: cách gọi mô hình, cách dựng câu lệnh, cách kiểm chứng kết quả, cách ước tính chi phí | ~4.200 dòng (DA2) + ~20.400 dòng (DA3) |
| Toàn bộ 44 quy trình tự động hoá của chatbot | 44 tệp định nghĩa quy trình |
| Toàn bộ kịch bản chuyển đổi cấu trúc dữ liệu | 28 tệp lệnh |

Đây là **sản phẩm**. Không có thư viện nào làm sẵn phần này — nó là tri thức nghiệp vụ của công ty được viết thành mã.

Một cách kiểm chứng đơn giản dành cho người đọc hồ sơ: gỡ toàn bộ thư viện bên ngoài ra, phần còn lại vẫn là hàng chục nghìn dòng mã mang tên gọi và khái niệm riêng của ngành nguyên liệu thực phẩm chức năng — *nguyên liệu*, *chỉ tiêu kỹ thuật*, *nhóm quản lý*, *phiếu phân tích*. Không sản phẩm đóng gói nào có sẵn những khái niệm đó.

---

## 5. Bằng chứng khối lượng lao động

Khối lượng công việc thể hiện qua lịch sử ghi nhận thay đổi mã nguồn. Số liệu trích trực tiếp từ kho mã nguồn:

### 5.1 DA1 + DA2 — Website và hệ quản trị

| Tháng | Số lần ghi nhận | Dòng thêm | Dòng xoá |
| :---- | :---- | :---- | :---- |
| 06/2026 | 27 | 105.947 | 4.899 |
| 07/2026 | 148 | 81.342 | 4.910 |
| 08/2026 | 43 | 17.354 | 58.901 |
| **Tổng** | **218** | **204.643** | **68.710** |

Tháng 8 xoá nhiều hơn thêm — đó là dấu hiệu của giai đoạn **dọn dẹp và tinh gọn**, không phải giai đoạn dựng mới. Một dự án mua về rồi đổi tên sẽ không có hình dạng này.

### 5.2 DA3 — Chatbot AI đa kênh

| Tháng | Số lần ghi nhận |
| :---- | :---- |
| 02/2026 | 14 |
| 03/2026 | 11 |
| 04/2026 | 6 |
| 05/2026 | 1 |
| 06/2026 | 131 |
| **Tổng** | **163** |

Phân bố này phản ánh đúng thực tế phát triển: bốn tháng đầu dựng nền và thử nghiệm từng phần với nhịp chậm, tháng 6 dồn sức hoàn thiện để đưa vào vận hành.

### 5.3 Nhận xét

Tổng cộng **381 lần ghi nhận thay đổi trải trên 7 tháng liên tục**. Mỗi lần ghi nhận có mốc thời gian, danh tính người thực hiện, và nội dung thay đổi ở mức từng dòng. Đây là loại bằng chứng không làm giả được sau: nó phải được tích luỹ theo thời gian thực.

---

## 6. Vai trò trong dự án

Bộ hồ sơ mô tả công việc theo **vai trò**, không theo cá nhân, vì trong đội nhỏ một người thường đảm nhiều vai.

| Vai trò | Trách nhiệm | Sản phẩm đầu ra |
| :---- | :---- | :---- |
| Phân tích nghiệp vụ | Làm việc với các bộ phận, ghi nhận và làm rõ yêu cầu | Tài liệu công đoạn 1 |
| Thiết kế hệ thống | Chọn kiến trúc, thiết kế dữ liệu, quyết định kỹ thuật | Tài liệu công đoạn 2 |
| Lập trình | Viết mã, tự kiểm tra, sửa lỗi | Mã nguồn, nhật ký công đoạn 3 |
| Kiểm thử | Dựng ca kiểm thử, chạy kiểm thử, ghi nhận lỗi | Tài liệu công đoạn 4 |
| Triển khai và vận hành | Đóng gói, cài đặt, theo dõi, sao lưu | Tài liệu công đoạn 5–6–7 |

---

## 7. Cam kết

Công ty cam kết:

1. Toàn bộ nội dung trong bộ hồ sơ này phản ánh đúng thực tế phát triển.
2. Mã nguồn, lịch sử thay đổi và hệ thống đang vận hành sẵn sàng cho việc kiểm tra đối chiếu.
3. Nếu có nội dung nào trong hồ sơ không khớp với thực tế, công ty chịu trách nhiệm giải trình và điều chỉnh.

*Người lập:* ...................................................

*Chức danh:* ...................................................

*Ngày:* .................. */.................. /* ..................

*Người đại diện theo pháp luật ký, đóng dấu:*
