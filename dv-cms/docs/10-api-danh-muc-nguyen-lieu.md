# API DỮ LIỆU BIOSCOPE — tài liệu tích hợp

> **Đọc hết trước khi viết code.** Tài liệu này đủ để tự tích hợp mà không cần
> hỏi thêm: sơ đồ dữ liệu đầy đủ, mã lỗi, code chạy được, và các ràng buộc bắt
> buộc tuân thủ khi cho AI trả lời khách.
>
> **Chỉ đọc.** Không có endpoint ghi. Không có dữ liệu cá nhân.

API gồm **ba nhóm**:

| Nhóm | Nội dung | Mục |
|---|---|---|
| **Nguyên liệu** | ~1.600 nguyên liệu, thông số kỹ thuật, INCI, MOQ… | §4 |
| **Nội dung website** | FAQ, dịch vụ, dự án, công nghệ, chứng nhận, bài viết, trang | §6 |
| **Thông tin công ty** | Địa chỉ, điện thoại, email, MST, mạng xã hội | §7 |

---

## 0. TÓM TẮT CHO NGƯỜI TÍCH HỢP

| Việc cần làm | Ở mục |
|---|---|
| Lấy khoá và cất đúng chỗ | §1 |
| Gọi thử một lệnh cho chắc | §2 |
| Chọn 1 trong 2 kiểu tích hợp | §3 |
| Nguyên liệu: 4 endpoint + sơ đồ dữ liệu | §4–5 |
| Nội dung website: 9 loại nội dung | §6 |
| Thông tin công ty | §7 |
| Copy code chạy được | §9 |
| Ràng buộc BẮT BUỘC khi cho AI trả lời khách | §10 |

**Khuyến nghị cho chatbot tư vấn:** gọi **song song** `/catalog/search` (nguyên
liệu) và `/catalog/content/faqs` (câu hỏi thường gặp) rồi ghép cả hai vào ngữ
cảnh. Đừng kéo cả kho rồi nhồi vào mô hình — vừa tốn token vừa dễ trả lời thiếu.

> **Chatbot hỏi gì thì lấy ở đâu**
>
> | Khách hỏi | Endpoint |
> |---|---|
> | "Có nguyên liệu nào kháng viêm?" | `/catalog/search?q=` |
> | "Đặt tối thiểu bao nhiêu?", "Có mẫu thử không?" | `/catalog/content/faqs` |
> | "Bioscope làm được gì cho tôi?" | `/catalog/content/services` |
> | "Đã làm cho thương hiệu nào?" | `/catalog/content/case-studies` |
> | "Công nghệ gì?", "Có chứng nhận gì?" | `/catalog/content/technologies`, `/certifications` |
> | "Địa chỉ ở đâu?", "Gọi số nào?" | `/catalog/site` |

---

## 1. KHOÁ API

Quản trị viên Bioscope cấp trong **Admin → Hệ thống → Khoá API tích hợp**. Khoá
dạng `bsk_...`, **hiện đúng một lần** khi phát; hệ thống chỉ lưu bản băm nên
không xem lại được. Mất thì xin cấp lại (khoá cũ vô hiệu ngay).

### Quyền của mỗi khoá

Bioscope đặt riêng cho từng khoá, đổi bất kỳ lúc nào không cần triển khai lại:

| Mục | Ý nghĩa |
|---|---|
| Đang hiệu lực | Bỏ tick = khoá ngừng hoạt động ngay |
| Endpoint được phép | 5 quyền, xem bảng dưới. Không chọn gì = không gọi được gì |
| Hết hạn | Bỏ trống = không hết hạn |
| Lượt gọi mỗi phút | Mặc định 60 |
| Cho phép lấy bảng giá | **Mặc định TẮT** — xem §5 |

### Năm quyền

| Quyền | Mở endpoint | Cần khi |
|---|---|---|
| `Tìm kiếm` | `/catalog/search` | Chatbot hỏi–đáp về nguyên liệu |
| `Danh sách & đồng bộ` | `/catalog/ingredients` | Kéo cả kho nguyên liệu về |
| `Chi tiết` | `/catalog/ingredients/{slug}` | Tra một nguyên liệu cụ thể |
| `Nội dung website` | `/catalog/content/*` | FAQ, dịch vụ, dự án, công nghệ… |
| `Thông tin công ty` | `/catalog/site` | Trả lời địa chỉ / số điện thoại |

