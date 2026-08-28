# A2 — HỢP ĐỒNG GHI DỮ LIỆU

> **Trạng thái: ĐẶC TẢ, CHƯA TRIỂN KHAI.**
> Tính đến 28/08/2026, API danh mục (`/api/catalog/*`) **chỉ đọc**. Không có
> endpoint ghi nào mở ra ngoài. Tài liệu này đặc tả hợp đồng ghi để khi cần
> triển khai thì có sẵn ràng buộc, không phải nghĩ lại từ đầu.
>
> Muốn nạp dữ liệu **ngay hôm nay** thì dùng bốn luồng đã có ở
> [A3](A3-quy-trinh-hien-co.md) — đó mới là đường chính thức hiện tại.

---

## 1. Vì sao chưa mở đường ghi

Dữ liệu nguyên liệu hiển thị thẳng ra website công khai và là nguồn tư vấn cho
chatbot. Một bản ghi sai không dừng ở cơ sở dữ liệu — nó ra tới khách hàng.

Trong ngành thực phẩm chức năng và dược, sai một con số hàm lượng hay một
ngưỡng sử dụng là rủi ro thật cho sức khoẻ người dùng và cho uy tín doanh
nghiệp. Vì vậy mọi đường ghi đều phải qua bước duyệt của người, không có ngoại lệ.

---

## 2. Ba phương án, theo thứ tự khuyến nghị

### Phương án 1 — Dùng luồng nạp có sẵn ⭐

AI sinh ra tệp CSV hoặc tài liệu, hệ thống nạp qua luồng nhập đã có. Bước duyệt
của người nằm sẵn trong luồng.

| Ưu | Nhược |
|---|---|
| Không phải viết mã mới | Không cập nhật tức thời |
| Đã có sẵn kiểm tra trùng và duyệt | Phải qua thao tác thủ công |
| Không mở thêm bề mặt tấn công | |

**Đây là phương án nên chọn nếu chưa có nhu cầu ghi thời gian thực.**

### Phương án 2 — Endpoint ghi có khoá riêng

Mở `POST /api/catalog/ingredients` với khoá API riêng, quyền `write`.
Đặc tả ở mục 3 dưới đây.

### Phương án 3 — Payload Local API

Chạy mã ngay trong tiến trình CMS. Chỉ dùng cho tác vụ chạy nội bộ trên máy
chủ, **không** mở cho bên ngoài gọi.

---

## 3. Đặc tả endpoint ghi

### 3.1 Xác thực và phân quyền

Dùng lại đúng cơ chế khoá API hiện có
(`dv-cms/apps/core-cms/src/lib/catalogAuth.ts`):

- Khoá đi ở header `x-api-key`, **không** nhận qua query string.
- Đối chiếu bằng băm SHA-256; cơ sở dữ liệu không lưu khoá gốc.
- Kiểm hạn dùng và giới hạn tần suất theo từng khoá.

Cần bổ sung **quyền `write` riêng**, mặc định tắt. Khoá đang dùng để đọc
**không** được tự động có quyền ghi.

> Khoá ghi phải là khoá **khác** khoá đọc. Khoá đọc nằm trong chatbot, chạy
> trên hạ tầng của bên thứ ba; gộp chung là trao quyền sửa dữ liệu sản phẩm cho
> một hệ thống chỉ cần đọc.

### 3.2 Trường được phép ghi — danh sách trắng

Chỉ những trường dưới đây. Trường không có tên trong bảng thì **bỏ qua âm thầm**,
không báo lỗi, không ghi.

| Nhóm | Trường |
|---|---|
| Cơ bản | `name`, `subtitle`, `inci`, `suggestedDosage`, `originCountry`, `brandName`, `moq`, `description` |
| Phân loại | `type`, `tag` |
| Danh sách | `benefits`, `applications`, `badges` |
| Thẻ | `primaries`, `functions`, `natures`, `forms`, `properties` |
| Kỹ thuật | toàn bộ nhóm `technical`, `specs` |
| Pháp lý | toàn bộ nhóm `regulatory` |

