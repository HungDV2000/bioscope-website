<!--HOSO
phu_de: Quy chuẩn mã nguồn và quản lý phiên bản
pham_vi: Toàn công ty
ngay_lap: 10/01/2026
phien_ban: 1.3
nguoi_lap: QuanNH — Team Lead, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 10/01/2026 | Ban hành lần đầu
lich_su: 1.1 | 09/07/2026 | Siết quy ước mô tả thay đổi
lich_su: 1.2 | 11/07/2026 | Bổ sung quy trình bảy bước đổi cấu trúc dữ liệu
lich_su: 1.3 | 31/08/2026 | Bổ sung bước đối chiếu toàn bộ cột; ghi nhận rủi ro tự đồng bộ trên hệ thống thật
-->
# QUY CHUẨN MÃ NGUỒN VÀ QUẢN LÝ PHIÊN BẢN

*Tài liệu chung — áp dụng cho cả ba dự án DA1, DA2, DA3.*

Tài liệu này ghi lại các quy tắc mà đội phát triển tuân theo khi viết mã và quản lý thay đổi. Phần lớn quy tắc ở đây sinh ra từ sự cố thật — mỗi mục có ghi rõ vì sao có quy tắc đó.

---

## 1. Quy chuẩn viết mã

### 1.1 Ngôn ngữ chú thích

Chú thích trong mã viết bằng **tiếng Việt**. Người đọc mã là người Việt; chú thích tiếng Anh nửa vời khó đọc hơn tiếng Việt rõ ràng.

### 1.2 Chú thích giải thích "vì sao", không giải thích "làm gì"

Mã nguồn đã nói rõ nó làm gì. Chú thích tồn tại để nói điều mã không nói được: vì sao chọn cách này, đã thử cách nào rồi bỏ, cái bẫy nào đang rình.

> **Chú thích vô giá trị:**
> ```ts
> // Đặt shown thành ngược lại
> setShown((s) => !s)
> ```
>
> **Chú thích có giá trị** (trích từ mã thật của DA1):
> ```ts
> // tabIndex -1: bấm Tab từ ô mật khẩu phải sang ô kế tiếp, không mắc kẹt ở nút này.
> tabIndex={-1}
> ```
>
> **Chú thích có giá trị cao** (trích từ mã thật của DA1):
> ```ts
> /* Thanh cuộn mảnh cho vùng cuộn BÊN TRONG (popup, panel).
>    Thanh cuộn mặc định của Windows/Linux dày và xám, cắt ngang bo góc của
>    popup nhìn rất thô; macOS thì ẩn nên không thấy vấn đề — dễ bỏ sót nếu
>    chỉ ngó trên máy Mac. */
> ```
> Chú thích này cứu người sau khỏi việc "dọn dẹp" đoạn mã tưởng là thừa.

### 1.3 Đặt tên

| Đối tượng | Quy ước | Ví dụ |
| :---- | :---- | :---- |
| Nhóm dữ liệu | Danh từ số nhiều, gạch nối, chữ thường | `post-comments`, `ai-generate-jobs` |
| Trường dữ liệu | Chữ lạc đà đầu thường | `authorName`, `requireApproval` |
| Thành phần giao diện | Chữ lạc đà đầu hoa | `PasswordField`, `MemberAuthForm` |
| Tệp thành phần | Gạch nối, chữ thường | `password-field.tsx` |
| Hàm | Động từ trước | `scorePassword`, `getPostComments` |
| Hằng số | Chữ hoa, gạch dưới | `ATTACHMENT_MAX_TOTAL_BYTES` |

### 1.4 Không lặp lại quy tắc nghiệp vụ

Một quy tắc nghiệp vụ chỉ được viết ở **một chỗ**. Chép sang chỗ thứ hai là mầm lỗi: sửa chỗ này quên chỗ kia.

Ví dụ thật trong DA1 — quy tắc chấm độ mạnh mật khẩu gom vào một thành phần dùng chung, kèm chú thích nói rõ lý do:

```ts
/**
 * Ô nhập mật khẩu dùng chung: nút con mắt + thanh đánh giá độ mạnh + ô nhập lại.
 *
 * Gom về một chỗ thay vì chép vào từng form (popup, trang đăng ký, trang tài
 * khoản) — luật độ mạnh chỉ có MỘT bản, sửa một lần là mọi nơi giống nhau.
 */
```

### 1.5 Kiểm chứng ở máy chủ, không tin phía trình duyệt

