<!--HOSO
phu_de: Hệ thống AI chuẩn hoá và cập nhật dữ liệu sản phẩm
pham_vi: Dự án DA2
ngay_lap: 02/07/2026
phien_ban: 1.2
nguoi_lap: Bộ phận Phát triển phần mềm — Công ty Bioscope
nguoi_duyet: Ban Giám đốc
lich_su: 1.0 | 02/07/2026 | Ban hành lần đầu
lich_su: 1.1 | 23/07/2026 | Bổ sung cấu trúc ước tính chi phí
lich_su: 1.2 | 17/08/2026 | Bổ sung bảng cấu hình nhà cung cấp AI
-->
# DA2 — CÔNG ĐOẠN 2: THIẾT KẾ DỮ LIỆU
## Hệ thống AI chuẩn hoá và cập nhật dữ liệu sản phẩm

---

## 1. Tổng quan

DA2 có **năm nhóm dữ liệu riêng** và ghi vào **một nhóm dữ liệu của DA1**.

| Nhóm dữ liệu | Thuộc | Vai trò |
| :---- | :---- | :---- |
| `ai-generate-jobs` | DA2 | Hàng đợi công việc sinh nội dung |
| `drive-sync-jobs` | DA2 | Công việc đồng bộ kho tài liệu |
| `cms-sync-runs` | DA2 | Lượt đồng bộ nội dung |
| `duplicate-scans` | DA2 | Lượt quét trùng lặp |
| `ai-settings` | DA2 | Cấu hình nhà cung cấp và mô hình |
| `ingredients` | **DA1** | DA2 **ghi vào**, không sở hữu |

---

## 2. `ai-generate-jobs` — hàng đợi công việc

Nhóm dữ liệu trung tâm của DA2. Mỗi bản ghi là **một lượt chạy dây chuyền cho một nguyên liệu**.

### 2.1 Các trường

| Trường | Kiểu | Ý nghĩa |
| :---- | :---- | :---- |
| `ingredientId` | text | Mã nguyên liệu đang xử lý |
| `ingredientName` | text | Tên nguyên liệu, để đọc danh sách cho dễ |
| `mode` | select | `full` — toàn bộ nội dung và ảnh; `image` — chỉ tạo lại ảnh |
| `status` | select | Một trong **9 trạng thái**, xem 2.2 |
| `phase` | text | Mô tả chi tiết bước đang chạy |
| `locale` | select | Ngôn ngữ ngữ cảnh: `vi` hoặc `en` |
| `totals` | json | Bộ đếm đơn vị và chi phí, xem 2.3 |
| `logs` | mảng | Nhật ký từng bước, xem 2.4 |
| `result` | json | Kết quả trả về, giữ nguyên để đối chiếu khi cần |

### 2.2 Chín trạng thái

| Trạng thái | Nghĩa | Là trạng thái cuối |
| :---- | :---- | :----: |
| `queued` | Đã xếp hàng, chưa chạy | |
| `downloading` | Đang tải tệp từ kho tài liệu | |
| `extracting` | Đang bóc tách nội dung | |
| `generating_content` | Đang sinh nội dung | |
| `generating_image` | Đang sinh ảnh | |
| `saving` | Đang ghi vào cơ sở dữ liệu | |
| `done` | Hoàn tất | ✅ |
| `error` | Lỗi | ✅ |
| `cancelled` | Người dùng huỷ | ✅ |

**Vì sao chín trạng thái chứ không phải ba (`chờ` / `đang chạy` / `xong`).**

Một công việc chạy 5–15 phút. Người dùng nhìn "đang chạy" suốt 15 phút không biết nó đang làm gì, có treo không, còn bao lâu. Chín trạng thái cho biết chính xác đang ở đâu trong dây chuyền.

Lợi ích thứ hai quan trọng hơn: **chẩn đoán sự cố**. Công việc lỗi ở `extracting` là vấn đề tệp; lỗi ở `generating_content` là vấn đề mô hình; lỗi ở `saving` là vấn đề dữ liệu hoặc cơ sở dữ liệu. Ba nguyên nhân khác nhau, ba hướng xử lý khác nhau — trạng thái nói ngay phải nhìn đâu.

