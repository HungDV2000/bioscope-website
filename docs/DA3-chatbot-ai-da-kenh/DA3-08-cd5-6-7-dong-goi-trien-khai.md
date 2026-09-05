<!--HOSO
phu_de: Chatbot AI đa kênh BioBot — Bioscope Assistants
pham_vi: Dự án DA3
ngay_lap: 05/06/2026
phien_ban: 1.1
nguoi_lap: QuanNH — Team Lead, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 05/06/2026 | Ban hành lần đầu
lich_su: 1.1 | 12/06/2026 | Bổ sung danh sách kiểm tra sau triển khai và quy trình bảo trì
-->
# DA3 — CÔNG ĐOẠN 5, 6, 7
## Hoàn thiện · Đóng gói · Cài đặt · Chuyển giao · Bảo trì · Phát hành

> **Tài liệu liên quan:** `docs/SRS_MVP.md` mục 10 và 10.5, `docs/env-checklist.md` trong kho mã nguồn dự án mô tả triển khai ở mức lệnh cụ thể.

---

# PHẦN A — CÔNG ĐOẠN 5: HOÀN THIỆN VÀ ĐÓNG GÓI

## A1. Danh sách rà soát trước khi đóng gói

| # | Mục rà soát | Cách kiểm | Đạt |
| :---- | :---- | :---- | :----: |
| 1 | Không có khoá truy cập trong mã nguồn | `grep -rnE "(sk-\|AIza\|Bearer )[A-Za-z0-9_-]{20,}" bioscope/` | ☐ |
| 2 | **Không có khoá trong tệp định nghĩa quy trình** | Rà `n8n-workflows/*.json` | ☐ |
| 3 | Tệp chứng thực Google không nằm trong kho mã nguồn | `git check-ignore -v local_files/*.json` | ☐ |
| 4 | Tệp `.env` bị loại khỏi kho mã nguồn | `git check-ignore -v .env` | ☐ |
| 5 | **Mọi cổng gắn vào `127.0.0.1`** | Đọc `docker-compose.yml` | ☐ |
| 6 | Dựng được ảnh chứa máy chủ | `docker compose build bioscope_api` | ☐ |
| 7 | Dựng được ảnh chứa giao diện | `docker compose build bioscope_frontend` | ☐ |
| 8 | Phiên bản các ảnh nền được ghim | Đọc `docker-compose.yml` | ☐ |
| 9 | 44 quy trình đã xuất ra tệp và lưu trong kho | `ls n8n-workflows/*.json \| wc -l` | ☐ |
| 10 | Không còn quy trình thử nghiệm bật ở chế độ chạy thật | Kiểm trên giao diện nền tảng điều phối | ☐ |
| 11 | Chốt chặn dược và phân quyền công cụ đã kiểm thử | `DA3-07` mục 3 | ☐ |

> **Mục 2 riêng của DA3.** Tệp định nghĩa quy trình là JSON và **có thể chứa khoá nhúng thẳng** nếu người dựng quy trình gõ khoá vào ô thay vì dùng kho chứng thực của nền tảng. Đây là lỗi rất dễ mắc và rất khó thấy — tệp JSON dài hàng nghìn dòng.

> **Mục 5 là mục quan trọng nhất.** Xem A4.

## A2. Cấu trúc bản đóng gói — sáu dịch vụ

| Dịch vụ | Ảnh nền | Ghim phiên bản | Cổng nội bộ |
| :---- | :---- | :---- | :---- |
| `biobot_n8n` | `n8nio/n8n` | **2.13.4** | 15678 |
| `biobot_qdrant` | `qdrant/qdrant` | **v1.17.1** | 16333, 16334 |
| `biobot_postgres` | `postgres` | **16-alpine** | 15432 |
| `biobot_redis` | `redis` | **8-alpine** | 16379 |
| `biobot_bioscope_api` | tự dựng | — | 18000 |
| `biobot_bioscope_frontend` | tự dựng | — | 18080 |

### Vì sao ghim phiên bản chính xác

Chú thích ngay trong tệp cấu hình ghi rõ phiên bản trước đó:

```yaml
image: n8nio/n8n:2.13.4            # Stable 2026-03-29 | Trước: 2.6.3
image: qdrant/qdrant:v1.17.1       # Stable 2026-03-29 | Trước: v1.13.4
image: postgres:16-alpine          # Giữ 16 cho volume hiện có | PG17 chỉ khi đã migrate dữ liệu
```

