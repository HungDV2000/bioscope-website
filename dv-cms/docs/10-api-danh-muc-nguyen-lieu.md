# API DANH MỤC NGUYÊN LIỆU — tài liệu cho bên tích hợp

> Dành cho hệ thống bên ngoài (chatbot Telegram, ứng dụng nội bộ…) đọc danh mục
> nguyên liệu Bioscope. **Chỉ đọc** — không có endpoint ghi.

---

## 1. Lấy khoá

Khoá do quản trị viên Bioscope cấp trong **Admin → Hệ thống → Khoá API tích hợp**:
tạo bản ghi mới → đặt tên bên sử dụng → **Lưu** → bấm **🔑 Phát khoá mới**.

Khoá hiện **đúng một lần**. Hệ thống chỉ lưu bản băm nên **không xem lại được** —
mất thì phát khoá mới (khoá cũ mất hiệu lực ngay lập tức).

**Bảo quản khoá**
- Đặt trong Script Properties / biến môi trường — **không** hardcode vào code, không dán vào tài liệu dùng chung.
- Không ghi khoá ra log.
- Mỗi hệ thống dùng **một khoá riêng** để thu hồi độc lập khi cần.

---

## 2. Gọi API

Địa chỉ gốc: `https://admin.bioscope.vn/api/catalog`

Mọi lượt gọi phải kèm header:

```
x-api-key: bsk_xxxxxxxxxxxxxxxxxxxx
```

> Khoá **chỉ nhận qua header**, không nhận qua query string — query string bị ghi
> lại trong log máy chủ và lịch sử trình duyệt.

**Tham số dùng chung**

| Tham số | Giá trị | Mặc định |
|---|---|---|
| `locale` | `vi` \| `en` | `vi` |
| `format` | bỏ trống = JSON, `text` = văn bản gọn cho AI | JSON |

---

## 3. Bốn endpoint

### 3.1 `GET /catalog/manifest` — kiểm tra có gì mới

Rất nhẹ, gọi trước khi đồng bộ để khỏi kéo dữ liệu thừa.

```json
{ "ok": true, "total": 412, "lastUpdatedAt": "2026-08-14T09:12:33.120Z", "pageSizeMax": 100 }
```

### 3.2 `GET /catalog/search?q=...` — tìm theo câu hỏi ⭐

**Đây là endpoint chatbot nên dùng.** Trả về đúng vài nguyên liệu liên quan tới
câu hỏi thay vì cả kho.

| Tham số | Ý nghĩa |
|---|---|
| `q` | Câu hỏi hoặc từ khoá (bắt buộc, ≤ 200 ký tự) |
| `limit` | Số kết quả, tối đa 25 (mặc định 8) |

Tìm đồng thời trong: tên, phụ đề, INCI, thương hiệu **và tên thẻ phân loại**
(công dụng, danh mục chính, bản chất, dạng bào chế, đặc tính kỹ thuật) — nên câu
hỏi kiểu *"kháng viêm"*, *"tan trong dầu"* vẫn ra kết quả dù chữ đó không nằm
trong tên nguyên liệu.

```
GET /catalog/search?q=kháng viêm&limit=5&format=text
```

### 3.3 `GET /catalog/ingredients` — toàn bộ danh mục (đồng bộ)

| Tham số | Ý nghĩa |
|---|---|
| `page` | Trang, bắt đầu từ 1 |
| `limit` | Tối đa 100/lượt |
| `updatedSince` | ISO date — chỉ lấy bản ghi đã đổi từ mốc này (đồng bộ tăng dần) |

```json
{ "ok": true, "total": 412, "page": 1, "totalPages": 5, "hasNextPage": true, "items": [ ... ] }
```

### 3.4 `GET /catalog/ingredients/{slug}` — chi tiết một nguyên liệu

---

## 4. Dữ liệu trả về

