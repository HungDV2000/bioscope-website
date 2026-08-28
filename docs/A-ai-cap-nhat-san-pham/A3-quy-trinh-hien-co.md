# A3 — BỐN LUỒNG NẠP DỮ LIỆU ĐANG VẬN HÀNH

> Nguồn: `dv-cms/apps/core-cms/src/endpoints/`
> Mọi endpoint dưới đây **đang chạy thật** trên hệ thống, không phải đề xuất.

Trong khi đường ghi qua API còn là đặc tả ([A2](A2-hop-dong-ghi-du-lieu.md)),
bốn luồng dưới đây là cách **chính thức** để đưa dữ liệu vào hệ thống hôm nay.

Cả bốn đều yêu cầu đăng nhập admin và đều để lại vết trong bản ghi công việc.

---

## Luồng 1 — Đồng bộ Google Drive

**Dùng khi:** có sẵn thư mục Drive chứa tài liệu nguyên liệu do nhà cung cấp gửi.

| | |
|---|---|
| Endpoint | `POST /api/drive-sync` |
| Theo dõi | `GET /api/drive-sync/jobs` · `GET /api/drive-sync/jobs/:id` |
| Huỷ | `POST /api/drive-sync/jobs/:id/cancel` |
| Bản ghi công việc | Collection `drive-sync-jobs` |

### Các bước

```
queued → running → crawling → upserting → done
                                        ↘ error / cancelled
```

| Bước | Việc |
|---|---|
| `crawling` | Duyệt cây thư mục Drive, lập danh sách tệp |
| `upserting` | Ghi vào cơ sở dữ liệu theo kiểu tạo-hoặc-cập-nhật |

Mỗi công việc lưu nhật ký ba mức `info` / `warn` / `error`, xem trực tiếp
trong admin. Có thể huỷ giữa chừng.

**Chống trùng:** đối chiếu theo mã thư mục Drive lưu ở `driveId` của danh mục
và `externalId` của nguyên liệu.

---

## Luồng 2 — Sinh nội dung bằng AI

**Dùng khi:** đã có nguyên liệu trong hệ thống nhưng thiếu mô tả, lợi ích, ứng dụng.

| | |
|---|---|
| Một bản ghi | `POST /api/ai-generate` |
| Nhiều bản ghi | `POST /api/ai-generate/bulk` |
| Chỉ sinh ảnh | `POST /api/ai-generate/image` |
| Theo dõi | `GET /api/ai-generate/jobs` · `/jobs/:id` · `/queue-status` |
| Bản ghi công việc | Collection `ai-generate-jobs` |

### Các bước

```
queued → downloading → extracting → generating_content → generating_image → saving → done
                                                                                  ↘ error / cancelled
```

| Bước | Việc |
|---|---|
| `downloading` | Tải tài liệu đính kèm của nguyên liệu |
| `extracting` | Trích văn bản, kể cả PDF scan qua mô hình đọc ảnh |
| `generating_content` | Sinh mô tả, lợi ích, ứng dụng |
| `generating_image` | Sinh ảnh đại diện nếu chọn |
| `saving` | Ghi kết quả vào bản ghi |

### Chế độ

| `mode` | Ý nghĩa |
|---|---|
| `full` | Toàn bộ nội dung kèm ảnh |
| `image` | Chỉ tạo lại ảnh đại diện |

### Ngôn ngữ

Chọn `vi` hoặc `en`. Nội dung sinh cho ngôn ngữ nào chỉ ghi vào bản ngôn ngữ đó.

### Nhà cung cấp AI

Cấu hình động trong **Admin → Hệ thống → Cài đặt AI**, đổi không cần triển khai lại.

| | |
|---|---|
| Mặc định | OpenRouter, tự điều phối model theo độ khó để tối ưu chi phí |
| Đọc ảnh / PDF scan | Phải chỉ định model nhìn được, không dùng chế độ tự chọn |
| Sinh ảnh | **Luôn gọi thẳng OpenAI** — OpenRouter không có endpoint sinh ảnh |

---

## Luồng 3 — Nhập CSV

**Dùng khi:** có bảng dữ liệu từ nhà cung cấp hoặc từ hệ thống khác.

| | |
|---|---|
| Endpoint | `POST /api/csv-import` |
| Đầu vào | JSON `{ "csvContent": "<CSV mã hoá base64>" }` |
| Đầu ra | `{ ok, jobId }` — chạy nền, theo dõi qua `jobId` |

### Xuất và nhập lại nội dung

| Endpoint | Việc |
|---|---|
| `GET /api/ingredients-content-export` | Xuất nội dung ra tệp |
| `POST /api/ingredients-content-import` | Nhập ngược lại sau khi sửa |

Cặp này dùng cho việc **sửa hàng loạt**: xuất ra, sửa bằng công cụ bảng tính
hoặc bằng AI, rồi nhập lại. Đây là cách an toàn nhất để AI tham gia cập nhật
nội dung mà không cần mở đường ghi trực tiếp.

---

## Luồng 4 — Đồng bộ từ CMS nguồn

**Dùng khi:** nhân bản dữ liệu từ một hệ thống Bioscope khác.

| | |
|---|---|
| Cấu hình nguồn | `GET /api/cms-sync-source` |
| Chạy | `POST /api/cms-sync` |
| Lịch sử | `GET /api/cms-sync-runs` |
| Bản ghi công việc | Collection `cms-sync-runs` |

---

## Chức năng hỗ trợ — Quét trùng

Không phải luồng nạp, nhưng bắt buộc chạy sau mỗi đợt nạp lớn.

| | |
|---|---|
| Tuỳ chọn | `GET /api/duplicate-scan/options` |
| Chạy | `POST /api/duplicate-scan` |
| Kết quả | `GET /api/duplicate-scan/runs` · `/runs/:id` |
| Nhanh, theo tên | `GET /api/ingredient-duplicates` |

Chức năng này sinh ra vì **trùng nguyên liệu đã xảy ra thật**: biên tập viên
chỉ nhìn thấy tên nên tạo trùng mà không biết. Cách đối chiếu là gom nhóm theo
tên tiếng Việt sau khi chuẩn hoá hoa thường và khoảng trắng thừa.

---

## Bảng chọn luồng

| Tình huống | Luồng |
|---|---|
| Có thư mục Drive tài liệu nhà cung cấp | 1 — Drive |
| Nguyên liệu đã có, thiếu nội dung mô tả | 2 — AI |
| Có bảng dữ liệu | 3 — CSV |
| Sửa nội dung hàng loạt bằng AI | 3 — xuất, sửa, nhập lại ⭐ |
| Nhân bản từ hệ thống Bioscope khác | 4 — CMS Sync |
| Sau mỗi đợt nạp lớn | Quét trùng |

---

## Điểm chung của cả bốn luồng

- Chạy **nền**, không chặn giao diện admin.
- Có **bản ghi công việc riêng** với nhật ký từng bước — truy được nguồn khi sai.
- Nội dung mới vào ở dạng **bản nháp**, người biên tập duyệt rồi mới xuất bản.
- **Không luồng nào ghi vào bảng giá.**
