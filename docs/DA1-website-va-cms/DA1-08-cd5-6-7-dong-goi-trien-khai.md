<!--HOSO
phu_de: Website Bioscope và Hệ quản trị nội dung
pham_vi: Dự án DA1
ngay_lap: 25/08/2026
phien_ban: 1.1
nguoi_lap: Bộ phận Phát triển phần mềm — Công ty Bioscope
nguoi_duyet: Ban Giám đốc
lich_su: 1.0 | 25/08/2026 | Ban hành lần đầu
lich_su: 1.1 | 03/09/2026 | Bổ sung quy trình triển khai hệ thống bình luận
-->
# DA1 — CÔNG ĐOẠN 5, 6, 7
## Hoàn thiện · Đóng gói · Cài đặt · Chuyển giao · Bảo trì · Phát hành

---

# PHẦN A — CÔNG ĐOẠN 5: HOÀN THIỆN VÀ ĐÓNG GÓI

## A1. Danh sách rà soát trước khi đóng gói

Chạy đủ danh sách này trước mỗi lần đóng gói. Không bỏ mục nào, kể cả khi "chắc chắn không đụng tới".

| # | Mục rà soát | Cách kiểm | Đạt |
| :---- | :---- | :---- | :----: |
| 1 | Không còn mã thử nghiệm | `grep -rn "console.log\|debugger\|TODO: xoá" apps packages --include=*.ts --include=*.tsx` | ☐ |
| 2 | Không còn dữ liệu giả trong mã | Rà các hằng số mẫu; ví dụ đã gỡ: `BLOG_SAMPLE_COMMENTS` | ☐ |
| 3 | Không có bí mật trong mã nguồn | `grep -rnE "sk-[a-zA-Z0-9]{20,}\|password *= *['\"]" apps packages` | ☐ |
| 4 | Tệp `.env` nằm trong danh sách loại trừ | `git check-ignore -v .env` | ☐ |
| 5 | Kiểm kiểu — cổng thông tin | `pnpm --filter bioscope-frontend tsc --noEmit` → **0 lỗi** | ☐ |
| 6 | Kiểm kiểu — hệ quản trị | `pnpm --filter core-cms tsc --noEmit` → **đúng 39**, không hơn | ☐ |
| 7 | Soát lỗi tĩnh | `pnpm lint` → sạch | ☐ |
| 8 | Dựng cổng thông tin | `pnpm --filter bioscope-frontend build` → thành công | ☐ |
| 9 | Dựng hệ quản trị | `pnpm --filter core-cms build` → thành công | ☐ |
| 10 | Kiểu dữ liệu đã sinh lại sau khi đổi mô hình | `pnpm --filter core-cms payload generate:types` | ☐ |
| 11 | Bản đồ thành phần quản trị đã sinh lại | `pnpm --filter core-cms payload generate:importmap` | ☐ |
| 12 | Kịch bản chuyển đổi dữ liệu đã kiểm chứng | Theo quy trình `00-5` mục 5.3, đủ 7 bước | ☐ |
| 13 | Tệp `next-env.d.ts` ở đúng trạng thái bản dựng | Xem A2 | ☐ |

### A2. Cạm bẫy: tệp `next-env.d.ts` tự đổi giữa hai chế độ

Tệp này do bộ dựng tự sinh và **nội dung khác nhau** giữa chế độ phát triển và chế độ dựng bản phát hành:

| Chế độ | Nội dung dòng tham chiếu |
| :---- | :---- |
| Chạy phát triển | `./.next/dev/types/routes.d.ts` |
| Dựng bản phát hành | `./.next/types/routes.d.ts` |

Chạy máy chủ phát triển rồi ghi nhận thay đổi thì vô tình ghi kèm phiên bản chế độ phát triển, và lần dựng sau trên máy khác sẽ hỏng. **Phải khôi phục tệp này về trạng thái bản dựng trước khi ghi nhận thay đổi.**

```bash
git checkout -- apps/*/next-env.d.ts
```

Đây là loại lỗi mất nhiều thời gian để tìm vì nó không xuất hiện trên máy người vừa sửa.

---

## A3. Quy tắc đánh số phiên bản

Dạng `X.Y.Z`:

| Vị trí | Tăng khi | Ví dụ |
| :---- | :---- | :---- |
| `X` — lớn | Thay đổi phá vỡ tương thích: đổi cấu trúc dữ liệu không lùi được, đổi giao diện lập trình công khai | 0.1.0 → 1.0.0 |
| `Y` — vừa | Thêm chức năng, tương thích ngược | 0.1.0 → 0.2.0 |
| `Z` — nhỏ | Sửa lỗi, không thêm chức năng | 0.1.0 → 0.1.1 |

