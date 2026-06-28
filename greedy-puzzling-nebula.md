# Backend CMS đa-site cho DeepViewJSC (khởi đầu: Bioscope)

## Context
Frontend Bioscope (Next.js 14, `bioscope-website/frontend`) hiện chạy bằng **mock data** trong `src/lib/*` (`data.ts`, `home-content.ts`, `home-featured.ts`...), chưa có backend. SRS (`bioscope-website/SRS_BIOSCOPE.md`) đã khoá: **Payload CMS 3.0 (decoupled) + PostgreSQL 16 + Docker**, kiến trúc 2 tầng (Core generic / Bioscope đặc thù), i18n VI+EN, cổng B2B.

Mục tiêu lần này: dựng **một backend CMS dùng chung cho mọi website**, trong đó **core + tính năng chung được kế thừa/tái dùng**, còn **tính năng đặc thù đóng gói thành module npm cài thêm**. Quyết định đã chốt với người dùng:
- Stack: **Payload CMS 3.0** (Next-native, REST+GraphQL tự sinh, plugin = cơ chế module).
- Đóng gói: **monorepo pnpm + Turborepo**, core và mỗi module là **package npm riêng**; site là app mỏng compose lại.
- Ranh giới module: **generic + bioscope glue** — Catalog & B2B là module generic tái dùng; Bioscope chỉ là lớp cấu hình mỏng trên nền đó.
- Thứ tự: **dựng xong toàn bộ backend (core + module chung + module đặc thù) → test backend độc lập → sau đó mới quyết định nối API vào frontend** (frontend KHÔNG đụng tới trong đợt này).

> Lưu ý: CMS là service tách rời nên dùng **Next.js 15 / React 19** (yêu cầu của Payload 3) — không ảnh hưởng frontend Next 14. Node 20.19 hiện có đạt yêu cầu.

---

## Kiến trúc tổng thể

**Cơ chế module = Payload plugin.** Trong Payload 3, plugin là hàm `(config) => config` có thể tiêm collections, globals, endpoints, hooks, blocks, i18n, access. Đây chính là cơ chế "cài đặt bổ sung": thêm 1 tính năng = `pnpm add @dv/module-x` + thêm `moduleX()` vào mảng `plugins` + chạy migration. Core không bị sửa, tái dùng nguyên vẹn cho site khác.

```
buildConfig({
  db: postgresAdapter(...),
  localization: { locales:['vi','en'], defaultLocale:'vi', fallback:true },
  plugins: [
    corePlugin({ revalidate, roles }),     // Tầng 1 — generic, BẮT BUỘC
    catalogPlugin({...}),                   // module generic
    b2bPlugin({...}),                       // module generic
    bioscopePlugin({...}),                  // glue đặc thù (phụ thuộc catalog)
    seoPlugin(), formBuilderPlugin(), redirectsPlugin(),
  ],
})
```
Thứ tự nạp quan trọng: **core trước** (Users/Media là phụ thuộc của mọi module).

### Cấu trúc monorepo (repo mới: `DeepViewJSC/dv-cms/`)
```
dv-cms/
├─ pnpm-workspace.yaml · turbo.json · tsconfig.base.json
├─ docker-compose.yml            # postgres:16 + bioscope-cms (+ caddy tùy chọn)
├─ .env.example
├─ packages/
│  ├─ core/                @dv/cms-core   (Tầng 1 — generic, tái dùng mọi site)
│  │  └─ src/{plugin.ts, collections/, globals/, blocks/, fields/, access/, hooks/, utils/, index.ts}
│  ├─ module-catalog/      @dv/module-catalog  (generic: Partners, ProductCategories, Specs + factory createProductCollection)
│  ├─ module-b2b/          @dv/module-b2b      (generic: Members(auth) + GatedDocuments + endpoints /b2b/*)
│  └─ module-bioscope/     @dv/module-bioscope (glue: Technologies, Ingredients, IngredientCategories, Services, Certifications)
└─ apps/
   └─ bioscope-cms/        @dv/bioscope-cms    (deployable: payload.config.ts compose core+module, Next admin/API, seed, migrations, Dockerfile)
```

