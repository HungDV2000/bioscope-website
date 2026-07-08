# Bioscope — Kế hoạch công việc đến Production (CMS + Frontend)

> Cập nhật: **03/07/2026**
> Ước lượng **giờ công** cho 1 dev mid/senior, sai số ±30%. Chưa gồm nội dung/ảnh thật do khách cung cấp.
> Mục tiêu: đưa website **vận hành production thực tế** — quản trị nội dung, SEO, thu lead, bảo mật, triển khai.

---

## 0. Đã hoàn thành (để đối chiếu tiến độ — không tính lại giờ)

- Frontend 14 trang, song ngữ **vi/en**, responsive đã audit (mobile/tablet/desktop).
- CMS Payload 3 modular (core, branding, dashboard, blocks, catalog, bioscope, b2b, languages, RBAC), admin song ngữ.
- Collections: Ingredients, Categories, Technologies, Services, Certifications, **CaseStudies**, **FAQs**, Partners, Posts, Tags, Pages, Forms, Members, GatedDocuments + globals SiteSettings, Navigation, Branding.
- **Trang chủ** quản trị hoàn toàn qua **Pages (9 block)** + chọn homePage trong Site Settings; frontend render theo thứ tự block; sửa admin → web cập nhật ngay (revalidate).
- **Mọi trang** đã đọc **hero + SEO từ CMS** (fallback tĩnh khi CMS offline).
- **FAQ** và **Case study** (list + chi tiết) đọc từ collection.
- Seed dữ liệu mẫu idempotent + **nút "Chạy seed"** trong admin; RBAC; `cmsFetch` có timeout chống treo.

---

## 1. Preview trực quan khi biên tập (Better Editor) — ⚠️ ĐÃ LÀM, CHƯA BÁO KHÁCH

> Cần đưa vào báo giá. Cho phép biên tập viên **xem trước website ngay trong admin** khi sửa nội dung, kèm **click-to-edit** (bấm khối trên preview → nhảy tới đúng trường).

### Đã thực hiện (≈ 11h)
| # | Việc | Giờ |
|---|------|-----|
| 1.1 | Cài + cấu hình plugin `payload-better-editor` + import map | 2 |
| 1.2 | Dựng **proxy same-origin** (CMS rewrite frontend + `assetPrefix`) để click-to-edit chạy dù admin/web khác cổng | 4 |
| 1.3 | Gắn `data-better-editor-id` cho khối trang chủ + trả block id ở tầng dữ liệu | 2 |
| 1.4 | Sửa lỗi animation không hiện trong khung preview (Reveal/Counter nhận biết iframe) | 2 |
| 1.5 | Tài liệu vận hành (`docs/05-better-editor-preview.md`) | 1 |

### Còn lại (≈ 13h)
| # | Việc | Giờ |
|---|------|-----|
| 1.6 | Mở rộng click-to-edit cho **tất cả các trang** (sau khi chuyển từng trang sang mô hình block) | 6 |
| 1.7 | Preview **cập nhật real-time khi gõ** (bật drafts.autosave + migration cột autosave) | 3 |
| 1.8 | Cấu hình proxy same-origin cho **production** (reverse-proxy trên domain thật) | 4 |

**Khối 1: ≈ 24h**

---

## 2. Đấu nối nội dung CMS đầy đủ (quản trị 100% nội dung)

> Hiện mới hero+SEO+FAQ+case study đọc từ CMS; **nội dung các section bên trong** phần lớn còn tĩnh.

| # | Việc | Giờ |
|---|------|-----|
| 2.1 | Chuyển **12 trang còn lại** sang mô hình **block/Pages đầy đủ** (như trang chủ) để biên tập mọi section | 20–28 |
| 2.2 | ✅ **Catalog Nguyên liệu** ← collection `ingredients` (map type→ngành, mã QG→tên, richText→overview; lọc + phân trang giữ nguyên; fallback tĩnh) — `lib/cms/ingredients.ts` | ~~5~~ done |
| 2.3 | Trang **chi tiết `[slug]`** ← CMS: ✅ nguyên liệu (`getIngredient`) + ✅ blog (`getPost`) + ✅ **giải pháp** (`getSolution`; collection `services` đã mở rộng receive/idealFor/process/outcomes/faq/relatedCases, seed song ngữ 3 giải pháp khớp slug). Còn **tài nguyên** (`tai-nguyen/[slug]` — hiện là category tĩnh) | ~2 |
| 2.4 | ✅ **Blog** danh sách + bài viết ← collection `posts` (richText→đoạn văn, readTime tự tính, related cùng nguồn CMS, fallback tĩnh) — `lib/cms/blog.ts`. *Ảnh cover + bình luận thật: chờ (cover chưa upload; comments hiện mẫu tĩnh)* | ~~5~~ done |
| 2.5 | **Logo đối tác** ← collection `partners` *(chờ upload ảnh logo vào Media)* | 2 |
| 2.6 | ✅ **Header + Footer + menu** ← Navigation global (song ngữ, có revalidate hook, fallback i18n) — `lib/cms/navigation.ts` | ~~3~~ done |

