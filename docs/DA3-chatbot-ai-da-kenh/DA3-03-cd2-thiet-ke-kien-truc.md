<!--HOSO
phu_de: Chatbot AI đa kênh BioBot — Bioscope Assistants
pham_vi: Dự án DA3
ngay_lap: 22/01/2026
phien_ban: 1.3
nguoi_lap: Bộ phận Phát triển phần mềm — Công ty Bioscope
nguoi_duyet: Ban Giám đốc
lich_su: 1.0 | 22/01/2026 | Ban hành lần đầu — kiến trúc sáu dịch vụ
lich_su: 1.1 | 15/03/2026 | Bổ sung thiết kế dây chuyền tri thức
lich_su: 1.2 | 18/04/2026 | Bổ sung nhóm quy trình vận hành
lich_su: 1.3 | 08/06/2026 | Bổ sung thiết kế trợ lý có công cụ và ba lớp chốt chặn
-->
# DA3 — CÔNG ĐOẠN 2: THIẾT KẾ KIẾN TRÚC
## Chatbot AI đa kênh BioBot — Bioscope Assistants

> **Tài liệu liên quan:** `docs/SRS_MVP.md` mục 2 và mục 8 trong kho mã nguồn dự án mô tả kiến trúc ở mức chi tiết triển khai. Tài liệu này ghi **quyết định thiết kế và lý do**.

---

## 1. Kiến trúc tổng thể

```
   INTERNET
      │
┌─────▼──────────────────────────────────────────────────────┐
│  MÁY CHỦ WEB ĐỨNG TRƯỚC (kết nối mã hoá)                   │
└─────┬───────────────────────────┬──────────────────────────┘
      │                           │
      ↓                           ↓
┌──────────────┐          ┌──────────────────┐
│ 127.0.0.1    │          │ 127.0.0.1        │
│ :18080       │          │ :15678           │
│ giao diện    │          │ webhook kênh     │
│ web          │          │ nhắn tin         │
└──────┬───────┘          └────────┬─────────┘
       │                           │
       ↓                           ↓
┌─────────────────┐    ┌──────────────────────────────────┐
│ biobot_         │    │  biobot_n8n                       │
│ bioscope_api    │◄──►│  44 quy trình tự động hoá         │
│ FastAPI         │    │  · 6 kênh vào                     │
│ 20.356 dòng     │    │  · dây chuyền tri thức            │
│                 │    │  · nghiệp vụ                      │
│ · vòng lặp      │    │  · vận hành                       │
│   trợ lý        │    └──────────┬───────────────────────┘
│ · 14 công cụ    │               │
│ · chốt chặn     │               │
└───┬────┬────┬───┘               │
    │    │    │                   │
    ↓    ↓    ↓                   ↓
┌────────┐ ┌────────┐ ┌────────┐ ┌──────────────┐
│Postgres│ │ Qdrant │ │ Redis  │ │ Dịch vụ ngoài│
│30 bảng │ │2 bộ    │ │đệm +   │ │ mô hình,     │
│        │ │sưu tập │ │chống   │ │ nền tảng     │
│        │ │        │ │trùng   │ │ nhắn tin     │
└────────┘ └────────┘ └────────┘ └──────────────┘
```

### 1.1 Vì sao chia sáu dịch vụ

| Dịch vụ | Vì sao tách riêng |
| :---- | :---- |
| Nền tảng điều phối | Sửa quy trình nghiệp vụ **không cần lập trình viên** và không cần triển khai lại |
| Kho vectơ | Tìm theo ngữ nghĩa là bài toán riêng, cơ sở dữ liệu quan hệ không làm tốt |
| Cơ sở dữ liệu quan hệ | Dữ liệu có cấu trúc, cần giao dịch và ràng buộc toàn vẹn |
| Bộ nhớ đệm | Chống xử lý trùng cần bộ nhớ nhanh, có hạn dùng tự động |
| Dịch vụ máy chủ | Logic phức tạp (vòng lặp trợ lý, phân quyền) viết bằng mã dễ hơn dựng bằng quy trình |
| Giao diện web | Tách hoàn toàn khỏi máy chủ |

