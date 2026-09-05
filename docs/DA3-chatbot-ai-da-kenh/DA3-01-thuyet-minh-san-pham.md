<!--HOSO
phu_de: Chatbot AI đa kênh BioBot — Bioscope Assistants
pham_vi: Dự án DA3
ngay_lap: 12/01/2026
phien_ban: 1.2
nguoi_lap: HungDV — Product Owner, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 12/01/2026 | Ban hành lần đầu
lich_su: 1.1 | 20/04/2026 | Bổ sung phạm vi mô-đun kế toán
lich_su: 1.2 | 12/06/2026 | Cập nhật quy mô và trạng thái thực tế khi đưa vào vận hành
-->
# DA3 — THUYẾT MINH SẢN PHẨM
## Chatbot AI đa kênh BioBot — Bioscope Assistants

---

## 0. Hai bên trong dự án

| | **Bên thực hiện** | **Bên thụ hưởng** |
| :---- | :---- | :---- |
| Công ty | **OPTIMAI** | **Bioscope** |
| Vai trò | Phân tích, thiết kế, lập trình, kiểm thử, đóng gói, triển khai, bàn giao, bảo hành | Đặt hàng, cung cấp yêu cầu nghiệp vụ, nghiệm thu, tiếp nhận, vận hành |

| Tài liệu nền | Nội dung |
| :---- | :---- |
| `00-ho-so-chung/00-1-thuyet-minh-nang-luc-va-doi-ngu.md` | Đội thực hiện và **ma trận phân công theo bảy công đoạn** |
| `00-ho-so-chung/00-7-hop-dong-ban-giao-va-quyen-so-huu.md` | Hợp đồng, nghiệm thu, bàn giao, **quyền sở hữu trí tuệ** |
| `00-ho-so-chung/00-2-quy-trinh-san-xuat-phan-mem-noi-bo.md` | Quy trình bảy công đoạn OPTIMAI áp dụng |

Trong tài liệu này, **"Bioscope"** chỉ doanh nghiệp thụ hưởng và nghiệp vụ của họ — nguyên liệu, khách hàng, dữ liệu. **"OPTIMAI"** chỉ bên thực hiện phần mềm.

---

## 1. Tên sản phẩm

**Tên đầy đủ:** Hệ thống trợ lý hội thoại trí tuệ nhân tạo đa kênh có truy hồi tri thức

**Tên nội bộ:** BioBot / Bioscope Assistants

**Mã nguồn:** `DeepViewJSC/BioBot/biobot` — kho mã nguồn **riêng**, độc lập với DA1 và DA2

**Thời gian phát triển:** 06/02/2026 – 12/06/2026

---

## 2. Sản phẩm này là gì

Một **nền tảng trợ lý hội thoại** cho phép nhân viên và khách hàng đặt câu hỏi bằng ngôn ngữ tự nhiên, hệ thống tự tra dữ liệu của công ty rồi trả lời có dẫn nguồn.

Khác biệt cốt lõi so với một khung chat thông thường: **trợ lý tự quyết định phải tra dữ liệu nào**, gọi công cụ tương ứng, đọc kết quả, rồi mới trả lời. Đây là kiến trúc **trợ lý có công cụ**, không phải hỏi-đáp một lượt.

```
        Khách / Nhân viên đặt câu hỏi
                      ↓
   ┌──────────────────────────────────────────┐
   │  6 KÊNH VÀO                              │
   │  Web · Zalo · Telegram · Messenger ·      │
   │  WhatsApp · Thư điện tử                   │
   └────────────────────┬─────────────────────┘
                        ↓
   ┌──────────────────────────────────────────┐
   │  ① CHỐT CHẶN AN TOÀN                     │
   │     · Bộ lọc câu hỏi y tế / dược          │
   │     · Kiểm quyền theo vai trò             │
   └────────────────────┬─────────────────────┘
                        ↓
   ┌──────────────────────────────────────────┐
   │  ② ĐỊNH TUYẾN NHANH                      │
   │     Câu hỏi rõ ràng → gọi thẳng công cụ   │
   │     đúng, không để mô hình chọn nhầm      │
   └────────────────────┬─────────────────────┘
                        ↓
   ┌──────────────────────────────────────────┐
   │  ③ VÒNG LẶP TRỢ LÝ (tối đa 5 lượt)       │
   │     mô hình chọn công cụ → chạy công cụ   │
   │     → đọc kết quả → chọn tiếp hoặc trả lời│
   └────────────────────┬─────────────────────┘
                        ↓
   ┌──────────────────────────────────────────┐
   │  ④ TRUY HỒI TRI THỨC                     │
   │     Tra kho vectơ + cơ sở dữ liệu quan hệ │
   └────────────────────┬─────────────────────┘
                        ↓
   ┌──────────────────────────────────────────┐
   │  ⑤ TRẢ LỜI CÓ DẪN NGUỒN                  │
   │     Chỉ dùng dữ liệu công cụ trả về       │
   └────────────────────┬─────────────────────┘
                        ↓
   ┌──────────────────────────────────────────┐
   │  ⑥ CHUYỂN NGƯỜI THẬT khi cần             │
   └──────────────────────────────────────────┘
```

