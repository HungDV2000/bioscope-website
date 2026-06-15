#!/usr/bin/env bash
# Build static + nén zip sẵn để upload aaPanel
set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ Build static…"
rm -rf .next out
STATIC_EXPORT=1 npm run build

ZIP="bioscope-static-$(date +%Y%m%d).zip"
rm -f "$ZIP"

# Nén NỘI DUNG out/ (giải nén ra là thấy index.html ngay)
(cd out && zip -r "../$ZIP" .)

echo ""
echo "✅ Tạo file: $(pwd)/$ZIP"
echo "   Upload zip lên VPS → giải nén TRỰC TIẾP vào /www/wwwroot/demo.bioscope.vn/"
echo "   (sau khi giải nén phải thấy index.html cùng cấp, KHÔNG nằm trong folder out/)"