### 1.2 Ranh giới: cái gì dựng bằng quy trình, cái gì viết bằng mã

Đây là quyết định kiến trúc quan trọng nhất của DA3.

| Dựng bằng **quy trình tự động hoá** | Viết bằng **mã** |
| :---- | :---- |
| Nhận và định tuyến sự kiện từ các kênh | Vòng lặp trợ lý |
| Dây chuyền nạp tri thức | 14 công cụ tra dữ liệu |
| Nghiệp vụ nhiều bước (đơn hàng, phê duyệt) | Phân quyền công cụ |
| Thông báo, cảnh báo | Chốt chặn dược |
| Kiểm tra sức khoẻ, sao lưu | Định tuyến nhanh |
| Đồng bộ định kỳ | Quản lý phiên hội thoại |

**Nguyên tắc phân chia:**

| Loại việc | Nơi đặt | Lý do |
| :---- | :---- | :---- |
| Thay đổi thường xuyên theo nghiệp vụ | Quy trình | Người vận hành sửa được |
| Cần đọc kỹ, kiểm thử được, không được sai | Mã | Có kiểm kiểu, kiểm thử, xem lại lịch sử |
| **Liên quan an toàn và phân quyền** | **Mã** | **Không được để ai sửa nhầm trên giao diện** |

Dòng cuối là ràng buộc cứng: **mọi cơ chế an toàn đều nằm trong mã nguồn**, không nằm trong quy trình. Quy trình sửa được trên giao diện, mà thứ sửa được trên giao diện thì có ngày bị sửa nhầm.

---

## 2. Vòng lặp trợ lý

Trái tim của DA3.

### 2.1 Luồng xử lý một câu hỏi

```
   Câu hỏi vào
        ↓
┌───────────────────────────────────────────────────┐
│ ① CHỐT CHẶN DƯỢC                                  │
│    is_pharma_blocked(message)                      │
│    Chạy TRƯỚC mô hình, viết bằng mã                │
│    → Chặn: trả câu hướng dẫn, KẾT THÚC             │
└────────────────────┬──────────────────────────────┘
                     ↓ không chặn
┌───────────────────────────────────────────────────┐
│ ② LỌC CÔNG CỤ THEO VAI TRÒ                        │
│    get_tools_for_role(role)                        │
│    Mô hình chỉ nhìn thấy công cụ được phép         │
└────────────────────┬──────────────────────────────┘
                     ↓
┌───────────────────────────────────────────────────┐
│ ③ ĐỊNH TUYẾN NHANH                                │
│    Câu hỏi khớp mẫu rõ ràng?                       │
│    → Gọi thẳng công cụ đúng, BỎ QUA bước mô hình  │
│      chọn công cụ                                  │
└────────────────────┬──────────────────────────────┘
                     ↓ không khớp mẫu
┌───────────────────────────────────────────────────┐
│ ④ VÒNG LẶP — tối đa 5 lượt                        │
│    ┌─────────────────────────────────────────┐    │
│    │ Gọi mô hình với danh sách công cụ       │    │
│    │            ↓                             │    │
│    │ Mô hình yêu cầu gọi công cụ?            │    │
│    │   Có → kiểm quyền → chạy → đưa kết quả  │    │
│    │        vào ngữ cảnh → lặp lại            │    │
│    │   Không → thoát vòng lặp                 │    │
│    └─────────────────────────────────────────┘    │
└────────────────────┬──────────────────────────────┘
                     ↓
┌───────────────────────────────────────────────────┐
│ ⑤ TỔNG HỢP CÂU TRẢ LỜI                            │
│    "DỮ LIỆU TOOL (chỉ được dùng nguồn này)"        │
│    Trả theo dòng, chữ hiện dần                     │
└───────────────────────────────────────────────────┘
```

### 2.2 Hai hằng số quan trọng

```python
MAX_TOOL_CALLS = 5          # tối đa 5 lượt gọi tool / turn
MAX_RESPONSE_TOKENS = 2500  # tăng lên 2500 để đủ trình bày bảng thông tin sản phẩm dược
```