Phiên bản hiện tại: **0.1.0**. Còn ở nhánh `0.x` vì mô hình dữ liệu vẫn đang bổ sung.

---

## A4. Cấu trúc bản đóng gói

Hai ảnh chứa, mỗi ảnh dựng theo **kiểu nhiều chặng** để bản chạy không mang theo công cụ dựng.

### A4.1 Ảnh chứa hệ quản trị

```dockerfile
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY patches ./patches
COPY packages ./packages
COPY apps/core-cms ./apps/core-cms
RUN pnpm install --filter @dv/core-cms... --no-frozen-lockfile
WORKDIR /app/apps/core-cms
RUN pnpm exec next build --webpack

FROM base AS runner
ENV NODE_ENV=production
RUN apk add --no-cache postgresql16-client
WORKDIR /app/apps/core-cms
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/packages /app/packages
COPY --from=build /app/apps/core-cms /app/apps/core-cms
ARG CMS_INTERNAL_PORT=26301
ENV PORT=${CMS_INTERNAL_PORT}
EXPOSE ${CMS_INTERNAL_PORT}
CMD ["sh", "-c", "exec node ./node_modules/next/dist/bin/next start -p ${PORT}"]
```

**Bốn điểm thiết kế cần giải thích:**

| Điểm | Lý do |
| :---- | :---- |
| `--webpack` khi dựng | Bộ dựng mới không giải được đường dẫn nhập khẩu giữa các gói trong kho. Xem `DA1-03` QĐ-03. **Không gỡ cờ này nếu chưa kiểm chứng lại.** |
| Cài `postgresql16-client` vào bản chạy | Để chạy sao lưu và áp kịch bản chuyển đổi **từ bên trong chứa**, không cần cài công cụ lên máy chủ |
| `--filter @dv/core-cms...` | Chỉ cài phụ thuộc của ứng dụng này và các gói nó dùng, không cài cả kho — ảnh nhẹ và dựng nhanh hơn |
| Chạy lệnh từ thư mục ứng dụng | Chạy từ thư mục thư viện sinh lỗi `Cannot find module next/dist/bin/next`. Lỗi L-09 trong `DA1-07` |

### A4.2 Quy ước dải cổng

| Dịch vụ | Cổng nội bộ | Cổng máy chủ |
| :---- | :---- | :---- |
| Hệ quản trị | 26301 | theo biến `DVCMS_CMS_HOST_PORT` |
| Cổng thông tin | 26302 | theo biến `DVCMS_FRONTEND_HOST_PORT` |
| Cổng xem trước | 26303 | theo biến tương ứng |
| Cơ sở dữ liệu | 5432 | chỉ mở trong mạng nội bộ |

Dùng dải `263xx` để không đụng dịch vụ khác trên cùng máy chủ. Trước khi có quy ước này đã từng xung đột cổng khi cài thêm dịch vụ.

### A4.3 Cạm bẫy: tham số lúc dựng và biến lúc chạy

Lỗi L-10 trong `DA1-07`: dùng `${CMS_INTERNAL_PORT}` — vốn là **tham số lúc dựng** — ở lệnh khởi động, nơi chỉ đọc được **biến lúc chạy**. Kết quả: `argument missing`.

Cách xử lý: gán tham số lúc dựng sang biến lúc chạy (`ENV PORT=${CMS_INTERNAL_PORT}`) rồi lệnh khởi động đọc `${PORT}`.

---

## A5. Danh mục biến môi trường

