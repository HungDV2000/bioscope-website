<!--HOSO
phu_de: Chatbot AI đa kênh BioBot — Bioscope Assistants
pham_vi: Dự án DA3
ngay_lap: 06/02/2026
phien_ban: 1.5
nguoi_lap: QuanNH — Team Lead, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 06/02/2026 | Mở sổ nhật ký phát triển
lich_su: 1.1 | 31/03/2026 | Ghi nhận mốc 1 và mốc 2
lich_su: 1.2 | 30/04/2026 | Ghi nhận mốc 3 — nhóm vận hành
lich_su: 1.3 | 31/05/2026 | Ghi nhận mốc 4 — mô-đun kế toán
lich_su: 1.4 | 12/06/2026 | Ghi nhận mốc 5 và mốc 6 — hội thoại thông minh và giao diện
lich_su: 1.5 | 12/06/2026 | Bổ sung thống kê và danh sách việc còn lại
-->
# DA3 — CÔNG ĐOẠN 3: LẬP TRÌNH VÀ NHẬT KÝ PHÁT TRIỂN
## Chatbot AI đa kênh BioBot — Bioscope Assistants

---

## 1. Tổ chức mã nguồn

```
BioBot/biobot/
├── docker-compose.yml              6 dịch vụ
├── n8n-workflows/                  44 quy trình tự động hoá
│   ├── WF00–WF09   kênh, phiên, lỗi, an ninh, chuyển người, đệm
│   ├── WF10–WF14   dây chuyền tri thức
│   ├── WF20–WF23   phân loại ý định, truy hồi, đọc ảnh, soạn trả lời
│   ├── WF30–WF33   nghiệp vụ
│   ├── WF40–WF41   thông báo, phê duyệt
│   ├── WF50–WF54   vận hành
│   ├── WF60–WF62   kênh nhắn tin
│   └── WF99        cổng chat web
│
├── postgres/init/                  30 bảng
├── qdrant/                         cấu hình kho vectơ
├── redis/                          cấu hình bộ nhớ đệm
├── scripts/  sql/  tests/          tiện ích, kịch bản, kiểm thử
├── docs/                           7.600+ dòng tài liệu kỹ thuật
│
└── bioscope/
    ├── backend/                    FastAPI — 20.356 dòng
    │   ├── app/api/         11 tệp   5.558 dòng
    │   ├── app/services/    53 tệp  12.453 dòng
    │   ├── app/models/      16 tệp     614 dòng
    │   ├── app/schemas/      7 tệp     400 dòng
    │   ├── app/core/         6 tệp     415 dòng
    │   ├── app/prompts/      2 tệp     690 dòng
    │   └── alembic/                  chuyển đổi cấu trúc
    │
    └── frontend/                   React + Vite — 9.956 dòng
        └── src/
            ├── features/     chat · sales · kt · jobs · functions · guide · admin
            ├── pages/        màn hình
            ├── components/   dùng chung
            ├── contexts/     trạng thái toàn cục
            ├── hooks/        logic tái dùng
            └── services/     gọi giao diện lập trình
```

### 1.1 Bốn tệp lõi của phần trợ lý

| Tệp | Dòng | Trách nhiệm |
| :---- | :---- | :---- |
| `agent_tools.py` | 1.053 | 14 công cụ + bảng phân quyền |
| `agent_loop.py` | 377 | Vòng lặp: chọn công cụ → chạy → đọc → trả lời |
| `agent_heuristics.py` | — | Định tuyến nhanh, nhận diện câu xác nhận |
| `pharma_guard.py` | — | Chốt chặn dược, viết bằng mã |

**Bốn tệp này là nơi đặt toàn bộ logic an toàn.** Không có phần nào của bốn tệp này nằm trong quy trình tự động hoá — đó là quyết định kiến trúc ở `DA3-03` mục 1.2: **thứ sửa được trên giao diện thì có ngày bị sửa nhầm**.

### 1.2 Quy tắc phân chia giữa quy trình và mã

| Đặt vào quy trình | Đặt vào mã |
| :---- | :---- |
| Định tuyến sự kiện các kênh | Vòng lặp trợ lý |
| Dây chuyền nạp tri thức | 14 công cụ |
| Nghiệp vụ nhiều bước | **Phân quyền** |
| Thông báo, cảnh báo | **Chốt chặn dược** |
| Kiểm tra sức khoẻ, sao lưu | Quản lý phiên |

