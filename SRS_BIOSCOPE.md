# SRS — DEEPVIEW AGENCY PLATFORM (Core CMS + Modules + Domain Services)
> Software Requirements Specification — Nền tảng dùng chung cho mọi dự án của Agency.
> Phiên bản: 2.0 · Cập nhật: 2026-06-27 · Trạng thái: Blueprint đã chốt (Hybrid)
> Consumer đầu tiên: **Bioscope**. Stress-test mở rộng: **Ma Cabane** (marketplace BĐS).
>
> Đổi từ v1.0 (SRS riêng Bioscope) → v2.0: tổng quát hóa thành **nền tảng đa dự án** theo kiến trúc **Hybrid** (Payload Core + NestJS Domain). Bioscope giữ nguyên là dự án triển khai trước để tôi luyện Core.

---

## 0. TÓM TẮT QUYẾT ĐỊNH (Locked Decisions)

| Hạng mục | Quyết định |
|---|---|
| **Mô hình** | **Hybrid**: Payload Core (nội dung + danh tính) **+** NestJS Domain Services (nghiệp vụ phức tạp, tùy chọn) |
| **Core CMS** | **Payload CMS 3** (`3.85.x`) — auth/RBAC, media, pages, blog, SEO, forms, i18n, settings; REST + GraphQL tự sinh |
| **Domain Service** | **NestJS** (`11.x`) — chỉ bật cho dự án phức tạp (marketplace, booking, payment, AI nặng, feed sync) |
| **Frontend (chuẩn hóa)** | **Next.js 16 App Router** + React 19 + TypeScript 5.9 + **Tailwind v4** + Be Vietnam Pro + Motion |
| **Database** | **PostgreSQL 16** (schema `cms` cho Payload, schema `app` cho NestJS) |
| **Search** | **Meilisearch** (self-host) cho dự án có catalog/annonces lớn |
| **Hàng đợi / cache** | **Redis + BullMQ** (job nền: import feed, email, AI scoring) |
| **Định danh dùng chung** | **SSO bằng JWT** — Payload phát token, NestJS verify cùng secret/JWKS |
| **Admin** | **Cách 1** — bắt đầu bằng Payload admin (theming), **di cư dần** sang UI bespoke (Swiss) dựng trên backend Payload, theo từng module |
| **Monorepo / Infra** | pnpm + Turborepo · Docker Compose · self-host VPS (site nhẹ) / **EU cloud** (Ma Cabane, RGPD) |
| **API** | REST + GraphQL, **API-first** (phục vụ cả Web Next.js lẫn Mobile App tương lai) |
| **AI** | AI module dùng chung (Claude API): sinh/tối ưu nội dung, SEO, dịch, scoring, matching, assistant |
| **Thứ tự thực thi** | (1) Frontend Bioscope → (2) Core CMS Payload → (3) Modules Bioscope + B2B → (4) Domain Services (khi tới Ma Cabane) |

### Nguyên tắc nền tảng
1. **Core dùng chung, Module cắm thêm.** Mỗi dự án = duplicate monorepo + bật module qua config; không sửa Core trực tiếp.
2. **Ranh giới rõ:** *Nội dung & danh tính → Payload. Tiền, giao dịch nhiều bước, dữ liệu lớn/real-time, tích hợp ngoài → NestJS.*
3. **Chống coupling** để giảm "upgrade tax" của Payload (xem §7).
4. **Frontend chuẩn hóa Next.js** cho mọi dự án (SEO-first) — thay cho Vite SPA/HTML template cũ.
5. **Mã nguồn 100% sở hữu** (Payload + NestJS đều open-source, self-host) — thỏa yêu cầu "sur mesure, propriété cliente" của Ma Cabane.

---

## 1. KIẾN TRÚC TỔNG THỂ (4 tầng)

