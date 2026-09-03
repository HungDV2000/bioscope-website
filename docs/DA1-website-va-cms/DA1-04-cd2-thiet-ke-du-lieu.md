<!--HOSO
phu_de: Website Bioscope và Hệ quản trị nội dung
pham_vi: Dự án DA1
ngay_lap: 05/06/2026
phien_ban: 1.3
nguoi_lap: Bộ phận Phát triển phần mềm — Công ty Bioscope
nguoi_duyet: Ban Giám đốc
lich_su: 1.0 | 05/06/2026 | Ban hành lần đầu
lich_su: 1.1 | 24/07/2026 | Bổ sung bảng giá nhiều bậc, khoá ở tầng trường
lich_su: 1.2 | 28/08/2026 | Bổ sung ba trục phân loại bài viết
lich_su: 1.3 | 03/09/2026 | Bổ sung nhóm dữ liệu bình luận
-->
# DA1 — CÔNG ĐOẠN 2: THIẾT KẾ CƠ SỞ DỮ LIỆU
## Website Bioscope và Hệ quản trị nội dung

---

## 1. Nguyên tắc thiết kế dữ liệu

| # | Nguyên tắc | Vì sao |
| :---- | :---- | :---- |
| 1 | Mô hình dữ liệu định nghĩa bằng mã, không định nghĩa qua giao diện | Mọi thay đổi cấu trúc có lịch sử trong kho mã nguồn, truy vết được |
| 2 | Đa ngữ ở tầng trường, không ở tầng bản ghi | Dữ liệu không đổi theo ngôn ngữ chỉ lưu một bản |
| 3 | Nội dung quan trọng có phiên bản và trạng thái nháp | Sửa nhầm khôi phục được; viết dở không lộ ra ngoài |
| 4 | Xoá là chuyển vào thùng rác, không xoá thật | Xoá nhầm khôi phục được |
| 5 | Quyền đọc/ghi khai ngay tại định nghĩa nhóm dữ liệu | Không có chỗ nào quên kiểm quyền |
| 6 | Dữ liệu nhạy cảm khoá ở **tầng trường**, không chỉ tầng nhóm | Nhóm dữ liệu cho công khai đọc thì trường nhạy cảm bên trong vẫn phải khoá riêng |
| 7 | Cấu trúc bảng chỉ đổi bằng kịch bản đã kiểm chứng | Xem `00-5` mục 5 |

---

## 2. Tổng quan mô hình

51 nhóm dữ liệu và bảng cấu hình, chia sáu nhóm chức năng:

| Nhóm | Số lượng | Vai trò |
| :---- | :---- | :---- |
| Nghiệp vụ nguyên liệu | 10 | Hạt nhân dữ liệu của công ty |
| Nội dung biên tập | 8 | Bài viết, trang, ảnh, chuyển hướng |
| Khách hàng và tương tác | 7 | Tài khoản khách, tài liệu, biểu mẫu, hội thoại |
| Vận hành và an toàn | 6 | Người dùng nội bộ, khoá, nhật ký, chặn |
| Cấu hình toàn cục | 12 | Thiết lập không gắn với bản ghi cụ thể |
| Loại nội dung tự định nghĩa | 3 | Cho phép mở rộng không cần lập trình |

---

## 3. Sơ đồ quan hệ chính