### 3.3 ⛔ Trường cấm ghi tuyệt đối

| Trường | Lý do |
|---|---|
| `pricing` | Dữ liệu thương mại. Chỉ người có thẩm quyền nhập trong admin |
| `_status` | Không cho tác nhân tự xuất bản — xem 3.5 |
| `id`, `createdAt`, `updatedAt` | Hệ thống quản lý |
| `documents` | Tài liệu B2B, phải có người kiểm tra nguồn gốc |

Chặn ở tầng máy chủ bằng danh sách trắng, **không** phụ thuộc bên gọi tự giác.

### 3.4 Chống ghi trùng

Trùng nguyên liệu là vấn đề **đã từng xảy ra thật** trong hệ thống này — tới mức
phải viết riêng chức năng quét trùng
(`dv-cms/apps/core-cms/src/endpoints/duplicates.ts`), gom nhóm theo tên tiếng
Việt sau khi chuẩn hoá hoa thường và khoảng trắng.

Nguyên tắc bắt buộc:

1. **Mỗi bản ghi phải kèm `externalId`** — mã định danh ổn định từ nguồn.
2. Ghi theo kiểu **tạo-hoặc-cập-nhật** dựa trên `externalId`, không phải tạo mới.
3. Không có `externalId` thì đối chiếu `lower(trim(name))` với dữ liệu hiện có.
   Trùng thì **trả về lỗi 409**, không tự quyết định ghi đè.

```
POST /api/catalog/ingredients
{
  "externalId": "SUP-2026-0417",   // BẮT BUỘC
  "locale": "vi",
  "data": { ... }
}
```

Gọi lại cùng `externalId` với cùng nội dung phải cho ra **cùng một kết quả**,
không tạo thêm bản ghi.

### 3.5 Luôn ghi vào bản nháp

Mọi lời ghi từ tác nhân tự động đều tạo hoặc cập nhật **bản nháp**.
Không có tham số nào cho phép xuất bản thẳng.

Người biên tập vào admin xem, sửa nếu cần, rồi bấm xuất bản. Đây là chốt chặn
cuối giữa nội dung do máy sinh và khách hàng thật.

### 3.6 Ghi vết

Mỗi lời ghi phải lưu lại: thời điểm, khoá nào gọi, bản ghi nào bị đụng, trường
nào thay đổi. Không có vết thì khi phát hiện dữ liệu sai sẽ không truy được
nguồn.

Hệ thống đã có collection `audit-logs` dùng cho mục đích này.

### 3.7 Mã lỗi

| Mã | Nghĩa |
|---|---|
| `200` | Cập nhật bản ghi đã có |
| `201` | Tạo bản nháp mới |
| `400` | Dữ liệu không hợp lệ — giá trị enum sai, thiếu trường bắt buộc |
| `401` | Khoá sai, bị thu hồi hoặc hết hạn |
| `403` | Khoá không có quyền `write` |
| `409` | Trùng tên nhưng khác `externalId` — cần người quyết định |
| `429` | Vượt giới hạn tần suất |

---

## 4. Danh sách kiểm tra trước khi mở đường ghi

- [ ] Quyền `write` tách riêng, mặc định tắt
- [ ] Khoá ghi khác khoá đọc
- [ ] Danh sách trắng trường ở tầng máy chủ
- [ ] Chặn cứng `pricing`, `documents`, `_status`
- [ ] Bắt buộc `externalId`, ghi kiểu tạo-hoặc-cập-nhật
- [ ] Mọi lời ghi vào bản nháp
- [ ] Ghi vết đầy đủ vào `audit-logs`
- [ ] Giới hạn tần suất riêng cho khoá ghi
- [ ] Có đường thu hồi khoá tức thì
- [ ] Chạy thử trên cơ sở dữ liệu nháp trước
