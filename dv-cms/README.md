# dv-cms — DeepViewJSC Headless CMS Platform

Reusable **core** + **installable modules** on top of [Payload CMS 3](https://payloadcms.com).
`core-cms` là **backend CMS dùng chung** — triển khai một lần, áp dụng cho mọi website
(Bioscope là consumer đầu tiên).

## Architecture

```
packages/
  core            @dv/cms-core         Thư viện plugin — dùng chung, không sửa trực tiếp
  module-catalog  @dv/module-catalog   Product/catalog primitives
  module-b2b      @dv/module-b2b       B2B members + gated documents
  module-blocks   @dv/module-blocks    Page builder blocks
  module-bioscope @dv/module-bioscope  Glue riêng Bioscope (Technologies, Ingredients…)
apps/
  core-cms        @dv/core-cms         App Payload deploy — ghép core + modules
```

| Thành phần | Vai trò |
|---|---|
| `@dv/cms-core` | Plugin/collection dùng chung — cập nhật phiên bản, các site kế thừa |
| `@dv/core-cms` | Backend chạy thật: admin `/admin`, REST/GraphQL `/api/*`, migrations, seed |
| `module-*` | Bật/tắt trong `payload.config.ts` tùy từng website |

Website mới sau này: **duplicate monorepo** (hoặc fork), chỉnh `payload.config.ts`
(bật module, branding), deploy instance `core-cms` riêng với DB riêng.

## Quick start (local dev)

```bash
corepack enable                # provides pnpm
pnpm install
cp .env.example apps/core-cms/.env   # fill PAYLOAD_SECRET
pnpm db:up                      # Postgres 16 via Docker
pnpm cms:migrate                # run migrations
pnpm cms:dev                    # http://localhost:3001/admin
pnpm cms:seed                   # load sample data
```

CMS chạy cổng **3001** (frontend website giữ cổng 3000).

## Tech
Payload 3.85 · Next 15.4 · React 19 · PostgreSQL 16 (Drizzle) · pnpm + Turborepo.