---

## 2. Quy ước lập trình

| Quy ước | Vì sao |
| :---- | :---- |
| Chú thích tiếng Việt, giải thích "vì sao" | Người đọc mã là người Việt |
| **Mọi cơ chế an toàn nằm trong mã, không nằm trong quy trình** | Quy trình sửa được trên giao diện |
| **Mọi lượt gọi mô hình đều ghi nhật ký** | Truy vết, đo chi phí, đo tốc độ |
| Bí mật đặt ở biến môi trường | Kho mã nguồn có thể bị sao chép |
| Quy trình xuất ra tệp và lưu trong kho mã nguồn | Có lịch sử thay đổi, khôi phục được |
| Hằng số quan trọng kèm chú thích lý do | Xem ví dụ ở mục 4, mốc 5 |

---

## 3. Thống kê khối lượng

| Tháng | Số lần ghi nhận | Dòng thêm | Dòng xoá |
| :---- | :---- | :---- | :---- |
| 02/2026 | 14 | 3.490 | 85 |
| 03/2026 | 11 | 13.494 | 1.199 |
| 04/2026 | 6 | 12.225 | 4.497 |
| 05/2026 | 1 | 11.629 | 14 |
| 06/2026 | **131** | **98.008** | 13.985 |
| **Tổng** | **163** | **138.846** | **19.780** |

### Đọc bảng này thế nào

Phân bố rất lệch: bốn tháng đầu 32 lần ghi nhận, tháng cuối 131 lần. Nhưng **dòng mã thay đổi** thì trải đều hơn — tháng 3, 4, 5 mỗi tháng vẫn thêm 11–13 nghìn dòng.

Nghĩa là: bốn tháng đầu làm việc theo **khối lớn, ghi nhận thưa**; tháng 6 làm việc theo **bước nhỏ, ghi nhận dày**. Đây là dấu hiệu chuyển từ giai đoạn dựng nền sang giai đoạn hoàn thiện và sửa lỗi — đúng với thực tế: tháng 6 là tháng đưa vào vận hành.

### Ghi chú trung thực về chất lượng nhật ký

Mô tả thay đổi trong kho mã nguồn của DA3 **rất sơ sài** — phần lớn là `up`, `update`, `update code n8n`, `fix frontend`. Đây là thực tế, không che giấu.

Bù lại, DA3 có thứ mà DA1 và DA2 không có ở giai đoạn đầu: **hơn 7.600 dòng tài liệu kỹ thuật viết ngay trong quá trình phát triển**, nằm trong kho mã nguồn và có mốc thời gian. Đặc tả yêu cầu 1.566 dòng, hướng dẫn quy trình 4.468 dòng, cùng năm tài liệu hướng dẫn khác.

Nói cách khác: đội **có ghi chép, chỉ là ghi vào tài liệu chứ không ghi vào mô tả thay đổi**. Kinh nghiệm từ DA3 dẫn tới việc siết quy ước mô tả thay đổi ở DA1 từ 09/07/2026 — thấy rõ trong `00-5` mục 3 và `DA1-06` mốc 1.

---

## 4. Nhật ký phát triển

---

### Mốc 1 — Dựng nền và kênh đầu tiên (02/2026)

**Mục tiêu:** hạ tầng chạy được, một kênh nhận và trả lời được tin.

**Đã làm:**
- Dựng cấu hình sáu dịch vụ
- 18 bảng nền tảng
- Kết nối kho vectơ và bộ nhớ đệm
- **Kênh Zalo**: xác thực, webhook, xử lý tin
- Quản lý khoá truy cập, **có cơ chế khoá chống làm mới đồng thời**
- Bộ xử lý kênh chung — khung dùng chung ngay từ kênh đầu tiên

**Quyết định đáng ghi: dựng bộ xử lý chung ngay từ kênh đầu tiên.**

Thông thường người ta làm xong một kênh rồi mới tách phần chung khi làm kênh thứ hai. Ở đây tách ngay từ đầu, chấp nhận chậm hơn ở kênh đầu.