| Biến | Bắt buộc | Ý nghĩa |
| :---- | :----: | :---- |
| `DATABASE_URI` | ✅ | Chuỗi kết nối cơ sở dữ liệu |
| `PAYLOAD_SECRET` | ✅ | Khoá ký phiên đăng nhập nhân viên. **Đổi khoá này là mọi phiên hiện có mất hiệu lực** |
| `PAYLOAD_PUBLIC_SERVER_URL` | ✅ | Địa chỉ công khai của hệ quản trị |
| `FRONTEND_URL` | ✅ | Địa chỉ cổng thông tin, dùng để gọi xoá bộ nhớ đệm |
| `REVALIDATE_SECRET` | ✅ | Khoá xác thực lời gọi xoá bộ nhớ đệm |
| `INTERNAL_API_SECRET` | ✅ | Khoá cho lời gọi nội bộ giữa hai ứng dụng |
| `PAYLOAD_DB_PUSH` | ⚠️ | **Phải đặt `false` trên hệ thống thật.** Xem C5 |
| `GOOGLE_OAUTH_CLIENT_ID` / `_SECRET` | | Đăng nhập bằng tài khoản Google |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | | Thư mục gốc kho tài liệu (DA2) |
| `GOOGLE_APPLICATION_CREDENTIALS` | | Đường dẫn tệp chứng thực dịch vụ (DA2) |
| `AI_PROVIDER` | | `openrouter` hoặc `openai` (DA2) |
| `OPENROUTER_API_KEY`, `OPENAI_API_KEY`, `MISTRAL_API_KEY` | | Khoá gọi mô hình (DA2) |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_SALES_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET` | | Chat trực tuyến |
| `BACKUP_DIR` | | Bật sao lưu tự động theo lịch |
| `CMS_ASSET_PREFIX` | | Tiền tố đường dẫn tệp tĩnh khi đặt sau máy chủ web |
| `PREVIEW_ORIGIN` | | Địa chỉ cổng xem trước |

**Nguyên tắc:** ô cấu hình trong hệ quản trị để trống thì hệ thống lấy biến môi trường tương ứng. Hai đường, chọn một, không mâu thuẫn.

---

## A6. Danh sách thay đổi theo phiên bản

| Phiên bản | Ngày | Thay đổi chính | Kịch bản chuyển đổi kèm theo |
| :---- | :---- | :---- | :---- |
| 0.1.0-a | 09/07/2026 | Đưa lên máy chủ lần đầu, bốn dịch vụ | Gieo cấu trúc lần đầu |
| 0.1.0-b | 21/07/2026 | Đường dẫn đa ngữ, hồ sơ nguyên liệu, sao lưu | có |
| 0.1.0-c | 24/07/2026 | Bảng giá nhiều bậc khoá nội bộ, thẻ lọc | có |
| 0.1.0-d | 29/07/2026 | Thùng rác, nhật ký thay đổi, đăng theo lịch | có |
| 0.1.0-e | 14/08/2026 | Chat trực tuyến hoàn chỉnh | có |
| 0.1.0-f | 17/08/2026 | Cổng khách hàng, giao diện lập trình có khoá | `migrate-api-content-scopes.sql` |
| 0.1.0-g | 31/08/2026 | Phân loại bài viết, `/ban-tin` và `/news` | `migrate-post-taxonomies.sql` |
| 0.1.0-h | 31/08/2026 | Khối "Bài viết mới" trang chủ | `migrate-home-latest-posts.sql` |
| 0.1.0-i | 03/09/2026 | Hệ thống bình luận | `migrate-post-comments.sql` |

---

# PHẦN B — CÔNG ĐOẠN 6: CÀI ĐẶT VÀ CHUYỂN GIAO

## B1. Cài đặt lần đầu

### Yêu cầu máy chủ tối thiểu

| Hạng mục | Mức tối thiểu | Khuyến nghị |
| :---- | :---- | :---- |
| Bộ xử lý | 2 nhân | 4 nhân |
| Bộ nhớ | 4 GB | 8 GB |
| Đĩa | 40 GB | 80 GB |
| Hệ điều hành | Linux có Docker | |
| Phần mềm | Docker, Docker Compose, Git | |

> **Lưu ý về bộ nhớ.** Dây chuyền AI (DA2) bóc tách tệp PDF chạy **chung tiến trình** với hệ quản trị. Xử lý tệp lớn tốn nhiều bộ nhớ. Máy 4 GB chạy được nhưng sẽ chậm khi hàng đợi AI hoạt động.

### Các bước

```bash
# 1. Lấy mã nguồn
git clone <địa chỉ kho> /www/wwwroot/bioscope-website
cd /www/wwwroot/bioscope-website/dv-cms

# 2. Khai cấu hình
cp .env.example .env
#    Đặt: DATABASE_URI, PAYLOAD_SECRET, PAYLOAD_PUBLIC_SERVER_URL,
#         FRONTEND_URL, REVALIDATE_SECRET, INTERNAL_API_SECRET
#    QUAN TRỌNG: thêm PAYLOAD_DB_PUSH=false

# 3. Dựng và khởi động
docker compose build
docker compose up -d

# 4. Gieo dữ liệu nền: tài khoản quản trị, trang mặc định, nhận diện, điều hướng
bash scripts/seed.sh

