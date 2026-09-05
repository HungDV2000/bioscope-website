<!--HOSO
phu_de: Website Bioscope và Hệ quản trị nội dung
pham_vi: Dự án DA1
ngay_lap: 15/06/2026
phien_ban: 1.4
nguoi_lap: QuanNH — Team Lead, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 15/06/2026 | Mở sổ nhật ký phát triển
lich_su: 1.1 | 29/07/2026 | Ghi nhận mốc 1 đến mốc 5
lich_su: 1.2 | 17/08/2026 | Ghi nhận mốc 6 đến mốc 8
lich_su: 1.3 | 31/08/2026 | Ghi nhận mốc 9 và sự cố bảng phiên bản
lich_su: 1.4 | 03/09/2026 | Ghi nhận mốc 10 — hệ thống bình luận
-->
# DA1 — CÔNG ĐOẠN 3: LẬP TRÌNH VÀ NHẬT KÝ PHÁT TRIỂN
## Website Bioscope và Hệ quản trị nội dung

---

> **Đội thực hiện.** Toàn bộ công việc ghi trong nhật ký này do đội ngũ **Công ty OPTIMAI** thực hiện. Phân công theo vai trò và công đoạn: `00-ho-so-chung/00-1-thuyet-minh-nang-luc-va-doi-ngu.md` mục 4.1.

## 1. Tổ chức mã nguồn

```
dv-cms/
├── apps/
│   ├── core-cms/                 Ứng dụng hệ quản trị
│   │   └── src/
│   │       ├── collections/      Nhóm dữ liệu riêng của ứng dụng
│   │       ├── globals/          Bảng cấu hình
│   │       ├── endpoints/        52 điểm giao tiếp lập trình
│   │       ├── lib/              Hàm dùng chung
│   │       ├── components/       Thành phần giao diện quản trị tự viết
│   │       ├── scripts/          Kịch bản chạy tay
│   │       └── payload.config.ts Nơi lắp ráp toàn bộ mô-đun
│   │
│   └── bioscope-frontend/        Ứng dụng cổng thông tin
│       └── src/
│           ├── app/              39 đường dẫn
│           ├── components/       68 thành phần giao diện
│           ├── lib/              Gọi dữ liệu, đa ngữ, phiên khách
│           └── globals.css       Hệ thống nhận diện
│
├── packages/                     12 gói mô-đun
│   ├── core/                     Nền chung
│   ├── module-bioscope/          Nghiệp vụ riêng
│   ├── module-b2b/
│   ├── module-blocks/
│   ├── module-catalog/
│   ├── module-consent/
│   ├── module-custom-types/
│   ├── module-image/
│   ├── module-languages/
│   ├── module-permissions/
│   ├── module-security/
│   └── module-seo/
│
├── scripts/                      28 kịch bản chuyển đổi cấu trúc dữ liệu
├── docker-compose.yml            Định nghĩa 4 dịch vụ
└── docs/                         Bộ hồ sơ này
```

### Cấu trúc một gói mô-đun

```
packages/module-bioscope/
└── src/
    ├── collections/    Nhóm dữ liệu gói này đóng góp
    ├── globals/        Bảng cấu hình gói này đóng góp
    ├── blocks/         Khối dựng trang
    ├── plugin.ts       Hàm lắp ráp vào cấu hình chung
    └── index.ts        Danh sách xuất ra
```

Mọi gói theo cùng một khuôn. Người mở gói thứ hai không phải học lại cách tổ chức.

---

## 2. Quy ước lập trình áp dụng

Chi tiết ở `00-5`. Tóm tắt phần áp dụng cho DA1:

| Quy ước | Áp dụng |
| :---- | :---- |
| Chú thích tiếng Việt, giải thích "vì sao" | Toàn bộ mã nguồn |
| Quy tắc nghiệp vụ chỉ viết một chỗ | Phân quyền gom vào `packages/core/src/access/index.ts`; luật mật khẩu gom vào `password-field.tsx` |
| Kiểm chứng ở máy chủ | Mọi điểm nhận dữ liệu từ ngoài |
| Mặc định an toàn | Bình luận mặc định tắt; danh sách trắng cho giao diện lập trình |
| Bí mật ngoài mã nguồn | Biến môi trường hoặc bảng cấu hình chỉ quản trị viên đọc |

---

## 3. Kiểm tra bắt buộc trước mỗi lần ghi nhận

