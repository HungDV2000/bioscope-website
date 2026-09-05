<!--HOSO
phu_de: Website Bioscope và Hệ quản trị nội dung
pham_vi: Dự án DA1
ngay_lap: 02/06/2026
phien_ban: 1.2
nguoi_lap: Quân — Team phát triển, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 02/06/2026 | Ban hành lần đầu
lich_su: 1.1 | 17/08/2026 | Bổ sung thiết kế giao diện lập trình và cơ chế danh sách trắng
lich_su: 1.2 | 31/08/2026 | Bổ sung nhật ký quyết định QĐ-06, QĐ-08
-->
# DA1 — CÔNG ĐOẠN 2: THIẾT KẾ KIẾN TRÚC
## Website Bioscope và Hệ quản trị nội dung

---

## 1. Kiến trúc tổng thể

Hệ thống chia làm **hai ứng dụng độc lập** dùng chung một cơ sở dữ liệu và một thư viện mô-đun:

```
                        Người dùng cuối
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
   Khách vãng lai       Nhân viên công ty     Hệ thống ngoài
          │                    │                    │
          ↓                    ↓                    ↓
   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
   │  bioscope.vn │    │  admin.      │    │  Giao diện   │
   │  Cổng thông  │    │  bioscope.vn │    │  lập trình   │
   │  tin công    │    │  Hệ quản trị │    │  có khoá     │
   │  khai        │    │  nội dung    │    │              │
   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
          │                   │                   │
          │  gọi giao diện    │                   │
          │  lập trình        │                   │
          └───────────────────┴───────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Ứng dụng CMS    │
                    │   (dvcms-app)     │
                    │  ┌─────────────┐  │
                    │  │ 12 mô-đun   │  │
                    │  │ chức năng   │  │
                    │  └─────────────┘  │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │   PostgreSQL 16   │
                    │   (dvcms-db)      │
                    └───────────────────┘
```

### Vì sao tách hai ứng dụng

| Phương án | Ưu | Nhược | Quyết định |
| :---- | :---- | :---- | :---- |
| Một ứng dụng, quản trị nằm trong cùng trang web | Đơn giản, một lần dựng | Trang công khai và trang quản trị dùng chung tiến trình — quản trị làm việc nặng thì khách bị chậm theo; lỗi ở quản trị làm sập cả trang công khai; bề mặt tấn công lớn hơn | **Loại** |
| Hai ứng dụng riêng, chung cơ sở dữ liệu | Cách ly sự cố; tối ưu riêng cho từng bên; hệ quản trị đặt sau tên miền riêng, siết truy cập được | Phức tạp hơn khi triển khai; phải định nghĩa giao diện giữa hai bên | **Chọn** |
| Hai ứng dụng, hai cơ sở dữ liệu, đồng bộ | Cách ly triệt để | Đồng bộ dữ liệu là bài toán khó, dễ lệch | **Loại** |

Đánh đổi đã chấp nhận: phải tự viết lớp giao tiếp giữa cổng thông tin và hệ quản trị. Bù lại, trang công khai không bao giờ chậm vì biên tập viên đang tải tệp lớn.

---

## 2. Phân rã thành phần

### 2.1 Ứng dụng CMS (`apps/core-cms`)

| Thành phần | Trách nhiệm |
| :---- | :---- |
| Giao diện quản trị | Màn hình cho nhân viên thao tác nội dung |
| Lớp lưu trữ | Đọc/ghi cơ sở dữ liệu, quản lý phiên bản, thùng rác |
| Xác thực và phân quyền | Đăng nhập nhân viên, kiểm quyền từng thao tác |
| Giao diện lập trình nội bộ | Phục vụ cổng thông tin lấy dữ liệu |
| Giao diện lập trình công khai | Phục vụ hệ thống ngoài, có khoá và phạm vi |
| Dây chuyền AI | Xem DA2 |
| Cầu nối chat | Nhận tin từ web, đẩy sang kênh nhắn tin, nhận trả lời |

### 2.2 Ứng dụng cổng thông tin (`apps/bioscope-frontend`)