```
                    ┌──────────────────┐
                    │  ingredient-     │
                    │  categories      │
                    └────────┬─────────┘
                             │ 1
                             │
                             │ n
┌──────────────┐    ┌────────▼─────────┐    ┌──────────────────┐
│  partners    │ 1  │                  │ n  │  ingredient-     │
│              ├───►│   ingredients    │◄──►│  facets          │
│              │  n │   (73 trường)    │  n │  (5 nhóm thuộc   │
└──────────────┘    │                  │    │   tính lọc)      │
                    └────┬────────┬────┘    └──────────────────┘
                         │        │
                    n ┌──┘        └──┐ n
                      ▼              ▼
              ┌──────────────┐  ┌──────────────┐
              │    media     │  │ ai-generate- │
              │ (ảnh, tệp)   │  │ jobs (DA2)   │
              └──────────────┘  └──────────────┘


┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│  categories  │ n  │                  │ n  │  industries  │
│  (chủ đề)    ├───►│      posts       │◄───┤  (ngành)     │
└──────────────┘    │                  │    └──────────────┘
                    └────┬────────┬────┘
┌──────────────┐  n      │        │      n  ┌──────────────┐
│     tags     ├─────────┘        └────────►│ post-        │
│   (thẻ)      │                            │ comments     │
└──────────────┘                            └──────────────┘


┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│   members    │ 1  │  chat-           │ 1  │    chat-     │
│ (khách hàng) ├───►│  conversations   ├───►│  messages    │
└──────┬───────┘    └──────────────────┘  n └──────────────┘
       │ n
       ▼
┌──────────────────┐
│ gated-documents  │
│ (tài liệu kiểm   │
│  soát tải)       │
└──────────────────┘
```

---

## 4. Nhóm dữ liệu trung tâm: `ingredients`

Đây là bảng quan trọng nhất của toàn hệ thống. **73 trường**, chia làm 8 thẻ để biểu mẫu không quá dài.

### 4.1 Cấu hình nhóm dữ liệu

```ts
export const Ingredients: CollectionConfig = {
  slug: 'ingredients',
  trash: true,
  admin: {
    useAsTitle: 'name',
    group: 'Bioscope',
    defaultColumns: ['name', 'type', 'originCountry', 'needsReview', 'featured', '_status'],
  },
  versions: { drafts: { autosave: false }, maxPerDoc: 10 },
  access: {
    read: readPublishedOrStaff,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  ...
}
```

| Thiết lập | Giá trị | Ý nghĩa |
| :---- | :---- | :---- |
| `trash` | bật | Xoá là chuyển vào thùng rác |
| `versions.drafts` | bật, không tự lưu | Có trạng thái nháp; không tự lưu để biên tập viên chủ động quyết định lúc nào ghi |
| `versions.maxPerDoc` | 10 | Giữ 10 phiên bản gần nhất, tránh phình cơ sở dữ liệu |
| `access.read` | `readPublishedOrStaff` | Khách chỉ đọc bản đã xuất bản; nhân viên đọc cả bản nháp |
| `access.create/update/delete` | `isAdminOrEditor` | Khách không ghi được gì |

### 4.2 Tám thẻ nội dung

| # | Thẻ | Nội dung chính |
| :---- | :---- | :---- |
| 1 | Tổng quan | Tên, phụ đề, loại, nhãn, tên INCI, liều dùng gợi ý, phân loại, xuất xứ, thương hiệu, đối tác, số lượng đặt tối thiểu, bảng giá |
| 2 | Nội dung | Mô tả, lợi ích, ứng dụng, các nhóm thuộc tính lọc, huy hiệu |
| 3 | Hình ảnh | Ảnh đại diện, thư viện ảnh |
| 4 | Kỹ thuật | Chỉ tiêu kỹ thuật, thông số bổ sung |
| 5 | Pháp lý | Trạng thái pháp lý, hồ sơ pháp lý |
| 6 | Tài liệu | Tệp đính kèm |
| 7 | Nghiên cứu | Tài liệu nghiên cứu, tham chiếu |
| 8 | Đồng bộ | Trạng thái đồng bộ với kho tài liệu (xem DA2) |

### 4.3 Các trường tiêu biểu

