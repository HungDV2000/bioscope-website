#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "Thiếu .env — chạy: cp .env.server.example .env && nano .env"
  exit 1
fi

echo "==> Build & start (db + cms + frontend)"
docker compose up -d --build

echo "==> Trạng thái"
docker compose ps

echo "==> Test cổng nội bộ"
CMS_PORT="${DVCMS_CMS_HOST_PORT:-26001}"
FE_PORT="${DVCMS_FRONTEND_HOST_PORT:-26000}"
curl -sI "http://127.0.0.1:${CMS_PORT}/admin" | head -3 || true
curl -sI "http://127.0.0.1:${FE_PORT}" | head -3 || true

echo "Done. Xem log: docker compose logs -f cms frontend"