```jsonc
{
  "slug": "curcumin-95",
  "name": "Curcumin 95%",
  "subtitle": "Chiết xuất nghệ vàng",
  "inci": "Curcuma Longa (Turmeric) Root Extract",
  "category": "Chiết xuất thực vật",
  "primaryCategories": ["Chiết xuất thực vật"],
  "functions": ["Miễn dịch", "Tiêu hoá"],
  "natures": ["Chiết xuất thực vật"],
  "forms": ["Bột"],
  "properties": ["Tan trong dầu"],
  "description": "Curcumin là hoạt chất chính trong nghệ vàng… (mô tả đầy đủ, dạng văn bản thuần)",
  "benefits": ["Chống oxy hoá", "Hỗ trợ tiêu hoá"],
  "applications": ["Viên nang", "Thực phẩm chức năng"],
  "suggestedDosage": "500 mg/ngày",
  "originCountry": "IN",
  "brandName": "…",
  "moq": "25 kg",
  "badges": ["Halal", "Non-GMO"],
  "technologies": ["Vi bao"],
  "specs": [{ "label": "Độ ẩm", "value": "≤ 5", "unit": "%" }],
  "technical": {
    "casNumber": "458-37-7", "hsCode": "…", "eNumber": null,
    "assay": "95% curcuminoids", "standardization": "HPLC",
    "appearance": "Bột màu vàng cam", "solubility": "Tan trong dầu",
    "particleSize": "80 mesh", "shelfLife": "24 tháng",
    "storage": "2–8°C, tránh ánh sáng", "packaging": "25 kg/thùng"
  },
  "image": "https://…", "gallery": ["https://…"],
  "url": "https://bioscope.vn/nguyen-lieu/curcumin-95",
  "updatedAt": "2026-08-14T09:12:33.120Z"
}
```

### ❌ KHÔNG có trong API

| Dữ liệu | Lý do |
|---|---|
| **Bảng giá, điều khoản báo giá** | Thông tin thương mại. **Mặc định TẮT.** Quản trị viên Bioscope bật riêng cho từng khoá (ô "Cho phép lấy bảng giá") nếu ban kinh doanh đồng ý. Khi bật, mỗi nguyên liệu có thêm trường `pricing` gồm `tiers` (MOQ – giá – đơn vị), `currency`, `quoteDate`, `terms` |
| **Tài liệu B2B (COA/SDS/TDS)** | Chỉ mở cho đối tác đã được duyệt, qua cổng đối tác |
| **Nội dung bản nháp** | API chỉ trả nội dung đã xuất bản |

Đây là ranh giới cố định ở tầng máy chủ, không phụ thuộc bên gọi truyền tham số gì.

---

## 5. Giới hạn & mã lỗi

| Mã | Nghĩa | Xử lý |
|---|---|---|
| `401` | Thiếu hoặc sai khoá / khoá đã bị thu hồi | Liên hệ Bioscope cấp lại |
| `429` | Vượt giới hạn lượt gọi mỗi phút | Chờ rồi thử lại; nên có cache phía bên gọi |
| `500` | Lỗi máy chủ | Thử lại sau |

Giới hạn mặc định **60 lượt/phút mỗi khoá**, điều chỉnh được theo thoả thuận.
Mỗi lượt lấy tối đa **100 bản ghi** — muốn lấy hết phải phân trang.

---

## 6. Code mẫu Google Apps Script

Dán vào project Apps Script. Đặt khoá ở **Script Properties** với key `BIOSCOPE_API_KEY`.

