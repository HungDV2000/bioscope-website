<!--HOSO
phu_de: Website Bioscope và Hệ quản trị nội dung
pham_vi: Dự án DA1 — quản trị hệ thống và lập trình viên
ngay_lap: 31/08/2026
phien_ban: 1.2
nguoi_lap: Bộ phận Phát triển phần mềm — Công ty Bioscope
nguoi_duyet: Ban Giám đốc
lich_su: 1.0 | 31/08/2026 | Ban hành lần đầu — tra cứu giao diện lập trình
lich_su: 1.1 | 31/08/2026 | Bổ sung sổ sự cố, 10 mục
lich_su: 1.2 | 03/09/2026 | Bổ sung tra cứu điểm truy cập bình luận
-->
# DA1 — SỔ TRA CỨU KỸ THUẬT
## Website Bioscope và Hệ quản trị nội dung

*Tài liệu tra cứu, không đọc tuần tự. Dành cho quản trị hệ thống và lập trình viên tiếp quản.*

---

# PHẦN A — GIAO DIỆN LẬP TRÌNH CÔNG KHAI

Nhóm điểm truy cập dành cho **hệ thống bên ngoài**, có khoá và phạm vi. Đây là cửa duy nhất hệ thống khác được phép lấy dữ liệu.

## A1. Xác thực

Mọi lời gọi phải kèm khoá ở đầu yêu cầu:

```
x-api-key: <khoá>
```

Trình tự kiểm ở máy chủ:

| Bước | Kiểm gì | Không đạt thì trả |
| :---- | :---- | :---- |
| 1 | Khoá có tồn tại | 401 |
| 2 | Khoá đang bật | 403 |
| 3 | Khoá còn hạn | 403 |
| 4 | Khoá có phạm vi phù hợp với điểm truy cập | 403, kèm tên phạm vi thiếu |
| 5 | Chưa vượt ngưỡng tần suất của khoá | 429 |

Khoá lưu dưới dạng **băm**, không lưu dạng đọc được. Mất khoá thì không tra lại được, phải cấp khoá mới.

## A2. Năm phạm vi khoá

| Phạm vi | Cho phép gọi | Dùng cho |
| :---- | :---- | :---- |
| `search` | `/catalog/search` | Tìm kiếm nguyên liệu |
| `list` | `/catalog/ingredients` | Lấy và đồng bộ danh sách |
| `detail` | `/catalog/ingredients/{slug}` | Lấy chi tiết một nguyên liệu |
| `content` | `/catalog/content/*` | Nội dung website |
| `site` | `/catalog/site` | Thông tin công ty |

`/catalog/manifest` không đòi phạm vi — khoá hợp lệ nào cũng gọi được, vì nó chỉ mô tả danh mục dữ liệu.

**Nguyên tắc cấp khoá: cấp đúng phạm vi cần dùng.** Hệ thống chỉ cần tìm kiếm thì chỉ cấp `search`, không cấp cả năm.

## A3. Cấu hình một khoá

| Trường | Ý nghĩa |
| :---- | :---- |
| `name` | Tên gọi để nhận biết khoá thuộc hệ thống nào |
| `enabled` | Bật/tắt — tắt là thu hồi tức thì |
| `keyPrefix` | Vài ký tự đầu, để nhận ra khoá trong nhật ký mà không lộ khoá |
| `keyHash` | Bản băm của khoá |
| `allowPricing` | **Cho phép khoá này đọc bảng giá.** Mặc định tắt |
| `scopes` | Danh sách phạm vi |
| `expiresAt` | Hạn dùng |
| `rateLimitPerMin` | Ngưỡng gọi mỗi phút |
| `lastUsedAt` | Lần dùng gần nhất |
| `callCount` | Tổng số lượt gọi |
| `note` | Ghi chú |

> **Về `allowPricing`.** Mặc định **tắt**, và nên giữ nguyên trừ khi có lý do rõ ràng. Bảng giá sỉ là dữ liệu thương mại nhạy cảm nhất; bật cờ này cho một hệ thống ngoài nghĩa là tin tưởng hệ thống đó tuyệt đối. Bật thì phải kèm hạn dùng ngắn.

