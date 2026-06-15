# Bioscope Vietnam — Frontend (Next.js 14)

Giao diện website Công ty Cổ phần **Bioscope Việt Nam** — ngành Dược phẩm, Thực phẩm chức năng & Mỹ phẩm. Headless frontend tiêu thụ API từ Payload CMS (xem `SRS_BIOSCOPE.md`).

## ⚙️ Tech stack
- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** (design tokens: `#098F50` / `#F68C36`)
- Font: **Be Vietnam Pro** (heading) + **Inter** (body)
- i18n **VI + EN** qua route `/[locale]`
- `lucide-react` icons · animations CSS thuần (Reveal / CountUp)

## 🚀 Chạy local
```bash
npm install
cp .env.example .env.local
npm run dev      # http://localhost:3000  → tự chuyển hướng /vi
```

## 🏗️ Build
```bash
npm run build && npm start
```

## 🐳 Docker
```bash
docker build -t bioscope-web .
docker run -p 3000:3000 bioscope-web
```

## 📁 Cấu trúc
```
src/
├─ app/[locale]/        # Trang chính + phụ (VI/EN)
│  ├─ page.tsx                  Trang chủ (editorial)
│  ├─ gioi-thieu/               Giới thiệu
│  ├─ nguyen-lieu/              Nguyên liệu (catalog + [slug])
│  ├─ cong-nghe/                Công nghệ (list + [slug])
│  ├─ dich-vu-odm/              Dịch vụ ODM
│  ├─ blog/                     Bioneer's Blog (list + [slug])
│  ├─ lien-he/                  Liên hệ (form)
│  ├─ tuyen-dung/               Tuyển dụng
│  ├─ cau-hoi-thuong-gap/       FAQ
│  ├─ chinh-sach-bao-mat/       Chính sách bảo mật
│  └─ b2b/                      Cổng B2B (login / register / portal)
├─ app/api/revalidate/  # Webhook ISR từ Payload
├─ components/          # ui, layout, cards, home, shared, forms, b2b...
├─ lib/                 # i18n, data (mock), types, utils
└─ middleware.ts        # Locale routing
```

## 🔌 Tích hợp backend
Dữ liệu hiện dùng mock trong `src/lib/data.ts`. Khi nối Payload CMS:
1. Set `NEXT_PUBLIC_CMS_URL` trong `.env.local`.
2. Thay các hàm lấy data bằng `fetch` REST/GraphQL (xem §3 trong `SRS_BIOSCOPE.md`).
3. Payload `afterChange` hook gọi `POST /api/revalidate?secret=...&path=...`.

> Chi tiết kiến trúc, ERD, API contract & vibe-coding prompts: **`SRS_BIOSCOPE.md`**.