> **Xin ít quyền nhất có thể.** Chatbot tư vấn thường chỉ cần `Tìm kiếm` +
> `Nội dung website` + `Thông tin công ty`.
>
> Khoá phát **trước** khi có API nội dung sẽ **không** tự có hai quyền cuối —
> phải vào tick thêm. Đây là chủ ý: không tự nới quyền cho khoá đã phát.

### Cất khoá

- Đặt trong Script Properties / biến môi trường / trình quản lý bí mật.
- **Không** hardcode vào mã nguồn, **không** ghi ra log, **không** dán vào tài liệu dùng chung, **không** để lộ ra phía trình duyệt.

---

## 2. GỌI THỬ

Địa chỉ gốc: `https://admin.bioscope.vn/api/catalog`

```bash
curl -s -H "x-api-key: bsk_..." https://admin.bioscope.vn/api/catalog/manifest
```

```json
{ "ok": true, "total": 1604, "lastUpdatedAt": "2026-08-17T09:12:33.120Z", "pageSizeMax": 100 }
```

**Khoá chỉ nhận qua header `x-api-key`.** Không nhận qua query string — query
string bị ghi vào log máy chủ và lịch sử trình duyệt.

Tham số dùng chung cho mọi endpoint:

| Tham số | Giá trị | Mặc định |
|---|---|---|
| `locale` | `vi` \| `en` | `vi` |
| `format` | *(bỏ trống)* = JSON · `text` = văn bản gọn cho AI | JSON |

---

## 3. HAI KIỂU TÍCH HỢP

### Kiểu A — Tìm theo câu hỏi ⭐ *(nên dùng cho chatbot)*

Khách hỏi → gọi `/search` với chính câu hỏi → nhận 5–8 nguyên liệu liên quan →
chỉ đưa từng đó cho mô hình.

Ưu điểm: ngữ cảnh nhỏ nên rẻ, dữ liệu luôn mới, và **không bao giờ trả lời thiếu
do cắt bớt dữ liệu theo số dòng**.

### Kiểu B — Đồng bộ định kỳ

Chạy định kỳ 6–12 giờ, kéo phần thay đổi (`updatedSince`) về kho dữ liệu của bên
tích hợp. Dùng khi cần chạy được cả lúc mạng tới Bioscope trục trặc.

**Dùng cả hai cũng được:** A cho câu hỏi thường, B làm bản dự phòng.

---

## 4. NGUYÊN LIỆU — BỐN ENDPOINT

### 4.1 `GET /catalog/manifest`
Không cần quyền riêng. Trả `{ ok, total, lastUpdatedAt, pageSizeMax }`.
Gọi trước khi đồng bộ để biết có gì mới không.

### 4.2 `GET /catalog/search` — cần quyền `Tìm kiếm`

| Tham số | Bắt buộc | Ý nghĩa |
|---|---|---|
| `q` | ✅ | Câu hỏi hoặc từ khoá, ≤ 200 ký tự |
| `limit` | | Số kết quả, tối đa 25, mặc định 8 |

Tìm trong **tên, phụ đề, INCI, thương hiệu** và **tên thẻ phân loại** (công dụng,
danh mục chính, bản chất, dạng bào chế, đặc tính kỹ thuật). Nhờ tra thẻ phân loại
nên câu hỏi kiểu *"kháng viêm"*, *"tan trong dầu"* vẫn ra kết quả dù chữ đó không
nằm trong tên nguyên liệu.

Trả `{ ok, total, count, items[] }` — hoặc `{ ok, total, count, text }` khi `format=text`.

> `count` = số bản ghi trả về lần này; `total` = tổng số khớp.
> **`count = 0` là chuyện bình thường** — xử lý theo §10.

### 4.3 `GET /catalog/ingredients` — cần quyền `Danh sách & đồng bộ`

| Tham số | Ý nghĩa |
|---|---|
| `page` | Trang, từ 1 |
| `limit` | Tối đa **100**/lượt |
| `updatedSince` | Chuỗi ISO 8601 — chỉ lấy bản ghi đổi từ mốc này |

Trả `{ ok, total, page, totalPages, hasNextPage, items[] }`.
Lặp trang **cho tới khi `hasNextPage = false`**, và luôn đặt trần số vòng lặp.

### 4.4 `GET /catalog/ingredients/{slug}` — cần quyền `Chi tiết`

