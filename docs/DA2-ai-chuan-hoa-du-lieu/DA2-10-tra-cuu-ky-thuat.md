<!--HOSO
phu_de: Hệ thống AI chuẩn hoá và cập nhật dữ liệu sản phẩm
pham_vi: Dự án DA2 — quản trị hệ thống và lập trình viên
ngay_lap: 24/08/2026
phien_ban: 1.0
nguoi_lap: Quân — Team phát triển, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 24/08/2026 | Ban hành lần đầu — tra cứu điểm truy cập, cấu hình, 16 sự cố
-->
# DA2 — SỔ TRA CỨU KỸ THUẬT
## Hệ thống AI chuẩn hoá và cập nhật dữ liệu sản phẩm

*Tài liệu tra cứu, không đọc tuần tự.*

---

# PHẦN A — ĐIỂM GIAO TIẾP LẬP TRÌNH

Toàn bộ là **điểm truy cập nội bộ**, chỉ nhân viên đã đăng nhập gọi được. Không có điểm nào mở cho bên ngoài.

## A1. Sinh nội dung

| Đường dẫn | Cách gọi | Quyền | Chức năng |
| :---- | :---- | :---- | :---- |
| `/api/ai-generate` | POST | Nhân viên | Xếp hàng một công việc cho một nguyên liệu |
| `/api/ai-generate/bulk` | POST | Nhân viên | Xếp hàng nhiều công việc |
| `/api/ai-generate/image` | POST | Nhân viên | Xếp hàng công việc chỉ tạo ảnh |
| `/api/ai-generate/jobs` | GET | Nhân viên | Danh sách công việc |
| `/api/ai-generate/jobs/:id` | GET | Nhân viên | Chi tiết một công việc, kèm nhật ký |
| `/api/ai-generate/queue-status` | GET | Nhân viên | Trạng thái hàng đợi |

## A2. Kho tài liệu và nhập dữ liệu

| Đường dẫn | Cách gọi | Chức năng |
| :---- | :---- | :---- |
| `/api/drive-sync` | POST | Chạy đồng bộ kho tài liệu |
| `/api/drive-sync/jobs` | GET | Danh sách lượt đồng bộ |
| `/api/drive-sync/jobs/:id` | GET | Chi tiết một lượt |
| `/api/drive-sync/jobs/:id/cancel` | POST | Huỷ lượt đồng bộ |
| `/api/csv-import` | POST | Nhập danh sách nguyên liệu từ tệp bảng |
| `/api/cms-sync` | POST | Chạy đồng bộ nội dung |
| `/api/cms-sync-runs` | GET | Danh sách lượt đồng bộ nội dung |
| `/api/cms-sync/source` | GET | Thông tin nguồn đồng bộ |

## A3. Nội dung và chất lượng dữ liệu

| Đường dẫn | Cách gọi | Chức năng |
| :---- | :---- | :---- |
| `/api/ingredients-content-export` | GET | Xuất nội dung nguyên liệu ra tệp |
| `/api/ingredients-content-import` | POST | Nạp nội dung từ tệp |
| `/api/duplicate-scan` | POST | Chạy quét trùng lặp |
| `/api/duplicate-scan/options` | GET | Tuỳ chọn so khớp |
| `/api/duplicate-scan/runs` | GET | Danh sách lượt quét |
| `/api/duplicate-scan/runs/:id` | GET | Kết quả một lượt |
| `/api/ingredient-duplicates` | GET | Danh sách nguyên liệu nghi trùng |

---

# PHẦN B — CẤU HÌNH

## B1. Bảng đối chiếu: ô trên giao diện ↔ biến môi trường

Bỏ trống ô trên giao diện thì hệ thống lấy biến môi trường tương ứng.

| Ô trên giao diện | Biến môi trường | Mặc định |
| :---- | :---- | :---- |
| Nhà cung cấp | `AI_PROVIDER` | `openrouter` |
| Khoá cổng trung gian | `OPENROUTER_API_KEY` | — |
| Tên ứng dụng | `OPENROUTER_APP` | `Bioscope CMS` |
| Địa chỉ nhận diện | `OPENROUTER_SITE` | — |
| Khoá OpenAI | `OPENAI_API_KEY` | — |
| Model sinh nội dung | `OPENAI_CONTENT_MODEL` | để cổng tự chọn |
| Model đọc ảnh | `OPENAI_VISION_MODEL` | — |
| Khoá cho sinh ảnh | `OPENAI_API_KEY` | — |
| Model viết mô tả ảnh | — | dùng model nội dung |
| Model tạo ảnh | `OPENAI_IMAGE_MODEL` | — |

