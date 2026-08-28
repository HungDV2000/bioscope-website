# B5 — VẬN HÀNH

> Nguồn: `dv-cms/docker-compose.yml`, `dv-cms/scripts/`, `dv-cms/docs/02-deploy-vps-docker.md`
> Tài liệu này là **quy trình vận hành**. Chi tiết từng lệnh xem tài liệu deploy đã có.

---

## 1. Bốn dịch vụ

| Dịch vụ | Vai trò |
|---|---|
| `db` | PostgreSQL |
| `cms` | Payload CMS + API → `admin.bioscope.vn` |
| `frontend` | Website → `bioscope.vn` |
| `preview-proxy` | Xem trước nội dung trong admin |

Kèm hai ổ đĩa dữ liệu: `pgdata` (cơ sở dữ liệu) và `media` (ảnh, tệp tải lên).

⚠️ **Hai ổ này là toàn bộ dữ liệu của hệ thống.** Xoá là mất, mã nguồn không dựng lại được.

---

## 2. ⚠️ Quy tắc migration — quan trọng nhất tài liệu này

Payload chạy ở chế độ **push schema** khi phát triển: tự đổi cấu trúc bảng theo
mã nguồn. Trên máy chủ thật thì **tắt**, và mọi thay đổi cấu trúc phải đi qua
file SQL trong `dv-cms/scripts/`.

### Quy tắc bất di bất dịch

> **DDL phải được trích từ kết quả push thật, không bao giờ viết tay theo suy đoán.**

Quy tắc này sinh ra từ sự cố thật: câu lệnh viết tay dùng sai giá trị enum và
sai tên cột, chạy trên máy chủ mới phát hiện.

### Cách trích DDL đúng

1. Tạo cơ sở dữ liệu nháp trống, ví dụ `dvcms_schemagen`
2. Sao lưu `.env`, đổi `DATABASE_URI` trỏ vào cơ sở dữ liệu nháp
3. Chạy push với `PAYLOAD_DB_PUSH=true`
4. Trích cấu trúc bằng `pg_dump -s -t <tên_bảng>`
5. **Khôi phục `.env`**

### Cách kiểm chứng migration

1. Tạo cơ sở dữ liệu thử từ `pg_dump -s` của cơ sở dữ liệu đang dùng
2. Áp các migration **theo đúng thứ tự lịch sử**
3. **Chạy lại lần hai** — phải không lỗi, đây là phép thử tính lặp lại an toàn
4. So sánh danh sách cột với cơ sở dữ liệu nháp ở trên

### Yêu cầu với mọi file migration

| Yêu cầu | Lý do |
|---|---|
| Chỉ `CREATE` / `ADD`, không `DROP` | Không làm mất dữ liệu |
| Lặp lại được | Chạy nhầm hai lần không hỏng |
| Bọc transaction | Lỗi giữa chừng thì lùi sạch |
| Có câu lệnh kiểm chứng ở cuối | Chạy xong biết ngay đúng hay sai |

> Ngoại lệ: `ALTER TYPE ... ADD VALUE` **không chạy được trong transaction** ở
> PostgreSQL cũ. File nào chỉ thêm giá trị enum thì không bọc transaction, và
> phải ghi rõ lý do trong file.

Hiện có **25 file migration**, đều theo quy tắc trên.

### Bài học đã trả giá

Đổi ràng buộc của một trường trong Payload mà **quên viết migration tương ứng**
thì tầng ứng dụng chấp nhận nhưng cơ sở dữ liệu từ chối. Lỗi chỉ hiện khi ghi
thật, không hiện lúc build.

**Sửa ràng buộc trường ⇒ bắt buộc có migration đi kèm.**

---

## 3. Quy trình triển khai

```
1. Kéo mã mới       git pull
2. Chạy migration    (theo thứ tự, kiểm kết quả từng file)
3. Dựng CMS          docker compose build cms
4. Dựng frontend     docker compose build frontend
5. Khởi động         docker compose up -d
6. Kiểm tra sau triển khai
```

### ⚠️ Dựng tuần tự, không song song

Dựng song song `cms` và `frontend` gây tranh chấp CPU. Đã xảy ra thật: sinh
trang tĩnh vượt quá thời gian chờ và build thất bại.

