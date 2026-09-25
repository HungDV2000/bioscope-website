#!/usr/bin/env bash
# backup-db.sh — Backup Postgres DB từ docker container

set -euo pipefail

# Suy đường dẫn từ vị trí chính file này, không cố định /opt — mỗi máy đặt repo
# một chỗ (VPS Bioscope đang ở /www/wwwroot/bioscope-website). Vẫn cho phép
# ghi đè bằng biến môi trường khi cần.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DV_CMS_DIR="${DV_CMS_DIR:-$(dirname "$SCRIPT_DIR")}"
BACKUP_DIR="${BACKUP_DIR:-$(dirname "$DV_CMS_DIR")/backups}"
KEEP_DAYS="${KEEP_DAYS:-7}"

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/dvcms_${TIMESTAMP}.dump"

cd "$DV_CMS_DIR"

echo "→ Dump database to $BACKUP_FILE..."
docker compose exec -T db pg_dump -U dvcms -d dvcms -F c -f /tmp/db.dump
docker cp dvcms-db:/tmp/db.dump "$BACKUP_FILE"
docker compose exec -T db rm -f /tmp/db.dump

# Compress
gzip -f "$BACKUP_FILE"

# Cleanup old
find "$BACKUP_DIR" -name "dvcms_*.dump.gz" -mtime +$KEEP_DAYS -delete

echo "✅ Backup saved: ${BACKUP_FILE}.gz"
ls -lh "$BACKUP_DIR" | tail -5