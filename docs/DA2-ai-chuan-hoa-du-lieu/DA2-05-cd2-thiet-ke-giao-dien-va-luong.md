<!--HOSO
phu_de: Hệ thống AI chuẩn hoá và cập nhật dữ liệu sản phẩm
pham_vi: Dự án DA2
ngay_lap: 04/07/2026
phien_ban: 1.1
nguoi_lap: Bộ phận Phát triển phần mềm — Công ty Bioscope
nguoi_duyet: Ban Giám đốc
lich_su: 1.0 | 04/07/2026 | Ban hành lần đầu
lich_su: 1.1 | 22/07/2026 | Bổ sung luồng sinh hàng loạt và luồng duyệt
-->
# DA2 — CÔNG ĐOẠN 2: THIẾT KẾ GIAO DIỆN VÀ LUỒNG NGƯỜI DÙNG
## Hệ thống AI chuẩn hoá và cập nhật dữ liệu sản phẩm

---

## 1. Nguyên tắc thiết kế

| # | Nguyên tắc | Áp dụng |
| :---- | :---- | :---- |
| 1 | **Đặt công cụ ở nơi người dùng đang đứng** | Nút sinh nội dung nằm ngay cạnh nút Lưu, không phải ở một trang riêng |
| 2 | Việc chạy lâu thì phải thấy nó đang chạy tới đâu | 9 trạng thái, cập nhật liên tục |
| 3 | Không chặn người dùng | Xếp hàng chạy nền, người dùng làm việc khác được |
| 4 | Kết quả AI phải **nhìn ra được là của AI** | Cờ chờ duyệt, trạng thái nháp |
| 5 | Lỗi phải đọc được bởi người không phải kỹ thuật | Nhật ký tiếng Việt, có mức độ |
| 6 | Cảnh báo đặt ngay tại chỗ thao tác | Hai cạm bẫy cấu hình ghi làm mô tả trường |

---

## 2. Bốn thành phần giao diện tự viết

Toàn bộ giao diện DA2 nằm **bên trong** hệ quản trị của DA1, dưới dạng bốn thành phần cắm thêm.

### 2.1 Thanh sinh hàng loạt — trên danh sách nguyên liệu

Khai báo trong mô hình dữ liệu:

```ts
components: {
  // Bulk "Tạo nội dung tự động" bar on the list view (selected / all).
  beforeListTable: ['/components/BulkAiGenerate/BulkAiGenerate#BulkAiGenerate'],
  ...
}
```

Hiện phía trên bảng danh sách nguyên liệu. Cho phép:

| Thao tác | Kết quả |
| :---- | :---- |
| Chọn vài nguyên liệu → **Tạo nội dung** | Xếp hàng đúng những nguyên liệu đã chọn |
| **Tạo cho tất cả** | Xếp hàng toàn bộ nguyên liệu khớp bộ lọc đang áp dụng |
| Xem trạng thái hàng đợi | Số việc đang chờ, đang chạy |

**Vì sao đặt ở đây.** Người dùng vừa lọc ra danh sách nguyên liệu cần xử lý; công cụ phải ở ngay đó. Bắt họ ghi lại danh sách rồi sang trang khác nhập lại là thiết kế sai.

### 2.2 Menu công cụ — trong biểu mẫu nguyên liệu

```ts
edit: {
  // "⚙ Công cụ nguyên liệu" dropdown (AI + Import/Export) next to Save/Publish.
  beforeDocumentControls: ['/components/IngredientAiField/IngredientAiField#IngredientAiField'],
}
```

Nằm **cạnh nút Lưu và Xuất bản** — nơi người dùng nhìn vào khi đang sửa một nguyên liệu.

| Mục | Chức năng |
| :---- | :---- |
| Tạo nội dung tự động | Chạy dây chuyền đầy đủ cho nguyên liệu này |
| Tạo lại ảnh đại diện | Chỉ sinh ảnh, giữ nguyên nội dung |
| Đồng bộ lại kho tài liệu | Quét lại thư mục, cập nhật danh sách tệp |
| Xuất nội dung | Đưa nội dung ra tệp |
| Nhập nội dung | Nạp nội dung từ tệp |

