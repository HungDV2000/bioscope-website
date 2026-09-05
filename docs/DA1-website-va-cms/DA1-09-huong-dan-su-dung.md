<!--HOSO
phu_de: Website Bioscope và Hệ quản trị nội dung
pham_vi: Dự án DA1 — người dùng cuối và quản trị viên
ngay_lap: 28/08/2026
phien_ban: 1.1
nguoi_lap: A Hùng — Product Owner, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 28/08/2026 | Ban hành lần đầu
lich_su: 1.1 | 03/09/2026 | Bổ sung hướng dẫn quản lý bình luận
-->
# DA1 — HƯỚNG DẪN SỬ DỤNG
## Website Bioscope và Hệ quản trị nội dung

*Tài liệu viết cho **người dùng thật**, không viết cho lập trình viên. Trình bày theo việc cần làm.*

---

## 0. Bắt đầu

### Đăng nhập

1. Mở `admin.bioscope.vn`
2. Nhập thư điện tử và mật khẩu công ty cấp
3. Bấm **Đăng nhập**

**Lần đầu đăng nhập: đổi mật khẩu ngay.** Vào biểu tượng tài khoản ở góc trên bên phải → **Tài khoản** → đổi mật khẩu.

### Ba vai trò

| Vai trò | Làm được gì |
| :---- | :---- |
| **Quản trị viên** | Mọi việc, kể cả cấu hình hệ thống, quản lý người dùng, cấp khoá truy cập |
| **Biên tập viên** | Thêm/sửa/xoá nội dung. Không vào được cấu hình hệ thống và quản lý người dùng |
| **Chỉ đọc** | Xem, không sửa |

Không thấy một mục nào đó ở cột trái nghĩa là vai trò của bạn không có quyền với mục đó — không phải hệ thống lỗi.

### Bố cục màn hình

| Vùng | Nội dung |
| :---- | :---- |
| Cột trái | Danh sách các mục quản lý, gom theo nhóm |
| Giữa | Danh sách bản ghi hoặc biểu mẫu đang sửa |
| Trên cùng bên phải | Tìm kiếm, chọn ngôn ngữ, tài khoản |

**Mẹo:** bấm **Ctrl + K** (Windows) hoặc **Cmd + K** (Mac) để tìm nhanh bất cứ thứ gì trong hệ quản trị.

---

## 1. Ba khái niệm phải hiểu trước

Hiểu ba khái niệm này thì dùng được toàn bộ hệ thống. Không hiểu thì sẽ liên tục gặp chuyện khó hiểu.

### 1.1 Nháp và Đã xuất bản

Mỗi bản ghi có hai trạng thái:

| Trạng thái | Nghĩa | Khách có thấy không |
| :---- | :---- | :---- |
| **Nháp** | Đang soạn, chưa xong | **Không** |
| **Đã xuất bản** | Đã duyệt, đang hiển thị | **Có** |

Nút **Lưu nháp** ghi lại mà chưa cho ai thấy. Nút **Xuất bản** mới đưa ra ngoài.

> **Chuyện hay gặp:** "Tôi sửa rồi mà ngoài web không thấy đổi." — Hầu hết là do mới bấm *Lưu nháp* chứ chưa bấm *Xuất bản*. Kiểm nhãn trạng thái ở góc phải biểu mẫu.

### 1.2 Hai ngôn ngữ là hai nội dung riêng

Hệ thống có tiếng Việt và tiếng Anh. **Chúng độc lập nhau.**

Sửa tiêu đề ở tiếng Việt thì tiêu đề tiếng Anh **không** đổi theo. Muốn đổi cả hai thì phải chuyển ngôn ngữ và sửa cả hai lần.

Chuyển ngôn ngữ bằng ô chọn ở góc trên bên phải biểu mẫu.

**Không phải trường nào cũng có hai bản.** Trường như mã nguyên liệu, giá, ảnh chỉ có một bản dùng chung — vì chúng không phụ thuộc ngôn ngữ.

> **Rất quan trọng:** bài viết chỉ soạn tiếng Việt sẽ **không hiện** trên trang tiếng Anh. Đây là cố ý — trước đây bài như vậy vẫn hiện trong danh sách tiếng Anh nhưng mở ra thì trắng, khách tưởng web hỏng. Muốn bài xuất hiện ở cả hai nơi thì phải soạn cả hai ngôn ngữ.

### 1.3 Xoá là chuyển vào thùng rác

Bấm **Xoá** không mất hẳn. Bản ghi vào **Thùng rác** và khôi phục được.

Vào thùng rác: mở mục tương ứng → lọc theo trạng thái **Trong thùng rác**.