Lý do: đã biết chắc sẽ có sáu kênh. Làm xong một kênh rồi mới tách thì phải viết lại, và trong lúc viết lại dễ bỏ sót quy tắc nghiệp vụ.

**Cơ chế khoá làm mới khoá truy cập** cũng dựng ngay từ mốc này, không đợi tới lúc gặp sự cố. Đây là loại lỗi rất khó chẩn đoán khi xảy ra: hai tiến trình cùng làm mới, một cái thành công, cái kia dùng mã đã hết hiệu lực và **làm hỏng cả khoá** — kênh chết âm thầm.

---

### Mốc 2 — Dây chuyền tri thức (03/2026)

**Mục tiêu:** nạp được tài liệu công ty vào kho tri thức và tìm được theo ngữ nghĩa.

**Đã làm:**
- Quét kho tài liệu, phát hiện tệp mới và tệp đã sửa
- Bóc tách nội dung nhiều định dạng
- **Đọc chữ trong ảnh và tài liệu scan**
- Cắt đoạn, sinh vectơ, nạp kho
- Điều phối toàn bộ chuỗi
- Kiểm chứng dữ liệu đã nạp đúng
- Đồng bộ bộ câu hỏi thường gặp
- **Bảng trạng thái đồng bộ có mã băm nội dung**
- **Đệm vectơ đã sinh**

**Hai tối ưu chi phí dựng ngay từ đầu:**

| Cơ chế | Tiết kiệm gì |
| :---- | :---- |
| Mã băm nội dung | Kho tài liệu báo "đã sửa" cả khi chỉ đổi tên hoặc quyền. So mã băm thì biết nội dung **thật sự** có đổi không, tránh nạp lại tệp lớn vô ích |
| Đệm vectơ | Cùng một đoạn văn bản ở nhiều tài liệu chỉ sinh vectơ một lần |

Cả hai đều là quyết định **nghĩ trước**, không phải vá sau khi thấy hoá đơn cao.

**Xử lý số chiều vectơ** cũng dựng ở mốc này, với quyết định quan trọng: vectơ ngắn hơn số chiều kho thì **báo lỗi**, không đệm số 0. Lý do ghi ở `DA3-04` mục 3.3 — thà hỏng to còn hơn hỏng thầm lặng.

---

### Mốc 3 — Nhóm vận hành (04/2026)

**Mục tiêu:** hệ thống chạy được lâu dài mà không cần người canh.

**Đã làm:**
- Kiểm tra sức khoẻ định kỳ
- Cảnh báo lỗi
- **Hàng đợi việc chết**
- Chống xử lý trùng sự kiện
- Tự làm mới khoá truy cập
- Xử lý lỗi tập trung
- Sao lưu tự động
- Bộ nhớ đệm thông minh

**Vì sao làm nhóm này ở giai đoạn giữa, không để cuối.**

Đây là quyết định khác thường và đáng ghi. Thông thường nhóm vận hành bị đẩy xuống cuối, làm khi "có thời gian" — và thường không bao giờ có thời gian.

Làm ở giữa vì: hệ thống lúc này đã bắt đầu có người dùng thử, và mọi sự cố từ đây trở đi đều cần công cụ chẩn đoán. Không có nhật ký lỗi tập trung và cảnh báo thì mỗi lần hỏng phải mò từ đầu.

**Hàng đợi việc chết là thành phần hay bị bỏ nhất.** Không có nó, một việc lỗi lặp đi lặp lại sẽ chiếm chỗ và chặn mọi việc khác — **cả hệ thống đứng vì một tin nhắn hỏng**.

---

### Mốc 4 — Mô-đun kế toán (05/2026)

**Mục tiêu:** mở rộng sang miền nghiệp vụ thứ hai.

**Đã làm:**
- 12 bảng của mô-đun
- Xử lý chứng từ, đọc chứng từ scan
- Hội thoại kế toán
- Mẫu báo cáo
- **Bộ sưu tập vectơ riêng cho tài liệu kế toán**
- Nhật ký thao tác

**Mốc này đặt ra bài toán phân quyền.**

