<!--HOSO
phu_de: Hạ tầng, công cụ và môi trường phát triển
pham_vi: Toàn công ty
ngay_lap: 12/01/2026
phien_ban: 1.2
nguoi_lap: Quân — Team phát triển, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 12/01/2026 | Ban hành lần đầu, hạ tầng dự án DA3
lich_su: 1.1 | 09/07/2026 | Bổ sung hạ tầng dự án DA1 và DA2
lich_su: 1.2 | 03/09/2026 | Cập nhật phiên bản nền tảng và bảng quản lý bí mật
-->
# HẠ TẦNG, CÔNG CỤ VÀ MÔI TRƯỜNG PHÁT TRIỂN

*Tài liệu chung — áp dụng cho cả ba dự án DA1, DA2, DA3.*

Tài liệu này mô tả phương tiện sản xuất của **Công ty OPTIMAI**: dùng máy móc gì, công cụ gì, tổ chức môi trường làm việc ra sao. Đây là bằng chứng bổ trợ cho hoạt động sản xuất phần mềm — một đơn vị chỉ mua phần mềm về dùng thì không cần môi trường phát triển, không cần kho mã nguồn, không cần môi trường kiểm thử riêng.

---

## 1. Ba tầng môi trường

Công ty tách ba môi trường riêng biệt. Đây là điểm phân biệt rõ giữa *phát triển phần mềm* và *sử dụng phần mềm*.

| Môi trường | Chạy ở đâu | Dữ liệu | Ai truy cập | Mục đích |
| :---- | :---- | :---- | :---- | :---- |
| **Phát triển** | Máy tính cá nhân của lập trình viên | Dữ liệu thử, tự sinh | Lập trình viên | Viết mã, chạy thử tại chỗ |
| **Kiểm thử** | Cơ sở dữ liệu nháp trên máy phát triển | Bản sao cấu trúc của hệ thống thật, dữ liệu giả | Lập trình viên, người kiểm thử | Kiểm chứng kịch bản chuyển đổi dữ liệu, chạy ca kiểm thử |
| **Vận hành** | Máy chủ riêng | Dữ liệu thật của công ty | Người dùng cuối | Phục vụ hoạt động kinh doanh |

### Vì sao phải có môi trường kiểm thử riêng

Thay đổi cấu trúc cơ sở dữ liệu là thao tác không hoàn tác được. Chạy nhầm một lệnh trên hệ thống thật có thể mất dữ liệu vĩnh viễn.

Cách làm của đội: tạo một cơ sở dữ liệu nháp **sao chép đúng cấu trúc** của hệ thống thật, áp kịch bản chuyển đổi lên đó, kiểm tra kết quả, chạy lại lần thứ hai để chắc chắn không hỏng khi chạy trùng, đối chiếu toàn bộ danh sách cột với bản chuẩn — đạt hết mới đụng vào hệ thống thật. Quy trình chi tiết ở `00-5` mục 5.

---

## 2. Hạ tầng vận hành

### 2.1 DA1 + DA2 — Website và hệ quản trị

Bốn dịch vụ đóng gói bằng ảnh chứa, chạy trên cùng một máy chủ:

| Dịch vụ | Tên chứa | Ảnh nền | Vai trò |
| :---- | :---- | :---- | :---- |
| Cơ sở dữ liệu | `dvcms-db` | `postgres:16-alpine` | Lưu toàn bộ nội dung, người dùng, hội thoại |
| Hệ quản trị | `dvcms-app` | `dv-cms-cms` (tự dựng) | Giao diện quản trị + toàn bộ giao diện lập trình |
| Cổng thông tin | `dvcms-frontend` | tự dựng | Trang web công khai đa ngữ |
| Cổng xem trước | `dvcms-preview-proxy` | `dv-cms-cms` | Cho biên tập viên xem bản nháp trước khi xuất bản |

Hai kho dữ liệu bền vững: `pgdata` (cơ sở dữ liệu) và `media` (tệp tải lên).

Cấu hình khởi động lại: `unless-stopped` — máy chủ khởi động lại thì dịch vụ tự lên, không cần người can thiệp.

### 2.2 DA3 — Chatbot AI đa kênh

Sáu dịch vụ:

| Dịch vụ | Tên chứa | Ảnh nền | Vai trò |
| :---- | :---- | :---- | :---- |
| Điều phối quy trình | `biobot_n8n` | `n8nio/n8n:2.13.4` | Chạy 44 quy trình tự động hoá |
| Kho vectơ | `biobot_qdrant` | `qdrant/qdrant:v1.17.1` | Lưu vectơ ngữ nghĩa phục vụ truy hồi tri thức |
| Cơ sở dữ liệu | `biobot_postgres` | `postgres:16-alpine` | Lưu phiên chat, người dùng, nhật ký |
| Bộ nhớ đệm | `biobot_redis` | `redis:8-alpine` | Đệm kết quả, chống xử lý trùng sự kiện |
| Dịch vụ máy chủ | `biobot_bioscope_api` | tự dựng | Giao diện lập trình nghiệp vụ |
| Giao diện web | `biobot_bioscope_frontend` | tự dựng | Cổng chat và trang quản trị |