| Trường | Kiểu | Đa ngữ | Bắt buộc | Ghi chú |
| :---- | :---- | :----: | :----: | :---- |
| `name` | text | ✅ | ✅ | Tên nguyên liệu |
| `externalId` | text | | | Mã đối chiếu với hệ thống ngoài |
| `subtitle` | text | ✅ | | Phụ đề |
| `type` | select | | ✅ | Loại nguyên liệu |
| `inci` | text | ✅ | | Tên theo danh pháp quốc tế mỹ phẩm |
| `suggestedDosage` | text | ✅ | | Liều dùng gợi ý |
| `category` | quan hệ | | | Trỏ tới `ingredient-categories` |
| `originCountry` | text | | | Mã quốc gia, ví dụ `JP` |
| `brandName` | text | | | Thương hiệu sản xuất theo đặt hàng |
| `partner` | quan hệ | | | Trỏ tới `partners` |
| `moq` | text | | | Số lượng đặt tối thiểu |
| `pricing` | nhóm | | | **Bảng giá — xem mục 4.4** |
| `description` | richText | ✅ | | Mô tả đầy đủ |
| `benefits` | text nhiều giá trị | ✅ | | Danh sách lợi ích |
| `applications` | text nhiều giá trị | ✅ | | Danh sách ứng dụng |
| `primaries` | quan hệ nhiều | | | Nhóm thuộc tính "chính" |
| `functions` | quan hệ nhiều | | | Nhóm thuộc tính "chức năng" |
| `natures` | quan hệ nhiều | | | Nhóm thuộc tính "bản chất" |
| `forms` | quan hệ nhiều | | | Nhóm thuộc tính "dạng" |
| `properties` | quan hệ nhiều | | | Nhóm thuộc tính "tính chất" |
| `featuredImage` | tệp tải lên | | | Ảnh đại diện |
| `gallery` | mảng | | | Thư viện ảnh |
| `specs` | trường tự định nghĩa | | | Chỉ tiêu kỹ thuật |
| `regulatory` | nhóm | | | Trạng thái và hồ sơ pháp lý |
| `documents` | mảng | | | Tệp đính kèm |
| `driveFiles` | mảng | | | Danh sách tệp nguồn từ kho tài liệu (DA2) |
| `fileCount` | number | | | Số tệp nguồn |
| `lastDriveSyncAt` | date | | | Lần đồng bộ gần nhất |

### 4.4 Bảng giá — thiết kế bảo mật ở tầng trường

Đây là điểm thiết kế quan trọng nhất của bảng `ingredients`, và là ví dụ điển hình cho nguyên tắc số 6.

**Vấn đề:** nhóm dữ liệu `ingredients` cho công chúng đọc mọi bản đã xuất bản. Nghĩa là ai cũng gọi được `/api/ingredients` và nhận về toàn bộ bản ghi. Nhưng trong bản ghi có **bảng giá sỉ** — dữ liệu thương mại nhạy cảm nhất của công ty.

**Nếu chỉ khoá ở tầng nhóm dữ liệu:** khoá thì khách không xem được nguyên liệu; mở thì đối thủ lấy sạch bảng giá bằng một lệnh gọi.

**Giải pháp:** khoá riêng ở **tầng trường**. Trích chú thích nguyên văn trong mã nguồn:

```ts
/**
 * Field-level: chỉ nhân viên nội bộ mới ĐỌC được trường này.
 *
 * Dùng cho dữ liệu thương mại nhạy cảm (bảng giá sỉ). Collection `ingredients`
 * cho public đọc mọi bản đã publish qua REST API, nên nếu không khoá ở cấp
 * TRƯỜNG thì bảng giá sẽ lộ ra `/api/ingredients` — chỉ một lệnh curl là đối
 * thủ lấy sạch. Payload loại hẳn trường khỏi phản hồi khi hàm này trả false.
 */
export const isStaffFieldLevel: FieldAccess = ({ req: { user } }) => isStaff(user as AnyUser)
```

Cơ chế: bộ khung **loại hẳn trường khỏi phản hồi** khi hàm kiểm quyền trả về sai — không phải trả về giá trị rỗng, mà trường biến mất khỏi kết quả.

**Cấu trúc bảng giá:**

| Trường | Kiểu | Ghi chú |
| :---- | :---- | :---- |
| `pricing.quoteDate` | date | Ngày báo giá |
| `pricing.currency` | select | Đơn vị tiền |
| `pricing.terms` | text, đa ngữ | Điều kiện |
| `pricing.tiers[]` | mảng | Bảng giá nhiều bậc |
| `pricing.tiers[].moq` | text, bắt buộc | Số lượng đặt tối thiểu của bậc |
| `pricing.tiers[].price` | number | Đơn giá |
| `pricing.tiers[].unit` | text | Đơn vị tính |
| `pricing.tiers[].note` | text | Ghi chú |

### 4.5 Năm nhóm thuộc tính lọc