---

## 3. Vấn đề sản phẩm giải quyết

### 3.1 Hiện trạng trước khi có hệ thống

| Vấn đề | Chi tiết |
| :---- | :---- |
| **Khách hỏi rải rác nhiều kênh** | Zalo, thư điện tử, điện thoại, tin nhắn mạng xã hội. Mỗi kênh một người phụ trách, không ai nắm toàn cảnh |
| **Trả lời chậm ngoài giờ** | Khách hỏi buổi tối, sáng hôm sau mới có người trả lời |
| **Trả lời không nhất quán** | Cùng một câu hỏi, mỗi nhân viên trả lời một kiểu |
| **Tra cứu tốn thời gian** | Nhân viên phải mở nhiều tệp, nhiều hệ thống để tìm một thông số |
| **Tri thức nằm trong đầu người** | Nhân viên nghỉ việc là mất kiến thức |
| **Hồ sơ kế toán xử lý thủ công** | Chứng từ giấy, nhập tay vào phần mềm kế toán |

### 3.2 Sau khi có hệ thống

| Chỉ số | Trước | Sau |
| :---- | :---- | :---- |
| Số kênh phục vụ tập trung | 0 | **6** |
| Thời gian phản hồi ngoài giờ | Hôm sau | **Ngay lập tức** |
| Tính nhất quán câu trả lời | Tuỳ người | Cùng một nguồn tri thức |
| Tra thông số sản phẩm | Mở nhiều tệp | Hỏi một câu |
| Truy vết câu trả lời | Không | Mọi lượt hỏi đáp đều có nhật ký |

---

## 4. Kiến trúc: sáu dịch vụ

| Dịch vụ | Ảnh nền | Vai trò |
| :---- | :---- | :---- |
| `biobot_n8n` | `n8nio/n8n:2.13.4` | Điều phối **44 quy trình tự động hoá** |
| `biobot_qdrant` | `qdrant/qdrant:v1.17.1` | **Kho vectơ** phục vụ truy hồi tri thức |
| `biobot_postgres` | `postgres:16-alpine` | Cơ sở dữ liệu quan hệ, **30 bảng** |
| `biobot_redis` | `redis:8-alpine` | Bộ nhớ đệm, chống xử lý trùng sự kiện |
| `biobot_bioscope_api` | tự dựng | Dịch vụ máy chủ, **20.356 dòng Python** |
| `biobot_bioscope_frontend` | tự dựng | Giao diện web, **9.956 dòng** |

**Điểm bảo mật đáng chú ý:** mọi cổng dịch vụ đều gắn vào `127.0.0.1`, không mở ra mạng ngoài. Truy cập từ Internet đi qua máy chủ web đứng trước. Kho vectơ, cơ sở dữ liệu và bộ nhớ đệm vì thế **không thể chạm tới từ bên ngoài**, kể cả khi biết địa chỉ máy chủ.

---

## 5. Phạm vi chức năng

### 5.1 Nhóm hội thoại

| # | Chức năng | Mô tả |
| :---- | :---- | :---- |
| 1 | Trợ lý có công cụ | Mô hình tự chọn công cụ, chạy, đọc kết quả, tối đa 5 lượt mỗi câu |
| 2 | Định tuyến nhanh | Câu hỏi rõ ràng gọi thẳng công cụ đúng, không để mô hình chọn nhầm |
| 3 | Phân loại ý định | Nhận diện loại câu hỏi trước khi xử lý |
| 4 | Truy hồi tri thức | Tra kho vectơ theo ngữ nghĩa, không chỉ khớp từ khoá |
| 5 | Trả lời theo dòng | Chữ hiện dần, không bắt chờ tới khi trả lời xong |
| 6 | Nhớ ngữ cảnh hội thoại | Giữ 15 lượt gần nhất |
| 7 | Hiểu câu trả lời ngắn | "đúng rồi", "ok", "tiếp đi" — hiểu theo ngữ cảnh trước đó |
| 8 | **Chuyển người thật** | Trợ lý bàn giao cho nhân viên khi cần |