Trước mốc 4, hệ thống chỉ có một miền nghiệp vụ nên không có câu hỏi "ai được xem gì". Từ mốc 4 có hai miền, và dữ liệu tài chính **không được lọt sang người không có quyền**.

Quyết định: **tách ở tầng kho lưu trữ**, hai bộ sưu tập vectơ riêng, chứ không chỉ lọc ở tầng truy vấn. Lý do ở `DA3-04` mục 3.1 — phòng thủ nhiều lớp.

Quyết định này về sau hoá ra rất đúng: khi mốc 5 dựng trợ lý có công cụ, việc dữ liệu đã tách sẵn ở tầng kho làm cho phân quyền công cụ trở nên sạch sẽ.

---

### Mốc 5 — Hội thoại thông minh (06/2026)

**Mục tiêu:** chuyển từ hỏi-đáp một lượt sang trợ lý tự chọn công cụ.

**Đã làm:**
- **Vòng lặp trợ lý** với gọi công cụ
- **14 công cụ** tra dữ liệu
- **Bảng phân quyền công cụ theo vai trò**
- **Chốt chặn dược viết bằng mã**
- **Định tuyến nhanh**
- Phân loại ý định
- Trả lời theo dòng
- Ngữ cảnh hội thoại
- Chuyển người thật

**Đây là mốc quan trọng nhất của dự án.** Ba thành phần an toàn ra đời cùng lúc với năng lực mới — không phải bổ sung sau.

#### Vì sao chuyển sang trợ lý có công cụ

Kiến trúc cũ: tìm kiếm ngữ nghĩa rồi nhồi kết quả vào câu lệnh. Hai hạn chế:

| Hạn chế | Ví dụ không trả lời được |
| :---- | :---- |
| Không tính toán được | *"Tổng giá trị hoá đơn tháng 3 là bao nhiêu"* |
| Không tra nhiều nguồn | *"So sánh sản phẩm A và B"* |

Nhưng lý do quyết định là lý do thứ ba: **phân quyền ở tầng công cụ là cách sạch nhất** để đáp ứng yêu cầu tách dữ liệu.

#### Ba quyết định an toàn

| Quyết định | Vì sao |
| :---- | :---- |
| Lọc danh sách công cụ **trước khi gửi cho mô hình** | Để mô hình "biết có công cụ nhưng đừng gọi" là mời gọi rắc rối. Không gửi thì không có gì để gọi |
| Chốt chặn dược viết bằng **mã**, không viết trong câu lệnh | Quy tắc trong câu lệnh là lời đề nghị, có thể bị dụ bỏ qua |
| Giới hạn **5 lượt** gọi công cụ | Chặn vòng lặp không dừng và chi phí không kiểm soát |

Chú thích trong mã nguồn ghi rõ tinh thần của quyết định thứ hai:

> Python-level check — không phụ thuộc LLM nên không thể bị bypass bằng prompt injection.

#### Hai lần điều chỉnh dựa trên quan sát thực tế

| Điều chỉnh | Lý do, ghi trong mã |
| :---- | :---- |
| Ngữ cảnh hội thoại: **40 → 15 lượt** | *"giảm từ 40 xuống 15 turns, giữ nội dung tốt hơn"* — 40 lượt bị cắt ngắn tệ hơn 15 lượt nguyên vẹn, vì câu trả lời của trợ lý thường chứa danh sách dữ liệu |
| Độ dài câu trả lời: **tăng lên 2500** | *"tăng lên 2500 để đủ trình bày bảng thông tin sản phẩm dược"* — giá trị cũ cắt mất bảng thông số |

Hai chú thích này là ví dụ tốt cho quy ước "ghi lý do ngay tại chỗ": người sau thấy con số lạ sẽ không sửa lại rồi làm hỏng.

#### Định tuyến nhanh — sinh ra từ vấn đề thật

Hai vấn đề quan sát được khi chạy thử:

| Vấn đề | Ví dụ |
| :---- | :---- |
| Mô hình chọn nhầm công cụ cho câu rõ ràng | *"Liệt kê sản phẩm trong danh mục X"* — rõ ràng phải gọi công cụ liệt kê, nhưng mô hình gọi tìm kiếm ngữ nghĩa |
| Câu trả lời ngắn mất ngữ cảnh | Khách nói *"đúng rồi"* — mô hình không biết đang xác nhận điều gì |

