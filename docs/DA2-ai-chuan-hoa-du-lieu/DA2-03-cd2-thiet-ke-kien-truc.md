<!--HOSO
phu_de: Hệ thống AI chuẩn hoá và cập nhật dữ liệu sản phẩm
pham_vi: Dự án DA2
ngay_lap: 30/06/2026
phien_ban: 1.2
nguoi_lap: Quân — Team phát triển, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 30/06/2026 | Ban hành lần đầu
lich_su: 1.1 | 24/07/2026 | Bổ sung thiết kế nhận dạng chữ trong ảnh, hai đường có dự phòng
lich_su: 1.2 | 17/08/2026 | Bổ sung thiết kế cấu hình động nhà cung cấp
-->
# DA2 — CÔNG ĐOẠN 2: THIẾT KẾ KIẾN TRÚC
## Hệ thống AI chuẩn hoá và cập nhật dữ liệu sản phẩm

---

## 1. Kiến trúc tổng thể

```
┌──────────────────────────────────────────────────────────────┐
│  GIAO DIỆN QUẢN TRỊ (4 thành phần tự viết)                   │
│  · Thanh sinh hàng loạt trên danh sách nguyên liệu           │
│  · Menu "Công cụ nguyên liệu" cạnh nút Lưu                   │
│  · Bảng theo dõi hàng đợi                                     │
│  · Khung xem nhật ký công việc                                │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│  ĐIỂM GIAO TIẾP (14)                                          │
│  /ai-generate · /ai-generate/bulk · /ai-generate/image         │
│  /ai-generate/jobs · /ai-generate/queue-status                 │
│  /drive-sync · /csv-import · /duplicate-scan · ...             │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│  BỘ ĐIỀU PHỐI  AiGenerateWorker  (1.193 dòng)                │
│                                                               │
│   ① tải tệp ──② nhận loại ──③ bóc tách ──④ dựng câu lệnh     │
│        │           │             │              │             │
│        │           │             │              ↓             │
│   ⑦ ghi nháp ◄─⑥ đối chiếu ◄─⑤ chuẩn hoá ◄─ gọi mô hình     │
└──────┬──────────────────────────────────┬────────────────────┘
       │                                  │
┌──────▼────────────┐          ┌──────────▼─────────────────────┐
│  Google Drive API │          │  openaiService  (1.408 dòng)   │
│  (kho tài liệu)   │          │  · chọn khách gọi theo cấu hình│
└───────────────────┘          │  · dựng câu lệnh hệ thống      │
                               │  · chuẩn hoá kết quả           │
┌───────────────────┐          │  · ước tính chi phí            │
│  Cơ sở dữ liệu    │◄─────────┤  · bóc tách PDF                │
│  ingredients      │          └──────────┬─────────────────────┘
│  ai-generate-jobs │                     │
└───────────────────┘          ┌──────────▼─────────────────────┐
                               │  Dịch vụ mô hình bên ngoài     │
                               │  OpenRouter / OpenAI / Mistral │
                               └────────────────────────────────┘
```

---

## 2. Bảy bước của dây chuyền

### Bước ① — Tải tệp từ kho tài liệu

Mỗi nguyên liệu có một mã thư mục trên kho tài liệu. Bộ điều phối liệt kê tệp trong thư mục đó rồi tải về bộ nhớ.

**Đặt hạn giờ từng tệp.** Không đặt thì một tệp lỗi mạng treo cả hàng đợi:

```ts
const FILE_TIMEOUT_MS = Number(process.env.AI_FILE_TIMEOUT_MS ?? 150_000)
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> { ... }
```

Hỗ trợ cả ổ đĩa dùng chung (`supportsAllDrives`) vì kho tài liệu của công ty nằm trên ổ chung, không phải ổ cá nhân.

### Bước ② — Nhận loại tệp

Không tin phần mở rộng tên tệp. Nhận loại theo **kiểu nội dung** kết hợp tên:

```ts
type FileType = 'pdf_text' | 'pdf_image' | 'image' | 'google_doc'
              | 'google_sheet' | 'google_slide' | 'text' | 'csv' | 'unknown'
```

