<!--HOSO
phu_de: Hệ thống AI chuẩn hoá và cập nhật dữ liệu sản phẩm
pham_vi: Dự án DA2
ngay_lap: 15/08/2026
phien_ban: 1.1
nguoi_lap: QuanNH — Team Lead, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 15/08/2026 | Ban hành lần đầu
lich_su: 1.1 | 24/08/2026 | Bổ sung quy trình kiểm soát chi phí định kỳ
-->
# DA2 — CÔNG ĐOẠN 5, 6, 7
## Hoàn thiện · Đóng gói · Cài đặt · Chuyển giao · Bảo trì · Phát hành

---

# PHẦN A — CÔNG ĐOẠN 5: HOÀN THIỆN VÀ ĐÓNG GÓI

## A1. Đặc thù đóng gói của DA2

DA2 **không có ảnh chứa riêng**. Nó nằm trong ảnh chứa của hệ quản trị (DA1), vì:

- Dùng chung lớp truy cập cơ sở dữ liệu
- Giao diện là bốn thành phần cắm vào hệ quản trị
- Hàng đợi chạy chung tiến trình (xem `DA2-03` QĐ-06)

Do đó **đóng gói DA2 = đóng gói hệ quản trị**. Quy trình ở `DA1-08` phần A.

Điều này cũng là **hạn chế đã biết**: không triển khai DA2 riêng được, và không mở rộng tài nguyên cho riêng DA2 được.

## A2. Danh sách rà soát riêng của DA2

Ngoài 13 mục ở `DA1-08` A1, DA2 có thêm bảy mục:

| # | Mục rà soát | Cách kiểm | Đạt |
| :---- | :---- | :---- | :----: |
| 1 | Không có khoá dịch vụ trong mã nguồn | `grep -rnE "sk-[a-zA-Z0-9]{20,}" apps packages` | ☐ |
| 2 | Không có khoá trong tệp mẫu cấu hình | Đọc `.env.example` | ☐ |
| 3 | **Không ghi khoá vào nhật ký công việc** | Chạy một việc, đọc toàn bộ nhật ký | ☐ |
| 4 | Tệp chứng thực dịch vụ Google **không** nằm trong kho mã nguồn | `git check-ignore -v apps/core-cms/credentials/` | ☐ |
| 5 | Bảng đơn giá mô hình còn đúng với giá hiện hành | Tra bảng giá nhà cung cấp | ☐ |
| 6 | Tỉ giá quy đổi còn hợp lý | Tra tỉ giá | ☐ |
| 7 | Không còn kịch bản thử nghiệm gọi mô hình thật | Rà thư mục `scripts` | ☐ |

> **Mục 3 quan trọng hơn vẻ ngoài của nó.** Nhật ký công việc lưu trong cơ sở dữ liệu và **biên tập viên đọc được ngay trên giao diện**. Khoá lọt vào đó là lộ cho mọi người dùng hệ quản trị, không chỉ cho quản trị viên.

## A3. Biến môi trường riêng của DA2

