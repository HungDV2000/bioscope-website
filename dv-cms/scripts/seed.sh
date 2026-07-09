#!/usr/bin/env bash
# seed.sh — SEED DATA cho bioscope-website (Postgres + Payload admin user)
#
# Yêu cầu: đã chạy install.sh (services đang chạy).
# Làm:
#   1. Tạo admin user (admin@bioscope.vn / Bioscope@123)
#   2. Import CSV categories + ingredients
#   3. Trigger Drive Sync (optional)
#
# Không xóa data cũ — script idempotent (chạy nhiều lần OK, chỉ update).

set -euo pipefail

DV_CMS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CSV_DEFAULT="/opt/bioscope-data/CrawlerDriveData/output/danh_sach_san_pham.csv"
CSV_LARGE="/Users/kcode/Documents/Sources/DeepViewJSC/CrawlerDriveData/output/danh_sach_san_pham.csv"
CSV="${1:-${CSV_PATH:-$CSV_DEFAULT}}"

# Nếu không có ở default path, thử local path
[ ! -f "$CSV" ] && [ -f "$CSV_LARGE" ] && CSV="$CSV_LARGE"

cd "$DV_CMS_DIR"

# ─── Banner ────────────────────────────────────────────────────
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   BIOSCOPE — SEED DATA                                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "CSV file : $CSV"
echo ""

# ─── 0. Check services running ─────────────────────────────────
if ! docker compose ps --services --status running 2>/dev/null | grep -q db; then
  echo "❌ DB chưa chạy. Chạy install.sh trước hoặc: docker compose up -d"
  exit 1
fi

# ─── 1. Đợi DB ready ──────────────────────────────────────────
echo "→ Đợi DB sẵn sàng..."
TIMEOUT=30
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
  if docker compose exec -T db pg_isready -U dvcms &>/dev/null; then
    echo "→ DB OK"
    break
  fi
  sleep 2
  ELAPSED=$((ELAPSED + 2))
done
if [ $ELAPSED -ge $TIMEOUT ]; then
  echo "❌ DB không ready sau ${TIMEOUT}s"
  exit 1
fi

# ─── 2. Đợi CMS ready (Payload phải migrate trước) ────────────
echo "→ Đợi CMS ready (Payload migrate)..."
TIMEOUT=90
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
  if curl -sS -o /dev/null -w "%{http_code}" "http://127.0.0.1:26080/api/users/me" 2>/dev/null | grep -qE "^(200|401|403)$"; then
    echo "→ CMS OK"
    break
  fi
  sleep 3
  ELAPSED=$((ELAPSED + 3))
done
if [ $ELAPSED -ge $TIMEOUT ]; then
  echo "❌ CMS không ready sau ${TIMEOUT}s. Xem logs: docker compose logs cms"
  exit 1
fi

# ─── 3. Tạo admin user ────────────────────────────────────────
echo ""
echo "→ Tạo admin user (admin@bioscope.vn)..."
ADMIN_COUNT=$(docker compose exec -T db psql -U dvcms -d dvcms -tA -c \
  "SELECT COUNT(*) FROM users WHERE email='admin@bioscope.vn';" 2>/dev/null | tr -d ' \n')

if [ "$ADMIN_COUNT" = "0" ]; then
  docker compose exec -T cms \
    sh -c "cd /app/apps/core-cms && pnpm payload run src/scripts/seed.ts" 2>/dev/null \
    || docker compose exec -T cms \
       sh -c "cd /app/apps/core-cms && node --import tsx src/seed/runSeed.ts" \
    || echo "⚠ Không tìm thấy seed script — bỏ qua. Tạo admin thủ công qua /admin UI."
else
  echo "  (admin user đã tồn tại, skip)"
fi

# ─── 4. Import CSV ─────────────────────────────────────────────
echo ""
if [ -f "$CSV" ]; then
  echo "→ Import CSV: $CSV"
  docker cp "$CSV" dvcms-app:/app/danh_sach_san_pham.csv

  # Chạy import
  docker compose exec -T cms \
    sh -c "cd /app/apps/core-cms && CSV_PATH=/app/danh_sach_san_pham.csv node --import tsx src/scripts/importCsvRun.ts"

  # Verify
  echo ""
  echo "→ Verify:"
  docker compose exec -T db psql -U dvcms -d dvcms -c \
    "SELECT 'categories' AS t, COUNT(*) FROM ingredient_categories
     UNION ALL
     SELECT 'ingredients', COUNT(*) FROM ingredients;" \
    2>/dev/null || true
else
  echo "⚠ Không tìm thấy CSV ở $CSV"
  echo "  Tạo data thủ công qua admin UI: https://admin.bioscope.vn/admin"
fi

# ─── 5. Trigger Drive Sync (optional) ─────────────────────────
echo ""
read -p "Trigger Drive Sync từ Google Drive? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "→ Trigger Drive Sync..."
  docker compose exec -T cms \
    sh -c "curl -sS -X POST http://127.0.0.1:3001/api/drive-sync/trigger -H 'Content-Type: application/json' -d '{\"rootFolderId\":\"${GOOGLE_DRIVE_ROOT_FOLDER_ID:-}\"}'" \
    || echo "⚠ Trigger thất bại — kiểm tra GOOGLE_DRIVE_ROOT_FOLDER_ID trong .env"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   ✅ SEED HOÀN TẤT                                          ║"
echo "║                                                            ║"
echo "║   Login admin:                                             ║"
echo "║     https://admin.bioscope.vn/admin                        ║"
echo "║     user: admin@bioscope.vn                                ║"
echo "║     pass: Bioscope@123                                     ║"
echo "╚════════════════════════════════════════════════════════════╝"