**Gom vào một menu thả xuống thay vì năm nút rời.** Năm nút rời cạnh nút Lưu làm vùng thao tác quan trọng nhất trở nên rối, và tăng nguy cơ bấm nhầm — bấm nhầm "Tạo nội dung tự động" là tốn tiền thật.

### 2.3 Bảng theo dõi hàng đợi

Danh sách công việc, sắp xếp mới nhất trước:

| Cột | Nội dung |
| :---- | :---- |
| Nguyên liệu | Tên, bấm được để mở |
| Chế độ | Toàn bộ / Chỉ ảnh |
| Trạng thái | Một trong 9, có màu phân biệt |
| Bước hiện tại | Mô tả chi tiết |
| Chi phí | Đô-la và **đồng** |
| Thời gian | Bắt đầu, kết thúc |

### 2.4 Khung xem nhật ký

Mở từ một công việc. Hiện toàn bộ dòng nhật ký:

| Mức | Màu | Nghĩa với người dùng |
| :---- | :---- | :---- |
| `info` | Xám | Bước bình thường |
| `warn` | Cam | **Kết quả có thể thiếu** — cần kiểm kỹ hơn khi duyệt |
| `error` | Đỏ | Không hoàn thành |

Dòng cảnh báo màu cam là tín hiệu quan trọng nhất cho người duyệt: công việc *xong* nhưng có tệp bị bỏ qua, nên nội dung có thể thiếu thông tin.

---

## 3. Luồng người dùng chính

### 3.1 Sinh nội dung cho một nguyên liệu

```
Biên tập viên mở một nguyên liệu
        ↓
Thấy nguyên liệu còn trống nhiều trường
        ↓
Bấm ⚙ Công cụ nguyên liệu → Tạo nội dung tự động
        ↓
┌──────────────────────────────────────────┐
│ Hộp thoại xác nhận:                       │
│  · Số tệp nguồn tìm thấy: 5               │
│  · Chế độ: Toàn bộ nội dung + ảnh         │
│  · Ước tính: vài phút                     │
│                        [Huỷ]  [Bắt đầu]   │
└──────────────────────────────────────────┘
        ↓ Bắt đầu
Công việc được xếp hàng — NGƯỜI DÙNG LÀM VIỆC KHÁC ĐƯỢC
        ↓
Trạng thái cập nhật: queued → downloading → extracting
                   → generating_content → generating_image
                   → saving → done
        ↓
Mở lại nguyên liệu:
  · Các trường đã được điền
  · Trạng thái: NHÁP
  · Cờ: CHỜ DUYỆT
        ↓
Biên tập viên ĐỌC LẠI (mục 3.3)
        ↓
Xuất bản
```

**Hộp thoại xác nhận có mục "số tệp nguồn tìm thấy" vì một lý do cụ thể:** nguyên liệu chưa đồng bộ kho tài liệu sẽ có 0 tệp, và chạy dây chuyền với 0 tệp thì AI không có gì để trích — kết quả sẽ nghèo nàn và vẫn tốn tiền. Thấy số 0 thì người dùng biết phải đồng bộ trước.

### 3.2 Sinh hàng loạt

```
Danh sách nguyên liệu
        ↓
Lọc: trạng thái Nháp, chưa có mô tả
        ↓
        ├─→ Chọn từng nguyên liệu bằng ô đánh dấu
        └─→ Hoặc bấm "Tạo cho tất cả" (theo bộ lọc hiện tại)
        ↓
┌──────────────────────────────────────────┐
│ ⚠ Sắp xếp hàng 47 công việc               │
│   Mỗi công việc tốn tiền gọi dịch vụ AI.  │
│                        [Huỷ]  [Xác nhận]  │
└──────────────────────────────────────────┘
        ↓
Xếp hàng, chạy tuần tự
        ↓
Theo dõi ở bảng hàng đợi
        ↓
Huỷ được bất kỳ công việc nào chưa chạy xong
```

**Cảnh báo số lượng và chi phí là bắt buộc.** Bấm "Tạo cho tất cả" khi bộ lọc đang rỗng nghĩa là xếp hàng toàn bộ danh mục nguyên liệu — tốn tiền thật, và không có nút hoàn tác cho tiền đã tiêu.

