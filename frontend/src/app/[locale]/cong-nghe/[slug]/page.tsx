import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Atom } from "lucide-react";
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
import { RichContentLayout } from "@/components/shared/rich-content";
import { getTechRichContent } from "@/lib/detail-sections";

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
  const rich = tech.sections?.length
    ? { contentLead: tech.contentLead, sections: tech.sections }
    : getTechRichContent(slug);

  return (
    <>
      <PageHeader
        locale={locale}
        compact
        eyebrow={
          locale === "vi"
            ? "CÔNG NGHỆ ĐỘC QUYỀN · NĂNG LỰC R&D"
            : "PROPRIETARY TECHNOLOGY · R&D"
        }
        title={pick(tech.name, locale)}
        titleAccent={pick(tech.tagline, locale)}
        description={pick(tech.description, locale)}
        breadcrumbs={[
          { label: t.nav.technologies, href: `/${locale}/cong-nghe` },
          { label: pick(tech.name, locale) },
        ]}
      />

      <section className="container-bs py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200">
                <Image
                  src={tech.image}
                  alt={pick(tech.name, locale)}
                  fill
                  sizes="(max-width:1024px) 100vw, 42vw"
                  className="object-cover"
                  priority
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(160deg, ${tech.accent}30 0%, transparent 55%)`,
                  }}
                  aria-hidden
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <h2 className="font-heading text-xl font-bold sm:text-2xl">
              {locale === "vi" ? "Tổng quan" : "Overview"}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-700 sm:text-lg">
              {pick(tech.description, locale)}
            </p>

            <div
              className="mt-8 rounded-2xl border p-5 sm:p-6"
              style={{
                borderColor: `${tech.accent}30`,
                background: `linear-gradient(135deg, ${tech.accent}0D 0%, #FFFFFF 100%)`,
              }}
            >
              <h3 className="flex items-center gap-2 font-heading text-lg font-bold">
                <Atom className="h-5 w-5" style={{ color: tech.accent }} />
                {t.common.mechanism}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700 sm:text-base">
                {pick(tech.mechanism, locale)}
              </p>
            </div>

            <div className="mt-8">
              <h3 className="font-heading text-lg font-bold">{t.common.specs}</h3>
              <div className="mt-4 space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
                {tech.specs.map((s, i) => (
                  <SpecDisplay key={i} spec={s} locale={locale} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {rich && (rich.sections.length > 0 || rich.contentLead) && (
        <RichContentLayout
          lead={rich.contentLead}
          sections={rich.sections}
          locale={locale}
        />
      )}

      {related.length > 0 && (
        <section className="border-t border-neutral-200 bg-gradient-to-b from-neutral-50 to-white py-14 sm:py-16">
          <div className="container-bs">
            <h2 className="font-heading text-xl font-bold sm:text-2xl">
              {locale === "vi"
                ? "Nguyên liệu ứng dụng công nghệ này"
                : "Ingredients using this technology"}
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