### 5.2 Nhóm đa kênh

| # | Kênh | Quy trình |
| :---- | :---- | :---- |
| 1 | Web | `WF99_chat-portal` |
| 2 | Zalo | `WF00_zalo-oauth-callback`, `WF01_zalo-handler` |
| 3 | Telegram | `WF60_telegram-handler` |
| 4 | Messenger | `WF61_messenger-handler` |
| 5 | WhatsApp | `WF62_whatsapp-handler` |
| 6 | Thư điện tử | `WF32_email-proxy`, `WF32b_inbound-email-handler` |

Sáu kênh đi qua **một bộ xử lý chung** (`WF05_universal-channel-processor`) — logic nghiệp vụ chỉ có một bản.

### 5.3 Nhóm tri thức

| # | Chức năng | Quy trình |
| :---- | :---- | :---- |
| 1 | Quét kho tài liệu | `WF10a_drive-scanner` |
| 2 | Bóc tách nội dung | `WF10b_content-extractor` |
| 3 | Nạp vào kho vectơ | `WF10c_qdrant-updater` |
| 4 | Điều phối đồng bộ | `WF10d_sync-orchestrator` |
| 5 | Đồng bộ câu hỏi thường gặp | `WF11_faq-sync`, `WF11g_faq-qdrant-verify` |
| 6 | Đọc chữ trong ảnh | `WF22_vision-ocr` |
| 7 | Xuất kho vectơ ra tài liệu | `WF13`, `WF14` |

### 5.4 Nhóm nghiệp vụ

| # | Chức năng | Quy trình |
| :---- | :---- | :---- |
| 1 | Phân khúc khách hàng | `WF30_customer-segmentation` |
| 2 | Luồng đơn hàng | `WF31_order-workflow` |
| 3 | Tra cứu nhà cung cấp | `WF33_veridion-search` |
| 4 | Thông báo nội bộ | `WF40_lark-notification` |
| 5 | Biểu mẫu phê duyệt | `WF41_approval-form` |

### 5.5 Nhóm vận hành

| # | Chức năng | Quy trình |
| :---- | :---- | :---- |
| 1 | Kiểm tra sức khoẻ hệ thống | `WF50_health-check` |
| 2 | Làm mới khoá truy cập | `WF51_token-refresher` |
| 3 | Cảnh báo lỗi | `WF52_error-alerting` |
| 4 | Hàng đợi việc chết | `WF53_dead-letter-queue` |
| 5 | Chống xử lý trùng sự kiện | `WF54_event-dedup` |
| 6 | Sao lưu tự động | `WF12_backup-automation` |
| 7 | Bộ nhớ đệm thông minh | `WF09_smart-cache` |
| 8 | Ghi nhật ký AI | `WF08_ai-logger` |
| 9 | Chốt chặn an ninh | `WF06_security-guard` |
| 10 | Xử lý lỗi tập trung | `WF04_error-handler` |

Năm quy trình nhóm vận hành (`WF50`–`WF54`) là dấu hiệu của một hệ thống **được thiết kế để chạy thật**, không phải bản thử nghiệm: có kiểm tra sức khoẻ, cảnh báo lỗi, hàng đợi việc chết, và chống xử lý trùng.

---

## 6. Hai miền nghiệp vụ

Nền tảng phục vụ hai miền, dùng chung hạ tầng nhưng **tách hoàn toàn về quyền và dữ liệu**:

| | **Miền Kinh doanh** | **Miền Kế toán** |
| :---- | :---- | :---- |
| Người dùng | Nhân viên kinh doanh, khách hàng | Nhân viên kế toán |
| Dữ liệu | Sản phẩm, khách hàng, lịch sử trao đổi | Hoá đơn, chứng từ, báo cáo |
| Kho vectơ | `sales_kb` | `kt_docs` |
| Công cụ | 9 công cụ | 5 công cụ |
| Vai trò | `sales` | `ke_toan` |

Vai trò `admin` có cả hai bộ công cụ. Người dùng thường **chỉ thấy công cụ của miền mình** — chi tiết ở mục 7.

---

