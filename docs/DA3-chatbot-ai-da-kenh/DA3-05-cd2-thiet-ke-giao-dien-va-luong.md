<!--HOSO
phu_de: Chatbot AI đa kênh BioBot — Bioscope Assistants
pham_vi: Dự án DA3
ngay_lap: 29/01/2026
phien_ban: 1.2
nguoi_lap: QuanNH — Team Lead, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 29/01/2026 | Ban hành lần đầu — luồng hội thoại đa kênh
lich_su: 1.1 | 20/04/2026 | Bổ sung giao diện quản trị và mô-đun kế toán
lich_su: 1.2 | 10/06/2026 | Bổ sung luồng trợ lý có công cụ và luồng chuyển người thật
-->
# DA3 — CÔNG ĐOẠN 2: THIẾT KẾ GIAO DIỆN VÀ LUỒNG NGƯỜI DÙNG
## Chatbot AI đa kênh BioBot — Bioscope Assistants

---

## 1. Nguyên tắc thiết kế

| # | Nguyên tắc | Áp dụng |
| :---- | :---- | :---- |
| 1 | **Người dùng không phải học cú pháp** | Hỏi bằng tiếng Việt tự nhiên, không có lệnh đặc biệt |
| 2 | Không để người dùng chờ trong im lặng | Trả lời theo dòng, chữ hiện dần |
| 3 | **Nói rõ khi không biết** | Không có dữ liệu thì nói không có, tuyệt đối không bịa |
| 4 | Từ chối phải kèm chỉ đường | Chặn câu hỏi y tế thì chỉ tới nguồn đúng |
| 5 | Luôn có đường tới người thật | Trợ lý không xử lý được thì chuyển |
| 6 | Mỗi vai trò chỉ thấy phần của mình | Giao diện khác nhau theo vai trò |

---

## 2. Sáu kênh — hai kiểu trải nghiệm

| Kiểu | Kênh | Đặc điểm |
| :---- | :---- | :---- |
| **Giao diện web đầy đủ** | Cổng web nội bộ | Có lịch sử, tải tệp, bảng biểu, quản trị |
| **Nhắn tin thuần** | Zalo, Telegram, Messenger, WhatsApp, thư điện tử | Chỉ chữ và tệp đính kèm, theo giới hạn của từng nền tảng |

### Nguyên tắc thống nhất

**Cùng một câu hỏi, mọi kênh cho cùng một câu trả lời** — vì sáu kênh dùng chung một bộ xử lý nghiệp vụ.

Khác biệt chỉ nằm ở **cách trình bày**:

| Yếu tố | Web | Nhắn tin |
| :---- | :---- | :---- |
| Bảng dữ liệu | Bảng thật, sắp xếp được | Danh sách gạch đầu dòng |
| Câu trả lời dài | Hiện đầy đủ | Cắt thành nhiều tin |
| Tệp đính kèm | Tải lên trực tiếp | Theo giới hạn nền tảng |
| Lịch sử | Xem lại được | Theo lịch sử của nền tảng |

---

## 3. Giao diện web

### 3.1 Bản đồ màn hình

```
┌─ Đăng nhập ────────────────────────────────┐
│  Thư điện tử + mật khẩu, hoặc Google       │
└──────────────────┬─────────────────────────┘
                   ↓ theo VAI TRÒ
    ┌──────────────┼──────────────┐
    ↓              ↓              ↓
┌────────┐   ┌──────────┐   ┌──────────┐
│ sales  │   │ ke_toan  │   │  admin   │
└───┬────┘   └────┬─────┘   └────┬─────┘
    │             │              │
    ↓             ↓              ↓
┌─────────────────────────────────────────────┐
│  Chat        │ hỏi đáp với trợ lý           │
│  Sales       │ sản phẩm, khách hàng         │  ← sales, admin
│  Kế toán     │ hoá đơn, chứng từ, báo cáo   │  ← ke_toan, admin
│  Công việc   │ theo dõi việc nền            │
│  Chức năng   │ công cụ nghiệp vụ            │
│  Hướng dẫn   │ tài liệu sử dụng             │
│  Quản trị    │ người dùng, cấu hình, nhật ký│  ← chỉ admin
└─────────────────────────────────────────────┘
```

Cấu trúc mã nguồn phản ánh đúng bản đồ này: mỗi mục là một thư mục trong `features/` — `chat`, `sales`, `kt`, `jobs`, `functions`, `guide`, `admin`.

