<!--HOSO
phu_de: Quy trình sản xuất phần mềm nội bộ
pham_vi: Toàn công ty
ngay_lap: 10/01/2026
phien_ban: 1.3
nguoi_lap: QuanNH — Team Lead, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 10/01/2026 | Ban hành lần đầu
lich_su: 1.1 | 11/07/2026 | Bổ sung quy trình đổi cấu trúc cơ sở dữ liệu
lich_su: 1.2 | 31/08/2026 | Bổ sung bước đối chiếu toàn bộ danh sách cột sau sự cố bảng phiên bản
lich_su: 1.3 | 03/09/2026 | Bổ sung nguyên tắc ghi sổ tra cứu sự cố
-->
# QUY TRÌNH SẢN XUẤT PHẦN MỀM NỘI BỘ

*Tài liệu chung — quy trình **Công ty OPTIMAI** áp dụng cho mọi dự án trong bộ hồ sơ.*

Tài liệu này mô tả quy trình mà đội phát triển OPTIMAI thực sự làm, không phải quy trình lý thuyết chép từ sách. Mỗi công đoạn nêu rõ: đầu vào, việc phải làm, đầu ra, và **bằng chứng để lại** — vì bằng chứng mới là thứ hồ sơ cần.

---

## 0. Nguyên tắc chung

Bốn nguyên tắc chi phối cách đội làm việc:

**Nguyên tắc 1 — Mọi thay đổi đều để lại vết.** Không sửa trực tiếp trên máy chủ. Mọi thay đổi đi qua kho mã nguồn, có mốc thời gian và người thực hiện. Kho mã nguồn vì thế vừa là nơi lưu mã, vừa là nhật ký sản xuất.

**Nguyên tắc 2 — Cấu trúc dữ liệu chỉ đổi bằng kịch bản có kiểm chứng.** Không gõ lệnh sửa cơ sở dữ liệu bằng tay trên hệ thống thật. Mọi thay đổi cấu trúc phải viết thành tệp lệnh, chạy thử trên bản sao, đối chiếu kết quả, rồi mới áp lên hệ thống thật. Lý do và cách làm ở `00-5`.

**Nguyên tắc 3 — Đã sửa lỗi thì phải ghi lại.** Lỗi đã trả giá một lần thì không trả giá lần thứ hai. Mỗi dự án có một sổ tra cứu sự cố (`-10-tra-cuu-ky-thuat.md`) ghi dấu hiệu, nguyên nhân thật và cách xử lý.

**Nguyên tắc 4 — Bí mật không nằm trong mã nguồn.** Khoá truy cập, mật khẩu, chuỗi kết nối đặt ở biến môi trường hoặc bảng cấu hình trong hệ quản trị, không viết thẳng vào mã. Kho mã nguồn có thể bị sao chép; hệ thống thì không được sập theo.

---

## 1. Công đoạn 1 — Xác định yêu cầu

### Việc làm

| Bước | Nội dung |
| :---- | :---- |
| 1.1 | Làm việc trực tiếp với bộ phận đề xuất (kinh doanh, kỹ thuật, ban giám đốc) để nghe vấn đề cần giải quyết |
| 1.2 | Khảo sát hiện trạng: hiện đang làm thủ công thế nào, mất bao lâu, sai ở đâu |
| 1.3 | Viết lại vấn đề thành **yêu cầu nghiệp vụ** — mô tả kết quả mong muốn, không mô tả giải pháp |
| 1.4 | Chuyển yêu cầu nghiệp vụ thành **yêu cầu chức năng** — hệ thống phải làm được những gì, đánh mã `YC-xx` |
| 1.5 | Xác định **yêu cầu phi chức năng** — tốc độ, số người dùng đồng thời, bảo mật, đa ngữ, khả năng mở rộng |
| 1.6 | Chốt **tiêu chí nghiệm thu** — điều kiện cụ thể để nói "đã xong", đo được, không tranh cãi |
| 1.7 | Xác định **phạm vi loại trừ** — cái gì dứt khoát không làm trong đợt này |

### Đầu ra

Tài liệu `-02-cd1-xac-dinh-yeu-cau.md` của từng dự án.

### Bằng chứng để lại

- Tài liệu yêu cầu có đánh mã, đối chiếu được với chức năng đã dựng
- Tiêu chí nghiệm thu, đối chiếu được với biên bản kiểm thử ở công đoạn 4

### Quy tắc bắt buộc

Yêu cầu phải **đánh mã và đo được**. "Trang phải nhanh" không phải yêu cầu. "Trang danh sách nguyên liệu 500 bản ghi phải hiện đủ nội dung trong 3 giây trên đường truyền 10 Mbps" mới là yêu cầu.