Thay vì tạo năm bảng riêng cho năm loại thuộc tính, thiết kế dùng **một bảng** `ingredient-facets` có cột `group` phân loại, rồi lọc theo nhóm ngay tại chỗ khai báo quan hệ:

```ts
{
  name: 'primaries',
  type: 'relationship',
  relationTo: 'ingredient-facets',
  hasMany: true,
  filterOptions: () => ({ group: { equals: 'primary' } }),
}
```

| Trường | Nhóm lọc | Ý nghĩa |
| :---- | :---- | :---- |
| `primaries` | `primary` | Thành phần chính |
| `functions` | `function` | Chức năng |
| `natures` | `nature` | Bản chất |
| `forms` | `form` | Dạng bào chế |
| `properties` | `property` | Tính chất |

**Vì sao gộp một bảng:** thêm nhóm thuộc tính thứ sáu chỉ cần thêm một giá trị vào cột `group` và một trường quan hệ, không phải tạo bảng mới, không phải viết kịch bản chuyển đổi cho bảng mới. Người quản trị cũng chỉ phải học **một** màn hình quản lý thuộc tính thay vì năm.

**Đánh đổi:** khi truy vấn phải luôn kèm điều kiện lọc theo nhóm. Rủi ro quên đã được xử lý bằng cách khai điều kiện ngay tại định nghĩa trường, không để người dùng tự nhớ.

---

## 5. Nhóm dữ liệu `posts` và các phân loại

### 5.1 Ba trục phân loại độc lập

| Bảng | Nghĩa | Ví dụ |
| :---- | :---- | :---- |
| `categories` | **Chủ đề** bài viết | Kiến thức nguyên liệu, Xu hướng thị trường |
| `industries` | **Ngành** áp dụng | Thực phẩm chức năng, Mỹ phẩm, Đồ uống |
| `tags` | **Thẻ** tự do | Collagen, Kháng viêm |

**Vì sao ba trục thay vì một.** Một bài viết có thể đồng thời thuộc chủ đề "Xu hướng thị trường", ngành "Mỹ phẩm", và mang thẻ "Collagen". Gộp cả ba vào một bảng thì không lọc được theo từng chiều, và danh sách phân loại sẽ dài vô tổ chức.

### 5.2 Cạm bẫy đã trả giá: bảng phiên bản song song

Nhóm `posts` bật chức năng lưu bản nháp. Bộ khung vì thế sinh ra **bảng phiên bản song song**:

| Bảng chính | Bảng phiên bản tương ứng |
| :---- | :---- |
| `posts` | `_posts_v` |
| `posts_rels` (quan hệ) | `_posts_v_rels` |

**Sự cố đã xảy ra:** thêm phân loại "ngành" cho bài viết. Kịch bản chuyển đổi đã thêm cột `industries_id` vào `posts_rels` nhưng **bỏ sót** `_posts_v_rels`. Kết quả: trang danh sách bài viết trong hệ quản trị trắng trơn, nhật ký máy chủ báo:

```
column _posts_v_rels.industries_id does not exist (SQLSTATE 42703)
```

**Bài học ghi vào thiết kế:** nhóm dữ liệu nào bật bản nháp thì **mọi** thay đổi quan hệ đều phải làm hai lần — một lần cho bảng chính, một lần cho bảng phiên bản. Quy trình bảy bước ở `00-5` mục 5.3 có bước đối chiếu toàn bộ danh sách cột chính là để bắt loại lỗi này.

Tương tự, nhóm `pages` dùng khối dựng trang cũng sinh cặp bảng `_pages_v_blocks_*` cho mỗi loại khối.

---

## 6. Nhóm dữ liệu `post-comments`

Bảng mới nhất, dựng tháng 9/2026. Thiết kế đáng chú ý vì đây là **bảng duy nhất nhận dữ liệu ghi từ người không đăng nhập**.

