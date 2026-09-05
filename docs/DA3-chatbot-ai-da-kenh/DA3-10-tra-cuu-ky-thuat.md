<!--HOSO
phu_de: Chatbot AI đa kênh BioBot — Bioscope Assistants
pham_vi: Dự án DA3 — quản trị hệ thống và lập trình viên
ngay_lap: 12/06/2026
phien_ban: 1.0
nguoi_lap: Quân — Team phát triển, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 12/06/2026 | Ban hành lần đầu — tra cứu công cụ, quy trình, 14 sự cố
-->
# DA3 — SỔ TRA CỨU KỸ THUẬT
## Chatbot AI đa kênh BioBot — Bioscope Assistants

*Tài liệu tra cứu, không đọc tuần tự.*

> **Tài liệu bổ sung trong kho mã nguồn dự án:** `docs/HUONG_DAN_WORKFLOWS.md` (4.468 dòng) mô tả chi tiết 44 quy trình; `docs/env-checklist.md` liệt kê biến môi trường; `docs/SRS_MVP.md` mục 9 liệt kê điểm truy cập.

---

# PHẦN A — 14 CÔNG CỤ TRỢ LÝ

## A1. Bảng tra công cụ

### Miền Kế toán — vai trò `ke_toan`, `admin`

| Công cụ | Chức năng |
| :---- | :---- |
| `list_invoices` | Liệt kê hoá đơn theo điều kiện |
| `get_invoice_detail` | Chi tiết một hoá đơn |
| `aggregate_invoices` | Tổng hợp hoá đơn: tổng tiền, đếm, nhóm theo kỳ |
| `get_report_status` | Trạng thái báo cáo |
| `get_document_stats` | Thống kê tài liệu đã nạp |

### Miền Kinh doanh — vai trò `sales`, `admin`

| Công cụ | Chức năng |
| :---- | :---- |
| `list_products` | Liệt kê sản phẩm theo điều kiện |
| `get_product_detail` | Chi tiết một sản phẩm |
| `search_products_semantic` | **Tìm sản phẩm theo ngữ nghĩa** |
| `compare_products` | So sánh nhiều sản phẩm |
| `analyze_products` | Phân tích danh mục sản phẩm |
| `list_customers` | Liệt kê khách hàng |
| `list_customer_docs` | Tài liệu của một khách |
| `get_customer_chat_raw` | Lịch sử trao đổi với khách |
| `analyze_customer_data` | Phân tích dữ liệu khách hàng |

## A2. Bảng phân quyền

```python
_KT_TOOLS = frozenset({
    "list_invoices", "get_invoice_detail", "aggregate_invoices",
    "get_report_status", "get_document_stats",
})
_SALES_TOOLS = frozenset({
    "list_products", "get_product_detail", "search_products_semantic",
    "compare_products", "analyze_products",
    "list_customers", "list_customer_docs", "get_customer_chat_raw", "analyze_customer_data",
})
_ADMIN_TOOLS = _KT_TOOLS | _SALES_TOOLS

ROLE_TOOL_WHITELIST: dict[str, frozenset[str]] = {
    "ke_toan": _KT_TOOLS,
    "sales":   _SALES_TOOLS,
    "admin":   _ADMIN_TOOLS,
}
```

> ### ⚠ Thêm công cụ mới: BA việc, không phải một
>
> 1. Viết hàm công cụ
> 2. **Khai vào đúng nhóm** `_KT_TOOLS` hoặc `_SALES_TOOLS`
> 3. **Chạy lại bộ ca kiểm thử phân quyền** ở `DA3-07` mục 3.2
>
> Bỏ bước 2 thì công cụ không ai gọi được. Bỏ bước 3 thì **có thể đã tạo đường lộ dữ liệu chéo vai trò mà không ai biết** — hệ thống vẫn chạy bình thường.

## A3. Hai lớp kiểm quyền