Ba chú thích này làm được ba việc:

| Chú thích | Giá trị |
| :---- | :---- |
| Ghi phiên bản cũ | Nâng cấp hỏng thì biết lùi về đâu |
| Ghi ngày xác định phiên bản ổn định | Biết thông tin này cũ tới mức nào |
| **Ghi điều kiện nâng cấp** | *"PG17 chỉ khi đã migrate dữ liệu"* — chặn người sau nâng cấp bừa và làm hỏng kho dữ liệu |

Dòng thứ ba là loại chú thích có giá trị cao nhất: nó ngăn một hành động nguy hiểm mà người thực hiện không biết là nguy hiểm.

### Giấy phép

| Thành phần | Giấy phép | Ghi chú trong cấu hình |
| :---- | :---- | :---- |
| Redis 8 | Không còn thuần BSD | *"Muốn BSD license thuần (như Redis ≤7.2): thay bằng image: valkey/valkey:8-alpine (Linux Foundation fork)"* |

Ghi chú này cho thấy đội **có rà soát giấy phép** và ghi lại phương án thay thế — quan trọng khi tổ chức có yêu cầu về loại giấy phép được dùng.

## A3. Bốn kho dữ liệu bền vững

| Kho | Nội dung | Mất thì sao |
| :---- | :---- | :---- |
| `n8n_data` | 44 quy trình, chứng thực, lịch sử chạy | **Mất toàn bộ logic nghiệp vụ** |
| `qdrant_data` | Kho vectơ | Phải nạp lại toàn bộ tri thức — tốn tiền và thời gian |
| `postgres_data` | 30 bảng | **Mất toàn bộ dữ liệu nghiệp vụ** |
| `redis_data` | Nhật ký ghi thêm của bộ nhớ đệm | Chấp nhận được |

Ba kho đầu **phải sao lưu**. Kho thứ tư không cần — nội dung trong đó được phép mất.

## A4. Quy tắc bảo mật cổng — điểm quan trọng nhất

```yaml
ports:
  - "127.0.0.1:${BIOBOT_N8N_HOST_PORT:-15678}:5678"
  - "127.0.0.1:${BIOBOT_QDRANT_HTTP_HOST_PORT:-16333}:6333"
  - "127.0.0.1:${BIOBOT_POSTGRES_HOST_PORT:-15432}:5432"
  - "127.0.0.1:${BIOBOT_REDIS_HOST_PORT:-16379}:6379"
  - "127.0.0.1:${BIOSCOPE_API_PORT:-18000}:8000"
  - "127.0.0.1:${BIOSCOPE_FRONTEND_PORT:-18080}:80"
```

> ### ⚠ Tiền tố `127.0.0.1:` là bắt buộc trên MỌI dòng
>
> Bỏ tiền tố này — viết `- "5678:5678"` như phần lớn hướng dẫn cài đặt trên mạng — thì dịch vụ mở ra **mọi giao diện mạng**, tức là ra Internet.
>
> Hậu quả cụ thể:
>
> | Dịch vụ lộ ra | Hậu quả |
> | :---- | :---- |
> | Nền tảng điều phối | Kẻ tấn công đọc được toàn bộ quy trình **và mọi chứng thực lưu trong đó** |
> | Kho vectơ | Đọc được toàn bộ tri thức công ty |
> | Cơ sở dữ liệu | Đọc được dữ liệu khách hàng và hoá đơn |
>
> **Đây là lỗi cấu hình một dòng dẫn tới rò rỉ toàn bộ dữ liệu.** Phải kiểm bằng cách quét cổng **từ máy bên ngoài**, không quét từ chính máy chủ — quét từ máy chủ luôn thấy cổng mở.

---

# PHẦN B — CÔNG ĐOẠN 6: CÀI ĐẶT, CHUYỂN GIAO, BẢO TRÌ

## B1. Yêu cầu máy chủ

| Hạng mục | Tối thiểu | Khuyến nghị |
| :---- | :---- | :---- |
| Bộ xử lý | 4 nhân | 8 nhân |
| Bộ nhớ | 8 GB | 16 GB |
| Đĩa | 80 GB | 160 GB |
| Hệ điều hành | Linux có Docker | |

**Yêu cầu cao hơn DA1 vì sáu dịch vụ chạy song song**, trong đó kho vectơ tốn bộ nhớ đáng kể.

## B2. Cài đặt lần đầu

