<!--HOSO
phu_de: Hệ thống AI chuẩn hoá và cập nhật dữ liệu sản phẩm
pham_vi: Dự án DA2
ngay_lap: 09/07/2026
phien_ban: 1.4
nguoi_lap: Quân — Team phát triển, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc Công ty OPTIMAI
lich_su: 1.0 | 09/07/2026 | Mở sổ nhật ký phát triển
lich_su: 1.1 | 18/07/2026 | Ghi nhận mốc 1 đến mốc 3
lich_su: 1.2 | 25/07/2026 | Ghi nhận mốc 4 đến mốc 6
lich_su: 1.3 | 17/08/2026 | Ghi nhận mốc 7 — chuyển sang cổng trung gian nhiều mô hình
lich_su: 1.4 | 24/08/2026 | Bổ sung thống kê và danh sách việc còn lại
-->
# DA2 — CÔNG ĐOẠN 3: LẬP TRÌNH VÀ NHẬT KÝ PHÁT TRIỂN
## Hệ thống AI chuẩn hoá và cập nhật dữ liệu sản phẩm

---

> **Đội thực hiện.** Toàn bộ công việc ghi trong nhật ký này do đội ngũ **Công ty OPTIMAI** thực hiện. Phân công theo vai trò và công đoạn: `00-ho-so-chung/00-1-thuyet-minh-nang-luc-va-doi-ngu.md` mục 4.1.

## 1. Tổ chức mã nguồn

```
dv-cms/apps/core-cms/src/
├── ai-generate/
│   └── AiGenerateWorker.ts        1.193 dòng — bộ điều phối dây chuyền
├── lib/
│   ├── openaiService.ts           1.408 dòng — gọi mô hình, câu lệnh, chi phí
│   └── aiSettings.ts                        — nạp cấu hình động
├── endpoints/
│   ├── aiGenerate.ts                523 dòng — tạo việc, hàng đợi, huỷ
│   ├── csvImport.ts                 123 dòng — nhập tệp bảng
│   ├── driveSync.ts                         — đồng bộ kho tài liệu
│   ├── cmsSync.ts                           — đồng bộ nội dung
│   ├── duplicateScan.ts                     — quét trùng lặp
│   └── ingredientData.ts                    — xuất/nhập nội dung
├── drive-sync/
│   └── CsvImportManager.ts          453 dòng
├── duplicate-scan/
│   └── normalize.ts                 163 dòng — chuẩn hoá tên để so trùng
├── globals/
│   └── AiSettings.ts                142 dòng — cấu hình động
└── components/
    ├── BulkAiGenerate/                      — thanh sinh hàng loạt
    └── IngredientAiField/                   — menu công cụ nguyên liệu

dv-cms/packages/module-bioscope/src/collections/
├── AiGenerateJobs.ts                167 dòng
├── DriveSyncJobs.ts
├── CmsSyncRuns.ts
└── DuplicateScans.ts
```

### Vì sao tách `openaiService` và `AiGenerateWorker`

| Tệp | Trách nhiệm | Biết gì |
| :---- | :---- | :---- |
| `openaiService.ts` | **Nói chuyện với mô hình.** Dựng câu lệnh, gọi, chuẩn hoá kết quả, tính chi phí | Biết về mô hình và về hợp đồng dữ liệu. **Không biết** về hàng đợi, kho tài liệu, cơ sở dữ liệu |
| `AiGenerateWorker.ts` | **Điều phối dây chuyền.** Tải tệp, gọi lớp trên, ghi kết quả, cập nhật trạng thái | Biết về kho tài liệu, hàng đợi, cơ sở dữ liệu. **Không biết** chi tiết cách gọi mô hình |

Ranh giới này cho phép thay đổi một bên mà không đụng bên kia. Ví dụ thật: chuyển từ gọi thẳng nhà cung cấp sang cổng trung gian chỉ sửa `openaiService.ts`; bộ điều phối không đổi một dòng.

---

## 2. Quy ước lập trình áp dụng

Ngoài quy chuẩn chung ở `00-5`, DA2 có ba quy ước riêng:

| Quy ước | Vì sao |
| :---- | :---- |
| **Không bao giờ ghi khoá dịch vụ vào nhật ký** | Nhật ký lưu trong cơ sở dữ liệu, biên tập viên đọc được |
| **Mọi lời gọi mô hình đều đếm đơn vị** | Không đếm thì không kiểm soát được chi phí |
| **Đọc cấu hình lúc gọi, không chốt lúc nạp mã** | Đổi mô hình trên giao diện phải có hiệu lực ngay |

---

## 3. Nhật ký phát triển

Ghi theo **lộ trình đã đi**, không phải thống kê số lần ghi nhận.

---