```
┌────────────────────────── FRONTEND (Next.js 16, SEO-first) ──────────────────────────┐
│  Theme + pages riêng mỗi dự án · SSR/SSG/ISR · i18n · design system dùng chung          │
└───────────────┬───────────────────────────────────────────────┬───────────────────────┘
                │ REST/GraphQL (nội dung)                         │ REST/GraphQL (nghiệp vụ)
┌───────────────▼───────────────┐                 ┌───────────────▼────────────────────────┐
│   CORE CMS — Payload 3         │  ◀── SSO JWT ──▶ │   DOMAIN SERVICES — NestJS (tùy chọn)   │
│   (schema: cms)                │   webhook/event  │   (schema: app)                          │
│   auth/RBAC · media · pages    │ ◀──────────────▶ │   marketplace · booking · payment        │
│   blog · forms · SEO · i18n    │                  │   feed-sync · AI scoring · reports       │
│   settings · MODULES (plugin)  │                  │   connectors (CRM, Brevo, Stripe…)       │
└───────────────┬───────────────┘                 └───────────────┬─────────────────────────┘
                │                                                  │
        PostgreSQL 16 (schema cms)                  PostgreSQL 16 (schema app) · Meilisearch · Redis/BullMQ
```

### 1.1 Bốn cơ chế kết nối Payload ↔ NestJS
1. **SSO / JWT dùng chung** — Payload là nguồn danh tính; NestJS verify cùng `JWT_SECRET`/JWKS qua `AuthGuard`. Một đăng nhập, hai service đều biết "ai/role gì".
2. **NestJS đọc nội dung qua API Payload** (REST/GraphQL) — không ghi đè; Payload là source of truth cho nội dung.
3. **Payload → NestJS qua webhook (`afterChange` hook)** — đồng bộ index search, cập nhật trạng thái.
4. **Event bất đồng bộ qua Redis/BullMQ** — việc nặng (import feed, email hàng loạt, AI scoring) chạy nền.

> **Sở hữu dữ liệu:** mỗi service sở hữu bảng của mình; tham chiếu chéo bằng **ID**; đồng bộ bằng event — **không dual-write**.

---

## 2. TẦNG CORE CMS (Payload) — dùng chung mọi dự án

Cung cấp sẵn (không tự code lại):
- **Auth + RBAC** (admin/editor/viewer + role tùy biến), access control theo field/collection.
- **Media** (upload, alt/caption localized, imageSizes thumbnail/card/og, focal point).
- **Pages** (slug, layout = blocks[], status draft/published, SEO) — title localized.
- **Posts/Blog** + Categories + Tags (title/excerpt/content localized, author, cover, publishedAt, SEO).
- **Globals**: SiteSettings (logo, contact, social, tracking GA4/GTM, defaultSeo), Navigation (header/footer).
- **Forms / FormSubmissions** (thu lead) + Redirects.
- **i18n** (`localization`, vi mặc định + en, mở rộng được).
- **REST `/api/*` + GraphQL `/api/graphql`** tự sinh; **admin schema-driven** (khai báo collection → CRUD tự render).
- **Hooks/Endpoints/Jobs** để mở rộng; plugin SEO + form-builder.

→ **Eneville, LAS-XD, Bioscope** chủ yếu chỉ cần tầng này (+ module nhẹ).

---

## 3. TẦNG MODULES (Payload plugins, bật/tắt theo dự án)

Mỗi module là package npm riêng, kích hoạt trong `payload.config.ts`:

| Module | Nội dung | Dùng cho |
|---|---|---|
| `module-catalog` | Sản phẩm/danh mục/specs generic | Bioscope, e-comm nhẹ |
| `module-b2b` | Thành viên B2B + tài liệu gated (COA/báo giá) | Bioscope |
| `module-blocks` | Page-builder blocks (Hero/Stats/Gallery/CTA…) | Mọi dự án |
| `module-bioscope` | Glue riêng Bioscope (Technologies, Ingredients, Partners, Certifications) | Bioscope |
| `module-editorial` | Guides/news nâng cao, programmatic content source | Ma Cabane, blog-heavy |

> Module = nghiệp vụ **biên tập viên quản trong admin**. Nghiệp vụ giao dịch nặng KHÔNG làm thành Payload module → đẩy xuống Domain (§5).

---

## 4. TẦNG FRONTEND (Next.js — chuẩn hóa toàn agency)

