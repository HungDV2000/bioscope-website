#!/usr/bin/env bash
# Khởi động frontend production trên VPS (PM2 port 26000)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

mkdir -p logs

if ! command -v pm2 >/dev/null 2>&1; then
  echo "Cài PM2: npm i -g pm2"
  exit 1
fi

if [ ! -d apps/bioscope-frontend/.next ]; then
  echo "==> Chưa có .next — đang build..."
  pnpm fe:build
fi

echo "==> Kiểm tra cổng 26000..."
if ss -tlnp 2>/dev/null | grep -q ':26000 '; then
  echo "Cổng 26000 đang bận — dừng process cũ..."
  pm2 delete bioscope-web 2>/dev/null || true
  fuser -k 26000/tcp 2>/dev/null || true
fi

echo "==> PM2 start bioscope-web..."
pm2 delete bioscope-web 2>/dev/null || true
pm2 start ecosystem.frontend.config.cjs
pm2 save

sleep 2
echo ""
echo "==> Kiểm tra:"
pm2 status bioscope-web
curl -sI http://127.0.0.1:26000/ | head -3 || true
echo ""
echo "Nếu Connection refused: pm2 logs bioscope-web --lines 50"