| Thành phần | Trách nhiệm |
| :---- | :---- |
| Dựng trang phía máy chủ | Dựng sẵn nội dung trên máy chủ, gửi trang hoàn chỉnh cho trình duyệt |
| Lớp gọi dữ liệu | Gọi giao diện lập trình của CMS, có bộ nhớ đệm |
| Thành phần giao diện | 68 thành phần dựng nên các trang |
| Lớp đa ngữ | Chọn ngôn ngữ, đường dẫn theo ngôn ngữ, chuỗi giao diện |
| Lớp phiên khách hàng | Đăng nhập, giữ phiên bằng bánh quy có ký |
| Cổng trung chuyển | Chuyển tiếp yêu cầu sang CMS để không lộ địa chỉ nội bộ |

### 2.3 Thư viện mô-đun (`packages/`)

12 gói. Mỗi gói là một **phần bổ trợ** tự khai báo dữ liệu và chức năng của mình, rồi được lắp vào cấu hình chung.

Cơ chế lắp ráp — trích mã thật:

```ts
export const corePlugin =
  (options: CorePluginOptions = {}): Plugin =>
  (incoming: Config): Config => {
    const config = { ...incoming }
    ...
    config.collections = [
      ...(config.collections ?? []),
      Users, Media,
      withRevalidate(Pages),
      withRevalidate(Posts),
      Categories, Tags, Industries, PostComments,
      Forms, FormSubmissions, Redirects,
    ]
    config.globals = [...(config.globals ?? []), SiteSettings, Navigation]
    return config
  }
```

Mỗi phần bổ trợ nhận cấu hình đang có, thêm phần của mình, trả về cấu hình mới. Lắp ráp trong tệp cấu hình chính:

```ts
plugins: [
  corePlugin({ ... }),
  blocksPlugin(),
  catalogPlugin(),
  bioscopePlugin(),
  b2bPlugin(),
  customTypesPlugin(),
  seoPlugin(),
  securityPlugin(),
  imagePlugin(),
  consentPlugin(),
  languagesPlugin(),
  permissionsPlugin(),
]
```

**Quy tắc thứ tự:** `corePlugin` phải đăng ký **đầu tiên**, vì các mô-đun sau đều giả định `users` và `media` đã tồn tại để tham chiếu tới. Quy tắc này ghi thẳng vào chú thích trong mã để người sau không xáo trộn thứ tự.

### Vì sao chia mô-đun thay vì viết gộp

| Phương án | Đánh giá |
| :---- | :---- |
| Viết gộp toàn bộ vào một ứng dụng | Nhanh lúc đầu. Nhưng sáu tháng sau không tách ra được, và không dùng lại được cho dự án thứ hai của công ty |
| Chia theo mô-đun chức năng | Chậm hơn lúc đầu, nhưng phần nền dùng lại được nguyên vẹn; chỉ `module-bioscope` mang nghiệp vụ riêng |

Công ty chọn phương án hai vì đây là **nền tảng dùng nhiều lần**, không phải một website làm xong rồi bỏ. Bằng chứng cho tính dùng lại: 11 trong 12 gói không chứa từ "nguyên liệu" hay khái niệm riêng của ngành.

---

## 3. Luồng xử lý chính

### 3.1 Khách xem một trang nguyên liệu

```
Trình duyệt
   │ GET /nguyen-lieu/collagen-peptide
   ↓
Cổng thông tin (Next.js, chạy trên máy chủ)
   │ 1. Xác định ngôn ngữ từ đường dẫn và bánh quy
   │ 2. Kiểm bộ nhớ đệm — còn hạn thì trả ngay
   ↓ 3. Chưa có đệm: gọi CMS
CMS  GET /api/ingredients?where[slug]=...&locale=vi&depth=1
   │ 4. Kiểm quyền: chỉ trả bản đã xuất bản
   ↓ 5. Truy vấn cơ sở dữ liệu
PostgreSQL
   ↑ trả bản ghi
CMS  ↑ trả dữ liệu dạng JSON
Cổng thông tin
   │ 6. Dựng trang hoàn chỉnh trên máy chủ
   │ 7. Lưu vào bộ nhớ đệm, hạn 60 giây
   ↓
Trình duyệt  ← nhận trang đã dựng sẵn, hiện ngay
```

**Vì sao dựng trang trên máy chủ.** Ba lý do: công cụ tìm kiếm đọc được nội dung (quan trọng với NV-03); trang hiện nhanh vì trình duyệt không phải chờ tải mã rồi mới gọi dữ liệu; và địa chỉ CMS không lộ ra ngoài.

### 3.2 Biên tập viên xuất bản một bài viết