Trả `{ ok, item }`. Không tìm thấy → `404` `{ ok: false, error }`.

---

## 5. NGUYÊN LIỆU — SƠ ĐỒ DỮ LIỆU

Trường có dấu `?` **có thể vắng mặt hoặc rỗng** — code phải chịu được điều đó.

| Trường | Kiểu | Ý nghĩa |
|---|---|---|
| `slug` | string | Định danh, dùng gọi endpoint chi tiết |
| `name` | string | Tên nguyên liệu |
| `subtitle` ? | string | Mô tả ngắn một dòng |
| `description` ? | string | **Mô tả đầy đủ**, văn bản thuần (đã bỏ HTML), tối đa 4.000 ký tự |
| `inci` ? | string | Tên INCI |
| `category` ? | string | Danh mục |
| `primaryCategories` | string[] | Danh mục chính |
| `functions` | string[] | Công dụng — *Miễn dịch, Tim mạch…* |
| `natures` | string[] | Bản chất — *Chiết xuất thực vật, Vitamin…* |
| `forms` | string[] | Dạng bào chế — *Bột, Dầu…* |
| `properties` | string[] | Đặc tính — *Tan trong nước, Chịu nhiệt…* |
| `benefits` | string[] | Lợi ích |
| `applications` | string[] | Ứng dụng |
| `suggestedDosage` ? | string | Liều dùng gợi ý |
| `originCountry` ? | string | Mã quốc gia 2 ký tự (`IN`, `JP`…) |
| `brandName` ? | string | Thương hiệu |
| `moq` ? | string | Số lượng đặt tối thiểu, dạng chữ |
| `badges` | string[] | Chứng nhận — *Halal, Non-GMO…* |
| `technologies` | string[] | Công nghệ áp dụng |
| `specs` | `{label?, value?, unit?}[]` | Bảng thông số |
| `technical` | object | Hồ sơ kỹ thuật, **mọi khoá con đều tuỳ chọn**: `casNumber`, `hsCode`, `eNumber`, `assay`, `standardization`, `appearance`, `solubility`, `particleSize`, `shelfLife`, `storage`, `packaging` |
| `image` ? | string | URL ảnh đại diện |
| `gallery` | string[] | URL các ảnh khác |
| `url` | string | Trang nguyên liệu trên bioscope.vn |
| `updatedAt` | string | ISO 8601 |
| `pricing` ? | object | **Chỉ xuất hiện khi khoá được bật quyền xem giá.** Gồm `currency?`, `quoteDate?`, `terms?`, `tiers[] {moq?, price?, unit?, note?}` |

### ❌ Không bao giờ có trong API

| Dữ liệu | Lý do |
|---|---|
| **Bảng giá** | Mặc định TẮT. Chỉ có khi Bioscope bật riêng cho khoá đó |
| **Tài liệu B2B** (COA/SDS/TDS) | Chỉ mở cho đối tác đã duyệt, qua cổng đối tác |
| **Nội dung bản nháp** | API chỉ trả nội dung đã xuất bản |

Ranh giới này nằm ở tầng máy chủ, **không phụ thuộc tham số bên gọi truyền lên**.

---

## 6. NỘI DUNG WEBSITE — `/catalog/content/*`

Cần quyền `Nội dung website`. Đây là phần **ngoài nguyên liệu**: FAQ, dịch vụ,
dự án, công nghệ, chứng nhận, bài viết, trang.

### 6.1 Ba endpoint

| Endpoint | Trả về |
|---|---|
| `GET /catalog/content` | Danh sách các loại nội dung đang mở |
| `GET /catalog/content/{type}` | Danh sách bản ghi của một loại |
| `GET /catalog/content/{type}/{key}` | Chi tiết một bản ghi |

`{key}` nhận **slug hoặc id** — loại nào không có slug thì dùng id, không phải nhớ.

Tham số cho endpoint danh sách:

| Tham số | Ý nghĩa |
|---|---|
| `q` | Lọc theo từ khoá (chỉ vài trường chính của loại đó) |
| `page` / `limit` | Phân trang, `limit` tối đa **100**, mặc định 25 |
| `updatedSince` | ISO 8601 — chỉ lấy bản ghi đổi từ mốc này |
| `locale` / `format` | Như §2 |

Trả `{ ok, type, total, page, totalPages, hasNextPage, count, items[] }`.

