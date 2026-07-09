#!/usr/bin/env bash
# backup-db.sh — Backup Postgres DB từ docker container

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/opt/bioscope-website/backups}"
DV_CMS_DIR="${DV_CMS_DIR:-/opt/bioscope-website/dv-cms}"
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