## A4. Bảng tra điểm truy cập

| Đường dẫn | Cách gọi | Phạm vi | Trả về |
| :---- | :---- | :---- | :---- |
| `/api/catalog/manifest` | GET | — | Mô tả toàn bộ danh mục dữ liệu công bố được |
| `/api/catalog/search` | GET | `search` | Kết quả tìm nguyên liệu |
| `/api/catalog/ingredients` | GET | `list` | Danh sách nguyên liệu đã xuất bản |
| `/api/catalog/ingredients/{slug}` | GET | `detail` | Chi tiết một nguyên liệu |
| `/api/catalog/content` | GET | `content` | Danh sách 10 loại nội dung công bố được |
| `/api/catalog/content/{type}` | GET | `content` | Danh sách bản ghi của một loại |
| `/api/catalog/content/{type}/{key}` | GET | `content` | Một bản ghi cụ thể |
| `/api/catalog/site` | GET | `site` | Thông tin công ty |

### Ví dụ gọi

```bash
# Tìm nguyên liệu
curl -s -H "x-api-key: $BIO_KEY" \
  --get --data-urlencode "q=kháng viêm" --data-urlencode "limit=3" \
  "$BIO_API/catalog/search" | python3 -m json.tool

# Lấy chi tiết
curl -s -H "x-api-key: $BIO_KEY" \
  "$BIO_API/catalog/ingredients/collagen-peptide" | python3 -m json.tool

# Xem danh mục dữ liệu công bố được
curl -s -H "x-api-key: $BIO_KEY" "$BIO_API/catalog/manifest" | python3 -m json.tool
```

## A5. Chốt chặn dữ liệu — hai lớp

### Lớp 1: danh sách trắng

Chỉ những trường được khai báo rõ ràng mới ra ngoài. Trường mới thêm vào mô hình dữ liệu mà chưa khai thì **mặc định không ra ngoài**.

Ngược lại với cách liệt kê trường cấm: quên bổ sung một lần là lộ dữ liệu. Danh sách trắng quên thì chỉ thiếu dữ liệu. **Sai theo hướng an toàn.**

### Lớp 2: chốt chặn lúc khởi động

Có một danh sách nhóm dữ liệu **tuyệt đối không được công bố**:

```ts
const NEVER_EXPOSE = new Set([
  'users', 'members', 'chat-conversations', 'chat-messages', 'api-keys',
  'audit-logs', 'security-events', 'blocked-ips', 'consent-log',
  'form-submissions', 'forms', 'gated-documents', 'staff-roles',
  'drive-sync-jobs', 'cms-sync-runs', 'ai-generate-jobs', 'duplicate-scans',
  'redirects', 'languages', 'media',
  'content-type-definitions', 'taxonomy-definitions', 'field-groups',
])
```

Ngay lúc ứng dụng khởi động, hệ thống đối chiếu danh sách này với danh mục công bố. Có xung đột thì **ném lỗi và không khởi động**:

```ts
throw new Error(
  `[catalog/content] Collection "${e.collection}" (kiểu "${type}") nằm trong danh sách cấm ` +
    `nhưng lại được khai báo trong REGISTRY. Đây là dữ liệu nội bộ hoặc dữ liệu cá nhân — không được xuất ra API.`,
)
```

**Vì sao chặn ở khâu khởi động chứ không ở khâu trả dữ liệu.** Lỗi cấu hình bị phát hiện ngay lúc triển khai, trước khi có bất kỳ lời gọi nào. Nếu chỉ chặn lúc trả dữ liệu thì lỗi chỉ lộ ra khi đã có người gọi — mà lúc đó có thể đã muộn.

23 nhóm dữ liệu trong danh sách cấm gồm toàn bộ dữ liệu cá nhân (tài khoản, hội thoại, nhật ký đồng ý, dữ liệu biểu mẫu) và toàn bộ dữ liệu vận hành nội bộ.

---

# PHẦN B — ĐIỂM TRUY CẬP NỘI BỘ