**Gọi `/catalog/content` trước** thay vì hardcode danh sách loại — Bioscope có
thể mở thêm loại mới mà không báo trước, và code đọc từ đây sẽ tự có.

### 6.2 Chín loại nội dung

| `type` | Nội dung | Trường chính |
|---|---|---|
| `faqs` | Câu hỏi thường gặp ⭐ | `question`, `answer`, `category` |
| `services` | Dịch vụ | `title`, `slug`, `forWho`, `summary`, `description`, `receive[]`, `idealFor[]`, `expectedOutcomes[]`, `features[]`, `process[{step,desc}]`, `faq[{q,a}]` |
| `case-studies` | Dự án tiêu biểu | `brand`, `slug`, `partner`, `industry`, `summary`, `kpi`, `kpiLabel`, `problem`, `solution`, `results[]`, `coCreateSteps[]`, `testimonial`, `tags[]`, `featured` |
| `technologies` | Công nghệ | `name`, `slug`, `tagline`, `description`, `mechanism` |
| `certifications` | Chứng nhận & năng lực | `title`, `kind`, `value`, `suffix` |
| `posts` | Bài viết / blog | `title`, `slug`, `excerpt`, `content`, `categories[]`, `tags[]`, `publishedAt` |
| `pages` | Trang nội dung | `title`, `slug`, `body` |
| `ingredient-categories` | Danh mục nguyên liệu | `name`, `slug` |
| `partners` | Đối tác | `name`, `country`, `website` |

Mọi bản ghi đều có `id`, `updatedAt`, và `url` (nếu loại đó có trang riêng trên
website). Trường không có dữ liệu thì **bị bỏ hẳn khỏi JSON**, không trả `null` —
code phải chịu được trường vắng mặt.

`description`, `mechanism`, `content`, `body` là **văn bản thuần** (đã bỏ HTML và
cấu trúc block), cắt ở 4.000–6.000 ký tự.

### 6.3 Ví dụ

```bash
curl -s -H "x-api-key: bsk_..." \
  "https://admin.bioscope.vn/api/catalog/content/faqs?format=text"
```

```
### Bioscope có hỗ trợ đặt hàng số lượng nhỏ không?
Nhóm: support
Có. MOQ tuỳ từng nguyên liệu, liên hệ đội kinh doanh để được tư vấn.
```

```bash
curl -s -H "x-api-key: bsk_..." \
  "https://admin.bioscope.vn/api/catalog/content/services?format=text"
```

```
### Phát triển công thức
Dành cho: Thương hiệu muốn ra sản phẩm mới
Tóm tắt: Đồng hành từ ý tưởng tới công thức hoàn chỉnh.
Bạn nhận được: Công thức mẫu, Hồ sơ kỹ thuật
Phù hợp với: Startup TPCN
Quy trình: Khảo sát — Làm rõ mục tiêu sản phẩm
Link: https://bioscope.vn/dich-vu/phat-trien-cong-thuc
```

### 6.4 ❌ Những gì API KHÔNG BAO GIỜ trả về

CMS Bioscope có khoảng 35 nhóm dữ liệu; API chỉ mở **9 nhóm nội dung đã xuất
bản** ở trên. Các nhóm sau **không có đường nào ra API**, kể cả khi khoá được cấp
đủ mọi quyền:

| Nhóm | Vì sao |
|---|---|
| Tài khoản thành viên, tài khoản nhân viên | Dữ liệu cá nhân |
| Lịch sử chat, tin nhắn | Dữ liệu cá nhân của khách |
| Form khách gửi về | Dữ liệu cá nhân |
| Log đồng ý cookie | Dữ liệu cá nhân |
| Nhật ký bảo mật, IP bị chặn, nhật ký thao tác | Dữ liệu an ninh |
| Khoá API | Bí mật hệ thống |
| Tài liệu B2B (COA/SDS/TDS) | Chỉ mở cho đối tác đã duyệt |
| Job đồng bộ / job AI / quét trùng | Dữ liệu vận hành nội bộ |
| **Bản nháp chưa xuất bản** | Chưa được duyệt công bố |

Đây là **danh sách trắng ở tầng máy chủ**: loại nào không nằm trong `/catalog/content`
thì trả `404`, không phụ thuộc tham số bên gọi truyền lên. Gọi
`/catalog/content/members` sẽ nhận `404`, không phải `403` — vì với API, nhóm đó
đơn giản là không tồn tại.