- **Stack:** Next 16 App Router · React 19 · TS 5.9 · Tailwind v4 · Motion · next/font (Be Vietnam Pro).
- **Design system dùng chung:** tokens (màu/thân/spacing/radius/shadow) theo **biến CSS** → mỗi dự án override theme riêng.
- **Render SEO-first:** SSG/ISR cho trang nội dung & **programmatic SEO**; SSR cho trang động (search/listing).
- **i18n** route segment `/[locale]` + middleware.
- **Tiêu dùng API:** gọi Payload cho nội dung, gọi NestJS cho nghiệp vụ; có thể đặt **BFF/gateway** khi cần.
- **Bỏ dần** Vite-SPA (Eneville) và HTML template (LAS-XD) → chuyển Next để đạt SEO/CWV.

### 4.1 Design tokens Bioscope (theo logo)
```
--color-primary:        #008E4D;   /* Bio Green (logo) */
--color-primary-dark:   #036F3D;
--color-primary-tint:   #EEF6F1;
--color-primary-border: #CFE3D8;
--color-accent:         #F58E33;   /* Vital Orange (logo) */
--color-ink:            #101814;
--color-mist:           #F4F8F6;
--font-sans: "Be Vietnam Pro", system-ui, sans-serif;   /* heading + body */
/* radius lg16 / xl24 / 2xl28 · shadow-card mềm khuếch tán */
```
> Mỗi dự án (Eneville/LAS-XD/Ma Cabane) có bộ token riêng; **Ma Cabane**: xanh dương (confiance) chủ đạo + accent ấm (vert/orangé "cabane").

---

## 5. TẦNG DOMAIN SERVICES (NestJS) — bật cho dự án phức tạp

Chỉ triển khai khi dự án có nghiệp vụ vượt khả năng CMS. Tận dụng DI + module hóa của NestJS.

**Khi nào dùng:** marketplace, booking/RDV, thanh toán/subscription, search triệu bản ghi, đồng bộ feed bên thứ 3, AI nhiều bước, tích hợp CRM/ERP, real-time.

**Cấu trúc thư mục NestJS (module độc lập, bật qua `MODULES_ENABLED`):**
```
domain-service/
├─ src/
│  ├─ core/            # config, AuthGuard (verify JWT Payload), drizzle/prisma, http
│  ├─ modules/
│  │  ├─ listings/     # CRUD + search (Meilisearch) + map
│  │  ├─ feed-sync/    # import Apimo/Hektor (XML/JSON) qua queue
│  │  ├─ billing/      # Stripe (CB/SEPA), abonnements, factures/TVA
│  │  ├─ booking/      # RDV: slot, agent, confirm email/SMS
│  │  ├─ accounts-pro/ # vérif pro (OTP), espace pro
│  │  ├─ ai/           # rewrite/scoring annonces, matching, assistant (Claude API)
│  │  ├─ reports/      # KPI: CA, leads, conversion, perf annonces
│  │  └─ connectors/   # CRM, Brevo, Crisp, compta, Ads, DPE
│  └─ main.ts
```
- **API-first**: REST + GraphQL → dùng cho Web và **Mobile App**.
- **Schema endpoint** (`GET /_schema/:resource`) để admin schema-driven vẽ CRUD chung.

---

## 6. CHIẾN LƯỢC ADMIN (Cách 1 — di cư dần)

| Giai đoạn | Admin |
|---|---|
| **A (khởi đầu)** | Payload admin + **theming sâu** (Be Vietnam Pro, màu thương hiệu, nav/dashboard tùy biến) — nhanh, giữ CRUD tự sinh |
| **1 (nâng cấp)** | **UI bespoke (Swiss minimalism)** dựng trên **backend Payload**, làm **từng module một**; module chưa làm vẫn dùng admin Payload |
| Dữ liệu Domain (NestJS) | Nhúng vào shell admin qua **custom view gọi `/api/app/*`** (kèm JWT) hoặc dashboard riêng; **schema-driven** từ `_schema` endpoint |

- **Một đăng nhập, một shell admin** cho cả nội dung (Payload) lẫn nghiệp vụ (NestJS).
- **Form Generator dùng chung**: component generic đọc Schema JSON từ cả Payload lẫn NestJS → thêm module mới = khai báo schema, không code lại UI.
- Menu admin **render động** theo `MODULES_ENABLED` backend trả về.

---

