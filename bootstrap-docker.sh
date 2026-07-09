#!/usr/bin/env bash
# bootstrap-docker.sh — Cài đặt & khởi động bioscope-website bằng docker trên VPS
# Dùng cho production domain: admin.bioscope.vn + web.bioscope.vn
#
# Yêu cầu:
# - Ubuntu/Debian VPS
# - DNS trỏ admin.bioscope.vn + web.bioscope.vn về IP VPS
# - User có quyền sudo
# - Repo đã clone về /opt/bioscope-website

set -euo pipefail

REPO_DIR="/opt/bioscope-website"
DV_CMS_DIR="$REPO_DIR/dv-cms"
ENV_FILE="$DV_CMS_DIR/.env"
ENV_EXAMPLE="$DV_CMS_DIR/.env.example"

# ── Banner ────────────────────────────────────────────────────────
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   bioscope-website Docker bootstrap (production)          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ── 0. Cài docker nếu chưa có ────────────────────────────────────
if ! command -v docker &>/dev/null; then
  echo "→ Cài đặt Docker..."
  curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  sudo sh /tmp/get-docker.sh
  sudo usermod -aG docker "$USER"
  echo "→ Đã cài Docker. Logout/login lại hoặc chạy: newgrp docker"
  exit 0
fi

if ! docker compose version &>/dev/null; then
  echo "→ Cài docker compose plugin..."
  sudo apt-get update
  sudo apt-get install -y docker-compose-plugin
fi

# ── 1. Clone repo (nếu chưa có) ───────────────────────────────────
if [ ! -d "$REPO_DIR" ]; then
  echo "→ Clone repo..."
  sudo git clone https://github.com/HungDV2000/bioscope-website.git "$REPO_DIR"
  sudo chown -R "$USER":"$USER" "$REPO_DIR"
fi

cd "$REPO_DIR"

# ── 2. Chuẩn bị .env (nếu chưa có) ──────────────────────────────
if [ ! -f "$ENV_FILE" ]; then
  echo "→ Tạo .env từ .env.example..."
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  # Đổi localhost → production domain
  sed -i 's|http://localhost:3001|https://admin.bioscope.vn|g' "$ENV_FILE"
  sed -i 's|http://localhost:3000|https://web.bioscope.vn|g' "$ENV_FILE"
  sed -i 's|@localhost:5432|@db:5432|g' "$ENV_FILE"
  sed -i 's|^DVCMS_DB_HOST_PORT=.*|DVCMS_DB_HOST_PORT=26432|' "$ENV_FILE"
  sed -i 's|^NGINX_HOST_PORT=.*|NGINX_HOST_PORT=80|' "$ENV_FILE"
  echo "→ Đã tạo $ENV_FILE"
fi

# ── 3. Mount service-account.json (CHỈ chạy local, KHÔNG push git) ─
if [ ! -f "$DV_CMS_DIR/apps/core-cms/credentials/service-account.json" ]; then
  echo "⚠ THIẾU service-account.json!"
  echo "  Copy từ local: scp dv-cms/apps/core-cms/credentials/service-account.json user@vps:$DV_CMS_DIR/apps/core-cms/credentials/"
  exit 1
fi

# ── 4. Firewall (optional) ──────────────────────────────────────
if command -v ufw &>/dev/null; then
  echo "→ Mở port 80/443 trên firewall..."
  sudo ufw allow 80/tcp || true
  sudo ufw allow 443/tcp || true
fi

# ── 5. SSL Let's Encrypt ────────────────────────────────────────
if [ ! -d /etc/letsencrypt/live/web.bioscope.vn ]; then
  echo "→ Xin SSL Let's Encrypt..."
  sudo apt-get install -y certbot
  sudo certbot certonly --standalone \
    -d web.bioscope.vn \
    -d admin.bioscope.vn \
    --non-interactive --agree-tos -m admin@bioscope.vn
fi

# ── 6. Build & start ─────────────────────────────────────────────
echo "→ Build & start docker compose..."
cd "$DV_CMS_DIR"
docker compose build
docker compose up -d

# ── 7. Verify ───────────────────────────────────────────────────
sleep 15
echo ""
echo "→ Status:"
docker compose ps

echo ""
echo "→ Test endpoints:"
curl -sS -o /dev/null -w "  https://admin.bioscope.vn/admin → HTTP %{http_code}\n" https://admin.bioscope.vn/admin || true
curl -sS -o /dev/null -w "  https://web.bioscope.vn/      → HTTP %{http_code}\n" https://web.bioscope.vn/ || true

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Hoàn tất!                                                ║"
echo "║   CMS Admin : https://admin.bioscope.vn/admin              ║"
echo "║   Frontend  : https://web.bioscope.vn                      ║"
echo "║   Postgres  : localhost:26432 (dvcms)                      ║"
echo "║                                                            ║"
echo "║   Logs    : cd $DV_CMS_DIR && docker compose logs -f       ║"
echo "║   Stop    : cd $DV_CMS_DIR && docker compose down          ║"
echo "║   Restart : cd $DV_CMS_DIR && docker compose restart       ║"
echo "╚════════════════════════════════════════════════════════════╝"