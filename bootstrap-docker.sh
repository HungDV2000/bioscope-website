#!/usr/bin/env bash
# bootstrap-docker.sh — Wrapper gọi install + seed cho lần cài đầu
# Nếu muốn upgrade (giữ data) sau này: bash scripts/upgrade.sh
# Nếu muốn seed thêm data: bash scripts/seed.sh

set -euo pipefail

DV_CMS_DIR="$(cd "$(dirname "$0")" && pwd)/dv-cms"

echo "════════════════════════════════════════════════════════════"
echo "  BIOSCOPE-WEBSITE — BOOTSTRAP"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "[1/2] Cài đặt fresh..."
bash "$DV_CMS_DIR/scripts/install.sh"

echo ""
echo "[2/2] Seed data..."
bash "$DV_CMS_DIR/scripts/seed.sh"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  ✅ Bootstrap hoàn tất!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "  Lần sau cập nhật code (giữ data):"
echo "    bash $DV_CMS_DIR/scripts/upgrade.sh"
echo ""
echo "  Rollback nếu lỗi:"
echo "    bash $DV_CMS_DIR/scripts/upgrade.sh rollback"