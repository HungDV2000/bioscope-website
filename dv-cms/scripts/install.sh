#!/usr/bin/env bash
# install.sh — CÀI MỚI HOÀN TOÀN bioscope-website lên VPS
#
# Khác với upgrade.sh: SCRIPT NÀY XÓA DATA CŨ (nếu có).
# Dùng cho lần đầu deploy, hoặc khi muốn fresh install.
#
# Host ports (dải 26xxx để không xung đột với BioBot 5432/6379/...):
#   - 26432  Postgres
#   - 26080  HTTP  (admin/web.bioscope.vn)
#   - 26443  HTTPS (admin/web.bioscope.vn)
#
# Sau khi xong:
#   https://admin.bioscope.vn  → CMS (Payload)
#   https://web.bioscope.vn    → Frontend (Next.js)

set -euo pipefail

# ─── Config ─────────────────────────────────────────────────────
DV_CMS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_DIR="$(cd "$DV_CMS_DIR/../.." && pwd)"
DATA_DIR="${DATA_DIR:-/opt/bioscope-data}"
NGINX_HEALTHCHECK_DOMAIN="${NGINX_HEALTHCHECK_DOMAIN:-admin.bioscope.vn}"

# ─── Banner ────────────────────────────────────────────────────
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   BIOSCOPE-WEBSITE — INSTALL MỚI HOÀN TOÀN                ║"
echo "║   ⚠ Script này SẼ XÓA volumes cũ nếu có                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "DV_CMS_DIR : $DV_CMS_DIR"
echo "DATA_DIR   : $DATA_DIR"
echo ""

# ─── 1. Yêu cầu root / docker ──────────────────────────────────
if ! command -v docker &>/dev/null; then
  echo "→ Cài Docker..."
  curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  sudo sh /tmp/get-docker.sh
  sudo usermod -aG docker "$USER"
  echo "⚠ Đã cài Docker. Logout/login lại hoặc chạy: newgrp docker"
  exit 0
fi

if ! docker compose version &>/dev/null; then
  echo "→ Cài docker compose plugin..."
  sudo apt-get update -qq && sudo apt-get install -y -qq docker-compose-plugin
fi

# ─── 2. Check env file ─────────────────────────────────────────
if [ ! -f "$DV_CMS_DIR/.env" ]; then
  echo "→ Tạo .env từ .env.example..."
  cp "$DV_CMS_DIR/.env.example" "$DV_CMS_DIR/.env"
  # Auto-config cho production domain
  sed -i 's|http://localhost:3001|https://admin.bioscope.vn|g' "$DV_CMS_DIR/.env"
  sed -i 's|http://localhost:3000|https://web.bioscope.vn|g' "$DV_CMS_DIR/.env"
  sed -i 's|@localhost:5432|@db:5432|g' "$DV_CMS_DIR/.env"
  sed -i 's|^DVCMS_DB_HOST_PORT=.*|DVCMS_DB_HOST_PORT=26432|' "$DV_CMS_DIR/.env"
  sed -i 's|^DVCMS_HTTP_HOST_PORT=.*|DVCMS_HTTP_HOST_PORT=26080|' "$DV_CMS_DIR/.env"
  sed -i 's|^DVCMS_HTTPS_HOST_PORT=.*|DVCMS_HTTPS_HOST_PORT=26443|' "$DV_CMS_DIR/.env"
  sed -i 's|^NGINX_HOST_PORT=.*|NGINX_HOST_PORT=26080|' "$DV_CMS_DIR/.env"
  echo "→ Đã tạo $DV_CMS_DIR/.env"
fi

# ─── 3. Chuẩn bị secrets (service-account.json) ────────────────
if [ ! -f "$DV_CMS_DIR/apps/core-cms/credentials/service-account.json" ]; then
  echo ""
  echo "⚠ THIẾU service-account.json!"
  echo "  Copy từ local: scp -r bioscope-website/dv-cms/apps/core-cms/credentials \\"
  echo "      user@vps:$DV_CMS_DIR/apps/core-cms/"
  echo ""
  exit 1
fi

