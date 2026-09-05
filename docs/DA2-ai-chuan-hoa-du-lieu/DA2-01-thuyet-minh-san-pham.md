<!--HOSO
phu_de: Hệ thống AI chuẩn hoá và cập nhật dữ liệu sản phẩm
pham_vi: Dự án DA2
ngay_lap: 20/06/2026
phien_ban: 1.1
nguoi_lap: HungDV — Product Owner, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 20/06/2026 | Ban hành lần đầu
lich_su: 1.1 | 24/08/2026 | Cập nhật quy mô và trạng thái thực tế
-->
# DA2 — THUYẾT MINH SẢN PHẨM
## Hệ thống AI chuẩn hoá và cập nhật dữ liệu sản phẩm

---

## 1. Tên sản phẩm

**Tên đầy đủ:** Hệ thống tự động chuẩn hoá và cập nhật dữ liệu nguyên liệu bằng trí tuệ nhân tạo

**Tên rút gọn nội bộ:** Dây chuyền AI nguyên liệu

**Vận hành tại:** `admin.bioscope.vn` — là nhóm chức năng bên trong hệ quản trị nội dung

**Thời gian phát triển:** 09/07/2026 – nay

---

## 2. Sản phẩm này là gì

Một **dây chuyền xử lý tự động** biến hồ sơ kỹ thuật thô của nhà cung cấp thành dữ liệu nguyên liệu có cấu trúc, song ngữ, sẵn sàng đăng lên website.

```
   Kho tài liệu Google Drive
   (TDS, COA, bảng giá, catalogue — PDF, ảnh scan,
    Google Docs, Sheets, Slides, CSV)
              ↓
   ① QUÉT      — liệt kê tệp của từng nguyên liệu
              ↓
   ② TẢI VỀ    — tải nội dung tệp
              ↓
   ③ BÓC TÁCH  — đọc chữ; PDF scan và ảnh thì dùng
                 mô hình nhận dạng hoặc mô hình đọc ảnh
              ↓
   ④ SINH      — gọi mô hình ngôn ngữ, sinh dữ liệu có
                 cấu trúc theo hợp đồng dữ liệu chặt
              ↓
   ⑤ KIỂM      — chuẩn hoá hình dạng, đối chiếu danh mục,
                 loại bỏ giá trị không hợp lệ
              ↓
   ⑥ GHI       — ghi vào hệ quản trị Ở TRẠNG THÁI NHÁP
              ↓
   ⑦ DUYỆT     — người thật đọc lại rồi mới xuất bản
```

**Bước ⑦ là bắt buộc.** Hệ thống không bao giờ tự xuất bản. Chi tiết ở mục 6.

---

## 3. Vấn đề sản phẩm giải quyết

### 3.1 Hiện trạng trước khi có hệ thống

Mỗi nguyên liệu nhập về kèm một bộ hồ sơ của nhà cung cấp: phiếu thông số kỹ thuật, phiếu phân tích, bảng giá, catalogue. Tài liệu ở đủ định dạng — PDF chữ, PDF scan, ảnh chụp, bảng tính, tài liệu Google.

Nhân viên phải:

| Việc | Thời gian ước tính mỗi nguyên liệu |
| :---- | :---- |
| Mở và đọc toàn bộ hồ sơ | 15–30 phút |
| Chép thông số kỹ thuật vào biểu mẫu | 20–40 phút |
| Viết mô tả, lợi ích, ứng dụng | 30–60 phút |
| Dịch sang tiếng Anh | 30–60 phút |
| Viết phần tối ưu tìm kiếm | 10 phút |
| **Tổng** | **~2–3,5 giờ** |

### 3.2 Ba vấn đề

| Vấn đề | Hậu quả |
| :---- | :---- |
| **Chậm** | Vài trăm nguyên liệu × 3 giờ = hàng trăm giờ công. Nguyên liệu mới về nằm chờ hàng tuần mới lên được website |
| **Không đồng đều** | Mỗi người viết một kiểu. Nguyên liệu này 10 dòng thông số, nguyên liệu kia 2 dòng. Khách so sánh không được |
| **Sai sót khi chép tay** | Chép nhầm một chữ số của chỉ tiêu kỹ thuật là sai thông tin gửi tới khách hàng công nghiệp |