Giải pháp: nhận mẫu câu bằng biểu thức chính quy, gọi thẳng công cụ đúng. **Vừa đúng hơn vừa rẻ hơn** — bỏ được một lượt gọi mô hình.

---

### Mốc 6 — Giao diện và đưa vào vận hành (06/2026)

**Mục tiêu:** giao diện web đầy đủ, các kênh còn lại, đưa hệ thống vào chạy thật.

**Đã làm:**
- **95 tệp giao diện** React, chia theo miền chức năng
- Bảy nhóm màn hình: chat, sales, kế toán, công việc, chức năng, hướng dẫn, quản trị
- Menu hiện theo vai trò
- Kênh Telegram, Messenger, WhatsApp
- Kênh thư điện tử, cả nhận và gửi
- Phân khúc khách hàng, luồng đơn hàng, biểu mẫu phê duyệt
- Thông báo nội bộ, tra cứu nhà cung cấp
- Màn hình nhật ký AI, nhật ký lỗi, sức khoẻ hệ thống
- Chức năng xoá dữ liệu theo yêu cầu

**Vì sao 131 lần ghi nhận dồn vào tháng này.** Đây là giai đoạn hoàn thiện: mỗi lần ghi nhận là một màn hình, một sửa lỗi giao diện, một điều chỉnh nhỏ. Bước nhỏ, nhịp dày — đúng đặc trưng của giai đoạn đưa vào vận hành.

**Tổ chức giao diện theo miền chức năng** (`features/chat`, `features/sales`, `features/kt`…) thay vì theo loại tệp. Người sửa phần kế toán mở đúng một thư mục, không phải đi tìm khắp nơi.

---

## 5. Bằng chứng công đoạn kiểm thử trong kho mã nguồn

DA3 có sẵn ba quy trình kiểm thử và một thư mục kiểm thử:

| Thành phần | Vai trò |
| :---- | :---- |
| `WF10e_rag-chat-tester` | Kiểm chất lượng truy hồi tri thức |
| `WF10f_test-harness` | Khung chạy kiểm thử |
| `WF99a_chat-tester` | Kiểm luồng hội thoại |
| `WF11g_faq-qdrant-verify` | Kiểm chứng dữ liệu đã nạp đúng |
| `tests/` | Thư mục kiểm thử |

Đây là bằng chứng công đoạn 4 nằm ngay trong sản phẩm, có mốc thời gian trong lịch sử mã nguồn.

---

## 6. Việc còn lại

| # | Việc | Mức | Ghi chú |
| :---- | :---- | :---- | :---- |
| 1 | **Chuẩn hoá mô tả thay đổi trong kho mã nguồn** | **Cao** | Hiện phần lớn là `up`, `update`. Quy ước đã siết ở DA1 từ 09/07/2026, cần áp ngược lại cho DA3 |
| 2 | Đo tỉ lệ chặn nhầm của chốt chặn dược | **Cao** | Chặn nhầm câu vô hại làm giảm trải nghiệm; cần số liệu để tinh chỉnh |
| 3 | Bộ kiểm thử tự động cho phân quyền công cụ | **Cao** | Đây là cơ chế **không được phép hỏng** |
| 4 | Đối chiếu chi phí gọi mô hình với hoá đơn | Trung bình | Nhật ký đã ghi đủ số liệu, chưa đối chiếu |
| 5 | Đo độ chính xác bộ phân loại ý định | Trung bình | Bảng nhật ký ý định đã có dữ liệu |
| 6 | Bổ sung hướng dẫn sử dụng cho người dùng cuối | Trung bình | Tài liệu hiện thiên về kỹ thuật |
| 7 | Diễn tập khôi phục từ bản sao lưu | Trung bình | Sao lưu đã chạy, chưa khôi phục thử |
| 8 | Tách dịch vụ máy chủ ra nhiều bản khi tải tăng | Thấp | Chưa cần |

**Mục 3 đáng làm nhất.** Phân quyền công cụ là cơ chế mà một lỗi nhỏ đủ để làm lộ dữ liệu tài chính. Hiện đang được kiểm thủ công — nên có kiểm thử tự động chạy mỗi lần thay đổi mã.
