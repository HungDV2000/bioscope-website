#!/usr/bin/env bash
# seed.sh — SEED DATA cho bioscope-website
#
# Yêu cầu: đã chạy install.sh (services đang chạy).
# Làm (theo thứ tự):
#   1. Chạy runSeed() (idempotent) — TẠO TẤT CẢ DATA CHO FRONTEND:
#      - admin user (admin@bioscope.vn / Bioscope@123)
#      - site-settings (contact, social, defaultSeo)
#      - navigation (header + footer, vi + en)
#      - branding (theme Bioscope)
#      - bioscope-ai global (vi + en)
#      - seo-settings global (vi + en)
#      - 13 pages song ngữ (ve-chung-toi, nguyen-lieu, giai-phap, dong-kien-tao,
#        rd, tai-nguyen, case-study, lien-he, cau-hoi-thuong-gap, blog-chuyen-mon,
#        chinh-sach-bao-mat, dieu-khoan-su-dung, bioscope-ai)
#      - trang chủ = Page 9 block + link vào site-settings.homePage
#      - 4 partners, 3 ingredient categories, 3 technologies, 6 ingredients
#      - 3 services, 3 case studies, 9 FAQs, 7 certifications
#      - 2 members, 1 gated document (nếu có CoA media)
#      - 5 post categories, 4 tags, 3 posts blog
#      - forms (Liên hệ, mẫu thử, Bioscope AI)
#   2. Import CSV (1594 ingredients từ CrawlerDriveData)
#   3. Trigger Drive Sync (optional)
#
# Script idempotent — chạy nhiều lần OK, chỉ update/create missing.

set -euo pipefail

DV_CMS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CSV_DEFAULT="/opt/bioscope-data/CrawlerDriveData/output/danh_sach_san_pham.csv"
CSV_LARGE="/Users/kcode/Documents/Sources/DeepViewJSC/CrawlerDriveData/output/danh_sach_san_pham.csv"
CSV="${1:-${CSV_PATH:-$CSV_DEFAULT}}"

# Nếu không có ở default path, thử local path
[ ! -f "$CSV" ] && [ -f "$CSV_LARGE" ] && CSV="$CSV_LARGE"

cd "$DV_CMS_DIR"

# ─── Banner ────────────────────────────────────────────────────
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   BIOSCOPE — SEED DATA (full content + frontend pages)    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "CSV file : $CSV"
echo ""

# ─── 0. Check services running ─────────────────────────────────
if ! docker compose ps --services --status running 2>/dev/null | grep -q db; then
  echo "❌ DB chưa chạy. Chạy install.sh trước hoặc: docker compose up -d"
  exit 1
fi

# ─── 1. Đợi DB ready ──────────────────────────────────────────
echo "→ Đợi DB sẵn sàng..."
TIMEOUT=30
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
  if docker compose exec -T db pg_isready -U dvcms &>/dev/null; then
    echo "→ DB OK"
    break
  fi
  sleep 2
  ELAPSED=$((ELAPSED + 2))
done
if [ $ELAPSED -ge $TIMEOUT ]; then
  echo "❌ DB không ready sau ${TIMEOUT}s"
  exit 1
fi

# ─── 2. Đợi CMS ready (Payload phải migrate trước) ────────────
echo "→ Đợi CMS ready (Payload migrate)..."
TIMEOUT=120
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
  HTTP=$(curl -sS -o /dev/null -w "%{http_code}" "http://127.0.0.1:26080/api/users/me" 2>/dev/null || echo "000")
  if echo "$HTTP" | grep -qE "^(200|401|403)$"; then
    echo "→ CMS OK (HTTP $HTTP)"
    break
  fi
  sleep 3
  ELAPSED=$((ELAPSED + 3))
done
if [ $ELAPSED -ge $TIMEOUT ]; then
  echo "❌ CMS không ready sau ${TIMEOUT}s. Xem logs: docker compose logs cms"
  exit 1
fi