### 3.3 Sau khi có hệ thống

| Chỉ số | Trước | Sau |
| :---- | :---- | :---- |
| Thời gian mỗi nguyên liệu | 2–3,5 giờ | **5–15 phút máy chạy + 10–20 phút người duyệt** |
| Xử lý hàng loạt | Không | **Chọn nhiều nguyên liệu, xếp hàng, chạy nền** |
| Độ đồng đều | Tuỳ người viết | Cùng một hợp đồng dữ liệu cho mọi nguyên liệu |
| Song ngữ | Dịch riêng một lượt | Sinh đồng thời hai ngôn ngữ |
| Truy vết | Không | Mỗi lượt chạy có nhật ký từng bước và chi phí |

---

## 4. Phạm vi chức năng

| # | Chức năng | Mô tả |
| :---- | :---- | :---- |
| 1 | Đồng bộ kho tài liệu | Quét thư mục Google Drive, đối chiếu tệp với từng nguyên liệu |
| 2 | Bóc tách nội dung | Đọc PDF chữ, PDF scan, ảnh, Google Docs/Sheets/Slides, văn bản, CSV |
| 3 | Nhận dạng chữ trong ảnh | Hai đường: mô hình nhận dạng chuyên dụng, hoặc mô hình đọc ảnh |
| 4 | Sinh nội dung có cấu trúc | 20 nhóm trường, song ngữ, theo hợp đồng dữ liệu chặt |
| 5 | Sinh ảnh đại diện | Viết mô tả ảnh rồi gọi mô hình tạo ảnh |
| 6 | Xử lý hàng loạt | Chọn nhiều nguyên liệu hoặc toàn bộ, xếp hàng chạy nền |
| 7 | Hàng đợi công việc | Theo dõi trạng thái, nhật ký từng bước, huỷ được giữa chừng |
| 8 | Ước tính chi phí | Đếm đơn vị đã dùng, quy ra đô-la và **đồng Việt Nam** |
| 9 | Nhập từ tệp bảng | Nhập danh sách nguyên liệu từ CSV |
| 10 | Xuất/nhập nội dung | Đưa nội dung ra tệp để sửa hàng loạt rồi nạp lại |
| 11 | Quét trùng lặp | Phát hiện nguyên liệu trùng tên hoặc gần trùng |
| 12 | Cấu hình động | Đổi nhà cung cấp và mô hình ngay trên giao diện, không triển khai lại |

---

## 5. Người dùng

| Nhóm | Dùng để làm gì |
| :---- | :---- |
| Biên tập viên nội dung | Chạy sinh nội dung cho nguyên liệu mới, đọc duyệt kết quả |
| Quản trị viên | Cấu hình nhà cung cấp, mô hình, theo dõi chi phí |
| Bộ phận kỹ thuật sản phẩm | Kiểm tra tính chính xác của thông số được trích |

Hệ thống **không** phục vụ khách hàng bên ngoài. Đây là công cụ nội bộ.

---

## 6. Nguyên tắc nền tảng: máy đề xuất, người quyết định

Đây là nguyên tắc chi phối toàn bộ thiết kế của DA2. Nói rõ ngay từ đầu để không ai hiểu nhầm về vai trò của trí tuệ nhân tạo trong hệ thống này.

### 6.1 Ba mức tự động, hệ thống chọn mức thấp nhất

| Mức | Nghĩa | Có dùng không |
| :---- | :---- | :---- |
| Máy làm và tự công bố | AI sinh nội dung, đăng thẳng lên website | **Không** |
| Máy làm, người duyệt | AI sinh nội dung, lưu bản nháp, người đọc rồi mới xuất bản | ✅ **Đang dùng** |
| Máy gợi ý, người tự nhập | AI đề xuất, người gõ lại | Không cần thiết |

Kết quả AI sinh ra **luôn** lưu ở trạng thái nháp. Không có đường nào để nội dung do AI sinh ra tự lên website.