```
Biên tập viên
   │ Bấm "Xuất bản"
   ↓
Hệ quản trị
   │ 1. Kiểm quyền: có phải biên tập viên hoặc quản trị viên
   │ 2. Kiểm dữ liệu bắt buộc
   │ 3. Ghi bản mới, đánh dấu đã xuất bản
   │ 4. Lưu bản phiên bản vào bảng lịch sử
   │ 5. Ghi nhật ký thao tác
   ↓ 6. Gọi cổng thông tin xoá đệm trang liên quan
Cổng thông tin
   │ 7. Xoá đệm
   ↓
Lần khách vào tiếp theo → dựng lại trang với nội dung mới
```

Bước 6 là điểm nối giữa hai ứng dụng. Không có bước này thì biên tập viên xuất bản xong phải chờ tới 60 giây mới thấy thay đổi — trải nghiệm rất khó chịu và hay bị hiểu nhầm là "hệ thống lỗi".

### 3.3 Hệ thống ngoài lấy dữ liệu qua giao diện lập trình

```
Hệ thống ngoài
   │ GET /api/catalog/ingredients
   │ Header: x-api-key: <khoá>
   ↓
CMS
   │ 1. Tra khoá trong bảng khoá truy cập
   │ 2. Khoá còn hiệu lực? Chưa bị thu hồi?
   │ 3. Khoá có phạm vi phù hợp với đường dẫn này?
   │ 4. Kiểm giới hạn tần suất theo khoá
   │ 5. Truy vấn, CHỈ lấy bản đã xuất bản
   │ 6. Lọc theo danh sách trường ĐƯỢC PHÉP công bố
   ↓ 7. Trả kết quả
Hệ thống ngoài
```

**Bước 6 là điểm mấu chốt về bảo mật.** Hệ thống dùng cơ chế **danh sách trắng**: chỉ những trường có tên trong danh sách được phép mới lọt ra ngoài. Trường mới thêm vào mà chưa khai báo thì mặc định **không** ra ngoài.

Ngược lại với cơ chế danh sách đen — liệt kê trường cấm — thì mỗi lần thêm trường mới lại phải nhớ bổ sung vào danh sách cấm; quên một lần là lộ dữ liệu. Danh sách trắng quên thì chỉ thiếu dữ liệu, không lộ dữ liệu. **Sai theo hướng an toàn.**

Ngoài ra còn một chốt chặn cứng: danh sách trường **tuyệt đối không được công bố** được kiểm ngay lúc khởi động ứng dụng, nếu có trường nào lọt vào danh sách trắng thì ứng dụng **không khởi động**. Lỗi cấu hình bị chặn ở khâu khởi động, không đợi tới lúc lộ dữ liệu ngoài thực tế.

### 3.4 Khách chat với nhân viên kinh doanh

```
Khách        Cổng thông tin      CMS          Kênh nhắn tin    Nhân viên
  │ gõ tin        │               │                 │              │
  ├──────────────>│               │                 │              │
  │               ├──────────────>│ (chuyển tiếp,   │              │
  │               │               │  kèm địa chỉ    │              │
  │               │               │  thật của khách)│              │
  │               │               ├────────────────>│              │
  │               │               │                 ├─────────────>│
  │               │               │                 │              │
  │               │               │                 │<─────────────┤ trả lời
  │               │               │<────────────────┤ webhook      │
  │               │<──────────────┤ hỏi tin mới     │              │
  │<──────────────┤               │                 │              │
```

Cổng thông tin đóng vai trung chuyển, không phải để cho đẹp mà vì ba lý do cụ thể: không lộ địa chỉ CMS ra trình duyệt; hợp chính sách bảo mật nội dung của trình duyệt; và chuyển tiếp được địa chỉ thật của khách để CMS đếm đúng ngưỡng chống lạm dụng.

---

## 4. Đa ngữ

### Cơ chế

Đa ngữ đặt ở **tầng trường dữ liệu**, không phải tầng bản ghi. Một nguyên liệu là **một** bản ghi, trong đó những trường được đánh dấu đa ngữ lưu hai giá trị Việt và Anh.

| Phương án | Đánh giá |
| :---- | :---- |
| Mỗi ngôn ngữ một bản ghi riêng | Trùng lặp dữ liệu không đổi theo ngôn ngữ (mã, giá, ảnh); sửa một chỗ phải nhớ sửa chỗ kia; hai bản dễ lệch nhau |
| Một bản ghi, trường đa ngữ | Dữ liệu chung chỉ có một bản; biết ngay trường nào chưa dịch. **Chọn** |