Nhóm này phục vụ cổng thông tin và hệ quản trị, **không** dành cho hệ thống ngoài.

## B1. Bình luận

| Đường dẫn | Cách gọi | Ai gọi được | Ghi chú |
| :---- | :---- | :---- | :---- |
| `/api/blog-comments/list` | GET | Công khai | Chỉ trả tên, nội dung, ngày. Chỉ bình luận đã duyệt |
| `/api/blog-comments/submit` | POST | Công khai | Có giới hạn tần suất theo địa chỉ |

> ### ⚠ Vì sao đường dẫn là `blog-comments` mà nhóm dữ liệu là `post-comments`
>
> **Tên lệch nhau là CỐ Ý. Đừng "sửa cho khớp".**
>
> Bộ khung tự dựng sẵn đường dẫn REST theo tên nhóm dữ liệu, và đường dẫn tự dựng đó **che mất** đường dẫn tự viết trùng tên. Gọi `/api/post-comments/list` bị hiểu là "lấy tài liệu có mã là `list`" và trả về 403.
>
> Phát hiện khi chạy thử thật, không phải suy đoán. Chú thích này cũng ghi ngay trong mã nguồn.

Năm lớp bảo vệ của điểm gửi bình luận:

| Lớp | Cơ chế |
| :---- | :---- |
| 1 | Cấu hình tắt thì trả 403, không nhận gì |
| 2 | Giới hạn tần suất theo địa chỉ, ngưỡng cấu hình được |
| 3 | Chỉ nhận đúng 4 trường; mọi trường khác bị bỏ qua |
| 4 | Trạng thái do **máy chủ** quyết định, không lấy từ dữ liệu gửi lên |
| 5 | Bài phải tồn tại và đã xuất bản |

Kết quả kiểm chứng 15/15 ở `DA1-07` mục 5.

## B2. Chat trực tuyến

| Đường dẫn | Cách gọi | Giới hạn tần suất |
| :---- | :---- | :---- |
| `/api/chat/config` | GET | — |
| `/api/chat/start` | POST | 5 hội thoại / 10 phút / địa chỉ |
| `/api/chat/message` | POST | 20 tin / phút / địa chỉ |
| `/api/chat/poll` | GET | — |
| `/api/chat/history` | GET | — |
| `/api/chat/file` | GET | 60 lượt / phút / địa chỉ |
| `/api/chat/contact` | POST | — |
| `/api/chat/telegram-setup` | POST | Chỉ quản trị viên |
| `/api/telegram/webhook` | POST | Xác thực bằng khoá bí mật ở đầu yêu cầu |

**Kiểm quyền ở `/api/chat/file`:** tin nhắn chứa tệp phải **thuộc đúng hội thoại** của mã phiên đưa lên. Không kiểm thì khách này xem được tệp đính kèm của khách khác.

## B3. Vận hành

| Đường dẫn | Cách gọi | Quyền |
| :---- | :---- | :---- |
| `/api/backup` | GET | Quản trị viên |
| `/api/clear-cache` | POST | Quản trị viên |
| `/api/module-status` | GET | Quản trị viên |
| `/api/seed` | POST | Quản trị viên |
| `/api/ingredient-duplicates` | GET | Nhân viên |
| `/api/duplicate-scan` | POST | Nhân viên |
| `/api/ingredients-content-export` | GET | Nhân viên |
| `/api/ingredients-content-import` | POST | Nhân viên |

Nhóm điểm truy cập của dây chuyền AI (`/api/ai-generate/*`, `/api/drive-sync/*`, `/api/cms-sync*`, `/api/csv-import`) tra ở hồ sơ **DA2**.

---

# PHẦN C — SỔ SỰ CỐ

*Mỗi mục ghi bốn phần: dấu hiệu, nguyên nhân **đã xác minh**, cách xử lý, cách phòng.*

**Nguyên tắc:** chỉ ghi nguyên nhân đã xác minh. Ghi phỏng đoán còn tệ hơn không ghi — người sau tin theo rồi đi sai hướng.

---

## SC-01 · Trang danh sách trong hệ quản trị trắng trơn

