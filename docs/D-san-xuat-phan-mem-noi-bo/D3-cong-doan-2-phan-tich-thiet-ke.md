# D3 — CÔNG ĐOẠN 2: PHÂN TÍCH VÀ THIẾT KẾ

> **⚠️ Ghi chú về tính trung thực của tài liệu này**
>
> Dự án **không đi qua công cụ thiết kế đồ hoạ** (Figma hoặc tương đương).
> Giao diện được thiết kế và thực thi trực tiếp bằng mã, lấy ảnh tham chiếu
> `example_home.jpg` làm định hướng thị giác ban đầu.
>
> Tài liệu này **lập ngày 28/08/2026**, hệ thống hoá lại thiết kế đã thực thi.
> Nội dung mô tả đúng hệ thống đang chạy, trích từ mã nguồn thật.
>
> Không có tài liệu thiết kế nào được tạo lùi ngày.

---

## 1. Phân tích kiến trúc

Kiến trúc được phân tích và chốt tại `SRS_BIOSCOPE.md` chương 1–8, **ngày
27/06/2026** — tức trước giai đoạn phát triển chính.

### Quyết định kiến trúc và lý do

| Quyết định | Lý do |
|---|---|
| Kho mã đơn thể, hai ứng dụng | Dùng chung module, không sao chép mã giữa hệ quản trị và website |
| Tách thành 12 module bật tắt được | Tái sử dụng cho dự án sau, nghiệp vụ riêng gói gọn một chỗ |
| Nghiệp vụ Bioscope gói trong một module | Nâng cấp nền tảng không phải sửa rải rác |
| Trang dựng bằng khối | Biên tập viên tự dựng trang, không cần lập trình viên |
| Đa ngữ ở tầng dữ liệu | Hai bản nội dung độc lập, không dịch máy khi hiển thị |
| Việc nặng chạy nền có hàng đợi | Sinh nội dung và đồng bộ mất nhiều phút, không chặn giao diện |
| Nội dung tĩnh dự phòng | Hệ quản trị ngừng thì website vẫn phục vụ được |

Sơ đồ ba tầng và bản đồ module đầy đủ ở [B1](../B-he-thong-website/B1-kien-truc-tong-quan.md).

---

## 2. Thiết kế cơ sở dữ liệu

### Quy mô

| Chỉ tiêu | Giá trị |
|---|---|
| Nhóm dữ liệu nghiệp vụ | ~35 |
| Bảng vật lý trong PostgreSQL | **403** |
| Tệp chuyển đổi cấu trúc | 25 |

Chênh lệch giữa 35 và 403 đến từ thiết kế đa ngữ và quan hệ: mỗi trường đa ngữ,
mỗi mảng, mỗi quan hệ nhiều-nhiều đều sinh bảng phụ.

### Sơ đồ quan hệ chính

```
                    ┌──────────────────────┐
                    │     ingredients      │  1.557 bản ghi
                    │  (nguyên liệu)       │
                    └──┬───┬───┬───┬───┬───┘
       ┌───────────────┘   │   │   │   └──────────────┐
       ▼                   ▼   │   ▼                  ▼
┌──────────────┐  ┌──────────┐ │ ┌──────────┐  ┌────────────┐
│ ingredient-  │  │ingredient│ │ │ partners │  │technologies│
│ categories   │  │ -facets  │ │ │(đối tác) │  │(công nghệ) │
└──────────────┘  └──────────┘ │ └──────────┘  └────────────┘
                   5 nhóm thẻ  │
                               ▼
                        ┌────────────┐
                        │   media    │ ảnh, tài liệu
                        └────────────┘

┌──────────┐      ┌─────────────────────┐      ┌───────────────┐
│ members  │◄─────┤ chat-conversations  ├─────►│ chat-messages │
│(thành    │      │ (phiên chat + dữ    │      │  (tin nhắn)   │
│ viên B2B)│      │  liệu theo dõi)     │      └───────────────┘
└────┬─────┘      └─────────────────────┘
     │
     ▼
┌──────────────────┐
│ gated-documents  │ tài liệu B2B giới hạn
└──────────────────┘

┌────────┐   ┌────────────────────────────────────────┐
│ pages  ├──►│ 8 khối: hero, stats, featureGrid,      │
└────────┘   │ gallery, cta, richText, videoEmbed,    │
             │ logoCloud                              │
             └────────────────────────────────────────┘
```

### Nguyên tắc thiết kế dữ liệu

| Nguyên tắc | Thể hiện |
|---|---|
| Bản nháp tách khỏi bản xuất bản | Trường `_status`, bản nháp không ra ngoài |
| Thẻ phân loại dùng chung | Một bảng `ingredient-facets`, phân nhóm bằng trường `group` |
| Dữ liệu nhạy cảm gắn quyền tại trường | Bảng giá chỉ nhân viên đọc được |
| Công việc chạy nền có bảng riêng | Truy được nguồn khi sai |
| Chuyển đổi cấu trúc chỉ thêm, không xoá | 25 tệp đều lặp lại được an toàn |