### Hợp đồng của mỗi module (chuẩn hoá để tái dùng)
Mỗi package export 1 plugin `xModule(options) => (config) => config`, kèm: collections/globals · access control · endpoints · hooks · blocks (tùy) · nhãn i18n · **typed options** (để site cấu hình: slug liên kết, cookie name, mapping revalidate...). Migration sinh ở **tầng app** (vì DB gắn với app), mỗi module chỉ khai báo schema qua field.

---

## Nội dung từng package (bám SRS §2)

### `@dv/cms-core` (Tầng 1)
- **Collections:** `Users`(auth; role admin|editor|viewer; avatar→Media), `Media`(upload; alt/caption localized; imageSizes thumbnail/card/og; focalPoint), `Pages`(title localized, slug, layout=blocks, hero→Media, drafts/versions, seo), `Posts`(title/excerpt/content localized, author→Users, cover→Media, categories, tags, publishedAt, seo), `Categories`, `Tags`.
- **Globals:** `SiteSettings`(logo, contact{address,phone,email,mst}, social, tracking{ga4,gtm,pixel}, defaultSeo), `Navigation`(header/footer items + children).
- **Blocks tái dùng:** Hero, RichText, Stats, FeatureGrid, Gallery, CTA, VideoEmbed, LogoCloud (map 1-1 với block renderer frontend sau này).
- **Fields/helpers:** `slugField()`, `seoField()`, localized helpers; **access:** `isAdmin`, `isAdminOrEditor`, `publishedOrSignedIn`; **hooks:** `buildRevalidateHook(opts)` (afterChange/afterDelete → `POST {FRONTEND_URL}/api/revalidate?secret=`).
- **Plugin chính thức gói trong core preset:** `@payloadcms/plugin-seo`, `@payloadcms/plugin-form-builder` (Forms + FormSubmissions), `@payloadcms/plugin-redirects`.

### `@dv/module-catalog` (generic)
- **Collections:** `Partners`(name, country, logo→Media, website), `ProductCategories`(name localized, slug, scope), `Specs` (label localized, value, unit, display text|bar|donut|number, order) dưới dạng **field group/array tái dùng** + factory `createProductCollection(opts)` cho catalog đơn giản.
- Export field-builders để module khác (Bioscope) dùng lại Specs/Partners/SEO/slug.

### `@dv/module-b2b` (generic)
- **Collections:** `Members`(auth:true; email, company, contactName, phone, status pending|approved|rejected, approvedAt — đăng ký mặc định `pending`, chỉ admin approve), `GatedDocuments`(title localized, docType COA|spec_sheet|quote|brochure, file→Media, visibility approved_members|specific, allowedMembers, relatesTo — collection đích cấu hình qua options).
- **Endpoints** `/api/b2b/*`: `register`, `login`(set HTTP-only cookie), `logout`, `me`, `documents`(chỉ trả tài liệu được phép), `documents/:id/download`(kiểm tra quyền → stream/signed URL).
- **Access:** chỉ `status=approved` đọc gated docs; `visibility=specific` kiểm tra `allowedMembers`. Cookie/JWT cấu hình qua options.

### `@dv/module-bioscope` (glue đặc thù)
- **Collections (localized, có seo + order, dùng helper của catalog/core):** `Technologies`(name, slug, tagline, description, mechanism richText, featuredImage, videoUrl, gallery, specs), `Ingredients`(name, slug, type supplement|cosmetic, category→IngredientCategories, originCountry, brandName, partner→Partners, description, benefits[], applications[], featuredImage, gallery, technologies relIDs, specs, featured, status), `IngredientCategories`(scope supplement|cosmetic|both), `Services`(title, slug, description, icon, features[]), `Certifications`(title, kind certificate|stat|award, value, suffix, image, order).
- Cấu hình `b2bPlugin({ relatesTo: 'ingredients' })` để gated docs liên kết nguyên liệu.