| Lớp | Hàm | Khi nào chạy |
| :---- | :---- | :---- |
| 1 | `get_tools_for_role(role)` | **Trước khi gửi danh sách công cụ cho mô hình** |
| 2 | `is_tool_allowed(tool_name, role)` | Trước khi chạy một công cụ |

Lớp 1 là lớp chính: mô hình **không biết** công cụ ngoài quyền tồn tại. Lớp 2 phòng trường hợp công cụ được gọi qua đường khác.

## A4. Giới hạn dữ liệu đưa vào ngữ cảnh

```python
if self.rows:
    payload["data"] = self.rows[:80]  # giới hạn context
```

Mỗi công cụ trả tối đa **80 dòng** vào ngữ cảnh. Lý do: ngữ cảnh có hạn, và nhồi 500 dòng vào thì mô hình bỏ sót phần lớn — câu trả lời tệ hơn chứ không tốt hơn.

---

# PHẦN B — 44 QUY TRÌNH TỰ ĐỘNG HOÁ

## B1. Bảng tra theo dải số

### WF00–WF09 · Kênh, phiên, an toàn, vận hành cơ bản

| Mã | Tên | Chức năng |
| :---- | :---- | :---- |
| WF00 | `zalo-oauth-callback` | Xác thực kênh Zalo |
| WF01 | `zalo-handler` | Nhận và xử lý tin Zalo |
| WF02 | `ai-router` | Định tuyến yêu cầu AI |
| WF03 | `session-manager` | Quản lý phiên hội thoại |
| WF04 | `error-handler` | **Xử lý lỗi tập trung** |
| WF05 | `universal-channel-processor` | **Bộ xử lý chung sáu kênh** |
| WF06 | `security-guard` | Chốt chặn an ninh |
| WF07 | `human-handoff` | **Chuyển cho người thật** |
| WF08 | `ai-logger` | Ghi nhật ký lượt gọi mô hình |
| WF09 | `smart-cache` | Đệm câu hỏi lặp |

### WF10–WF14 · Dây chuyền tri thức

| Mã | Tên | Chức năng |
| :---- | :---- | :---- |
| WF10a | `drive-scanner` | Quét kho tài liệu |
| WF10b | `content-extractor` | Bóc tách nội dung |
| WF10c | `qdrant-updater` | Nạp vào kho vectơ |
| WF10d | `sync-orchestrator` | **Điều phối toàn chuỗi** |
| WF10e | `rag-chat-tester` | **Kiểm chất lượng truy hồi** |
| WF10f | `test-harness` | **Khung chạy kiểm thử** |
| WF11 | `faq-sync` | Đồng bộ câu hỏi thường gặp |
| WF11g | `faq-qdrant-verify` | **Kiểm chứng dữ liệu đã nạp** |
| WF12 | `backup-automation` | Sao lưu tự động |
| WF13 | `qdrant-export-to-docs` | Xuất kho vectơ ra tài liệu |
| WF14 | `qdrant-export-file-to-docs` | Xuất theo tệp |

### WF20–WF23 · Xử lý hội thoại

| Mã | Tên | Chức năng |
| :---- | :---- | :---- |
| WF20 | `intent-classifier` | Phân loại ý định |
| WF21 | `rag-search` | Truy hồi tri thức |
| WF22 | `vision-ocr` | Đọc chữ trong ảnh |
| WF23 | `response-generator` | Soạn câu trả lời |

### WF30–WF41 · Nghiệp vụ

| Mã | Tên | Chức năng |
| :---- | :---- | :---- |
| WF30 | `customer-segmentation` | Phân khúc khách hàng |
| WF31 | `order-workflow` | Luồng đơn hàng |
| WF32 | `email-proxy` | Gửi thư |
| WF32b | `inbound-email-handler` | Nhận thư |
| WF33 | `veridion-search` | Tra cứu nhà cung cấp |
| WF40 | `lark-notification` | Thông báo nội bộ |
| WF41 | `approval-form` | Biểu mẫu phê duyệt |