### Cạm bẫy đã gặp: cơ chế lấy bản dự phòng

Bộ khung có cơ chế "thiếu bản dịch thì lấy tạm ngôn ngữ khác". Nghe thì tiện, nhưng gây ra lỗi thật: bài viết chỉ có bản tiếng Việt vẫn hiện trên trang tiếng Anh với **tiêu đề tiếng Việt** — trông như hệ thống hỏng.

Cách xử lý: khi lấy danh sách bài viết, tắt cơ chế dự phòng bằng tham số truy vấn, rồi tự lọc bỏ những bản không có nội dung ở ngôn ngữ đang xem:

```ts
const res = await cmsFetch<Paginated<PostDoc>>(
  'posts?limit=100&sort=-publishedAt&depth=1&fallback-locale=none',
  { locale, revalidate: 60 },
)
const hasContent = (d: PostDoc): boolean =>
  typeof d.title === 'string' && d.title.trim().length > 0
const usable = res.docs.filter(hasContent)
```

Đây là ví dụ điển hình cho việc **tiện ích mặc định của thư viện không phải lúc nào cũng đúng với nghiệp vụ**. Phải hiểu nó làm gì rồi mới quyết định dùng hay tắt.

### Đường dẫn theo ngôn ngữ

Yêu cầu YC-12 đòi đường dẫn khác nhau theo ngôn ngữ: `/ban-tin` cho tiếng Việt, `/news` cho tiếng Anh. Đây không phải chuyện thẩm mỹ — đường dẫn có nghĩa giúp công cụ tìm kiếm xếp hạng đúng theo thị trường.

Cạm bẫy đã gặp: đổi đường dẫn thì đường cũ phải chuyển hướng, và **cách chuyển hướng có ảnh hưởng tới xếp hạng tìm kiếm**. Dùng hàm chuyển hướng trong mã trang chỉ cho ra mã trạng thái 200 kèm thẻ làm mới — công cụ tìm kiếm không hiểu đó là chuyển hướng vĩnh viễn. Phải khai báo ở tầng cấu hình ứng dụng mới cho ra mã 308 đúng chuẩn.

---

## 5. Bảo mật — thiết kế nhiều lớp

| Lớp | Cơ chế | Chống được gì |
| :---- | :---- | :---- |
| Vận chuyển | Toàn bộ qua kết nối mã hoá | Nghe lén đường truyền |
| Xác thực nhân viên | Phiên đăng nhập của bộ khung, mật khẩu băm | Truy cập trái phép hệ quản trị |
| Xác thực khách hàng | Bánh quy phiên **có ký**, đặt ở phía máy chủ | Giả mạo trạng thái đăng nhập |
| Phân quyền | Kiểm quyền ở từng nhóm dữ liệu, theo vai trò | Biên tập viên đụng vào cấu hình hệ thống |
| Giao diện lập trình | Khoá có phạm vi + giới hạn tần suất + danh sách trắng trường | Rò rỉ dữ liệu, lạm dụng |
| Chống lạm dụng | Giới hạn theo địa chỉ ở mọi điểm ghi công khai | Gửi hàng loạt, dò mật khẩu |
| Chặn địa chỉ | Danh sách địa chỉ bị chặn | Kẻ tấn công đã lộ diện |
| Nhật ký | Ghi thao tác và sự kiện an ninh | Truy vết sau sự cố |
| Bí mật | Biến môi trường hoặc bảng cấu hình chỉ quản trị viên đọc | Lộ khoá khi mã nguồn bị sao chép |

### Nguyên tắc xuyên suốt: không tin dữ liệu gửi lên

Mọi giá trị do người dùng gửi đều bị coi là **có thể đã bị sửa**. Trạng thái quan trọng luôn được tính ở máy chủ.

Ví dụ thật ở chức năng bình luận: kẻ tấn công gửi kèm trạng thái `"approved"` để bình luận hiện ngay không cần duyệt. Hệ thống bỏ qua hoàn toàn giá trị gửi lên, tự tính lại:

```ts
const status = cfg.requireApproval ? 'pending' : 'approved'
```

Đã kiểm chứng bằng lời gọi thật: gửi kèm `status:"approved"` thì bản ghi vẫn vào trạng thái chờ duyệt.