**Khối 2: ≈ 45–53h**

---

## 3. Review từng trang & chỉnh chức năng theo đúng giao diện

> Rà soát UI/UX từng trang so với thiết kế, sửa layout, responsive, tương tác, trạng thái rỗng/loading, chi tiết chức năng — theo vòng review cùng khách.

> **Audit tự động đã chạy (04/07):** 18/18 route HTTP 200, không lỗi runtime/hydration; crawl 31 link nội bộ → 0 link vỡ. Phần polish UI/UX từng trang bên dưới cần review trực quan cùng khách.

### 3a. Review + chỉnh từng trang
| # | Trang | Giờ |
|---|-------|-----|
| 3.1 | Trang chủ (9 section, sticky chatbot, marquee) | 3 |
| 3.2 | Nguyên liệu — danh sách + bộ lọc + catalog — ✅ *bộ lọc nâng cao giờ suy từ dữ liệu thật (bỏ chip lọc chết, ẩn nhóm rỗng)*; còn polish UI | ~2 |
| 3.3 | Nguyên liệu — chi tiết (tabs, tải tài liệu, doc-gating) | 3 |
| 3.4 | Giải pháp + chi tiết giải pháp | 3 |
| 3.5 | Đồng kiến tạo (hành trình 5 bước) | 2 |
| 3.6 | Nghiên cứu & Phát triển (công nghệ, số liệu, whitepaper) | 2 |
| 3.7 | Tài nguyên + Blog (danh sách, bài viết, bình luận) | 4 |
| 3.8 | Case study (danh sách + storytelling chi tiết) | 3 |
| 3.9 | Về chúng tôi (timeline, giá trị, đối tác) | 3 |
| 3.10 | Liên hệ (form wizard 3 bước) | 3 |
| 3.11 | Câu hỏi thường gặp | 1.5 |
| 3.12 | Bioscope AI | 2 |
| 3.13 | Chính sách bảo mật + Điều khoản | 1.5 |

### 3b. Review chức năng dùng chung + buffer
| # | Việc | Giờ |
|---|------|-----|
| 3.14 | Header/footer/chuyển ngôn ngữ, nút, thẻ, breadcrumb, animation, sticky chatbot, marquee, counter | 4 |
| 3.15 | **Buffer chỉnh sửa theo phản hồi khách** (vòng review) | 8 |

**Khối 3: ≈ 46h**

---

## 4. SEO

| # | Việc | Giờ |
|---|------|-----|
| 4.1 | ✅ Metadata động từng trang từ CMS (title/description/OG) + **canonical mọi trang** (kể cả fallback) | ~~3~~ done |
| 4.2 | ✅ JSON-LD: Organization + WebSite (root), **FAQPage** (FAQ), **Product + Breadcrumb** (chi tiết nguyên liệu), **Article + Breadcrumb** (bài blog) — `components/seo/json-ld.tsx` | ~~4~~ done |
| 4.3 | ✅ `sitemap.xml` (14 route tĩnh + slug động từ CMS: nguyên liệu/giải pháp/blog/case, fallback tĩnh, revalidate 1h) + `robots.txt` (chặn /member/, /api/). ⚠️ **hreflang vi/en chưa làm được**: site đang i18n theo cookie → vi/en chung URL; hreflang chuẩn đòi URL riêng mỗi ngôn ngữ (vd `/en/...`) = đổi kiến trúc routing, **cần KH chốt chiến lược URL** | ~~3~~ → 4–6 nếu làm hreflang |
| 4.4 | ✅ OG image mặc định + Twitter card (tạm dùng logo; thay `/og.png` 1200×630 khi có ảnh thiết kế) | ~~2~~ done |
| 4.5 | Tối ưu **Core Web Vitals** (LCP/CLS/INP) — cần đo Lighthouse trên bản build production | 5 |
| 4.6 | ✅ Redirects ← collection `redirects` qua `src/proxy.ts` (Next 16, cache 60s, fail-open, 308/307; mẫu `/san-pham`→`/nguyen-lieu` đã verify) + 404 đúng status | ~~2~~ done |

**Khối 4: còn ≈ 5h (CWV) + 4–6h nếu chốt làm hreflang**

