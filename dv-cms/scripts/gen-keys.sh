#!/usr/bin/env bash
# gen-keys.sh — Sinh secrets/key mới cho Bioscope CMS + Frontend
#
# Dùng khi:
#   - Lần đầu setup production
#   - Rotate key định kỳ (khuyến nghị mỗi 6-12 tháng)
#   - Sau khi lộ key (compromise)
#
# Output: POSTGRES_PASSWORD, PAYLOAD_SECRET, REVALIDATE_SECRET, B2B_COOKIE
#   - Tất cả đều qua `openssl rand` (CSPRNG)
#   - In ra stdout với format sẵn để copy-paste vào .env
#
# Cách dùng:
#   bash scripts/gen-keys.sh           # In tất cả keys
#   bash scripts/gen-keys.sh --write   # Tự động update .env (cẩn thận: ghi đè!)

set -euo pipefail

DV_CMS_DIR="$(cd "$(dirname "$0")/.." && pwd)"

print_keys() {
  cat <<EOF
# ─── Secrets (sinh lúc $(date -u +'%Y-%m-%d %H:%M:%S UTC')) ───
POSTGRES_PASSWORD=$(openssl rand -hex 24)
PAYLOAD_SECRET=$(openssl rand -hex 32)
REVALIDATE_SECRET=$(openssl rand -hex 32)
B2B_COOKIE=bio-$(openssl rand -hex 12)
N8N_ENCRYPTION_KEY=$(openssl rand -hex 32)
EOF
}

# Header
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   BIOSCOPE — KEY GENERATOR                                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "  → Sinh bằng OpenSSL CSPRNG (256-bit entropy)"
echo "  → Copy các dòng bên dưới vào dv-cms/.env + apps/core-cms/.env"
echo "  → REVALIDATE_SECRET phải GIỐNG NHAU giữa CMS và Frontend"
echo ""

# In keys ra stdout
print_keys

echo ""
echo "  → Lưu ý:"
echo "    • KHÔNG commit các key này (đã có trong .gitignore)"
echo "    • Đổi tất cả password trước khi go-live production"
echo "    • Rotate REVALIDATE_SECRET nếu lộ (key cũ sẽ fail handshake)"
echo ""

# Optional: tự động update .env
if [ "${1:-}" = "--write" ]; then
  echo "  → --write: cập nhật dv-cms/.env + apps/core-cms/.env (file backup: *.env.bak)"
  for env_file in "$DV_CMS_DIR/.env" "$DV_CMS_DIR/apps/core-cms/.env" "$DV_CMS_DIR/apps/bioscope-frontend/.env.local"; do
    if [ -f "$env_file" ]; then
      cp "$env_file" "${env_file}.bak.$(date +%s)"
      print_keys > /tmp/dv-keys.new
      # Replace dòng có key cũ
      while IFS= read -r line; do
        key=$(echo "$line" | cut -d= -f1)
        if [ -n "$key" ]; then
          sed -i '' "s|^${key}=.*|${line}|" "$env_file" 2>/dev/null \
            || sed -i "s|^${key}=.*|${line}|" "$env_file"
        fi
      done < /tmp/dv-keys.new
      echo "    ✓ updated: $env_file (backup tại ${env_file}.bak.*)"
    fi
  done
  rm -f /tmp/dv-keys.new
  echo ""
  echo "  → Restart containers: cd $DV_CMS_DIR && docker compose restart cms frontend"
fi