Phân biệt `pdf_text` và `pdf_image` là điểm mấu chốt: PDF chữ đọc trực tiếp được, PDF scan phải qua nhận dạng chữ — hai đường xử lý hoàn toàn khác nhau về chi phí và tốc độ.

### Bước ③ — Bóc tách nội dung

| Loại tệp | Cách xử lý |
| :---- | :---- |
| PDF chữ | Bóc tách trực tiếp |
| PDF scan | Gửi thẳng tệp cho mô hình đọc ảnh, hoặc qua dịch vụ nhận dạng chuyên dụng |
| Ảnh | Gửi thẳng cho mô hình đọc ảnh |
| Google Docs / Slides | Xuất sang PDF rồi gửi kèm |
| Google Sheets | Xuất sang CSV |
| Văn bản, CSV | Đọc trực tiếp |

**Quyết định quan trọng — gửi thẳng tệp thay vì trích chữ trước.** Ban đầu hệ thống trích chữ ra rồi mới gửi chuỗi cho mô hình. Đổi sang **đính kèm tệp gốc** vì:

| | Trích chữ trước | Gửi thẳng tệp |
| :---- | :---- | :---- |
| Bảng biểu trong tài liệu | Mất cấu trúc, cột lẫn vào nhau | Mô hình nhìn được bố cục |
| Ảnh minh hoạ, biểu đồ | Mất hoàn toàn | Mô hình đọc được |
| Ký hiệu ≤ ≥ và chỉ số dưới | Hay hỏng | Giữ nguyên |

Chỉ tiêu kỹ thuật thường nằm trong **bảng**, nên khác biệt này quyết định chất lượng.

**Giới hạn kích thước:** có trần cho dữ liệu gửi đi (`AI_TEXT_MAX_CHARS`, mặc định 300.000 ký tự) và trần cho tệp PDF gửi kèm. Vượt trần thì cắt bớt, không để lời gọi thất bại.

### Bước ④ — Dựng câu lệnh và gọi mô hình

Hai phần: **câu lệnh hệ thống** (quy tắc, không đổi theo nguyên liệu) và **câu lệnh người dùng** (dữ liệu nguyên liệu cụ thể + tệp đính kèm).

Tham số gọi:

| Tham số | Giá trị | Vì sao |
| :---- | :---- | :---- |
| Định dạng trả về | Bắt buộc JSON | Không phải bóc tách từ văn xuôi |
| Số đơn vị tối đa | 8192 | Đủ cho 20 nhóm trường song ngữ |
| Độ ngẫu nhiên | 0.3 | Thấp — đây là việc trích xuất, không phải sáng tác |

Độ ngẫu nhiên 0.3 là quyết định có chủ ý: cao thì mô hình "sáng tạo" hơn, mà sáng tạo chính là thứ **không được phép** với trường loại trích xuất.

### Bước ⑤ — Chuẩn hoá kết quả

Lớp này tồn tại vì **mỗi mô hình trả về một hình dạng khác nhau**. Cùng một trường song ngữ, mô hình này trả `{vi, en}`, mô hình kia trả một chuỗi, mô hình khác lại trả `"VI: ... | EN: ..."`.

Nếu không có lớp chuẩn hoá thì đổi mô hình là hỏng cả dây chuyền — mà YC-37 lại đòi đổi mô hình được ngay trên giao diện. Lớp này chấp nhận mọi biến thể và trả về một hình dạng duy nhất:

| Tình huống mô hình trả về | Lớp chuẩn hoá xử lý |
| :---- | :---- |
| Chuỗi thay vì cặp song ngữ | Nhân đôi thành hai ngôn ngữ |
| Cặp thiếu một vế | Lấy vế còn lại điền vào |
| `"VI: ... \| EN: ..."` gộp một chuỗi | Tách làm hai |
| Mảng chứa đối tượng thay vì chuỗi | Lấy trường `text`/`label`/`value` |
| `technical_casNumber` phẳng thay vì `technical.casNumber` lồng | Gom lại thành nhóm |
| Trường rỗng | **Bỏ hẳn key** — xem mục 3.2 |

### Bước ⑥ — Đối chiếu danh mục