# 5. Kiểm tra bốn dịch vụ đã lên
docker compose ps
```

### Cấu hình máy chủ web đứng trước

| Tên miền | Chuyển tới | Ghi chú |
| :---- | :---- | :---- |
| `bioscope.vn` | cổng thông tin, cổng 26302 | Chuyển tiếp đầu `X-Forwarded-For` để hệ thống thấy địa chỉ thật của khách |
| `admin.bioscope.vn` | hệ quản trị, cổng 26301 | Nên giới hạn thêm theo dải địa chỉ nếu điều kiện cho phép |

**Bắt buộc chuyển tiếp `X-Forwarded-For`.** Không chuyển thì mọi lời gọi đều mang địa chỉ của máy chủ web, và toàn bộ cơ chế giới hạn tần suất theo địa chỉ trở nên vô nghĩa — một kẻ tấn công sẽ khoá luôn cả những người dùng thật.

---

## B2. Quy trình nâng cấp

Quy trình chuẩn, áp dụng cho mọi lần nâng cấp. **Không bỏ bước 1.**

```bash
cd /www/wwwroot/bioscope-website/dv-cms

# ── BƯỚC 1 · SAO LƯU — BẮT BUỘC, KHÔNG NGOẠI LỆ ─────────────────────────
docker exec dvcms-db pg_dump -U dvcms dvcms > ~/backup-$(date +%F-%H%M).sql
docker run --rm -v dv-cms_media:/m -v ~/:/b alpine \
  tar czf /b/media-$(date +%F-%H%M).tar.gz -C /m .

# ── BƯỚC 2 · LẤY MÃ NGUỒN MỚI ───────────────────────────────────────────
git pull

# ── BƯỚC 3 · ÁP KỊCH BẢN CHUYỂN ĐỔI (nếu phiên bản có kèm) ──────────────
docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-xxx.sql
#    ĐỌC KỸ kết quả trả về. Phải khớp với kết quả khi chạy thử ở môi
#    trường kiểm thử. Có dòng lỗi nào thì DỪNG LẠI, không đi tiếp.

# ── BƯỚC 4 · DỰNG LẠI ───────────────────────────────────────────────────
docker compose build cms
docker compose build frontend

# ── BƯỚC 5 · KHỞI ĐỘNG ──────────────────────────────────────────────────
docker compose up -d

# ── BƯỚC 6 · KIỂM TRA SAU TRIỂN KHAI (mục B3) ───────────────────────────
```

## B3. Danh sách kiểm tra sau triển khai

| # | Kiểm tra | Cách kiểm | Đạt |
| :---- | :---- | :---- | :----: |
| 1 | Bốn dịch vụ đang chạy | `docker compose ps` | ☐ |
| 2 | Không có lỗi trong nhật ký | `docker compose logs --tail=100 cms` | ☐ |
| 3 | Trang chủ mở được, hiện nội dung | Mở `bioscope.vn` | ☐ |
| 4 | Trang nguyên liệu hiện danh sách | Mở `/nguyen-lieu` | ☐ |
| 5 | Trang chi tiết nguyên liệu mở được | Bấm vào một nguyên liệu | ☐ |
| 6 | Trang bản tin cả hai ngôn ngữ | Mở `/ban-tin` và `/news` | ☐ |
| 7 | Đăng nhập hệ quản trị được | Mở `admin.bioscope.vn` | ☐ |
| 8 | **Danh sách trong hệ quản trị hiện dữ liệu** | Mở Nguyên liệu, Bài viết | ☐ |
| 9 | Sửa và xuất bản được một bản ghi | Thử sửa một trường | ☐ |
| 10 | Bộ nhớ đệm được xoá sau khi xuất bản | Xem thay đổi hiện ra ngoài | ☐ |
| 11 | Khung chat mở được | Bấm nút chat | ☐ |
| 12 | Giao diện lập trình trả dữ liệu | Gọi kèm khoá hợp lệ | ☐ |
| 13 | Tệp tải lên còn nguyên | Mở một ảnh cũ | ☐ |

> **Mục 8 là mục quan trọng nhất và hay bị bỏ qua nhất.** Sự cố L-01 — trang danh sách bài viết trắng do thiếu cột ở bảng phiên bản — **không** thể hiện ở trang công khai. Trang công khai chạy bình thường trong khi hệ quản trị đã hỏng. Chỉ kiểm trang ngoài rồi kết luận "triển khai thành công" là bỏ lọt đúng loại lỗi này.

## B4. Quy trình lùi phiên bản

Khi kiểm tra sau triển khai không đạt và không sửa nhanh được:

```bash
# 1. Quay mã nguồn về phiên bản trước
git reset --hard <mã ghi nhận của phiên bản trước>

