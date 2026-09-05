<!--HOSO
phu_de: Chatbot AI đa kênh BioBot — Bioscope Assistants
pham_vi: Dự án DA3
ngay_lap: 26/01/2026
phien_ban: 1.2
nguoi_lap: Quân — Team phát triển, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 26/01/2026 | Ban hành lần đầu — 18 bảng nền tảng
lich_su: 1.1 | 20/04/2026 | Bổ sung 12 bảng mô-đun Bioscope Assistants
lich_su: 1.2 | 08/06/2026 | Bổ sung thiết kế hai bộ sưu tập vectơ
-->
# DA3 — CÔNG ĐOẠN 2: THIẾT KẾ DỮ LIỆU
## Chatbot AI đa kênh BioBot — Bioscope Assistants

> **Tài liệu liên quan:** `docs/SRS_MVP.md` mục 7 trong kho mã nguồn dự án mô tả cấu trúc dữ liệu ở mức triển khai. Tài liệu này ghi **thiết kế và lý do**.

---

## 1. Ba kho dữ liệu

DA3 dùng ba kho, mỗi kho một loại dữ liệu và một cách truy vấn:

| Kho | Công nghệ | Nội dung | Cách truy vấn |
| :---- | :---- | :---- | :---- |
| Quan hệ | PostgreSQL 16 | Dữ liệu có cấu trúc: người dùng, phiên, đơn hàng, hoá đơn, nhật ký | Truy vấn có điều kiện chính xác |
| Vectơ | Qdrant | Nội dung tài liệu đã cắt đoạn và sinh vectơ | **Tìm theo ngữ nghĩa** |
| Đệm | Redis | Kết quả tạm, mã sự kiện đã xử lý | Tra theo khoá, có hạn dùng |

### Vì sao cần cả ba

| Câu hỏi | Kho phù hợp | Vì sao |
| :---- | :---- | :---- |
| *"Liệt kê hoá đơn tháng 3"* | Quan hệ | Điều kiện chính xác, cần tính tổng |
| *"Nguyên liệu nào có tác dụng chống oxy hoá"* | Vectơ | Tài liệu không chứa đúng cụm từ đó, cần hiểu nghĩa |
| *"Sự kiện này đã xử lý chưa"* | Đệm | Tra rất nhanh, tự hết hạn |

Dùng một kho cho cả ba loại câu hỏi thì hoặc chậm, hoặc sai, hoặc không làm được.

---

## 2. Cơ sở dữ liệu quan hệ — 30 bảng

Chia hai tệp khởi tạo theo hai giai đoạn phát triển:

| Tệp | Số bảng | Giai đoạn |
| :---- | :---- | :---- |
| `01_create_tables.sql` | 18 | Nền tảng BioBot — kênh, phiên, nhật ký, vận hành |
| `02_bioscope.sql` | 12 | Mô-đun Bioscope Assistants — người dùng, tài liệu, kế toán |

### 2.1 Nhóm kênh và phiên

| Bảng | Vai trò |
| :---- | :---- |
| `chat_sessions` | Phiên hội thoại |
| `customers` | Khách hàng, gộp danh tính từ nhiều kênh |
| `zalo_tokens` | Khoá truy cập nền tảng Zalo |
| `form_tokens` | Khoá dùng một lần cho biểu mẫu |

#### `chat_sessions`

| Trường | Kiểu | Ý nghĩa |
| :---- | :---- | :---- |
| `session_id` | VARCHAR(255) | Mã phiên |
| `user_id` | VARCHAR(100) | Người dùng |
| `zalo_user_id` | VARCHAR(100) | Mã người dùng trên kênh Zalo |
| `channel` | VARCHAR(50) | Kênh vào |
| `context` | **JSONB** | **Ngữ cảnh hội thoại** |
| `last_message_at` | TIMESTAMP | Tin gần nhất |
| `expires_at` | TIMESTAMP | Hạn phiên |
| `customer_segment` | VARCHAR(50) | Phân khúc khách |

