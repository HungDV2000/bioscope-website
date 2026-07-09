# CMS Sync — Drive + CSV → Payload CMS

Đồng bộ **Ingredient Categories** và **Ingredients** vào Payload CMS qua 2 cách:

1. **Google Drive Sync** — crawl trực tiếp Google Drive API (không cần n8n)
2. **CSV Import** — upload file `danh_sach_san_pham.csv` từ drive_crawler.py

- **Không cần n8n** — code Payload gọi trực tiếp Google Drive API
- **Background job** — chạy nền, không block UI
- **Resume on refresh** — job state lưu vào DB, theo dõi tiến trình kể cả sau reload
- **Real-time progress** — UI poll mỗi 3s khi job đang chạy

---

## Kiến trúc

```
Admin bấm "Bắt đầu Sync"
        │
        │  POST /api/drive-sync
        ▼
Payload — Tạo DriveSyncJobs record (status=queued)
        │
        │  setImmediate() → background
        ▼
Background Worker (DriveSyncManager)
        │
        │  1. Auth Google Drive (service account)
        │  2. List folders cấp 1 → categories
        │  3. List folders cấp 2 → ingredients
        │  4. List files trong mỗi ingredient folder
        │  5. Upsert categories (theo driveId)
        │  6. Upsert ingredients (theo driveId + map category)
        │  7. Cập nhật job progress liên tục
        ▼
UI: GET /api/drive-sync/jobs/:id → progress real-time
```

---

## Cấu trúc Google Drive (input)

```
ROOT_FOLDER (1YFh__V4da3Q6rU3grYgd5YCBH70HcVbs)
└── Category 1 (folder, cấp 1)
    ├── Ingredient 1.1 (folder, cấp 2)
    │   ├── file1.pdf
    │   └── file2.pdf
    └── Ingredient 1.2
└── Category 2
    └── Ingredient 2.1
        └── file.pdf
```

---

## Files

| File | Thay đổi |
|---|---|
| `core-cms/src/lib/googleDriveService.ts` | **Mới** — Google Drive API client |
| `core-cms/src/drive-sync/DriveSyncManager.ts` | **Mới** — Background worker (Drive API) |
| `core-cms/src/drive-sync/CsvImportManager.ts` | **Mới** — CSV parser + upsert |
| `core-cms/src/endpoints/driveSync.ts` | **Mới** — Drive Sync REST endpoints |
| `core-cms/src/endpoints/csvImport.ts` | **Mới** — CSV import endpoint |
| `packages/module-bioscope/src/collections/DriveSyncJobs.ts` | **Mới** — Job state persistence |
| `packages/module-bioscope/src/collections/IngredientCategories.ts` | Thêm `driveId`, `driveParentId` |
| `packages/module-bioscope/src/collections/Ingredients.ts` | Thêm `driveId`, `driveParentId`, `driveFiles` |
| `packages/module-bioscope/src/plugin.ts` | Register `DriveSyncJobs` |
| `apps/core-cms/src/components/CmsSyncPanel/` | UI: CSV Upload + Drive Sync + realtime progress |
| `apps/core-cms/src/payload.config.ts` | Register all endpoints |

---

## Deploy

### 1. Cài `googleapis`

```bash
cd apps/core-cms
pnpm add googleapis
```

### 2. Cấu hình env

```env
# Google Drive root folder (cố định)
GOOGLE_DRIVE_ROOT_FOLDER_ID=1YFh__V4da3Q6rU3grYgd5YCBH70HcVbs

# Service account credentials — đường dẫn tuyệt đối
GOOGLE_APPLICATION_CREDENTIALS=/Users/kcode/Documents/Sources/DeepViewJSC/BioBot/biobot/config/service-account.json
```

### 3. Migration

```bash
cd apps/core-cms
npx payload migrate
pnpm build
```

### 4. Verify

```bash
# Kiểm tra cột mới
psql "$DATABASE_URI" -c "\d ingredient_categories" | grep drive
psql "$DATABASE_URI" -c "\d ingredients" | grep drive
psql "$DATABASE_URI" -c "\d drive_sync_jobs" | head -10
```

---

## API Endpoints

| Method | Path | Mô tả |
|---|---|---|
| `POST` | `/api/drive-sync` | Tạo Drive Sync job (crawl Drive), chạy nền |
| `GET` | `/api/drive-sync/jobs` | Danh sách jobs gần đây (limit=10) |
| `GET` | `/api/drive-sync/jobs/:id` | Chi tiết job + logs |
| `POST` | `/api/drive-sync/jobs/:id/cancel` | Hủy job đang chạy |
| `POST` | `/api/csv-import` | Upload CSV file → import. multipart/form-data field `file` |