## 7. Nguyên tắc nền tảng: phân quyền ở tầng công cụ

Đây là quyết định thiết kế quan trọng nhất về an toàn dữ liệu của DA3.

### 7.1 Vấn đề

Trợ lý có công cụ nghĩa là mô hình **tự quyết định gọi công cụ nào**. Nếu không giới hạn, một nhân viên kinh doanh có thể hỏi *"cho xem danh sách hoá đơn tháng này"* và mô hình sẽ gọi công cụ kế toán — dữ liệu tài chính lọt sang người không có quyền.

### 7.2 Giải pháp: danh sách trắng công cụ theo vai trò

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

**Điểm mấu chốt: danh sách công cụ gửi cho mô hình được lọc theo vai trò trước khi gọi.** Mô hình **không biết** có công cụ kế toán tồn tại khi đang phục vụ nhân viên kinh doanh. Không phải "mô hình được yêu cầu không gọi" — mà là **không có gì để gọi**.

Đây là khác biệt căn bản: quy tắc trong câu lệnh là *lời đề nghị*, mô hình có thể không nghe. Lọc danh sách công cụ ở tầng mã nguồn là *ràng buộc cứng*.

### 7.3 Chốt chặn dược — không thể vượt bằng prompt injection

Chốt chặn thứ hai, cho một loại rủi ro khác: câu hỏi về y tế và dược lý.

```python
"""
pharma_guard.py — Bộ lọc cứng cho câu hỏi y tế / dược phẩm

Chạy SAU intent classifier như lớp bảo vệ thứ 2.
Python-level check — không phụ thuộc LLM nên không thể bị bypass bằng prompt injection.
"""
```

**Vì sao cần.** Bioscope bán nguyên liệu cho ngành dược và thực phẩm chức năng. Khách hỏi *"sản phẩm này chữa bệnh gì"*, *"liều dùng bao nhiêu"*, *"có tương tác với thuốc nào không"* — đây là **tư vấn y tế**, công ty không có thẩm quyền và không được phép trả lời.

**Vì sao phải chặn ở tầng mã nguồn, không chặn bằng câu lệnh.** Mô hình được yêu cầu "đừng tư vấn y tế" vẫn có thể bị dụ trả lời bằng cách đặt lại câu hỏi. Bộ lọc từ khoá viết bằng mã nguồn chạy **trước** khi mô hình nhìn thấy câu hỏi — không có cách nào dụ nó.

Danh sách từ khoá phủ năm nhóm: tác dụng và chỉ định, liều dùng, chống chỉ định và tương tác, so sánh hiệu quả điều trị, và các thuật ngữ tiếng Anh tương ứng.

Câu trả lời khi chặn không phải là từ chối cụt lủn mà **hướng người hỏi tới nguồn đúng**: tờ hướng dẫn sử dụng, dược sĩ hoặc bác sĩ, và cơ quan quản lý dược.

### 7.4 Ba lớp bảo vệ

| Lớp | Cơ chế | Chống được gì |
| :---- | :---- | :---- |
| 1 | Bộ lọc dược viết bằng mã | Tư vấn y tế ngoài thẩm quyền |
| 2 | Lọc danh sách công cụ theo vai trò | Lộ dữ liệu sang người không có quyền |
| 3 | Chỉ dùng dữ liệu công cụ trả về khi soạn câu trả lời | Bịa thông tin |

Lớp 3 thể hiện trong câu lệnh tổng hợp: *"DỮ LIỆU TOOL (chỉ được dùng nguồn này)"*.

---

## 8. Quy mô sản phẩm

| Chỉ số | Số liệu |
| :---- | :---- |
| Tổng dòng mã | **~47.700** |
| Ngôn ngữ | Python, JavaScript/JSX |
| Quy trình tự động hoá | **44** |
| Bảng cơ sở dữ liệu | **30** |
| Kho vectơ | 2 bộ sưu tập |
| Kênh vào | 6 |
| Công cụ trợ lý | 14 |
| Dịch vụ chạy | 6 |
| Số lần ghi nhận thay đổi | **163** |

### Phân bố mã nguồn

| Phần | Số tệp | Dòng |
| :---- | :---- | :---- |
| Backend — dịch vụ nghiệp vụ | 53 | 12.453 |
| Backend — giao diện lập trình | 11 | 5.558 |
| Backend — câu lệnh mô hình | 2 | 690 |
| Backend — mô hình dữ liệu | 16 | 614 |
| Backend — lược đồ vào/ra | 7 | 400 |
| Backend — lõi (cấu hình, xác thực, giới hạn) | 6 | 415 |
| Frontend | 95 | 9.956 |
| Quy trình tự động hoá | 44 | — |

