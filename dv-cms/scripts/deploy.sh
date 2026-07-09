#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "Thiếu .env — chạy: cp .env.example .env && nano .env"
  exit 1
fi

echo "==> Build & start (db + cms + frontend + nginx)"
docker compose up -d --build

echo "==> Trạng thái"
docker compose ps

echo "==> Test qua nginx (HTTPS)"
curl -sIk "https://admin.bioscope.vn/admin" 2>/dev/null | head -3 || true
curl -sIk "https://web.bioscope.vn/" 2>/dev/null | head -3 || true

echo "==> Test qua host port nginx (HTTP fallback)"
HTTP_PORT="${DVCMS_HTTP_HOST_PORT:-26080}"
curl -sI "http://127.0.0.1:${HTTP_PORT}/admin" | head -3 || true
curl -sI "http://127.0.0.1:${HTTP_PORT}/" | head -3 || true

echo "Done. Xem log: docker compose logs -f cms frontend"