Vì vậy ngưỡng chờ đã nâng lên 300 giây, **và** vẫn phải dựng tuần tự.

### Ghi chú kỹ thuật

CMS phải dựng bằng **webpack**, không dùng turbopack: turbopack lỗi với cách
import `.js` trỏ tới file `.ts` giữa các gói trong workspace.

---

## 4. Kiểm tra sau triển khai

| Kiểm | Kỳ vọng |
|---|---|
| Trang chủ | Tải được, không lỗi |
| Trang nguyên liệu | Đủ số lượng, bộ lọc chạy |
| Đăng nhập admin | Vào được |
| Đăng nhập thành viên | Cả mật khẩu lẫn Google |
| Widget chat | Gửi được tin, tin sang Telegram |
| API danh mục | Trả đúng dữ liệu với khoá hợp lệ |
| Khoá thiếu quyền | Trả `403`, **không** trả dữ liệu |
| Bảng giá | **Không** xuất hiện khi khoá chưa bật quyền giá |

Hai dòng cuối là kiểm tra **âm tính** — quan trọng hơn kiểm tra thường, vì hỏng
ở đây là rò rỉ dữ liệu chứ không phải lỗi hiển thị.

---

## 5. Sao lưu

| Đối tượng | Cách |
|---|---|
| Cơ sở dữ liệu | `pg_dump`, hoặc endpoint `/api/backup` trong admin |
| Tệp tải lên | Sao chép ổ `media` |
| Mã nguồn | Đã có trên GitHub |

### Bắt buộc sao lưu trước khi

- Chạy migration trên máy chủ thật
- Nạp dữ liệu hàng loạt
- Nâng cấp Payload hoặc Next.js
- Xoá dữ liệu

### Khôi phục

1. Dừng `cms` và `frontend`, giữ `db` chạy
2. Khôi phục bản sao lưu vào cơ sở dữ liệu
3. Khôi phục ổ `media`
4. Khởi động lại và kiểm tra theo mục 4

---

## 6. Theo dõi vận hành

| Nguồn | Xem gì |
|---|---|
| `docker compose logs -f cms` | Lỗi CMS, kết quả công việc chạy nền |
| `docker compose logs -f frontend` | Lỗi dựng trang |
| Admin → bản ghi công việc | Đồng bộ, sinh nội dung AI, quét trùng |
| Admin → nhật ký thao tác | Ai sửa gì |
| Admin → sự kiện bảo mật | Truy cập bất thường |

### Dấu hiệu bất thường cần xử lý ngay

| Dấu hiệu | Khả năng |
|---|---|
| Số lượt gọi một khoá API tăng vọt | Khoá bị lộ |
| Công việc AI dừng ở trạng thái đang chạy | Tiến trình chết giữa chừng |
| Tin nhắn Telegram đến theo cụm | Xử lý PDF chặn vòng lặp sự kiện |
| Cơ sở dữ liệu ngừng | Hết dung lượng đĩa hoặc hết RAM |

### Việc còn tồn

- **Kiểm tra tài nguyên máy chủ định kỳ** — `df -h` và `free -h`. Đã từng có
  lần PostgreSQL ngừng và biên dịch TypeScript mất tới 3,9 phút.
- **Tách xử lý PDF ra tiến trình riêng** — nghi là nguyên nhân tin nhắn Telegram
  bị dồn cụm.

---

## 7. Phát triển tại máy cá nhân

Xem `dv-cms/docs/01-local-development.md`. Ba điểm hay vướng:

| Vướng | Cách xử lý |
|---|---|
| Chạy dev bằng turbopack lỗi import giữa các gói | Dùng `next dev --webpack` |
| Cơ sở dữ liệu máy cá nhân lệch cấu trúc | Bật lại push, hoặc dựng lại từ `pg_dump` của máy chủ |
| Sửa nhầm file `.env` | Payload chạy trực tiếp đọc `apps/core-cms/.env`, Docker đọc `dv-cms/.env` |

Sau khi đổi collection hoặc global, phải chạy lại:

```
payload generate:types       # sau khi đổi cấu trúc dữ liệu
payload generate:importmap   # sau khi thêm thành phần giao diện admin
```
