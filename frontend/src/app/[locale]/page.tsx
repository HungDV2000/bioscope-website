import Image from "next/image";
import { ArrowRight, ShieldCheck } from "lucide-react";
import type { Locale } from "@/lib/utils";
import { pick } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { ButtonLink } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";
import { Reveal } from "@/components/ui/reveal";
import { TechCard } from "@/components/cards/tech-card";
import { IngredientCard } from "@/components/cards/ingredient-card";
import { PostCard } from "@/components/cards/post-card";
import { SolutionsSection } from "@/components/home/solutions-section";
import { CtaBand } from "@/components/shared/cta-band";
import {
  technologies,
  ingredients,
  certifications,
  partners,
  posts,
} from "@/lib/data";

/* -------------------------------------------------------------------------- */
/*  Trang chủ — EDITORIAL · "Precision / Nanoscience"                          */
/* -------------------------------------------------------------------------- */
export default function HomePage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const t = getDictionary(locale);
  const techs = [...technologies].sort((a, b) => a.order - b.order);
  const pool = ingredients.filter((i) => i.featured);
  const featured = (pool.length ? pool : ingredients).slice(0, 3);

  return (
    <>
      <Hero locale={locale} />
      <StatsBand locale={locale} />
      <PartnersCloud locale={locale} />
      <SolutionsSection locale={locale} />

      {/* Technologies */}
      <section className="container-bs py-16 lg:py-20">
        <Reveal>
          <SectionLead
            label={locale === "vi" ? "Năng lực R&D" : "R&D capability"}
            title={
              locale === "vi"
                ? "Bốn nền tảng vận chuyển hoạt chất ở cấp độ nano"
                : "Four nano-scale active delivery platforms"
            }
            desc={
              locale === "vi"
                ? "Tự nghiên cứu và phát triển — nâng sinh khả dụng, độ ổn định và hiệu quả của hoạt chất lên nhiều lần so với dạng bào chế thường."
                : "Developed in-house — multiplying bioavailability, stability and efficacy of actives over conventional forms."
            }
            href={`/${locale}/cong-nghe`}
            cta={t.cta.viewAll}
          />
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {techs.map((tech, i) => (
            <Reveal key={tech.slug} delay={i * 70}>
              <TechCard tech={tech} locale={locale} index={i} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured ingredients */}
      <section className="border-y border-primary/10 bg-primary-tint/30 py-16 lg:py-20">
        <div className="container-bs">
          <Reveal>
            <SectionLead
              label={locale === "vi" ? "Danh mục nguyên liệu" : "Ingredient catalog"}
              title={
                locale === "vi"
                  ? "Nguyên liệu chuẩn hóa, được tin dùng"
                  : "Standardised, trusted ingredients"
              }
              desc={
                locale === "vi"
                  ? "Tuyển chọn cho thực phẩm chức năng và mỹ phẩm, nguồn gốc minh bạch từ các nhà sản xuất hàng đầu thế giới."
                  : "Curated for supplements and cosmetics, transparently sourced from the world's leading manufacturers."
              }
              href={`/${locale}/nguyen-lieu`}
              cta={t.cta.viewAll}
            />
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((ing, i) => (
              <Reveal key={ing.slug} delay={i * 70}>
                <IngredientCard ingredient={ing} locale={locale} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="container-bs py-16 lg:py-20">
        <Reveal>
          <SectionLead
            label="Bioneer's Blog"
            title={locale === "vi" ? "Kiến thức chuyên ngành" : "Industry insights"}
            desc={
              locale === "vi"
                ? "Góc nhìn chuyên gia về nguyên liệu, công nghệ bào chế và xu hướng ngành."
                : "Expert perspectives on ingredients, formulation technology and trends."
            }
            href={`/${locale}/blog`}
            cta={t.cta.viewAll}
          />
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map((post, i) => (
            <Reveal key={post.slug} delay={i * 70}>
              <PostCard post={post} locale={locale} />
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBand locale={locale} />
      <div className="pb-8" />
    </>
  );
}

/* ========================================================================== */
/*  Section lead — lab-label + title + (optional) link "Xem tất cả"            */
/* ========================================================================== */
function SectionLead({
  label,
  title,
  desc,
  href,
  cta,
}: {
  label: string;
  title: string;
  desc?: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <span className="lab-label">{label}</span>
        <h2 className="mt-3 text-2xl font-bold leading-tight text-balance text-ink sm:text-[1.75rem]">
          {title}
        </h2>
        {desc && (
          <p className="mt-3 text-sm leading-relaxed text-neutral-500 sm:text-[15px]">
            {desc}
          </p>
        )}
      </div>
      {href && cta && (
        <ButtonLink href={href} variant="outline" className="shrink-0">
          {cta}
          <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      )}
    </div>
  );
}

/* ========================================================================== */
/*  HERO — gradient sâu + signature "encapsulation" động                       */
/* ========================================================================== */
function Hero({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const p = (path: string) => `/${locale}${path}`;

  const copy =
    locale === "vi"
      ? {
          badge: "Nguyên liệu cao cấp · Công nghệ vận chuyển nano",
          titleA: "Đưa hoạt chất",
          titleB: "đến đúng đích —",
          titleC: "hiệu quả hơn, chi phí tối ưu hơn",
          desc: "Bioscope Việt Nam đồng hành cùng doanh nghiệp Dược phẩm, Thực phẩm chức năng và Mỹ phẩm — từ nguyên liệu nhập khẩu chuẩn hóa đến giải pháp công thức ODM ứng dụng công nghệ nano độc quyền.",
          trust: "Đạt chuẩn GMP · Nguồn gốc minh bạch · Hỗ trợ pháp lý trọn gói",
        }
      : {
          badge: "Premium ingredients · Nano delivery technology",
          titleA: "Deliver actives",
          titleB: "to the right target —",
          titleC: "higher efficacy, optimised cost",
          desc: "Bioscope Vietnam partners with Pharmaceutical, Supplement and Cosmetic companies — from standardised imported ingredients to ODM formulation powered by proprietary nano technology.",
          trust: "GMP-certified · Transparent sourcing · Full regulatory support",
        };

  const poster =
    "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=1920&q=80";

  return (
    <section className="relative -mt-[5.5rem] flex min-h-[82vh] items-center overflow-hidden text-white sm:-mt-[5.75rem] sm:min-h-[85vh]">
      {/* Banner nền — Ken Burns trên ảnh (không dùng video để tránh 404) */}
      <Image
        src={poster}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover animate-kenburns"
        aria-hidden
      />

      {/* Overlay — nền tối hơn để chữ trắng nổi rõ, giữ tông thương hiệu */}
      <div className="absolute inset-0 bg-primary-deep/45" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-r from-primary-deep/95 via-primary-deep/65 to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-primary-deep/75 via-transparent to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-grid [background-size:64px_64px] opacity-[0.1]"
        aria-hidden
      />

      <div className="container-bs relative z-10 py-20 pt-28 sm:py-24 sm:pt-32 lg:py-28">
        <div className="max-w-2xl sm:max-w-3xl lg:max-w-[42rem]">
          <span className="lab-label lab-label--invert text-[10px] sm:text-[11px]">{copy.badge}</span>

          <h1 className="mt-4 font-heading text-[1.75rem] font-bold leading-[1.12] tracking-[-0.02em] text-balance text-white sm:text-4xl lg:text-[2.75rem]">
            {copy.titleA}
            <span className="block bg-gradient-to-r from-accent via-[#FFB36B] to-[#FFE0BD] bg-clip-text text-transparent">
              {copy.titleB}
            </span>
            <span className="block">{copy.titleC}</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:max-w-2xl sm:text-[15px] lg:text-base">
            {copy.desc}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href={p("/nguyen-lieu")} variant="accent" size="md">
              {t.cta.explore}
              <ArrowRight className="h-5 w-5" />
            </ButtonLink>
            <ButtonLink href={p("/lien-he")} variant="white" size="md">
              {t.cta.contact}
            </ButtonLink>
          </div>

          {/* Readout chips — chỉ số khoa học của công nghệ nano */}
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-2.5 sm:max-w-2xl sm:gap-3 lg:max-w-[36rem]">
            {[
              { v: "4.2×", l: locale === "vi" ? "Thẩm thấu" : "Permeation" },
              { v: "95%", l: locale === "vi" ? "Hiệu suất bao gói" : "Encapsulation" },
              { v: "80–120", u: "nm", l: locale === "vi" ? "Kích thước hạt" : "Particle size" },
            ].map((c) => (
              <div
                key={c.l}
                className="rounded-lg border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur-md sm:px-3.5 sm:py-3"
              >
                <div className="readout text-xl text-white sm:text-2xl">
                  {c.v}
                  {c.u && (
                    <span className="ml-1 text-sm font-medium text-white/60">
                      {c.u}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-[11px] uppercase tracking-wider text-white/70">
                  {c.l}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-start gap-2.5 text-sm text-white/75">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            {copy.trust}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  STATS BAND — dải số liệu màu thương hiệu, chia cột, số lớn căn giữa         */
/* ========================================================================== */
function StatsBand({ locale }: { locale: Locale }) {
  return (
    <section className="relative overflow-hidden bg-primary text-white">
      {/* Pattern nền mờ */}
      <div
        className="absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -right-16 -top-8 h-56 w-56 rounded-full bg-accent/25 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-white/5 blur-2xl"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-grid [background-size:48px_48px] opacity-[0.08]"
        aria-hidden
      />

      <div className="container-bs relative grid grid-cols-2 gap-y-8 py-11 sm:py-12 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-white/15">
        {certifications.map((c, i) => (
          <Reveal key={c.value} delay={i * 80}>
            <div className="text-center lg:px-6">
              <CountUp
                value={c.value}
                className="readout block text-3xl sm:text-4xl lg:text-5xl"
              />
              <div className="mx-auto mt-1.5 max-w-[14ch] text-xs leading-snug text-white/75 sm:text-sm">
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
/*  PARTNERS — dải đối tác (marquee) ngay dưới dải số liệu, nền trắng           */
/* ========================================================================== */
function PartnersCloud({ locale }: { locale: Locale }) {
  const row = [...partners, ...partners];
  return (
    <section className="w-full border-b border-neutral-200 bg-white py-8 sm:py-9">
      <div className="flex w-full flex-col gap-5 sm:flex-row sm:items-center">
        <span className="lab-label shrink-0 px-5 sm:px-8 lg:pl-[max(1.25rem,calc((100vw-1320px)/2+1.25rem))]">
          {locale === "vi" ? "Đối tác cung ứng toàn cầu" : "Trusted global partners"}
        </span>
        <div className="mask-fade-x relative min-w-0 flex-1 overflow-hidden">
          <ul className="flex w-max items-center gap-10 animate-marquee pause-hover sm:gap-14">
            {row.map((partner, i) => (
              <li
                key={`${partner.name}-${i}`}
                className="group flex shrink-0 items-baseline gap-2"
                aria-hidden={i >= partners.length}
              >
                <span className="font-heading text-base font-bold text-neutral-400 transition-colors group-hover:text-primary-dark sm:text-lg">
                  {partner.name}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-300">
                  {partner.code}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
