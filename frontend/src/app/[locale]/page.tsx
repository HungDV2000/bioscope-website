import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Boxes,
  FlaskConical,
  Atom,
} from "lucide-react";
import type { Locale } from "@/lib/utils";
import { pick } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { ButtonLink } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { TechCard } from "@/components/cards/tech-card";
import { IngredientCard } from "@/components/cards/ingredient-card";
import { PostCard } from "@/components/cards/post-card";
import {
  technologies,
  ingredients,
  certifications,
  partners,
  posts,
} from "@/lib/data";

/* -------------------------------------------------------------------------- */
/*  Trang chủ — phong cách EDITORIAL (typography + storytelling)               */
/* -------------------------------------------------------------------------- */
export default function HomePage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const t = getDictionary(locale);
  const techs = [...technologies].sort((a, b) => a.order - b.order);
  const featured = ingredients.filter((i) => i.featured).slice(0, 3);
  const featuredList =
    featured.length > 0 ? featured : ingredients.slice(0, 3);

  return (
    <>
      <Hero locale={locale} />
      <StatsBand locale={locale} />
      <Pillars locale={locale} />

      {/* Technologies — editorial preview */}
      <section className="container-bs py-24">
        <Reveal>
          <SectionHeading
            eyebrow={locale === "vi" ? "Năng lực R&D" : "R&D capability"}
            title={
              locale === "vi"
                ? "Công nghệ độc quyền tạo nên khác biệt"
                : "Proprietary technologies that set us apart"
            }
            description={
              locale === "vi"
                ? "Các nền tảng công nghệ nano do Bioscope tự nghiên cứu — nâng cao sinh khả dụng, độ ổn định và hiệu quả của hoạt chất."
                : "Nano technology platforms developed in-house by Bioscope — boosting bioavailability, stability and efficacy of actives."
            }
          />
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {techs.map((tech, i) => (
            <Reveal key={tech.slug} delay={i * 80}>
              <TechCard tech={tech} locale={locale} index={i} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured ingredients — minimal / grid */}
      <section className="bg-neutral-50 py-24">
        <div className="container-bs">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow={locale === "vi" ? "Sản phẩm nổi bật" : "Featured"}
                title={
                  locale === "vi"
                    ? "Nguyên liệu được tin dùng"
                    : "Most trusted ingredients"
                }
                description={
                  locale === "vi"
                    ? "Tuyển chọn nguyên liệu cao cấp, chuẩn hóa cho thực phẩm chức năng và mỹ phẩm."
                    : "A curated selection of premium, standardised ingredients for supplements and cosmetics."
                }
              />
              <ButtonLink
                href={`/${locale}/nguyen-lieu`}
                variant="outline"
                className="shrink-0"
              >
                {t.cta.viewAll}
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredList.map((ing, i) => (
              <Reveal key={ing.slug} delay={i * 80}>
                <IngredientCard ingredient={ing} locale={locale} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <PartnersCloud locale={locale} />

      {/* Blog preview */}
      <section className="container-bs py-24">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Bioneer's Blog"
              title={
                locale === "vi" ? "Kiến thức chuyên ngành" : "Industry insights"
              }
              description={
                locale === "vi"
                  ? "Góc nhìn chuyên gia về nguyên liệu, công nghệ bào chế và xu hướng ngành."
                  : "Expert perspectives on ingredients, formulation technology and industry trends."
              }
            />
            <ButtonLink
              href={`/${locale}/blog`}
              variant="outline"
              className="shrink-0"
            >
              {t.cta.viewAll}
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map((post, i) => (
            <Reveal key={post.slug} delay={i * 80}>
              <PostCard post={post} locale={locale} />
            </Reveal>
          ))}
        </div>
      </section>

      <FinalCta locale={locale} />
      <div className="pb-8" />
    </>
  );
}

/* ========================================================================== */
/*  HERO — gradient primary→primary-dark + pattern phân tử mờ ảo                */
/* ========================================================================== */
function Hero({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const p = (path: string) => `/${locale}${path}`;

  const copy =
    locale === "vi"
      ? {
          badge: "Nguyên liệu cao cấp · Công nghệ độc quyền",
          titleA: "Tối ưu chi phí,",
          titleB: "nâng tầm hiệu quả",
          titleC: "cho sản phẩm của bạn",
          desc: "Bioscope Việt Nam đồng hành cùng doanh nghiệp Dược phẩm, Thực phẩm chức năng và Mỹ phẩm — từ nguyên liệu nhập khẩu chuẩn hóa đến giải pháp công thức ODM ứng dụng công nghệ nano độc quyền, mang lại hiệu quả vượt trội với chi phí tối ưu cho người dùng.",
          trust:
            "Đạt chuẩn GMP · Nguồn gốc minh bạch · Hỗ trợ pháp lý trọn gói",
        }
      : {
          badge: "Premium ingredients · Proprietary technology",
          titleA: "Optimise cost,",
          titleB: "elevate efficacy",
          titleC: "for your products",
          desc: "Bioscope Vietnam partners with Pharmaceutical, Dietary Supplement and Cosmetic companies — from standardised imported ingredients to ODM formulation powered by proprietary nano technology, delivering superior efficacy at an optimised cost for end users.",
          trust:
            "GMP-certified · Transparent sourcing · Full regulatory support",
        };

  return (
    <section className="relative overflow-hidden bg-hero-gradient text-white">
      <div className="absolute inset-0 bg-mesh opacity-70" aria-hidden />
      <MoleculePattern />
      {/* vòng quỹ đạo mờ — chuyển động cực chậm, điềm tĩnh */}
      <div
        className="pointer-events-none absolute -right-24 top-1/2 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full border border-white/10 opacity-40 animate-spin-slow"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-8 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border border-white/10 opacity-30"
        aria-hidden
      />

      <div className="container-bs relative grid items-center gap-12 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            {copy.badge}
          </span>

          <h1 className="mt-6 font-heading text-4xl font-bold leading-[1.1] text-balance sm:text-5xl lg:text-6xl">
            {copy.titleA}
            <span className="block text-accent">{copy.titleB}</span>
            <span className="block">{copy.titleC}</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            {copy.desc}
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <ButtonLink href={p("/nguyen-lieu")} variant="white" size="lg">
              {t.cta.explore}
              <ArrowRight className="h-5 w-5" />
            </ButtonLink>
            <ButtonLink
              href={p("/lien-he")}
              variant="outline"
              size="lg"
              className="border-white/40 text-white hover:bg-white/10"
            >
              {t.cta.contact}
            </ButtonLink>
          </div>

          <div className="mt-8 flex items-start gap-2 text-sm text-white/80">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            {copy.trust}
          </div>
        </div>

        {/* Card minh họa cấu trúc phân tử */}
        <div className="relative hidden lg:block">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-8 shadow-glow backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/70">
              <Atom className="h-4 w-4 text-accent" />
              {locale === "vi" ? "Công nghệ nano" : "Nano technology"}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-5">
              {certifications.slice(0, 4).map((c) => (
                <div key={c.value}>
                  <CountUp
                    value={c.value}
                    className="font-heading text-3xl font-bold text-accent sm:text-4xl"
                  />
                  <div className="mt-1 text-xs leading-snug text-white/75">
                    {pick(c.suffix, locale)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-5 -left-5 rounded-xl bg-accent px-5 py-4 text-white shadow-lg animate-float">
            <div className="font-heading text-2xl font-bold">ISO · GMP</div>
            <div className="text-xs text-white/85">
              {locale === "vi" ? "Chứng nhận quốc tế" : "International standards"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Pattern cấu trúc phân tử — SVG nhẹ, mờ ảo, không gây nhiễu */
function MoleculePattern() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.13]"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="molecule"
          width="180"
          height="160"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(8)"
        >
          <g fill="none" stroke="#FFFFFF" strokeWidth="1">
            <line x1="30" y1="40" x2="90" y2="20" />
            <line x1="90" y1="20" x2="150" y2="55" />
            <line x1="90" y1="20" x2="80" y2="95" />
            <line x1="80" y1="95" x2="30" y2="120" />
            <line x1="80" y1="95" x2="140" y2="120" />
          </g>
          <g fill="#FFFFFF">
            <circle cx="30" cy="40" r="3.2" />
            <circle cx="90" cy="20" r="4" />
            <circle cx="150" cy="55" r="3.2" />
            <circle cx="80" cy="95" r="4" />
            <circle cx="30" cy="120" r="3.2" />
            <circle cx="140" cy="120" r="3.2" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#molecule)" />
    </svg>
  );
}

/* ========================================================================== */
/*  STATS BAND — số liệu uy tín, màu accent, đếm số animate                     */
/* ========================================================================== */
function StatsBand({ locale }: { locale: Locale }) {
  return (
    <section className="border-b border-neutral-200 bg-surface">
      <div className="container-bs grid grid-cols-2 gap-8 py-14 lg:grid-cols-4">
        {certifications.map((c, i) => (
          <Reveal key={c.value} delay={i * 80}>
            <div className="text-center sm:text-left">
              <CountUp
                value={c.value}
                className="font-heading text-4xl font-bold text-accent sm:text-5xl"
              />
              <div className="mt-1.5 text-sm font-medium text-neutral-700">
                {pick(c.suffix, locale)}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  CORE PILLARS — 3 trụ cột giá trị                                            */
/* ========================================================================== */
function Pillars({ locale }: { locale: Locale }) {
  const items =
    locale === "vi"
      ? [
          {
            icon: Boxes,
            title: "Cung cấp nguyên liệu",
            desc: "Nhập khẩu & phân phối nguyên liệu cao cấp cho TPCN và Mỹ phẩm, nguồn gốc minh bạch từ các đối tác hàng đầu thế giới.",
            href: "/nguyen-lieu",
            cta: "Khám phá nguyên liệu",
            tone: "primary" as const,
          },
          {
            icon: FlaskConical,
            title: "Dịch vụ ODM",
            desc: "Nghiên cứu & phát triển công thức, gia công sản xuất đạt chuẩn GMP và tư vấn công bố sản phẩm trọn gói.",
            href: "/dich-vu-odm",
            cta: "Tìm hiểu dịch vụ ODM",
            tone: "accent" as const,
          },
          {
            icon: Atom,
            title: "Công nghệ riêng",
            desc: "Nền tảng công nghệ nano độc quyền — Novaskin™, Phytosome ướt, Lipodisq®, Liposome — nâng cao sinh khả dụng hoạt chất.",
            href: "/cong-nghe",
            cta: "Xem công nghệ",
            tone: "primary" as const,
          },
        ]
      : [
          {
            icon: Boxes,
            title: "Ingredient Supply",
            desc: "Importing & distributing premium ingredients for supplements and cosmetics, transparently sourced from world-leading partners.",
            href: "/nguyen-lieu",
            cta: "Explore ingredients",
            tone: "primary" as const,
          },
          {
            icon: FlaskConical,
            title: "ODM Services",
            desc: "Formulation R&D, GMP-certified manufacturing and end-to-end product registration consultancy.",
            href: "/dich-vu-odm",
            cta: "Discover ODM services",
            tone: "accent" as const,
          },
          {
            icon: Atom,
            title: "Proprietary Technology",
            desc: "In-house nano platforms — Novaskin™, Wet Phytosome, Lipodisq®, Liposome — boosting active bioavailability.",
            href: "/cong-nghe",
            cta: "View technologies",
            tone: "primary" as const,
          },
        ];

  return (
    <section className="container-bs py-20">
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item, i) => {
          const Icon = item.icon;
          const accent = item.tone === "accent";
          return (
            <Reveal key={item.title} delay={i * 90}>
              <a
                href={`/${locale}${item.href}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-surface p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <span
                  className={`inline-flex h-14 w-14 items-center justify-center rounded-xl ${
                    accent
                      ? "bg-accent-tint text-accent-dark"
                      : "bg-primary-tint text-primary-dark"
                  }`}
                >
                  <Icon className="h-7 w-7" />
                </span>
                <h3 className="mt-5 font-heading text-xl font-bold text-neutral-900">
                  {item.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-500">
                  {item.desc}
                </p>
                <span
                  className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold ${
                    accent ? "text-accent-dark" : "text-primary-dark"
                  }`}
                >
                  {item.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </a>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  PARTNERS — logo cloud dạng carousel (marquee) nền neutral-50                */
/* ========================================================================== */
function PartnersCloud({ locale }: { locale: Locale }) {
  // nhân đôi để cuộn vô tận
  const row = [...partners, ...partners];
  return (
    <section className="border-y border-neutral-200 bg-neutral-50 py-14">
      <div className="container-bs">
        <p className="text-center text-sm font-medium uppercase tracking-widest text-neutral-500">
          {locale === "vi"
            ? "Đối tác cung ứng toàn cầu"
            : "Trusted global supply partners"}
        </p>
      </div>
      <div className="mask-fade-x mt-10 overflow-hidden">
        <ul className="flex w-max items-center gap-12 animate-marquee pause-hover px-6">
          {row.map((partner, i) => (
            <li
              key={`${partner.name}-${i}`}
              className="flex shrink-0 flex-col items-center justify-center text-center"
              aria-hidden={i >= partners.length}
            >
              <span className="font-heading text-lg font-bold text-neutral-700">
                {partner.name}
              </span>
              <span className="text-xs text-neutral-500">{partner.country}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  FINAL CTA                                                                   */
/* ========================================================================== */
function FinalCta({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <section className="container-bs">
      <div className="relative overflow-hidden rounded-2xl bg-hero-gradient px-8 py-14 text-center text-white sm:px-16 sm:py-20">
        <div className="absolute inset-0 bg-mesh opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="font-heading text-3xl font-bold text-balance sm:text-4xl">
            {locale === "vi"
              ? "Sẵn sàng phát triển sản phẩm tiếp theo của bạn?"
              : "Ready to develop your next product?"}
          </h2>
          <p className="mt-4 text-base text-white/85 sm:text-lg">
            {locale === "vi"
              ? "Đội ngũ chuyên gia Bioscope sẵn sàng tư vấn nguyên liệu và giải pháp công thức phù hợp nhất cho doanh nghiệp của bạn."
              : "Bioscope experts are ready to advise on the best ingredients and formulation solutions for your business."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <ButtonLink href={`/${locale}/lien-he`} variant="white" size="lg">
              {t.cta.contact}
              <ArrowRight className="h-5 w-5" />
            </ButtonLink>
            <ButtonLink
              href={`/${locale}/cong-nghe`}
              variant="outline"
              size="lg"
              className="border-white/40 text-white hover:bg-white/10"
            >
              {locale === "vi" ? "Tìm hiểu công nghệ" : "Explore technology"}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