| | |
| :---- | :---- |
| **Dấu hiệu** | Đăng nhập được, mở mục Bài viết thì vùng danh sách trắng, không báo lỗi gì trên màn hình. Trang công khai **vẫn chạy bình thường** |
| **Nhật ký** | `column _posts_v_rels.industries_id does not exist (SQLSTATE 42703)` |
| **Nguyên nhân** | Nhóm `posts` bật lưu bản nháp nên bộ khung sinh **bảng phiên bản song song** `_posts_v_rels`. Kịch bản chuyển đổi đã thêm cột quan hệ mới vào `posts_rels` nhưng bỏ sót bảng phiên bản |
| **Xử lý** | Bổ sung cột vào `_posts_v_rels`, áp lại kịch bản chuyển đổi |
| **Phòng** | Nhóm dữ liệu bật bản nháp thì **mọi** thay đổi quan hệ phải làm hai lần. Bắt buộc chạy bước 7 — đối chiếu toàn bộ danh sách cột — trong quy trình `00-5` mục 5.3 |

**Cách kiểm nhanh:**

```bash
docker exec dvcms-db psql -U dvcms -d dvcms -c "\d _posts_v_rels"
```

---

## SC-02 · Điểm truy cập tự viết trả 403 không rõ lý do

| | |
| :---- | :---- |
| **Dấu hiệu** | Gọi `/api/post-comments/list` nhận `You are not allowed to perform this action` mã 403, dù đã khai điểm truy cập công khai |
| **Nguyên nhân** | Bộ khung tự dựng sẵn đường dẫn REST theo tên nhóm dữ liệu; đường dẫn tự dựng **che mất** đường dẫn tự viết trùng tên. `list` bị hiểu là mã tài liệu |
| **Xử lý** | Đổi đường dẫn tự viết sang tên khác tên nhóm dữ liệu: `/api/blog-comments/*` |
| **Phòng** | **Không đặt đường dẫn tự viết trùng tiền tố với tên nhóm dữ liệu.** Ghi chú thích ngay trong mã để người sau không "sửa cho khớp" |

---

## SC-03 · Bài viết một ngôn ngữ hiện ở ngôn ngữ kia, mở ra trắng

| | |
| :---- | :---- |
| **Dấu hiệu** | Bài chỉ soạn tiếng Việt vẫn xuất hiện trong danh sách `/news`, tiêu đề hiện tiếng Việt; bấm vào thì trang trắng |
| **Nguyên nhân** | Bộ khung có cơ chế "thiếu bản dịch thì lấy tạm ngôn ngữ khác". Cơ chế này bật mặc định |
| **Xử lý** | Tắt cơ chế bằng tham số truy vấn `fallback-locale=none`, rồi tự lọc bỏ bản không có nội dung ở ngôn ngữ đang xem |
| **Phòng** | Tiện ích mặc định của thư viện không phải lúc nào cũng đúng với nghiệp vụ. Phải hiểu nó làm gì rồi mới quyết định dùng hay tắt |

```ts
const res = await cmsFetch<Paginated<PostDoc>>(
  'posts?limit=100&sort=-publishedAt&depth=1&fallback-locale=none',
  { locale, revalidate: 60 },
)
const hasContent = (d: PostDoc): boolean =>
  typeof d.title === 'string' && d.title.trim().length > 0
const usable = res.docs.filter(hasContent)
```

---

## SC-04 · Máy chủ phát triển treo hơn 5 phút mỗi lời gọi

| | |
| :---- | :---- |
| **Dấu hiệu** | Mở bất kỳ trang nào của hệ quản trị cũng chờ 5–6 phút. Không báo lỗi |
| **Nguyên nhân** | Chế độ tự đồng bộ cấu trúc phát hiện khác biệt giữa mã và cơ sở dữ liệu, rồi **dừng chờ trả lời một câu hỏi đổi tên bảng** — mà không ai đang ngồi ở đó để trả lời. Gốc rễ: cơ sở dữ liệu phát triển thiếu 5 kịch bản chuyển đổi |
| **Xử lý** | Áp đủ 5 kịch bản còn thiếu, sao chép 4 bảng đã đổi tên từ cơ sở dữ liệu nháp. Thời gian phản hồi từ 6 phút về **5 giây** |
| **Phòng** | Giữ cơ sở dữ liệu phát triển đồng bộ với hệ thống thật. Trên hệ thống thật **phải** đặt `PAYLOAD_DB_PUSH=false` |