**Vì sao `context` lưu dạng dữ liệu tự do.** Ngữ cảnh hội thoại có cấu trúc thay đổi theo từng phiên: lượt trao đổi gần đây, thực thể đã nhắc tới, công cụ đã gọi. Ép vào cột cố định thì mỗi lần thêm loại ngữ cảnh phải đổi cấu trúc bảng.

**Vì sao có `expires_at`.** Ngữ cảnh cũ gây hại nhiều hơn có ích — khách quay lại sau ba ngày hỏi chuyện khác mà trợ lý vẫn bám ngữ cảnh cũ thì trả lời sai. Phiên hết hạn thì bắt đầu lại từ đầu.

#### `customers` — gộp danh tính đa kênh

```
customer_name, phone_number,
zalo_id, telegram_id, facebook_id,
segment
```

Một khách có thể nhắn qua nhiều kênh. Ba cột mã kênh cho phép **nhận ra đó là cùng một người**, nhờ vậy lịch sử trao đổi liền mạch và nhân viên không phải hỏi lại từ đầu.

#### `zalo_tokens` — có cơ chế khoá

| Trường | Ý nghĩa |
| :---- | :---- |
| `token_type`, `token_value`, `expires_at` | Khoá và hạn |
| `is_locked`, `locked_by`, `locked_at` | **Khoá chống làm mới đồng thời** |

**Vì sao cần khoá.** Khoá truy cập nền tảng làm mới bằng một mã dùng một lần. Hai tiến trình cùng làm mới một lúc thì một cái thành công, cái kia dùng mã đã hết hiệu lực và **làm hỏng cả khoá** — kênh chết cho tới khi có người vào cấu hình lại bằng tay.

Ba cột khoá này chặn đúng tình huống đó.

### 2.2 Nhóm nhật ký — bằng chứng vận hành

| Bảng | Nội dung | Dùng để |
| :---- | :---- | :---- |
| `ai_interaction_logs` | Mọi lượt gọi mô hình | Truy vết, đo chi phí, đo tốc độ |
| `intent_logs` | Kết quả phân loại ý định | Đánh giá độ chính xác phân loại |
| `error_logs` | Lỗi từ các quy trình | Chẩn đoán |
| `audit_log` | Thao tác trên dữ liệu | Truy vết an ninh |
| `health_logs` | Kết quả kiểm tra sức khoẻ | Theo dõi khả dụng |
| `sync_logs` | Lượt đồng bộ tri thức | Theo dõi cập nhật |
| `backup_logs` | Lượt sao lưu | Kiểm chứng sao lưu chạy |
| `approval_history` | Lịch sử phê duyệt | Truy vết nghiệp vụ |

#### `ai_interaction_logs` — bảng nhật ký quan trọng nhất

| Trường | Kiểu | Ý nghĩa |
| :---- | :---- | :---- |
| `user_id`, `session_id`, `channel` | VARCHAR | Ai hỏi, phiên nào, kênh nào |
| `message` | TEXT | Câu hỏi |
| `response` | TEXT | Câu trả lời |
| `intent` | VARCHAR(100) | Ý định đã phân loại |
| `model_used` | VARCHAR(100) | **Mô hình đã dùng** |
| `tokens_used` | INTEGER | **Số đơn vị đã tiêu** |
| `latency_ms` | INTEGER | **Thời gian phản hồi** |
| `created_at` | TIMESTAMPTZ | Mốc thời gian |

Ba trường in đậm phục vụ ba mục đích khác nhau:

| Trường | Trả lời câu hỏi |
| :---- | :---- |
| `model_used` | Chất lượng câu trả lời này do mô hình nào tạo ra? Đổi mô hình có tốt hơn không? |
| `tokens_used` | Chi phí thật là bao nhiêu? Đối chiếu hoá đơn được không? |
| `latency_ms` | Hệ thống có đang chậm dần không? Chậm ở đâu? |

Bảng này cũng là **bằng chứng vận hành mạnh nhất của DA3**: nó chứa hội thoại thật với người dùng thật, tích luỹ theo thời gian thật.

### 2.3 Nhóm người dùng và phân quyền