## 7. NGUYÊN TẮC CHỐNG COUPLING (giảm upgrade-tax Payload)

- **Pin version chính xác**; nâng cấp **chủ động** (security/feature), đọc changelog/migration trước.
- Customize **chỉ** ở lớp an toàn: **config collections/fields/hooks/access/endpoints** + **custom view dạng trang-riêng-gọi-API** + **CSS variables/theme**.
- **Tránh** đè component nội bộ sâu / import API chưa export của `@payloadcms/ui`.
- Quy trình nâng cấp: branch → `pnpm update` → **typecheck + build + smoke test admin (e2e CRUD 1 bản ghi)**.
- Domain (NestJS) tách hẳn → **không bị ảnh hưởng** khi update Payload.

---

## 8. AI MODULE (dùng chung)

- **Tác vụ nhẹ** (sinh SEO/meta, dịch VI↔EN, tóm tắt, phân loại, gợi ý tag) → gắn Payload **hook/job**.
- **Tác vụ nặng/đa bước** (RAG "hỏi dữ liệu", scoring/rewrite annonces, matching, alertes intelligentes, assistant immobilier) → **NestJS + queue**.
- Model: **Claude** (mặc định model mới nhất); abstraction provider để thay đổi.

---

## 9. BIOSCOPE — CONSUMER ĐẦU TIÊN

**Bật:** Core + `module-catalog` + `module-b2b` + `module-bioscope` + `module-blocks`. **Không cần** Domain NestJS (trừ khi sau này thêm AI gợi ý công thức nặng / ERP).

**Collections Tầng-2 (localized VI+EN, seo, order):** Technologies, Ingredients, IngredientCategories, Services, Certifications, Partners, Specs.
**B2B:** B2BMembers (auth, status pending/approved/rejected), B2BDocuments (COA/spec/quote/brochure, visibility, allowedMembers) + endpoints `/api/b2b/*` (register/login/logout/me/documents/download), access control theo status.
**Frontend (đã dựng Phase 1):** Trang chủ, Nguyên liệu (catalog+gating), Giải pháp, Đồng kiến tạo, R&D, Case Study, Về chúng tôi, Tài nguyên, Liên hệ (form wizard) — hiện chạy sample data, sẽ nối Payload.

> Chi tiết schema/endpoint Bioscope giữ như v1.0 (đã triển khai trong `dv-cms`): Users/Media/Pages/Posts + Technologies/Ingredients/Services/Certifications/Partners/Specs + B2B.

---

## 10. PHỤ LỤC — MAP DỰ ÁN VÀO KIẾN TRÚC

### 10.1 Eneville & LAS-XD 1628 (brochure)
- **Chỉ cần Core** (pages, blog, media, SEO, forms, i18n) + theme riêng. **Không** Domain.
- **Khuyến nghị:** chuyển frontend sang **Next.js** (Eneville đang Vite SPA → kém SEO; LAS-XD đang HTML template). Tái dùng design system + component của nền tảng.

### 10.2 Ma Cabane (marketplace BĐS — stress test) — map yêu cầu
| Yêu cầu | Tầng |
|---|---|
| Guides/blog SEO, trang tĩnh, FAQ, mentions légales, bannière home | **Payload Core** |
| **Annonces** (import Apimo/Hektor XML/JSON), **search + carte**, hàng triệu trang | **NestJS** `listings` + `feed-sync` + **Meilisearch** + Mapbox/Google Maps |
| Espace pro, tunnel dépôt, **abonnements/options (Stripe CB/SEPA)**, factures/TVA, codes promo | **NestJS** `billing` + `accounts-pro` |
| **Booking/RDV** (date, agent, confirm email/SMS) | **NestJS** `booking` |
| Comptes: email/pwd, **OAuth Google/FB**, **OTP SMS** (vérif pro), favoris/alertes/historique | **NestJS** `accounts-pro` (danh tính chung Payload qua SSO) |
| **IA**: réécriture/scoring annonces, matching, alertes intelligentes, assistant | **AI module** (NestJS + queue) |
| **SEO programmatique** (ville/type/quartier/département, triệu trang), maillage/canonical/pagination, CWV, A/B + CRO | **Frontend Next.js** SSG/ISR đọc data Domain |
| Intégrations: CRM, **Brevo** email, **Crisp** livechat, compta API, **Google/Meta Ads**, GA4/GTM, DPE/public | **NestJS** `connectors` |
| Reports: CA/jour-mois, perf annonces (vues/contacts), leads, conversion | **NestJS** `reports` + dashboard admin |
| **API-first** cho mobile app · **RGPD** · **hosting UE** · scalabilité (triệu page/visit) | Toàn kiến trúc; deploy **EU cloud** |
| "Sur mesure, **không** WordPress/Wix, **mã nguồn 100% cliente**" | Payload (code-first, self-host) + NestJS — **không phải** CMS SaaS; thỏa yêu cầu |