### WF50–WF54 · Vận hành

| Mã | Tên | Chức năng |
| :---- | :---- | :---- |
| WF50 | `health-check` | Kiểm tra sức khoẻ |
| WF51 | `token-refresher` | **Làm mới khoá truy cập** |
| WF52 | `error-alerting` | Cảnh báo lỗi |
| WF53 | `dead-letter-queue` | **Hàng đợi việc chết** |
| WF54 | `event-dedup` | **Chống xử lý trùng sự kiện** |

### WF60–WF99 · Kênh và cổng

| Mã | Tên | Chức năng |
| :---- | :---- | :---- |
| WF60 | `telegram-handler` | Kênh Telegram |
| WF61 | `messenger-handler` | Kênh Messenger |
| WF62 | `whatsapp-handler` | Kênh WhatsApp |
| WF99 | `chat-portal` | Cổng chat web |
| WF99a | `chat-tester` | **Kiểm luồng hội thoại** |

## B2. Quy tắc sửa quy trình

| Quy tắc | Vì sao |
| :---- | :---- |
| Sửa xong **xuất ra tệp** và ghi nhận vào kho mã nguồn | Có lịch sử, khôi phục được |
| **Không gõ khoá thẳng vào ô** của quy trình | Khoá sẽ bị ghi vào tệp JSON nằm trong kho mã nguồn |
| **Không chuyển logic an toàn vào quy trình** | Quy trình sửa được trên giao diện; thứ sửa được có ngày bị sửa nhầm |
| Sửa bộ xử lý chung thì kiểm cả sáu kênh | Một bộ xử lý phục vụ sáu kênh |

---

# PHẦN C — ĐIỂM TRUY CẬP LẬP TRÌNH

| Tiền tố | Nhóm | Quyền |
| :---- | :---- | :---- |
| `/api/v1/auth` | Đăng nhập, phiên | Công khai |
| `/api/v1/` | Phiên hội thoại | Đã đăng nhập |
| `/api/v1/sales` | Nghiệp vụ kinh doanh | `sales`, `admin` |
| `/api/v1/kt` | Nghiệp vụ kế toán | `ke_toan`, `admin` |
| `/api/v1/kt/ref` | Danh mục tham chiếu kế toán | `ke_toan`, `admin` |
| `/api/v1/jobs` | Công việc nền | Đã đăng nhập |
| `/api/v1/files` | Tệp | Đã đăng nhập |
| `/api/v1/admin` | Quản trị | **Chỉ `admin`** |
| `/api/v1/admin/kt-ref` | Quản trị danh mục kế toán | **Chỉ `admin`** |

**Kiểm quyền ở tầng điểm truy cập là lớp thứ ba**, độc lập với lọc công cụ và tách bộ sưu tập vectơ.

---

# PHẦN D — HẰNG SỐ VÀ CẤU HÌNH

## D1. Hằng số quan trọng

| Hằng số | Giá trị | Ở đâu | Lý do |
| :---- | :---- | :---- | :---- |
| `MAX_TOOL_CALLS` | **5** | `agent_loop.py` | Chặn vòng lặp không dừng và chi phí không kiểm soát |
| `MAX_RESPONSE_TOKENS` | **2500** | `agent_loop.py` | *"tăng lên 2500 để đủ trình bày bảng thông tin sản phẩm dược"* |
| Ngữ cảnh hội thoại | **15 lượt** | `agent_loop.py` | *"giảm từ 40 xuống 15 turns, giữ nội dung tốt hơn"* |
| Dữ liệu mỗi công cụ | **80 dòng** | `agent_tools.py` | Giới hạn ngữ cảnh |

> **Đừng đổi bốn giá trị này mà không đọc lý do.** Cả bốn đều là kết quả của quan sát thực tế, không phải giá trị mặc định.

## D2. Biến môi trường chính

