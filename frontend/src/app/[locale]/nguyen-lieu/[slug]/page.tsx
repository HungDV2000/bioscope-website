import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, MapPin, Beaker, ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/utils";
import { pick } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import {
  ingredients,
  getIngredient,
  getTechnology,
} from "@/lib/data";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { SpecDisplay } from "@/components/ui/spec-display";
import { IngredientCard } from "@/components/cards/ingredient-card";
import { CtaBand } from "@/components/shared/cta-band";

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

  return (
    <>
      <PageHeader
        locale={locale}
        title={pick(ing.name, locale)}
        breadcrumbs={[
          { label: t.nav.ingredients, href: `/${locale}/nguyen-lieu` },
          { label: pick(ing.name, locale) },
        ]}
      />

      <section className="container-bs py-14">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-neutral-200 shadow-card">
            <Image
              src={ing.image}
              alt={pick(ing.name, locale)}
              fill
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone={ing.type === "supplement" ? "primary" : "accent"}>
                {ing.type === "supplement"
                  ? t.common.supplement
                  : t.common.cosmetic}
              </Badge>
              <Badge tone="neutral">{pick(ing.category, locale)}</Badge>
            </div>
            <p className="mt-5 text-lg leading-relaxed text-neutral-700">
              {pick(ing.description, locale)}
            </p>

            <dl className="mt-7 grid grid-cols-2 gap-4">
              <div className="rounded-md border border-neutral-200 p-4">
                <dt className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <MapPin className="h-3.5 w-3.5" /> {t.common.origin}
                </dt>
                <dd className="mt-1 font-semibold text-neutral-900">
                  {ing.originCountry}
                </dd>
              </div>
              <div className="rounded-md border border-neutral-200 p-4">
                <dt className="text-xs text-neutral-500">{t.common.brand}</dt>
                <dd className="mt-1 font-semibold text-neutral-900">
                  {ing.brandName}
                </dd>
              </div>
            </dl>

            {/* Benefits */}
            <div className="mt-7">
              <h3 className="font-heading text-lg font-bold">
                {t.common.benefits}
              </h3>
              <ul className="mt-3 space-y-2">
                {ing.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-neutral-700">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    {pick(b, locale)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={`/${locale}/lien-he`}>
                {t.cta.contact}
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href={`/${locale}/b2b/login`} variant="outline">
                {locale === "vi" ? "Xem COA / báo giá (B2B)" : "View COA / quote (B2B)"}
              </ButtonLink>
            </div>
          </div>
        </div>

        {/* Specs + Applications */}
        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          {ing.specs.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 font-heading text-xl font-bold">
                <Beaker className="h-5 w-5 text-primary" />
                {t.common.specs}
              </h3>
              <div className="mt-5 space-y-5">
                {ing.specs.map((s, i) => (
                  <SpecDisplay key={i} spec={s} locale={locale} />
                ))}
              </div>
            </div>
          )}
          <div>
            <h3 className="font-heading text-xl font-bold">
              {t.common.applications}
            </h3>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {ing.applications.map((a, i) => (
                <span
                  key={i}
                  className="rounded-full bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-700"
                >
                  {pick(a, locale)}
                </span>
              ))}
            </div>

            {tech && (
              <div className="mt-8 rounded-xl border border-primary/20 bg-primary-tint/50 p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
                  {t.common.relatedTech}
                </p>
                <h4 className="mt-2 font-heading text-lg font-bold">
                  {pick(tech.name, locale)}
                </h4>
                <p className="mt-1 text-sm text-neutral-600">
                  {pick(tech.tagline, locale)}
                </p>
                <Link
                  href={`/${locale}/cong-nghe/${tech.slug}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
                >
                  {t.cta.viewDetail}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-neutral-50 py-20">
          <div className="container-bs">
            <h2 className="font-heading text-2xl font-bold">
              {t.common.relatedProducts}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <IngredientCard key={r.slug} ingredient={r} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="py-12">
        <CtaBand locale={locale} />
      </div>
    </>
  );
}