### 3.2 Menu hiện theo vai trò

| Mục | `sales` | `ke_toan` | `admin` |
| :---- | :----: | :----: | :----: |
| Chat | ✅ | ✅ | ✅ |
| Sales | ✅ | | ✅ |
| Kế toán | | ✅ | ✅ |
| Công việc | ✅ | ✅ | ✅ |
| Chức năng | ✅ | ✅ | ✅ |
| Hướng dẫn | ✅ | ✅ | ✅ |
| Quản trị | | | ✅ |

**Ẩn menu là tiện lợi giao diện, không phải bảo mật.** Bảo mật thật nằm ở ba tầng dưới: kiểm vai trò tại điểm truy cập, lọc công cụ theo vai trò, và tách bộ sưu tập vectơ. Người dùng gõ thẳng đường dẫn của màn hình không có quyền vẫn bị chặn ở máy chủ.

Nguyên tắc chung: **giao diện không bao giờ là lớp bảo mật.**

---

## 4. Luồng hội thoại

### 4.1 Luồng bình thường

```
Người dùng gõ câu hỏi
        ↓
┌──────────────────────────────────────────┐
│ Hiện ngay "đang xử lý"                   │
│ (KHÔNG để màn hình đứng im)              │
└─────────────────┬────────────────────────┘
                  ↓
   Chốt chặn dược → chặn? → hiện câu chỉ đường, KẾT THÚC
                  ↓ không chặn
   Lọc công cụ theo vai trò
                  ↓
   Định tuyến nhanh → khớp mẫu? → gọi thẳng công cụ đúng
                  ↓ không khớp
┌──────────────────────────────────────────┐
│ Vòng lặp trợ lý (tối đa 5 lượt)          │
│ Hiện cho người dùng thấy:                │
│   "Đang tra danh sách sản phẩm..."       │
│   "Đang tìm trong tài liệu..."           │
└─────────────────┬────────────────────────┘
                  ↓
   Câu trả lời hiện DẦN TỪNG CHỮ
                  ↓
   Kèm nguồn: tài liệu nào, bản ghi nào
```

**Vì sao hiện tên công cụ đang chạy.** Câu hỏi phức tạp mất 10–15 giây. Người dùng nhìn màn hình đứng im sẽ nghĩ hệ thống treo và bấm lại — tốn thêm một lượt gọi mô hình. Hiện "đang tra danh sách sản phẩm" vừa cho biết còn sống, vừa cho biết **trợ lý hiểu đúng câu hỏi hay không** — thấy nó tra nhầm thì người dùng hỏi lại luôn.

**Vì sao trả lời theo dòng.** Chữ đầu tiên hiện trong 3 giây thay vì chờ 15 giây mới thấy toàn bộ. Cảm nhận về tốc độ khác hẳn dù tổng thời gian như nhau.

### 4.2 Luồng bị chặn vì câu hỏi y tế

```
Người dùng: "Sản phẩm này chữa bệnh gì?"
        ↓
   Chốt chặn dược khớp từ khoá "chữa bệnh"
        ↓
   KHÔNG gọi mô hình — dừng ngay tại đây
        ↓
┌────────────────────────────────────────────────┐
│ Câu hỏi này liên quan đến thông tin y tế /     │
│ dược lý, nằm ngoài phạm vi hỗ trợ của hệ thống.│
│                                                 │
│ Để biết thông tin chính xác về tác dụng, liều  │
│ dùng, chống chỉ định, vui lòng tham khảo:      │
│  · Tờ hướng dẫn sử dụng kèm theo sản phẩm      │
│  · Dược sĩ hoặc bác sĩ phụ trách               │
│  · Cục Quản lý Dược                            │
└────────────────────────────────────────────────┘
```

**Ba điểm thiết kế của câu trả lời này:**

| Điểm | Vì sao |
| :---- | :---- |
| Nêu **lý do** từ chối | Người dùng hiểu đây là giới hạn có chủ ý, không phải hệ thống hỏng |
| **Chỉ ba nguồn cụ thể** | Từ chối cụt lủn khiến khách đi hỏi nguồn không đáng tin. Chỉ đường vừa an toàn vừa có ích |
| Không gọi mô hình | Tiết kiệm chi phí, và **quan trọng hơn**: mô hình không có cơ hội trả lời |

### 4.3 Luồng không có dữ liệu