| Biến | Bắt buộc | Ý nghĩa |
| :---- | :----: | :---- |
| `AI_PROVIDER` | | `openrouter` (mặc định) hoặc `openai` |
| `OPENROUTER_API_KEY` | ⚠ | Khoá cổng trung gian |
| `OPENROUTER_APP` | | Tên hiện trong bảng điều khiển nhà cung cấp |
| `OPENROUTER_SITE` | | Địa chỉ nhận diện ứng dụng |
| `OPENAI_API_KEY` | ⚠ | Khoá OpenAI. **Bắt buộc nếu dùng chức năng tạo ảnh** |
| `MISTRAL_API_KEY` | | Khoá dịch vụ nhận dạng chữ |
| `MISTRAL_OCR_MODEL` | | Mô hình nhận dạng chữ |
| `OPENAI_CONTENT_MODEL` | | Mô hình sinh nội dung |
| `OPENAI_VISION_MODEL` | | Mô hình đọc ảnh |
| `OPENAI_IMAGE_MODEL` | | Mô hình tạo ảnh |
| `OPENAI_IMAGE_QUALITY`, `OPENAI_IMAGE_SIZE` | | Tham số ảnh |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | ✅ | Thư mục gốc kho tài liệu |
| `GOOGLE_APPLICATION_CREDENTIALS` | ✅ | Đường dẫn tệp chứng thực tài khoản dịch vụ |
| `AI_FILE_TIMEOUT_MS` | | Hạn giờ mỗi tệp, mặc định 150.000 |
| `AI_TEXT_MAX_CHARS` | | Trần dữ liệu gửi đi, mặc định 300.000 |
| `OPENAI_PRICE_INPUT_PER_1M` | | Ghi đè đơn giá vào |
| `OPENAI_PRICE_OUTPUT_PER_1M` | | Ghi đè đơn giá ra |
| `OPENAI_PRICE_PER_IMAGE` | | Ghi đè đơn giá mỗi ảnh |
| `MISTRAL_OCR_PRICE_PER_PAGE` | | Ghi đè đơn giá mỗi trang nhận dạng |
| `OPENAI_USD_TO_VND` | | Tỉ giá quy đổi, mặc định 25.400 |

**Ghi chú về hai ô đánh dấu ⚠:** ít nhất một trong hai khoá phải có, tuỳ nhà cung cấp đang chọn. Riêng chức năng tạo ảnh **luôn** cần khoá OpenAI, kể cả khi đang dùng cổng trung gian.

## A4. Tài khoản dịch vụ Google

Điểm cấu hình dễ sai nhất khi cài đặt lần đầu.

| Bước | Việc |
| :---- | :---- |
| 1 | Tạo tài khoản dịch vụ trong bảng điều khiển Google Cloud |
| 2 | Bật quyền truy cập Google Drive cho dự án |
| 3 | Tải tệp chứng thực dạng JSON |
| 4 | Đặt tệp vào máy chủ, **ngoài kho mã nguồn** |
| 5 | Gắn tệp vào chứa qua khai báo ổ đĩa |
| 6 | **Chia sẻ thư mục kho tài liệu cho địa chỉ thư điện tử của tài khoản dịch vụ** |

> **Bước 6 là bước hay quên nhất.** Tài khoản dịch vụ có tệp chứng thực hợp lệ nhưng chưa được chia sẻ thư mục thì mọi lượt quét đều trả về rỗng, **không báo lỗi rõ ràng** — chỉ là "không tìm thấy tệp nào". Triệu chứng giống hệt thư mục rỗng thật.

Kho tài liệu của công ty nằm trên ổ dùng chung, nên mọi lời gọi đều bật cờ hỗ trợ ổ chung. Không bật thì kết quả cũng rỗng, cùng một triệu chứng.

---

# PHẦN B — CÔNG ĐOẠN 6: CÀI ĐẶT, CHUYỂN GIAO, BẢO TRÌ

## B1. Cài đặt lần đầu

```bash
# 1. Đặt biến môi trường cho DA2 trong .env (xem A3)

# 2. Đặt tệp chứng thực tài khoản dịch vụ Google
mkdir -p apps/core-cms/credentials
cp ~/service-account.json apps/core-cms/credentials/
chmod 600 apps/core-cms/credentials/service-account.json

# 3. Kiểm tệp này KHÔNG vào kho mã nguồn
git check-ignore -v apps/core-cms/credentials/service-account.json

# 4. Dựng lại và khởi động
docker compose build cms && docker compose up -d

# 5. Cấu hình trên giao diện: Hệ thống → Cài đặt AI
#    (nếu chọn cách cấu hình động thay vì biến môi trường)

# 6. Chạy thử trên MỘT nguyên liệu trước khi chạy hàng loạt
```

