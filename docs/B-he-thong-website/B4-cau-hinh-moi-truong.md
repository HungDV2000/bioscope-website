# B4 — BIẾN MÔI TRƯỜNG VÀ CẤU HÌNH

> Nguồn: `dv-cms/.env.example`, `dv-cms/docker-compose.yml`
> **28 biến môi trường.**

---

## ⚠️ Nguyên tắc trước tiên

| | |
|---|---|
| `dv-cms/.env` | **Không đưa lên git.** Chứa bí mật thật |
| `dv-cms/.env.example` | Đưa lên git. **Chỉ tên biến, không có giá trị thật** |
| Bí mật | Sinh mới cho **từng môi trường**: `openssl rand -hex 32` |

**Có hai file `.env` khác nhau — nhầm là mất thời gian:**

| File | Ai đọc |
|---|---|
| `dv-cms/.env` | **docker-compose** — dùng khi chạy trên máy chủ |
| `dv-cms/apps/core-cms/.env` | **Payload khi chạy trực tiếp** — dùng khi phát triển tại máy cá nhân |

Sửa nhầm file thì biến không có tác dụng. Đây là lỗi đã xảy ra thật.

---

## 1. Cơ sở dữ liệu

| Biến | Bắt buộc | Ghi chú |
|---|:--:|---|
| `DATABASE_URI` | ✅ | Chuỗi kết nối PostgreSQL. Trong Docker dùng tên dịch vụ, không dùng `localhost` |
| `POSTGRES_PASSWORD` | ✅ | 🔒 Mật khẩu cơ sở dữ liệu |

---

## 2. Cổng

Toàn hệ thống dùng dải **26xxx** để tránh đụng dịch vụ khác trên cùng máy chủ.

| Biến | Giá trị | Vai trò |
|---|---|---|
| `DVCMS_DB_HOST_PORT` | 26432 | Cổng PostgreSQL ra máy chủ |
| `DVCMS_CMS_HOST_PORT` | 26081 | Cổng CMS ra máy chủ |
| `DVCMS_FRONTEND_HOST_PORT` | 26080 | Cổng frontend ra máy chủ |
| `PORT` | 26301 / 26300 | Cổng bên trong container |

Cổng ra máy chủ **chỉ mở trên `127.0.0.1`**, không mở ra Internet. Reverse proxy
của aaPanel đứng trước:

```
admin.bioscope.vn → 127.0.0.1:26081
bioscope.vn       → 127.0.0.1:26080
```

---

## 3. Địa chỉ công khai

| Biến | Ghi chú |
|---|---|
| `NEXT_PUBLIC_CMS_URL` | ⚠️ Nung vào gói phía trình duyệt lúc build. Đổi phải **build lại** |
| `NEXT_PUBLIC_SITE_URL` | ⚠️ Như trên |
| `PAYLOAD_PUBLIC_SERVER_URL` | Địa chỉ công khai của CMS |
| `FRONTEND_URL` | CMS dùng để dựng liên kết và gọi làm mới bộ nhớ đệm |

> Biến bắt đầu bằng `NEXT_PUBLIC_` **lộ ra trình duyệt**. Không bao giờ đặt bí
> mật vào đây.

---

## 4. 🔒 Bí mật hệ thống

| Biến | Vai trò | Hậu quả nếu lộ |
|---|---|---|
| `PAYLOAD_SECRET` | Ký phiên đăng nhập admin và phiên thành viên | Giả mạo được phiên bất kỳ |
| `REVALIDATE_SECRET` | Xác thực lời gọi làm mới bộ nhớ đệm | Bị ép làm mới liên tục |
| `B2B_COOKIE` | Tên cookie phiên thành viên | |
| `POSTGRES_PASSWORD` | Cơ sở dữ liệu | Truy cập toàn bộ dữ liệu |

Sinh mới bằng `openssl rand -hex 32`, **mỗi môi trường một giá trị khác nhau**.

---

## 5. Nhà cung cấp AI

Từ 08/2026 hệ thống dùng **OpenRouter** làm mặc định — bộ định tuyến tự chọn
model phù hợp theo độ khó từng yêu cầu, câu dễ dùng model rẻ, nhờ đó tối ưu chi phí.

| Biến | Ghi chú |
|---|---|
| `AI_PROVIDER` | `openrouter` (mặc định) hoặc `openai` |
| `OPENROUTER_API_KEY` | 🔒 |
| `OPENROUTER_APP`, `OPENROUTER_SITE` | Hiện trong bảng điều khiển OpenRouter để đối chiếu chi phí |
| `OPENAI_API_KEY` | 🔒 **Vẫn cần dù đã dùng OpenRouter** — xem cảnh báo dưới |
| `MISTRAL_API_KEY` | 🔒 Tuỳ chọn |