# ─── 4. Cảnh báo XÓA DATA ─────────────────────────────────────
if docker ps -a --format '{{.Names}}' 2>/dev/null | grep -qE '^(dvcms-db|dvcms-app|dvcms-frontend|dvcms-nginx)$'; then
  echo "⚠ Phát hiện containers bioscope cũ. SẼ XÓA trước khi cài lại."
fi

if docker volume ls --format '{{.Name}}' 2>/dev/null | grep -qE '^(dv-cms_pgdata|dv-cms_media)$'; then
  echo "⚠ Phát hiện volumes bioscope cũ. SẼ XÓA (mất toàn bộ data)!"
fi

read -p "Tiếp tục và XÓA data cũ? (yes/no) " -r
[ "$REPLY" != "yes" ] && { echo "Hủy."; exit 1; }

# ─── 5. Dọn dẹp containers + volumes cũ ────────────────────────
echo "→ Dọn dẹp containers + volumes cũ..."
cd "$DV_CMS_DIR"
docker compose down -v --remove-orphans 2>/dev/null || true
docker volume rm -f dv-cms_pgdata dv-cms_media 2>/dev/null || true

# ─── 6. SSL Let's Encrypt (standalone, không cần nginx chạy) ───
if [ ! -d /etc/letsencrypt/live/web.bioscope.vn ]; then
  echo "→ Xin SSL Let's Encrypt..."
  if ! command -v certbot &>/dev/null; then
    sudo apt-get install -y -qq certbot
  fi
  # Stop nginx (nếu có) trước khi xin cert standalone
  sudo systemctl stop nginx 2>/dev/null || true
  sudo certbot certonly --standalone \
    -d web.bioscope.vn \
    -d admin.bioscope.vn \
    --non-interactive --agree-tos -m admin@bioscope.vn
fi

# ─── 7. Firewall (mở 26080/26443 nếu BioBot đang dùng 80/443) ─
if command -v ufw &>/dev/null; then
  echo "→ Mở firewall 26080/26443..."
  sudo ufw allow 26080/tcp 2>/dev/null || true
  sudo ufw allow 26443/tcp 2>/dev/null || true
fi

# ─── 8. Build & start ──────────────────────────────────────────
echo "→ Build & start docker compose..."
cd "$DV_CMS_DIR"
docker compose build
docker compose up -d

# ─── 9. Đợi services healthy ──────────────────────────────────
echo "→ Đợi services healthy (tối đa 60s)..."
TIMEOUT=60
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
  STATUS=$(docker compose ps --format json 2>/dev/null | grep -oE '"Health":"(healthy|starting|unhealthy)"' | head -1 || echo "")
  if docker compose ps 2>/dev/null | grep -q "(healthy)"; then
    echo "→ Services healthy!"
    break
  fi
  sleep 5
  ELAPSED=$((ELAPSED + 5))
done

# ─── 10. Verify ────────────────────────────────────────────────
echo ""
echo "→ Status:"
docker compose ps

echo ""
echo "→ Test endpoints:"
curl -sS -o /dev/null -w "  CMS (admin)     : HTTP %{http_code}\n" "http://127.0.0.1:26080/admin" || true
curl -sS -o /dev/null -w "  Frontend (web)  : HTTP %{http_code}\n" "http://127.0.0.1:26080/" || true
curl -sS -o /dev/null -w "  CMS (HTTPS)     : HTTP %{http_code}\n" "https://admin.bioscope.vn/admin" 2>/dev/null || true

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   ✅ CÀI ĐẶT HOÀN TẤT                                     ║"
echo "║                                                            ║"
echo "║   Internal ports:                                         ║"
echo "║     - Postgres   : 26432                                  ║"
echo "║     - HTTP       : 26080                                  ║"
echo "║     - HTTPS      : 26443                                  ║"
echo "║                                                            ║"
echo "║   URLs (production):                                      ║"
echo "║     - https://admin.bioscope.vn/admin                     ║"
echo "║     - https://web.bioscope.vn                             ║"
echo "║                                                            ║"
echo "║   BƯỚC TIẾP THEO:                                         ║"
echo "║     bash scripts/seed.sh        # seed CSV + admin user   ║"
echo "║                                                            ║"
echo "║   Logs    : docker compose logs -f                        ║"
echo "║   Stop    : docker compose down                           ║"
echo "╚════════════════════════════════════════════════════════════╝"