| Biến | Bắt buộc | Ý nghĩa |
| :---- | :----: | :---- |
| `N8N_ENCRYPTION_KEY` | ✅ | **Khoá mã hoá chứng thực của nền tảng điều phối** |
| `N8N_BASIC_AUTH_USER` / `_PASSWORD` | ✅ | Xác thực giao diện điều phối |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | ✅ | Đường dẫn tệp chứng thực Google |
| `CHAT_USE_AGENT` | | `true` (mặc định) — chế độ trợ lý có công cụ; `false` — chế độ cũ |
| `EMBEDDING_MODEL` | ✅ | Mô hình sinh vectơ |
| `BIOBOT_*_HOST_PORT` | | Cổng từng dịch vụ |
| `BIOSCOPE_API_PORT`, `BIOSCOPE_FRONTEND_PORT` | | Cổng máy chủ và giao diện |

Danh mục đầy đủ ở `docs/env-checklist.md` trong kho mã nguồn.

> **`N8N_ENCRYPTION_KEY` là biến nguy hiểm nhất.** Nó bảo vệ mọi chứng thực lưu trong nền tảng điều phối. Không đặt thì dùng khoá mặc định — ai có tệp dữ liệu cũng giải mã được. **Đổi khoá này sau khi đã lưu chứng thực thì mọi chứng thực trở nên không đọc được.**

## D3. Chế độ chạy

| `CHAT_USE_AGENT` | Luồng |
| :---- | :---- |
| `true` *(mặc định)* | Trợ lý có công cụ |
| `false` | Luồng cũ: phân loại ý định → kiểm quyền → dựng truy vấn → lấy dữ liệu → soạn trả lời |

Giữ luồng cũ làm đường lùi khi luồng trợ lý gặp vấn đề.

---

# PHẦN E — SỔ SỰ CỐ

---

## SC-01 · Một kênh ngừng nhận tin, không báo lỗi

| | |
| :---- | :---- |
| **Dấu hiệu** | Kênh vẫn hiện bình thường nhưng không nhận tin mới. Không có lỗi nào |
| **Nguyên nhân** | Khoá truy cập nền tảng hết hạn |
| **Xử lý** | Kiểm quy trình làm mới khoá; xem bảng khoá |
| **Phòng** | `WF51_token-refresher` chạy trước khi khoá hết hạn |

---

## SC-02 · Khoá truy cập hỏng hoàn toàn sau khi làm mới

| | |
| :---- | :---- |
| **Dấu hiệu** | Kênh chết, làm mới lại cũng không được, phải cấu hình tay từ đầu |
| **Nguyên nhân** | **Hai tiến trình cùng làm mới một lúc.** Mã làm mới dùng một lần: cái thứ nhất dùng xong, cái thứ hai dùng mã đã hết hiệu lực và **làm hỏng cả khoá** |
| **Xử lý** | Cấu hình lại khoá bằng tay |
| **Phòng** | **Cơ chế khoá trên bảng khoá** — ba cột `is_locked`, `locked_by`, `locked_at`. Dựng từ mốc 1 |

---

## SC-03 · Khách nhận hai câu trả lời giống nhau

| | |
| :---- | :---- |
| **Dấu hiệu** | Cùng một câu hỏi được trả lời hai lần |
| **Nguyên nhân** | Nền tảng nhắn tin gửi lặp sự kiện khi không nhận được xác nhận kịp |
| **Xử lý** | `WF54_event-dedup` lưu mã sự kiện đã xử lý vào bộ nhớ đệm |
| **Phòng** | Mọi kênh phải đi qua quy trình chống trùng. **Không có nó thì công ty trả tiền hai lần cho một câu hỏi** |

---

## SC-04 · Một việc lỗi chặn cả hàng đợi