### Mốc 1 — Đồng bộ kho tài liệu (09/07/2026)

**Mục tiêu:** kết nối được với kho tài liệu, biết nguyên liệu nào có tệp gì.

**Đã làm:**
- Kết nối Google Drive bằng tài khoản dịch vụ
- Quét thư mục, liệt kê tệp
- Nhập danh sách nguyên liệu từ tệp bảng
- Lưu tên nguyên liệu đúng theo từng ngôn ngữ

**Vì sao làm bước này trước.** Không có kho tài liệu đã đối chiếu thì dây chuyền AI không có nguồn. Đây là nền của mọi thứ phía sau.

---

### Mốc 2 — Dây chuyền sinh nội dung đầu tiên (13–15/07/2026)

**Mục tiêu:** chạy được từ đầu tới cuối, dù kết quả còn thô.

**Đã làm:**
- Bộ điều phối dây chuyền
- Bảng danh sách tệp nguồn trong biểu mẫu nguyên liệu
- Hàng đợi công việc, khung xem nhật ký
- Ghi kết quả vào nguyên liệu

**Sự cố dày đặc trong giai đoạn này** — đây là giai đoạn khó nhất của dự án:

| Sự cố | Nguyên nhân | Xử lý |
| :---- | :---- | :---- |
| Cửa sổ sinh nội dung không hiện | Thành phần chưa được xuất ra đúng cách | Sửa khai báo xuất |
| Bộ điều phối không truy cập được cơ sở dữ liệu | Đọc biến toàn cục chưa được gán | Truyền đối tượng truy cập từ ngữ cảnh yêu cầu |
| Nhãn chỉ tiêu ghi vào dạng chuỗi JSON | Không xử lý cấu trúc song ngữ, ghi thẳng đối tượng | Ghi từng ngôn ngữ riêng |
| Lỗi tạo ảnh không hiện ra | Nuốt lỗi ở tầng dưới | Đưa lỗi lên nhật ký công việc |
| Báo `Specs N > Label` không rõ nguyên nhân | Mô hình trả nhãn khi thì chuỗi khi thì đối tượng | Ghi tạm hình dạng thật ra nhật ký để chẩn đoán, rồi viết lớp chuẩn hoá |
| Lỗi ghi chỉ tiêu làm hỏng cả công việc | Không tách lỗi từng phần | Lỗi ghi chỉ tiêu không làm hỏng công việc |
| Chỉ tiêu cũ còn sót lẫn với chỉ tiêu mới | Không xoá trước khi ghi | Xoá chỉ tiêu cũ trong lượt ghi chính |

**Bài học lớn nhất của mốc này:** đầu ra của mô hình ngôn ngữ **không có hình dạng ổn định**. Cùng một câu lệnh, cùng một mô hình, hai lần gọi có thể trả về hai hình dạng khác nhau cho cùng một trường.

Đây là nguồn gốc của lớp chuẩn hoá — ban đầu không có trong thiết kế, sinh ra từ thực tế. Lần ghi nhận `fix(cms): normalize AI content JSON across model shape variance` là lúc lớp này ra đời.

---

### Mốc 3 — Mở rộng hợp đồng dữ liệu và sinh hàng loạt (15–18/07/2026)

**Mục tiêu:** sinh đủ trường, và xử lý được nhiều nguyên liệu một lượt.

**Đã làm:**
- Sinh thêm: tên INCI, chỉ tiêu kỹ thuật, tối ưu tìm kiếm, nhãn
- Nút đồng bộ lại kho tài liệu
- **Sinh hàng loạt** cho nguyên liệu đã chọn hoặc toàn bộ
- Chuyển sang thế hệ mô hình mới
- Khôi phục mã thư mục kho tài liệu từ tệp bảng nguồn

**Sự cố:**

| Sự cố | Nguyên nhân | Xử lý |
| :---- | :---- | :---- |
| Khung nhật ký báo "Chưa có log" dù đã lưu | Đọc sai nguồn dữ liệu | Sửa đường đọc |
| Chất lượng ảnh không đồng đều giữa các mô hình | Mỗi họ mô hình hiểu tham số chất lượng khác nhau | Chuẩn hoá tham số theo họ mô hình |
| Lợi ích và ứng dụng chỉ ghi vào một ngôn ngữ | Bỏ sót khi ghi trường danh sách song ngữ | Ghi vào cả hai ngôn ngữ |

---

### Mốc 4 — Tách sinh ảnh, chống kẹt hàng đợi (17–22/07/2026)

**Mục tiêu:** sinh ảnh độc lập, và hàng đợi không kẹt.