---

## 2. Quản lý nguyên liệu

Đây là việc làm nhiều nhất.

### 2.1 Thêm nguyên liệu mới

1. Cột trái → **Bioscope** → **Nguyên liệu**
2. Bấm **Thêm mới**
3. Điền theo tám thẻ (mục 2.2)
4. **Lưu nháp** để soạn tiếp, hoặc **Xuất bản** để đưa ra ngoài

### 2.2 Tám thẻ của biểu mẫu nguyên liệu

Biểu mẫu có 73 trường nên chia tám thẻ. Không bắt buộc điền hết — chỉ **Tên** là bắt buộc.

| Thẻ | Điền gì | Ai thấy |
| :---- | :---- | :---- |
| **Tổng quan** | Tên, phụ đề, loại, nhãn, tên INCI, liều dùng gợi ý, phân loại, xuất xứ, thương hiệu, đối tác, số lượng đặt tối thiểu, **bảng giá** | Công khai, **trừ bảng giá** |
| **Nội dung** | Mô tả, lợi ích, ứng dụng, các nhóm thuộc tính lọc, huy hiệu | Công khai |
| **Hình ảnh** | Ảnh đại diện, thư viện ảnh | Công khai |
| **Kỹ thuật** | Chỉ tiêu kỹ thuật, thông số bổ sung | Công khai |
| **Pháp lý** | Trạng thái pháp lý, hồ sơ pháp lý | Công khai |
| **Tài liệu** | Tệp đính kèm | Công khai hoặc có kiểm soát |
| **Nghiên cứu** | Tài liệu nghiên cứu, tham chiếu | Công khai |
| **Đồng bộ** | Trạng thái đồng bộ kho tài liệu | Chỉ nội bộ |

### 2.3 Bảng giá — đọc kỹ mục này

Bảng giá nằm ở thẻ **Tổng quan**, nhập được nhiều bậc theo số lượng.

> ### ⚠ Bảng giá KHÔNG hiển thị ra ngoài
>
> Hệ thống khoá trường này ở mức sâu nhất: **chỉ nhân viên đã đăng nhập mới đọc được.** Khách xem web không thấy. Hệ thống ngoài gọi qua giao diện lập trình cũng không nhận được.
>
> Đây là chủ ý thiết kế. Bảng giá sỉ là dữ liệu thương mại nhạy cảm nhất của công ty; để lọt ra là đối thủ lấy sạch bằng một lệnh.
>
> **Vì vậy: nhập bảng giá thoải mái, không sợ lộ.**

Cách nhập nhiều bậc:

1. Điền **Ngày báo giá** và **Đơn vị tiền**
2. Ở mục **Bậc giá**, bấm **Thêm dòng** cho mỗi mức số lượng
3. Mỗi dòng: số lượng đặt tối thiểu, đơn giá, đơn vị tính, ghi chú
4. Ô **Điều kiện** ghi điều khoản chung — ô này có hai ngôn ngữ

### 2.4 Bộ thuộc tính lọc

Ở thẻ **Nội dung** có năm nhóm thuộc tính. Đây là thứ khách dùng để **lọc** trên trang danh sách.

| Nhóm | Nghĩa |
| :---- | :---- |
| Thành phần chính | Hoạt chất chính |
| Chức năng | Công dụng chính |
| Bản chất | Nguồn gốc, bản chất |
| Dạng | Dạng bào chế |
| Tính chất | Đặc tính lý hoá |

Chỉ chọn được giá trị đã có sẵn trong danh mục. Cần giá trị mới thì vào **Thuộc tính nguyên liệu** thêm trước, **nhớ chọn đúng nhóm**, rồi quay lại chọn.

### 2.5 Ẩn một nguyên liệu khỏi website

Có hai cách, khác nhau:

| Cách | Kết quả | Dùng khi |
| :---- | :---- | :---- |
| Chuyển về **Nháp** | Không hiện ra ngoài; vẫn sửa được | Đang cập nhật nội dung |
| Bật công tắc **Ẩn khỏi website** | Không hiện ra ngoài dù đã xuất bản | Ngừng kinh doanh tạm thời, giữ nguyên dữ liệu |

### 2.6 Sao chép nhanh một nguyên liệu

Nguyên liệu mới gần giống nguyên liệu cũ: mở bản cũ → menu **⋯** → **Nhân bản** → sửa phần khác → xuất bản. Nhanh hơn nhiều so với điền lại 73 trường.

---

## 3. Viết bài cho bản tin

### 3.1 Đăng một bài

1. Cột trái → **Bài viết**
2. **Thêm mới**
3. Điền:

| Trường | Ghi chú |
| :---- | :---- |
| **Tiêu đề** | Bắt buộc |
| **Đường dẫn** | Tự sinh từ tiêu đề; sửa được. **Đã xuất bản rồi thì cân nhắc kỹ trước khi đổi** — đường dẫn cũ sẽ hỏng |
| **Ảnh đại diện** | Nên có. Không đặt thì hệ thống dùng ảnh mặc định |
| **Mô tả ngắn** | Hiện ở danh sách và khi chia sẻ lên mạng xã hội |
| **Nội dung** | Soạn bằng trình soạn thảo |
| **Chủ đề** | Bài nói về *cái gì* |
| **Ngành** | Bài áp dụng cho *ngành nào* |
| **Thẻ** | Từ khoá tự do |
| **Ngày xuất bản** | Đặt ngày tương lai để hẹn giờ đăng |

4. **Xuất bản**
5. **Chuyển sang tiếng Anh và soạn bản tiếng Anh**, nếu muốn bài hiện ở `/news`

### 3.2 Ba trục phân loại — đừng nhầm

| | Trả lời câu hỏi | Ví dụ |
| :---- | :---- | :---- |
| **Chủ đề** | Bài này nói về gì? | Kiến thức nguyên liệu, Xu hướng thị trường |
| **Ngành** | Bài này cho ngành nào? | Thực phẩm chức năng, Mỹ phẩm |
| **Thẻ** | Từ khoá cụ thể | Collagen, Kháng viêm |

Một bài có thể cùng lúc thuộc chủ đề "Xu hướng thị trường", ngành "Mỹ phẩm", và mang thẻ "Collagen".

### 3.3 Soạn nội dung

Trình soạn thảo hỗ trợ: đầu đề nhiều cấp, chữ đậm nghiêng gạch chân, danh sách, liên kết, ảnh, bảng, trích dẫn.

**Về đầu đề — quan trọng cho mục lục:** hệ thống tự dựng mục lục bên cạnh bài viết từ các đầu đề. Dùng đúng cấp (Đầu đề 2 cho mục lớn, Đầu đề 3 cho mục con) thì mục lục đẹp. Dùng chữ đậm thay cho đầu đề thì mục lục sẽ trống.

**Về đoạn trống:** cố ý chèn dòng trống để ngăn khổ thì hệ thống giữ nguyên, hiện ra ngoài đúng như soạn.

### 3.4 Khối "Bài viết mới" ở trang chủ

Cột trái → **Trang** → mở trang chủ → thêm khối **Bài viết mới**:

| Cấu hình | Ghi chú |
| :---- | :---- |
| Tiêu đề khối | Có hai ngôn ngữ |
| Mô tả | Có hai ngôn ngữ, soạn có định dạng |
| Số bài hiển thị | 1 đến 12. **Quá 3 bài thì tự chuyển dạng trượt ngang** |
| Chủ đề | Để trống = lấy bài mới nhất mọi chủ đề |
| Liên kết "Xem tất cả" | Tuỳ chọn |

---

## 4. Quản lý bình luận

### 4.1 Bật bình luận

Bình luận **mặc định tắt**. Bật ở: **Cài đặt website** → thẻ **Bình luận**.

| Cấu hình | Mặc định | Ý nghĩa |
| :---- | :---- | :---- |
| Bật bình luận | **Tắt** | Tắt thì khu bình luận biến mất hoàn toàn khỏi trang bài viết |
| Duyệt trước khi hiển thị | Bật | Bình luận vào trạng thái chờ duyệt, phải duyệt mới hiện |
| Bắt buộc nhập email | Tắt | |
| Số ký tự tối đa | 1500 | |
| Số bình luận tối đa mỗi giờ | 5 | Tính theo địa chỉ mạng, chống gửi hàng loạt |
| Ghi chú dưới khung nhập | Trống | Có hai ngôn ngữ; trống thì dùng câu mặc định |

> ### ⚠ Cân nhắc trước khi bật
>
> Bật bình luận là **mở một đường cho người lạ ghi dữ liệu vào hệ thống**. Đây là chức năng duy nhất trên toàn bộ website cho phép người chưa đăng nhập ghi vào cơ sở dữ liệu.
>
> Hệ thống đã có năm lớp bảo vệ và đã kiểm chứng bằng phép thử thật. Nhưng vẫn nên:
>
> - **Giữ "Duyệt trước khi hiển thị" luôn bật.** Tắt mục này nghĩa là mọi thứ người lạ gõ vào sẽ hiện thẳng lên website công ty.
> - Xem mục Bình luận ít nhất vài ngày một lần.