| | |
| :---- | :---- |
| **Dấu hiệu** | Hệ thống ngừng xử lý tin mới, không rõ nguyên nhân |
| **Nguyên nhân** | Một việc lỗi được thử lại vô hạn, chiếm chỗ trong hàng đợi |
| **Xử lý** | `WF53_dead-letter-queue` — thất bại quá số lần thì chuyển sang hàng đợi riêng |
| **Phòng** | **Xem hàng đợi việc chết hàng tuần.** Việc nằm đó là việc chưa ai xử lý |

---

## SC-05 · Mô hình chọn nhầm công cụ cho câu hỏi rõ ràng

| | |
| :---- | :---- |
| **Dấu hiệu** | Hỏi *"liệt kê sản phẩm danh mục X"*, mô hình gọi tìm kiếm ngữ nghĩa thay vì liệt kê |
| **Nguyên nhân** | Để mô hình tự chọn công cụ trong mọi trường hợp |
| **Xử lý** | **Định tuyến nhanh** — nhận mẫu câu bằng biểu thức chính quy, gọi thẳng công cụ đúng |
| **Phòng** | Câu hỏi có mẫu rõ ràng thì đừng để mô hình chọn. Vừa đúng hơn vừa rẻ hơn |

---

## SC-06 · Câu trả lời ngắn mất ngữ cảnh

| | |
| :---- | :---- |
| **Dấu hiệu** | Trợ lý hỏi *"xem chi tiết không?"*, khách trả lời *"đúng rồi"*, trợ lý không hiểu |
| **Nguyên nhân** | Mô hình nhận câu *"đúng rồi"* trơ trọi |
| **Xử lý** | Nhận diện câu xác nhận, ghép với ngữ cảnh lượt trước |
| **Phòng** | Nhận cả biến thể không dấu: *dung roi, vang, co, ok, tiep di* |

---

## SC-07 · Bảng thông số sản phẩm bị cắt giữa chừng

| | |
| :---- | :---- |
| **Dấu hiệu** | Câu trả lời dừng đột ngột giữa bảng |
| **Nguyên nhân** | Giới hạn độ dài câu trả lời quá thấp |
| **Xử lý** | Tăng lên 2500, **ghi lý do ngay trong mã** |
| **Phòng** | Đổi giá trị này phải kiểm với câu hỏi cho câu trả lời dài nhất |

---

## SC-08 · Ngữ cảnh dài nhưng nội dung bị cắt vụn

| | |
| :---- | :---- |
| **Dấu hiệu** | Giữ 40 lượt hội thoại nhưng trợ lý vẫn quên thông tin vừa nói |
| **Nguyên nhân** | 40 lượt vượt giới hạn ngữ cảnh nên mỗi lượt bị cắt ngắn. **Câu trả lời của trợ lý thường chứa danh sách dữ liệu — cắt ngắn là mất chính phần quan trọng** |
| **Xử lý** | Giảm còn 15 lượt, giữ nguyên nội dung |
| **Phòng** | Ít lượt nguyên vẹn tốt hơn nhiều lượt bị cắt |

---

## SC-09 · Kết quả tìm kiếm sai mà không rõ nguyên nhân

| | |
| :---- | :---- |
| **Dấu hiệu** | Truy hồi tri thức trả về kết quả không liên quan, hệ thống **không báo lỗi** |
| **Nguyên nhân** | Vectơ có ít chiều hơn kho vectơ, bị đệm số 0 |
| **Xử lý** | **Báo lỗi thay vì đệm** |
| **Phòng** | **Thà hỏng to còn hơn hỏng thầm lặng.** Đệm số 0 thì hệ thống vẫn chạy, vẫn trả kết quả, chỉ là sai — loại lỗi khó phát hiện nhất |

---

## SC-10 · Nạp lại tài liệu không cần thiết

| | |
| :---- | :---- |
| **Dấu hiệu** | Chi phí sinh vectơ cao bất thường; đồng bộ chạy rất lâu |
| **Nguyên nhân** | Kho tài liệu báo tệp "đã sửa" cả khi chỉ đổi tên hoặc đổi quyền |
| **Xử lý** | So **mã băm nội dung** trong bảng trạng thái đồng bộ |
| **Phòng** | Thời điểm sửa của kho tài liệu không đáng tin; mã băm nội dung mới đáng tin |