#### `users`

| Trường | Kiểu | Ý nghĩa |
| :---- | :---- | :---- |
| `id` | UUID | Định danh |
| `email` | VARCHAR(255) | Đăng nhập |
| `full_name` | VARCHAR(255) | Họ tên |
| `role` | VARCHAR(20) | **`sales` / `ke_toan` / `admin`** |
| `is_active` | BOOLEAN | Vô hiệu hoá thay vì xoá |
| `google_sub` | VARCHAR(255) | Định danh đăng nhập Google |
| `created_by` | UUID | Ai tạo tài khoản này |
| `last_login` | TIMESTAMPTZ | Lần đăng nhập gần nhất |

**Trường `role` là trục phân quyền của toàn hệ thống.** Nó quyết định người dùng thấy công cụ nào, truy cập bộ sưu tập vectơ nào, mở được màn hình nào.

**Vì sao có `is_active` thay vì xoá.** Xoá tài khoản là mất dấu vết trong nhật ký — không biết thao tác cũ do ai làm. Vô hiệu hoá giữ được lịch sử.

**Vì sao có `created_by`.** Truy vết ai cấp quyền cho ai. Quan trọng khi rà soát an ninh.

### 2.4 Nhóm tài liệu và tri thức

#### `documents`

| Trường | Kiểu | Ý nghĩa |
| :---- | :---- | :---- |
| `id` | UUID | Định danh |
| `user_id` | UUID | Người tải lên |
| `module` | VARCHAR(20) | **`sales` hoặc `kt`** — quyết định vào kho vectơ nào |
| `filename` | VARCHAR(500) | Tên tệp |
| `drive_file_id`, `drive_url` | | Nguồn trên kho tài liệu |
| `file_size_bytes` | BIGINT | Kích thước |
| `status` | VARCHAR(30) | Trạng thái xử lý |
| `error_msg` | TEXT | Lý do lỗi |
| `chunk_count` | INTEGER | **Số đoạn đã cắt** |

**Trường `module` là điểm phân tách dữ liệu ở tầng nạp.** Tài liệu thuộc miền kinh doanh vào bộ sưu tập `sales_kb`, tài liệu kế toán vào `kt_docs`. Phân tách từ khâu nạp, không phải từ khâu truy vấn.

**Trường `chunk_count` để kiểm chứng.** Tài liệu 50 trang mà chỉ có 2 đoạn là dấu hiệu bóc tách hỏng — phần lớn nội dung đã mất.

| Bảng khác | Vai trò |
| :---- | :---- |
| `notebooks`, `user_notebooks` | Nhóm tài liệu theo chủ đề, phân quyền theo người dùng |
| `sync_state` | Trạng thái đồng bộ từng nguồn, có mã băm nội dung |
| `embedding_cache` | Đệm vectơ đã sinh, tránh sinh lại |
| `faq_cache` | Câu hỏi thường gặp |

#### `sync_state` — chỉ nạp lại khi nội dung thật sự đổi

| Trường | Ý nghĩa |
| :---- | :---- |
| `source` | Nguồn đồng bộ |
| `last_sync_at` | Lần đồng bộ gần nhất |
| `last_modified_time` | Thời điểm nguồn sửa lần cuối |
| `content_hash` | **Mã băm nội dung** |
| `records_synced` | Số bản ghi đã đồng bộ |
| `status`, `error_message` | Kết quả |

**Vì sao có mã băm nội dung.** Kho tài liệu báo tệp "đã sửa" cả khi chỉ đổi tên hoặc đổi quyền. Nạp lại một tệp lớn tốn tiền gọi mô hình sinh vectơ. So mã băm thì biết nội dung **thật sự** có đổi không.

#### `embedding_cache`

| Trường | Ý nghĩa |
| :---- | :---- |
| `input_text` | Đoạn văn bản |
| `input_hash` | Mã băm, tra nhanh |

Cùng một đoạn văn bản xuất hiện ở nhiều tài liệu thì chỉ sinh vectơ một lần. Tiết kiệm trực tiếp chi phí.