| Hằng số | Vì sao đặt giá trị này |
| :---- | :---- |
| `MAX_TOOL_CALLS = 5` | **Chặn vòng lặp không dừng.** Mô hình có thể gọi công cụ mãi không thoát; mỗi lượt tốn tiền và tốn thời gian. Năm lượt đủ cho câu hỏi phức tạp nhất đã gặp |
| `MAX_RESPONSE_TOKENS = 2500` | Ban đầu đặt thấp hơn, nhưng bảng thông số sản phẩm dược bị cắt giữa chừng. Chú thích trong mã ghi rõ lý do tăng |

### 2.3 Định tuyến nhanh — vì sao cần

```python
"""
agent_heuristics.py — Fast-path tool routing (không qua LLM chọn tool)

Xử lý câu hỏi rõ ràng + follow-up ngắn (đúng rồi / có / ok) để tránh lệch ngữ cảnh.
"""
```

Hai vấn đề mà bước này giải quyết:

| Vấn đề | Ví dụ | Cách xử lý |
| :---- | :---- | :---- |
| Mô hình chọn nhầm công cụ cho câu hỏi rõ ràng | *"Liệt kê sản phẩm trong danh mục X"* — rõ ràng phải gọi công cụ liệt kê sản phẩm, nhưng mô hình có thể gọi tìm kiếm ngữ nghĩa | Nhận mẫu câu bằng biểu thức chính quy, gọi thẳng công cụ đúng |
| Câu trả lời ngắn mất ngữ cảnh | Khách nói *"đúng rồi"*, *"ok"*, *"tiếp đi"* — mô hình không biết đang xác nhận điều gì | Nhận diện câu xác nhận, ghép với ngữ cảnh lượt trước |

**Lợi ích kép:** vừa đúng hơn, vừa rẻ hơn — bỏ qua được một lượt gọi mô hình.

### 2.4 Ngữ cảnh hội thoại

Giữ **15 lượt gần nhất**. Chú thích trong mã ghi lý do:

> giảm từ 40 xuống 15 turns, giữ nội dung tốt hơn

Đây là đánh đổi có đo đạc: 40 lượt nhưng mỗi lượt bị cắt ngắn, so với 15 lượt giữ nguyên nội dung. Chọn phương án hai vì câu trả lời của trợ lý thường chứa **danh sách dữ liệu** — cắt ngắn là mất chính phần quan trọng.

---

## 3. Ba lớp chốt chặn an toàn

### 3.1 Lớp 1 — Chốt chặn dược

```python
"""
pharma_guard.py — Bộ lọc cứng cho câu hỏi y tế / dược phẩm

Chạy SAU intent classifier như lớp bảo vệ thứ 2.
Python-level check — không phụ thuộc LLM nên không thể bị bypass bằng prompt injection.
"""
```

**Hai tầng kiểm:**

| Tầng | Cơ chế | Điểm mạnh | Điểm yếu |
| :---- | :---- | :---- | :---- |
| 1 | Bộ phân loại ý định trả về mã `PHARMA_BLOCKED` | Hiểu ngữ cảnh, bắt được cách hỏi vòng vo | **Phụ thuộc mô hình** — có thể bị dụ |
| 2 | Khớp từ khoá viết bằng mã | **Không phụ thuộc mô hình, không dụ được** | Chỉ bắt được từ khoá đã liệt kê |

Hai tầng bù khuyết điểm cho nhau. Tầng 2 là tầng **không thể vượt**: nó chạy trên chuỗi ký tự thô, trước khi mô hình nhìn thấy câu hỏi.

**Năm nhóm từ khoá:**

| Nhóm | Ví dụ từ khoá |
| :---- | :---- |
| Tác dụng, chỉ định | tác dụng, công dụng, điều trị, chữa bệnh, chỉ định, bệnh gì, triệu chứng |
| Liều dùng | liều dùng, liều lượng, uống bao nhiêu, ngày uống, liều nhi, liều người lớn |
| Chống chỉ định, tương tác | chống chỉ định, tương tác thuốc, không dùng với, tác dụng phụ, quá liều |
| So sánh hiệu quả điều trị | thuốc nào tốt hơn, hiệu quả hơn, nên dùng thuốc nào |
| Thuật ngữ tiếng Anh | indication, contraindication, drug interaction, side effect, dosage, posology |