## B2. Biến chỉ đặt qua môi trường

| Biến | Mặc định | Ý nghĩa |
| :---- | :---- | :---- |
| `MISTRAL_API_KEY` | — | Khoá dịch vụ nhận dạng chữ |
| `MISTRAL_OCR_MODEL` | — | Mô hình nhận dạng chữ |
| `AI_FILE_TIMEOUT_MS` | `150000` | Hạn giờ mỗi tệp |
| `AI_TEXT_MAX_CHARS` | `300000` | Trần dữ liệu gửi đi |
| `OPENAI_IMAGE_QUALITY` | — | Chất lượng ảnh |
| `OPENAI_IMAGE_SIZE` | — | Kích thước ảnh |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | — | Thư mục gốc kho tài liệu |
| `GOOGLE_APPLICATION_CREDENTIALS` | đường dẫn trong chứa | Tệp chứng thực tài khoản dịch vụ |

## B3. Biến ghi đè đơn giá

| Biến | Mặc định | Ghi chú |
| :---- | :---- | :---- |
| `OPENAI_PRICE_INPUT_PER_1M` | theo bảng | Đơn giá đầu vào, đô-la mỗi triệu đơn vị |
| `OPENAI_PRICE_OUTPUT_PER_1M` | theo bảng | Đơn giá đầu ra |
| `OPENAI_PRICE_PER_IMAGE` | `0.04` | Đơn giá mỗi ảnh |
| `MISTRAL_OCR_PRICE_PER_PAGE` | `0.004` | Đơn giá mỗi trang nhận dạng |
| `OPENAI_USD_TO_VND` | `25400` | Tỉ giá quy đổi |

Đặt bất kỳ biến nào trong hai biến đầu thì cờ *"đang dùng bảng giá dựng sẵn"* chuyển thành *"đang dùng đơn giá đã đặt"*.

## B4. Bảng đơn giá dựng sẵn

Tra tháng 07/2026, đơn vị đô-la mỗi triệu đơn vị:

| Mô hình | Đầu vào | Đầu vào đã lưu đệm | Đầu ra |
| :---- | :---- | :---- | :---- |
| `gpt-5.6-sol` | 5 | 0,5 | 30 |
| `gpt-5.6-terra` | 2,5 | 0,25 | 15 |
| `gpt-5.6-luna` | 1 | 0,1 | 6 |

Mô hình không có trong bảng → lấy mức `terra`, tức mức **trung bình**, không lấy mức rẻ nhất. Ước thấp hơn thực tế nguy hiểm hơn ước cao hơn.

Chênh lệch giữa `luna` và `terra` là **2,5 lần ở cả hai chiều** — chọn mô hình ảnh hưởng trực tiếp tới hoá đơn.

---

# PHẦN C — SỔ SỰ CỐ

*Mỗi mục ghi: dấu hiệu, nguyên nhân **đã xác minh**, xử lý, phòng.*

---

## SC-01 · Đồng bộ kho tài liệu trả về 0 tệp

| | |
| :---- | :---- |
| **Dấu hiệu** | Chạy đồng bộ, không báo lỗi, số tệp bằng 0 |
| **Nguyên nhân** | Ba khả năng cho cùng một triệu chứng: ① thư mục trống thật ② chưa chia sẻ thư mục cho tài khoản dịch vụ ③ kho nằm trên ổ dùng chung nhưng chưa bật cờ hỗ trợ |
| **Xử lý** | Kiểm lần lượt ba khả năng. Chia sẻ thư mục cho địa chỉ thư điện tử của tài khoản dịch vụ |
| **Phòng** | Ghi rõ bước chia sẻ thư mục vào tài liệu cài đặt — xem `DA2-08` A4 bước 6 |

---

## SC-02 · Bước đọc ảnh hỏng dù cấu hình đủ

| | |
| :---- | :---- |
| **Dấu hiệu** | PDF scan không đọc được; thông báo lỗi không nói rõ nguyên nhân |
| **Nguyên nhân** | Ô mô hình đọc ảnh để chế độ tự chọn; bộ định tuyến chọn một mô hình **chỉ xử lý chữ** |
| **Xử lý** | Ghi rõ tên một mô hình nhìn được vào ô mô hình đọc ảnh |
| **Phòng** | Cảnh báo ghi thẳng vào mô tả trường trong giao diện |

