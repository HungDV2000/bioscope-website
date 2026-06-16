import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, MapPin, Beaker, ArrowRight, Building2 } from "lucide-react";
import type { Locale } from "@/lib/utils";
import { pick } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import {
  ingredients,
  getIngredient,
  getTechnology,
} from "@/lib/data";
import { PageHeader, splitParenTitle } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { SpecDisplay } from "@/components/ui/spec-display";
import { IngredientCard } from "@/components/cards/ingredient-card";
import { CtaBand } from "@/components/shared/cta-band";
import { RichContentLayout } from "@/components/shared/rich-content";
import { getIngredientRichContent } from "@/lib/detail-sections";

export function generateStaticParams() {
  return ingredients.map((i) => ({ slug: i.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string; locale: Locale };
}): Metadata {
  const ing = getIngredient(params.slug);
  if (!ing) return {};
  return {
    title: pick(ing.name, params.locale),
    description: pick(ing.description, params.locale),
  };
}

export default function IngredientDetail({
  params,
}: {
  params: { slug: string; locale: Locale };
}) {
  const { locale, slug } = params;
  const ing = getIngredient(slug);
  if (!ing) notFound();
  const t = getDictionary(locale);
  const tech = ing.relatedTech ? getTechnology(ing.relatedTech) : undefined;
  const related = ingredients
    .filter((i) => i.type === ing.type && i.slug !== ing.slug)
    .slice(0, 3);

  const typeLabel =
    ing.type === "supplement" ? t.common.supplement : t.common.cosmetic;
  const { title, titleAccent } = splitParenTitle(pick(ing.name, locale));
  const rich = ing.sections?.length
    ? { contentLead: ing.contentLead, sections: ing.sections }
    : getIngredientRichContent(slug);

  return (
    <>
      <PageHeader
        locale={locale}
        compact
        eyebrow={`${typeLabel.toUpperCase()} · ${pick(ing.category, locale).toUpperCase()}`}
        title={title}
        titleAccent={titleAccent}
        description={pick(ing.description, locale)}
        breadcrumbs={[
          { label: t.nav.ingredients, href: `/${locale}/nguyen-lieu` },
          { label: title },
        ]}
      />

      <section className="container-bs py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Cột trái — ảnh + specs */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                <Image
                  src={ing.image}
                  alt={pick(ing.name, locale)}
                  fill
                  sizes="(max-width:1024px) 100vw, 42vw"
                  className="object-cover"
                  priority
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-primary-deep/40 to-transparent"
                  aria-hidden
                />
              </div>

              {ing.specs.length > 0 && (
                <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary-tint/50 to-white p-5 sm:p-6">
                  <h3 className="flex items-center gap-2 font-heading text-base font-bold text-primary-dark">
                    <Beaker className="h-4 w-4" />
                    {t.common.specs}
                  </h3>
                  <div className="mt-4 space-y-4">
                    {ing.specs.map((s, i) => (
                      <SpecDisplay key={i} spec={s} locale={locale} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cột phải — nội dung chính */}
          <div className="lg:col-span-7">
            <div className="flex flex-wrap gap-2">
              <Badge tone={ing.type === "supplement" ? "primary" : "accent"}>
                {ing.type === "supplement"
                  ? t.common.supplement
                  : t.common.cosmetic}
              </Badge>
              <Badge tone="neutral">{pick(ing.category, locale)}</Badge>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-tint text-primary-dark">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <dt className="text-xs text-neutral-500">{t.common.origin}</dt>
                  <dd className="mt-0.5 font-semibold text-ink">
                    {ing.originCountry}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-tint text-accent-dark">
                  <Building2 className="h-4 w-4" />
                </span>
                <div>
                  <dt className="text-xs text-neutral-500">{t.common.brand}</dt>
                  <dd className="mt-0.5 font-semibold text-ink">
                    {ing.brandName}
                  </dd>
                </div>
              </div>
            </div>

            {ing.partner && (
              <p className="mt-4 text-sm text-neutral-500">
                {locale === "vi" ? "Nhà cung cấp:" : "Supplier:"}{" "}
                <span className="font-medium text-neutral-700">{ing.partner}</span>
              </p>
            )}

            <div className="mt-8">
              <h3 className="font-heading text-lg font-bold">
                {t.common.benefits}
              </h3>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {ing.benefits.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 rounded-lg bg-primary-tint/40 px-3 py-2.5 text-sm text-neutral-700"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {pick(b, locale)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <h3 className="font-heading text-lg font-bold">
                {t.common.applications}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {ing.applications.map((a, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-sm font-medium text-neutral-700"
                  >
                    {pick(a, locale)}
                  </span>
                ))}
              </div>
            </div>

            {tech && (
              <div
                className="mt-8 overflow-hidden rounded-2xl border border-primary/20"
                style={{
                  background: `linear-gradient(135deg, ${tech.accent}12 0%, #E6F4EC 100%)`,
                }}
              >
                <div className="p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
                    {t.common.relatedTech}
                  </p>
                  <h4 className="mt-2 font-heading text-lg font-bold text-ink">
                    {pick(tech.name, locale)}
                  </h4>
                  <p className="mt-1 text-sm text-neutral-600">
                    {pick(tech.tagline, locale)}
                  </p>
                  <Link
                    href={`/${locale}/cong-nghe/${tech.slug}`}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-dark"
                  >
                    {t.cta.viewDetail}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3 border-t border-neutral-200 pt-8">
              <ButtonLink href={`/${locale}/lien-he`}>
                {t.cta.contact}
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href={`/${locale}/b2b/login`} variant="outline">
                {locale === "vi"
                  ? "Xem COA / báo giá (B2B)"
                  : "View COA / quote (B2B)"}
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {rich && (rich.sections.length > 0 || rich.contentLead) && (
        <RichContentLayout
          lead={rich.contentLead}
          sections={rich.sections}
          locale={locale}
          wide
        />
      )}

      {related.length > 0 && (
        <section className="border-t border-neutral-200 bg-gradient-to-b from-neutral-50 to-white py-14 sm:py-16">
          <div className="container-bs">
            <h2 className="font-heading text-xl font-bold sm:text-2xl">
              {t.common.relatedProducts}
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <IngredientCard key={r.slug} ingredient={r} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="pb-10 pt-4">
        <CtaBand locale={locale} />
      </div>
    </>
  );
}