**Đã làm:**
- **Tách sinh ảnh khỏi sinh nội dung** — hai chế độ riêng
- Ảnh sinh ra dựa trên nội dung thật của nguyên liệu, không dựa trên tên suông
- Chống kẹt hàng đợi
- Menu công cụ nguyên liệu gom gọn
- Xuất/nhập nội dung dạng tệp
- **Hợp đồng dữ liệu đầy đủ, lưu bản nháp chờ duyệt**

**Vì sao tách sinh ảnh.** Ba lý do cụ thể:

| Lý do | Chi tiết |
| :---- | :---- |
| Chi phí khác hẳn | Tạo ảnh đắt hơn sinh chữ nhiều lần. Gộp chung thì mỗi lần chạy lại nội dung đều tốn thêm tiền ảnh |
| Nhu cầu khác nhau | Nguyên liệu đã có ảnh thật thì không cần ảnh sinh; nhưng vẫn cần cập nhật nội dung |
| Điểm hỏng khác nhau | Tạo ảnh cần khoá riêng của một nhà cung cấp cụ thể. Gộp chung thì thiếu khoá đó là hỏng cả công việc |

**Mốc quan trọng nhất của dự án** cũng ở đây: lần ghi nhận `feat(cms): AI sinh đủ hồ sơ nguyên liệu, lưu bản nháp chờ duyệt`. Đây là lúc nguyên tắc "máy đề xuất, người quyết định" được cài cứng vào mã, không còn là thoả thuận miệng.

---

### Mốc 5 — Đọc được tài liệu dạng ảnh (23–24/07/2026)

**Mục tiêu:** xử lý hồ sơ scan — phần lớn hồ sơ nhà cung cấp là scan.

**Đã làm:**
- Hiện **lý do thật** khi không đọc được tệp, thay vì báo lỗi chung chung
- Nhận đúng kiểu nội dung Google Docs ghi dạng rút gọn trong tệp bảng
- **Đọc PDF scan bằng cách gửi thẳng tệp cho mô hình**
- Thêm đường nhận dạng chữ chuyên dụng, **tự lùi về đường cũ khi lỗi**
- **Đính kèm PDF scan nguyên bản thay vì trích chữ trước**
- Đính kèm mọi tệp kho tài liệu, nới trần cắt dữ liệu
- Đính kèm cả Google Docs bằng cách xuất sang PDF

**Đây là mốc thay đổi lớn nhất về chất lượng.** Diễn biến:

```
Ban đầu:   PDF → trích chữ → gửi chuỗi cho mô hình
           Vấn đề: bảng biểu mất cấu trúc, cột lẫn vào nhau.
                   Mà chỉ tiêu kỹ thuật NẰM TRONG BẢNG.

Thử:       PDF scan → mô hình đọc ảnh → chữ → gửi chuỗi
           Khá hơn, nhưng vẫn qua một lần chuyển đổi mất mát.

Cuối:      PDF → GỬI THẲNG TỆP cho mô hình
           Mô hình nhìn được bố cục bảng, ký hiệu, biểu đồ.
           Bỏ HẲN bước trích chữ.
```

Ba lần ghi nhận liên tiếp trong hai ngày cho thấy đây là quá trình **thử và sửa dựa trên kết quả thật**, không phải thiết kế sẵn từ đầu.

**Cái giá phải trả:** bỏ bước trích chữ nghĩa là không còn gì để lùi về khi tệp gây lỗi. Điều này dẫn thẳng tới cơ chế lùi ở mốc 6.

---

### Mốc 6 — Kiểm soát chi phí và chẩn đoán lỗi (23–25/07/2026)

**Mục tiêu:** biết đang tiêu bao nhiêu, và chẩn đoán được lỗi từ dịch vụ ngoài.

**Đã làm:**
- Đếm đơn vị, **ghi chi phí kèm tiền Việt**
- **Bảng đơn giá theo từng mô hình**
- Gom phần tĩnh của câu lệnh để nhà cung cấp lưu đệm được — giảm chi phí
- **Bòn chi tiết lỗi** từ dịch vụ ngoài để chẩn đoán lỗi máy chủ
- Cơ chế **gọi lại không kèm tệp** khi tệp gây lỗi

**Về việc gom phần tĩnh của câu lệnh.** Câu lệnh hệ thống dài hàng trăm dòng và **giống hệt nhau** ở mọi nguyên liệu. Nhà cung cấp tính giá phần đã lưu đệm rẻ hơn nhiều so với phần mới. Đặt phần tĩnh lên đầu, phần riêng của nguyên liệu xuống sau, thì phần tĩnh được lưu đệm và chi phí giảm đáng kể.

Đây là tối ưu **không ảnh hưởng chất lượng**, chỉ ảnh hưởng hoá đơn.