---

## SC-03 · Nút tạo lại ảnh báo lỗi

| | |
| :---- | :---- |
| **Dấu hiệu** | Mọi cấu hình đúng, sinh nội dung chạy tốt, riêng tạo ảnh báo lỗi |
| **Nguyên nhân** | **Cổng trung gian không có chức năng tạo ảnh.** Phần này luôn phải gọi thẳng nhà cung cấp có chức năng đó |
| **Xử lý** | Đặt khoá riêng ở thẻ Ảnh, hoặc đặt biến `OPENAI_API_KEY` |
| **Phòng** | Cảnh báo ghi thẳng vào mô tả thẻ Ảnh |

---

## SC-04 · Nhãn chỉ tiêu ghi vào dạng chuỗi JSON

| | |
| :---- | :---- |
| **Dấu hiệu** | Nhãn chỉ tiêu hiện ra dạng `{"vi":"...","en":"..."}` thay vì chữ |
| **Nguyên nhân** | Ghi thẳng đối tượng song ngữ vào trường thay vì ghi từng ngôn ngữ |
| **Xử lý** | Ghi riêng từng ngôn ngữ |
| **Phòng** | Trường đa ngữ phải ghi theo từng ngôn ngữ, không ghi cả đối tượng |

---

## SC-05 · Lỗi `Specs N > Label` không rõ nguyên nhân

| | |
| :---- | :---- |
| **Dấu hiệu** | Công việc lỗi ở bước ghi chỉ tiêu, thông báo khó hiểu |
| **Nguyên nhân** | Mô hình trả nhãn khi thì chuỗi, khi thì đối tượng song ngữ — **không nhất quán giữa các lượt gọi** |
| **Xử lý** | Ghi tạm hình dạng thật ra nhật ký để chẩn đoán, rồi viết lớp chuẩn hoá chấp nhận cả hai |
| **Phòng** | **Không giả định đầu ra của mô hình có hình dạng ổn định.** Mọi trường đều phải qua lớp chuẩn hoá |

Đây là sự cố sinh ra lớp chuẩn hoá — thành phần quan trọng thứ hai của DA2 sau cơ chế chống bịa.

---

## SC-06 · Lợi ích và ứng dụng chỉ có một ngôn ngữ

| | |
| :---- | :---- |
| **Dấu hiệu** | Trường danh sách chỉ có tiếng Việt, tiếng Anh trống |
| **Nguyên nhân** | Bỏ sót khi ghi trường danh sách song ngữ |
| **Xử lý** | Ghi vào cả hai ngôn ngữ |
| **Phòng** | Thêm trường song ngữ mới thì kiểm cả hai ngôn ngữ, không chỉ ngôn ngữ mặc định |

---

## SC-07 · Bảng biểu trong tài liệu mất cấu trúc

| | |
| :---- | :---- |
| **Dấu hiệu** | Chỉ tiêu kỹ thuật trích ra lộn xộn, cột lẫn vào nhau |
| **Nguyên nhân** | Trích chữ ra khỏi PDF **trước** khi gửi cho mô hình. Chữ mất bố cục bảng |
| **Xử lý** | **Gửi thẳng tệp gốc cho mô hình**, bỏ hẳn bước trích chữ |
| **Phòng** | Dữ liệu có cấu trúc thị giác (bảng, biểu đồ) thì đừng làm phẳng trước khi gửi |

---

## SC-08 · Tệp hỏng làm mất trắng cả công việc

| | |
| :---- | :---- |
| **Dấu hiệu** | Một PDF khó xử làm dịch vụ trả lỗi máy chủ; công việc lỗi hoàn toàn |
| **Nguyên nhân** | Hệ quả của SC-07: bỏ bước trích chữ nên **không còn gì để lùi về** |
| **Xử lý** | Gọi lại **không kèm tệp**. "Lùi về chỉ có tên" vẫn hơn không có gì |
| **Phòng** | Mỗi quyết định thiết kế đều mở ra một loại hỏng mới. Phải nghĩ tới nó ngay lúc quyết định |

---

## SC-09 · Lỗi máy chủ từ dịch vụ, không rõ nguyên nhân

