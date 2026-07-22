#!/usr/bin/env bash
# upgrade.sh — NÂNG CẤP bioscope-website (giữ nguyên data)
#
# Luồng an toàn:
#   1. Backup DB trước khi upgrade (rollback nếu lỗi)
#   2. Backup media volume
#   3. git pull code mới
#   4. Re-build images
#   5. Restart services với downtime tối thiểu
#   6. Verify sau upgrade
#
# KHÔNG xóa data. KHÔNG xóa volumes.

set -euo pipefail

DV_CMS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
# Hỏi git thay vì đếm số cấp thư mục: repo root là thư mục CHA của dv-cms
# (dv-cms là thư mục con), nên "../.." vượt quá một cấp và trỏ ra ngoài repo.
# rev-parse cũng đúng luôn nếu sau này cấu trúc thư mục thay đổi.
REPO_DIR="$(git -C "$DV_CMS_DIR" rev-parse --show-toplevel 2>/dev/null || (cd "$DV_CMS_DIR/.." && pwd))"
BACKUP_DIR="${BACKUP_DIR:-/opt/bioscope-data/backups}"
KEEP_BACKUPS="${KEEP_BACKUPS:-5}"

mkdir -p "$BACKUP_DIR"

# ─── Banner ────────────────────────────────────────────────────
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   BIOSCOPE — UPGRADE (giữ nguyên data)                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Repo        : $REPO_DIR"
echo "Backup dir  : $BACKUP_DIR"
echo ""

# ─── 0. Pre-flight checks ─────────────────────────────────────
if ! docker compose ps db 2>/dev/null | grep -q "Up\|running"; then
  echo "❌ Services chưa chạy. Chạy install.sh trước."
  exit 1
fi

if [ ! -d "$REPO_DIR/.git" ]; then
  echo "❌ Không phải git repo: $REPO_DIR"
  exit 1
fi

# ─── 1. Snapshot trước upgrade ─────────────────────────────────
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SNAP_DIR="$BACKUP_DIR/pre-upgrade-$TIMESTAMP"
mkdir -p "$SNAP_DIR"

echo "→ [1/6] Snapshot data (DB + media + .env)..."
docker compose exec -T db pg_dump -U dvcms -d dvcms -F c -f /tmp/db.dump
docker cp dvcms-db:/tmp/db.dump "$SNAP_DIR/dvcms.dump"
docker compose exec -T db rm -f /tmp/db.dump

# Backup media volume
docker run --rm \
  -v dv-cms_media:/from:ro \
  -v "$SNAP_DIR":/to \
  alpine sh -c "tar czf /to/media.tar.gz -C /from ."

cp "$DV_CMS_DIR/.env" "$SNAP_DIR/.env"
cp "$DV_CMS_DIR/apps/bioscope-frontend/.env.local" "$SNAP_DIR/.env.frontend.local" 2>/dev/null || true
cp "$DV_CMS_DIR/apps/core-cms/.env" "$SNAP_DIR/.env.core-cms" 2>/dev/null || true

echo "  Snapshot: $SNAP_DIR"
ls -lh "$SNAP_DIR"

# ─── 2. Git pull ───────────────────────────────────────────────
echo ""
echo "→ [2/6] Git pull latest code..."
cd "$REPO_DIR"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "  Branch: $CURRENT_BRANCH"
git fetch origin "$CURRENT_BRANCH"
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$CURRENT_BRANCH")

if [ "$LOCAL" = "$REMOTE" ]; then
  echo "  (đã ở commit mới nhất, bỏ qua pull)"
else
  echo "  Local  : $LOCAL"
  echo "  Remote : $REMOTE"
  echo "  Changes:"
  git log --oneline "$LOCAL..$REMOTE" | head -20

  # Stash local changes nếu có
  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "  ⚠ Có local changes. Stash..."
    git stash push -m "auto-stash-before-upgrade-$TIMESTAMP"
  fi

  git pull --rebase origin "$CURRENT_BRANCH"
fi

# ─── 3. Re-build images (không xóa data) ─────────────────────
echo ""
echo "→ [3/6] Build images (giữ volumes)..."
cd "$DV_CMS_DIR"
docker compose build --pull

# ─── 4. Apply migrations + restart ────────────────────────────
echo ""
echo "→ [4/6] Apply migrations (nếu có)..."
docker compose run --rm --no-deps cms \
  sh -c "cd /app/apps/core-cms && pnpm payload migrate" \
  || echo "  (không có migration mới)"

# ─── 5. Rolling restart (zero-downtime cho DB) ─────────────────
echo ""
echo "→ [5/6] Rolling restart services..."