---

## SC-11 · Trợ lý trả lời thiếu thông tin có trong tài liệu

| | |
| :---- | :---- |
| **Dấu hiệu** | Tài liệu có thông tin, trợ lý nói không có |
| **Nguyên nhân** | Bóc tách hỏng — tài liệu 50 trang chỉ cắt được 2 đoạn |
| **Xử lý** | Kiểm cột **số đoạn đã cắt**; nạp lại tài liệu |
| **Phòng** | Đưa số đoạn lên giao diện. **Đây là loại lỗi thầm lặng, không nhìn thấy thì không biết** |

---

## SC-12 · Chốt chặn dược chặn nhầm câu hợp lệ

| | |
| :---- | :---- |
| **Dấu hiệu** | Câu hỏi kỹ thuật bình thường bị chặn |
| **Nguyên nhân** | Câu chứa từ khoá trong danh sách chặn |
| **Xử lý** | Ghi nhận câu bị chặn nhầm, tinh chỉnh danh sách |
| **Phòng** | **Chấp nhận chặn thừa.** Chặn nhầm gây phiền; lọt gây rủi ro pháp lý và sức khoẻ. Sai theo hướng an toàn |

---

## SC-13 · Chi phí gọi mô hình tăng đột biến

| | |
| :---- | :---- |
| **Dấu hiệu** | Hoá đơn tăng bất thường |
| **Nguyên nhân** | Bộ nhớ đệm không hoạt động, hoặc có phiên gọi công cụ nhiều lượt |
| **Xử lý** | Xem nhật ký AI, tìm phiên có nhiều lượt gọi; kiểm bộ nhớ đệm còn sống |
| **Phòng** | Đối chiếu chi phí hàng tháng; giới hạn 5 lượt gọi công cụ |

---

## SC-14 · Dịch vụ lộ ra Internet

| | |
| :---- | :---- |
| **Dấu hiệu** | Quét cổng từ máy ngoài thấy cổng kho vectơ hoặc cơ sở dữ liệu mở |
| **Nguyên nhân** | Khai cổng thiếu tiền tố `127.0.0.1:` — **phần lớn hướng dẫn cài đặt trên mạng viết như vậy** |
| **Xử lý** | Thêm tiền tố, khởi động lại; **đổi toàn bộ mật khẩu và chứng thực** |
| **Phòng** | Kiểm mục 5 trong danh sách rà soát trước đóng gói; quét cổng **từ máy bên ngoài** sau mỗi lần triển khai |

**Đây là sự cố nghiêm trọng nhất có thể xảy ra với DA3** — một dòng cấu hình sai dẫn tới lộ toàn bộ tri thức công ty, dữ liệu khách hàng và chứng thực các kênh.

---

# PHẦN F — LỆNH THƯỜNG DÙNG

## F1. Kiểm tra hệ thống

```bash
docker compose ps
docker compose logs --tail=100 bioscope_api
docker compose logs --tail=100 n8n

# Kiểm sáu dịch vụ trả lời
curl -s http://127.0.0.1:18000/health
curl -s http://127.0.0.1:16333/healthz
docker exec biobot_postgres pg_isready -U biobot_admin
docker exec biobot_redis redis-cli ping
```

## F2. Kiểm bảo mật — chạy sau mỗi lần triển khai

```bash
# TỪ MÁY BÊN NGOÀI, không chạy trên chính máy chủ
nmap -p 15678,16333,16334,15432,16379,18000,18080 <địa chỉ máy chủ>
# Mong đợi: TẤT CẢ filtered hoặc closed

# Khoá trong mã nguồn
grep -rnE "(sk-|AIza|Bearer )[A-Za-z0-9_-]{20,}" bioscope/ --include=*.py --include=*.js

# Khoá trong tệp định nghĩa quy trình
grep -lE "(sk-|AIza)[A-Za-z0-9_-]{20,}" n8n-workflows/*.json

# Tệp bí mật bị loại khỏi kho mã nguồn
git check-ignore -v .env local_files/*.json
```