| | |
| :---- | :---- |
| **Dấu hiệu** | Công việc lỗi, thông báo chỉ nói "server had an error" |
| **Nguyên nhân** | Không lấy đủ chi tiết lỗi từ dịch vụ |
| **Xử lý** | Lấy thêm mã trạng thái, loại lỗi, mã lỗi, tên tham số gây lỗi, ghi vào nhật ký |
| **Phòng** | Nhờ đó phân biệt được "dịch vụ quá tải, thử lại được" với "tệp có vấn đề, thử lại vô ích" |

---

## SC-10 · Chỉ tiêu cũ lẫn với chỉ tiêu mới

| | |
| :---- | :---- |
| **Dấu hiệu** | Sau khi chạy lại, danh sách chỉ tiêu có cả dòng cũ lẫn dòng mới |
| **Nguyên nhân** | Không xoá chỉ tiêu cũ trước khi ghi bộ mới |
| **Xử lý** | Xoá chỉ tiêu cũ trong lượt ghi chính |
| **Phòng** | Trường dạng danh sách phải quyết định rõ: thay thế hay bổ sung. Chỉ tiêu là **thay thế** |

---

## SC-11 · Lỗi ghi chỉ tiêu làm hỏng cả công việc

| | |
| :---- | :---- |
| **Dấu hiệu** | Nội dung sinh ra tốt nhưng công việc báo lỗi, không ghi được gì |
| **Nguyên nhân** | Lỗi ở một phần nhỏ làm hỏng toàn bộ lượt ghi |
| **Xử lý** | Tách lỗi: ghi chỉ tiêu lỗi thì ghi cảnh báo, phần còn lại vẫn ghi |
| **Phòng** | Dây chuyền nhiều bước thì lỗi ở bước phụ không được làm mất kết quả của bước chính |

---

## SC-12 · Khung nhật ký báo "Chưa có log" dù đã lưu

| | |
| :---- | :---- |
| **Dấu hiệu** | Công việc có nhật ký trong cơ sở dữ liệu nhưng giao diện báo trống |
| **Nguyên nhân** | Giao diện đọc sai nguồn dữ liệu |
| **Xử lý** | Sửa đường đọc |
| **Phòng** | Kiểm giao diện với dữ liệu thật, không chỉ kiểm phần ghi |

---

## SC-13 · Ảnh sinh ra không liên quan nguyên liệu

| | |
| :---- | :---- |
| **Dấu hiệu** | Ảnh đại diện chung chung, không phản ánh đặc điểm nguyên liệu |
| **Nguyên nhân** | Mô tả ảnh dựng từ **tên nguyên liệu suông** |
| **Xử lý** | Dựng mô tả ảnh từ **nội dung thật** đã sinh ra |
| **Phòng** | Chạy sinh nội dung trước, tạo ảnh sau |

---

## SC-14 · Chất lượng ảnh không đồng đều

| | |
| :---- | :---- |
| **Dấu hiệu** | Đổi mô hình tạo ảnh thì chất lượng thay đổi bất thường |
| **Nguyên nhân** | Mỗi họ mô hình hiểu tham số chất lượng khác nhau |
| **Xử lý** | Chuẩn hoá tham số theo họ mô hình |
| **Phòng** | Tham số của nhà cung cấp không phải chuẩn chung |

---

## SC-15 · Không nhận ra Google Docs nhập từ tệp bảng

| | |
| :---- | :---- |
| **Dấu hiệu** | Tệp Google Docs bị xếp vào loại không xác định |
| **Nguyên nhân** | Kiểu nội dung ghi dạng **rút gọn** trong tệp bảng nguồn |
| **Xử lý** | Nhận thêm dạng rút gọn |
| **Phòng** | Dữ liệu nhập từ nguồn ngoài có thể ở dạng biến thể. Bộ nhận loại phải khoan dung |

---

## SC-16 · Thao tác hệ quản trị chậm khi chạy AI

| | |
| :---- | :---- |
| **Dấu hiệu** | Chạy hàng loạt thì mọi thao tác trong hệ quản trị chậm hẳn; tin nhắn chat của khách bị dồn cục |
| **Nguyên nhân** | **Hàng đợi chạy chung tiến trình.** Môi trường đơn luồng nên bóc tách tệp chặn mọi lời gọi khác |
| **Xử lý tạm** | Chạy hàng loạt ngoài giờ cao điểm |
| **Xử lý gốc** | **Chưa làm** — tách sang tiến trình riêng |
| **Phòng** | Tác vụ nặng và tác vụ cần phản hồi nhanh không nên chung một tiến trình |

