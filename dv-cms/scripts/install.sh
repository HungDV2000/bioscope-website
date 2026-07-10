#!/usr/bin/env bash
# install.sh — CÀI MỚI HOÀN TOÀN bioscope-website lên VPS
#
# Kiến trúc: aaPanel (nginx + Let's Encrypt) làm reverse proxy → Docker containers
#
# Khác với upgrade.sh: SCRIPT NÀY XÓA DATA CŨ (nếu có).
# Dùng cho lần đầu deploy, hoặc khi muốn fresh install.
#
# Host ports (dải 26xxx để không xung đột với BioBot 5432/6379/80/443/15678/...):
#   - 26432  Postgres
#   - 26080  Frontend (HTTP, chỉ aaPanel proxy mới truy cập)
#   - 26081  CMS       (HTTP, chỉ aaPanel proxy mới truy cập)
#
# Sau khi xong, cấu hình aaPanel:
#   - web.bioscope.vn   → http://127.0.0.1:26080
#   - admin.bioscope.vn → http://127.0.0.1:26081
#
# aaPanel tự xin Let's Encrypt cert → user truy cập https:// trực tiếp.

set -euo pipefail

# ─── Config ─────────────────────────────────────────────────────
DV_CMS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_DIR="$(cd "$DV_CMS_DIR/../.." && pwd)"
DATA_DIR="${DATA_DIR:-/opt/bioscope-data}"

# ─── Banner ────────────────────────────────────────────────────
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   BIOSCOPE-WEBSITE — INSTALL MỚI HOÀN TOÀN                ║"
echo "║   Kiến trúc: aaPanel (HTTPS) → Docker (HTTP 26xxx)         ║"
echo "║   ⚠ Script này SẼ XÓA volumes cũ nếu có                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "DV_CMS_DIR : $DV_CMS_DIR"
echo "DATA_DIR   : $DATA_DIR"
echo ""

# ─── 1. Yêu cầu docker ─────────────────────────────────────────
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

# ─── 2. Tạo / cập nhật .env ────────────────────────────────────
if [ ! -f "$DV_CMS_DIR/.env" ]; then
  echo "→ Tạo .env từ .env.example..."
  cp "$DV_CMS_DIR/.env.example" "$DV_CMS_DIR/.env"

  # Auto-config cho production domain (HTTPS vì aaPanel xử lý TLS)
  sed -i 's|http://localhost:3001|https://admin.bioscope.vn|g' "$DV_CMS_DIR/.env"
  sed -i 's|http://localhost:3000|https://web.bioscope.vn|g' "$DV_CMS_DIR/.env"
  sed -i 's|@localhost:5432|@db:5432|g' "$DV_CMS_DIR/.env"

  # Host ports cho aaPanel proxy (dải 26xxx — tránh xung đột BioBot)
  # Chạy mỗi lần install.sh (idempotent) để VPS cũ với port 26000/26001
  # cũng được fix tự động.
  sed -i 's|^DVCMS_DB_HOST_PORT=.*|DVCMS_DB_HOST_PORT=26432|'             "$DV_CMS_DIR/.env"
  sed -i 's|^DVCMS_FRONTEND_HOST_PORT=.*|DVCMS_FRONTEND_HOST_PORT=26080|' "$DV_CMS_DIR/.env"
  sed -i 's|^DVCMS_CMS_HOST_PORT=.*|DVCMS_CMS_HOST_PORT=26081|'           "$DV_CMS_DIR/.env"

  # Xoá các biến nginx container (không dùng nữa)
  sed -i '/^DVCMS_HTTP_HOST_PORT=/d'      "$DV_CMS_DIR/.env"
  sed -i '/^DVCMS_HTTPS_HOST_PORT=/d'     "$DV_CMS_DIR/.env"
  sed -i '/^NGINX_HOST_PORT=/d'           "$DV_CMS_DIR/.env"

  # Container internal port dải 26xxx
  sed -i 's|^PORT=.*|PORT=26301|' "$DV_CMS_DIR/.env"

  echo "→ Đã tạo $DV_CMS_DIR/.env"
  echo "  ⚠ NHỚ: sửa POSTGRES_PASSWORD, PAYLOAD_SECRET, REVALIDATE_SECRET"
  echo "     bằng 'openssl rand -hex 32' TRƯỚC KHI seed."
  echo ""
fi

# Idempotent: luôn đồng bộ host ports dải 26xxx (kể cả khi .env có sẵn từ
# version cũ với port 26000/26001). Chạy mỗi lần install.sh để fix an toàn
# cho VPS đã được deploy từ trước — không cần xóa .env.
echo "→ Đồng bộ host ports dải 26xxx trong .env..."
sed -i 's|^DVCMS_DB_HOST_PORT=.*|DVCMS_DB_HOST_PORT=26432|'             "$DV_CMS_DIR/.env"
sed -i 's|^DVCMS_CMS_HOST_PORT=.*|DVCMS_CMS_HOST_PORT=26081|'           "$DV_CMS_DIR/.env"
sed -i 's|^DVCMS_FRONTEND_HOST_PORT=.*|DVCMS_FRONTEND_HOST_PORT=26080|' "$DV_CMS_DIR/.env"
# Xoá các biến nginx container (không dùng nữa)
sed -i '/^DVCMS_HTTP_HOST_PORT=/d'      "$DV_CMS_DIR/.env"
sed -i '/^DVCMS_HTTPS_HOST_PORT=/d'     "$DV_CMS_DIR/.env"
sed -i '/^NGINX_HOST_PORT=/d'           "$DV_CMS_DIR/.env"