---

## SC-05 · Chuyển hướng đường dẫn cũ không giữ được thứ hạng tìm kiếm

| | |
| :---- | :---- |
| **Dấu hiệu** | Đổi đường dẫn bản tin, khai chuyển hướng trong mã trang. Trình duyệt vẫn tới đúng nơi, nhưng mã trạng thái trả về là **200 kèm thẻ làm mới**, không phải mã chuyển hướng |
| **Nguyên nhân** | Hàm chuyển hướng gọi trong mã trang không sinh ra mã chuyển hướng thật ở tầng giao thức |
| **Xử lý** | Khai chuyển hướng ở tầng cấu hình ứng dụng. Đã kiểm chứng cho ra **308** ở cả hai ngôn ngữ |
| **Phòng** | Chuyển hướng ảnh hưởng thứ hạng tìm kiếm thì phải **đo mã trạng thái thật**, không tin vào việc "trình duyệt tới đúng nơi" |

```bash
curl -sI https://bioscope.vn/tai-nguyen/blog-chuyen-mon | head -1
# Phải thấy: HTTP/2 308
```

---

## SC-06 · Thanh đầu trang tràn ra ngoài màn hình

| | |
| :---- | :---- |
| **Dấu hiệu** | Thêm nhãn chữ cho nút đăng nhập, thanh đầu trang tràn 222px ở bề rộng 1024px. Sửa lần đầu chỉ nới ở mốc rất rộng, **vẫn tràn 81px** |
| **Nguyên nhân** | Khung chứa giới hạn 1280px nhưng **tăng đệm hai bên** từ 1024px trở lên. Hệ quả nghịch lý: màn hình 1536px có **ít chỗ hơn** màn hình 1280px |
| **Xử lý** | Đặt bề rộng tối đa riêng cho thanh đầu trang; dời thanh điều hướng ngang lên mốc rộng hơn |
| **Phòng** | Lỗi tràn không nhất thiết do phần tử vừa thêm. **Đo thật ở nhiều bề rộng**, không suy đoán từ một cỡ màn hình |

---

## SC-07 · Nội dung bài viết hiện sai định dạng

| | |
| :---- | :---- |
| **Dấu hiệu** | Bài viết ngoài web có đoạn văn lạ không có trong trình soạn thảo; định dạng không giống lúc soạn |
| **Nguyên nhân** | Lớp hiển thị không dựng đúng theo cấu trúc mà trình soạn thảo xuất ra |
| **Xử lý** | Dựng lại lớp hiển thị nội dung có định dạng, phủ đủ: đầu đề các cấp, đoạn, danh sách, ảnh, chú thích ảnh, bảng, trích dẫn |
| **Phòng** | Nội dung do biên tập viên soạn phải hiện **đúng như lúc soạn**. Thêm loại nội dung mới vào trình soạn thảo thì phải bổ sung quy tắc hiển thị tương ứng |

---

## SC-08 · Thuộc tính lọc khai trong hệ quản trị nhưng không ra web

| | |
| :---- | :---- |
| **Dấu hiệu** | Gán thuộc tính lọc cho nguyên liệu, lưu và xuất bản. Trang web không hiện thẻ lọc nào |
| **Nguyên nhân** | Truy vấn lấy nguyên liệu không lấy kèm dữ liệu quan hệ, nên phía cổng thông tin chỉ nhận được mã tham chiếu chứ không có nội dung |
| **Xử lý** | Khai độ sâu truy vấn phù hợp (`depth=1`) |
| **Phòng** | Thêm trường quan hệ mới thì kiểm luôn nó có ra tới cổng thông tin không, đừng chỉ kiểm trong hệ quản trị |

---

## SC-09 · `Cannot find module next/dist/bin/next` trong chứa