```bash
# 1. Lấy mã nguồn
git clone <địa chỉ kho> /path/to/biobot
cd /path/to/biobot

# 2. Cấu hình
cp .env.example .env
nano .env

# 3. Sinh khoá mã hoá cho nền tảng điều phối — BẮT BUỘC
openssl rand -hex 16
#    Đặt vào N8N_ENCRYPTION_KEY
#    Đặt N8N_BASIC_AUTH_USER và N8N_BASIC_AUTH_PASSWORD (mật khẩu mạnh)

# 4. Tệp chứng thực tài khoản dịch vụ Google
cp ~/service-account.json local_files/
#    Đặt GOOGLE_SERVICE_ACCOUNT_JSON=/files/ten-file.json

# 5. Khởi động
docker compose up -d
docker ps

# 6. Khởi tạo cơ sở dữ liệu (nếu kho dữ liệu cũ chưa có bảng)
docker exec -i biobot_postgres psql -U biobot_admin -d biobot_db \
  < postgres/init/01_create_tables.sql
docker exec -i biobot_postgres psql -U biobot_admin -d biobot_db \
  < postgres/init/02_bioscope.sql

# 7. Nạp 44 quy trình vào nền tảng điều phối

# 8. Cấu hình chứng thực trong nền tảng điều phối
#    (KHÔNG gõ khoá thẳng vào ô của từng quy trình)

# 9. Nạp tri thức lần đầu — chạy quy trình điều phối đồng bộ

# 10. Cấu hình máy chủ web đứng trước
```

> **Bước 3 không được bỏ.** Khoá mã hoá của nền tảng điều phối bảo vệ mọi chứng thực lưu trong đó. Không đặt thì nền tảng dùng khoá mặc định — ai có tệp dữ liệu cũng giải mã được.

> **Bước 8 quan trọng.** Chứng thực phải đặt trong kho chứng thực của nền tảng, không gõ thẳng vào ô của từng quy trình. Gõ thẳng thì khoá bị ghi vào tệp định nghĩa quy trình, và tệp đó nằm trong kho mã nguồn.

## B3. Cấu hình máy chủ web đứng trước

| Tên miền | Chuyển tới | Ghi chú |
| :---- | :---- | :---- |
| Cổng chat | `127.0.0.1:18080` | Công khai |
| Giao diện lập trình | `127.0.0.1:18000` | Công khai, có xác thực |
| Webhook các kênh | `127.0.0.1:15678` | **Chỉ mở đường dẫn webhook**, không mở giao diện quản trị của nền tảng |
| Giao diện điều phối | `127.0.0.1:15678` | **Nên giới hạn theo dải địa chỉ** |

> **Dòng thứ ba là điểm dễ sai.** Nền tảng điều phối vừa nhận webhook (phải mở ra Internet để các nền tảng nhắn tin gọi vào) vừa có giao diện quản trị (không được mở). Phải cấu hình máy chủ web chỉ chuyển tiếp **đường dẫn webhook**, chặn phần còn lại.

## B4. Danh sách kiểm tra sau triển khai

| # | Kiểm tra | Cách kiểm | Đạt |
| :---- | :---- | :---- | :----: |
| 1 | Sáu dịch vụ đang chạy | `docker compose ps` | ☐ |
| 2 | **Quét cổng từ máy ngoài — không thấy dịch vụ nào** | `nmap` từ máy khác | ☐ |
| 3 | Cổng chat mở được | Mở trình duyệt | ☐ |
| 4 | Đăng nhập được | Thử ba vai trò | ☐ |
| 5 | Menu hiện đúng theo vai trò | Đăng nhập từng vai trò | ☐ |
| 6 | Hỏi một câu, có trả lời | Thử câu hỏi thật | ☐ |
| 7 | **Chốt chặn dược hoạt động** | Hỏi "liều dùng bao nhiêu" | ☐ |
| 8 | **Phân quyền công cụ hoạt động** | Vai trò `sales` hỏi về hoá đơn | ☐ |
| 9 | Kênh Zalo nhận và trả lời | Gửi tin thử | ☐ |
| 10 | Các kênh nhắn tin khác | Gửi tin thử từng kênh | ☐ |
| 11 | Truy hồi tri thức trả kết quả đúng | Hỏi câu cần tra tài liệu | ☐ |
| 12 | Nhật ký AI ghi lại lượt hỏi | Xem màn hình nhật ký | ☐ |
| 13 | Kiểm tra sức khoẻ chạy | Xem màn hình sức khoẻ | ☐ |
| 14 | Sao lưu tự động chạy | Xem bảng nhật ký sao lưu | ☐ |
| 15 | Chuyển người thật hoạt động | Thử luồng chuyển | ☐ |

