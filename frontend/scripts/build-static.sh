#!/usr/bin/env bash
# Build static site → thư mục out/ (upload lên aaPanel như React)
set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ Xóa cache build cũ…"
rm -rf .next out

echo "→ Build static export…"
STATIC_EXPORT=1 npm run build

echo ""
echo "✅ Xong! Upload toàn bộ nội dung thư mục:"
echo "   $(pwd)/out/"
echo "   vào document root trên aaPanel (vd. /www/wwwroot/domain.com/)"
echo ""
echo "Xem thêm: deploy/DEPLOY-AAPANEL.md"