```
Người dùng: "Sản phẩm XYZ có chỉ tiêu gì?"
        ↓
   Trợ lý gọi công cụ tra sản phẩm
        ↓
   Không tìm thấy sản phẩm XYZ
        ↓
┌────────────────────────────────────────────────┐
│ Không tìm thấy sản phẩm "XYZ" trong dữ liệu.   │
│                                                 │
│ Có thể bạn đang tìm một trong các sản phẩm sau:│
│  · ...                                          │
│                                                 │
│ Hoặc thử mô tả công dụng để tôi tìm giúp.      │
└────────────────────────────────────────────────┘
```

**Nói rõ không có, kèm gợi ý.** Đây là ứng dụng trực tiếp của nguyên tắc số 3 — mô hình ngôn ngữ có xu hướng bịa ra một câu trả lời nghe hợp lý khi không có dữ liệu. Thiết kế này chặn xu hướng đó ở tầng luồng, bổ sung cho ràng buộc "chỉ dùng dữ liệu công cụ trả về" ở tầng câu lệnh.

### 4.4 Luồng hỏi lại khi mơ hồ

```
Người dùng: "Cho xem sản phẩm"
        ↓
   Bộ phân loại ý định: quá mơ hồ
        ↓
┌────────────────────────────────────────────────┐
│ Bạn muốn xem sản phẩm theo tiêu chí nào?       │
│  · Theo danh mục                                │
│  · Theo công dụng                               │
│  · Toàn bộ danh sách                            │
└────────────────────────────────────────────────┘
```

Hỏi lại tốt hơn đoán bừa rồi trả về danh sách hàng trăm dòng.

### 4.5 Luồng câu trả lời ngắn

```
Trợ lý: "...Bạn có muốn xem chi tiết sản phẩm A không?"
Người dùng: "đúng rồi"
        ↓
   Định tuyến nhanh nhận diện câu xác nhận
        ↓
   Ghép với ngữ cảnh lượt trước → sản phẩm A
        ↓
   Gọi thẳng công cụ xem chi tiết sản phẩm A
```

Không có bước này, mô hình nhận được câu *"đúng rồi"* trơ trọi và không biết đang xác nhận điều gì.

Các dạng nhận diện được: *đúng rồi, vâng, dạ, ừ, có, ok, được, tiếp, làm đi, xem đi, cho xem, hiển thị đi* — và các biến thể không dấu.

### 4.6 Luồng chuyển người thật

```
Trợ lý không xử lý được, HOẶC người dùng yêu cầu gặp người
        ↓
   WF07_human-handoff
        ↓
┌──────────────────────────────────────────────┐
│ Thông báo tới nhân viên phụ trách, kèm:      │
│  · Toàn bộ lịch sử hội thoại                 │
│  · Thông tin khách                           │
│  · Lý do chuyển                              │
└─────────────────┬────────────────────────────┘
                  ↓
   Nhân viên tiếp quản
                  ↓
   Người dùng thấy: "Đã chuyển cho nhân viên
   phụ trách, bạn vui lòng chờ trong giây lát."
```

**Chuyển kèm toàn bộ lịch sử là điểm quan trọng.** Nhân viên tiếp quản mà không có ngữ cảnh sẽ hỏi lại từ đầu — khách phải kể lại lần thứ hai, trải nghiệm còn tệ hơn là không có trợ lý.

---

## 5. Quy tắc hiển thị theo trạng thái

| Trạng thái | Hiển thị |
| :---- | :---- |
| Đang gọi mô hình | "Đang xử lý…" |
| Đang chạy công cụ | **Tên việc đang làm**: "Đang tra danh sách sản phẩm…" |
| Đang trả lời | Chữ hiện dần |
| Không có dữ liệu | Nói rõ + gợi ý |
| Câu hỏi mơ hồ | Hỏi lại, kèm lựa chọn |
| Bị chặn vì y tế | Câu chỉ đường ba nguồn |
| Lỗi hệ thống | Thông báo hiểu được + gợi ý thử lại |
| Vượt 5 lượt công cụ | Trả lời với dữ liệu đã có, nói rõ chưa đủ |
| Đã chuyển người thật | Xác nhận rõ ràng |

Không trạng thái nào để màn hình trắng hoặc đứng im.

---

## 6. Giao diện quản trị

Chỉ vai trò `admin`.