AI chọn thẻ lọc **theo tên**. Bộ điều phối đối chiếu tên đó sang mã trong danh mục. Tên không khớp bất kỳ mục nào → **loại bỏ**.

Câu lệnh cũng đã nêu rõ: *"Thẻ lọc — AI chọn theo TÊN, worker đối chiếu sang id. Không được bịa tên mới."*

Hai lớp: câu lệnh **yêu cầu** không bịa, mã nguồn **bắt buộc** không bịa. Lớp thứ hai mới là lớp có hiệu lực — câu lệnh chỉ là lời đề nghị.

Tương tự với trạng thái pháp lý: chỉ chấp nhận bốn giá trị `fda_gras`, `efsa`, `vn_moh`, `novel_food`. Giá trị khác bị loại.

### Bước ⑦ — Ghi ở trạng thái nháp

Kết quả ghi vào nhóm dữ liệu `ingredients` với `_status: 'draft'` và cờ **chờ duyệt**. Không có đường nào để tự xuất bản.

---

## 3. Ba cơ chế bảo vệ dữ liệu

### 3.1 Chia hai loại trường

Đã trình bày ở `DA2-01` mục 6.3. Đây là lớp bảo vệ ở tầng **câu lệnh**.

### 3.2 Không ghi đè bằng giá trị rỗng

Lớp bảo vệ ở tầng **mã nguồn**, mạnh hơn lớp trên vì nó không phụ thuộc vào việc mô hình có nghe lời hay không.

```ts
/** Drop a {vi,en} pair whose both sides are blank, so we never write "" over real data. */
const pairOrUndef = (v: unknown): LocalizedText | undefined => {
  const p = pair(v)
  return p && (p.vi.trim() || p.en.trim()) ? p : undefined
}

/** Trimmed non-empty string, else undefined — same "never overwrite with blank" rule. */
const strOrUndef = (v: unknown): string | undefined => {
  const s = str(v)?.trim()
  return s ? s : undefined
}
```

**Tình huống thật cơ chế này chặn được:** một nguyên liệu đã có mã CAS do người nhập tay từ tài liệu giấy. Chạy lại dây chuyền AI với bộ tệp mới không chứa mã CAS. Không có cơ chế này thì AI trả về rỗng và **xoá mất mã CAS đúng**. Có cơ chế này thì giá trị cũ được giữ nguyên.

Nguyên tắc: **AI chỉ được thêm và sửa, không được xoá.**

### 3.3 Bắt buộc người duyệt

Lớp bảo vệ ở tầng **quy trình**. Chi tiết ở `DA2-01` mục 6.

Ba lớp này độc lập nhau. Lớp một hỏng (mô hình không nghe lời) thì lớp hai vẫn chặn. Lớp hai hỏng (lỗi lập trình) thì lớp ba vẫn chặn.

---

## 4. Cấu hình động — đổi nhà cung cấp không cần triển khai lại

### 4.1 Cơ chế

Cấu hình đặt trong bảng cấu hình của hệ quản trị, chỉ quản trị viên đọc/sửa. Lưu xong **áp dụng ngay**:

```ts
hooks: {
  // Lưu là áp dụng ngay — khỏi phải khởi động lại tiến trình.
  afterChange: [
    async ({ req }) => {
      const { applyAiSettings } = await import('../lib/aiSettings.js')
      await applyAiSettings(req.payload)
    },
  ],
},
```

Và mô hình được đọc **lúc gọi**, không chốt cứng lúc nạp mã:

```ts
// Đọc từ cấu hình động (admin) — KHÔNG chốt cứng lúc nạp module, nếu không đổi
// model trong admin sẽ phải khởi động lại tiến trình mới ăn.
const CONTENT_MODEL_FN = () => getAiConfig().contentModel
const VISION_MODEL_FN = () => getAiConfig().visionModel
```

Chi tiết nhỏ nhưng quyết định: viết `const model = getAiConfig().contentModel` ở cấp mô-đun thì giá trị bị chốt lúc khởi động, đổi trên giao diện không có hiệu lực, và người dùng sẽ báo "đổi model không ăn" — một lỗi rất khó tìm.

### 4.2 Ba loại tác vụ, ba mô hình riêng