Mọi kiểm tra ở phía trình duyệt chỉ là **tiện lợi cho người dùng**, không phải bảo vệ. Người có ý đồ xấu gọi thẳng vào giao diện lập trình, không đi qua trình duyệt.

Trích chú thích trong mã thật của DA1:

```ts
// Kiểm ở đây chứ không chỉ dựa vào cảnh báo dưới ô nhập: cảnh báo kia là
// gợi ý lúc gõ, còn đây mới là chốt chặn không cho gửi đi.
```

Và ở tầng máy chủ, quy tắc mạnh hơn nữa: **trạng thái do máy chủ quyết định, không nhận từ dữ liệu gửi lên**. Ví dụ thật ở chức năng bình luận của DA1 — kẻ tấn công gửi kèm trạng thái "đã duyệt" thì hệ thống vẫn ghi "chờ duyệt", vì trạng thái được tính ở máy chủ từ cấu hình, không lấy từ dữ liệu người gửi.

### 1.6 Mặc định phải là mặc định an toàn

Chức năng mở đường ghi cho người lạ thì mặc định **tắt**. Bật là một quyết định có chủ ý của quản trị viên, không phải trạng thái tự nhiên sau khi triển khai.

Ví dụ thật: chức năng bình luận của DA1 mặc định `enabled = false`. Triển khai xong, khu bình luận không xuất hiện cho tới khi quản trị viên chủ động bật.

---

## 2. Kiểm tra bắt buộc trước khi ghi nhận thay đổi

| # | Kiểm tra | Lệnh | Điều kiện đạt |
| :---- | :---- | :---- | :---- |
| 1 | Kiểm kiểu dữ liệu | `pnpm tsc --noEmit` | Không phát sinh lỗi mới so với mức nền |
| 2 | Soát lỗi tĩnh | `pnpm lint` | Sạch |
| 3 | Dựng bản phát hành | `pnpm build` | Thành công |
| 4 | Chạy thử luồng vừa sửa | Thủ công | Đúng như mong đợi, kể cả trường hợp biên |

**Về "mức nền" ở mục 1.** Hệ quản trị của DA1 có sẵn 39 cảnh báo kiểu dữ liệu tồn tại từ trước, nằm trong mã của thư viện nền. Quy tắc: sau khi sửa, số cảnh báo phải **vẫn là 39**. Tăng lên nghĩa là vừa tạo lỗi mới. Ghi lại con số nền tránh được việc mỗi lần sửa lại đi dò xem cảnh báo nào là cũ, cái nào là mới.

---

## 3. Quản lý phiên bản mã nguồn

### 3.1 Quy ước mô tả thay đổi

Mỗi lần ghi nhận thay đổi có dạng:

```
<loại>(<phạm vi>): <tóm tắt bằng tiếng Việt, viết thường>

<thân bài: VÌ SAO sửa, đã thử gì, đánh đổi gì, cạm bẫy nào>
```

| Loại | Nghĩa |
| :---- | :---- |
| `feat` | Thêm chức năng mới |
| `fix` | Sửa lỗi |
| `refactor` | Sắp xếp lại mã, không đổi hành vi |
| `docs` | Sửa tài liệu |
| `chore` | Việc phụ trợ: nâng thư viện, sửa cấu hình |

### 3.2 Thân bài phải nói được điều mã không nói

Ví dụ thật, trích nguyên văn từ lịch sử mã nguồn DA1:

```
fix(migration): thiếu cột industries_id ở bảng phiên bản _posts_v_rels
```

Và một ví dụ dài hơn, cũng trích nguyên văn:

```
── Đường dẫn endpoint là /api/blog-comments/*, KHÔNG phải /api/post-comments/*
Payload dựng sẵn route REST theo slug collection, và route đó CHE MẤT endpoint
tuỳ biến trùng tên — gọi /api/post-comments/list bị hiểu là "lấy tài liệu có
id = list" và trả 403. Phát hiện khi chạy thử, không phải suy đoán.
```

Thân bài này có giá trị lâu dài: sáu tháng sau, người thấy đường dẫn "lệch tên" sẽ không sửa lại cho "đúng" rồi làm hỏng hệ thống.

### 3.3 Không ghi nhận thay đổi nửa vời

Một lần ghi nhận là một đơn vị hoàn chỉnh: dựng được, chạy được, không làm hỏng chức năng khác. Không ghi nhận trạng thái "đang làm dở".

---

## 4. Vòng đời phiên bản sản phẩm