---

## 2. Công đoạn 2 — Phân tích và thiết kế

Công đoạn nặng nhất và cũng là công đoạn quyết định. Chia làm ba phần, ba tài liệu.

### 2.1 Thiết kế kiến trúc

| Bước | Nội dung |
| :---- | :---- |
| 2.1.1 | Chọn kiểu kiến trúc và ghi rõ **lý do chọn**, kèm phương án đã cân nhắc rồi loại |
| 2.1.2 | Phân rã hệ thống thành các thành phần, xác định ranh giới trách nhiệm từng thành phần |
| 2.1.3 | Vẽ luồng xử lý cho các nghiệp vụ chính, từ lúc người dùng thao tác đến lúc dữ liệu được ghi |
| 2.1.4 | Xác định điểm tiếp giáp với hệ thống ngoài và giao thức trao đổi |
| 2.1.5 | Ghi **nhật ký quyết định kỹ thuật**: quyết định gì, vì sao, đánh đổi cái gì |

Mục 2.1.5 là mục hay bị bỏ nhất và cũng là mục có giá trị nhất. Sáu tháng sau, không ai nhớ vì sao chọn cách này. Ghi lại thì người sau không phá đi làm lại.

### 2.2 Thiết kế dữ liệu

| Bước | Nội dung |
| :---- | :---- |
| 2.2.1 | Xác định các thực thể nghiệp vụ và quan hệ giữa chúng |
| 2.2.2 | Thiết kế từng bảng: tên trường, kiểu dữ liệu, bắt buộc hay không, giá trị mặc định |
| 2.2.3 | Xác định ràng buộc: khoá chính, khoá ngoại, chỉ mục, quy tắc toàn vẹn |
| 2.2.4 | Xác định trường nào đa ngữ, trường nào dùng chung cho mọi ngôn ngữ |
| 2.2.5 | Xác định quyền đọc/ghi từng bảng theo vai trò |
| 2.2.6 | Xác định dữ liệu nhạy cảm và cách bảo vệ |

### 2.3 Thiết kế giao diện và luồng người dùng

| Bước | Nội dung |
| :---- | :---- |
| 2.3.1 | Lập bản đồ màn hình, đường dẫn từng màn |
| 2.3.2 | Vẽ luồng thao tác cho từng nhóm người dùng |
| 2.3.3 | Xác định quy tắc hiển thị: khi nào hiện gì, trạng thái rỗng, trạng thái lỗi, trạng thái đang tải |
| 2.3.4 | Xác định cách xử lý trên màn hình nhỏ |
| 2.3.5 | Xác định yêu cầu tiếp cận: bàn phím, trình đọc màn hình, độ tương phản |

### Đầu ra

Ba tài liệu `-03`, `-04`, `-05` của từng dự án.

### Bằng chứng để lại

Thiết kế đối chiếu được với mã nguồn thật. Người kiểm tra mở tài liệu thiết kế dữ liệu ra, mở cấu trúc bảng thật ra, hai bên phải khớp.

---

## 3. Công đoạn 3 — Lập trình, viết mã lệnh

### Việc làm

| Bước | Nội dung |
| :---- | :---- |
| 3.1 | Tách công việc thành từng phần nhỏ hoàn thành được trong một buổi tới một ngày |
| 3.2 | Viết mã theo quy chuẩn ở `00-5` |
| 3.3 | Tự kiểm tra tại chỗ: chạy thử luồng vừa viết, kiểm cả trường hợp bình thường lẫn trường hợp biên |
| 3.4 | Chạy bộ kiểm tra kiểu dữ liệu và bộ soát lỗi tĩnh, phải sạch mới ghi nhận |
| 3.5 | Ghi nhận thay đổi vào kho mã nguồn, mô tả **vì sao sửa**, không chỉ mô tả *sửa gì* |
| 3.6 | Thay đổi cấu trúc dữ liệu thì viết kịch bản chuyển đổi, kiểm chứng theo `00-5` |

### Đầu ra

- Mã nguồn hoạt động
- Nhật ký phát triển trong tài liệu `-06-cd3-lap-trinh-va-nhat-ky.md`

### Bằng chứng để lại

Lịch sử ghi nhận thay đổi trong kho mã nguồn. Mỗi lần ghi nhận là một mốc kiểm chứng được: thời điểm, người thực hiện, nội dung thay đổi ở mức từng dòng.

### Quy tắc viết mô tả thay đổi

Mô tả phải trả lời được câu hỏi *"vì sao"*, vì *"sửa gì"* thì đọc mã là biết.