**Điểm đáng chú ý về bảo mật:** mọi cổng dịch vụ đều gắn vào `127.0.0.1`, không mở ra mạng ngoài. Truy cập từ Internet đi qua máy chủ web đứng trước. Kho vectơ, cơ sở dữ liệu và bộ nhớ đệm vì thế không thể chạm tới từ bên ngoài, kể cả khi biết địa chỉ máy chủ.

---

## 3. Công cụ phát triển

| Nhóm | Công cụ | Dùng để làm gì |
| :---- | :---- | :---- |
| Quản lý mã nguồn | Git | Ghi nhận mọi thay đổi, giữ lịch sử phát triển |
| Lưu trữ mã nguồn từ xa | Dịch vụ lưu trữ mã nguồn | Sao lưu, phòng mất máy |
| Soạn thảo mã | Trình soạn thảo mã nguồn | Viết mã, gợi ý, soát lỗi tại chỗ |
| Kiểm tra kiểu dữ liệu | TypeScript compiler | Bắt lỗi kiểu trước khi chạy |
| Soát lỗi tĩnh | ESLint | Bắt mẫu mã dễ sinh lỗi |
| Định dạng mã | Prettier | Thống nhất hình thức mã |
| Quản lý gói | pnpm (DA1/DA2), pip (DA3) | Cài và ghim phiên bản thư viện |
| Điều phối dựng | Turborepo | Dựng nhiều gói trong một kho, dùng lại kết quả cũ |
| Đóng gói | Docker | Đóng gói ứng dụng thành ảnh chứa chạy được ở mọi nơi |
| Kiểm tra cơ sở dữ liệu | psql, pg_dump | Xem cấu trúc thật, sao lưu, đối chiếu |

---

## 4. Nền tảng và thư viện chính

### 4.1 DA1 + DA2

| Thành phần | Phiên bản ghim | Vai trò |
| :---- | :---- | :---- |
| TypeScript | 5.9.3 | Ngôn ngữ lập trình |
| Next.js | 16.2.9 | Bộ dựng ứng dụng web |
| React | 19.2.7 | Thư viện dựng giao diện |
| Payload | 3.85.1 | Bộ khung hệ quản trị nội dung |
| `@payloadcms/db-postgres` | 3.85.1 | Lớp kết nối cơ sở dữ liệu |
| `openai` | ^5.8.2 | Thư viện gọi mô hình ngôn ngữ |
| `googleapis` | ^148.0.0 | Kết nối kho tài liệu Google Drive |

### 4.2 DA3

| Thành phần | Phiên bản ghim | Vai trò |
| :---- | :---- | :---- |
| FastAPI | 0.115.5 | Bộ khung dịch vụ web |
| Uvicorn | 0.32.1 | Máy chủ ứng dụng |
| SQLAlchemy | 2.0.36 | Lớp truy cập cơ sở dữ liệu |
| Alembic | 1.14.0 | Quản lý thay đổi cấu trúc dữ liệu |
| Pydantic | 2.10.3 | Kiểm chứng dữ liệu vào/ra |
| `qdrant-client` | 1.12.1 | Thư viện làm việc với kho vectơ |
| `redis` | 5.2.0 | Thư viện bộ nhớ đệm |
| `openai` | 1.57.0 | Thư viện gọi mô hình ngôn ngữ |
| `httpx` | 0.28.0 | Gọi dịch vụ ngoài |

### Vì sao ghim phiên bản chính xác

Ghim phiên bản (`5.9.3` thay vì `^5.9.0`) đảm bảo bản dựng hôm nay và bản dựng sáu tháng sau cho ra cùng kết quả. Không ghim thì thư viện tự nâng cấp, một thay đổi ở đâu đó có thể làm hỏng hệ thống mà không ai đụng vào mã.

Bài học thực tế: TypeScript phải ghim đúng `5.9.3`. Bản mới hơn thay đổi cách suy luận kiểu, làm hàng loạt tệp không biên dịch được.

---

## 5. Dịch vụ bên ngoài

Ba dự án có dùng dịch vụ bên ngoài. Nói rõ ranh giới: đây là **nguyên liệu đầu vào**, không phải sản phẩm công ty tuyên bố sở hữu.