```javascript
const BIO_API = 'https://admin.bioscope.vn/api/catalog';

function bioFetch_(path) {
  const res = UrlFetchApp.fetch(BIO_API + path, {
    method: 'get',
    headers: { 'x-api-key': PropertiesService.getScriptProperties().getProperty('BIOSCOPE_API_KEY') },
    muteHttpExceptions: true
  });
  const code = res.getResponseCode();
  if (code === 429) { Utilities.sleep(2000); return bioFetch_(path); }  // vượt giới hạn → chờ rồi thử lại
  if (code !== 200) throw new Error('Bioscope API ' + code + ': ' + res.getContentText().slice(0, 200));
  return JSON.parse(res.getContentText());
}

/**
 * CHẾ ĐỘ A — lấy ngữ cảnh cho AI theo ĐÚNG câu hỏi.
 * Đây là cách nên dùng: ngữ cảnh nhỏ, rẻ, và không bỏ sót do cắt bớt dữ liệu.
 */
function bioContextForQuestion_(question) {
  const r = bioFetch_('/search?format=text&limit=6&q=' + encodeURIComponent(question));
  if (!r.count) return '';
  return 'DANH MỤC NGUYÊN LIỆU BIOSCOPE (liên quan tới câu hỏi):\n\n' + r.text;
}

// Ghép vào hàm hỏi AI sẵn có:
function insAsk_(chatId, u, question) {
  const context = bioContextForQuestion_(question);
  const system = 'Bạn là trợ lý Bioscope. CHỈ trả lời dựa trên dữ liệu được cung cấp. ' +
                 'Không bịa thông số. Không có dữ liệu thì nói rõ là chưa có. ' +
                 'Bioscope KHÔNG cung cấp giá qua kênh này — hỏi giá thì mời khách liên hệ đội kinh doanh.';
  const answer = callAiBioscope_(system, context + '\n\nCÂU HỎI: ' + question);
  biosSendReply_(chatId, answer);
}

/**
 * CHẾ ĐỘ B — đồng bộ danh mục về Sheet (đặt trigger 6–12 giờ/lần).
 * Chỉ kéo phần đã thay đổi kể từ lần đồng bộ trước.
 */
function bioSyncCatalog_() {
  const props = PropertiesService.getScriptProperties();
  const since = props.getProperty('BIO_LAST_SYNC') || '';
  const sh = ensureSheet_(opsSheetId_(), 'Bioscope_Catalog',
    ['slug', 'tên', 'danh mục', 'công dụng', 'dạng', 'lợi ích', 'INCI', 'hàm lượng', 'xuất xứ', 'MOQ', 'link', 'cập nhật']);

  let page = 1, total = 0;
  while (page <= 50) {                                   // chặn vòng lặp vô hạn
    const r = bioFetch_('/ingredients?limit=100&page=' + page + (since ? '&updatedSince=' + encodeURIComponent(since) : ''));
    (r.items || []).forEach(function (i) {
      sh.appendRow([i.slug, i.name, i.category || '', (i.functions || []).join(', '),
        (i.forms || []).join(', '), (i.benefits || []).join(', '), i.inci || '',
        (i.technical && i.technical.assay) || '', i.originCountry || '', i.moq || '', i.url, i.updatedAt]);
      total++;
    });
    if (!r.hasNextPage) break;
    page++;
  }
  props.setProperty('BIO_LAST_SYNC', new Date().toISOString());
  Logger.log('Đã đồng bộ ' + total + ' nguyên liệu');
}
```

> **Lưu ý về khoá:** `bioFetch_` đọc khoá từ Script Properties mỗi lượt gọi và
> không bao giờ ghi khoá ra `Logger`. Giữ nguyên cách này khi mở rộng code.

---

## 7. Khuyến nghị vận hành cho bên tích hợp

1. **Ưu tiên chế độ A** (`/search`) cho chatbot — ngữ cảnh nhỏ, chi phí AI thấp hơn nhiều, và tránh được lỗi trả lời thiếu do cắt dữ liệu theo số dòng.
2. **Cache 5–10 phút** cho các câu hỏi lặp lại để đỡ chạm giới hạn tần suất.
3. **Nhắc AI không bịa**: dùng system prompt như ví dụ trên — chỉ trả lời dựa trên dữ liệu được cấp.
4. **Câu hỏi về giá**: API không có giá; hướng khách sang đội kinh doanh Bioscope.
5. **Thu hồi khoá ngay** nếu nghi ngờ rò rỉ — báo Bioscope, khoá mới cấp trong vài phút.
