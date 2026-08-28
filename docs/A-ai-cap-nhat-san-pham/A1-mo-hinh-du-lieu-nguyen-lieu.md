# A1 — MÔ HÌNH DỮ LIỆU NGUYÊN LIỆU

> Nguồn: `dv-cms/packages/module-bioscope/src/collections/Ingredients.ts`
> Mọi trường dưới đây trích trực tiếp từ mã nguồn, không mô tả lại theo trí nhớ.

Collection `ingredients` — hiện có **1.557 bản ghi đã xuất bản**.

---

## 1. Quy tắc chung

### Đa ngữ

Trường đánh dấu **ĐN** lưu **hai bản riêng biệt** cho `vi` và `en`. Ghi bản
tiếng Việt không ảnh hưởng bản tiếng Anh và ngược lại. Khi ghi phải nêu rõ
đang ghi cho ngôn ngữ nào.

### Bản nháp và bản xuất bản

Collection bật chế độ bản nháp (`versions.drafts`). Mỗi bản ghi có `_status`:

| `_status` | Ý nghĩa |
|---|---|
| `draft` | Bản nháp — **không** hiện trên website, **không** ra API |
| `published` | Đã xuất bản — hiện công khai |

Ghi mới mà không nêu `_status` thì mặc định là `draft`. Đây là hành vi mong
muốn: nội dung do máy sinh ra phải qua người duyệt mới được xuất bản.

### Khoá định danh

| Trường | Vai trò |
|---|---|
| `id` | Số nguyên tự tăng, do hệ thống cấp |
| `slug` | Sinh tự động từ `name`, dùng làm địa chỉ trang. Đa ngữ |
| `externalId` | Mã tham chiếu từ nguồn ngoài. **Dùng để chống ghi trùng** — xem [A2](A2-hop-dong-ghi-du-lieu.md) |

---

## 2. Thông tin cơ bản

| Trường | Kiểu | Bắt buộc | ĐN | Ghi chú |
|---|---|:--:|:--:|---|
| `name` | text | ✅ | ✅ | Tên nguyên liệu |
| `slug` | text | tự sinh | ✅ | Sinh từ `name` |
| `externalId` | text | | | Mã tham chiếu nguồn ngoài |
| `subtitle` | text | | ✅ | Mô tả ngắn một dòng |
| `type` | select | ✅ | | Xem bảng giá trị bên dưới |
| `tag` | select | | | Nhãn tiếp thị hiển thị trên thẻ |
| `inci` | text | | ✅ | Tên INCI / tên khoa học |
| `suggestedDosage` | text | | ✅ | Liều dùng gợi ý |
| `originCountry` | text | | | Mã quốc gia, ví dụ `JP` |
| `brandName` | text | | | Thương hiệu OEM |
| `moq` | text | | | Số lượng đặt tối thiểu, dạng chữ |
| `description` | richText | | ✅ | Mô tả đầy đủ |

### Giá trị hợp lệ của `type`

| Giá trị | Nhãn |
|---|---|
| `supplement` | Supplement (TPCN) — **mặc định** |
| `cosmetic` | Cosmetic (Mỹ phẩm) |
| `both` | Both (Đa ngành) |

### Giá trị hợp lệ của `tag`

`NEW` · `TRENDING` · `EXCLUSIVE`

Để trống nếu không gắn nhãn. **Không nhận giá trị nào khác.**

---

## 3. Danh sách văn bản

| Trường | Kiểu | ĐN | Ghi chú |
|---|---|:--:|---|
| `benefits` | text nhiều giá trị | ✅ | Lợi ích |
| `applications` | text nhiều giá trị | ✅ | Ứng dụng |
| `badges` | text nhiều giá trị | | Chứng nhận: Halal, Non-GMO… |

> ⚠️ `benefits` và `applications` là trường **nhiều giá trị + đa ngữ**. Bộ dựng
> truy vấn của Payload sinh SQL hỏng khi lọc `like` trên loại trường này, nên
> API tìm kiếm cố ý không tra hai trường này. Chi tiết ở
> `dv-cms/apps/core-cms/src/endpoints/catalog.ts`.

---

## 4. Thẻ phân loại

Năm trường dưới đây đều trỏ tới collection `ingredient-facets`, nhiều giá trị.
Đây là xương sống của bộ lọc và của tìm kiếm theo câu hỏi.