> Lưu ý ranh giới: với Ma Cabane, **annonces nằm ở NestJS/Postgres+Meilisearch**, KHÔNG trong CMS — Payload chỉ giữ nội dung biên tập (guides, home, FAQ, legal).

---

## 11. STACK & PHIÊN BẢN

| Thành phần | Phiên bản |
|---|---|
| Payload + @payloadcms/* | `3.85.x` |
| NestJS | `11.x` |
| Next.js / React | `16.2.9` / `19.2.x` |
| TypeScript | `5.9.x` |
| PostgreSQL | `16` (Drizzle cho Payload; Prisma/Drizzle cho NestJS) |
| Meilisearch · Redis/BullMQ | mới nhất ổn định |
| Node · pnpm · Turborepo · Docker | Node ≥ 20.9 · pnpm 9 · Turbo 2 |

---

## 12. NON-FUNCTIONAL

- **Performance:** Lighthouse ≥ 90; LCP < 2.5s; **Core Web Vitals** (ưu tiên #1 của Ma Cabane). next/image + ISR + cache.
- **SEO:** URL sạch, meta tùy biến, sitemap/robots tự động, **Schema.org** (Organization, Product/RealEstateListing, Article, BreadcrumbList, AggregateRating), OpenGraph, hreflang, **SEO programmatique** ở quy mô lớn.
- **Security:** JWT HTTP-only, CORS chặt, rate-limit auth, validate input (zod), Payload access control, helmet headers.
- **Privacy:** **RGPD** (Ma Cabane) — consent, data retention, EU hosting; cookie consent + GA4 consent-aware.
- **Scalability:** Ma Cabane tới triệu trang/visit — ISR + search engine + queue + horizontal scale Domain.
- **Observability:** healthcheck, logs JSON, error boundary FE, Sentry-ready.
- **Bàn giao:** mã nguồn 100% client, tài liệu admin (PDF + video), bảo trì hàng tháng.

---

## 13. HẠ TẦNG & DEPLOY

- **Monorepo** pnpm + Turborepo; mỗi service Dockerfile; **Docker Compose** (frontend + payload + nestjs + postgres + meilisearch + redis + reverse-proxy Caddy/Nginx HTTPS).
- **Site nhẹ** (Eneville/LAS-XD/Bioscope): VPS self-host.
- **Ma Cabane**: **EU cloud** (AWS/GCP/Scaleway EU) cho RGPD + scale.
- **Dự án mới** = duplicate monorepo → chỉnh config (bật module, theme, MODULES_ENABLED) → deploy instance riêng, DB riêng.

---

## 14. ROADMAP

1. **Bioscope Frontend** (đang làm — Phase 1 xong): Home + 14 trang theo tài liệu khảo sát, design system, sample data.
2. **Core CMS Payload**: chuẩn hóa `dv-cms` (đã có) làm Core nền tảng; nối Bioscope frontend vào API thật.
3. **Modules Bioscope + B2B**: catalog/ingredients/technologies + portal B2B + gating thật.
4. **Tổng quát hóa Core**: tách design system + Core thành nền tảng tái dùng; chuyển Eneville/LAS-XD sang Next.
5. **Domain Services (Ma Cabane)**: NestJS listings/feed-sync/billing/booking/AI + Meilisearch + programmatic SEO + EU deploy.
6. **Admin di cư** (Cách A → Cách 1) + **Mobile App** (dùng API-first).

> **Backend xử lý sau** (theo yêu cầu hiện tại). Bước kế tiếp: **review Frontend Bioscope**.