### 3.3 Duyệt kết quả — luồng quan trọng nhất

Đây là luồng bảo đảm chất lượng cuối cùng. Thiết kế để người duyệt **biết chính xác phải kiểm gì**.

```
Mở nguyên liệu có cờ CHỜ DUYỆT
        ↓
┌─────────────────────────────────────────────────────┐
│ BƯỚC 1 — Đọc nhật ký công việc                       │
│   Có dòng CẢNH BÁO (cam) không?                      │
│     Có → tệp nào bị bỏ qua? nội dung có thể thiếu    │
└─────────────────────────┬───────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│ BƯỚC 2 — Kiểm TRƯỜNG LOẠI A (bắt buộc đối chiếu)    │
│   Mở tệp nguồn ở thẻ "Đồng bộ", đối chiếu:          │
│     · Mã CAS, mã HS, mã E                            │
│     · Chỉ tiêu kỹ thuật (từng dòng)                  │
│     · Hạn dùng, bảo quản, đóng gói                   │
│     · Trạng thái pháp lý, số công bố                 │
│     · Bảng giá, số lượng đặt tối thiểu               │
│   Trường nào KHÔNG có trong tài liệu → PHẢI TRỐNG    │
│   Có giá trị mà tài liệu không ghi → XOÁ NGAY        │
└─────────────────────────┬───────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│ BƯỚC 3 — Đọc TRƯỜNG LOẠI B (đọc cho xuôi)           │
│   · Mô tả, lợi ích, ứng dụng đọc có hợp lý không     │
│   · Có CON SỐ nào không? Số đó có trong tài liệu?    │
│   · Huy hiệu chứng nhận có đúng tài liệu nêu?        │
└─────────────────────────┬───────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│ BƯỚC 4 — Kiểm bản tiếng Anh                          │
│   Chuyển ngôn ngữ, đọc lại                           │
└─────────────────────────┬───────────────────────────┘
                          ↓
              Sửa chỗ cần sửa → Bỏ cờ chờ duyệt → Xuất bản
```

**Vì sao tách bước 2 và bước 3.** Hai loại trường có hai tiêu chuẩn khác nhau nên cần hai cách kiểm khác nhau:

| | Trường loại A | Trường loại B |
| :---- | :---- | :---- |
| Cách kiểm | **Mở tài liệu gốc đối chiếu từng giá trị** | Đọc cho xuôi, chỉ soi các con số |
| Thời gian | Lâu hơn | Nhanh |
| Sai thì | Hậu quả nghiêm trọng | Sửa văn là xong |

Người duyệt không biết ranh giới này sẽ hoặc kiểm hời hợt cả hai (nguy hiểm), hoặc kiểm kỹ cả hai (mất thời gian không cần thiết).

### 3.4 Cấu hình nhà cung cấp

```
Quản trị viên → Hệ thống → Cài đặt AI
        ↓
Chọn nhà cung cấp: OpenRouter / OpenAI
        ↓
┌─ Thẻ Kết nối ────────────────────────────────┐
│  Khoá truy cập (ô chỉ quản trị viên thấy)     │
│  Tên ứng dụng — hiện trong bảng điều khiển    │
│  nhà cung cấp để kế toán đối chiếu chi phí    │
└──────────────────────────────────────────────┘
┌─ Thẻ Model ──────────────────────────────────┐
│  Model sinh nội dung                          │
│    Bỏ trống = để nhà cung cấp tự chọn         │
│  Model đọc ảnh / PDF scan                     │
│    ⚠ ĐỪNG để tự chọn — có thể chọn nhầm      │
│      model chỉ xử lý chữ, bước đọc ảnh HỎNG   │
└──────────────────────────────────────────────┘
┌─ Thẻ Ảnh ────────────────────────────────────┐
│  ⚠ OpenRouter KHÔNG tạo được ảnh.             │
│    Phần này LUÔN gọi thẳng OpenAI.            │
│  Khoá OpenAI cho sinh ảnh                     │
│  Model tạo ảnh                                │
└──────────────────────────────────────────────┘
        ↓
Lưu → ÁP DỤNG NGAY, không cần khởi động lại
```