| Kiểm tra | Lệnh | Mức nền hiện tại |
| :---- | :---- | :---- |
| Kiểm kiểu — hệ quản trị | `pnpm --filter core-cms tsc --noEmit` | **39 cảnh báo**, tồn tại từ trước, nằm trong mã thư viện nền |
| Kiểm kiểu — cổng thông tin | `pnpm --filter bioscope-frontend tsc --noEmit` | **0** |
| Dựng — hệ quản trị | `pnpm --filter core-cms build` | Thành công |
| Dựng — cổng thông tin | `pnpm --filter bioscope-frontend build` | 98/98 trang dựng sẵn thành công |

Ghi lại mức nền 39 để lần sau không phải dò xem cảnh báo nào là cũ. Sau khi sửa, con số phải **vẫn là 39**; tăng lên nghĩa là vừa tạo lỗi mới.

---

## 4. Nhật ký phát triển

Nhật ký ghi theo **lộ trình đã đi**, không phải thống kê số lần ghi nhận. Mỗi mốc nêu: làm gì, gặp gì, xử lý ra sao.

Lưu ý về phạm vi: kho mã nguồn chứa cả DA1 và DA2. Nhật ký dưới đây chỉ ghi phần **DA1**; phần dây chuyền AI nằm ở `DA2-06-cd3-lap-trinh-va-nhat-ky.md`.

---

### Mốc 1 — Dựng nền (15/06 – 29/06/2026)

**Mục tiêu:** dựng bộ khung monorepo, gói `core`, mô hình dữ liệu cơ bản, giao diện quản trị chạy được.

**Đã làm:**
- Dựng cấu trúc kho gộp nhiều gói với công cụ điều phối dựng
- Gói `core`: người dùng, ảnh, trang, bài viết, chủ đề, thẻ, biểu mẫu, chuyển hướng
- Gói `module-bioscope`: nguyên liệu, phân loại, dịch vụ, công nghệ, chứng nhận
- Giao diện quản trị chạy được, đăng nhập được
- Dựng bộ khung trang chủ và các trang giới thiệu

**Ghi chú trung thực về chất lượng nhật ký giai đoạn này.** Mô tả thay đổi trong giai đoạn đầu rất sơ sài — nhiều lần chỉ ghi `up`, `update code`, `fix home`. Đây là thực tế, không che giấu. Từ 09/07/2026 trở đi, quy ước mô tả được áp dụng nghiêm và chất lượng nhật ký thay đổi hẳn.

Sự chuyển biến này tự nó là bằng chứng: quy trình của đội **trưởng thành dần trong quá trình làm**, đúng với đặc điểm của một đội trực tiếp sản xuất, khác với một dự án nhận bàn giao trọn gói từ bên khác.

---

### Mốc 2 — Đưa lên máy chủ (08/07 – 11/07/2026)

**Mục tiêu:** hệ thống chạy được trên máy chủ thật, không chỉ trên máy lập trình viên.

**Đã làm:**
- Dựng cấu hình nhiều dịch vụ, có máy chủ web đứng trước và kết nối mã hoá
- Đặt quy ước dải cổng nội bộ để không đụng dịch vụ khác trên cùng máy
- Viết kịch bản cài đặt, gieo dữ liệu mẫu, nâng cấp
- Mở rộng dữ liệu mẫu song ngữ cho 8 nhóm dữ liệu

**Sự cố và cách xử lý:**

| Sự cố | Nguyên nhân | Xử lý |
| :---- | :---- | :---- |
| `Cannot find module next/dist/bin/next` | Chạy lệnh từ thư mục thư viện thay vì thư mục ứng dụng | Sửa lệnh khởi động; ghi vào mục xử lý sự cố |
| `argument missing` khi dựng ảnh chứa | Nhầm giữa tham số lúc dựng và biến lúc chạy | Dùng đúng loại biến; ghi vào mục xử lý sự cố |

Hai sự cố này đều được ghi kèm tài liệu ngay trong cùng ngày — dấu hiệu của việc áp dụng nguyên tắc "đã sửa lỗi thì phải ghi lại".

---

### Mốc 3 — Nội dung do người dùng tự quản (16/07 – 21/07/2026)

**Mục tiêu:** đáp ứng NV-02 — nhân viên tự sửa nội dung, không cần lập trình viên.

**Đã làm:**
- Chuyển từng trang tĩnh sang dạng cấu hình được: trang giải pháp, trang đồng kiến tạo, trang nghiên cứu phát triển, trang liên hệ, trang chính sách và điều khoản
- Dựng lại thanh điều hướng quản trị theo kiểu quen thuộc với người dùng hệ quản trị nội dung phổ biến
- Mô tả các khối trang chủ chuyển sang trình soạn thảo có định dạng
- Đường dẫn tĩnh chuyển sang đa ngữ
- Chức năng sao lưu ngay trong hệ quản trị
- Xem trước trực tiếp: bấm vào khối trong bản xem trước thì nhảy tới đúng trường đang sửa

