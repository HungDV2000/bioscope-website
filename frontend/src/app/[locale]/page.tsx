import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Search,
  Play,
  FileText,
  CheckCircle2,
  Download,
  UserRound,
  FlaskConical,
  Globe2,
  Factory,
  Warehouse,
  Boxes,
  ChevronRight,
} from "lucide-react";
import type { Locale } from "@/lib/utils";
import { homeImages } from "@/lib/home-images";
import { homeFeaturedIngredients } from "@/lib/home-featured";
import { homeClinicalStudies, homeScienceTechs } from "@/lib/home-science";
import { homeContent, pickL } from "@/lib/home-content";
import { IngredientSlider } from "@/components/home/ingredient-slider";
import { HeroVideoSlider } from "@/components/home/hero-slider";

/** Nền Compliance + Ingredient — xanh top-left nhạt dần → trắng (tham chiếu hero overlay) */
const COMPLIANCE_INGREDIENT_GRADIENT = [
  "linear-gradient(to bottom right, rgba(14,128,76,.18) 0%, rgba(14,128,76,.08) 26%, rgba(14,128,76,.03) 48%, transparent 70%)",
  "linear-gradient(to bottom right, #E7F3EC 0%, #eef6f1 14%, #f4faf6 28%, #fafcfb 36%, #ffffff 40%, #ffffff 100%)",
].join(", ");

export default function HomePage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  return (
    <>
      <Hero locale={locale} />
      <div style={{ background: COMPLIANCE_INGREDIENT_GRADIENT }}>
        <ComplianceBand locale={locale} />
        <IngredientLibrary locale={locale} />
      </div>
      <ScienceBacked locale={locale} />
      <SupplyStats locale={locale} />
      <SolutionsApplications locale={locale} />
    </>
  );
}