| Giai đoạn | Điều kiện chuyển tiếp |
| :---- | :---- |
| Đang phát triển | Chạy trên máy lập trình viên |
| Sẵn sàng kiểm thử | Qua bốn kiểm tra ở mục 2 |
| Đã kiểm thử | Qua bộ ca kiểm thử, không còn lỗi nặng |
| Đã nghiệm thu | Bộ phận nghiệp vụ xác nhận |
| Đã đóng gói | Dựng thành ảnh chứa, chạy được trong môi trường sạch |
| Đang vận hành | Triển khai lên máy chủ, qua kiểm tra sau triển khai |

---

## 5. Quy trình đổi cấu trúc cơ sở dữ liệu

Đây là quy trình quan trọng nhất trong tài liệu này, vì đây là thao tác duy nhất **không hoàn tác được**.

### 5.1 Bối cảnh và rủi ro

Bộ khung hệ quản trị của DA1/DA2 có chế độ tự đồng bộ cấu trúc: thấy mã khai báo khác cấu trúc bảng thì tự sửa bảng. Chế độ này tiện khi phát triển, **nguy hiểm chết người trên hệ thống thật** — nó có thể tự xoá cột, tự đổi tên bảng, và dừng lại hỏi một câu hỏi mà không ai đang ngồi đó để trả lời.

Sự cố đã xảy ra thật: máy chủ phát triển treo hơn 5 phút mỗi lần gọi. Nguyên nhân là chế độ tự đồng bộ dừng chờ trả lời một câu hỏi đổi tên bảng. Sau khi xử lý, thời gian phản hồi từ 6 phút về 5 giây.

**Quy tắc:** cấu trúc cơ sở dữ liệu trên hệ thống thật chỉ thay đổi bằng **kịch bản viết tay đã kiểm chứng**. Không bao giờ để hệ thống tự sửa.

### 5.2 Vì sao không tự viết lệnh mà phải trích ra

Cấu trúc bảng do bộ khung sinh ra phức tạp hơn nhiều so với những gì đọc mã khai báo mà đoán được. Bật chức năng lưu bản nháp thì sinh ra **bảng phiên bản song song**; thêm quan hệ thì phải sửa cả bảng quan hệ của bản chính lẫn bảng quan hệ của bản phiên bản; thêm khối dựng trang thì sinh thêm một cặp bảng nữa.

Sự cố đã xảy ra thật: thêm phân loại "ngành" cho bài viết. Kịch bản viết tay đã xử lý bảng `posts_rels`, nhưng **bỏ sót** bảng phiên bản `_posts_v_rels`. Kết quả: trang danh sách bài viết trong hệ quản trị trắng trơn, nhật ký báo `column _posts_v_rels.industries_id does not exist`.

Bài học: **đừng đoán, hãy trích từ kết quả thật**.

### 5.3 Quy trình bảy bước

#### Bước 1 — Dựng cơ sở dữ liệu nháp

```bash
createdb dvcms_schemagen
```

#### Bước 2 — Trỏ cấu hình sang cơ sở dữ liệu nháp

```bash
cp .env .env.bak
sed -i '' 's#/dvcms$#/dvcms_schemagen#' .env
```

Sao lưu `.env` trước. Quên bước này là chạy thẳng lên cơ sở dữ liệu thật.

#### Bước 3 — Để hệ thống tự sinh cấu trúc trên cơ sở dữ liệu nháp

```bash
PAYLOAD_DB_PUSH=true NODE_ENV=development \
  node_modules/.bin/payload run src/scripts/schema-push.ts
```

Đây là chỗ duy nhất được phép bật chế độ tự đồng bộ — trên cơ sở dữ liệu nháp, không có dữ liệu thật.

#### Bước 4 — Trích cấu trúc thật ra

```bash
pg_dump -s -t post_comments dvcms_schemagen
pg_dump -s -t 'site_settings*' dvcms_schemagen
```

Kết quả trả về là cấu trúc bảng **thật do hệ thống sinh ra**, không phải phỏng đoán. Chép vào tệp kịch bản chuyển đổi.

#### Bước 5 — Khôi phục cấu hình

```bash
mv .env.bak .env
```

#### Bước 6 — Kiểm chứng kịch bản

