import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Atom, ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/utils";
import { pick } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import {
  technologies,
  getTechnology,
  getRelatedIngredients,
} from "@/lib/data";
import { PageHeader } from "@/components/shared/page-header";
import { SpecDisplay } from "@/components/ui/spec-display";
import { IngredientCard } from "@/components/cards/ingredient-card";
import { CtaBand } from "@/components/shared/cta-band";

export function generateStaticParams() {
  return technologies.map((tch) => ({ slug: tch.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string; locale: Locale };
}): Metadata {
  const tech = getTechnology(params.slug);
  if (!tech) return {};
  return {
    title: pick(tech.name, params.locale),
    description: pick(tech.tagline, params.locale),
  };
}

export default function TechnologyDetail({
  params,
}: {
  params: { slug: string; locale: Locale };
}) {
  const { locale, slug } = params;
  const tech = getTechnology(slug);
  if (!tech) notFound();
  const t = getDictionary(locale);
  const related = getRelatedIngredients(slug);

  return (
    <>
      <PageHeader
        locale={locale}
        eyebrow={locale === "vi" ? "Công nghệ độc quyền" : "Proprietary technology"}
        title={pick(tech.name, locale)}
        description={pick(tech.tagline, locale)}
        breadcrumbs={[
          { label: t.nav.technologies, href: `/${locale}/cong-nghe` },
          { label: pick(tech.name, locale) },
        ]}
      />

      {/* Overview */}
      <section className="container-bs py-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-neutral-200 shadow-card">
            <Image
              src={tech.image}
              alt={pick(tech.name, locale)}
              fill
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">
              {locale === "vi" ? "Tổng quan" : "Overview"}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-neutral-700">
              {pick(tech.description, locale)}
            </p>
          </div>
        </div>
      </section>

      {/* Mechanism */}
      <section className="bg-neutral-50 py-16">
        <div className="container-bs grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="flex items-center gap-2 font-heading text-2xl font-bold">
              <Atom className="h-6 w-6" style={{ color: tech.accent }} />
              {t.common.mechanism}
            </h2>
            <p className="mt-4 leading-relaxed text-neutral-700">
              {pick(tech.mechanism, locale)}
            </p>
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold">{t.common.specs}</h3>
            <div className="mt-5 space-y-5 rounded-xl border border-neutral-200 bg-white p-7 shadow-card">
              {tech.specs.map((s, i) => (
                <SpecDisplay key={i} spec={s} locale={locale} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related ingredients */}
      {related.length > 0 && (
        <section className="container-bs py-16">
          <h2 className="font-heading text-2xl font-bold">
            {locale === "vi"
              ? "Nguyên liệu ứng dụng công nghệ này"
              : "Ingredients using this technology"}
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <IngredientCard key={r.slug} ingredient={r} locale={locale} />
            ))}
          </div>
        </section>
      )}

      <div className="pb-12">
        <CtaBand locale={locale} />
      </div>
    </>
  );
}