### Model

| Biến | Mặc định | Ghi chú |
|---|---|---|
| `OPENAI_CONTENT_MODEL` | `openrouter/auto` | Để OpenRouter tự chọn |
| `OPENAI_VISION_MODEL` | `google/gemini-2.5-flash` | ⚠️ **Không** để `openrouter/auto` — bộ định tuyến có thể chọn model chỉ xử lý chữ, bước đọc ảnh sẽ hỏng |
| `OPENAI_IMAGE_MODEL` | | Model sinh ảnh |
| `OPENAI_IMAGE_QUALITY`, `OPENAI_IMAGE_SIZE` | | Tham số ảnh |
| `OPENAI_TIMEOUT_MS`, `OPENAI_MAX_RETRIES` | | Thời gian chờ, số lần thử lại |

> ⚠️ **OpenRouter không sinh được ảnh** — không có endpoint tương ứng. Chức năng
> "Tạo lại ảnh đại diện" **luôn gọi thẳng OpenAI**, kể cả khi đang chọn
> OpenRouter. Vì vậy vẫn phải giữ `OPENAI_API_KEY`.

---

## 6. Google

| Biến | Vai trò |
|---|---|
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | Thư mục gốc cho đồng bộ Drive |
| `GOOGLE_APPLICATION_CREDENTIALS` | 🔒 Đường dẫn tệp khoá tài khoản dịch vụ |
| `GOOGLE_OAUTH_CLIENT_ID` | Đăng nhập Google |
| `GOOGLE_OAUTH_CLIENT_SECRET` | 🔒 Đăng nhập Google |
| `GOOGLE_REDIRECT_URI` | Lối thoát khi hạ tầng proxy làm địa chỉ suy ra không khớp |

### Ghi chú về `GOOGLE_REDIRECT_URI`

Địa chỉ chuyển hướng phải khớp **tuyệt đối từng ký tự** với khai báo ở Google
Cloud Console. Hệ thống tự suy ra từ header của yêu cầu, nhưng qua nhiều tầng
proxy các header này là **danh sách ngăn bởi dấu phẩy** — phải lấy giá trị đầu
tiên và bỏ cổng mặc định.

Nếu vẫn không khớp, đặt biến này bằng đúng chuỗi đã khai ở Google và hệ thống
dùng nguyên văn.

⚠️ Khách vào bằng `www.bioscope.vn` mà Google chỉ khai `bioscope.vn` sẽ lỗi.
Phải khai **cả hai** trong Google Console.

---

## 7. Cấu hình động trong admin

Những thứ sau **không cần biến môi trường** — chỉnh trong admin, có hiệu lực ngay:

| Nơi chỉnh | Nội dung |
|---|---|
| Hệ thống → Cài đặt AI | Nhà cung cấp, model, khoá API |
| Hệ thống → Khoá API tích hợp | Phát khoá, phân quyền, hạn dùng, giới hạn tần suất |
| Hệ thống → Cài đặt chat | Telegram bot token, chat id, câu chào |
| Hệ thống → Cài đặt đăng nhập | Bật/tắt Google, cho phép đăng ký mới |
| Cài đặt website | Liên hệ, mạng xã hội, mã đo lường, bật/tắt module |

Ô để trống trong admin thì hệ thống lấy từ biến môi trường tương ứng. Đây là
lựa chọn có chủ đích: bên nào không muốn để khoá trong cơ sở dữ liệu thì bỏ
trống ô và dùng biến môi trường.

---

## 8. Danh sách kiểm tra khi dựng môi trường mới

- [ ] Sao chép `.env.example` thành `.env`
- [ ] Sinh mới `PAYLOAD_SECRET`, `REVALIDATE_SECRET`, `POSTGRES_PASSWORD`
- [ ] Đặt `DATABASE_URI` dùng **tên dịch vụ Docker**, không phải `localhost`
- [ ] Đặt bốn địa chỉ công khai đúng tên miền thật
- [ ] Khai đủ địa chỉ chuyển hướng ở Google Console, **cả `www` lẫn không `www`**
- [ ] Đặt khoá AI vào admin hoặc `.env`
- [ ] Kiểm tra `.env` **không** nằm trong git: `git check-ignore dv-cms/.env`
- [ ] Chạy migration trước khi khởi động — xem [B5](B5-van-hanh.md)