### 4.2 Duyệt bình luận

1. Cột trái → **Bài viết** → **Bình luận**
2. Bình luận mới ở trạng thái **Chờ duyệt**
3. Mở bình luận, đọc nội dung
4. Đổi **Trạng thái**:

| Đổi thành | Kết quả |
| :---- | :---- |
| **Đã duyệt** | Hiện trên trang bài viết |
| **Chờ duyệt** | Không hiện |
| **Rác** | Không hiện; giữ lại để đối chiếu |

5. **Lưu**

**Bình luận có chứa thư điện tử và địa chỉ mạng của người gửi.** Đây là dữ liệu cá nhân — chỉ nhân viên xem được, không bao giờ hiển thị ra ngoài. Không sao chép hai thông tin này ra ngoài hệ thống.

---

## 5. Quản lý hình ảnh và tệp

### 5.1 Tải lên

Cột trái → **Thư viện** → **Tải lên**. Hệ thống tự tạo nhiều kích thước cho ảnh.

### 5.2 Nên và không nên

| Nên | Không nên |
| :---- | :---- |
| Đặt tên tệp có nghĩa: `collagen-peptide-nhat-ban.jpg` | Để tên máy ảnh: `IMG_4821.jpg` |
| Điền mô tả ảnh — giúp người khiếm thị và giúp tìm kiếm | Bỏ trống mô tả |
| Nén ảnh trước khi tải lên | Tải ảnh 8 MB chụp từ máy ảnh |
| Tái sử dụng ảnh đã có | Tải lại cùng một ảnh nhiều lần |

### 5.3 Tài liệu có kiểm soát

Tài liệu chỉ khách đã đăng nhập mới tải được:

1. Cột trái → **Tài liệu kiểm soát**
2. **Thêm mới**, tải tệp lên, đặt tiêu đề và mô tả
3. Lưu

Xem ai đã tải: mở mục thống kê lượt tải trong hệ quản trị.

---

## 6. Cấu hình website

Chỉ **quản trị viên** vào được.

| Mục | Cấu hình gì |
| :---- | :---- |
| **Cài đặt website** | Tên công ty, điện thoại, thư điện tử, địa chỉ, mã số thuế, chân trang, bình luận |
| **Nhận diện** | Logo, biểu tượng trang, màu chủ đạo |
| **Điều hướng** | Thanh menu chính |
| **Tối ưu tìm kiếm** | Tiêu đề mặc định, mô tả mặc định, ảnh chia sẻ |
| **Trang chủ** | Toàn bộ các khối trang chủ |
| **Đăng nhập** | Bật/tắt đăng nhập Google |
| **Đồng ý dữ liệu** | Nội dung xin phép dùng dữ liệu cá nhân |
| **Cài đặt Chat** | Bật/tắt chat, kết nối kênh nhắn tin, câu chào |
| **Cài đặt AI** | Nhà cung cấp và mô hình (xem hồ sơ DA2) |
| **An ninh** | Chặn địa chỉ, ngưỡng cảnh báo |

**Nguyên tắc chung:** sửa xong bấm **Lưu**. Thay đổi hiện ra ngoài ngay hoặc trong vòng một phút.

---

## 7. Chat với khách

### 7.1 Cách hoạt động

```
Khách gõ tin trên website
        ↓
Tin chuyển sang nhóm nhắn tin của bộ phận kinh doanh
        ↓
Nhân viên trả lời NGAY TRONG ỨNG DỤNG NHẮN TIN
        ↓
Câu trả lời hiện lại trên website cho khách
```

**Nhân viên kinh doanh không cần mở hệ quản trị.** Chỉ cần dùng ứng dụng nhắn tin như bình thường.

### 7.2 Thẻ giới thiệu khách

Khi khách bắt đầu chat, hệ thống gửi kèm một thẻ giới thiệu:

| Thông tin | Ví dụ |
| :---- | :---- |
| Loại khách | Doanh nghiệp / Cá nhân |
| Tên, công ty | nếu đã đăng nhập |
| Vị trí ước lượng | Thành phố, quốc gia |
| Thiết bị | Điện thoại / máy tính, trình duyệt |
| Nguồn truy cập | Đến từ đâu |
| Trang đang xem | Trang bắt đầu chat |

Nhờ vậy nhân viên biết ngay đang nói chuyện với ai và họ quan tâm gì, không phải hỏi lại từ đầu.

### 7.3 Xem lại hội thoại cũ

Cột trái → **Hội thoại**. Xem được toàn bộ nội dung và thông tin ngữ cảnh.