**Hai cảnh báo đặt ngay trong giao diện, không đặt trong tài liệu.** Người cấu hình hiếm khi mở tài liệu. Đặt cảnh báo tại đúng ô đang thao tác là cách duy nhất để nó được đọc.

Cả hai đều là cạm bẫy có thật, đã gặp:

| Cảnh báo | Hậu quả nếu bỏ qua |
| :---- | :---- |
| Đừng để tự chọn ở mô hình đọc ảnh | Bộ định tuyến chọn mô hình chỉ xử lý chữ, bước đọc PDF scan hỏng, mà thông báo lỗi không nói rõ nguyên nhân |
| Tạo ảnh luôn cần khoá OpenAI riêng | Nút "Tạo lại ảnh" báo lỗi dù đã cấu hình đầy đủ cho OpenRouter |

### 3.5 Quét trùng lặp

```
Vận hành → Kiểm tra trùng lặp
        ↓
Chọn tuỳ chọn so khớp → Bắt đầu quét
        ↓
Danh sách cặp nghi trùng, kèm mức độ giống nhau
        ↓
Người xem từng cặp, tự quyết định
   ├─→ Đúng là trùng → xử lý thủ công
   └─→ Hai sản phẩm khác nhau → bỏ qua
```

**Hệ thống không tự gộp.** Hai tên gần giống có thể là hai sản phẩm thật sự khác nhau của hai nhà cung cấp. Gộp nhầm là mất dữ liệu.

---

## 4. Quy tắc hiển thị theo trạng thái

| Trạng thái | Hiển thị |
| :---- | :---- |
| Chưa đồng bộ kho tài liệu | "Chưa có tệp nguồn" + nút Đồng bộ |
| Đang có việc trong hàng đợi | Nhãn trạng thái + bước hiện tại, tự cập nhật |
| Công việc xong | Cờ **Chờ duyệt** trên nguyên liệu |
| Công việc lỗi | Nhãn đỏ + nút Xem nhật ký |
| Công việc có cảnh báo | Nhãn cam — **kết quả có thể thiếu** |
| Không có khoá dịch vụ | Thông báo rõ ràng, không để nút bấm rồi mới báo lỗi |

---

## 5. Ngôn ngữ giao diện

Toàn bộ nhãn và thông báo bằng **tiếng Việt**, kể cả nhật ký kỹ thuật. Người dùng là biên tập viên nội dung, không phải lập trình viên.

| Kém | Được |
| :---- | :---- |
| `Job failed: timeout on file extraction` | `Lỗi: tệp COA-2024.pdf quá hạn giờ khi bóc tách, đã bỏ qua` |
| `Invalid JSON response` | `Mô hình trả về dữ liệu không đọc được. Thử lại hoặc đổi mô hình.` |
| `Missing image API key` | `Chưa có khoá OpenAI cho sinh ảnh. Vào Cài đặt AI → thẻ Ảnh để đặt.` |

Thông báo lỗi tốt nói được **ba thứ**: chuyện gì xảy ra, ở đâu, làm gì tiếp theo. Cột bên phải làm đủ cả ba.

---

## 6. Khả năng tiếp cận và trải nghiệm

| Yêu cầu | Cách đáp ứng |
| :---- | :---- |
| Việc chạy lâu không được làm treo giao diện | Xếp hàng chạy nền, giao diện chỉ hỏi trạng thái |
| Thao tác tốn tiền phải xác nhận | Hộp thoại nêu rõ số lượng và nhắc về chi phí |
| Thao tác không hoàn tác được phải cảnh báo | Sinh hàng loạt cảnh báo trước |
| Người dùng luôn biết đang ở đâu | 9 trạng thái + mô tả bước |
| Huỷ được việc đã lỡ bấm | Nút huỷ trên mọi công việc chưa xong |

Ba dòng đầu xuất phát từ một đặc điểm riêng của DA2 mà DA1 không có: **thao tác ở đây tiêu tiền thật**. Bấm nhầm nút Lưu ở DA1 thì sửa lại; bấm nhầm "Tạo cho tất cả" ở DA2 thì tiền đã tiêu không lấy lại được.