---

## Sử dụng

### Cách 1: Import từ CSV (khuyên dùng)

1. Mở Payload Admin → Dashboard
2. Card **"Đồng bộ CMS"**
3. Section **"📄 Import từ CSV"** — bấm **"Chọn file CSV..."**
4. Upload file `danh_sach_san_pham.csv` (từ `CrawlerDriveData/output/`)
5. UI hiển thị progress real-time — kể cả refresh page vẫn theo dõi được

### Cách 2: Sync trực tiếp từ Google Drive

1. Card **"📁 Google Drive Sync"** — bấm **"🚀 Bắt đầu Sync"**
2. Chờ crawl Drive, upsert categories & ingredients
3. UI hiển thị progress

### Upsert logic (cả 2 cách)

| Trường hợp | Hành vi |
|---|---|
| `driveId` đã tồn tại, name/files khác | **Update** |
| `driveId` đã tồn tại, name/files giống | **Skip** (bỏ qua) |
| `driveId` chưa tồn tại | **Create mới** |

→ Không tạo trùng lặp.

---

## Schema mới

### IngredientCategories

| Field | Type | Mô tả |
|---|---|---|
| `driveId` | text, unique, index | Google Drive folder ID cấp 1 |
| `driveParentId` | text | Parent folder (thường là root) |
| `externalId` | text, unique, index | = driveId |
| `name` | localized text | Tên folder |

### Ingredients

| Field | Type | Mô tả |
|---|---|---|
| `driveId` | text, unique, index | Google Drive folder ID cấp 2 |
| `driveParentId` | text, index | Google Drive folder ID cấp 1 (category) |
| `driveFiles` | json | `[{fileId, fileName, mimeType, webViewLink, webContentLink, size, modifiedTime}]` |
| `fileCount` | number | Số file |
| `lastDriveSyncAt` | date | Lần cuối sync |
| `category` | relationship | Liên kết với category |
| `externalId` | text, unique, index | = driveId |

### DriveSyncJobs

| Field | Type | Mô tả |
|---|---|---|
| `status` | select | queued/running/crawling/upserting/done/error/cancelled |
| `phase` | text | Bước hiện tại |
| `totalItems` | number | Tổng items dự kiến |
| `processedItems` | number | Items đã xử lý |
| `totals` | json | Snapshot: `{categories, ingredients, errors}` |
| `logs` | array | Logs theo thời gian |
| `rootFolderId` | text | Drive folder root |

---

## Upsert Logic

| Trường hợp | Hành vi |
|---|---|
| `driveId` đã tồn tại | Update `name` + `driveFiles` nếu khác |
| `driveId` chưa tồn tại | Create mới |
| Ingredient có `driveParentId` | Map với category qua `driveId` |
| Trùng folder name trong cùng category | Cả 2 được tạo (đều có driveId khác nhau) |

---

## Troubleshooting

```bash
# Xem job đang chạy
psql "$DATABASE_URI" -c "SELECT id, status, phase, processed_items FROM drive_sync_jobs ORDER BY created_at DESC LIMIT 5;"

# Xem logs của job
psql "$DATABASE_URI" -c "SELECT logs FROM drive_sync_jobs WHERE id = '<jobId>';"

# Reset job bị stuck
psql "$DATABASE_URI" -c "UPDATE drive_sync_jobs SET status = 'cancelled' WHERE id = '<jobId>';"

# Kiểm tra driveId trùng
psql "$DATABASE_URI" -c "SELECT drive_id, COUNT(*) FROM ingredients GROUP BY drive_id HAVING COUNT(*) > 1;"

# Test kết nối Drive (local)
cd apps/core-cms && node -e "
const { GoogleDriveService } = require('./src/lib/googleDriveService.ts');
// (Cần ts-node hoặc build trước)
"
```

---

## N8n Workflows (Deprecated — giữ lại backup)

Các workflows `WF-SYNC-CMS` và `WF-SYNC-QDRANT` trong thư mục `bioscope/workflows/` được **giữ lại** như backup. Không còn dùng trong flow chính.

| Workflow | Trạng thái |
|---|---|
| `WF-SYNC-CMS_Export_Products_Categories.json` | Backup |
| `WF-SYNC-QDRANT_Sync_Products_Categories_from_Qdrant.json` | Backup |
| `WF-SYNC-RAG_Export_Products_Categories_Slugified.json` | Backup |