### Năm tệp lớn nhất

| Tệp | Dòng | Vai trò |
| :---- | :---- | :---- |
| `agent_tools.py` | 1.053 | 14 công cụ trợ lý + phân quyền |
| `content_extractor.py` | 675 | Bóc tách nội dung tài liệu |
| `product_sync_worker.py` | 596 | Đồng bộ dữ liệu sản phẩm |
| `chat_sessions.py` | 503 | Quản lý phiên hội thoại |
| `admin_data_purge.py` | 479 | Xoá dữ liệu theo yêu cầu |

---

## 9. Tài liệu gốc sẵn có trong dự án

Khác với DA1 và DA2, DA3 **đã có sẵn tài liệu kỹ thuật ngay trong kho mã nguồn** từ lúc phát triển. Đây là bằng chứng gốc mạnh, có mốc thời gian trong lịch sử mã nguồn:

| Tài liệu | Dòng | Nội dung |
| :---- | :---- | :---- |
| `docs/SRS_MVP.md` | **1.566** | Đặc tả yêu cầu phần mềm: mục tiêu, kiến trúc, phân quyền, hai mô-đun nghiệp vụ, cấu trúc dữ liệu, quy trình, giao diện lập trình, triển khai |
| `docs/HUONG_DAN_WORKFLOWS.md` | **4.468** | Hướng dẫn chi tiết 44 quy trình tự động hoá |
| `docs/HUONG_DAN_NAP_DU_LIEU.md` | 471 | Quy trình nạp dữ liệu vào kho tri thức |
| `docs/HUONG_DAN_ACC_QUICKSTART.md` | 456 | Hướng dẫn mô-đun kế toán |
| `docs/SMART_CHAT_PLAN.md` | 367 | Kế hoạch phát triển phần hội thoại thông minh |
| `docs/env-checklist.md` | 137 | Danh mục biến môi trường |
| `docs/HUONG_DAN_ACC_DRIVE.md` | 156 | Hướng dẫn kết nối kho tài liệu |

**Tổng cộng hơn 7.600 dòng tài liệu kỹ thuật viết trong quá trình phát triển**, không phải viết bù sau.

Bộ hồ sơ DA3 này **không thay thế** các tài liệu đó mà **dẫn chiếu tới chúng**, đồng thời bổ sung phần hồ sơ theo bảy công đoạn mà tài liệu kỹ thuật không phủ: nhật ký phát triển, bộ ca kiểm thử, biên bản nghiệm thu, quy trình bàn giao.

---

## 10. Ranh giới với DA1

DA3 là hệ thống **độc lập hoàn toàn**: kho mã nguồn riêng, cơ sở dữ liệu riêng, hạ tầng riêng, ngôn ngữ lập trình khác.

| | DA1 | DA3 |
| :---- | :---- | :---- |
| Kho mã nguồn | `bioscope-website` | `BioBot` |
| Ngôn ngữ | TypeScript | Python + JavaScript |
| Cơ sở dữ liệu | `dvcms` | `biobot_db` |
| Thời gian | 06/2026 – nay | 02/2026 – 06/2026 |

### Điểm nối giữa hai hệ thống

DA1 cung cấp **giao diện lập trình danh mục nguyên liệu có khoá** (dựng 17/08/2026). DA3 lấy dữ liệu nguyên liệu qua chính giao diện đó.

Quan hệ: **DA1 là nguồn dữ liệu, DA3 là nơi khai thác.** Hai hệ thống nói chuyện với nhau qua một giao diện có kiểm soát, không truy cập thẳng cơ sở dữ liệu của nhau.

> **Lưu ý phân biệt.** Khung chat trên `bioscope.vn` **không phải** DA3. Đó là chat trực tuyến bắc cầu sang ứng dụng nhắn tin, **do nhân viên kinh doanh trả lời**, thuộc phạm vi DA1. Trường người gửi trong hệ thống đó chỉ có ba giá trị: khách, nhân viên, hệ thống — không có giá trị nào cho AI.
>
> DA3 là hệ thống riêng, có trợ lý AI thật.

---

## 11. Ranh giới: dịch vụ ngoài và phần OPTIMAI tự viết

### 11.1 Dịch vụ và phần mềm nền — nguyên liệu đầu vào