### 6.2 Vì sao không cho tự xuất bản

Dữ liệu nguyên liệu gửi tới **khách hàng công nghiệp** — họ dùng nó để tính công thức sản phẩm. Sai một chỉ tiêu kỹ thuật không phải chuyện thẩm mỹ:

| Trường sai | Hậu quả |
| :---- | :---- |
| Mã CAS | Khách mua nhầm hoạt chất khác |
| Hàm lượng hoạt chất | Công thức sai liều |
| Hạn dùng, điều kiện bảo quản | Nguyên liệu hỏng trong kho khách |
| Trạng thái pháp lý | Khách dùng nguyên liệu chưa được phép trong sản phẩm bán ra |
| Chống chỉ định phối trộn | Phản ứng bất lợi trong công thức |

Mô hình ngôn ngữ có xu hướng **điền vào chỗ trống bằng thứ nghe hợp lý**. Một mã CAS bịa ra trông y hệt mã CAS thật. Không có cách nào để người đọc phân biệt nếu không đối chiếu tài liệu gốc.

Vì vậy hệ thống có hai lớp chặn: **quy tắc chống bịa ngay trong câu lệnh gửi mô hình** (mục 6.3), và **bắt buộc người duyệt** trước khi xuất bản.

### 6.3 Chia trường thành hai loại — thiết kế cốt lõi

Đây là quyết định thiết kế quan trọng nhất của DA2. Toàn bộ 20 nhóm trường được chia làm hai loại với **hai tiêu chuẩn hoàn toàn khác nhau**:

| | **Loại A — TRÍCH XUẤT** | **Loại B — BIÊN TẬP** |
| :---- | :---- | :---- |
| Gồm | Chỉ tiêu kỹ thuật, mã CAS, mã HS, mã E, hàm lượng, hạn dùng, bảo quản, đóng gói, trạng thái pháp lý, số công bố, số lượng đặt tối thiểu, thương hiệu, xuất xứ, bảng giá | Phụ đề, mô tả, lợi ích, ứng dụng, huy hiệu, cơ chế tác động, tiêu đề và mô tả tối ưu tìm kiếm, mô tả ảnh |
| Quy tắc | **Giá trị phải XUẤT HIỆN trong tài liệu.** Chép đúng nguyên văn, giữ nguyên dấu ≤ ≥ –, đơn vị, khoảng giá trị | Được suy luận khoa học hợp lý dựa trên tên hoạt chất, nhóm chất, nguồn gốc |
| Không có trong tài liệu thì | **BỎ TRỐNG.** Bỏ trống là ĐÚNG | Vẫn viết được |
| Ràng buộc thêm | — | **Mọi CON SỐ nhắc tới vẫn phải có trong tài liệu.** Không viết "tăng 47%" nếu tài liệu không ghi |

Trích nguyên văn câu lệnh gửi mô hình:

> ▶ LOẠI A — TRÍCH XUẤT (transcription). TUYỆT ĐỐI KHÔNG SUY DIỄN.
>
> Quy tắc DUY NHẤT: con số/mã/giá trị phải XUẤT HIỆN TRONG TÀI LIỆU được cung cấp. Chép lại đúng như tài liệu ghi (giữ nguyên dấu ≤ ≥ –, đơn vị, khoảng giá trị).
>
> Nếu tài liệu KHÔNG ghi → BỎ TRỐNG trường đó. **Bỏ trống là ĐÚNG. Đoán là SAI và gây hậu quả pháp lý.**
>
> Đặc biệt nghiêm ngặt — KHÔNG BAO GIỜ được suy đoán: casNumber, hsCode, eNumber, regulatory.registrationNo, regulatory.status, shelfLife, storage, packaging, assay.
>
> **Một mã CAS bịa ra sẽ được đăng công khai cho khách hàng công nghiệp — thà để trống còn hơn sai.**

Thiết kế này là **tri thức nghiệp vụ của công ty được viết thành mã**. Không có thư viện hay dịch vụ nào cung cấp sẵn nó — nó đến từ hiểu biết về việc trường nào sai thì gây hậu quả gì trong ngành nguyên liệu.

