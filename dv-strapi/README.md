# dv-strapi — Backend Bioscope (phương án Strapi 5)

Phiên bản backend **song song** với `dv-cms` (Payload). Self-host PostgreSQL, REST + GraphQL, i18n VI/EN, Draft&Publish, cổng B2B.

## Chạy local
```bash
createdb -O dvcms dvstrapi      # DB riêng (Postgres dùng chung)
npm install
npm run develop                 # http://localhost:1337/admin  (port 1337)
```
Lần đầu boot tự tạo schema + chạy seed (`src/index.ts`):
- Cấp quyền **Public** đọc content API.
- Seed: 3 partner · 3 ingredient-category · 3 technology · 4 ingredient · 4 service · 7 certification · site-setting.
- B2B: `member@acme.com` (approved) + `pending@acme.com` (pending) — mật khẩu **Member@123**.
- 1 gated-document.

> Admin Strapi: tạo tài khoản ở lần đầu mở `/admin`.

## Cấu trúc
```
src/
├─ api/<name>/                    # content-types (schema.json) + controllers/routes/services
│  └─ b2b/                        # /b2b/documents, /b2b/documents/:id/download
├─ components/{shared,blocks}/     # seo, spec, stat, link + block components (dynamic zone)
├─ extensions/users-permissions/  # user mở rộng: company/contactName/phone/status/approvedAt
├─ policies/is-approved-member.ts # gác B2B (chỉ member approved)
└─ index.ts                       # bootstrap: public perms + seed
config/plugins.ts                 # graphql, i18n, users-permissions
```

## API (Strapi 5: `{ data, meta }` + `documentId` + `populate`)
```bash
curl 'http://localhost:1337/api/ingredients?locale=vi&populate=*'
curl 'http://localhost:1337/api/technologies?sort=order:asc'
curl -X POST http://localhost:1337/graphql -H 'Content-Type: application/json' \
  -d '{"query":"{ ingredients(locale:\"vi\"){ documentId name } }"}'
# B2B
TOK=$(curl -s -X POST http://localhost:1337/api/auth/local -H 'Content-Type: application/json' \
  -d '{"identifier":"member@acme.com","password":"Member@123"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).jwt')
curl http://localhost:1337/api/b2b/documents -H "Authorization: Bearer $TOK"
```

## Deploy VPS (Docker)
```bash
docker compose up -d --build      # strapi + postgres (đổi secrets sang production)
```

## Tech
Strapi 5.48 · Node 20 · PostgreSQL 16 · REST + GraphQL · i18n VI/EN.