| Tác vụ | Cấu hình | Ghi chú |
| :---- | :---- | :---- |
| Sinh nội dung | `contentModel` | Bỏ trống = để cổng trung gian tự chọn mô hình phù hợp từng yêu cầu |
| Đọc ảnh, PDF scan | `visionModel` | **Phải ghi rõ một mô hình nhìn được** |
| Tạo ảnh | `imageModel` | **Luôn gọi thẳng OpenAI** |

### 4.3 Hai cạm bẫy ghi thẳng vào giao diện

Cả hai đều ghi làm mô tả trường trong hệ quản trị, để người cấu hình đọc được ngay lúc thao tác:

> **⚠ ĐỪNG để "openrouter/auto" ở ô mô hình đọc ảnh** — bộ định tuyến có thể chọn model chỉ xử lý chữ và bước đọc ảnh sẽ hỏng. Hãy ghi rõ một model nhìn được.

> **⚠ OpenRouter KHÔNG tạo được ảnh** (không có chức năng tạo ảnh). Phần tạo ảnh LUÔN gọi thẳng OpenAI, kể cả khi đang chọn OpenRouter ở trên.

Ghi cảnh báo ngay tại chỗ cấu hình có giá trị hơn nhiều so với ghi trong tài liệu — người cấu hình thường không mở tài liệu.

### 4.4 Vì sao dùng cổng trung gian nhiều mô hình

| Phương án | Đánh giá |
| :---- | :---- |
| Gọi thẳng một nhà cung cấp | Đơn giản. Nhưng khoá chặt vào một nhà; đổi là sửa mã |
| Qua cổng trung gian | Đổi mô hình bằng một dòng cấu hình; để cổng tự chọn mô hình rẻ cho câu dễ, mô hình mạnh cho câu khó ⇒ **tiết kiệm chi phí**. **Chọn** |
| Tự dựng lớp trừu tượng cho nhiều nhà | Nhiều việc, ít lợi hơn |

Cổng trung gian dùng cùng giao thức với nhà cung cấp lớn nên chuyển đổi gần như không phải sửa mã.

---

## 5. Ước tính chi phí

Yêu cầu NV-06 đòi kiểm soát chi phí. Thiết kế:

### 5.1 Đếm đơn vị

Mỗi lượt gọi mô hình đều dồn số đơn vị đã dùng vào một bộ đếm chung của công việc, tách theo ba loại: sinh nội dung, đọc ảnh, viết mô tả ảnh. Cộng thêm số ảnh đã tạo và số trang đã nhận dạng.

### 5.2 Bảng đơn giá theo mô hình

```ts
const MODEL_PRICES: Record<string, { input: number; cachedInput: number; output: number }> = {
  'gpt-5.6-sol':   { input: 5,   cachedInput: 0.5,  output: 30 },
  'gpt-5.6-terra': { input: 2.5, cachedInput: 0.25, output: 15 },
  'gpt-5.6-luna':  { input: 1,   cachedInput: 0.1,  output: 6  },
}
/** Dùng khi model không có trong bảng — lấy mức terra cho khỏi ước quá thấp. */
const FALLBACK_PRICE = MODEL_PRICES['gpt-5.6-terra']
```

Ba quyết định trong đoạn ngắn này:

| Quyết định | Lý do |
| :---- | :---- |
| Tra bảng theo mô hình **đang cấu hình** | Đổi mô hình thì chi phí tự tính theo giá đúng, không phải sửa gì |
| Mô hình lạ thì lấy mức **trung bình**, không lấy mức rẻ nhất | Ước thấp hơn thực tế nguy hiểm hơn ước cao hơn |
| Ghi rõ đang dùng bảng dựng sẵn hay giá người quản trị đặt | Kế toán biết con số đáng tin đến đâu khi đối chiếu hoá đơn |

### 5.3 Quy đổi tiền Việt

```ts
/** Tỉ giá USD→VND để log kèm tiền Việt. Đổi qua OPENAI_USD_TO_VND. */
const DEFAULT_USD_TO_VND = 25_400
```

Ghi kèm tiền Việt để **kế toán đối chiếu được với chứng từ chi** mà không phải tự quy đổi. Đây là yêu cầu từ phía kế toán, không phải yêu cầu kỹ thuật.