### 2.3 Bộ đếm `totals`

Lưu dạng dữ liệu tự do vì cấu trúc còn thay đổi. Nội dung:

| Nhóm | Nội dung |
| :---- | :---- |
| `content` | Đơn vị vào và ra của lượt sinh nội dung |
| `vision` | Đơn vị vào và ra của lượt đọc ảnh |
| `imagePrompt` | Đơn vị vào và ra của lượt viết mô tả ảnh |
| `images` | Số ảnh đã tạo |
| `ocrPages` | Số trang đã nhận dạng chữ |
| `cost` | Kết quả ước tính: đô-la, đồng, mô hình đã tra, các đơn giá đã dùng |

Cấu trúc kết quả ước tính:

```ts
export type CostEstimate = {
  usd: number
  vnd: number
  /** true nếu đang dùng bảng giá dựng sẵn (chưa đặt OPENAI_PRICE_*). */
  usingDefaults: boolean
  /** Model được dùng để tra bảng giá. */
  model: string
  rates: { inputPer1M: number; outputPer1M: number; perImage: number; perOcrPage: number; usdToVnd: number }
}
```

**Vì sao lưu cả các đơn giá đã dùng, không chỉ lưu số tiền.** Sáu tháng sau kế toán đối chiếu hoá đơn thấy lệch, cần biết lúc đó hệ thống tính theo đơn giá nào. Chỉ lưu số tiền thì không truy được. Lưu cả đơn giá thì tính lại được.

Cờ `usingDefaults` cho kế toán biết con số đáng tin đến đâu: đang dùng bảng dựng sẵn tra tháng 07/2026, hay dùng đơn giá quản trị viên tự đặt theo hợp đồng thật.

### 2.4 Nhật ký `logs`

Mảng, mỗi phần tử một dòng:

| Trường | Kiểu | Nội dung |
| :---- | :---- | :---- |
| `ts` | text | Mốc thời gian |
| `level` | select | `info` / `warn` / `error` |
| `message` | text | Nội dung |

**Vì sao lưu nhật ký trong cơ sở dữ liệu chứ không chỉ ghi ra nhật ký máy chủ.**

| | Nhật ký máy chủ | Nhật ký trong cơ sở dữ liệu |
| :---- | :---- | :---- |
| Ai xem được | Người có quyền vào máy chủ | **Biên tập viên, ngay trên giao diện** |
| Tuổi thọ | Bị xoay vòng, mất sau vài ngày | Còn cùng bản ghi công việc |
| Gắn với công việc nào | Phải lọc theo mốc thời gian | Gắn sẵn |

Biên tập viên thấy công việc lỗi thì mở nhật ký đọc ngay, không phải nhờ bộ phận kỹ thuật. Đây là **bằng chứng kiểm thử** của DA2: mỗi lượt chạy để lại vết đầy đủ.

### 2.5 Ba mức nhật ký

| Mức | Dùng khi | Ví dụ |
| :---- | :---- | :---- |
| `info` | Bước bình thường | "Đã tải 5 tệp từ kho tài liệu" |
| `warn` | Bất thường nhưng vẫn đi tiếp được | "Tệp `COA-2024.pdf` quá hạn giờ, bỏ qua" |
| `error` | Không đi tiếp được | "Mô hình trả về dữ liệu không hợp lệ" |

Phân biệt `warn` và `error` quan trọng: `warn` nghĩa là công việc vẫn xong nhưng **kết quả có thể thiếu** — người duyệt cần biết để kiểm kỹ hơn.

---

## 3. `ai-settings` — cấu hình nhà cung cấp

Bảng cấu hình toàn cục, **chỉ quản trị viên sửa**, biên tập viên đọc được.

### 3.1 Quyền

```ts
access: { read: isAdminOrEditor, update: isAdmin },
```

Biên tập viên đọc được để biết đang dùng mô hình nào — hữu ích khi đánh giá chất lượng kết quả. Nhưng không sửa được, vì sửa là ảnh hưởng chi phí và chất lượng toàn hệ thống.

### 3.2 Cấu trúc