> Kém: `sửa lỗi bảng tin`
>
> Được: `sửa lỗi trang bài viết trắng do thiếu cột industries_id ở bảng phiên bản _posts_v_rels — collection có bật bản nháp nên sinh bảng phiên bản song song, kịch bản chuyển đổi trước đó bỏ sót bảng này`

---

## 4. Công đoạn 4 — Kiểm tra, thử nghiệm phần mềm

### Bốn lớp kiểm thử

| Lớp | Nội dung | Ai làm |
| :---- | :---- | :---- |
| Kiểm tra tĩnh | Kiểm kiểu dữ liệu, soát lỗi cú pháp, soát quy chuẩn | Tự động, chạy mỗi lần dựng |
| Kiểm thử chức năng | Chạy theo bộ ca kiểm thử, đối chiếu kết quả thật với kết quả mong đợi | Người kiểm thử |
| Kiểm thử phi chức năng | Tốc độ, tải, bảo mật, đa ngữ, màn hình nhỏ, khả năng tiếp cận | Người kiểm thử |
| Nghiệm thu người dùng | Bộ phận đặt hàng dùng thử trên dữ liệu thật, xác nhận đạt yêu cầu | Bộ phận nghiệp vụ |

### Cách viết ca kiểm thử

Mỗi ca gồm sáu phần, không thiếu phần nào:

| Thành phần | Ví dụ |
| :---- | :---- |
| Mã ca | `TC-DA1-018` |
| Yêu cầu đối chiếu | `YC-07` |
| Điều kiện đầu | Đã đăng nhập bằng tài khoản biên tập viên; có ít nhất 3 bài viết đã xuất bản |
| Các bước | 1. Mở trang Bài viết. 2. Bấm nút Thêm mới. 3. Bỏ trống ô Tiêu đề. 4. Bấm Lưu |
| Kết quả mong đợi | Hệ thống chặn lưu, hiện thông báo lỗi ngay dưới ô Tiêu đề, không tạo bản ghi |
| Kết quả thật | *(điền khi chạy)* |

**Bắt buộc có ca kiểm thử âm.** Ca thử "làm đúng thì chạy được" chỉ chứng minh một nửa. Ca thử "làm sai thì bị chặn đúng chỗ" mới là ca có giá trị — đó là chỗ phần mềm hay hỏng.

### Đầu ra

Tài liệu `-07-cd4-kiem-thu-va-uat.md`: chiến lược kiểm thử, bộ ca kiểm thử, kết quả chạy, biên bản nghiệm thu.

### Bằng chứng để lại

- Bộ ca kiểm thử có đánh mã, đối chiếu ngược được về yêu cầu ở công đoạn 1
- Biên bản nghiệm thu có chữ ký bộ phận nghiệp vụ

---

## 5. Công đoạn 5 — Hoàn thiện, đóng gói sản phẩm

### Việc làm

| Bước | Nội dung |
| :---- | :---- |
| 5.1 | Rà soát lần cuối: gỡ mã thử nghiệm, gỡ dữ liệu giả, gỡ dòng ghi nhật ký tạm |
| 5.2 | Đặt số hiệu phiên bản |
| 5.3 | Dựng bản phát hành, đóng gói thành ảnh chứa (container image) |
| 5.4 | Kiểm tra bản đóng gói chạy được trong môi trường sạch |
| 5.5 | Lập danh sách thay đổi của phiên bản |
| 5.6 | Chuẩn bị kịch bản chuyển đổi dữ liệu kèm theo phiên bản |

### Đầu ra

Bản đóng gói chạy được + danh sách thay đổi, ghi trong `-08`.

### Bằng chứng để lại

Tệp định nghĩa cách đóng gói (`Dockerfile`, `docker-compose.yml`) nằm trong kho mã nguồn, có lịch sử thay đổi.

---

## 6. Công đoạn 6 — Cài đặt, chuyển giao, hướng dẫn sử dụng, bảo trì, bảo hành

### 6.1 Cài đặt và chuyển giao

| Bước | Nội dung |
| :---- | :---- |
| 6.1.1 | **Sao lưu trước**. Sao lưu cơ sở dữ liệu và tệp tải lên trước khi đụng vào hệ thống thật |
| 6.1.2 | Áp kịch bản chuyển đổi dữ liệu, đọc kết quả trả về, xác nhận đúng như khi chạy thử |
| 6.1.3 | Dựng lại và khởi động bản mới |
| 6.1.4 | Kiểm tra sau triển khai theo danh sách đã lập sẵn |
| 6.1.5 | Nếu hỏng: quay về phiên bản trước và khôi phục dữ liệu từ bản sao lưu |

### 6.2 Hướng dẫn sử dụng

Mỗi dự án có tài liệu `-09-huong-dan-su-dung.md` viết cho **người dùng thật**, không viết cho lập trình viên: mô tả theo việc cần làm, kèm đường đi trong giao diện, kèm cảnh báo ở những chỗ dễ sai.