```bash
# Tạo bản sao cấu trúc của cơ sở dữ liệu thật
pg_dump -s dvcms > /tmp/schema-that.sql
createdb dvcms_migtest
psql -d dvcms_migtest -f /tmp/schema-that.sql

# Áp kịch bản, lần 1
psql -d dvcms_migtest -f scripts/migrate-xxx.sql

# Áp kịch bản, lần 2 — phải KHÔNG LỖI
psql -d dvcms_migtest -f scripts/migrate-xxx.sql
```

**Vì sao phải chạy hai lần.** Triển khai thật có thể bị gián đoạn giữa chừng và phải chạy lại. Kịch bản chạy lần hai mà báo lỗi "cột đã tồn tại" thì lần chạy lại đó dừng giữa chừng, để cơ sở dữ liệu ở trạng thái nửa vời. Mọi lệnh phải viết dạng chịu được chạy trùng: `ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`.

#### Bước 7 — Đối chiếu toàn bộ

```bash
# Liệt kê mọi cột của cả hai cơ sở dữ liệu rồi so
psql -d dvcms_migtest -Atc "SELECT table_name||'.'||column_name FROM information_schema.columns WHERE table_schema='public' ORDER BY 1" > /tmp/sau-migrate.txt
psql -d dvcms_schemagen -Atc "SELECT table_name||'.'||column_name FROM information_schema.columns WHERE table_schema='public' ORDER BY 1" > /tmp/chuan.txt

comm -13 /tmp/sau-migrate.txt /tmp/chuan.txt
```

Lệnh cuối liệt kê **những cột có ở bản chuẩn mà thiếu ở bản sau chuyển đổi**. Kết quả phải **rỗng**.

Bước này chính là bước bắt được sự cố `_posts_v_rels` nếu làm đủ. Đối chiếu toàn bộ danh sách cột, không chỉ đối chiếu bảng vừa sửa — vì cái bị bỏ sót luôn nằm ở bảng mình không nghĩ tới.

### 5.4 Trên hệ thống thật

```bash
# 1. Sao lưu — BẮT BUỘC
docker exec dvcms-db pg_dump -U dvcms dvcms > backup-$(date +%F-%H%M).sql

# 2. Áp kịch bản
docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-xxx.sql

# 3. Dựng lại và khởi động
docker compose build cms && docker compose up -d

# 4. Kiểm tra sau triển khai theo danh sách đã lập
```

### 5.5 Rủi ro đang tồn tại — cần xử lý

Trên hệ thống thật hiện chưa đặt biến `PAYLOAD_DB_PUSH=false`. Biến này không đặt thì **chế độ tự đồng bộ cấu trúc đang bật**.

Nghĩa là: nếu mã nguồn khai báo khác cấu trúc bảng thật, hệ thống có thể tự sửa cấu trúc cơ sở dữ liệu vận hành — kể cả xoá cột.

**Cách xử lý đề xuất:**

1. Sao lưu cơ sở dữ liệu.
2. Thêm `PAYLOAD_DB_PUSH=false` vào phần biến môi trường của dịch vụ `cms` trong tệp định nghĩa hạ tầng.
3. Dựng lại và khởi động.
4. Kiểm tra hệ thống chạy bình thường.

Việc này **chưa thực hiện**, đang chờ quyết định. Ghi vào đây để không bị quên.

---

## 6. Sổ tra cứu sự cố

Mỗi dự án có mục "Sự cố đã gặp" trong tài liệu `-10-tra-cuu-ky-thuat.md`. Mỗi mục ghi bốn phần:

| Phần | Nội dung |
| :---- | :---- |
| Dấu hiệu | Người dùng thấy gì, nhật ký báo gì |
| Nguyên nhân thật | Nguyên nhân đã xác minh, không phải phỏng đoán |
| Cách xử lý | Các bước cụ thể |
| Cách phòng | Đổi gì để lần sau không tái diễn |

**Nguyên tắc:** chỉ ghi nguyên nhân đã xác minh. Ghi phỏng đoán vào sổ tra cứu còn tệ hơn không ghi — người sau tin theo rồi đi sai hướng.

Đã có tiền lệ: một lần chẩn đoán sai nguyên nhân trang quản trị trắng, kết luận là do phiên đăng nhập cũ, dựa trên một phép thử **không đăng nhập**. Người dùng thử lại vẫn trắng. Chỉ khi tạo tài khoản thật, đăng nhập thật và đọc nhật ký máy chủ mới ra nguyên nhân thật là thiếu cột ở bảng phiên bản. Bài học: phép thử phải tái hiện đúng hoàn cảnh của lỗi, nếu không thì kết quả của nó vô nghĩa.