> **Mục 2, 7, 8 là ba mục không được bỏ.** Ba mục này kiểm ba cơ chế an toàn cốt lõi. Chúng có thể hỏng mà **hệ thống vẫn chạy bình thường** — nghĩa là không kiểm thì không biết.

## B5. Quy trình nâng cấp

```bash
# 1. SAO LƯU — BẮT BUỘC, cả ba kho
docker exec biobot_postgres pg_dump -U biobot_admin biobot_db \
  > ~/backup-db-$(date +%F-%H%M).sql
docker run --rm -v biobot_qdrant_data:/q -v ~/:/b alpine \
  tar czf /b/backup-qdrant-$(date +%F-%H%M).tar.gz -C /q .
docker run --rm -v biobot_n8n_data:/n -v ~/:/b alpine \
  tar czf /b/backup-n8n-$(date +%F-%H%M).tar.gz -C /n .

# 2. Lấy mã nguồn mới
git pull

# 3. Áp chuyển đổi cấu trúc dữ liệu (nếu có)
docker exec biobot_bioscope_api alembic upgrade head

# 4. Dựng lại
docker compose build bioscope_api bioscope_frontend

# 5. Khởi động
docker compose up -d

# 6. Nạp quy trình mới hoặc quy trình đã sửa

# 7. Chạy danh sách kiểm tra B4
```

> **Sao lưu cả ba kho, không chỉ cơ sở dữ liệu.** Kho vectơ mất thì phải nạp lại toàn bộ tri thức — tốn tiền gọi mô hình và tốn thời gian. Kho của nền tảng điều phối mất thì **mất toàn bộ 44 quy trình và mọi chứng thực**.

## B6. Bảo trì định kỳ

| Việc | Tần suất | Cách làm |
| :---- | :---- | :---- |
| Kiểm sao lưu chạy đúng | Hàng tuần | Xem bảng nhật ký sao lưu |
| **Diễn tập khôi phục** | Hàng quý | Khôi phục vào môi trường thử, kiểm dữ liệu đủ |
| Xem nhật ký lỗi | Hàng tuần | Lọc lỗi lặp lại |
| **Xem hàng đợi việc chết** | Hàng tuần | Việc nằm đó là việc chưa ai xử lý |
| Đối chiếu chi phí gọi mô hình | Hàng tháng | Cộng đơn vị tiêu trong nhật ký AI, so hoá đơn |
| **Rà mẫu câu trả lời** | Hàng tháng | Đọc 20 lượt hỏi đáp ngẫu nhiên, tìm câu sai |
| **Kiểm chốt chặn dược** | Hàng quý | Chạy lại bộ ca kiểm thử `DA3-07` mục 3.1 |
| **Kiểm phân quyền công cụ** | Hàng quý | Chạy lại bộ ca kiểm thử `DA3-07` mục 3.2 |
| Kiểm hạn khoá truy cập các kênh | Hàng tháng | Xem bảng khoá |
| Đồng bộ tri thức | Tự động | Theo lịch của quy trình điều phối |
| Nâng cấp vá lỗi bảo mật | Hàng quý | Rà soát, kiểm thử, rồi mới áp |

> **Hai mục kiểm an toàn hàng quý là bắt buộc.** Chốt chặn dược và phân quyền công cụ có thể hỏng âm thầm sau một lần sửa mã hoặc thêm công cụ mới. Chạy lại bộ ca kiểm thử là cách duy nhất để biết chúng còn hoạt động.

> **Mục "rà mẫu câu trả lời" là công cụ đo chất lượng thật.** Nhật ký AI chứa hội thoại thật; đọc 20 lượt ngẫu nhiên mỗi tháng cho biết trợ lý đang trả lời tốt tới đâu — điều mà không chỉ số kỹ thuật nào nói được.

## B7. Xử lý sự cố thường gặp