---

## 6. Xử lý lỗi

| Tình huống | Cách xử lý |
| :---- | :---- |
| Một tệp tải lỗi | Ghi cảnh báo, bỏ qua tệp đó, tiếp tục với tệp còn lại |
| Tệp quá hạn giờ | Huỷ tệp đó, tiếp tục |
| Dịch vụ trả lỗi máy chủ | Thử lại theo số lần đã định |
| **Lỗi máy chủ do tệp đính kèm** | **Gọi lại KHÔNG kèm tệp** — xem 6.1 |
| Kết quả không phải JSON hợp lệ | Ghi lỗi, đánh dấu công việc lỗi, giữ nhật ký |
| Không có khoá tạo ảnh | Báo lỗi rõ ràng ở bước tạo ảnh, phần nội dung vẫn giữ |

### 6.1 Cơ chế lùi khi tệp gây lỗi

```ts
/**
 * Một lượt gọi model. Tách hàm để có thể gọi lại KHÔNG kèm file khi lần đầu
 * lỗi — một PDF hỏng/khó xử có thể khiến OpenAI trả 500, và trước đây bỏ trích
 * text nên không còn gì để lùi về ⇒ job mất trắng. Lùi về "chỉ tên" vẫn hơn
 * là không có gì.
 */
const callOnce = async (withAttachments: boolean) => { ... }
```

Đây là hệ quả trực tiếp của quyết định ở bước ③ — chuyển sang gửi thẳng tệp. Quyết định đó cải thiện chất lượng nhưng tạo ra một điểm hỏng mới: tệp hỏng làm cả lời gọi thất bại. Cơ chế lùi vá đúng điểm hỏng đó.

**Nguyên tắc rút ra:** mỗi quyết định thiết kế đều mở ra một loại hỏng mới. Phải nghĩ tới nó ngay lúc quyết định, không đợi tới lúc gặp.

---

## 7. Nhật ký quyết định kỹ thuật

### QĐ-01 — Chia trường thành hai loại

**Bối cảnh:** mô hình ngôn ngữ có xu hướng điền vào chỗ trống bằng thứ nghe hợp lý. Một mã CAS bịa ra trông y hệt mã thật.

**Phương án đã cân nhắc:**

| Phương án | Vì sao loại |
| :---- | :---- |
| Cấm mô hình sinh mọi trường kỹ thuật, chỉ sinh phần văn xuôi | Mất phần lớn giá trị — chép chỉ tiêu tay vẫn là việc tốn thời gian nhất |
| Cho sinh hết rồi người kiểm | Người kiểm không phân biệt được số bịa và số thật nếu không mở lại tài liệu gốc |
| **Chia hai loại, hai tiêu chuẩn** | **Chọn** |

**Vì sao chọn:** giữ được giá trị tự động hoá ở cả hai nhóm trường, đồng thời đặt ranh giới rõ ràng. Người duyệt biết chính xác trường nào cần đối chiếu tài liệu gốc (loại A) và trường nào chỉ cần đọc cho xuôi (loại B).

**Đánh đổi:** câu lệnh dài và phức tạp hơn nhiều. Chấp nhận.

### QĐ-02 — Gửi thẳng tệp thay vì trích chữ trước

**Vì sao:** chỉ tiêu kỹ thuật nằm trong bảng; trích chữ làm mất cấu trúc bảng.

**Đánh đổi:** tốn nhiều đơn vị hơn; tệp hỏng gây lỗi cả lời gọi. Xử lý bằng cơ chế lùi ở mục 6.1.

### QĐ-03 — Không ghi đè bằng giá trị rỗng

**Vì sao:** AI chỉ được thêm và sửa, không được xoá. Dữ liệu người nhập tay có độ tin cậy cao hơn.

**Đánh đổi:** không xoá được trường sai bằng cách chạy lại dây chuyền. Phải xoá tay. Chấp nhận — đây là hướng sai an toàn.

### QĐ-04 — Kết quả luôn ở trạng thái nháp

**Vì sao:** yêu cầu NV-05. Không có ngoại lệ, kể cả khi độ tin cậy cao.