Đây là sự cố duy nhất trong sổ **chưa được xử lý gốc**. Xem `DA2-03` QĐ-06.

---

# PHẦN D — LỆNH THƯỜNG DÙNG

## D1. Kiểm tra hàng đợi

```bash
# Số công việc theo trạng thái
docker exec dvcms-db psql -U dvcms -d dvcms -c "
SELECT status, count(*) FROM ai_generate_jobs GROUP BY 1 ORDER BY 2 DESC;"

# Công việc lỗi gần đây
docker exec dvcms-db psql -U dvcms -d dvcms -c "
SELECT id, ingredient_name, phase, created_at
FROM ai_generate_jobs WHERE status='error'
ORDER BY created_at DESC LIMIT 20;"

# Công việc treo quá 30 phút
docker exec dvcms-db psql -U dvcms -d dvcms -c "
SELECT id, ingredient_name, status, created_at
FROM ai_generate_jobs
WHERE status NOT IN ('done','error','cancelled')
  AND created_at < now() - interval '30 minutes';"
```

## D2. Chi phí

```bash
# Tổng chi phí theo tháng (tiền Việt)
docker exec dvcms-db psql -U dvcms -d dvcms -c "
SELECT to_char(created_at,'YYYY-MM') AS thang,
       count(*) AS so_viec,
       sum((totals->'cost'->>'vnd')::numeric) AS tong_dong
FROM ai_generate_jobs WHERE status='done'
GROUP BY 1 ORDER BY 1 DESC;"

# 10 công việc tốn nhất
docker exec dvcms-db psql -U dvcms -d dvcms -c "
SELECT ingredient_name, (totals->'cost'->>'vnd')::numeric AS dong
FROM ai_generate_jobs WHERE status='done'
ORDER BY 2 DESC NULLS LAST LIMIT 10;"
```

## D3. Chất lượng dữ liệu

```bash
# Nguyên liệu còn cờ chờ duyệt
docker exec dvcms-db psql -U dvcms -d dvcms -c "
SELECT count(*) FROM ingredients WHERE needs_review = true;"

# Nguyên liệu chưa đồng bộ kho tài liệu
docker exec dvcms-db psql -U dvcms -d dvcms -c "
SELECT count(*) FROM ingredients WHERE file_count IS NULL OR file_count = 0;"
```

## D4. Kiểm tra bảo mật

```bash
# Không được có khoá trong mã nguồn
grep -rnE "sk-[a-zA-Z0-9]{20,}" apps packages --include=*.ts --include=*.tsx

# Không được có khoá trong nhật ký công việc
docker exec dvcms-db psql -U dvcms -d dvcms -c "
SELECT count(*) FROM ai_generate_jobs_logs WHERE message ILIKE '%sk-%';"

# Tệp chứng thực Google phải bị loại khỏi kho mã nguồn
git check-ignore -v apps/core-cms/credentials/service-account.json
```

Ba lệnh trên nên chạy trước mỗi lần đóng gói.

---

# PHẦN E — VIỆC CÒN LẠI

| # | Việc | Mức | Ghi chú |
| :---- | :---- | :---- | :---- |
| 1 | **Tách xử lý tệp sang tiến trình riêng** | **Cao** | SC-16, sự cố duy nhất chưa xử lý gốc |
| 2 | Đối chiếu ước tính chi phí với hoá đơn thật | **Cao** | Chưa làm lần nào; PC-11 chưa kiểm chứng được |
| 3 | Cập nhật bảng đơn giá mô hình | Trung bình | Tra tháng 07/2026 |
| 4 | Đặt ngưỡng cảnh báo chi phí tự động | Trung bình | Hiện phải tự theo dõi |
| 5 | Kiểm thử tự động cho lớp chuẩn hoá | Trung bình | Lớp hay hỏng nhất |
| 6 | Đo tỉ lệ trường người duyệt phải sửa | Trung bình | Biến cảm nhận thành số đo được |
| 7 | Tổng quát hoá dây chuyền cho nhóm dữ liệu khác | Thấp | Hiện gắn chặt với nguyên liệu — có chủ ý |