/* ========================================================================== */
/*  HERO                                                                        */
/* ========================================================================== */
function Hero({ locale }: { locale: Locale }) {
  const p = (path: string) => `/${locale}${path}`;
  const c = homeContent.hero;
  const [title1, title2] = c.title[locale];

  return (
    <section className="relative flex h-[540px] items-center overflow-hidden bg-white">
      {/* Video slideshow background with dots & pause — client component */}
      <HeroVideoSlider />

      <div className="container-bs relative z-10">
        <div className="max-w-[640px] py-8">
          <p className="text-[13px] font-bold uppercase tracking-[0.06em] text-primary">
            {pickL(c.eyebrow, locale)}
          </p>
          <h1 className="mt-3.5 font-heading text-[42px] leading-[1.16] tracking-tight sm:text-[48px]">
            <span className="block font-extrabold text-primary">{title1}</span>
            <span className="block font-light text-ink">{title2}</span>
          </h1>
          <p className="mt-4 max-w-[430px] text-[15.5px] leading-relaxed text-neutral-600">
            {pickL(c.description, locale)}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 md:flex-nowrap">
            <Link
              href={p("/lien-he")}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-[22px] py-[11px] text-[14.5px] font-semibold text-white transition-colors hover:bg-[#0c7344]"
            >
              {pickL(c.ctaSample, locale)}
              <FlaskConical className="h-4 w-4" />
            </Link>
            <Link
              href={p("/nguyen-lieu")}
              className="inline-flex items-center gap-2 rounded-md border-[1.5px] border-primary bg-white px-[22px] py-[11px] text-[14.5px] font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
            >
              <Download className="h-4 w-4" />
              {pickL(c.ctaCatalogue, locale)}
            </Link>
            <Link
              href={p("/lien-he")}
              className="inline-flex items-center gap-2 rounded-md border border-accent bg-white px-[22px] py-[11px] text-[14.5px] font-semibold text-accent transition-colors hover:bg-accent-tint"
            >
              <UserRound className="h-4 w-4" />
              {pickL(c.ctaExpert, locale)}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  COMPLIANCE BAND                                                             */
/* ========================================================================== */
const CERT_KEYS = [
  { k: "GMP", line1: "GMP", size: "text-[18px]" },
  { k: "ISO\n22000", line1: "ISO", line2: "22000", size: "text-[12.5px]" },
  { k: "HACCP", line1: "HACCP", size: "text-[12.5px]" },
  { k: "حلال", line1: "HALAL", size: "text-[20px]" },
  { k: "K", line1: "KOSHER", size: "text-[23px]" },
  { k: "USDA", line1: "USDA", size: "text-[16px]" },
  { k: "NON\nGMO", line1: "NON", size: "text-[13.5px]" },
];

function ComplianceBand({ locale }: { locale: Locale }) {
  const c = homeContent.compliance;
  const [title1, title2] = c.title[locale];
  const certified = pickL(c.certified, locale);

  return (
    <section className="relative z-20 -mt-[42px]">
      {/* Band xanh lá nhạt — nền solid */}
      <div className="absolute inset-0 left-[24px] overflow-hidden rounded-tl-[26px] border-t-2 border-l-2 border-white bg-[#E7F3EC] sm:left-[40px]">
        {/* Certificate image: flush to right viewport edge, full band height */}
        <div className="absolute inset-y-0 right-0 hidden w-[28vw] max-w-[390px] lg:block">
          <Image
            src={homeImages.certificates}
            alt={pickL(c.photoAlt, locale)}
            fill
            sizes="460px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Content aligned to global container (matches hero & ingredient section) */}
      <div className="container-bs relative">
        <div className="grid items-center gap-8 py-11 lg:grid-cols-[230px_1fr] lg:pr-[30vw] xl:pr-[400px]">
          <div>
            <h2 className="font-heading text-[23px] font-extrabold leading-tight text-primary">
              {title1}
              <br />
              {title2}
            </h2>
            <p className="mt-3 max-w-[230px] text-[13.5px] leading-relaxed text-neutral-600">
              {pickL(c.description, locale)}
            </p>
            <Link
              href={`/${locale}/gioi-thieu`}
              className="mt-3.5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5"
            >
              {pickL(c.viewAll, locale)}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex flex-nowrap justify-center gap-x-3 gap-y-4 lg:ml-auto lg:max-w-[680px] lg:justify-end lg:pl-6 lg:pr-2 xl:pl-10 xl:pr-4">
            {CERT_KEYS.map((cert) => (
              <div key={cert.line1} className="flex flex-col items-center gap-2 text-center">
                <span
                  className={`flex h-[76px] w-[76px] items-center justify-center whitespace-pre-line rounded-full border-[1.5px] border-primary-border bg-white text-center font-extrabold leading-tight text-primary shadow-sm ${cert.size}`}
                >
                  {cert.k}
                </span>
                <span className="text-[11px] font-semibold leading-snug text-neutral-700">
                  {cert.line1}
                  <br />
                  {"line2" in cert && cert.line2 ? cert.line2 : certified}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  INGREDIENT LIBRARY                                                          */
/* ========================================================================== */

function IngredientLibrary({ locale }: { locale: Locale }) {
  const c = homeContent.ingredients;
  const f = c.filters;

  const Group = ({ title, opts }: { title: string; opts: readonly string[] }) => (
    <div>
      <h3 className="text-[13px] font-bold text-primary">{title}</h3>
      <div className="mt-3 space-y-1">
        {opts.map((o) => (
          <label
            key={o}
            className="flex cursor-pointer items-center gap-2 py-1 text-[13.5px] text-neutral-700"
          >
            <input type="checkbox" className="h-[15px] w-[15px] rounded accent-primary" />
            {o}
          </label>
        ))}
      </div>
    </div>
  );

  const filterAside = (
    <aside className="flex flex-col gap-4 lg:max-h-[563px]">
      {/* Search — fixed */}
      <div className="relative shrink-0">
        <input
          placeholder={pickL(c.searchPlaceholder, locale)}
          className="h-10 w-full rounded-md border-[1.5px] border-neutral-200 bg-white pr-9 pl-3.5 text-[13.5px] outline-none focus:border-primary"
        />
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
      </div>
      {/* Filter groups — scroll */}
      <div className="flex flex-col gap-5 pr-1 lg:min-h-0 lg:flex-1 lg:overflow-y-auto [scrollbar-width:thin]">
        <Group title={pickL(c.filterBenefits, locale)} opts={f.benefits[locale]} />
        <Group title={pickL(c.filterCerts, locale)} opts={f.certs[locale]} />
        <Group title={pickL(c.filterForms, locale)} opts={f.forms[locale]} />
      </div>
    </aside>
  );

  return (
    <section className="relative">
      <div
        className="absolute inset-0 left-[24px] bg-white sm:left-[40px]"
        aria-hidden
      />
      <div className="container-bs relative py-16">
        <IngredientSlider
          title={pickL(c.title, locale)}
          viewAllHref={`/${locale}/nguyen-lieu`}
          viewAllLabel={pickL(c.viewAll, locale)}
          filterAside={filterAside}
        >
          {homeFeaturedIngredients.map((item) => (
            <div
              key={item.slug}
              className="w-[82%] shrink-0 snap-start sm:w-[47%] lg:w-[calc((100%-36px)/3)]"
            >
              <FeaturedProductCard item={item} locale={locale} />
            </div>
          ))}
        </IngredientSlider>
      </div>
    </section>
  );
}

function FeaturedProductCard({
  item,
  locale,
}: {
  item: (typeof homeFeaturedIngredients)[number];
  locale: Locale;
}) {
  const c = homeContent.ingredients;
  const name = locale === "vi" ? item.name.vi : item.name.en;
  const subtitle = locale === "vi" ? item.subtitle.vi : item.subtitle.en;
  const origin = locale === "vi" ? item.origin.vi : item.origin.en;
  const detailHref =
    item.slug === "argentina-collagen-peptide"
      ? `/${locale}/nguyen-lieu/argentina-collagen-peptide`
      : `/${locale}/nguyen-lieu`;

  return (
    <article className="flex h-full flex-col rounded-[14px] border border-neutral-100 bg-white p-3.5 shadow-card transition-all hover:-translate-y-[3px] hover:shadow-card-hover">
      <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-md bg-neutral-100">
        <Image src={item.image} alt={name} fill sizes="240px" className="object-cover" />
      </div>
      <h3 className="line-clamp-2 font-heading text-base font-bold leading-snug text-ink">{name}</h3>
      <p className="mt-0.5 text-[12.5px] text-neutral-500">{subtitle}</p>

      <div className="mt-3 grid grid-cols-2 gap-2 border-b border-neutral-100 pb-3 text-xs text-neutral-600">
        <span className="flex items-start gap-1.5">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <span>
            {pickL(c.origin, locale)}
            <br />
            <b className="text-ink">{origin}</b>
          </span>
        </span>
        <span className="flex items-start gap-1.5">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <span>
            MOQ
            <br />
            <b className="text-ink">{item.moq}</b>
          </span>
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {item.badges.map((b) => (
          <span
            key={b}
            className="rounded-full border border-primary-border bg-primary-50 px-2.5 py-1 text-[10.5px] font-semibold text-primary"
          >
            {b}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[11px] font-semibold text-neutral-600">
        {["CoA", pickL(c.specification, locale), "MSDS"].map((d) => (
          <span key={d} className="inline-flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-neutral-500" />
            {d}
          </span>
        ))}
      </div>

      <div className="flex-1" />
      <Link
        href={`/${locale}/lien-he`}
        className="mt-3.5 inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#0c7344]"
      >
        {pickL(c.requestSample, locale)}
        <FlaskConical className="h-3.5 w-3.5" />
      </Link>
      <Link
        href={detailHref}
        className="mt-2 inline-flex items-center justify-center rounded-md border-[1.5px] border-neutral-200 px-4 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
      >
        {pickL(c.requestQuotation, locale)}
      </Link>
    </article>
  );
}

function ScienceBacked({ locale }: { locale: Locale }) {
  const c = homeContent.science;

  return (
    <section className="bg-neutral-50 py-16">
      <div className="container-bs">
        <h2 className="mb-7 font-heading text-[25px] font-extrabold text-primary">
          {pickL(c.title, locale)}
        </h2>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-4 sm:grid-cols-3">
            {homeScienceTechs.map((tech) => (
              <Link
                key={tech.slug}
                href={`/${locale}/cong-nghe`}
                className="group relative block aspect-[1/1.05] overflow-hidden rounded-[14px]"
              >
                <Image
                  src={tech.image}
                  alt={locale === "vi" ? tech.name.vi : tech.name.en}
                  fill
                  sizes="22vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/75" />
                <div className="absolute inset-x-0 top-0 z-10 p-4">
                  <h4 className="font-heading text-[14.5px] font-bold text-white">
                    {locale === "vi" ? tech.name.vi : tech.name.en}
                  </h4>
                  <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-white/90">
                    {locale === "vi" ? tech.tagline.vi : tech.tagline.en}
                  </p>
                </div>
                <span className="absolute left-1/2 top-1/2 z-10 inline-flex h-[42px] w-[42px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] border-white/70 bg-white/20 text-white backdrop-blur-sm">
                  <Play className="h-4 w-4 translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>

          <div>
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h3 className="font-heading text-lg font-extrabold text-ink">
                {pickL(c.clinicalStudies, locale)}
              </h3>
              <Link
                href={`/${locale}/blog`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:gap-2"
              >
                {pickL(c.viewAllEvidence, locale)}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-neutral-200">
              {homeClinicalStudies.map((s) => (
                <div
                  key={s.slug}
                  className="grid grid-cols-[46px_1fr_auto] items-center gap-3 py-3.5"
                >
                  <div className="relative h-[46px] w-[46px] overflow-hidden rounded-md bg-neutral-100">
                    <Image src={s.image} alt="" fill sizes="46px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate font-heading text-[13.5px] font-bold text-ink">
                      {locale === "vi" ? s.title.vi : s.title.en}
                    </h4>
                    <p className="truncate text-[11.5px] text-neutral-500">
                      {locale === "vi" ? s.excerpt.vi : s.excerpt.en}
                    </p>
                  </div>
                  <Link
                    href={`/${locale}/blog`}
                    className="inline-flex items-center gap-1 whitespace-nowrap text-[12.5px] font-semibold text-primary"
                  >
                    {pickL(c.viewStudy, locale)}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  SUPPLY STATS                                                                */
/* ========================================================================== */
function SupplyStats({ locale }: { locale: Locale }) {
  const c = homeContent.stats;
  const [title1, title2] = c.title[locale];
  const stats = [
    { icon: Factory, num: "42+", label: pickL(c.factories, locale) },
    { icon: Globe2, num: "18", label: pickL(c.countries, locale) },
    { icon: Warehouse, num: "8,000 m²", label: pickL(c.warehouse, locale) },
    { icon: Boxes, num: "450+", label: pickL(c.ingredients, locale) },
  ];

  return (
    <section className="relative overflow-hidden py-[52px] pb-11 text-white">
      <Image src={homeImages.facility} alt="" fill sizes="100vw" className="object-cover object-right-center" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, #00301A 0%, rgba(0,48,26,.92) 38%, rgba(0,48,26,.55) 65%, rgba(0,48,26,.15) 100%)",
        }}
        aria-hidden
      />
      <div className="container-bs relative z-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-0">
          <div className="shrink-0 lg:pr-8 xl:min-w-[240px] xl:pr-10">
            <h2 className="font-heading text-[27px] font-extrabold leading-tight text-white">
              {title1}
              <br />
              {title2}
            </h2>
          </div>

          <div className="min-w-0 flex-1">
            <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:gap-x-6 lg:flex lg:items-stretch lg:gap-0">
              {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className={cn(
                      "flex flex-col gap-2 lg:flex-1 lg:px-5 xl:px-7",
                      i > 0 && "lg:border-l lg:border-white/25"
                    )}
                  >
                    <Icon className="h-10 w-10 opacity-95" strokeWidth={1.4} />
                    <div className="font-heading text-[30px] font-extrabold tracking-tight">{s.num}</div>
                    <div className="text-[13px] font-medium text-white/78">{s.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center lg:mt-7">
          <button
            type="button"
            className="inline-flex items-center gap-2.5 text-sm font-semibold text-white"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-primary">
              <Play className="h-3.5 w-3.5 translate-x-0.5" />
            </span>
            {pickL(c.watchFacility, locale)}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  SOLUTIONS & APPLICATIONS                                                    */
/* ========================================================================== */
const SOLUTION_IMAGES = [
  homeImages.solutions.brain,
  homeImages.solutions.beauty,
  homeImages.solutions.joint,
  homeImages.solutions.cardio,
  homeImages.solutions.immune,
  homeImages.solutions.digestive,
];

function SolutionsApplications({ locale }: { locale: Locale }) {
  const c = homeContent.solutions;
  const labels = c.cards[locale];

  return (
    <section className="bg-white py-[60px] pb-[70px]">
      <div className="container-bs">
        <div className="mb-7 flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-heading text-[25px] font-extrabold text-primary">
            {pickL(c.title, locale)}
          </h2>
          <Link
            href={`/${locale}/dich-vu-odm`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5"
          >
            {pickL(c.viewAll, locale)}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {labels.map((label, i) => (
            <Link
              key={label}
              href={`/${locale}/nguyen-lieu`}
              className="group relative flex aspect-[3/3.6] items-start overflow-hidden rounded-[14px] p-4"
            >
              <Image
                src={SOLUTION_IMAGES[i]}
                alt={label}
                fill
                sizes="(max-width:768px) 50vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-transparent" />
              <span className="relative z-10 text-[14.5px] font-bold leading-snug text-white drop-shadow">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