### 2.5 Nhóm nghiệp vụ

| Bảng | Miền | Vai trò |
| :---- | :---- | :---- |
| `orders` | Kinh doanh | Đơn hàng, có trạng thái phê duyệt |
| `invoices` | Kế toán | Hoá đơn |
| `kt_conversations`, `kt_messages` | Kế toán | Hội thoại kế toán |
| `kt_config_files`, `report_templates` | Kế toán | Cấu hình và mẫu báo cáo |
| `suppliers_cache` | Kinh doanh | Đệm dữ liệu nhà cung cấp |

#### `orders` — luồng phê duyệt

| Trường | Ý nghĩa |
| :---- | :---- |
| `order_details` | JSONB — chi tiết đơn |
| `email_draft` | **Bản nháp thư gửi nhà cung cấp** |
| `approval_status` | Trạng thái phê duyệt |
| `approved_by`, `approved_at` | Ai duyệt, lúc nào |
| `supplier_response` | Phản hồi nhà cung cấp |

**Trường `email_draft` thể hiện đúng nguyên tắc "máy soạn, người duyệt".** Hệ thống soạn sẵn thư nhưng **không gửi**; người xem, sửa, phê duyệt rồi mới gửi. Giống nguyên tắc của DA2.

### 2.6 Nhóm hệ thống

| Bảng | Vai trò |
| :---- | :---- |
| `system_config` | Cấu hình động |
| `system_metrics` | Số đo hệ thống |
| `schema_migrations` | **Lịch sử thay đổi cấu trúc dữ liệu** |

`schema_migrations` là bằng chứng của công đoạn bảo trì: mỗi dòng là một lần nâng cấp cấu trúc, có mốc thời gian.

---

## 3. Kho vectơ — hai bộ sưu tập

| Bộ sưu tập | Nội dung | Vai trò truy cập |
| :---- | :---- | :---- |
| `sales_kb` | Sản phẩm, lịch sử trao đổi với khách | `sales`, `admin` |
| `kt_docs` | Hoá đơn, chứng từ | `ke_toan`, `admin` |

### 3.1 Vì sao tách hai bộ sưu tập

Đây là lớp bảo vệ **thứ hai** cho yêu cầu tách dữ liệu (NV-06).

| Lớp | Cơ chế | Nếu lớp này hỏng |
| :---- | :---- | :---- |
| 1 | Lọc công cụ theo vai trò | Mô hình không có công cụ để gọi |
| 2 | **Tách bộ sưu tập** | Kể cả gọi được công cụ sai, **dữ liệu vẫn nằm ở kho khác** |

Phòng thủ nhiều lớp: một lỗi lập trình ở tầng truy vấn không đủ để làm lộ dữ liệu tài chính.

### 3.2 Cấu trúc một điểm dữ liệu

| Thành phần | Nội dung |
| :---- | :---- |
| Vectơ | Biểu diễn ngữ nghĩa của đoạn văn bản |
| Nội dung đoạn | Văn bản gốc, để đưa vào câu trả lời |
| Nguồn | Mã tài liệu, tên tệp, vị trí đoạn |
| Siêu dữ liệu | Miền nghiệp vụ, thời điểm nạp |

**Lưu cả nội dung gốc bên cạnh vectơ**, không chỉ lưu vectơ, để câu trả lời **dẫn được nguồn**: đoạn này lấy từ tài liệu nào.

### 3.3 Xử lý số chiều vectơ

```python
def _fit_vector_size(vec: list[float], size: int) -> list[float]:
    ...
    logger.debug("Truncate embedding %s → %s dims (Matryoshka)", n, size)
    raise ValueError(f"Embedding dim {n} < Qdrant size {size}")
```

| Tình huống | Xử lý | Vì sao |
| :---- | :---- | :---- |
| Vectơ **dài hơn** số chiều kho | Cắt bớt | Mô hình sinh vectơ hiện đại dồn thông tin quan trọng về các chiều đầu |
| Vectơ **ngắn hơn** | **Báo lỗi** | Đệm số 0 sẽ làm sai lệch kết quả tìm kiếm **mà không ai biết** |