# 2. Khôi phục cơ sở dữ liệu từ bản sao lưu ở bước 1 của B2
docker exec -i dvcms-db psql -U dvcms -d postgres \
  -c "DROP DATABASE dvcms; CREATE DATABASE dvcms OWNER dvcms;"
docker exec -i dvcms-db psql -U dvcms -d dvcms < ~/backup-<mốc thời gian>.sql

# 3. Dựng lại và khởi động
docker compose build && docker compose up -d

# 4. Chạy lại danh sách kiểm tra B3
```

**Vì sao phải khôi phục cả cơ sở dữ liệu, không chỉ lùi mã nguồn.** Kịch bản chuyển đổi đã đổi cấu trúc bảng. Mã nguồn cũ không hiểu cấu trúc mới. Lùi mỗi mã nguồn sẽ tạo ra tình trạng lệch pha, khó gỡ hơn cả sự cố ban đầu.

---

## B5. Bàn giao

### Nội dung bàn giao

| # | Hạng mục | Hình thức |
| :---- | :---- | :---- |
| 1 | Mã nguồn đầy đủ, kèm toàn bộ lịch sử phát triển | Kho mã nguồn |
| 2 | Bộ hồ sơ 36 tài liệu | Bản `.md` và `.docx` |
| 3 | Tài khoản quản trị | Bàn giao riêng, đổi mật khẩu ngay sau khi nhận |
| 4 | Tệp cấu hình `.env` của hệ thống thật | Bàn giao riêng, **không** qua kho mã nguồn |
| 5 | Bản sao lưu cơ sở dữ liệu tại thời điểm bàn giao | Tệp |
| 6 | Tài liệu hướng dẫn sử dụng | `DA1-09` |
| 7 | Sổ tra cứu kỹ thuật | `DA1-10` |

### Biên bản bàn giao

**Bên giao:** ..............................  **Bên nhận:** ..............................

**Ngày bàn giao:** .................. **Phiên bản bàn giao:** ..................

| # | Hạng mục | Đã nhận | Ghi chú |
| :---- | :---- | :----: | :---- |
| 1 | Mã nguồn và lịch sử phát triển | ☐ | |
| 2 | Bộ hồ sơ 36 tài liệu | ☐ | |
| 3 | Tài khoản quản trị | ☐ | |
| 4 | Tệp cấu hình hệ thống thật | ☐ | |
| 5 | Bản sao lưu cơ sở dữ liệu | ☐ | |
| 6 | Hướng dẫn sử dụng | ☐ | |
| 7 | Sổ tra cứu kỹ thuật | ☐ | |
| 8 | Đã hướng dẫn sử dụng trực tiếp | ☐ | |

*Bên giao ký:* ..............................  *Bên nhận ký:* ..............................

---

## B6. Bảo trì và bảo hành

### Phân loại và thời hạn xử lý

| Mức | Định nghĩa | Ví dụ | Thời hạn |
| :---- | :---- | :---- | :---- |
| Nghiêm trọng | Hệ thống ngừng phục vụ, hoặc mất dữ liệu | Trang chủ không mở được; cơ sở dữ liệu hỏng | Xử lý ngay, không giới hạn giờ |
| Nặng | Chức năng chính không dùng được, không có cách đi vòng | Không đăng nhập được hệ quản trị; danh sách bài viết trắng | Trong ngày làm việc |
| Nhẹ | Chức năng phụ lỗi, hoặc có cách đi vòng | Một trang hiển thị lệch trên điện thoại | Trong tuần |
| Cải tiến | Thay đổi hoặc thêm chức năng | Thêm trường mới cho nguyên liệu | Đưa vào kế hoạch đợt sau |

### Công việc bảo trì định kỳ

| Việc | Tần suất | Cách làm |
| :---- | :---- | :---- |
| Kiểm tra sao lưu chạy đúng | Hàng tuần | Xem thư mục sao lưu, kiểm kích thước tệp mới nhất |
| **Diễn tập khôi phục** | Hàng quý | Khôi phục bản sao lưu vào cơ sở dữ liệu nháp, kiểm dữ liệu đủ |
| Kiểm dung lượng đĩa | Hàng tháng | `df -h` |
| Xem nhật ký lỗi | Hàng tuần | `docker compose logs --since=168h cms \| grep -i error` |
| Xem nhật ký sự kiện an ninh | Hàng tháng | Mở mục Sự kiện an ninh trong hệ quản trị |
| Nâng cấp vá lỗi bảo mật của thư viện | Hàng quý | Rà soát, kiểm thử, rồi mới áp |
| Dọn hội thoại chat quá hạn | Tự động | Theo chính sách lưu trữ đã cấu hình |

> **Diễn tập khôi phục là việc dễ bỏ nhất và tốn kém nhất khi bỏ.** Bản sao lưu chưa từng được khôi phục thử thì chưa phải bản sao lưu — nó chỉ là một tệp mà ta *hy vọng* dùng được. Nhiều tổ chức phát hiện bản sao lưu hỏng đúng vào lúc cần nó nhất.

---

# PHẦN C — CÔNG ĐOẠN 7: PHÁT HÀNH

## C1. Hình thức phát hành

Sản phẩm là phần mềm **phục vụ hoạt động kinh doanh của công ty**, không bán bản sao ra thị trường. Phát hành nghĩa là đưa vào vận hành phục vụ người dùng thật.

| Thành phần | Địa chỉ | Đối tượng | Trạng thái |
| :---- | :---- | :---- | :---- |
| Cổng thông tin công khai | `bioscope.vn` | Khách hàng, đối tác, công chúng | Đang vận hành |
| Hệ quản trị nội dung | `admin.bioscope.vn` | Nhân viên công ty | Đang vận hành |
| Giao diện lập trình | `admin.bioscope.vn/api/catalog/*` | Hệ thống nội bộ khác, có khoá | Đang vận hành |

## C2. Bằng chứng đã phát hành

| Bằng chứng | Cách kiểm chứng |
| :---- | :---- |
| Cổng thông tin truy cập được từ Internet | Mở `bioscope.vn` |
| Có nội dung thật, không phải dữ liệu mẫu | Xem danh mục nguyên liệu |
| Có tài khoản người dùng thật | Xem bảng người dùng và bảng khách hàng |
| Có hội thoại thật với khách | Xem mục Hội thoại trong hệ quản trị |
| Có dữ liệu tích luỹ theo thời gian | Xem mốc thời gian các bản ghi |

## C3. Thông báo phát hành nội bộ

Mỗi lần phát hành có chức năng ảnh hưởng tới người dùng, gửi thông báo nội bộ gồm: phiên bản, ngày, chức năng mới, thay đổi cách làm việc, việc người dùng cần biết.

## C4. Giấy phép và quyền sở hữu

| Nội dung | Chủ sở hữu |
| :---- | :---- |
| Mã nguồn nghiệp vụ do công ty viết | **Công ty Bioscope** |
| Dữ liệu nguyên liệu, nội dung, hình ảnh | **Công ty Bioscope** |
| Thư viện mã nguồn mở sử dụng | Tác giả tương ứng, theo giấy phép mã nguồn mở (chủ yếu MIT, Apache 2.0) |

Danh mục thư viện và giấy phép ở `00-4` mục 4.

## C5. Rủi ro đang tồn tại — cần xử lý trước lần phát hành tiếp theo

Hệ thống thật hiện **chưa đặt** biến `PAYLOAD_DB_PUSH=false`. Biến không đặt thì chế độ **tự đồng bộ cấu trúc cơ sở dữ liệu đang bật**.

**Hậu quả có thể xảy ra:** nếu mã nguồn khai báo mô hình dữ liệu khác cấu trúc bảng thật, hệ thống có thể tự sửa cấu trúc cơ sở dữ liệu vận hành — bao gồm **xoá cột**, tức mất dữ liệu vĩnh viễn.

**Các bước xử lý đề xuất:**

```bash
# 1. Sao lưu
docker exec dvcms-db pg_dump -U dvcms dvcms > ~/backup-truoc-khi-tat-push.sql

# 2. Thêm vào phần environment của dịch vụ cms trong docker-compose.yml:
#    PAYLOAD_DB_PUSH: "false"

# 3. Dựng lại và khởi động
docker compose build cms && docker compose up -d

# 4. Chạy danh sách kiểm tra B3
```

**Trạng thái: chưa thực hiện, đang chờ quyết định.** Ghi vào hồ sơ để không bị bỏ quên. Cũng ghi ở `00-5` mục 5.5.