| Dịch vụ | Dùng cho | Vai trò |
| :---- | :---- | :---- |
| OpenRouter | DA2, DA3 | Cổng trung gian tới nhiều mô hình ngôn ngữ, tự chọn mô hình phù hợp theo yêu cầu |
| OpenAI | DA2, DA3 | Mô hình ngôn ngữ, mô hình đọc ảnh, mô hình sinh ảnh, mô hình sinh vectơ |
| Google Drive API | DA2, DA3 | Đọc kho tài liệu nguồn |
| Telegram Bot API | DA1, DA3 | Kênh nhắn tin |
| Zalo OA API | DA3 | Kênh nhắn tin |
| Meta (Messenger, WhatsApp) | DA3 | Kênh nhắn tin |

**OPTIMAI tự viết phần nào:** toàn bộ cách gọi các dịch vụ này — dựng câu lệnh, cắt tài liệu thành đoạn, chọn đoạn liên quan, kiểm chứng kết quả trả về, xử lý khi dịch vụ lỗi, thử lại, đặt hạn giờ, ước tính chi phí, chuyển kênh về người thật. Dịch vụ ngoài chỉ trả lời một câu hỏi; biến nó thành hệ thống dùng được là phần OPTIMAI làm.

---

## 6. Quản lý bí mật

| Loại bí mật | Nơi lưu | Ai xem được |
| :---- | :---- | :---- |
| Chuỗi kết nối cơ sở dữ liệu | Biến môi trường trên máy chủ | Quản trị hệ thống |
| Khoá bí mật của hệ quản trị | Biến môi trường | Quản trị hệ thống |
| Khoá gọi mô hình AI | Bảng cấu hình trong hệ quản trị, chỉ quản trị viên đọc/sửa; hoặc biến môi trường | Quản trị viên |
| Khoá bot nhắn tin | Như trên | Quản trị viên |
| Khoá xác thực webhook | Như trên | Quản trị viên |

**Quy tắc tuyệt đối:** không viết bí mật vào mã nguồn. Tệp `.env` nằm trong danh sách loại trừ của công cụ quản lý mã nguồn.

Về việc lưu khoá AI trong cơ sở dữ liệu: đây là đánh đổi có chủ ý. Đặt trong hệ quản trị thì quản trị viên đổi được nhà cung cấp và mô hình ngay trên giao diện, không cần lập trình viên và không cần triển khai lại. Bù lại, khoá nằm trong cơ sở dữ liệu nên quyền đọc bị siết chỉ còn quản trị viên. Ai không chấp nhận đánh đổi này thì bỏ trống ô cấu hình và đặt biến môi trường — hệ thống hỗ trợ cả hai đường.

---

## 7. Sao lưu

| Đối tượng | Cách sao lưu | Tần suất |
| :---- | :---- | :---- |
| Cơ sở dữ liệu | `pg_dump` ra tệp, hoặc chức năng sao lưu sẵn có trong hệ quản trị | Trước mỗi lần triển khai; định kỳ |
| Tệp tải lên | Sao chép kho `media` | Trước mỗi lần triển khai; định kỳ |
| Mã nguồn | Đẩy lên kho lưu trữ từ xa | Mỗi lần ghi nhận thay đổi |
| Cấu hình | Tệp `.env` lưu riêng, ngoài kho mã nguồn | Khi có thay đổi |

**Quy tắc bắt buộc:** sao lưu trước khi chạy bất kỳ kịch bản chuyển đổi cấu trúc dữ liệu nào trên hệ thống thật. Không có ngoại lệ.

---

## 8. Chi phí hạ tầng

Phần này để bộ phận kế toán đối chiếu với chứng từ chi. Chi phí hạ tầng là bằng chứng bổ trợ: công ty **chi tiền thật** để vận hành hệ thống do mình phát triển.

| Khoản mục | Loại chi phí | Ghi chú |
| :---- | :---- | :---- |
| Thuê máy chủ | Định kỳ hàng tháng | *(kế toán điền)* |
| Tên miền `bioscope.vn` | Định kỳ hàng năm | *(kế toán điền)* |
| Chứng chỉ bảo mật | Miễn phí hoặc định kỳ | *(kế toán điền)* |
| Gọi mô hình AI | Theo mức sử dụng | *(kế toán điền)* |
| Lưu trữ mã nguồn từ xa | Định kỳ hoặc miễn phí | *(kế toán điền)* |

DA2 có sẵn chức năng **ước tính chi phí gọi mô hình** ngay trong hệ thống: mỗi công việc AI ghi lại số lượng đơn vị đã dùng và quy đổi ra tiền, có cả quy đổi sang đồng Việt Nam. Số liệu này đối chiếu được với hoá đơn của nhà cung cấp — chi tiết ở `DA2-10-tra-cuu-ky-thuat.md`.