Dòng thứ hai là quyết định quan trọng: **thà hỏng to còn hơn hỏng thầm lặng.** Đệm số 0 thì hệ thống vẫn chạy, vẫn trả về kết quả, chỉ là kết quả sai — loại lỗi khó phát hiện nhất.

---

## 4. Bộ nhớ đệm

| Dùng cho | Cơ chế | Hạn dùng |
| :---- | :---- | :---- |
| Chống xử lý trùng sự kiện | Lưu mã sự kiện đã xử lý | Ngắn |
| Đệm câu trả lời | Lưu theo mã băm câu hỏi | Trung bình |
| Đệm phiên | Ngữ cảnh đang hoạt động | Theo hạn phiên |

**Vì sao dùng bộ nhớ đệm chứ không dùng cơ sở dữ liệu quan hệ:**

| Tiêu chí | Bộ nhớ đệm | Cơ sở dữ liệu quan hệ |
| :---- | :---- | :---- |
| Tốc độ tra | Rất nhanh | Chậm hơn |
| Tự hết hạn | **Có sẵn** | Phải tự dọn |
| Mất dữ liệu khi khởi động lại | Chấp nhận được | Không chấp nhận được |

Dòng cuối là điều kiện: dữ liệu trong bộ nhớ đệm **được phép mất**. Mất mã sự kiện đã xử lý thì tệ nhất là xử lý lại một tin. Mất hoá đơn thì không chấp nhận được — nên hoá đơn nằm ở cơ sở dữ liệu quan hệ.

---

## 5. Phân quyền dữ liệu

### 5.1 Ba vai trò

| Vai trò | Bảng truy cập | Bộ sưu tập vectơ | Công cụ |
| :---- | :---- | :---- | :---- |
| `sales` | Sản phẩm, khách hàng, đơn hàng, phiên | `sales_kb` | 9 |
| `ke_toan` | Hoá đơn, chứng từ, báo cáo | `kt_docs` | 5 |
| `admin` | Tất cả | Cả hai | 14 |

### 5.2 Phân quyền ở ba tầng

| Tầng | Cơ chế |
| :---- | :---- |
| Giao diện lập trình | Kiểm vai trò ở mỗi điểm truy cập |
| **Công cụ** | Danh sách trắng theo vai trò, kiểm hai lần |
| **Dữ liệu** | Hai bộ sưu tập vectơ tách biệt; truy vấn có điều kiện theo miền |

Ba tầng độc lập. Lỗi ở một tầng không đủ làm lộ dữ liệu.

---

## 6. Dữ liệu cá nhân

| Dữ liệu | Bảng | Vì sao thu thập | Ai xem được |
| :---- | :---- | :---- | :---- |
| Tên, điện thoại khách | `customers` | Liên hệ kinh doanh | Vai trò `sales`, `admin` |
| Mã người dùng trên các kênh | `customers` | Nhận ra cùng một người | `sales`, `admin` |
| Nội dung hội thoại | `ai_interaction_logs`, `kt_messages` | Truy vết, cải thiện chất lượng | Theo vai trò |
| Thư điện tử nhân viên | `users` | Đăng nhập | `admin` |

**Có bảng chuyên trách xoá dữ liệu theo yêu cầu** (`admin_data_purge.py`, 479 dòng) — phục vụ quyền yêu cầu xoá dữ liệu cá nhân.

---

## 7. Quản lý thay đổi cấu trúc

| Cơ chế | Nội dung |
| :---- | :---- |
| Tệp khởi tạo | `postgres/init/01_create_tables.sql`, `02_bioscope.sql` |
| Công cụ chuyển đổi | Alembic 1.14.0 |
| Bảng theo dõi | `schema_migrations` |
| Dịch vụ hỗ trợ | `db_migrations.py` |

Nguyên tắc chung ở `00-5` mục 5 vẫn áp dụng: **sao lưu trước, chạy thử trên bản sao, chạy hai lần để kiểm khả năng chạy trùng, rồi mới áp lên hệ thống thật.**