> **Bước 6 không được bỏ.** Cấu hình sai mà chạy hàng loạt ngay là tốn tiền thật cho hàng loạt kết quả hỏng. Chạy một nguyên liệu, đọc kỹ kết quả và nhật ký, rồi mới mở rộng.

## B2. Danh sách kiểm tra sau triển khai

| # | Kiểm tra | Cách kiểm | Đạt |
| :---- | :---- | :---- | :----: |
| 1 | Mục Cài đặt AI mở được | Vào Hệ thống → Cài đặt AI | ☐ |
| 2 | Đồng bộ kho tài liệu trả về đúng số tệp | Chạy đồng bộ một nguyên liệu | ☐ |
| 3 | Chạy dây chuyền một nguyên liệu thành công | Bấm Tạo nội dung tự động | ☐ |
| 4 | Nhật ký có đủ các bước | Mở khung nhật ký | ☐ |
| 5 | **Kết quả ở trạng thái nháp** | Xem trạng thái nguyên liệu | ☐ |
| 6 | **Cờ chờ duyệt được bật** | Xem nguyên liệu | ☐ |
| 7 | Chi phí có cả đô-la và đồng | Xem bảng hàng đợi | ☐ |
| 8 | **Không có khoá nào trong nhật ký** | Đọc toàn bộ nhật ký | ☐ |
| 9 | Đọc được một tệp PDF scan | Chạy trên nguyên liệu có hồ sơ scan | ☐ |
| 10 | Sinh hàng loạt xếp đúng số việc | Thử với 3 nguyên liệu | ☐ |

## B3. Bảo trì định kỳ

| Việc | Tần suất | Cách làm |
| :---- | :---- | :---- |
| **Đối chiếu chi phí ước tính với hoá đơn** | Hàng tháng | Cộng chi phí các công việc trong tháng, so với hoá đơn nhà cung cấp |
| Cập nhật bảng đơn giá mô hình | Hàng quý | Tra bảng giá nhà cung cấp, cập nhật hoặc đặt biến ghi đè |
| Cập nhật tỉ giá quy đổi | Hàng quý | Đặt biến `OPENAI_USD_TO_VND` |
| Dọn bản ghi công việc cũ | Hàng quý | Xoá công việc đã xong quá 6 tháng, giữ bản ghi lỗi |
| Rà nhật ký công việc lỗi | Hàng tuần | Lọc trạng thái lỗi, xem nguyên nhân lặp lại |
| **Đo tỉ lệ trường người duyệt phải sửa** | Hàng quý | Chỉ số chất lượng thật của dây chuyền |
| Kiểm hạn tệp chứng thực Google | Hàng năm | Tệp chứng thực có thể bị thu hồi |

### B3.1 Quy trình kiểm soát chi phí hàng tháng

```
1. Vào bảng hàng đợi, lọc theo tháng
2. Cộng cột chi phí (đồng)
3. So với hoá đơn nhà cung cấp cùng kỳ
4. Lệch > 10% thì:
   ├─ Kiểm cờ "đang dùng bảng giá dựng sẵn"
   ├─ Có → cập nhật đơn giá theo hoá đơn thật
   └─ Không → kiểm xem có hệ thống nào khác dùng chung khoá
5. Ghi kết quả đối chiếu vào sổ theo dõi
```

Bước 4 nhánh cuối là lý do trường `appName` tồn tại: nó hiện trong bảng điều khiển nhà cung cấp, giúp phân biệt chi phí của DA2 với chi phí của hệ thống khác dùng chung tài khoản.

### B3.2 Ngưỡng cảnh báo chi phí

Đề xuất để ban giám đốc chốt:

| Ngưỡng | Hành động |
| :---- | :---- |
| Chi phí tháng vượt ......... đồng | Báo ban giám đốc |
| Một công việc vượt ......... đồng | Kiểm tra nguyên nhân — thường là tệp quá lớn |
| Chi phí trung bình mỗi nguyên liệu tăng > 50% | Kiểm xem mô hình có bị đổi không |