| Trường | Kiểu | Bắt buộc | Ghi chú |
| :---- | :---- | :----: | :---- |
| `post` | quan hệ → `posts` | ✅ | Có chỉ mục |
| `status` | select | ✅ | `pending` / `approved` / `spam`, mặc định `pending` |
| `authorName` | text | ✅ | Tối đa 120 ký tự |
| `authorEmail` | email | | **Dữ liệu cá nhân** |
| `content` | textarea | ✅ | Tối đa 5.000 ký tự |
| `authorIp` | text | | **Dữ liệu cá nhân**, chỉ đọc |
| `locale` | text | | Ngôn ngữ lúc gửi, chỉ đọc |

### Quyền truy cập — chỉ nhân viên

```ts
access: {
  read: isAdminOrEditor,
  create: isAdminOrEditor,
  update: isAdminOrEditor,
  delete: isAdminOrEditor,
},
```

**Kể cả quyền đọc cũng đóng với công chúng.** Lý do: bản ghi chứa thư điện tử và địa chỉ mạng của người bình luận — dữ liệu cá nhân, không được lộ.

Vậy làm sao trang web hiện được bình luận? Qua một điểm giao tiếp riêng chỉ trả về ba trường `authorName`, `content`, `createdAt`. Không có đường nào để công chúng đọc thẳng bảng này.

Đây là ví dụ cho nguyên tắc: **quyền đọc mặc định là đóng; mở thì mở đúng phần cần mở, qua đường có kiểm soát.**

### Trạng thái do máy chủ quyết định

Trường `status` **không bao giờ** lấy từ dữ liệu gửi lên. Máy chủ tự tính từ cấu hình:

```ts
const status = cfg.requireApproval ? 'pending' : 'approved'
```

Đã kiểm chứng: gửi kèm `status:"approved"` thì bản ghi vẫn vào `pending`.

---

## 7. Phân quyền

### 7.1 Ba vai trò nhân viên

| Vai trò | Quyền |
| :---- | :---- |
| `admin` | Toàn quyền, gồm cấu hình hệ thống, khoá truy cập, quản lý người dùng |
| `editor` | Thêm/sửa/xoá nội dung; không đụng cấu hình hệ thống, không quản lý người dùng |
| `viewer` | Chỉ đọc |

### 7.2 Các hàm kiểm quyền dùng chung

Toàn bộ quy tắc phân quyền gom vào **một tệp**, không chép rải rác:

```ts
const isStaff = (user: AnyUser): boolean => Boolean(user && user.collection === 'users')

export const anyone: BoolAccess = () => true

export const isAdmin: BoolAccess = ({ req: { user } }) =>
  isStaff(user as AnyUser) && (user as AnyUser)?.role === 'admin'

export const isAdminOrEditor: BoolAccess = ({ req: { user } }) =>
  isStaff(user as AnyUser) && ['admin', 'editor'].includes((user as AnyUser)?.role ?? '')

export const readPublishedOrStaff: Access = ({ req: { user } }) => {
  if (isStaff(user as AnyUser)) return true
  return { _status: { equals: 'published' } }
}
```

Điểm đáng chú ý ở `readPublishedOrStaff`: nó không trả về đúng/sai mà trả về **điều kiện lọc**. Khách không bị từ chối, chỉ bị giới hạn kết quả ở những bản đã xuất bản. Nhờ vậy một hàm phục vụ được cả hai đối tượng, không cần viết hai đường xử lý riêng.

Một chi tiết bảo mật ẩn trong `isStaff`: nó kiểm `user.collection === 'users'`. Hệ thống có **hai** bảng tài khoản — `users` cho nhân viên và `members` cho khách hàng. Không kiểm cái này thì khách hàng đã đăng nhập có thể bị nhầm là nhân viên.

### 7.3 Bảng quyền theo nhóm dữ liệu