| Thành phần | Vai trò | Giấy phép |
| :---- | :---- | :---- |
| n8n | Nền tảng điều phối quy trình | Sustainable Use License |
| Qdrant | Kho vectơ | Apache 2.0 |
| PostgreSQL, Redis | Cơ sở dữ liệu, bộ nhớ đệm | Mã nguồn mở |
| FastAPI, SQLAlchemy, Pydantic | Bộ khung dịch vụ web | MIT |
| React, Vite | Bộ dựng giao diện | MIT |
| Mô hình ngôn ngữ và mô hình sinh vectơ | Dịch vụ ngoài | Theo điều khoản nhà cung cấp |
| API các nền tảng nhắn tin | Dịch vụ ngoài | Theo điều khoản |

### 11.2 Phần OPTIMAI tự viết — sản phẩm

| Nội dung | Vì sao đây là sản phẩm |
| :---- | :---- |
| **44 quy trình tự động hoá** | Toàn bộ logic nghiệp vụ và vận hành. Không nền tảng nào cung cấp sẵn |
| **14 công cụ trợ lý** | Mỗi công cụ là một cách tra dữ liệu của công ty |
| **Bảng phân quyền công cụ theo vai trò** | Quyết định ai được hỏi cái gì |
| **Bộ lọc dược** | Tri thức về ranh giới pháp lý của ngành, viết thành mã |
| **Bộ định tuyến nhanh** | Nhận diện câu hỏi rõ ràng để không phụ thuộc mô hình chọn công cụ |
| **Vòng lặp trợ lý** | Điều phối chọn công cụ, chạy, đọc kết quả, giới hạn số lượt |
| **Dây chuyền nạp tri thức** | Quét → bóc tách → cắt đoạn → sinh vectơ → nạp kho |
| **Bộ xử lý kênh chung** | Sáu kênh, một bộ logic |
| **30 bảng dữ liệu nghiệp vụ** | Mô hình dữ liệu của công ty |
| **95 thành phần giao diện** | Toàn bộ giao diện web |
| **Cơ chế chuyển người thật** | Quy trình nghiệp vụ |
| **Năm quy trình vận hành** | Kiểm tra sức khoẻ, cảnh báo, hàng đợi việc chết, chống trùng, sao lưu |

Cách kiểm chứng: **cài đặt n8n, Qdrant và một mô hình ngôn ngữ rồi hỏi "sản phẩm ABC có chỉ tiêu gì" sẽ không nhận được gì.** Toàn bộ khoảng cách giữa các thành phần nền và một hệ thống trả lời được câu hỏi đó là phần OPTIMAI làm.

---

## 12. Trạng thái hiện tại

| Nhóm | Trạng thái |
| :---- | :---- |
| Trợ lý có công cụ | Đang vận hành |
| Truy hồi tri thức | Đang vận hành |
| Kênh web | Đang vận hành |
| Kênh Zalo | Đang vận hành |
| Kênh Telegram, Messenger, WhatsApp | Đã dựng quy trình |
| Kênh thư điện tử | Đã dựng quy trình |
| Chốt chặn dược | Đang vận hành |
| Phân quyền công cụ | Đang vận hành |
| Chuyển người thật | Đã dựng quy trình |
| Mô-đun kế toán | Đang vận hành |
| Nhóm vận hành (5 quy trình) | Đang vận hành |

---

## 13. Lịch sử phát triển tóm tắt

| Mốc | Thời gian | Nội dung |
| :---- | :---- | :---- |
| Dựng nền hạ tầng | 02/2026 | Sáu dịch vụ, cơ sở dữ liệu, kho vectơ |
| Kênh Zalo và bộ xử lý chung | 02–03/2026 | Kênh đầu tiên, khung xử lý dùng chung |
| Dây chuyền tri thức | 03/2026 | Quét kho tài liệu, bóc tách, nạp kho vectơ |
| Nhóm vận hành | 04/2026 | Kiểm tra sức khoẻ, cảnh báo, hàng đợi việc chết |
| Mô-đun kế toán | 05/2026 | Xử lý chứng từ, báo cáo |
| **Hội thoại thông minh** | 06/2026 | Trợ lý có công cụ, phân quyền, chốt chặn dược |
| Giao diện web và hoàn thiện | 06/2026 | 95 thành phần giao diện, đưa vào vận hành |

Chi tiết ở `DA3-06-cd3-lap-trinh-va-nhat-ky.md`.