Hiện **chưa đặt ngưỡng cảnh báo tự động**. Nằm trong danh sách việc còn lại.

## B4. Xử lý sự cố thường gặp

| Dấu hiệu | Nguyên nhân thường gặp | Xử lý |
| :---- | :---- | :---- |
| Đồng bộ trả về 0 tệp | Chưa chia sẻ thư mục cho tài khoản dịch vụ | Chia sẻ thư mục |
| Đồng bộ trả 0 tệp dù đã chia sẻ | Kho nằm trên ổ dùng chung, chưa bật cờ hỗ trợ | Kiểm cấu hình |
| Bước đọc ảnh hỏng | Mô hình đọc ảnh để chế độ tự chọn | Ghi rõ một mô hình nhìn được |
| Nút Tạo lại ảnh báo lỗi | Thiếu khoá OpenAI cho tạo ảnh | Đặt khoá ở thẻ Ảnh |
| Công việc treo ở `extracting` | Tệp quá lớn | Chờ hết hạn giờ, hoặc huỷ |
| Nội dung sinh ra nghèo nàn | Nguyên liệu có ít hoặc không có tệp nguồn | Đồng bộ kho tài liệu trước |
| Chi phí một công việc cao bất thường | Tệp rất lớn, hoặc nhiều trang scan | Kiểm bộ đếm trong công việc |
| Thao tác hệ quản trị chậm khi chạy AI | **Hàng đợi chung tiến trình** | Hạn chế chạy hàng loạt giờ cao điểm |

## B5. Bàn giao

| # | Hạng mục | Hình thức |
| :---- | :---- | :---- |
| 1 | Tài khoản dịch vụ Google và tệp chứng thực | Bàn giao riêng |
| 2 | Khoá truy cập các dịch vụ AI | Bàn giao riêng, **không** qua kho mã nguồn |
| 3 | Thông tin tài khoản nhà cung cấp để tra chi phí | Bàn giao riêng |
| 4 | Hướng dẫn sử dụng | `DA2-09` |
| 5 | Sổ tra cứu kỹ thuật | `DA2-10` |
| 6 | Bảng đơn giá đang áp dụng | Trong `DA2-03` mục 5.2 |
| 7 | Đã hướng dẫn quy trình duyệt kết quả | Trực tiếp |

> **Mục 7 quan trọng nhất trong bàn giao DA2.** Người tiếp nhận phải hiểu ranh giới giữa trường loại A và loại B, và hiểu vì sao trường loại A **bắt buộc** đối chiếu tài liệu gốc. Bàn giao thiếu phần này thì toàn bộ cơ chế bảo vệ chất lượng mất hiệu lực ở khâu cuối cùng.

---

# PHẦN C — CÔNG ĐOẠN 7: PHÁT HÀNH

## C1. Hình thức phát hành

DA2 là **công cụ nội bộ**, không phát hành ra ngoài công ty.

| Thành phần | Nơi truy cập | Đối tượng |
| :---- | :---- | :---- |
| Thanh sinh hàng loạt | `admin.bioscope.vn` → Nguyên liệu | Biên tập viên |
| Menu công cụ nguyên liệu | Trong biểu mẫu nguyên liệu | Biên tập viên |
| Bảng hàng đợi | `admin.bioscope.vn` → Vận hành | Biên tập viên, quản trị viên |
| Cài đặt AI | `admin.bioscope.vn` → Hệ thống | **Chỉ quản trị viên sửa** |

## C2. Bằng chứng đã phát hành

| Bằng chứng | Cách kiểm chứng |
| :---- | :---- |
| Có bản ghi công việc đã chạy thật | Xem bảng `ai_generate_jobs` trong cơ sở dữ liệu |
| Có nội dung nguyên liệu do dây chuyền sinh ra | Xem nguyên liệu có cờ chờ duyệt hoặc đã duyệt |
| Có chi phí thật đã phát sinh | Đối chiếu hoá đơn nhà cung cấp |
| Có nhật ký từng lượt chạy | Mở khung nhật ký một công việc bất kỳ |
| Có dấu vết tệp nguồn trên nguyên liệu | Xem thẻ Đồng bộ |