**Quyết định đáng ghi:** ban đầu dùng một thư viện xem trước bên thứ ba, sau chuyển sang cơ chế chính thức của bộ khung. Lý do: thư viện bên thứ ba là thêm một thứ phải bảo trì, trong khi cơ chế chính thức làm được đúng việc cần.

---

### Mốc 4 — Hoàn thiện nghiệp vụ nguyên liệu (21/07 – 27/07/2026)

**Mục tiêu:** dữ liệu nguyên liệu đủ dùng cho kinh doanh thật.

**Đã làm:**
- Thẻ "Tài liệu" riêng cho hồ sơ nguyên liệu
- Xuất/nhập nội dung nguyên liệu dạng bảng và dạng cấu trúc
- **Bảng giá nhiều bậc, khoá chỉ nội bộ đọc được** — chi tiết thiết kế ở `DA1-04` mục 4.4
- Bộ thẻ lọc nguyên liệu: 5 nhóm thuộc tính, lọc được trên web
- Danh mục chính, đám mây thẻ bấm-là-lọc
- Công tắc "Ẩn khỏi website" cho từng nguyên liệu
- Màn hình kiểm tra trùng lặp
- Phân trang 9 nguyên liệu mỗi trang, bộ ảnh mặc định cho nguyên liệu chưa có ảnh

**Sự cố:** bộ thẻ lọc khai trong hệ quản trị nhưng không hiện ra trang web. Nguyên nhân: dữ liệu thuộc tính không được lấy kèm khi truy vấn nguyên liệu. Xử lý: khai độ sâu truy vấn phù hợp.

---

### Mốc 5 — Vận hành và kiểm soát (27/07 – 29/07/2026)

**Mục tiêu:** hệ thống vận hành được lâu dài, có kiểm soát.

**Đã làm:**
- Trạng thái đang tải cho cả cổng thông tin và hệ quản trị
- Nút xoá bộ nhớ đệm ngay trong hệ quản trị
- Thanh tiến trình khi chuyển trang
- Màn hình quản lý mô-đun: bật/tắt và xem trạng thái từng mô-đun
- Sao lưu cơ sở dữ liệu tự động theo lịch
- **Thùng rác** — xoá là chuyển vào thùng rác, khôi phục được
- Cờ "Chờ duyệt" — quy trình biên tập bước đầu
- **Nhật ký thay đổi** — ghi ai tạo/sửa/xoá nội dung nào
- Tìm kiếm toàn hệ quản trị bằng tổ hợp phím
- Đăng bài theo lịch

Ba chức năng in đậm đều phục vụ yêu cầu YC-06, YC-40 — khôi phục được và truy vết được.

---

### Mốc 6 — Chat trực tuyến (05/08 – 14/08/2026)

**Mục tiêu:** đáp ứng NV-07 — khách liên hệ được ngay khi đang xem trang.

**Đã làm:**
- Phần máy chủ: cầu nối web ↔ kênh nhắn tin, cấu hình động trong hệ quản trị
- Khung chat trên web, có cổng trung chuyển
- Kết nối kênh nhắn tin: công cụ kiểm tra kết nối, xác thực webhook bằng khoá bí mật
- Giới hạn tần suất chống lạm dụng
- Nhân viên gửi được ảnh và tệp cho khách
- Chính sách lưu trữ hội thoại
- Huy hiệu báo tin mới
- Khung chat đa ngữ
- **Ghi nhận ngữ cảnh khách:** nguồn truy cập, thiết bị, trình duyệt, vị trí ước lượng, các trang đã xem
- Xử lý trường hợp nhóm nhắn tin không bật chủ đề riêng

**Quyết định thiết kế:** đưa ngữ cảnh khách vào thẻ giới thiệu gửi sang nhân viên kinh doanh, để nhân viên biết ngay đang nói chuyện với ai, đến từ đâu, quan tâm gì — thay vì phải hỏi lại từ đầu.

**Ghi chú kỹ thuật quan trọng, trích nguyên văn chú thích trong mã:**

> Đo thời gian đẩy sang Telegram. Việc bóc tách PDF của hàng đợi AI chạy CHUNG tiến trình, mà Node đơn luồng nên nó chặn mọi request khác — triệu chứng là tin khách gửi dồn một lúc mới sang nhóm. Có mốc thời gian ở đây thì lần sau nhìn log là biết ngay tắc ở đâu.