---

## 7. THÔNG TIN CÔNG TY — `/catalog/site`

Cần quyền `Thông tin công ty`. Dùng khi khách hỏi *"địa chỉ ở đâu"*, *"gọi số nào"*,
*"mã số thuế bao nhiêu"*.

```bash
curl -s -H "x-api-key: bsk_..." https://admin.bioscope.vn/api/catalog/site
```

```json
{
  "ok": true,
  "site": {
    "siteName": "Bioscope",
    "companyName": "Công ty CP Bioscope Việt Nam",
    "tagline": "…",
    "taxCode": "0301234567",
    "phone": "028 1234 5678",
    "email": "info@bioscope.vn",
    "address": "Quận 1, TP.HCM",
    "officeAddress": "…",
    "website": "https://bioscope.vn",
    "social": [{ "platform": "facebook", "url": "https://…" }]
  }
}
```

Mọi trường đều có thể vắng mặt nếu Bioscope chưa điền.

Endpoint này **chỉ trả các ô liên hệ công khai**. Cấu hình website còn chứa mã đo
lường GA4 / Google Tag Manager / Meta Pixel và các cờ bật/tắt tính năng — những
thứ đó **không** nằm trong phản hồi.

Dữ liệu này gần như không đổi → **cache 12–24 giờ**, đừng gọi mỗi lượt chat.

---

## 8. DẠNG `format=text` — dành riêng cho ngữ cảnh AI

Nhẹ hơn JSON khoảng một nửa. Đưa thẳng vào prompt, không cần xử lý gì thêm.
Dùng được cho **mọi** endpoint: nguyên liệu (§4), nội dung (§6), công ty (§7).

```
### Curcumin 95% — Chiết xuất nghệ vàng
Danh mục: Chiết xuất thực vật
Công dụng: Miễn dịch, Tiêu hoá
Bản chất: Chiết xuất thực vật
Dạng: Bột
Đặc tính: Tan trong dầu
Lợi ích: Chống oxy hoá, Hỗ trợ tiêu hoá
Ứng dụng: Viên nang, Thực phẩm chức năng
INCI: Curcuma Longa Root Extract
Kỹ thuật: CAS 458-37-7 · hàm lượng 95% curcuminoids · chuẩn hoá HPLC · Bột vàng cam · độ tan Tan trong dầu · hạn 24 tháng · 2–8°C tránh ánh sáng · 25 kg/thùng
Liều gợi ý: 500 mg/ngày
Xuất xứ: IN
MOQ: 25 kg
Chứng nhận: Halal, Non-GMO
Công nghệ: Vi bao
Thông số: Độ ẩm ≤ 5 %
Mô tả: Curcumin là hoạt chất chính trong nghệ vàng…
Link: https://bioscope.vn/nguyen-lieu/curcumin-95
```

Mỗi nguyên liệu là một khối bắt đầu bằng `###`, các khối cách nhau một dòng trống.
Dòng nào không có dữ liệu thì **bị bỏ hẳn**, không in nhãn rỗng.

---

## 9. CODE CHẠY ĐƯỢC

### 9.1 Google Apps Script — độc lập, không phụ thuộc khung nào

Dán nguyên khối. Đặt khoá ở **Script Properties** với key `BIOSCOPE_API_KEY`.