---

## 5. Form, thu Lead & Analytics

| # | Việc | Giờ |
|---|------|-----|
| 5.1 | ✅ Form **Liên hệ** (wizard 3 bước) → API `/api/forms/submit` → lưu `form-submissions` (201) + validate email (422)/form (404) + **hook email thông báo** (giải recipient từ Forms.emails; no-op an toàn khi chưa cấu hình SMTP). ⚠️ *Production cần gắn `@payloadcms/email-nodemailer` + SMTP để email gửi thật* | ~~5~~ done* |
| 5.2 | ✅ Form **đăng ký sớm Bioscope AI** (`notify-form`) → cùng API, form "Đăng ký sớm Bioscope AI" | ~~2~~ done |
| 5.3 | ✅ Chống spam **honeypot** (field ẩn `website` → drop im lặng, đã verify). *reCAPTCHA để tùy chọn nếu cần (cần site key/secret)* | ~~2~~ done |
| 5.4 | ✅ **GA4 + GTM + Meta Pixel** ← Site Settings.tracking (`components/analytics.tsx` + `GtmNoScript`, next/script afterInteractive; tắt sạch khi chưa có ID — verified) | ~~3~~ done |

**Khối 5: ✅ xong (còn: cấu hình SMTP thật cho email + reCAPTCHA tùy chọn)**

---

## 6. Media & hình ảnh thật

| # | Việc | Giờ |
|---|------|-----|
| 6.1 | Cấu hình **object storage** (S3/R2) cho Media ở production | 3 |
| 6.2 | Upload + nối ảnh thật (hero, nguyên liệu, case study, đội ngũ, OG, logo đối tác) | 6 |
| 6.3 | Cấu hình `next/image` remote domain + tối ưu (responsive, lazy) | 2 |

**Khối 6: ≈ 11h**

---

## 7. Cổng B2B (Members / tài liệu bảo mật)

| # | Việc | Giờ |
|---|------|-----|
| 7.1 | Đăng nhập member ↔ collection `members` thật (hiện mock) | 4 |
| 7.2 | Tải **gated-document** + kiểm tra quyền theo trạng thái duyệt | 3 |
| 7.3 | Trang **Cổng đối tác** | 3 |

**Khối 7: ≈ 10h**

---

## 8. Bioscope AI (trợ lý)

| # | Việc | Giờ |
|---|------|-----|
| 8.1 | ✅ **Nội dung trang AI ← CMS**: global `bioscope-ai` (7 tab: Intro/Preview/Use cases/Capabilities/Compare/Strengths/Notify) mirror `messages.aiAssistantPage`, seed song ngữ (copyIds cho mảng), overlay lên fallback tĩnh + revalidate hook. **Verified marker test**: sửa giá trị trong CMS → hiện trên trang | ~~2~~ done |
| 8.2 | *(Tuỳ chọn)* **Chatbot AI thật** (LLM + truy hồi trên catalog/tài liệu) — giao nhiệm vụ riêng | 12–20 |

**Khối 8: ✅ xong 8.1** (+12–20h tuỳ chọn cho 8.2)

---

## 9. Chất lượng, Accessibility & Hiệu năng

| # | Việc | Giờ |
|---|------|-----|
| 9.1 | ✅ Fix **8 lỗi lint** (5 set-state-in-effect → reset render-time/`useSyncExternalStore`/defer; 1 TDZ đệ quy → ref; 2 `any` → type) + dọn warning (`<img>`→`next/image`, unused imports, exhaustive-deps). **`next build` production PASS** (73/73 trang, lint 0 lỗi 0 warning) | ~~4~~ done |
| 9.2 | Accessibility (a11y): ✅ **focus-visible ring toàn site** (globals.css, `:where()` specificity 0), ✅ **skip-to-content link** + `<main id>` landmark (song ngữ), ✅ aria-label social footer. Còn: audit tương phản màu + test screen-reader/keyboard đầy đủ (*QA trình duyệt/axe*) | ~5→còn ~2 |
| 9.3 | Lighthouse / tối ưu hiệu năng (bundle, font, ảnh) — *đo trên bản build* | 4 |
| 9.4 | Re-audit responsive toàn site (mobile/tablet/desktop) — *QA trực quan* | 4 |
| 9.5 | Cross-browser (Safari/Chrome/Firefox/Edge) — *QA trực quan* | 3 |

**Khối 9: ✅ 9.1 xong (mở khóa build). Còn 9.2–9.5 là QA trình duyệt ≈ 16h**

---

## 10. Bảo mật