| Nhóm | Trường | Ý nghĩa |
| :---- | :---- | :---- |
| Gốc | `provider` | `openrouter` hoặc `openai` |
| Kết nối | `openRouterApiKey` | Khoá cổng trung gian. **Bí mật** |
| | `openAiApiKey` | Khoá OpenAI. **Bí mật** |
| | `appName` | Tên hiện trong bảng điều khiển nhà cung cấp, để đối chiếu chi phí |
| Mô hình | `contentModel` | Mô hình sinh nội dung |
| | `visionModel` | Mô hình đọc ảnh và PDF scan |
| Ảnh | `imageApiKey` | Khoá OpenAI riêng cho tạo ảnh |
| | `imagePromptModel` | Mô hình viết mô tả ảnh |
| | `imageModel` | Mô hình tạo ảnh |

### 3.3 Nguyên tắc: bỏ trống thì lấy biến môi trường

Mọi ô đều có biến môi trường tương ứng. Bỏ trống ô thì hệ thống lấy biến.

**Vì sao thiết kế hai đường.** Lưu khoá trong cơ sở dữ liệu đổi được ngay trên giao diện — tiện cho vận hành. Nhưng có tổ chức không chấp nhận để khoá trong cơ sở dữ liệu. Hai đường cho phép mỗi bên chọn cách phù hợp mà không phải sửa mã.

### 3.4 Trường `appName`

Trường nhỏ nhưng có mục đích cụ thể: nó được gửi kèm mỗi lời gọi và **hiện trong bảng điều khiển của nhà cung cấp**. Nhờ vậy kế toán đối chiếu được chi phí trên hoá đơn với hệ thống nào đã gọi — quan trọng khi công ty có nhiều hệ thống dùng chung một tài khoản.

---

## 4. Các nhóm dữ liệu vận hành khác

### 4.1 `drive-sync-jobs`

Ghi lại mỗi lượt quét kho tài liệu: quét thư mục nào, tìm được bao nhiêu tệp, đối chiếu được với bao nhiêu nguyên liệu, lỗi gì.

### 4.2 `cms-sync-runs`

Ghi lại mỗi lượt đồng bộ nội dung: nguồn, số bản ghi đã xử lý, kết quả.

### 4.3 `duplicate-scans`

Ghi lại mỗi lượt quét trùng lặp: tuỳ chọn đã dùng, các cặp nghi trùng tìm được.

Cơ sở của việc so trùng là hàm chuẩn hoá tên (`duplicate-scan/normalize.ts`, 163 dòng): bỏ dấu, đưa về chữ thường, bỏ ký tự đặc biệt, bỏ hậu tố thường gặp. Nhờ vậy `"1. Đường Erythritol - TQ(TM)"` và `"Erythritol"` được nhận là nghi trùng.

**Hệ thống chỉ nghi ngờ, không tự gộp.** Gộp hai nguyên liệu là quyết định nghiệp vụ — có khi hai tên gần giống nhau thật sự là hai sản phẩm khác nhau của hai nhà cung cấp.

---

## 5. Trường DA2 ghi vào `ingredients`

DA2 **không sở hữu** nhóm `ingredients` — nó thuộc DA1. Bảng dưới liệt kê chính xác những trường DA2 được phép ghi.

### 5.1 Trường loại A — trích xuất

| Nhóm | Trường | Ràng buộc |
| :---- | :---- | :---- |
| Chỉ tiêu | `specs[]` | Mỗi mục có nhãn, giá trị, đơn vị, kiểu hiển thị |
| Kỹ thuật | `technical.casNumber` | **Chỉ chép khi tài liệu ghi rõ** |
| | `technical.hsCode` | **Chỉ chép khi tài liệu ghi rõ** |
| | `technical.eNumber` | **Chỉ chép khi tài liệu ghi rõ** |
| | `technical.particleSize` | |
| | `technical.assay` | Song ngữ |
| | `technical.standardization` | Song ngữ |
| | `technical.appearance` | Song ngữ |
| | `technical.solubility` | Song ngữ |
| | `technical.shelfLife` | Song ngữ. **Chỉ chép từ tài liệu** |
| | `technical.storage` | Song ngữ. **Chỉ chép từ tài liệu** |
| | `technical.packaging` | Song ngữ. **Chỉ chép từ tài liệu** |
| | `technical.leadTime` | Song ngữ |
| | `technical.incompatibility` | Song ngữ |
| Pháp lý | `regulatory.status[]` | **Chỉ 4 giá trị hợp lệ**, xem 5.3 |
| | `regulatory.registrationNo` | **Chỉ chép số công bố có thật** |
| | `regulatory.usageLimit` | Song ngữ |
| Thương mại | `moq`, `brandName`, `originCountry` | |
| | `pricing.*` | Xem 5.4 |