| | |
| :---- | :---- |
| **Dấu hiệu** | Ảnh chứa dựng xong nhưng không khởi động được |
| **Nguyên nhân** | Lệnh khởi động chạy từ thư mục thư viện thay vì thư mục ứng dụng |
| **Xử lý** | Đặt thư mục làm việc là thư mục ứng dụng trước khi chạy |
| **Phòng** | Kiểm ảnh chứa chạy được trong môi trường sạch trước khi triển khai |

---

## SC-10 · `argument missing` khi dựng ảnh chứa

| | |
| :---- | :---- |
| **Dấu hiệu** | Dựng ảnh chứa thất bại với thông báo thiếu tham số |
| **Nguyên nhân** | Dùng **tham số lúc dựng** ở lệnh khởi động, nơi chỉ đọc được **biến lúc chạy** |
| **Xử lý** | Gán tham số lúc dựng sang biến lúc chạy: `ENV PORT=${CMS_INTERNAL_PORT}` |
| **Phòng** | Phân biệt rõ hai loại biến. Tham số lúc dựng chỉ tồn tại trong lúc dựng |

---

## SC-11 · Tin nhắn chat sang bộ phận kinh doanh bị dồn cục

| | |
| :---- | :---- |
| **Dấu hiệu** | Khách gửi nhiều tin, nhân viên nhận cùng lúc sau một khoảng lặng dài |
| **Nguyên nhân** | Dây chuyền AI (DA2) bóc tách tệp PDF chạy **chung tiến trình** với hệ quản trị. Môi trường chạy đơn luồng nên tác vụ nặng chặn mọi lời gọi khác |
| **Xử lý tạm** | Ghi mốc thời gian ở khâu đẩy tin, để lần sau nhìn nhật ký là biết ngay tắc ở đâu |
| **Xử lý gốc** | **Chưa làm** — tách xử lý tệp sang tiến trình riêng. Đã ghi vào danh sách việc còn lại |
| **Phòng** | Tác vụ nặng và tác vụ cần phản hồi nhanh không nên chung một tiến trình |

Chú thích nguyên văn trong mã:

> Đo thời gian đẩy sang Telegram. Việc bóc tách PDF của hàng đợi AI chạy CHUNG tiến trình, mà Node đơn luồng nên nó chặn mọi request khác — triệu chứng là tin khách gửi dồn một lúc mới sang nhóm. Có mốc thời gian ở đây thì lần sau nhìn log là biết ngay tắc ở đâu.

---

## SC-12 · Bản dựng hỏng trên máy khác vì `next-env.d.ts`

| | |
| :---- | :---- |
| **Dấu hiệu** | Mã chạy được trên máy người sửa, dựng hỏng trên máy khác hoặc trong ảnh chứa |
| **Nguyên nhân** | Tệp `next-env.d.ts` do bộ dựng tự sinh, **nội dung khác nhau** giữa chế độ phát triển và chế độ dựng. Chạy máy chủ phát triển rồi ghi nhận thay đổi thì vô tình ghi kèm phiên bản chế độ phát triển |
| **Xử lý** | `git checkout -- apps/*/next-env.d.ts` trước khi ghi nhận |
| **Phòng** | Đưa vào danh sách rà soát trước khi đóng gói — mục 13 ở `DA1-08` A1 |

---

# PHẦN D — LỆNH THƯỜNG DÙNG

## D1. Kiểm tra hệ thống

```bash
docker compose ps                                  # trạng thái các dịch vụ
docker compose logs --tail=100 cms                 # nhật ký gần đây
docker compose logs --since=1h cms | grep -i error # lọc lỗi trong 1 giờ
df -h                                              # dung lượng đĩa
free -h                                            # bộ nhớ
docker stats --no-stream                           # tài nguyên từng chứa
```

## D2. Cơ sở dữ liệu