| # | Việc | Giờ |
|---|------|-----|
| 10.1 | ✅ **CSP + security headers** trong `next.config.mjs` (`headers()` áp mọi route): CSP (script/style/img/connect/frame-src, **frame-ancestors 'self' + CMS origin** cho preview), HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, DNS-Prefetch. *Ghi chú: CSP còn `unsafe-inline/eval` cho hydration+GTM — siết bằng nonce ở đợt hardening sau* | ~~3~~ done |
| 10.2 | ✅ **Rate-limit API công khai** (`lib/rate-limit.ts`, 5 req/phút/IP → 429; verify: req 6–7 chặn, IP khác không ảnh hưởng) áp cho `/api/forms/submit`. **RBAC review**: chỉ `form-submissions` cho public `create`, `read` admin-only — posture chuẩn | ~~3~~ done |
| 10.3 | ✅ **Env**: `.env.local`/`.env*.local` đã gitignore; `.env.example` bổ sung `NEXT_PUBLIC_SITE_URL` + hướng dẫn sinh `REVALIDATE_SECRET` (`openssl rand -hex 32`); revalidate route đã check secret. *Xoay khóa production do KH thực hiện khi deploy* | ~~2~~ done |

**Khối 10: ✅ xong** (siết CSP bằng nonce = hardening tuỳ chọn về sau)

---

## 11. Vận hành & Triển khai Production

| # | Việc | Giờ |
|---|------|-----|
| 11.1 | **Migrations** cho production (thay dev-push) | 4 |
| 11.2 | CI/CD (build + deploy Frontend + CMS) | 6 |
| 11.3 | Domain/SSL + **reverse-proxy** (admin + preview + frontend cùng host) | 5 |
| 11.4 | Backup DB + Media, monitoring/logging/cảnh báo | 4 |
| 11.5 | *(Tuỳ chọn)* i18n routing `/en` + hreflang chuẩn (thay cookie) | 4 |

**Khối 11: ≈ 19–23h**

---

## 12. Kiểm thử & Nghiệm thu

| # | Việc | Giờ |
|---|------|-----|
| 12.1 | Test plan + smoke/regression các luồng chính | 5 |
| 12.2 | Hỗ trợ UAT + sửa lỗi phát sinh (buffer) | 10 |
| 12.3 | Đào tạo quản trị + tài liệu hướng dẫn biên tập viên | 4 |

**Khối 12: ≈ 19h**

---

## Tổng hợp giờ công

| Khối | Nội dung | Giờ |
|------|----------|-----|
| 1 | Preview khi edit (Better Editor) — *gồm 11h đã làm, chưa báo* | 24 |
| 2 | Đấu nối nội dung CMS đầy đủ | 45–53 |
| 3 | Review từng trang & chỉnh theo đúng giao diện | 46 |
| 4 | SEO | 19 |
| 5 | Form, Lead & Analytics | 12 |
| 6 | Media & ảnh thật | 11 |
| 7 | Cổng B2B | 10 |
| 8 | Bioscope AI (nội dung) | 2 |
| 9 | Chất lượng / a11y / hiệu năng | 20 |
| 10 | Bảo mật | 8 |
| 11 | Vận hành & Triển khai | 19–23 |
| 12 | Kiểm thử & Nghiệm thu | 19 |
| | **TỔNG (đến production)** | **≈ 235–247h (~30–31 ngày công)** |
| | *Tuỳ chọn: Chatbot AI thật (LLM+RAG)* | +12–20 |
| | *Tuỳ chọn: NestJS domain services (module phức tạp kiểu Ma Cabane)* | +40 trở lên |

## Phân tầng ưu tiên để báo khách

- **Giai đoạn 1 — Bắt buộc để go-live (MVP production):** Khối 1, 2, 3, 4, 5, 6, 9, 10, 11, 12 → **≈ 200–215h**.
- **Giai đoạn 2 — Sau launch:** Khối 7 (B2B), Khối 8.1 (nội dung AI), i18n routing (11.5).
- **Tuỳ chọn/tách hợp đồng riêng:** Chatbot AI thật, NestJS domain services.

## Việc chờ khách hàng (không tính giờ dev)

- **Ảnh & nội dung thật:** ảnh nguyên liệu / case study / logo đối tác bản chuẩn; hotline/địa chỉ; testimonials; cột mốc timeline; số liệu cần chốt (vd 300% vs 500K, số công nghệ).
- **Chốt quyết định:** thứ tự CtaBand ↔ Chatbot trang chủ; taxonomy tài nguyên (giữ loanword hay Việt hóa); phạm vi/nội dung chatbot AI.
- **Tài khoản/hạ tầng:** domain, hosting/VPS, object storage, email gửi form, tài khoản GA4/GTM/Pixel.