```javascript
const BIO_API = 'https://admin.bioscope.vn/api/catalog';

/**
 * Gọi API Bioscope. Thử lại có GIỚI HẠN khi bị 429.
 * KHÔNG dùng đệ quy không chặn: Apps Script có trần 6 phút, thử lại vô hạn sẽ
 * giết cả luồng xử lý chứ không chỉ hỏng một lượt gọi.
 */
function bioFetch_(path, tries) {
  tries = tries || 0;
  const key = PropertiesService.getScriptProperties().getProperty('BIOSCOPE_API_KEY');
  if (!key) throw new Error('Thiếu BIOSCOPE_API_KEY trong Script Properties');

  const res = UrlFetchApp.fetch(BIO_API + path, {
    method: 'get',
    headers: { 'x-api-key': key },
    muteHttpExceptions: true
  });
  const code = res.getResponseCode();

  if (code === 429 && tries < 3) {          // tối đa 3 lần, chờ tăng dần
    Utilities.sleep(1000 * Math.pow(2, tries));
    return bioFetch_(path, tries + 1);
  }
  if (code !== 200) {
    // KHÔNG ghi khoá vào log.
    throw new Error('Bioscope API ' + code + ': ' + res.getContentText().slice(0, 200));
  }
  return JSON.parse(res.getContentText());
}

/** Gọi an toàn: lỗi ở một nguồn KHÔNG được làm chết cả câu trả lời. */
function bioTry_(path) {
  try { return bioFetch_(path); }
  catch (err) { console.error('bioTry_ ' + path + ': ' + err); return null; }
}

/**
 * Ngữ cảnh cho AI theo ĐÚNG câu hỏi. Trả '' khi không có gì liên quan.
 *
 * Gộp NGUYÊN LIỆU + CÂU HỎI THƯỜNG GẶP: khách hỏi "đặt tối thiểu bao nhiêu"
 * không khớp nguyên liệu nào, câu trả lời nằm bên FAQ. Chỉ tra một nguồn là
 * chatbot trả lời hụt đúng những câu thường gặp nhất.
 */
function bioContextForQuestion_(question) {
  const q = encodeURIComponent(question);
  const parts = [];

  const ing = bioTry_('/search?format=text&limit=6&q=' + q);
  if (ing && ing.count) parts.push('NGUYÊN LIỆU BIOSCOPE LIÊN QUAN:\n\n' + ing.text);

  const faq = bioTry_('/content/faqs?format=text&limit=4&q=' + q);
  if (faq && faq.count) parts.push('CÂU HỎI THƯỜNG GẶP:\n\n' + faq.text);

  return parts.join('\n\n');
}

/** Thông tin công ty — gần như không đổi, cache 12 giờ. */
function bioCompanyInfo_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get('bio_site');
  if (hit) return hit;

  const r = bioTry_('/site?format=text');
  const text = r && r.text ? r.text : '';
  if (text) cache.put('bio_site', text, 21600);   // trần của Apps Script là 6 giờ
  return text;
}
```

### 9.2 Ghép vào chatbot

> `callAi_` và `sendReply_` dưới đây là **hàm của bên tích hợp** — thay bằng hàm
> tương ứng trong hệ thống của bạn.

```javascript
function handleQuestion_(chatId, question) {
  const context = bioContextForQuestion_(question);
  const company = bioCompanyInfo_();

  let system = BIO_SYSTEM_PROMPT;
  system += context
    ? '\n\n' + context
    : '\n\nKHÔNG tìm thấy dữ liệu nào liên quan trong hệ thống Bioscope.';
  if (company) system += '\n\nTHÔNG TIN CÔNG TY:\n\n' + company;

  sendReply_(chatId, callAi_(system, question));   // ← hàm của bạn
}
```

### 9.3 Đồng bộ định kỳ (Kiểu B)

```javascript
function bioSyncCatalog_() {
  const props = PropertiesService.getScriptProperties();
  const since = props.getProperty('BIO_LAST_SYNC') || '';
  const all = [];

  for (let page = 1; page <= 50; page++) {          // trần chống lặp vô hạn
    const r = bioFetch_('/ingredients?limit=100&page=' + page +
      (since ? '&updatedSince=' + encodeURIComponent(since) : ''));
    (r.items || []).forEach(function (i) { all.push(i); });
    if (!r.hasNextPage) break;
  }

  props.setProperty('BIO_LAST_SYNC', new Date().toISOString());
  console.log('Đã đồng bộ ' + all.length + ' nguyên liệu');
  return all;                                        // ghi vào Sheet/DB của bạn
}
```

### 9.4 Node.js / Python

Cùng một giao thức HTTP, chỉ khác cú pháp:

```javascript
const r = await fetch('https://admin.bioscope.vn/api/catalog/search?format=text&limit=6&q=' +
  encodeURIComponent(question), { headers: { 'x-api-key': process.env.BIOSCOPE_API_KEY } });
const data = await r.json();
```

---

## 10. RÀNG BUỘC BẮT BUỘC KHI CHO AI TRẢ LỜI KHÁCH

Đây là **ngành dược phẩm và thực phẩm chức năng**. Mô hình bịa một con số hàm
lượng hay liều dùng là rủi ro thật cho sức khoẻ người dùng và cho uy tín Bioscope.

### 10.1 Prompt hệ thống — dùng nguyên văn