### 6.3 Bảo trì và bảo hành

| Loại | Nội dung | Thời hạn xử lý |
| :---- | :---- | :---- |
| Sự cố nghiêm trọng | Hệ thống ngừng phục vụ, mất dữ liệu | Xử lý ngay |
| Sự cố nặng | Chức năng chính không dùng được, không có cách đi vòng | Trong ngày làm việc |
| Sự cố nhẹ | Chức năng phụ lỗi, hoặc có cách đi vòng | Trong tuần |
| Đề nghị cải tiến | Thay đổi chức năng, thêm chức năng | Đưa vào kế hoạch đợt sau |

Mọi sự cố ghi vào sổ tra cứu `-10-tra-cuu-ky-thuat.md`, mục "Sự cố đã gặp", gồm: dấu hiệu, nguyên nhân thật, cách xử lý, cách phòng lần sau.

### Đầu ra

Tài liệu `-08` (phần cài đặt, chuyển giao, bảo trì), `-09`, và mục sự cố trong `-10`.

---

## 7. Công đoạn 7 — Phát hành, phân phối sản phẩm

Ba sản phẩm này là phần mềm **dùng nội bộ và phục vụ hoạt động kinh doanh của công ty**, không bán bản sao ra thị trường. "Phát hành" ở đây nghĩa là đưa vào vận hành phục vụ người dùng thật.

| Sản phẩm | Hình thức phát hành | Địa chỉ vận hành | Người dùng |
| :---- | :---- | :---- | :---- |
| DA1 | Cổng thông tin công khai + hệ quản trị nội bộ | `bioscope.vn`, `admin.bioscope.vn` | Khách hàng, đối tác, nhân viên |
| DA2 | Chức năng trong hệ quản trị | `admin.bioscope.vn` | Biên tập viên, quản trị viên |
| DA3 | Khung chat trên web + các kênh nhắn tin | Web, Zalo, Telegram, Messenger, WhatsApp | Khách hàng, nhân viên kinh doanh |

### Bằng chứng để lại

Hệ thống đang chạy thật, truy cập được, có người dùng thật, có dữ liệu thật.

---

## 8. Sơ đồ tổng quát

```
        ┌──────────────────────────────────────────────────┐
        │  CĐ1  XÁC ĐỊNH YÊU CẦU                           │
        │  Bộ phận nghiệp vụ ─→ yêu cầu có mã, đo được     │
        └───────────────────────┬──────────────────────────┘
                                ↓
        ┌──────────────────────────────────────────────────┐
        │  CĐ2  PHÂN TÍCH VÀ THIẾT KẾ                      │
        │  ├─ kiến trúc + nhật ký quyết định               │
        │  ├─ mô hình dữ liệu                              │
        │  └─ giao diện và luồng                           │
        └───────────────────────┬──────────────────────────┘
                                ↓
        ┌──────────────────────────────────────────────────┐
        │  CĐ3  LẬP TRÌNH                                  │
        │  viết mã → tự kiểm → soát tĩnh → ghi nhận        │
        └───────────────────────┬──────────────────────────┘
                                ↓
        ┌──────────────────────────────────────────────────┐
        │  CĐ4  KIỂM THỬ                                   │
        │  tĩnh → chức năng → phi chức năng → nghiệm thu   │
        └───────────┬────────────────────────┬─────────────┘
                    │ đạt                    │ không đạt
                    ↓                        └──→ quay lại CĐ3
        ┌──────────────────────────────────────────────────┐
        │  CĐ5  ĐÓNG GÓI                                   │
        │  đánh phiên bản → dựng ảnh chứa → kiểm bản đóng  │
        └───────────────────────┬──────────────────────────┘
                                ↓
        ┌──────────────────────────────────────────────────┐
        │  CĐ6  CÀI ĐẶT · CHUYỂN GIAO · BẢO TRÌ            │
        │  sao lưu → chuyển đổi dữ liệu → triển khai →     │
        │  kiểm tra sau triển khai → hướng dẫn → bảo trì   │
        └───────────────────────┬──────────────────────────┘
                                ↓
        ┌──────────────────────────────────────────────────┐
        │  CĐ7  PHÁT HÀNH                                  │
        │  đưa vào vận hành phục vụ người dùng thật        │
        └──────────────────────────────────────────────────┘
```

Quy trình chạy lặp: mỗi đợt tính năng đi trọn vòng từ CĐ1 đến CĐ7. Sản phẩm không dựng một lần rồi thôi — nó lớn dần qua nhiều vòng, và lịch sử mã nguồn ghi lại đúng các vòng đó.