| Trường | Nhóm thẻ | Ví dụ giá trị |
|---|---|---|
| `primaries` | `primary` | Chiết xuất thực vật, Omega & dầu cá, Lợi khuẩn |
| `functions` | `function` | Miễn dịch, Tim mạch, Tiêu hoá |
| `natures` | `nature` | Chiết xuất thực vật, Vitamin, Khoáng chất |
| `forms` | `form` | Bột, Dầu, Dịch chiết |
| `properties` | `property` | Tan trong nước, Tan trong dầu, Chịu nhiệt |

Mỗi bản ghi trong `ingredient-facets` có trường `group` nhận đúng một trong
năm giá trị: `primary`, `function`, `nature`, `form`, `property`.

**Không được tạo thẻ mới tuỳ tiện.** Thẻ là danh mục dùng chung toàn hệ thống;
sinh thẻ trùng nghĩa sẽ làm vỡ bộ lọc. Quy tắc ở [A4](A4-quy-tac-bat-buoc.md).

### Quan hệ khác

| Trường | Trỏ tới | Nhiều giá trị |
|---|---|:--:|
| `category` | `ingredient-categories` | |
| `partner` | `partners` | |
| `technologies` | `technologies` | ✅ |

---

## 5. Hồ sơ kỹ thuật — nhóm `technical`

Mọi trường con đều tuỳ chọn.

| Trường con | ĐN | Ghi chú |
|---|:--:|---|
| `casNumber` | | Số CAS |
| `hsCode` | | Mã HS, dùng khai hải quan |
| `eNumber` | | Mã E |
| `assay` | ✅ | Hàm lượng / độ tinh khiết. Vd: 95% curcuminoids |
| `standardization` | ✅ | Chuẩn hoá theo |
| `appearance` | ✅ | Dạng và ngoại quan |
| `solubility` | ✅ | Độ tan |
| `particleSize` | | Kích thước hạt. Vd: 80 mesh |
| `shelfLife` | ✅ | Hạn dùng |
| `storage` | ✅ | Điều kiện bảo quản |
| `packaging` | ✅ | Quy cách đóng gói |
| `leadTime` | ✅ | Thời gian giao hàng |
| `incompatibility` | ✅ | Lưu ý phối trộn / tương kỵ |

### Bảng thông số `specs`

Mảng, mỗi phần tử gồm `label`, `value`, `unit`.

---

## 6. Pháp lý — nhóm `regulatory`

| Trường con | Ghi chú |
|---|---|
| `status` | `fda_gras` · `efsa` · `vn_moh` · `novel_food` |
| `registrationNo` | Số công bố / đăng ký |
| `usageLimit` | Ngưỡng sử dụng cho phép. ĐN |

---

## 7. Hình ảnh và tài liệu

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `featuredImage` | upload → `media` | Ảnh đại diện |
| `gallery` | mảng upload → `media` | Bộ ảnh |
| `documents` | mảng | Mỗi phần tử: `title` (ĐN) + `file` → `media` |

---

## 8. ⛔ Bảng giá — vùng cấm

Nhóm `pricing` gồm `quoteDate`, `currency`, `terms`, và mảng `tiers`
(`moq`, `price`, `unit`, `note`).

**Đây là dữ liệu thương mại nhạy cảm.** Ràng buộc bắt buộc:

- Gắn quyền chỉ-nhân-viên ở tầng trường. Khách vãng lai không đọc được.
- API danh mục **mặc định không trả về**; chỉ hiện khi khoá API được bật riêng
  ô "Cho phép lấy bảng giá".
- **Tác nhân AI không được ghi vào nhóm này trong mọi trường hợp.**
  Xem [A4](A4-quy-tac-bat-buoc.md).

---

## 9. Trường hệ thống

| Trường | Ghi chú |
|---|---|
| `_status` | `draft` / `published` |
| `createdAt`, `updatedAt` | Hệ thống tự quản lý |
| `research` | Nhóm dữ liệu nghiên cứu |

---

## 10. Đọc dữ liệu

Chỉ đọc, đã có tài liệu riêng cho bên ngoài:
**`dv-cms/docs/10-api-danh-muc-nguyen-lieu.md`**

| Endpoint | Mục đích |
|---|---|
| `GET /api/catalog/search` | Tìm theo câu hỏi |
| `GET /api/catalog/ingredients` | Danh sách, phân trang, đồng bộ |
| `GET /api/catalog/ingredients/{slug}` | Chi tiết |

Đường **ghi** dữ liệu ở [A2](A2-hop-dong-ghi-du-lieu.md).