Đây là ví dụ tốt cho việc **ghi lại nguyên nhân gốc ngay tại chỗ**: người sau thấy tin nhắn chậm sẽ không đi tìm lỗi ở phần chat, mà biết ngay phải nhìn sang hàng đợi AI. Vấn đề gốc — tách xử lý tệp sang tiến trình riêng — đã ghi vào danh sách việc cần làm.

---

### Mốc 7 — Cổng khách hàng doanh nghiệp (13/08 – 17/08/2026)

**Mục tiêu:** đáp ứng NV-04 — kiểm soát việc phát tài liệu.

**Đã làm:**
- Xác thực khách hàng thật, phiên giữ bằng bánh quy có ký
- Đăng nhập bằng tài khoản Google, chưa có thì tự tạo
- Trang tài khoản khách
- Phân loại khách cá nhân và doanh nghiệp, mỗi loại có trường riêng
- Tài khoản đăng nhập bằng Google mặc định là khách cá nhân — **có lý do:** chưa khai rõ thì không suy đoán, tránh để nhân viên kinh doanh chào sai ngữ cảnh
- Nút đăng nhập / tài khoản trên thanh đầu trang
- Cửa sổ đăng nhập/đăng ký dùng chung cho cả thanh đầu trang và khung chat
- Công cụ chẩn đoán lỗi đăng nhập Google
- Chọn ngôn ngữ dạng biểu tượng
- Khoá phiên chat theo tài khoản
- **Ô mật khẩu:** nút hiện/ẩn, thanh đánh giá độ mạnh, ô nhập lại
- Cửa sổ đăng ký hai cột trên màn hình lớn, giới hạn chiều cao, thanh cuộn trong biểu mẫu

**Sự cố đã gặp — thanh đầu trang tràn màn hình.** Chi tiết ở `DA1-05` mục 6.2. Điểm đáng ghi: nguyên nhân không phải phần tử vừa thêm mà là cách khung chứa tăng đệm ở màn hình rộng.

---

### Mốc 8 — Giao diện lập trình cho hệ thống ngoài (17/08/2026)

**Mục tiêu:** đáp ứng NV-05 — dữ liệu dùng lại được cho hệ thống khác của công ty.

**Đã làm:**
- Giao diện lập trình danh mục nguyên liệu, có khoá truy cập
- Mở rộng sang toàn bộ nội dung website và thông tin công ty
- **Phân quyền động cho khoá:** mỗi khoá có phạm vi điểm truy cập riêng và hạn dùng
- Bản mô tả danh mục dữ liệu để bên tích hợp tự tra

**Thiết kế bảo mật:** cơ chế danh sách trắng và chốt chặn lúc khởi động — chi tiết ở `DA1-03` mục 3.3 và `QĐ-05`.

Đây là điểm nối giữa DA1 và DA3: chatbot AI lấy dữ liệu nguyên liệu qua chính giao diện này.

---

### Mốc 9 — Bản tin và phân loại bài viết (28/08 – 31/08/2026)

**Mục tiêu:** đáp ứng YC-07, YC-12, YC-13, YC-20, YC-21.

**Đã làm:**
- Tách phân loại bài viết ra khỏi phân loại tài nguyên
- Thêm trục phân loại thứ ba: **ngành**
- Lồng các phân loại vào dưới Bài viết trong thanh điều hướng quản trị
- Chuyển đường dẫn bản tin sang `/ban-tin` và `/news`, có chuyển hướng đúng chuẩn từ đường cũ
- Khối "Bài viết mới" ở trang chủ, cấu hình được, tự chuyển dạng trượt khi quá số bài
- Ảnh đại diện cho bài viết, có ảnh dự phòng khi chưa đặt
- Ẩn bài chưa có bản dịch khỏi trang ngôn ngữ tương ứng
- Sửa lại phần đầu trang bài viết, mục lục bên cạnh
- Lưới hai cột cho trang bản tin

**Sự cố nghiêm trọng và bài học về chẩn đoán.**

Sau khi thêm phân loại "ngành", trang danh sách bài viết trong hệ quản trị hiện **trắng trơn**.

Chẩn đoán lần đầu **sai**: kết luận do phiên đăng nhập cũ, dựa trên một phép thử gọi trang quản trị mà **không đăng nhập** — phép thử đó trả về nội dung bình thường nên tưởng hệ thống không lỗi. Người dùng thử lại vẫn trắng.

Chẩn đoán lại cho đúng: tạo tài khoản quản trị thật, đăng nhập thật bằng trình duyệt, tái hiện được lỗi, rồi đọc nhật ký máy chủ. Nguyên nhân thật:

```
column _posts_v_rels.industries_id does not exist (SQLSTATE 42703)
```