# ─── 3. Run Payload seed (admin + pages + branding + nav + ...) ─
# runSeed.ts bao gồm TẤT CẢ: admin user, site-settings, navigation (vi+en),
# branding, bioscope-ai (vi+en), seo-settings (vi+en), 13 pages song ngữ,
# trang chủ (9 block) + homePage ref, services, case studies, FAQs, partners,
# certifications, members, posts, categories, tags.
# Idempotent — chạy nhiều lần OK, update nếu đã có.
echo ""
echo "→ [3/6] Chạy runSeed() — full content seed (admin + pages + branding + nav + ...)..."
SEED_OUTPUT=$(docker compose exec -T cms \
  sh -c "cd /app/apps/core-cms && node --import tsx src/seed/runSeed.ts" 2>&1) || {
  echo "❌ runSeed thất bại:"
  echo "$SEED_OUTPUT" | tail -20
  exit 1
}
echo "$SEED_OUTPUT" | grep -E '^\[seed\]|^\[import\]' | tail -30
echo "→ runSeed OK"

# ─── 4. Verify trang chủ + pages đã tồn tại ──────────────────
echo ""
echo "→ [4/6] Verify pages + home page:"
docker compose exec -T db psql -U dvcms -d dvcms -c "
  SELECT slug,
         CASE WHEN title_vi IS NOT NULL THEN 'vi' ELSE '—' END || '/' ||
         CASE WHEN title_en IS NOT NULL THEN 'en' ELSE '—' END AS locales
  FROM (
    SELECT slug,
           MAX(CASE WHEN _locale='vi' THEN title END) AS title_vi,
           MAX(CASE WHEN _locale='en' THEN title END) AS title_en
    FROM pages
    GROUP BY slug
  ) s
  ORDER BY slug;" 2>/dev/null || true

# ─── 5. Import CSV ─────────────────────────────────────────────
echo ""
echo "→ [5/6] Import CSV..."
if [ -f "$CSV" ]; then
  docker cp "$CSV" dvcms-app:/app/danh_sach_san_pham.csv
  docker compose exec -T cms \
    sh -c "cd /app/apps/core-cms && CSV_PATH=/app/danh_sach_san_pham.csv node --import tsx src/scripts/importCsvRun.ts" 2>&1 \
    | grep -E '^\[import\]' | tail -10 || true

  echo ""
  echo "  DB counts:"
  docker compose exec -T db psql -U dvcms -d dvcms -c \
    "SELECT 'ingredient_categories' AS t, COUNT(*) FROM ingredient_categories
     UNION ALL SELECT 'ingredients', COUNT(*) FROM ingredients
     UNION ALL SELECT 'users (admin)', COUNT(*) FROM users WHERE role='admin'
     UNION ALL SELECT 'pages', COUNT(*) FROM pages
     UNION ALL SELECT 'partners', COUNT(*) FROM partners
     UNION ALL SELECT 'posts', COUNT(*) FROM posts
     UNION ALL SELECT 'case_studies', COUNT(*) FROM case_studies;" 2>/dev/null || true
else
  echo "⚠ Không tìm thấy CSV ở $CSV"
  echo "  Tạo data thủ công qua admin UI: https://admin.bioscope.vn/admin"
fi

# ─── 6. Trigger Drive Sync (optional) ─────────────────────────
echo ""
echo "→ [6/6] Trigger Drive Sync (optional)..."
read -p "Trigger Drive Sync từ Google Drive? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "→ Trigger Drive Sync..."
  docker compose exec -T cms \
    sh -c "curl -sS -X POST http://127.0.0.1:3001/api/drive-sync/trigger -H 'Content-Type: application/json' -d '{\"rootFolderId\":\"${GOOGLE_DRIVE_ROOT_FOLDER_ID:-}\"}'" \
    || echo "⚠ Trigger thất bại — kiểm tra GOOGLE_DRIVE_ROOT_FOLDER_ID trong .env"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   ✅ SEED HOÀN TẤT                                          ║"
echo "║                                                            ║"
echo "║   CMS Admin : https://admin.bioscope.vn/admin              ║"
echo "║     user    : admin@bioscope.vn                            ║"
echo "║     pass    : Bioscope@123                                 ║"
echo "║                                                            ║"
echo "║   Frontend : https://web.bioscope.vn                       ║"
echo "║   - Trang chủ (9 block)                                    ║"
echo "║   - 13 trang song ngữ (vi + en)                           ║"
echo "║   - Nav header/footer, branding, AI global                  ║"
echo "║   - 6 ingredients mẫu + CSV (1594 ingredients)             ║"
echo "║   - 3 services, 3 case studies, 9 FAQs                     ║"
echo "║   - 3 posts blog, 7 certifications, 4 partners             ║"
echo "╚════════════════════════════════════════════════════════════╝"