| Màn hình | Chức năng |
| :---- | :---- |
| Người dùng | Tạo tài khoản, gán vai trò, vô hiệu hoá |
| Tài liệu | Xem tài liệu đã nạp, trạng thái xử lý, **số đoạn đã cắt** |
| Nhật ký AI | Lượt gọi mô hình: câu hỏi, câu trả lời, mô hình, đơn vị tiêu, thời gian phản hồi |
| Nhật ký lỗi | Lỗi từ các quy trình |
| Nhật ký thao tác | Truy vết an ninh |
| Sức khoẻ hệ thống | Trạng thái sáu dịch vụ |
| Cấu hình | Cấu hình động |
| Xoá dữ liệu | Xoá dữ liệu cá nhân theo yêu cầu |

### 6.1 Màn hình nhật ký AI — công cụ quan trọng nhất

| Cột | Dùng để |
| :---- | :---- |
| Câu hỏi, câu trả lời | Đánh giá chất lượng |
| Ý định | Kiểm bộ phân loại có đúng không |
| Mô hình | Đối chiếu chất lượng với mô hình đã dùng |
| Đơn vị tiêu | **Kiểm soát chi phí** |
| Thời gian phản hồi | **Phát hiện hệ thống chậm dần** |

Ba cột sau là công cụ vận hành thật, không phải số liệu trang trí: chi phí tăng đột biến, hoặc thời gian phản hồi tăng dần, đều là dấu hiệu cần xử lý trước khi người dùng phàn nàn.

### 6.2 Cột "số đoạn đã cắt" ở màn hình tài liệu

Tài liệu 50 trang mà chỉ có 2 đoạn là dấu hiệu bóc tách hỏng — phần lớn nội dung đã mất, và trợ lý sẽ trả lời thiếu mà **không ai biết**.

Đây là loại lỗi thầm lặng, nên phải đưa lên giao diện để nhìn thấy được.

---

## 7. Trải nghiệm trên kênh nhắn tin

### 7.1 Ràng buộc của từng nền tảng

| Ràng buộc | Cách xử lý |
| :---- | :---- |
| Giới hạn độ dài tin | Cắt câu trả lời dài thành nhiều tin, cắt ở ranh giới đoạn |
| Không hiển thị bảng | Chuyển bảng thành danh sách gạch đầu dòng |
| Giới hạn định dạng | Dùng tập định dạng chung của các nền tảng |
| Giới hạn kích thước tệp | Kiểm trước khi gửi, quá thì gửi liên kết |
| Cửa sổ trả lời có hạn | Trả lời trong hạn, quá hạn dùng mẫu tin được phép |

### 7.2 Nhận diện người dùng

```
Tin nhắn vào từ một kênh
        ↓
Tra bảng khách hàng theo mã kênh
   ├─ Có → lấy lịch sử, nhận ra khách cũ
   └─ Không → tạo bản ghi mới
        ↓
Cùng một người nhắn từ kênh khác
        ↓
Gộp danh tính khi nhận ra (số điện thoại, thư điện tử)
```

Nhờ gộp danh tính, khách chuyển từ Zalo sang thư điện tử vẫn được nhận ra, lịch sử liền mạch.

---

## 8. Khả năng tiếp cận và trải nghiệm

| Yêu cầu | Cách đáp ứng |
| :---- | :---- |
| Không bắt học cú pháp | Hỏi bằng tiếng Việt tự nhiên |
| Không để chờ trong im lặng | Trả lời theo dòng, hiện tên việc đang làm |
| Người dùng luôn biết chuyện gì đang xảy ra | Trạng thái rõ ràng ở mọi bước |
| Luôn có đường thoát | Chuyển người thật ở mọi lúc |
| Thao tác bàn phím | Giao diện web hỗ trợ đầy đủ |
| Đọc được trên điện thoại | Giao diện đáp ứng nhiều cỡ màn hình |

---

## 9. Ngôn ngữ giao diện

Toàn bộ tiếng Việt, kể cả thông báo lỗi kỹ thuật. Người dùng là nhân viên kinh doanh và kế toán.

| Kém | Được |
| :---- | :---- |
| `Error: tool execution failed` | `Không tra được dữ liệu sản phẩm. Vui lòng thử lại sau ít phút.` |
| `No results found` | `Không tìm thấy sản phẩm "XYZ". Có thể bạn đang tìm: …` |
| `Rate limit exceeded` | `Hệ thống đang bận. Vui lòng thử lại sau 1 phút.` |
| `Unauthorized` | `Bạn không có quyền xem dữ liệu này. Liên hệ quản trị viên nếu cần.` |

Thông báo tốt nói đủ **ba thứ**: chuyện gì xảy ra, vì sao, làm gì tiếp theo.