Nhóm `posts` bật bản nháp nên sinh bảng phiên bản song song; kịch bản chuyển đổi bỏ sót bảng đó.

**Hai bài học ghi vào quy trình:**

1. Phép thử phải **tái hiện đúng hoàn cảnh** của lỗi. Thử mà không đăng nhập thì kết quả vô nghĩa với một lỗi chỉ xảy ra sau khi đăng nhập.
2. Kịch bản chuyển đổi phải qua bước **đối chiếu toàn bộ danh sách cột**, không chỉ đối chiếu bảng vừa sửa. Bước này nay là bước 7 bắt buộc trong quy trình ở `00-5` mục 5.3.

---

### Mốc 10 — Hệ thống bình luận (09/2026)

**Mục tiêu:** đáp ứng YC-38.

**Phát hiện ban đầu:** phần bình luận đang hiển thị trên trang bài viết là **hoàn toàn giả**. Biểu mẫu chỉ thêm vào bộ nhớ trình duyệt — khách gõ xong bấm gửi thì thấy bình luận hiện ra, tải lại trang là mất sạch, không gì được lưu. Hai bình luận đang hiển thị là dữ liệu mẫu viết cứng trong mã.

**Đã làm:**
- Nhóm dữ liệu `post-comments` thật
- Thẻ cấu hình "Bình luận" trong Cài đặt website: bật/tắt, duyệt trước khi hiển thị, bắt buộc email, số ký tự tối đa, số bình luận tối đa mỗi giờ theo địa chỉ, ghi chú đa ngữ
- Hai điểm giao tiếp công khai, đặt tại `/api/blog-comments/*`
- Cổng trung chuyển ở cổng thông tin, chuyển tiếp địa chỉ thật của khách
- Gỡ sạch dữ liệu mẫu và kiểu dữ liệu liên quan ở cả hai ngôn ngữ

**Năm lớp bảo vệ,** vì đây là đường ghi mở cho người không đăng nhập. Chi tiết và kết quả kiểm chứng ở `DA1-07` mục 5.

**Sự cố đã gặp:** đặt đường dẫn `/api/post-comments/list` thì nhận về lỗi 403. Nguyên nhân: bộ khung tự dựng sẵn đường dẫn theo tên nhóm dữ liệu và đường dẫn đó **che mất** đường dẫn tự viết — `list` bị hiểu là mã tài liệu. Xử lý: đổi sang `/api/blog-comments/*`, ghi chú thích giải thích ngay trong mã để người sau không "sửa cho khớp".

---

## 5. Thống kê khối lượng

| Tháng | Số lần ghi nhận | Dòng thêm | Dòng xoá |
| :---- | :---- | :---- | :---- |
| 06/2026 | 27 | 105.947 | 4.899 |
| 07/2026 | 148 | 81.342 | 4.910 |
| 08/2026 | 43 | 17.354 | 58.901 |

**Đọc bảng này thế nào.** Tháng 6 thêm nhiều nhất — giai đoạn dựng nền. Tháng 7 nhịp dày nhất (148 lần) — giai đoạn dựng chức năng. Tháng 8 **xoá nhiều hơn thêm** — giai đoạn dọn dẹp, gỡ mã thừa, gỡ dữ liệu giả, tinh gọn.

Hình dạng này là đặc trưng của phần mềm **được nuôi lớn theo thời gian**. Một sản phẩm mua về đổi tên sẽ không có giai đoạn xoá nhiều hơn thêm, vì không ai biết đủ về mã nguồn để dám xoá.

---

## 6. Việc còn lại

Ghi trung thực để hồ sơ phản ánh đúng hiện trạng:

| Việc | Mức độ | Ghi chú |
| :---- | :---- | :---- |
| Đặt biến tắt chế độ tự đồng bộ cấu trúc trên hệ thống thật | **Cao** | Rủi ro mất dữ liệu; chi tiết ở `00-5` mục 5.5 |
| Tách xử lý tệp sang tiến trình riêng | Trung bình | Hiện chạy chung tiến trình, chặn các lời gọi khác |
| Bộ kiểm thử tự động | Trung bình | Hiện kiểm thủ công theo bộ ca kiểm thử |
| Cập nhật chính sách bảo mật cho phần ghi nhận hành vi | Trung bình | Đã ghi nhận dữ liệu nhưng chính sách chưa nêu đủ |
| Dịch 3 bài viết còn thiếu bản tiếng Anh | Thấp | Hiện các bài này không hiện ở trang tiếng Anh |
| Dọn 6 phân loại tài nguyên cũ còn sót | Thấp | Không xoá vì là dữ liệu của công ty, chờ xác nhận |