Mô hình dữ liệu chi tiết ở [B2](../B-he-thong-website/B2-mo-hinh-du-lieu.md), mô hình nguyên liệu
đầy đủ ở [A1](../A-ai-cap-nhat-san-pham/A1-mo-hinh-du-lieu-nguyen-lieu.md).

---

## 3. Thiết kế luồng nghiệp vụ

### Luồng sinh nội dung tự động

```
Biên tập viên chọn nguyên liệu
        │
        ▼
   Tạo công việc ──► hàng đợi
        │
        ▼
   Tải tài liệu từ Google Drive
        │
        ▼
   Trích văn bản (PDF scan → mô hình đọc ảnh)
        │
        ▼
   Sinh nội dung ──► Sinh ảnh (tuỳ chọn)
        │
        ▼
   Lưu ở dạng BẢN NHÁP
        │
        ▼
   Biên tập viên duyệt ──► Xuất bản
```

Điểm thiết kế quan trọng: **kết thúc ở bản nháp, không tự xuất bản.** Đây là
chốt chặn giữa nội dung do máy sinh và khách hàng thật.

### Luồng trò chuyện trực tuyến

```
Khách (đã đăng nhập) → Widget → Hệ quản trị → Telegram (1 chủ đề / khách)
                                     │                    │
                                     ▼                    ▼
                                PostgreSQL      Nhân viên kinh doanh
                                     ▲                    │
                                     └────────────────────┘
```

Chi tiết ở [C1](../C-chatbot-ai-tich-hop/C1-kien-truc-chat-tren-web.md).

### Luồng cấp dữ liệu cho hệ thống ngoài

```
Hệ thống ngoài → khoá API → kiểm quyền → 3 lớp chặn rò rỉ → dữ liệu
                     │
                     └─► thiếu quyền → 403
```

---

## 4. Thiết kế bảo mật

Ba lớp chặn rò rỉ độc lập, thiết kế để sai một lớp vẫn còn hai lớp:

| Lớp | Cơ chế |
|---|---|
| 1 | Quyền của nền tảng — cắt bản nháp và trường nội bộ |
| 2 | Danh sách trường được phép truy vấn |
| 3 | Hàm nặn dữ liệu liệt kê tay từng trường |

Nguyên tắc **chặn mặc định**: không cấp quyền thì không gọi được gì; nhóm dữ
liệu không khai báo thì không có đường ra API.

Chi tiết ở [B6](../B-he-thong-website/B6-bao-mat-quyen-rieng-tu.md).

---

## 5. Thiết kế giao diện

### Bộ nhận diện

Trích từ `dv-cms/apps/bioscope-frontend/src/app/globals.css` — được định nghĩa
tập trung, không rải rác trong từng thành phần.

| Thành phần | Giá trị |
|---|---|
| Màu chính | `#008E4D` — xanh sinh học, lấy từ logo |
| Màu chính đậm | `#036F3D` |
| Màu nền nhạt | `#EEF6F1` |
| Màu viền | `#CFE3D8` |
| Màu nhấn | `#F58E33` — cam sức sống |
| Màu nhấn nhạt | `#FFF4E8` |
| Màu chữ | `#101814` |
| Màu nền phụ | `#F4F8F6` |
| Phông chữ | Be Vietnam Pro |
| Bo góc | 16px · 24px · 28px |

Nguồn tham chiếu thị giác ban đầu: `example_home.jpg` và logo `logo.avif`.

### Ngưỡng hiển thị

| Bề rộng | Bố cục |
|---|---|
| < 640px | Điện thoại — một cột |
| 640–1279px | Máy tính bảng — menu thu gọn |
| ≥ 1280px | Máy tính — điều hướng ngang đầy đủ |

Thanh điều hướng dùng bề rộng tối đa 1440px, rộng hơn phần thân trang 1280px.

### Thư viện thành phần

25 route dùng chung một bộ thành phần: header, footer, popup xác thực, widget
chat, thẻ nguyên liệu, bộ lọc, ô mật khẩu có đo độ mạnh, khối dựng trang.

Danh mục trang đầy đủ ở [B3](../B-he-thong-website/B3-danh-muc-trang.md).

---

## 6. Kết luận công đoạn 2

| Tiêu chí | Đánh giá |
|---|---|
| Phân tích kiến trúc | ✅ Chốt trong đặc tả 27/06/2026 |
| Thiết kế cơ sở dữ liệu | ✅ 403 bảng, 25 tệp chuyển đổi cấu trúc |
| Thiết kế luồng nghiệp vụ | ✅ Hệ thống hoá tại tài liệu này |
| Thiết kế bảo mật | ✅ Ba lớp chặn, có trong mã nguồn |
| Thiết kế giao diện | ✅ Bộ nhận diện định nghĩa tập trung |
| Bản vẽ từ công cụ thiết kế đồ hoạ | ❌ Không có — dự án thiết kế trực tiếp bằng mã |

Công đoạn 2 **có bằng chứng thiết kế thật trong mã nguồn**, được hệ thống hoá
thành tài liệu ngày 28/08/2026.