**Về việc bòn chi tiết lỗi.** Dịch vụ ngoài trả lỗi máy chủ với thông báo rất chung. Lấy thêm mã trạng thái, loại lỗi, mã lỗi, tên tham số gây lỗi rồi ghi vào nhật ký — nhờ đó phân biệt được "dịch vụ đang quá tải, thử lại là được" với "tệp này có vấn đề, thử lại vô ích".

---

### Mốc 7 — Chuyển sang cổng trung gian nhiều mô hình (17/08/2026)

**Mục tiêu:** không khoá chặt vào một nhà cung cấp, và giảm chi phí.

**Đã làm:**
- Chuyển sang cổng trung gian dùng giao thức tương thích
- Mặc định **để cổng tự điều phối mô hình** theo độ khó từng yêu cầu
- Cấu hình động: đổi nhà cung cấp và mô hình ngay trên giao diện
- Ba loại tác vụ ba mô hình riêng
- Hai cảnh báo cạm bẫy ghi thẳng vào mô tả trường

**Vì sao chuyển.** Câu dễ dùng mô hình rẻ, câu khó mới dùng mô hình mạnh — nhờ đó tiết kiệm chi phí mà chất lượng không giảm. Cộng thêm việc không phụ thuộc một nhà cung cấp duy nhất.

**Chi phí chuyển đổi gần bằng không** vì cổng trung gian dùng cùng giao thức. Đây là lợi ích của việc tách `openaiService` khỏi bộ điều phối từ đầu: đổi nhà cung cấp chỉ đụng một tệp.

**Hai cạm bẫy phát hiện ngay khi chuyển:**

| Cạm bẫy | Xử lý |
| :---- | :---- |
| Để cổng tự chọn mô hình đọc ảnh → chọn nhầm mô hình chỉ xử lý chữ, bước đọc ảnh hỏng | Ghi cảnh báo vào mô tả trường trong giao diện |
| Cổng trung gian **không có** chức năng tạo ảnh | Phần tạo ảnh luôn gọi thẳng nhà cung cấp có chức năng đó, kèm cảnh báo trong giao diện |

---

## 4. Thống kê khối lượng

| Chỉ số | Số liệu |
| :---- | :---- |
| Tổng dòng mã | ~4.200 |
| Số lần ghi nhận thay đổi liên quan DA2 | ~48 |
| Khoảng thời gian | 09/07/2026 – 17/08/2026 |
| Tỉ lệ `fix` trên tổng | **~40%** |

### Đọc con số 40% thế nào

Tỉ lệ sửa lỗi cao hơn hẳn DA1. Đây **không phải** dấu hiệu chất lượng kém — nó phản ánh đúng bản chất của việc làm việc với mô hình ngôn ngữ:

| | Lập trình thông thường | Làm việc với mô hình ngôn ngữ |
| :---- | :---- | :---- |
| Đầu ra | Xác định, lặp lại được | **Không xác định**, hình dạng thay đổi |
| Cách biết đúng sai | Đọc mã, chạy thử một lần | Phải chạy trên **nhiều dữ liệu thật** mới thấy |
| Loại lỗi | Logic sai | Hình dạng dữ liệu bất ngờ, mô hình không nghe lời |

Không có cách nào biết trước mô hình sẽ trả nhãn dạng chuỗi hay dạng đối tượng, ngoài việc chạy thử rồi sửa. Chuỗi lần ghi nhận `fix` trong mốc 2 chính là quá trình đó.

**Đây là bằng chứng của công đoạn kiểm thử:** mỗi lần `fix` là một lỗi được phát hiện qua chạy thử trên dữ liệu thật rồi sửa.

---

## 5. Việc còn lại

| # | Việc | Mức | Ghi chú |
| :---- | :---- | :---- | :---- |
| 1 | **Tách xử lý tệp sang tiến trình riêng** | **Cao** | Hiện chạy chung tiến trình, chặn cả chat. Xem `DA2-03` QĐ-06 |
| 2 | Cập nhật bảng đơn giá mô hình | Trung bình | Bảng tra tháng 07/2026, giá có đổi |
| 3 | Đối chiếu ước tính chi phí với hoá đơn thật | Trung bình | Chưa làm lần nào |
| 4 | Bộ kiểm thử tự động cho lớp chuẩn hoá | Trung bình | Đây là lớp hay hỏng nhất, đáng có kiểm thử tự động nhất |
| 5 | Tổng quát hoá dây chuyền cho nhóm dữ liệu khác | Thấp | Hiện gắn chặt với nguyên liệu — có chủ ý |
| 6 | Thống kê tỉ lệ trường bị người duyệt sửa | Thấp | Sẽ cho biết chất lượng AI thực tế đến đâu |

Mục 6 đáng làm nhất về lâu dài: nó biến cảm nhận "AI làm khá tốt" thành con số đo được, và chỉ ra chính xác trường nào mô hình hay sai để siết câu lệnh.