**Câu trả lời khi chặn** không phải từ chối cụt lủn mà hướng người hỏi tới nguồn đúng: tờ hướng dẫn sử dụng kèm sản phẩm, dược sĩ hoặc bác sĩ phụ trách, và cơ quan quản lý dược.

Thiết kế này quan trọng: từ chối cụt lủn làm khách bực và có thể khiến họ đi hỏi nguồn không đáng tin. Chỉ đường tới nguồn đúng vừa an toàn vừa có ích.

### 3.2 Lớp 2 — Phân quyền công cụ

Chi tiết ở `DA3-01` mục 7.2.

**Điểm cốt lõi nhắc lại:** danh sách công cụ được lọc **trước khi gửi cho mô hình**. Mô hình không biết công cụ ngoài quyền tồn tại. Đây là ràng buộc cứng, không phải lời đề nghị.

Có thêm một lớp kiểm nữa **lúc chạy công cụ** — `is_tool_allowed(tool_name, role)` — phòng trường hợp công cụ được gọi qua đường khác.

### 3.3 Lớp 3 — Chỉ dùng dữ liệu công cụ trả về

Ở bước tổng hợp câu trả lời, câu lệnh gửi mô hình có dòng:

```
## DỮ LIỆU TOOL (chỉ được dùng nguồn này):
```

Mô hình chỉ được soạn câu trả lời từ khối dữ liệu đó, không được dùng kiến thức sẵn có. Đây là lớp mềm — dựa vào việc mô hình nghe lời — nên được bù bằng việc **giới hạn số dòng dữ liệu đưa vào ngữ cảnh** (tối đa 80 dòng mỗi công cụ), để câu trả lời bám sát dữ liệu thật.

---

## 4. Kiến trúc đa kênh

### 4.1 Sáu kênh, một bộ xử lý

```
Zalo ──────┐
Telegram ──┤
Messenger ─┤    ┌─────────────────────────┐
WhatsApp ──┼───►│ WF05                     │───► vòng lặp trợ lý
Web ───────┤    │ universal-channel-       │
Email ─────┘    │ processor                │
                │ · chuẩn hoá tin nhắn     │
   mỗi kênh     │ · nhận diện người dùng   │
   một quy      │ · quản lý phiên          │
   trình riêng  │ · định tuyến             │
                └─────────────────────────┘
```

| Tầng | Trách nhiệm | Số lượng |
| :---- | :---- | :---- |
| Quy trình riêng từng kênh | Nhận webhook, xác thực, chuyển về dạng chuẩn | 6 |
| Bộ xử lý chung | Toàn bộ logic nghiệp vụ | 1 |

**Vì sao thiết kế hai tầng.** Nếu mỗi kênh tự xử lý trọn vẹn thì logic nghiệp vụ có sáu bản; sửa một quy tắc phải sửa sáu chỗ, và chắc chắn sẽ sót. Tách ra thì **logic chỉ có một bản**, mỗi kênh chỉ lo phần khác biệt của nền tảng đó.

Lợi ích thứ hai: thêm kênh thứ bảy chỉ cần viết một quy trình chuyển đổi, không đụng logic nghiệp vụ.

### 4.2 Chống xử lý trùng

`WF54_event-dedup`. **Nền tảng nhắn tin có thể gửi lặp một sự kiện** khi không nhận được xác nhận kịp. Không chống trùng thì khách nhận hai câu trả lời giống nhau, và công ty trả tiền hai lần cho một câu hỏi.

Cơ chế: lưu mã sự kiện vào bộ nhớ đệm có hạn dùng; sự kiện trùng mã bị bỏ qua.

### 4.3 Làm mới khoá truy cập

`WF51_token-refresher`. Khoá truy cập của các nền tảng nhắn tin có hạn. Hết hạn thì kênh chết **âm thầm** — không báo lỗi, chỉ là không nhận được tin nữa. Quy trình này làm mới khoá trước khi hết hạn.

---

## 5. Dây chuyền tri thức