## F3. Cơ sở dữ liệu

```bash
# Lượt hỏi đáp theo ngày
docker exec biobot_postgres psql -U biobot_admin -d biobot_db -c "
SELECT date(created_at) AS ngay, count(*) AS luot,
       sum(tokens_used) AS don_vi, round(avg(latency_ms)) AS tb_ms
FROM ai_interaction_logs GROUP BY 1 ORDER BY 1 DESC LIMIT 30;"

# Phân bố ý định
docker exec biobot_postgres psql -U biobot_admin -d biobot_db -c "
SELECT intent, count(*) FROM intent_logs GROUP BY 1 ORDER BY 2 DESC;"

# Tài liệu nghi bóc tách hỏng
docker exec biobot_postgres psql -U biobot_admin -d biobot_db -c "
SELECT filename, file_size_bytes, chunk_count
FROM documents WHERE chunk_count < 3 AND file_size_bytes > 100000;"

# Khoá sắp hết hạn
docker exec biobot_postgres psql -U biobot_admin -d biobot_db -c "
SELECT token_type, expires_at, is_locked FROM zalo_tokens;"

# Lỗi gần đây
docker exec biobot_postgres psql -U biobot_admin -d biobot_db -c "
SELECT workflow_id, error_type, left(error_message,80), created_at
FROM error_logs ORDER BY created_at DESC LIMIT 20;"
```

## F4. Kho vectơ

```bash
# Danh sách bộ sưu tập
curl -s http://127.0.0.1:16333/collections | python3 -m json.tool

# Số điểm dữ liệu mỗi bộ sưu tập
curl -s http://127.0.0.1:16333/collections/sales_kb | python3 -m json.tool
curl -s http://127.0.0.1:16333/collections/kt_docs | python3 -m json.tool
```

## F5. Sao lưu

```bash
# Cả BA kho — không chỉ cơ sở dữ liệu
docker exec biobot_postgres pg_dump -U biobot_admin biobot_db > db-$(date +%F).sql
docker run --rm -v biobot_qdrant_data:/q -v ~/:/b alpine tar czf /b/qdrant-$(date +%F).tar.gz -C /q .
docker run --rm -v biobot_n8n_data:/n -v ~/:/b alpine tar czf /b/n8n-$(date +%F).tar.gz -C /n .
```

---

# PHẦN G — VIỆC CÒN LẠI

| # | Việc | Mức | Ghi chú |
| :---- | :---- | :---- | :---- |
| 1 | **Kiểm thử tự động cho phân quyền công cụ** | **Cao** | Cơ chế không được phép hỏng; hiện kiểm thủ công |
| 2 | **Chuẩn hoá mô tả thay đổi trong kho mã nguồn** | **Cao** | Hiện phần lớn là `up`, `update` |
| 3 | Đo tỉ lệ chặn nhầm của chốt chặn dược | **Cao** | Cần số liệu để tinh chỉnh danh sách từ khoá |
| 4 | Đối chiếu chi phí gọi mô hình với hoá đơn | Trung bình | Nhật ký đã có đủ số liệu |
| 5 | Đo độ chính xác bộ phân loại ý định | Trung bình | Bảng nhật ký ý định đã có dữ liệu |
| 6 | Diễn tập khôi phục ba kho dữ liệu | Trung bình | Sao lưu đã chạy, chưa khôi phục thử |
| 7 | Cảnh báo tự động khi chi phí vượt ngưỡng | Trung bình | Hiện phải tự theo dõi |
| 8 | Tách dịch vụ máy chủ ra nhiều bản | Thấp | Chưa cần |