| Dấu hiệu | Nguyên nhân thường gặp | Xử lý |
| :---- | :---- | :---- |
| Một kênh ngừng nhận tin | Khoá truy cập hết hạn | Kiểm quy trình làm mới khoá; xem bảng khoá |
| Trợ lý trả lời chậm hẳn | Kho vectơ chậm, hoặc dịch vụ mô hình chậm | Xem cột thời gian phản hồi trong nhật ký AI |
| Trợ lý trả lời thiếu thông tin | Tài liệu chưa nạp, hoặc bóc tách hỏng | Kiểm **số đoạn đã cắt** ở màn hình tài liệu |
| Khách nhận hai câu trả lời | Chống trùng sự kiện không chạy | Kiểm bộ nhớ đệm còn sống không |
| Một việc lỗi lặp mãi | Chưa đưa vào hàng đợi việc chết | Kiểm quy trình xử lý lỗi |
| Chi phí tăng đột biến | Bộ nhớ đệm không hoạt động, hoặc có vòng lặp gọi công cụ | Xem nhật ký AI, tìm phiên có nhiều lượt gọi |
| Chốt chặn dược chặn nhầm câu hợp lệ | Từ khoá quá rộng | Ghi nhận câu bị chặn nhầm, tinh chỉnh danh sách từ khoá |

## B8. Bàn giao

| # | Hạng mục | Hình thức |
| :---- | :---- | :---- |
| 1 | Mã nguồn, kèm toàn bộ lịch sử phát triển | Kho mã nguồn |
| 2 | 44 tệp định nghĩa quy trình | Trong kho mã nguồn |
| 3 | **7.600+ dòng tài liệu kỹ thuật** | Thư mục `docs/` |
| 4 | Bộ hồ sơ DA3 — 10 tài liệu | Bản `.md` và `.docx` |
| 5 | Khoá mã hoá nền tảng điều phối | **Bàn giao riêng** |
| 6 | Chứng thực các kênh nhắn tin | **Bàn giao riêng** |
| 7 | Khoá dịch vụ mô hình | **Bàn giao riêng** |
| 8 | Tệp chứng thực tài khoản dịch vụ Google | **Bàn giao riêng** |
| 9 | Bản sao lưu ba kho dữ liệu | Tệp |
| 10 | Tài khoản quản trị | Bàn giao riêng, đổi mật khẩu ngay |
| 11 | **Đã hướng dẫn ba cơ chế an toàn** | Trực tiếp |

> **Mục 11 quan trọng nhất trong bàn giao DA3.** Người tiếp nhận phải hiểu:
>
> 1. Vì sao chốt chặn dược viết bằng mã chứ không viết trong câu lệnh — và **không được chuyển nó sang câu lệnh cho "gọn"**
> 2. Vì sao danh sách công cụ phải lọc **trước khi** gửi cho mô hình
> 3. Vì sao mọi cổng phải gắn vào `127.0.0.1`
>
> Ba điều này trông như chi tiết kỹ thuật nhỏ, nhưng mỗi điều là một lớp bảo vệ. Người không hiểu lý do sẽ vô tình gỡ chúng khi "dọn dẹp" mã nguồn.

### Biên bản bàn giao

**Bên giao:** Công ty **OPTIMAI** — đại diện: ...........................

**Bên nhận:** Công ty **Bioscope** — đại diện: ...........................

**Ngày:** .................. **Phiên bản:** ..................

| # | Hạng mục | Đã nhận | Ghi chú |
| :---- | :---- | :----: | :---- |
| 1–11 | Theo bảng trên | ☐ | |

*Đại diện OPTIMAI ký:* ...........................  *Đại diện Bioscope ký:* ...........................

---

# PHẦN C — CÔNG ĐOẠN 7: PHÁT HÀNH

## C1. Hình thức phát hành

Phần mềm **phục vụ hoạt động kinh doanh của công ty**, không bán bản sao.

| Thành phần | Người dùng | Trạng thái |
| :---- | :---- | :---- |
| Cổng chat web | Nhân viên kinh doanh, kế toán, quản trị | Đang vận hành |
| Kênh Zalo | Khách hàng | Đang vận hành |
| Kênh Telegram, Messenger, WhatsApp | Khách hàng | Đã dựng quy trình |
| Kênh thư điện tử | Khách hàng | Đã dựng quy trình |
| Giao diện quản trị | Quản trị viên | Đang vận hành |

## C2. Bằng chứng đã phát hành

| Bằng chứng | Cách kiểm chứng |
| :---- | :---- |
| **Hội thoại thật với người dùng thật** | Bảng `ai_interaction_logs` |
| Có tài khoản người dùng thật, nhiều vai trò | Bảng `users` |
| Có khách hàng thật từ nhiều kênh | Bảng `customers` |
| Có tài liệu đã nạp vào kho tri thức | Bảng `documents`, kho vectơ |
| Có nhật ký vận hành tích luỹ | Các bảng nhật ký |
| Có lịch sử phân loại ý định | Bảng `intent_logs` |