```javascript
const BIO_SYSTEM_PROMPT = [
  'Bạn là trợ lý tư vấn của Bioscope — nguyên liệu, dịch vụ và thông tin công ty.',
  '',
  'QUY TẮC BẮT BUỘC:',
  '1. CHỈ trả lời dựa trên dữ liệu được cung cấp bên dưới.',
  '2. TUYỆT ĐỐI không bịa tên nguyên liệu, hàm lượng, liều dùng, số CAS hay bất kỳ thông số nào.',
  '3. Dữ liệu không có thông tin khách hỏi → nói rõ "thông tin này chưa có trong danh mục"',
  '   và mời khách liên hệ đội kinh doanh Bioscope. KHÔNG suy đoán.',
  '4. Không có nguyên liệu nào liên quan → nói thẳng là chưa có, KHÔNG gợi ý nguyên liệu',
  '   không nằm trong dữ liệu.',
  '5. Hỏi GIÁ → Bioscope không báo giá qua kênh này, mời liên hệ đội kinh doanh.',
  '6. Hỏi về điều trị bệnh → nêu rõ đây là nguyên liệu, không phải thuốc,',
  '   và không đưa ra lời khuyên y tế.',
  '7. Luôn kèm link nguyên liệu (dòng "Link:") để khách xem chi tiết.'
].join('\n');
```

### 10.2 Bảng xử lý tình huống

| Tình huống | Phải làm | Tuyệt đối không |
|---|---|---|
| `count = 0` | Nói chưa có trong danh mục, mời liên hệ | Gợi ý nguyên liệu ngoài dữ liệu |
| Khách hỏi giá | Chuyển đội kinh doanh | Đoán giá, nói "khoảng…" |
| Thiếu một thông số | Nói chưa có thông tin đó | Suy ra từ nguyên liệu tương tự |
| API lỗi | Trả lời không kèm danh mục, hoặc báo thử lại sau | Để chatbot chết im lặng |
| Hỏi chữa bệnh | Nêu rõ là nguyên liệu, không phải thuốc | Đưa lời khuyên y tế |

---

## 11. MÃ LỖI

| Mã | Nghĩa | Xử lý |
|---|---|---|
| `200` | OK | |
| `400` | Thiếu tham số bắt buộc (vd `q`) | Sửa lời gọi |
| `401` | Thiếu/sai khoá, khoá bị thu hồi hoặc **hết hạn** | Liên hệ Bioscope cấp lại |
| `403` | Khoá **không có quyền** cho endpoint đang gọi | Xin Bioscope bật quyền tương ứng (§1) |
| `404` | Không tìm thấy `slug`/`id`, **hoặc** loại nội dung không được mở | Kiểm tra lại; gọi `/catalog/content` để xem loại nào có |
| `429` | Vượt giới hạn lượt gọi mỗi phút | Chờ tăng dần rồi thử lại, **có trần số lần** |
| `500` | Lỗi máy chủ | Thử lại sau; báo Bioscope nếu lặp lại |

Thân lỗi luôn có dạng `{ "ok": false, "error": "mô tả bằng tiếng Việt" }`.

---

## 12. DANH SÁCH KIỂM TRA TRƯỚC KHI CHẠY THẬT

- [ ] Khoá nằm trong kho bí mật, **không** có trong mã nguồn và log
- [ ] Chỉ xin những quyền thật sự dùng
- [ ] Thử lại khi `429` **có trần số lần**, không đệ quy vô hạn
- [ ] Phân trang dừng theo `hasNextPage`, có trần số vòng lặp
- [ ] Xử lý được `count = 0` mà không để AI bịa
- [ ] Mọi trường tuỳ chọn đều chịu được giá trị vắng mặt (JSON **bỏ hẳn** trường rỗng)
- [ ] Ngữ cảnh gộp **cả nguyên liệu lẫn FAQ**, không chỉ một nguồn
- [ ] Danh sách loại nội dung đọc từ `/catalog/content`, không hardcode
- [ ] `/catalog/site` có cache 12–24 giờ, không gọi mỗi lượt chat
- [ ] Prompt hệ thống dùng đúng §10.1
- [ ] Có cache 5–10 phút cho câu hỏi lặp lại
- [ ] Một nguồn lỗi không làm chết cả câu trả lời (xem `bioTry_`)
- [ ] Không ghi nội dung khách hỏi kèm khoá vào cùng một log

---

*Thắc mắc hoặc cần đổi quyền khoá: liên hệ đội kỹ thuật Bioscope.*