### 5.2 Trường loại B — biên tập

| Trường | Song ngữ | Ràng buộc |
| :---- | :----: | :---- |
| `name` | ✅ | Chuẩn hoá: bỏ số thứ tự, mã nội bộ, hậu tố |
| `subtitle` | ✅ | 20–60 ký tự |
| `description` | ✅ | 250–400 từ, 2–3 đoạn |
| `benefits[]` | ✅ | 4–8 mục |
| `applications[]` | ✅ | 3–6 mục, ghi rõ dạng bào chế |
| `badges[]` | | **Chỉ chứng nhận tài liệu có nêu.** Không có → mảng rỗng |
| `suggestedDosage` | ✅ | Không rõ → bỏ trống |
| `inci` | ✅ | |
| `tag` | | 4 giá trị hoặc rỗng |
| `research.mechanism` | ✅ | |
| `seoTitle` | ✅ | ≤ 60 ký tự |
| `seoDescription` | ✅ | 120–155 ký tự |
| `imagePrompt` | ✅ | Mô tả để tạo ảnh |
| `facets.*` | | **Chỉ chọn từ danh mục có sẵn** |

> **Lưu ý về `badges`.** Trường này thuộc loại B nhưng có ràng buộc kiểu loại A: chỉ ghi chứng nhận **tài liệu có nêu**. Lý do: huy hiệu Halal, Kosher, Non-GMO, GMP là **tuyên bố về chứng nhận thật**. Gán sai là tuyên bố sai sự thật với khách hàng.

### 5.3 Trạng thái pháp lý — chỉ bốn giá trị

```ts
export type RegulatoryStatus = 'fda_gras' | 'efsa' | 'vn_moh' | 'novel_food'
```

Giá trị khác bị loại ở bước đối chiếu danh mục. Đây là trường **có hệ quả pháp lý**: khách dựa vào nó để biết nguyên liệu được phép dùng trong loại sản phẩm nào. Gán bừa là đẩy rủi ro pháp lý sang khách.

### 5.4 Bảng giá — trường nhạy cảm nhất

```ts
/** Bảng giá NỘI BỘ lấy từ file "Mô tả". Chỉ điền khi tài liệu có ghi. */
export type GeneratedPricing = {
  quoteDate?: string
  currency?: 'VND' | 'USD'
  terms?: LocalizedText
  tiers?: Array<{ moq: string; price?: number; unit?: string; note?: string }>
}
```

Ba quy tắc riêng cho bảng giá, ghi thẳng trong câu lệnh:

| Quy tắc | Lý do |
| :---- | :---- |
| Chép đúng từng con số từ dòng "MOQ ...: ...đ/kg" | Giá sai là sai nghiêm trọng |
| Bỏ dấu chấm phân cách nghìn khi ghi số | Để lưu đúng kiểu số |
| **Một tài liệu nhiều biến thể thì chỉ lấy biến thể khớp tên; không chắc thì bỏ trống** | Xem 5.5 |

Bảng giá ghi vào trường đã bị **khoá ở tầng trường** của DA1 — chỉ nhân viên đọc được, không lộ ra giao diện lập trình công khai.

### 5.5 Cạm bẫy nhiều biến thể trong một tài liệu

Trích nguyên văn câu lệnh:

> Một số file "Mô tả" liệt kê NHIỀU sản phẩm/biến thể trong cùng tài liệu (VD "Kiku Flower Extract-WSP" và "Kiku Flower Extract-P"; hay "Red Vine Pr1432" và "Pr1419"). CHỈ lấy dữ liệu của biến thể KHỚP với tên nguyên liệu đang xử lý. TUYỆT ĐỐI không trộn giá/MOQ của biến thể khác vào. **Nếu không chắc biến thể nào khớp → bỏ trống pricing.**