### `apps/bioscope-cms`
- `payload.config.ts` compose toàn bộ; `db: @payloadcms/db-postgres`; localization vi/en; CORS/CSRF cho domain FE.
- Next 15 app router `(payload)` (admin `/admin`, REST `/api/*`, GraphQL `/api/graphql`). Chạy **port 3001** (FE giữ 3000).
- **Seed script** `src/seed/` import dữ liệu thật từ frontend (`bioscope-website/frontend/src/lib/data.ts` ingredients/technologies, `home-content.ts`, `home-featured.ts`) → tạo content mẫu để test API ngay, đồng thời de-risk việc nối FE sau.
- `Dockerfile` + `docker-compose.yml` (postgres + cms). `.env.example` (DATABASE_URL, PAYLOAD_SECRET, FRONTEND_URL, REVALIDATE_SECRET, B2B_COOKIE...).

---

## Các bước thực thi
1. **Scaffold monorepo:** pnpm-workspace + turbo + tsconfig base; khởi tạo `apps/bioscope-cms` từ template Payload blank (Postgres), tách cấu trúc thư mục packages.
2. **`@dv/cms-core`:** collections/globals/blocks/fields/access/hooks + `corePlugin` + gói plugin seo/form-builder/redirects. App compose core → admin chạy, tạo admin user, CRUD Pages/Posts/Media/Settings.
3. **`@dv/module-catalog`** rồi **`@dv/module-bioscope`:** Partners/Specs/Categories + Technologies/Ingredients/Services/Certifications; khớp REST contract SRS §3.3 và shape response §3.6.
4. **`@dv/module-b2b`:** Members(auth) + GatedDocuments + endpoints `/b2b/*` + access control.
5. **Docker + seed + migration:** docker-compose lên Postgres; `payload migrate`; chạy seed; chỉnh revalidate hook (tạm tắt vì FE chưa nối).
6. **Test backend độc lập** (mục Verification). **Dừng tại đây** — báo cáo & chờ quyết định nối frontend.

---

## Verification (test backend trước khi đụng frontend)
- `docker compose up -d db` → Postgres 16; `pnpm --filter @dv/bioscope-cms payload migrate`.
- `pnpm --filter @dv/bioscope-cms dev` → mở `http://localhost:3001/admin`, tạo admin user, kiểm tra tất cả collections/globals hiện đúng, tạo thử content + bản dịch VI/EN.
- `pnpm --filter @dv/bioscope-cms seed` → populate dữ liệu thật.
- **REST** (khớp SRS §3): `GET /api/ingredients?where[type][equals]=supplement&depth=2`, `/api/technologies?sort=order&depth=2`, `/api/services`, `/api/certifications`, `/api/globals/site-settings?locale=vi`, `/api/posts`. Đối chiếu shape với §3.6.
- **GraphQL:** `/api/graphql-playground` query ingredients/technologies.
- **B2B:** `POST /api/b2b/register` → pending; admin approve; `POST /api/b2b/login` (nhận cookie); `GET /api/b2b/me`; `GET /api/b2b/documents`; thử `documents/:id/download` với member chưa approve → bị chặn.
- Kèm bộ file `requests.http` (REST Client) + smoke test vitest tối thiểu cho endpoints B2B & access control.
- **Tiêu chí dừng:** admin tạo/sửa nội dung VI/EN; REST+GraphQL trả đúng shape; B2B access control đúng; seed chạy sạch; docker compose lên được. → Báo cáo, chờ chốt nối frontend.

## Không làm trong đợt này
- Không sửa frontend (`bioscope-website/frontend`) — giữ nguyên mock data. Việc thay `lib/*` bằng fetch CMS + ISR revalidate sẽ lên kế hoạch sau khi test backend xong.
- Chưa cấu hình S3/CDN (dùng local volume), chưa reverse-proxy production (Caddy để TODO).
