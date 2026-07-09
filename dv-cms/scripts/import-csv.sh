#!/usr/bin/env bash
# import-csv.sh — Import CSV vào DB docker (production)
# Dùng để seed categories + ingredients lần đầu hoặc sync thêm.

set -euo pipefail

DV_CMS_DIR="${DV_CMS_DIR:-/opt/bioscope-website/dv-cms}"
CSV="${1:-/opt/bioscope-website/CrawlerDriveData/output/danh_sach_san_pham.csv}"

if [ ! -f "$CSV" ]; then
  echo "❌ Không tìm thấy CSV: $CSV"
  echo "Usage: $0 /path/to/danh_sach_san_pham.csv"
  exit 1
fi

cd "$DV_CMS_DIR"

echo "→ Copy CSV vào container CMS..."
docker cp "$CSV" dvcms-app:/app/danh_sach_san_pham.csv

echo "→ Chạy import (có thể mất vài phút cho 1594 rows)..."
docker compose exec -T cms \
  sh -c "cd /app/apps/core-cms && node --import tsx src/scripts/importCsvRun.ts"

echo ""
echo "→ Verify:"
docker compose exec -T db \
  psql -U dvcms -d dvcms -c \
    "SELECT 'categories' AS t, COUNT(*) FROM ingredient_categories UNION ALL SELECT 'ingredients', COUNT(*) FROM ingredients;"

echo "✅ Hoàn tất"