---

## 6. Nhật ký quyết định kỹ thuật

Mục quan trọng nhất của tài liệu này. Mỗi quyết định ghi: chọn gì, vì sao, đánh đổi gì.

### QĐ-01 — Chọn Payload làm bộ khung hệ quản trị

**Bối cảnh:** cần hệ quản trị nội dung có phân quyền, đa ngữ, phiên bản, kho ảnh.

**Phương án đã cân nhắc:**

| Phương án | Vì sao loại |
| :---- | :---- |
| WordPress | Kiến trúc dựa trên chèn móc và bảng meta; mô hình dữ liệu kỹ thuật phức tạp như nguyên liệu sẽ rất chật vật; hệ sinh thái phần bổ trợ là nguồn rủi ro bảo mật |
| Strapi | Phù hợp, nhưng mô hình dữ liệu định nghĩa qua giao diện, khó theo dõi thay đổi trong kho mã nguồn |
| Tự viết từ đầu | Chi phí quá lớn cho đội nhỏ; phải tự làm lại xác thực, phân quyền, phiên bản, kho ảnh |
| **Payload** | **Chọn** |

**Vì sao chọn Payload:** mô hình dữ liệu định nghĩa bằng mã TypeScript nên **thay đổi cấu trúc có lịch sử trong kho mã nguồn**; hệ quản trị dựng trên cùng nền Next.js nên một đội biết một công nghệ; kiểu dữ liệu tự sinh nên cổng thông tin gọi sai trường là báo lỗi ngay lúc biên dịch.

**Đánh đổi:** cộng đồng nhỏ hơn WordPress, ít tài liệu hướng dẫn sẵn hơn, gặp vấn đề phải tự đọc mã nguồn thư viện.

### QĐ-02 — Kho mã nguồn gộp nhiều gói

**Chọn:** một kho chứa cả hai ứng dụng và 12 gói.

**Vì sao:** thay đổi liên quan tới cả hai ứng dụng nằm gọn trong một lần ghi nhận, không phải đồng bộ giữa nhiều kho. Với đội nhỏ đây là lợi ích lớn.

**Đánh đổi:** kho lớn, thời gian dựng lâu hơn. Xử lý bằng công cụ điều phối dựng có dùng lại kết quả cũ.

### QĐ-03 — Dùng bộ dựng cũ thay vì bộ dựng mới

**Vấn đề gặp phải:** bộ dựng mới không giải được đường dẫn nhập khẩu giữa các gói trong kho — báo lỗi `Cannot resolve './access/gated.js'`, vì mã nguồn viết bằng TypeScript nhưng nhập khẩu ghi đuôi `.js` theo chuẩn mô-đun.

**Quyết định:** hệ quản trị dùng bộ dựng cũ (`next build --webpack`, `next dev --webpack`).

**Đánh đổi:** dựng chậm hơn. Chấp nhận, vì đây là hệ quản trị nội bộ, không phải trang khách truy cập.

**Ghi chú cho người sau:** đừng gỡ cờ `--webpack` nếu chưa kiểm chứng bộ dựng mới đã xử lý được trường hợp này. Gỡ ra là máy chủ phát triển không khởi động được.

### QĐ-04 — Tắt chế độ tự đồng bộ cấu trúc dữ liệu trên hệ thống thật

**Vấn đề:** bộ khung có chế độ tự sửa cấu trúc bảng cho khớp với mã. Tiện khi phát triển, nguy hiểm khi vận hành — có thể tự xoá cột, và dừng chờ trả lời câu hỏi mà không ai đang ngồi đó.

**Sự cố đã xảy ra:** máy chủ phát triển treo hơn 5 phút mỗi lần gọi, do chế độ này dừng chờ xác nhận đổi tên bảng. Xử lý xong, thời gian phản hồi từ 6 phút về 5 giây.

**Quyết định:** cấu trúc dữ liệu trên hệ thống thật chỉ đổi bằng kịch bản đã kiểm chứng. Quy trình bảy bước ở `00-5` mục 5.

**Trạng thái:** trên hệ thống thật **chưa đặt** biến tắt chế độ này. Đây là rủi ro đang tồn tại, đã ghi vào `00-5` mục 5.5, chờ quyết định.

### QĐ-05 — Danh sách trắng cho giao diện lập trình công khai