```
   Kho tài liệu
        ↓
   WF10a  drive-scanner        quét, phát hiện tệp mới và tệp đã sửa
        ↓
   WF10b  content-extractor    bóc tách nội dung
        ↓  (tệp scan, ảnh)
   WF22   vision-ocr           đọc chữ trong ảnh
        ↓
   [cắt đoạn]                  chia tài liệu thành đoạn
        ↓
   [sinh vectơ]                gọi mô hình sinh vectơ
        ↓
   WF10c  qdrant-updater       nạp vào kho vectơ
        ↓
   WF11g  faq-qdrant-verify    kiểm chứng đã nạp đúng

   WF10d  sync-orchestrator    điều phối toàn bộ chuỗi trên
```

### 5.1 Hai bộ sưu tập tách biệt

| Bộ sưu tập | Nội dung | Ai truy cập |
| :---- | :---- | :---- |
| `sales_kb` | Sản phẩm, lịch sử trao đổi với khách | Vai trò `sales`, `admin` |
| `kt_docs` | Hoá đơn, chứng từ | Vai trò `ke_toan`, `admin` |

**Tách ở tầng kho lưu trữ, không chỉ tầng truy vấn.** Đây là lớp bảo vệ thứ hai cho yêu cầu NV-06: kể cả khi có lỗi lập trình ở tầng truy vấn, dữ liệu vẫn nằm ở hai nơi khác nhau.

### 5.2 Xử lý kích thước vectơ

```python
def _fit_vector_size(vec: list[float], size: int) -> list[float]:
    ...
    logger.debug("Truncate embedding %s → %s dims (Matryoshka)", n, size)
    raise ValueError(f"Embedding dim {n} < Qdrant size {size}")
```

Mô hình sinh vectơ có thể trả về số chiều khác với số chiều kho vectơ đang dùng. Hàm này cắt bớt khi thừa và **báo lỗi rõ ràng khi thiếu**.

Cắt bớt được là nhờ đặc tính của mô hình sinh vectơ hiện đại: thông tin quan trọng nhất dồn về các chiều đầu. Nhưng thiếu chiều thì không bù được — nên báo lỗi thay vì đệm số 0, vì đệm số 0 sẽ làm sai lệch kết quả tìm kiếm mà không ai biết.

### 5.3 Xuất kho vectơ ra tài liệu

`WF13`, `WF14`. Đưa nội dung trong kho vectơ ra dạng tài liệu đọc được, để người rà soát xem trợ lý đang "biết" những gì.

Đây là chức năng **kiểm chứng chất lượng tri thức** — không có nó thì kho vectơ là hộp đen.

---

## 6. Xử lý lỗi và vận hành

| Quy trình | Chức năng | Vì sao cần |
| :---- | :---- | :---- |
| `WF04_error-handler` | Xử lý lỗi tập trung | Lỗi ở đâu cũng đi về một chỗ, không mỗi quy trình một kiểu |
| `WF52_error-alerting` | Cảnh báo lỗi | Người vận hành biết ngay, không đợi khách phàn nàn |
| `WF53_dead-letter-queue` | Hàng đợi việc chết | Việc thất bại nhiều lần đưa sang đây, **không chặn hàng đợi chính** |
| `WF50_health-check` | Kiểm tra sức khoẻ | Phát hiện dịch vụ chết trước khi khách phát hiện |
| `WF12_backup-automation` | Sao lưu tự động | |
| `WF09_smart-cache` | Bộ nhớ đệm | Câu hỏi lặp không phải gọi mô hình lại — **giảm chi phí** |
| `WF08_ai-logger` | Nhật ký AI | Truy vết mọi lượt gọi mô hình |

**Hàng đợi việc chết là thành phần hay bị bỏ nhất và quan trọng nhất.** Không có nó, một việc lỗi lặp đi lặp lại sẽ chiếm chỗ và chặn mọi việc khác — cả hệ thống đứng vì một tin nhắn hỏng.

---

## 7. Bảo mật

### 7.1 Mọi cổng chỉ mở nội bộ