```bash
# Mở phiên làm việc
docker exec -it dvcms-db psql -U dvcms -d dvcms

# Xem cấu trúc một bảng
docker exec dvcms-db psql -U dvcms -d dvcms -c "\d ingredients"

# Liệt kê mọi bảng
docker exec dvcms-db psql -U dvcms -d dvcms -c "\dt"

# Đếm bản ghi
docker exec dvcms-db psql -U dvcms -d dvcms \
  -c "SELECT _status, count(*) FROM ingredients GROUP BY 1;"

# Kích thước các bảng lớn nhất
docker exec dvcms-db psql -U dvcms -d dvcms -c "
SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) AS size
FROM pg_catalog.pg_statio_user_tables ORDER BY pg_total_relation_size(relid) DESC LIMIT 10;"
```

## D3. Sao lưu và khôi phục

```bash
# Sao lưu cơ sở dữ liệu
docker exec dvcms-db pg_dump -U dvcms dvcms > backup-$(date +%F-%H%M).sql

# Sao lưu tệp tải lên
docker run --rm -v dv-cms_media:/m -v ~/:/b alpine \
  tar czf /b/media-$(date +%F-%H%M).tar.gz -C /m .

# Khôi phục cơ sở dữ liệu
docker exec -i dvcms-db psql -U dvcms -d postgres \
  -c "DROP DATABASE dvcms; CREATE DATABASE dvcms OWNER dvcms;"
docker exec -i dvcms-db psql -U dvcms -d dvcms < backup-xxx.sql
```

## D4. Phát triển tại chỗ

```bash
pnpm install

# Máy chủ phát triển — BẮT BUỘC cờ --webpack cho hệ quản trị
pnpm --filter core-cms dev
pnpm --filter bioscope-frontend dev

# Kiểm tra
pnpm --filter bioscope-frontend tsc --noEmit   # phải 0
pnpm --filter core-cms tsc --noEmit            # phải đúng 39
pnpm lint
pnpm build

# Sinh lại sau khi đổi mô hình dữ liệu
pnpm --filter core-cms payload generate:types
pnpm --filter core-cms payload generate:importmap
```

## D5. Kiểm tra giao diện lập trình

```bash
export BIO_API=https://admin.bioscope.vn/api
export BIO_KEY=<khoá>

curl -s -o /dev/null -w "%{http_code}\n" "$BIO_API/catalog/manifest"                    # mong: 401
curl -s -o /dev/null -w "%{http_code}\n" -H "x-api-key: sai" "$BIO_API/catalog/manifest" # mong: 401
curl -s -H "x-api-key: $BIO_KEY" "$BIO_API/catalog/manifest" | python3 -m json.tool

# Kiểm KHÔNG lộ bảng giá qua đường công khai
curl -s "$BIO_API/ingredients" | grep -c pricing   # mong: 0
```

---

# PHẦN E — DANH SÁCH VIỆC CÒN LẠI

| # | Việc | Mức | Ghi chú |
| :---- | :---- | :---- | :---- |
| 1 | Đặt `PAYLOAD_DB_PUSH=false` trên hệ thống thật | **Cao** | Rủi ro mất dữ liệu. Xem `DA1-08` C5 |
| 2 | Chuyển kho mã nguồn về tài khoản tổ chức của công ty | **Cao** | Hồ sơ pháp lý. Xem `README` mục 5 |
| 3 | Cấu hình danh tính người phát triển theo hòm thư công ty | **Cao** | Xem `00-1` mục 2 |
| 4 | Tách xử lý tệp sang tiến trình riêng | Trung bình | SC-11 |
| 5 | Dựng bộ kiểm thử tự động | Trung bình | Hiện kiểm thủ công |
| 6 | Cập nhật chính sách bảo mật cho phần ghi nhận hành vi | Trung bình | Đã ghi nhận dữ liệu, chính sách chưa nêu đủ |
| 7 | Diễn tập khôi phục từ bản sao lưu | Trung bình | Chưa từng diễn tập |
| 8 | Dịch 3 bài viết còn thiếu bản tiếng Anh | Thấp | Hiện không hiện ở `/news` |
| 9 | Dọn 6 phân loại tài nguyên cũ còn sót | Thấp | Dữ liệu công ty, chờ xác nhận mới xoá |
| 10 | Dọn 5 bảng cũ còn sót trong cơ sở dữ liệu phát triển | Thấp | Vô hại |