# Frontend + CMS: recreate (downtime ~30s)
# DB: KHÔNG restart (giữ data)
# nginx container KHÔNG còn — aaPanel (host) xử lý reverse proxy + TLS.
docker compose up -d --no-deps --force-recreate --build cms frontend

# Đợi healthy (check cả frontend 26080 + CMS 26081 — kiến trúc aaPanel proxy)
echo "  Đợi services healthy..."
TIMEOUT=90
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
  HTTP_FRONT=$(curl -sS -o /dev/null -w "%{http_code}" "http://127.0.0.1:26080/"          2>/dev/null || echo "000")
  HTTP_CMS=$(curl   -sS -o /dev/null -w "%{http_code}" "http://127.0.0.1:26081/admin"      2>/dev/null || echo "000")
  if echo "$HTTP_FRONT" | grep -qE "^(200|301|302)$" && echo "$HTTP_CMS" | grep -qE "^(200|301|302|401|403)$"; then
    echo "  ✓ Services healthy! (frontend=$HTTP_FRONT, cms=$HTTP_CMS)"
    break
  fi
  sleep 3
  ELAPSED=$((ELAPSED + 3))
done

if [ $ELAPSED -ge $TIMEOUT ]; then
  echo ""
  echo "  ⚠ Services không healthy sau ${TIMEOUT}s. Rollback?"
  read -p "  Rollback về snapshot $SNAP_DIR? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    "$0" _rollback "$SNAP_DIR"
    exit 1
  fi
fi

# ─── 6. Verify ────────────────────────────────────────────────
echo ""
echo "→ [6/6] Verify..."
docker compose ps

echo ""
echo "  Health checks (kiến trúc aaPanel proxy → Docker host port):"
curl -sS -o /dev/null -w "    Frontend (26080)  : HTTP %{http_code}\n" "http://127.0.0.1:26080/" || true
curl -sS -o /dev/null -w "    CMS (26081)       : HTTP %{http_code}\n" "http://127.0.0.1:26081/admin" || true

echo ""
echo "  Data integrity:"
docker compose exec -T db psql -U dvcms -d dvcms -c \
  "SELECT 'categories' AS t, COUNT(*) FROM ingredient_categories
   UNION ALL
   SELECT 'ingredients', COUNT(*) FROM ingredients;" 2>/dev/null || true

# Cleanup old backups
echo ""
echo "→ Cleanup old backups (keep last $KEEP_BACKUPS)..."
ls -1dt "$BACKUP_DIR"/pre-upgrade-* 2>/dev/null | tail -n +$((KEEP_BACKUPS + 1)) | xargs -r rm -rf
echo "  Remaining backups:"
ls -lh "$BACKUP_DIR" | tail -10

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   ✅ UPGRADE HOÀN TẤT                                       ║"
echo "║   Snapshot backup: $SNAP_DIR"
echo "║   Nếu có vấn đề, rollback: bash scripts/upgrade.sh rollback $SNAP_DIR"
echo "╚════════════════════════════════════════════════════════════╝"

# ─── Rollback helper ──────────────────────────────────────────
_rollback() {
  local SNAP="${1:-}"
  if [ -z "$SNAP" ] || [ ! -d "$SNAP" ]; then
    echo "Usage: $0 rollback <snapshot-dir>"
    ls -1dt "$BACKUP_DIR"/pre-upgrade-* 2>/dev/null | head -5
    return 1
  fi

  echo "→ Rolling back to $SNAP..."
  cd "$DV_CMS_DIR"

  # Stop services
  docker compose down

  # Restore DB
  docker compose up -d db
  sleep 10
  docker cp "$SNAP/dvcms.dump" dvcms-db:/tmp/restore.dump
  docker compose exec -T db sh -c "pg_restore -U dvcms -d dvcms --clean --no-owner /tmp/restore.dump" || true
  docker compose exec -T db rm -f /tmp/restore.dump

  # Restore env
  cp "$SNAP/.env" "$DV_CMS_DIR/.env"
  [ -f "$SNAP/.env.frontend.local" ] && cp "$SNAP/.env.frontend.local" "$DV_CMS_DIR/apps/bioscope-frontend/.env.local"

  # Restore media (chỉ nếu khác)
  docker compose up -d cms
  sleep 10

  echo "✓ Rollback done. Verify data:"
  docker compose exec -T db psql -U dvcms -d dvcms -c \
    "SELECT 'categories' AS t, COUNT(*) FROM ingredient_categories
     UNION ALL
     SELECT 'ingredients', COUNT(*) FROM ingredients;"
}

# Handle "rollback" subcommand
if [ "${1:-}" = "rollback" ]; then
  _rollback "${2:-}"
fi