```yaml
ports:
  - "127.0.0.1:${BIOBOT_N8N_HOST_PORT:-15678}:5678"
  - "127.0.0.1:${BIOBOT_QDRANT_HTTP_HOST_PORT:-16333}:6333"
  - "127.0.0.1:${BIOBOT_POSTGRES_HOST_PORT:-15432}:5432"
  - "127.0.0.1:${BIOBOT_REDIS_HOST_PORT:-16379}:6379"
  - "127.0.0.1:${BIOSCOPE_API_PORT:-18000}:8000"
  - "127.0.0.1:${BIOSCOPE_FRONTEND_PORT:-18080}:80"
```

**Cả sáu dịch vụ đều gắn vào `127.0.0.1`.** Quét cổng từ Internet không thấy gì. Truy cập đi qua máy chủ web đứng trước, nơi có kết nối mã hoá và kiểm soát truy cập.

Đây là khác biệt lớn so với cấu hình mặc định của phần lớn hướng dẫn cài đặt — chúng thường ghi `- "5678:5678"`, tức mở ra **mọi giao diện mạng**. Kho vectơ và cơ sở dữ liệu mở ra Internet là lỗi bảo mật nghiêm trọng.

### 7.2 Các lớp khác

| Lớp | Cơ chế |
| :---- | :---- |
| Vận chuyển | Kết nối mã hoá ở máy chủ web đứng trước |
| Nền tảng điều phối | Xác thực cơ bản + khoá mã hoá dữ liệu |
| Webhook | Xác thực chữ ký từ nền tảng nhắn tin |
| Giao diện lập trình | Xác thực người dùng, phân quyền theo vai trò |
| Công cụ | Danh sách trắng theo vai trò, kiểm hai lần |
| Dữ liệu | Hai bộ sưu tập vectơ tách biệt |
| Nhật ký | Ghi mọi lượt gọi mô hình và gọi công cụ |
| Bí mật | Biến môi trường, không nằm trong mã nguồn |

---

## 8. Nhật ký quyết định kỹ thuật

### QĐ-01 — Dùng nền tảng điều phối quy trình

**Bối cảnh:** đội nhỏ, cần dựng nhanh nhiều luồng nghiệp vụ.

| Phương án | Vì sao loại |
| :---- | :---- |
| Viết tay toàn bộ bằng mã | Quá nhiều việc; mỗi thay đổi nghiệp vụ cần lập trình viên |
| Dùng dịch vụ tự động hoá đám mây | Dữ liệu đi qua bên thứ ba; chi phí theo lượt |
| **Nền tảng điều phối tự vận hành** | **Chọn** |

**Vì sao chọn:** dữ liệu không ra khỏi máy chủ công ty; sửa quy trình trên giao diện; xuất được ra tệp để lưu trong kho mã nguồn.

**Đánh đổi:** logic nằm trong tệp định nghĩa quy trình khó xem lại lịch sử thay đổi hơn mã nguồn. Xử lý bằng cách **đặt mọi logic an toàn vào mã, không vào quy trình**.

### QĐ-02 — Trợ lý có công cụ thay vì hỏi-đáp một lượt

| Phương án | Đánh giá |
| :---- | :---- |
| Tìm kiếm ngữ nghĩa rồi nhồi kết quả vào câu lệnh | Đơn giản. Nhưng không trả lời được câu cần tính toán hay tra nhiều nguồn |
| **Trợ lý tự chọn công cụ** | Trả lời được câu phức tạp; **phân quyền được ở tầng công cụ**. Chọn |

Lợi ích thứ hai mới là lý do quyết định: phân quyền ở tầng công cụ là cách sạch nhất để đáp ứng NV-06.

**Đánh đổi:** phức tạp hơn, tốn nhiều lượt gọi mô hình hơn. Bù bằng định tuyến nhanh và giới hạn 5 lượt.

### QĐ-03 — Chốt chặn dược viết bằng mã, không viết trong câu lệnh

**Vì sao:** quy tắc trong câu lệnh là *lời đề nghị*; mô hình có thể bị dụ bỏ qua. Bộ lọc viết bằng mã chạy **trước** khi mô hình nhìn thấy câu hỏi.

**Đánh đổi:** chặn nhầm câu hỏi vô hại có chứa từ khoá. Chấp nhận — **chặn nhầm rẻ hơn nhiều so với lọt**. Hướng sai an toàn.