---

## 7. Quy mô sản phẩm

| Chỉ số | Số liệu |
| :---- | :---- |
| Tổng số dòng mã | ~4.200 |
| Ngôn ngữ | TypeScript |
| Tệp lõi | 8 |
| Điểm giao tiếp lập trình | 14 |
| Loại tệp xử lý được | 8 |
| Nhóm trường sinh ra | 20 |
| Trạng thái công việc | 9 |
| Thành phần giao diện quản trị tự viết | 4 |

### Phân bố mã nguồn

| Tệp | Dòng | Vai trò |
| :---- | :---- | :---- |
| `lib/openaiService.ts` | 1.408 | Gọi mô hình, dựng câu lệnh, chuẩn hoá kết quả, ước tính chi phí, bóc tách PDF |
| `ai-generate/AiGenerateWorker.ts` | 1.193 | Điều phối toàn bộ dây chuyền, tải tệp, ghi kết quả |
| `endpoints/aiGenerate.ts` | 523 | Điểm giao tiếp: tạo việc, xem hàng đợi, huỷ |
| `drive-sync/CsvImportManager.ts` | 453 | Nhập từ tệp bảng |
| `collections/AiGenerateJobs.ts` | 167 | Mô hình dữ liệu công việc |
| `duplicate-scan/normalize.ts` | 163 | Chuẩn hoá tên để so trùng |
| `globals/AiSettings.ts` | 142 | Cấu hình động |
| `endpoints/csvImport.ts` | 123 | Điểm giao tiếp nhập tệp bảng |

---

## 8. Ranh giới với DA1

DA1 và DA2 dùng chung kho mã nguồn nên cần nói rõ ranh giới:

| | DA1 | DA2 |
| :---- | :---- | :---- |
| Vai trò | Nơi dữ liệu được **lưu, quản lý, hiển thị** | Dây chuyền **sinh ra** dữ liệu đó |
| Nhóm dữ liệu `ingredients` | Thiết kế và sở hữu | Ghi vào |
| Giao diện quản trị | Toàn bộ | 4 thành phần riêng của dây chuyền |
| Nếu gỡ bỏ | Website ngừng hoạt động | Website vẫn chạy, chỉ mất tự động hoá — nhập tay vẫn được |

Câu kiểm tra ranh giới: **gỡ DA2 đi thì DA1 vẫn là một sản phẩm hoàn chỉnh.** Ngược lại thì không — DA2 không tồn tại độc lập được vì nó ghi vào mô hình dữ liệu của DA1.

---

## 9. Ranh giới: cái gì là dịch vụ ngoài, cái gì OPTIMAI tự viết

Đây là mục dễ bị hiểu nhầm nhất của DA2, nên nói thẳng.

### 9.1 Dịch vụ ngoài — nguyên liệu đầu vào

| Dịch vụ | Làm gì |
| :---- | :---- |
| OpenRouter / OpenAI | Nhận một câu hỏi, trả một câu trả lời |
| Mistral OCR | Nhận một trang scan, trả chữ trong đó |
| Google Drive API | Cho phép đọc tệp trong thư mục |

OPTIMAI **không** tuyên bố sở hữu các dịch vụ này. Chúng là vật tư, giống như xưởng cơ khí mua thép.

### 9.2 OPTIMAI tự viết — sản phẩm