Đây là nhóm bằng chứng mạnh: **dữ liệu vận hành tích luỹ theo thời gian thật**, có mốc thời gian, không dựng ngược lại được.

## C3. Quyền sở hữu

> **Quan hệ hai bên.** Phần mềm do **Công ty OPTIMAI** thực hiện theo hợp đồng và bàn giao cho **Công ty Bioscope**. Quyền sở hữu mã nguồn nghiệp vụ chuyển sang Bioscope sau khi nghiệm thu và bàn giao, theo điều khoản hợp đồng — chi tiết ở `00-7-hop-dong-ban-giao-va-quyen-so-huu.md` mục 4.


| Nội dung | Chủ sở hữu |
| :---- | :---- |
| Toàn bộ mã nguồn dây chuyền | OPTIMAI → **Bioscope** *(sau bàn giao)* |
| Hợp đồng dữ liệu 20 nhóm trường | OPTIMAI → **Bioscope** *(sau bàn giao)* |
| Câu lệnh gửi mô hình, gồm quy tắc chống bịa | OPTIMAI → **Bioscope** *(sau bàn giao)* |
| Nội dung nguyên liệu sinh ra | **Bioscope** *(từ đầu)* |
| Mô hình ngôn ngữ | Nhà cung cấp dịch vụ |
| Dịch vụ nhận dạng chữ | Nhà cung cấp dịch vụ |

Ranh giới chi tiết ở `DA2-01` mục 9.

## C4. Chi phí vận hành

Đây là mục kế toán cần cho việc hạch toán.

| Khoản mục | Loại | Nguồn số liệu |
| :---- | :---- | :---- |
| Gọi mô hình sinh nội dung | Theo mức sử dụng | Hoá đơn nhà cung cấp; đối chiếu bộ đếm trong hệ thống |
| Gọi mô hình đọc ảnh | Theo mức sử dụng | Như trên |
| Tạo ảnh | Theo số ảnh | Như trên |
| Nhận dạng chữ | Theo số trang | Hoá đơn dịch vụ tương ứng |
| Lưu trữ kho tài liệu | Định kỳ | Hoá đơn dịch vụ lưu trữ |

**Hệ thống tự ghi lại chi phí ước tính của từng lượt chạy**, có cả tiền Việt. Đây là bằng chứng đối chiếu tốt cho kế toán: không chỉ có hoá đơn tổng của nhà cung cấp mà còn có phân bổ chi tiết tới từng nguyên liệu.

## C5. Hạn chế cần công bố khi bàn giao

Ghi rõ để người tiếp nhận không hiểu nhầm năng lực hệ thống:

| Hạn chế | Nội dung |
| :---- | :---- |
| **Không thay thế người duyệt** | Kết quả luôn là bản nháp. Không có chế độ tự xuất bản |
| **Chỉ tốt bằng hồ sơ nguồn** | Hồ sơ thiếu thông số thì không có nguồn nào để trích. Hệ thống sẽ để trống — đó là hành vi đúng |
| **Không tạo được ảnh nếu thiếu khoá riêng** | Cổng trung gian không có chức năng tạo ảnh |
| **Chạy chung tiến trình với hệ quản trị** | Chạy hàng loạt làm chậm các thao tác khác |
| **Bảng đơn giá có thể lạc hậu** | Tra tháng 07/2026; ghi đè được bằng biến môi trường |
| **Phụ thuộc dịch vụ ngoài** | Dịch vụ ngừng thì dây chuyền dừng. Nhập tay vẫn hoạt động bình thường |

Dòng cuối đáng nhấn mạnh: **DA2 dừng không làm DA1 dừng.** Website và hệ quản trị vẫn chạy đầy đủ, chỉ mất phần tự động hoá.