| Nhóm dữ liệu | Đọc | Tạo | Sửa | Xoá |
| :---- | :---- | :---- | :---- | :---- |
| `ingredients` | Công chúng (bản đã xuất bản) | Biên tập viên | Biên tập viên | Biên tập viên |
| `posts` | Công chúng (bản đã xuất bản) | Biên tập viên | Biên tập viên | Biên tập viên |
| `pages` | Công chúng (bản đã xuất bản) | Biên tập viên | Biên tập viên | Biên tập viên |
| `media` | Công chúng | Biên tập viên | Biên tập viên | Biên tập viên |
| `post-comments` | **Chỉ nhân viên** | Nhân viên | Nhân viên | Nhân viên |
| `members` | **Chỉ nhân viên** | Công chúng (đăng ký) | Chính chủ | Quản trị viên |
| `users` | Quản trị viên | Quản trị viên | Quản trị viên | Quản trị viên |
| `api-keys` | Quản trị viên | Quản trị viên | Quản trị viên | Quản trị viên |
| `audit-logs` | Quản trị viên | Hệ thống | — | — |
| `chat-conversations` | Nhân viên | Hệ thống | Hệ thống | Quản trị viên |
| `gated-documents` | Khách đã đăng nhập | Biên tập viên | Biên tập viên | Biên tập viên |

---

## 8. Dữ liệu cá nhân

Bảng liệt kê để đối chiếu với chính sách bảo vệ dữ liệu cá nhân.

| Dữ liệu | Nơi lưu | Vì sao thu thập | Ai xem được |
| :---- | :---- | :---- | :---- |
| Thư điện tử khách hàng | `members` | Định danh tài khoản | Nhân viên |
| Tên, điện thoại, công ty, mã số thuế | `members` | Phục vụ liên hệ kinh doanh | Nhân viên |
| Thư điện tử người bình luận | `post-comments` | Liên hệ khi cần | **Chỉ nhân viên** |
| Địa chỉ mạng người bình luận | `post-comments` | Chống lạm dụng | **Chỉ nhân viên** |
| Địa chỉ mạng, thiết bị, vị trí ước lượng | `chat-conversations` | Hỗ trợ nhân viên kinh doanh nắm ngữ cảnh | Nhân viên |
| Dữ liệu biểu mẫu | `form-submissions` | Xử lý yêu cầu của khách | Nhân viên |
| Nhật ký đồng ý | `consent-log` | Bằng chứng khách đã đồng ý | Nhân viên |

**Nguyên tắc:** mọi bảng chứa dữ liệu cá nhân đều đóng quyền đọc với công chúng. Không có ngoại lệ.

---

## 9. Chỉ mục

| Bảng | Trường có chỉ mục | Vì sao |
| :---- | :---- | :---- |
| `ingredients` | `slug`, `externalId` | Tra theo đường dẫn và theo mã hệ thống ngoài |
| `posts` | `slug`, `publishedAt` | Tra theo đường dẫn; sắp xếp theo ngày |
| `post-comments` | `post` | Lấy bình luận của một bài |
| `chat-conversations` | `sessionToken`, `visitorEmail` | Tra theo mã phiên và theo khách |
| `chat-messages` | `conversation`, `telegramMessageId` | Lấy tin theo hội thoại; đối chiếu tin từ kênh nhắn tin |
| `members` | `email` | Đăng nhập |
| `api-keys` | mã khoá | Kiểm khoá ở mỗi lời gọi |

Nguyên tắc đặt chỉ mục: đặt ở trường **dùng để tìm**, không đặt tràn lan — mỗi chỉ mục làm thao tác ghi chậm đi một chút.

---

## 10. Quản lý thay đổi cấu trúc

28 kịch bản chuyển đổi trong `dv-cms/scripts/`. Mỗi tệp là một lần nâng cấp cấu trúc hệ thống thật.

| Tệp tiêu biểu | Nội dung |
| :---- | :---- |
| `migrate-post-taxonomies.sql` | Thêm bảng `industries`, cột phân loại, quan hệ, **và bảng phiên bản `_posts_v_rels`** |
| `migrate-home-latest-posts.sql` | Thêm khối "bài viết mới" — 4 bảng, gồm cả cặp bảng phiên bản |
| `migrate-post-comments.sql` | Thêm bảng `post_comments`, 5 chỉ mục, khoá ngoại, 5 ô cấu hình, ghi chú đa ngữ |
| `migrate-api-content-scopes.sql` | Thêm phạm vi khoá truy cập — chạy ngoài giao dịch vì lệnh thêm giá trị vào kiểu liệt kê không chạy trong giao dịch được |

Quy trình sinh và kiểm chứng kịch bản ở `00-5` mục 5.