| Nội dung | Vì sao đây là sản phẩm |
| :---- | :---- |
| **Hợp đồng dữ liệu 20 nhóm trường** | Định nghĩa nguyên liệu gồm những gì trong nghiệp vụ Bioscope. Không dịch vụ nào biết |
| **Cơ chế chia hai loại trường** | Tri thức về việc trường nào sai thì gây hậu quả gì |
| **Câu lệnh gửi mô hình** | Hàng trăm dòng quy tắc nghiệp vụ cụ thể |
| **Chuẩn hoá kết quả trả về** | Mỗi mô hình trả một hình dạng khác nhau; lớp này làm chúng đồng nhất |
| **Đối chiếu danh mục** | AI chọn thẻ lọc theo tên, hệ thống đối chiếu sang mã. Tên không có trong danh mục thì loại |
| **Quy tắc không ghi đè bằng giá trị rỗng** | AI trả về trống thì **giữ nguyên dữ liệu cũ**, không xoá |
| **Nhận diện và xử lý 8 loại tệp** | Mỗi loại một đường xử lý riêng |
| **Cơ chế lùi khi lỗi** | Tệp hỏng làm dịch vụ trả lỗi thì gọi lại không kèm tệp, thay vì mất trắng công việc |
| **Hàng đợi, nhật ký, huỷ giữa chừng** | Toàn bộ phần vận hành |
| **Ước tính chi phí** | Bảng giá theo mô hình, quy đổi tiền Việt |
| **Bắt buộc người duyệt** | Quyết định nghiệp vụ, không phải tính năng của dịch vụ nào |

Cách kiểm chứng đơn giản: **gọi thẳng dịch vụ AI với cùng bộ tài liệu sẽ không cho ra kết quả dùng được.** Nó trả về một đoạn văn xuôi, không phải 20 nhóm trường song ngữ đã đối chiếu danh mục, đã loại giá trị không hợp lệ, đã sẵn sàng ghi vào cơ sở dữ liệu. Toàn bộ khoảng cách giữa hai thứ đó là phần OPTIMAI làm.

---

## 10. Trạng thái hiện tại

| Chức năng | Trạng thái |
| :---- | :---- |
| Đồng bộ kho tài liệu | Đang vận hành |
| Bóc tách 8 loại tệp | Đang vận hành |
| Nhận dạng chữ trong ảnh | Đang vận hành, hai đường có dự phòng |
| Sinh nội dung song ngữ | Đang vận hành |
| Sinh ảnh đại diện | Đang vận hành, cần khoá OpenAI riêng |
| Xử lý hàng loạt | Đang vận hành |
| Ước tính chi phí | Đang vận hành |
| Quét trùng lặp | Đang vận hành |
| Nhập/xuất tệp bảng | Đang vận hành |

### Hạn chế đã biết

| Hạn chế | Ảnh hưởng | Ghi chú |
| :---- | :---- | :---- |
| Xử lý tệp chạy chung tiến trình với hệ quản trị | Tệp lớn làm chậm các thao tác khác, kể cả chat | Đã ghi, chưa xử lý gốc |
| Sinh ảnh luôn cần khoá OpenAI riêng | OpenRouter không có chức năng tạo ảnh | Giới hạn của dịch vụ, không phải lỗi |
| Bảng đơn giá mô hình tra tháng 07/2026 | Giá đổi thì ước tính lệch | Ghi đè được bằng biến môi trường |

---

## 11. Lịch sử phát triển tóm tắt

| Mốc | Thời gian | Nội dung |
| :---- | :---- | :---- |
| Đồng bộ kho tài liệu | 09/07/2026 | Quét Drive, nhập tệp bảng |
| Dây chuyền sinh nội dung | 13–15/07/2026 | Sinh nội dung từ tệp Drive, hàng đợi công việc |
| Mở rộng trường sinh ra | 15–16/07/2026 | Tên INCI, chỉ tiêu, tối ưu tìm kiếm, nhãn; sinh hàng loạt |
| Sinh ảnh | 17/07/2026 | Tách sinh ảnh khỏi sinh nội dung |
| Nhận dạng chữ trong ảnh | 23–24/07/2026 | Gửi thẳng tệp cho mô hình; thêm đường nhận dạng chuyên dụng có dự phòng |
| Ước tính chi phí | 23/07/2026 | Đếm đơn vị, quy đổi tiền Việt |
| Hợp đồng dữ liệu đầy đủ | 22/07/2026 | Sinh đủ hồ sơ nguyên liệu, lưu nháp chờ duyệt |
| Chuyển sang cổng trung gian nhiều mô hình | 17/08/2026 | Đổi nhà cung cấp và mô hình ngay trên giao diện |

Chi tiết ở `DA2-06-cd3-lap-trinh-va-nhat-ky.md`.
