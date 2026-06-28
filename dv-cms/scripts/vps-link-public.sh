#!/usr/bin/env bash
# Symlink public/ vào thư mục site aaPanel — workaround khi nginx cache ảnh tĩnh
# chặn proxy về Next. Chạy trên VPS sau git pull.
#
# Usage:
#   ./scripts/vps-link-public.sh
#   ./scripts/vps-link-public.sh /www/wwwroot/web.bioscope.vn

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PUBLIC="$ROOT/apps/bioscope-frontend/public"
SITE_ROOT="${1:-/www/wwwroot/web.bioscope.vn}"

if [[ ! -d "$PUBLIC/images" ]]; then
  echo "Không thấy $PUBLIC/images — chạy từ thư mục dv-cms trên VPS"
  exit 1
fi

mkdir -p "$SITE_ROOT"
ln -sfn "$PUBLIC/images" "$SITE_ROOT/images"
ln -sfn "$PUBLIC/logo.avif" "$SITE_ROOT/logo.avif"

echo "OK: $SITE_ROOT/images -> $PUBLIC/images"
echo "OK: $SITE_ROOT/logo.avif -> $PUBLIC/logo.avif"
echo ""
echo "Kiểm tra:"
echo "  curl -sI https://web.bioscope.vn/images/clients/PolymerSolution.png | head -3"