# ─── 3. Chuẩn bị secrets (service-account.json) ────────────────
if [ ! -f "$DV_CMS_DIR/apps/core-cms/credentials/service-account.json" ]; then
  echo ""
  echo "⚠ THIẾU service-account.json! (chỉ cần nếu dùng Google Drive sync)"
  echo "  Copy từ local:"
  echo "    scp -r bioscope-website/dv-cms/apps/core-cms/credentials \\"
  echo "        user@vps:$DV_CMS_DIR/apps/core-cms/"
  echo ""
  read -p "Bỏ qua (Drive sync sẽ không hoạt động)? (yes/no) " -r
  [ "$REPLY" != "yes" ] && { echo "Hủy."; exit 1; }
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

# ─── 6. Firewall (mở 26080/26081 cho aaPanel proxy nội bộ) ────
# Lưu ý: aaPanel/nginx host-level bind 80/443 nhận từ ngoài Internet.
# Docker containers bind 127.0.0.1:26080/26081 (chỉ localhost mới truy cập).
# → KHÔNG CẦN mở 26080/26081 ra ngoài Internet — aaPanel reverse proxy sẽ tự kết nối nội bộ.
if command -v ufw &>/dev/null; then
  echo "→ Firewall: chỉ mở 22/80/443 cho SSH + aaPanel (Docker port nội bộ không lộ ra ngoài)"
  sudo ufw allow OpenSSH    2>/dev/null || true
  sudo ufw allow 80/tcp     2>/dev/null || true
  sudo ufw allow 443/tcp    2>/dev/null || true
  # 26080/26081 KHÔNG mở — chỉ bind 127.0.0.1 trong docker-compose
  sudo ufw reload 2>/dev/null || true
fi

# ─── 7. Build & start ──────────────────────────────────────────
echo ""
echo "→ Build & start docker compose..."
cd "$DV_CMS_DIR"
docker compose build
docker compose up -d

# ─── 8. Đợi services healthy ──────────────────────────────────
echo "→ Đợi services healthy (tối đa 90s)..."
TIMEOUT=90
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
  if docker compose ps 2>/dev/null | grep -qE "(healthy|running)"; then
    STATUS=$(docker compose ps --format json 2>/dev/null | grep -oE '"Health":"healthy"' | head -1 || echo "")
    if [ -n "$STATUS" ]; then
      echo "→ Services healthy!"
      break
    fi
  fi
  sleep 5
  ELAPSED=$((ELAPSED + 5))
done

# ─── 9. Verify (test trực tiếp host port — KHÔNG cần HTTPS) ───
echo ""
echo "→ Status:"
docker compose ps

echo ""
echo "→ Test endpoints (HTTP qua host port 26xxx):"
curl -sS -o /dev/null -w "  Frontend (26080) : HTTP %{http_code}\n" "http://127.0.0.1:26080/"       || true
curl -sS -o /dev/null -w "  CMS (26081)      : HTTP %{http_code}\n" "http://127.0.0.1:26081/admin"  || true
curl -sS -o /dev/null -w "  CMS API          : HTTP %{http_code}\n" "http://127.0.0.1:26081/api/users/me" || true

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   ✅ CÀI ĐẶT HOÀN TẤT                                     ║"
echo "║                                                            ║"
echo "║   Stack đang chạy ở host port (HTTP, nội bộ):              ║"
echo "║     - Frontend   : 127.0.0.1:26080  (chỉ aaPanel proxy)   ║"
echo "║     - CMS        : 127.0.0.1:26081  (chỉ aaPanel proxy)   ║"
echo "║     - Postgres   : 127.0.0.1:26432  (chỉ ops)             ║"
echo "║                                                            ║"
echo "║   BƯỚC TIẾP THEO:                                         ║"
echo "║                                                            ║"
echo "║   1. Sửa secrets trong .env (nếu chưa):                    ║"
echo "║        POSTGRES_PASSWORD=...                                ║"
echo "║        PAYLOAD_SECRET=...                                  ║"
echo "║        REVALIDATE_SECRET=...                               ║"
echo "║      Sau đó: docker compose restart cms frontend            ║"
echo "║                                                            ║"
echo "║   2. Seed data:                                            ║"
echo "║        bash scripts/seed.sh                                ║"
echo "║                                                            ║"
echo "║   3. Cấu hình aaPanel reverse proxy (xem docs/06-deploy.md)║"
echo "║        web.bioscope.vn   → http://127.0.0.1:26080          ║"
echo "║        admin.bioscope.vn → http://127.0.0.1:26081          ║"
echo "║                                                            ║"
echo "║   Logs    : docker compose logs -f                         ║"
echo "║   Stop    : docker compose down                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