**Đánh đổi:** vẫn tốn công người duyệt. Nhưng 10–20 phút duyệt so với 2–3,5 giờ nhập tay vẫn là cải thiện lớn.

### QĐ-05 — Cấu hình động thay vì biến môi trường

**Vì sao:** đổi mô hình là việc của người vận hành, không nên cần lập trình viên và triển khai lại.

**Đánh đổi:** khoá dịch vụ nằm trong cơ sở dữ liệu. Bù lại bằng cách siết quyền đọc chỉ còn quản trị viên, và vẫn giữ đường dùng biến môi trường cho ai không chấp nhận đánh đổi này.

Chú thích nguyên văn trong mã:

> Bảo mật: khoá lưu trong CSDL, chỉ admin đọc/sửa — đánh đổi để cấu hình được ngay trong admin. Không muốn để trong CSDL thì bỏ trống ô và đặt biến môi trường tương ứng.

### QĐ-06 — Hàng đợi chạy chung tiến trình

**Bối cảnh:** ban đầu chọn cách đơn giản nhất — hàng đợi chạy trong cùng tiến trình hệ quản trị.

**Hậu quả đã xảy ra:** môi trường chạy đơn luồng, nên bóc tách PDF chặn mọi lời gọi khác. Triệu chứng thấy được: tin nhắn chat của khách bị dồn cục.

**Trạng thái:** **chưa xử lý gốc.** Đã ghi mốc thời gian ở khâu chat để chẩn đoán nhanh. Hướng xử lý là tách sang tiến trình riêng — nằm trong danh sách việc còn lại.

**Ghi lại vì:** đây là quyết định **sai** đã được nhận diện. Hồ sơ ghi cả quyết định sai, không chỉ quyết định đúng.

### QĐ-07 — Độ ngẫu nhiên thấp

**Vì sao:** đây là việc trích xuất, không phải sáng tác. Độ ngẫu nhiên cao làm mô hình "sáng tạo" — mà sáng tạo chính là thứ không được phép với trường loại A.

---

## 8. Điểm tiếp giáp

| Hệ thống | Chiều | Giao thức | Dùng để |
| :---- | :---- | :---- | :---- |
| Google Drive | Ra | Google Drive API, tài khoản dịch vụ | Đọc kho tài liệu |
| OpenRouter | Ra | HTTPS, giao thức tương thích OpenAI | Sinh nội dung, đọc ảnh |
| OpenAI | Ra | HTTPS | Sinh nội dung, đọc ảnh, **tạo ảnh** |
| Mistral | Ra | HTTPS | Nhận dạng chữ trong trang scan |
| Cơ sở dữ liệu DA1 | Hai chiều | Qua lớp lưu trữ của hệ quản trị | Đọc nguyên liệu, ghi kết quả |

**Về tài khoản dịch vụ Google:** dùng tài khoản dịch vụ thay vì tài khoản người dùng, vì dây chuyền chạy nền không có ai đăng nhập. Tệp chứng thực đặt ngoài kho mã nguồn, nạp qua biến môi trường.

---

## 9. Khả năng mở rộng

| Tình huống | Cách xử lý đã thiết kế |
| :---- | :---- |
| Thêm trường mới vào hồ sơ nguyên liệu | Bổ sung vào hợp đồng dữ liệu, câu lệnh, và lớp chuẩn hoá — ba chỗ |
| Đổi nhà cung cấp AI | Đổi trên giao diện, không sửa mã |
| Thêm loại tệp mới | Bổ sung vào bộ nhận loại và bộ bóc tách |
| Áp dụng cho nhóm dữ liệu khác ngoài nguyên liệu | **Cần sửa mã** — hợp đồng dữ liệu hiện gắn chặt với nguyên liệu |
| Lượng nguyên liệu tăng mạnh | Tách hàng đợi sang tiến trình riêng — xem QĐ-06 |

Dòng thứ tư là hạn chế đã biết của thiết kế hiện tại: dây chuyền chuyên cho nguyên liệu, chưa tổng quát hoá. Đây là lựa chọn có chủ ý — tổng quát hoá sớm khi mới có một trường hợp dùng thường tạo ra lớp trừu tượng sai.