### QĐ-04 — Lọc danh sách công cụ trước khi gửi cho mô hình

**Vì sao:** để mô hình "biết có công cụ nhưng đừng gọi" là mời gọi rắc rối. Không gửi thì không có gì để gọi.

### QĐ-05 — Giới hạn 5 lượt gọi công cụ

**Vì sao:** chặn vòng lặp không dừng, chặn chi phí không kiểm soát.

**Đánh đổi:** câu hỏi rất phức tạp có thể bị cắt. Chưa gặp trường hợp nào cần quá 5 lượt.

### QĐ-06 — Tách hai bộ sưu tập vectơ

**Vì sao:** lớp bảo vệ thứ hai cho phân tách dữ liệu. Lỗi ở tầng truy vấn vẫn không lộ dữ liệu vì chúng nằm hai nơi.

### QĐ-07 — Mọi cổng gắn vào máy cục bộ

**Vì sao:** kho vectơ và cơ sở dữ liệu không có lý do gì phải truy cập được từ Internet.

**Đánh đổi:** phải cấu hình máy chủ web đứng trước. Đáng.

### QĐ-08 — Giữ 15 lượt hội thoại thay vì 40

**Vì sao:** 15 lượt giữ nguyên nội dung tốt hơn 40 lượt bị cắt ngắn. Câu trả lời của trợ lý thường chứa danh sách dữ liệu — cắt ngắn là mất phần quan trọng.

**Ghi lại vì:** đây là quyết định **đảo ngược** một lựa chọn trước đó, dựa trên quan sát thực tế.

### QĐ-09 — Tăng giới hạn độ dài câu trả lời lên 2500

**Vì sao:** bảng thông số sản phẩm dược bị cắt giữa chừng ở giá trị cũ. Chú thích ghi thẳng lý do trong mã.

---

## 9. Điểm tiếp giáp

| Hệ thống | Chiều | Giao thức | Dùng để |
| :---- | :---- | :---- | :---- |
| Zalo OA | Hai chiều | HTTPS + webhook + OAuth | Kênh nhắn tin |
| Telegram | Hai chiều | HTTPS + webhook | Kênh nhắn tin |
| Messenger, WhatsApp | Hai chiều | HTTPS + webhook | Kênh nhắn tin |
| Thư điện tử | Hai chiều | SMTP / IMAP | Kênh nhắn tin |
| Mô hình ngôn ngữ | Ra | HTTPS | Trợ lý, phân loại ý định |
| Mô hình sinh vectơ | Ra | HTTPS | Nạp tri thức, tìm ngữ nghĩa |
| Google Drive | Ra | API, tài khoản dịch vụ | Kho tài liệu nguồn |
| Lark | Ra | HTTPS | Thông báo nội bộ |
| Veridion | Ra | HTTPS | Tra cứu nhà cung cấp |
| **Giao diện danh mục của DA1** | Ra | HTTPS + khoá | **Lấy dữ liệu nguyên liệu** |

Dòng cuối là điểm nối giữa DA3 và DA1.

---

## 10. Khả năng mở rộng

| Tình huống | Cách xử lý đã thiết kế |
| :---- | :---- |
| Thêm kênh thứ bảy | Viết một quy trình chuyển đổi, không đụng logic nghiệp vụ |
| Thêm công cụ mới | Viết hàm công cụ, khai vào danh sách trắng của vai trò tương ứng |
| Thêm vai trò mới | Thêm một mục vào bảng phân quyền công cụ |
| Thêm miền nghiệp vụ mới | Thêm bộ sưu tập vectơ, bộ công cụ, vai trò |
| Lượng hội thoại tăng | Bộ nhớ đệm đã có; bước tiếp theo là tách dịch vụ máy chủ ra nhiều bản |
| Đổi mô hình ngôn ngữ | Sửa cấu hình; lớp gọi mô hình đã tách riêng |

Ba dòng đầu cho thấy kiến trúc được thiết kế để **mở rộng theo chiều ngang** — thêm kênh, thêm công cụ, thêm vai trò đều là thao tác cộng thêm, không phải sửa lại.