**Chọn:** liệt kê trường **được phép** công bố, thay vì liệt kê trường **bị cấm**.

**Vì sao:** quên khai báo trường mới thì chỉ thiếu dữ liệu, không lộ dữ liệu. Sai theo hướng an toàn.

**Bổ sung:** danh sách trường tuyệt đối cấm được kiểm lúc khởi động; vi phạm thì ứng dụng không khởi động.

### QĐ-06 — Đường dẫn giao diện lập trình bình luận đặt lệch tên nhóm dữ liệu

**Vấn đề:** bộ khung tự dựng sẵn đường dẫn theo tên nhóm dữ liệu, và đường dẫn tự dựng đó **che mất** đường dẫn tự viết trùng tên. Gọi `/api/post-comments/list` bị hiểu là "lấy tài liệu có mã là `list`" và trả về lỗi 403.

**Quyết định:** đặt đường dẫn tự viết là `/api/blog-comments/*`, khác tên nhóm dữ liệu `post-comments`.

**Ghi chú cho người sau:** tên lệch nhau là **cố ý**, không phải sơ suất. Sửa cho "khớp" là hỏng hệ thống. Chú thích này ghi thẳng trong mã nguồn.

### QĐ-07 — Cổng trung chuyển ở phía cổng thông tin

**Chọn:** trình duyệt không gọi thẳng CMS; mọi lời gọi đi qua cổng thông tin.

**Ba lý do:** không lộ địa chỉ CMS; hợp chính sách bảo mật nội dung của trình duyệt; chuyển tiếp được địa chỉ thật của khách để CMS đếm đúng ngưỡng chống lạm dụng.

**Đánh đổi:** thêm một chặng mạng. Không đáng kể vì hai ứng dụng nằm cùng máy chủ.

### QĐ-08 — Chuyển hướng khai ở tầng cấu hình, không khai trong mã trang

**Vấn đề:** đổi đường dẫn bản tin sang `/ban-tin` và `/news`, đường cũ phải chuyển hướng. Dùng hàm chuyển hướng trong mã trang chỉ cho ra mã 200 kèm thẻ làm mới — công cụ tìm kiếm không hiểu là chuyển hướng vĩnh viễn, mất thứ hạng đã tích luỹ.

**Quyết định:** khai báo chuyển hướng ở tầng cấu hình ứng dụng, cho ra mã 308 đúng chuẩn. Đã kiểm chứng cho cả hai ngôn ngữ.

---

## 7. Điểm tiếp giáp với hệ thống ngoài

| Hệ thống ngoài | Chiều | Giao thức | Dùng để làm gì |
| :---- | :---- | :---- | :---- |
| Kênh nhắn tin Telegram | Hai chiều | HTTPS + webhook có khoá xác thực | Chuyển tin chat sang nhân viên và nhận trả lời |
| Dịch vụ đăng nhập Google | Ra | OAuth 2.0 | Khách đăng nhập bằng tài khoản Google |
| Dịch vụ thư điện tử | Ra | SMTP | Gửi thư xác nhận, đặt lại mật khẩu |
| Mô hình AI | Ra | HTTPS | Xem DA2 |
| Kho tài liệu Google Drive | Ra | Google Drive API | Xem DA2 |
| Hệ thống ngoài của công ty | Vào | HTTPS + khoá truy cập | Lấy dữ liệu danh mục nguyên liệu |

---

## 8. Khả năng mở rộng

| Tình huống | Cách xử lý đã thiết kế sẵn |
| :---- | :---- |
| Thêm loại nội dung mới | Mô-đun `module-custom-types` cho phép định nghĩa loại nội dung mới ngay trên giao diện, không sửa mã |
| Thêm ngôn ngữ thứ ba | Khai thêm ngôn ngữ trong cấu hình; các trường đa ngữ tự có thêm ô nhập |
| Thêm khối dựng trang | Khai thêm một khối trong `module-blocks`, kèm kịch bản chuyển đổi dữ liệu |
| Lượng truy cập tăng | Bộ nhớ đệm trang đã có; bước tiếp theo là tách cơ sở dữ liệu sang máy riêng |
| Dùng lại cho dự án khác của công ty | Giữ 11 gói nền, thay `module-bioscope` bằng mô-đun nghiệp vụ mới |

Điểm cuối là mục tiêu thiết kế ngay từ đầu, không phải lợi ích tình cờ.