---

## 8. Người dùng và phân quyền

Chỉ **quản trị viên**.

### Thêm nhân viên

1. Cột trái → **Người dùng** → **Thêm mới**
2. Điền tên, thư điện tử, chọn vai trò
3. Lưu — hệ thống gửi thư mời đặt mật khẩu

### Nguyên tắc cấp quyền

> **Cấp quyền vừa đủ để làm việc, không cấp dư.**
>
> Người chỉ viết bài thì cấp vai trò **Biên tập viên**, không cấp **Quản trị viên**. Quản trị viên sửa được cấu hình hệ thống và cấp được khoá truy cập — một thao tác nhầm ở đó ảnh hưởng toàn hệ thống.
>
> Số quản trị viên nên giữ ở mức **một đến hai người**.

### Nhân viên nghỉ việc

**Vô hiệu hoá tài khoản ngay trong ngày.** Không xoá — xoá thì mất luôn dấu vết trong nhật ký thay đổi.

---

## 9. Xử lý tình huống thường gặp

| Tình huống | Nguyên nhân thường gặp | Cách xử lý |
| :---- | :---- | :---- |
| Sửa rồi mà ngoài web không đổi | Mới *Lưu nháp*, chưa *Xuất bản* | Bấm **Xuất bản** |
| Đã xuất bản, vẫn chưa thấy đổi | Trang còn trong bộ nhớ đệm | Chờ khoảng một phút, hoặc bấm **Xoá bộ nhớ đệm** |
| Bài viết không hiện ở trang tiếng Anh | Chưa soạn bản tiếng Anh | Chuyển ngôn ngữ, soạn bản tiếng Anh, xuất bản |
| Sửa tiếng Việt xong tiếng Anh vẫn cũ | Hai ngôn ngữ độc lập | Chuyển ngôn ngữ và sửa cả hai |
| Không thấy một mục ở cột trái | Vai trò không có quyền | Liên hệ quản trị viên |
| Không chọn được thuộc tính lọc cần dùng | Giá trị chưa có trong danh mục | Thêm ở **Thuộc tính nguyên liệu**, chọn đúng nhóm |
| Xoá nhầm | Bản ghi trong thùng rác | Lọc trạng thái **Trong thùng rác** → **Khôi phục** |
| Bảng giá không thấy ngoài web | **Đúng như thiết kế** | Không phải lỗi. Xem mục 2.3 |
| Ảnh tải lên bị mờ | Ảnh gốc độ phân giải thấp | Dùng ảnh gốc lớn hơn |
| Bình luận không hiện | Chưa duyệt, hoặc chưa bật bình luận | Xem mục 4 |
| Khung chat không hiện trên web | Chat đang tắt | **Cài đặt Chat** → bật |

---

## 10. Việc không được làm

| Không được | Vì sao |
| :---- | :---- |
| Chia sẻ tài khoản cho người khác dùng chung | Nhật ký thay đổi sẽ ghi sai người, mất khả năng truy vết |
| Sao chép thư điện tử và địa chỉ mạng của khách ra ngoài hệ thống | Dữ liệu cá nhân, vi phạm chính sách bảo vệ dữ liệu |
| Tắt "Duyệt trước khi hiển thị" của bình luận | Mọi thứ người lạ gõ vào sẽ hiện thẳng lên website công ty |
| Đổi đường dẫn của bài đã xuất bản lâu mà không báo | Đường dẫn cũ hỏng, mất thứ hạng tìm kiếm, liên kết đã chia sẻ chết |
| Xoá tài khoản nhân viên nghỉ việc | Mất dấu vết trong nhật ký. Hãy **vô hiệu hoá** |
| Sửa trực tiếp trên máy chủ | Mọi thay đổi phải đi qua quy trình. Xem `00-5` |

---

## 11. Cần trợ giúp

| Loại việc | Liên hệ |
| :---- | :---- |
| Không biết dùng một chức năng | Đọc lại tài liệu này; hỏi quản trị viên |
| Nghi ngờ hệ thống lỗi | Báo quản trị viên, **kèm ảnh chụp màn hình và mô tả các bước đã làm** |
| Hệ thống ngừng phục vụ | Báo ngay bộ phận kỹ thuật |
| Đề nghị thêm chức năng | Gửi bộ phận kỹ thuật để đưa vào kế hoạch |

**Khi báo lỗi, nêu đủ bốn thứ:** đang làm gì, đã bấm những nút nào, kết quả mong đợi là gì, kết quả thật là gì. Thiếu bốn thứ này thì người xử lý phải hỏi lại từ đầu và mất thêm một vòng.