Quy tắc này sinh ra từ **quan sát tài liệu thật** của nhà cung cấp, có nêu đích danh ví dụ. Đây là loại tri thức không có trong bất kỳ thư viện hay dịch vụ nào — nó đến từ việc đọc hồ sơ nhà cung cấp của chính công ty.

### 5.6 Trường đồng bộ

| Trường | Ý nghĩa |
| :---- | :---- |
| `driveFiles[]` | Danh sách tệp nguồn, có tên và kiểu nội dung |
| `fileCount` | Số tệp nguồn |
| `lastDriveSyncAt` | Lần đồng bộ gần nhất |
| `needsReview` | **Cờ chờ duyệt** — bật khi AI vừa ghi |

`driveFiles` giữ danh sách tệp nguồn để **truy vết**: nội dung này sinh ra từ tài liệu nào. Khi người duyệt nghi ngờ một con số, họ mở đúng tệp đó đối chiếu.

---

## 6. Trường DA2 **không được** ghi

Liệt kê rõ để tránh mở rộng phạm vi ngoài ý muốn:

| Trường | Vì sao không |
| :---- | :---- |
| `_status` | **Luôn là nháp.** Không có đường cho AI xuất bản |
| `slug` | Đường dẫn ảnh hưởng tối ưu tìm kiếm và liên kết đã chia sẻ; đổi phải có chủ ý |
| `category` | Phân loại là quyết định nghiệp vụ |
| `partner` | Quan hệ đối tác là dữ liệu kinh doanh |
| `hiddenFromWebsite` | Quyết định hiển thị thuộc về người |
| Mọi trường của nhóm dữ liệu khác | DA2 chỉ chạm vào `ingredients` |

---

## 7. Vòng đời một bản ghi công việc

```
   Người dùng bấm "Tạo nội dung tự động"
              ↓
   ┌──────────────────────┐
   │  queued              │  Bản ghi được tạo
   └──────────┬───────────┘
              ↓
   ┌──────────────────────┐
   │  downloading         │  logs: "Đang tải N tệp"
   └──────────┬───────────┘
              ↓
   ┌──────────────────────┐
   │  extracting          │  logs: mỗi tệp một dòng
   └──────────┬───────────┘  warn nếu có tệp bỏ qua
              ↓
   ┌──────────────────────┐
   │  generating_content  │  totals.content được cập nhật
   └──────────┬───────────┘
              ↓
   ┌──────────────────────┐
   │  generating_image    │  chỉ khi mode = full và chưa có ảnh
   └──────────┬───────────┘
              ↓
   ┌──────────────────────┐
   │  saving              │  ghi vào ingredients, _status = draft
   └──────────┬───────────┘  needsReview = true
              ↓
   ┌──────────────────────┐
   │  done                │  totals.cost được tính
   └──────────────────────┘

   Bất kỳ bước nào cũng có thể sang:
     · error      — ghi nguyên nhân vào logs
     · cancelled  — người dùng huỷ
```

Ba trạng thái cuối đều **giữ nguyên bản ghi**, không xoá. Bản ghi công việc là bằng chứng: lượt chạy nào, lúc nào, tệp nào, tốn bao nhiêu, kết quả ra sao.

---

## 8. Quản lý thay đổi cấu trúc

DA2 dùng chung cơ sở dữ liệu với DA1, nên áp dụng cùng quy trình bảy bước ở `00-5` mục 5.3.

Các kịch bản chuyển đổi liên quan tới DA2 nằm chung trong `dv-cms/scripts/`, gồm phần tạo bảng hàng đợi công việc, bảng cấu hình AI, và các trường đồng bộ trên `ingredients`.

**Lưu ý riêng:** nhóm `ingredients` bật lưu bản nháp, nên mọi thay đổi trường của nó phải làm cả ở bảng phiên bản song song. Đây chính là loại sự cố đã xảy ra ở DA1 (`SC-01`).