Bảng `ai_interaction_logs` là bằng chứng mạnh nhất: mỗi dòng là một lượt hỏi đáp thật, có mốc thời gian, mô hình đã dùng, số đơn vị tiêu, thời gian phản hồi. **Dữ liệu này chỉ tích luỹ được theo thời gian thật.**

## C3. Quyền sở hữu

> **Quan hệ hai bên.** Phần mềm do **Công ty OPTIMAI** thực hiện theo hợp đồng và bàn giao cho **Công ty Bioscope**. Quyền sở hữu mã nguồn nghiệp vụ chuyển sang Bioscope sau khi nghiệm thu và bàn giao, theo điều khoản hợp đồng — chi tiết ở `00-7-hop-dong-ban-giao-va-quyen-so-huu.md` mục 4.


| Nội dung | Chủ sở hữu |
| :---- | :---- |
| 44 quy trình tự động hoá | OPTIMAI → **Bioscope** *(sau bàn giao)* |
| Toàn bộ mã nguồn máy chủ và giao diện | OPTIMAI → **Bioscope** *(sau bàn giao)* |
| 14 công cụ trợ lý và bảng phân quyền | OPTIMAI → **Bioscope** *(sau bàn giao)* |
| Chốt chặn dược | OPTIMAI → **Bioscope** *(sau bàn giao)* |
| Mô hình dữ liệu 30 bảng | OPTIMAI → **Bioscope** *(sau bàn giao)* |
| Tri thức trong kho vectơ | **Bioscope** *(từ đầu)* |
| 7.600+ dòng tài liệu kỹ thuật | OPTIMAI → **Bioscope** *(sau bàn giao)* |
| Nền tảng điều phối, kho vectơ, cơ sở dữ liệu | Tác giả tương ứng, theo giấy phép mã nguồn mở |
| Mô hình ngôn ngữ, mô hình sinh vectơ | Nhà cung cấp dịch vụ |
| Nền tảng nhắn tin | Nhà cung cấp dịch vụ |

Ranh giới chi tiết ở `DA3-01` mục 11.

## C4. Chi phí vận hành

| Khoản mục | Loại | Nguồn số liệu |
| :---- | :---- | :---- |
| Thuê máy chủ | Định kỳ | Hoá đơn nhà cung cấp hạ tầng |
| Gọi mô hình ngôn ngữ | Theo mức dùng | Hoá đơn; đối chiếu cột đơn vị tiêu trong nhật ký AI |
| Gọi mô hình sinh vectơ | Theo mức dùng | Như trên |
| Tài khoản chính thức các kênh | Định kỳ | Hoá đơn nền tảng |
| Lưu trữ kho tài liệu | Định kỳ | Hoá đơn dịch vụ lưu trữ |

**Hệ thống tự ghi số đơn vị tiêu của từng lượt hỏi đáp**, đối chiếu được với hoá đơn nhà cung cấp — bằng chứng tốt cho kế toán.

## C5. Hạn chế cần công bố khi bàn giao

| Hạn chế | Nội dung |
| :---- | :---- |
| **Không tư vấn y tế** | Có chủ ý, không phải thiếu sót. Chốt chặn dược chặn mọi câu hỏi loại này |
| **Chốt chặn dược có thể chặn nhầm** | Câu hỏi hợp lệ chứa từ khoá vẫn bị chặn. Chấp nhận — chặn thừa rẻ hơn lọt |
| Chỉ tốt bằng tri thức đã nạp | Tài liệu chưa nạp thì trợ lý không biết. Sẽ nói rõ không có, không bịa |
| Giới hạn 5 lượt gọi công cụ | Câu hỏi rất phức tạp có thể trả lời chưa đủ |
| Phụ thuộc dịch vụ ngoài | Dịch vụ mô hình ngừng thì trợ lý dừng. Chuyển người thật vẫn hoạt động |
| Phụ thuộc nền tảng nhắn tin | Nền tảng đổi giao diện lập trình thì kênh đó cần cập nhật |
| **Mô tả thay đổi trong kho mã nguồn sơ sài** | Bù lại bằng 7.600+ dòng tài liệu kỹ thuật. Đã ghi ở `DA3-06` mục 3 |
