import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Briefcase, ArrowLeft, Check } from "lucide-react";
import type { Locale } from "@/lib/utils";
import { pick } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { jobs, getJob } from "@/lib/data";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { CareerApplicationForm } from "@/components/forms/career-application-form";

export function generateStaticParams() {
  return jobs.map((j) => ({ slug: j.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string; locale: Locale };
}): Metadata {
  const job = getJob(params.slug);
  if (!job) return {};
  return {
    title: pick(job.title, params.locale),
    description: pick(job.description, params.locale),
  };
}

export default function JobDetailPage({
  params,
}: {
  params: { slug: string; locale: Locale };
}) {
  const { locale, slug } = params;
  const job = getJob(slug);
  if (!job) notFound();
  const t = getDictionary(locale);
  const title = pick(job.title, locale);

  const labels =
    locale === "vi"
      ? {
          responsibilities: "Trách nhiệm công việc",
          requirements: "Yêu cầu",
          benefits: "Quyền lợi",
          apply: "Ứng tuyển ngay",
          applyHint: "Điền form bên dưới — chúng tôi sẽ phản hồi sớm nhất có thể.",
          back: "Tất cả vị trí",
        }
      : {
          responsibilities: "Responsibilities",
          requirements: "Requirements",
          benefits: "Benefits",
          apply: "Apply now",
          applyHint: "Fill in the form below — we'll get back to you as soon as possible.",
          back: "All positions",
        };

  const listSections = [
    { key: "responsibilities", title: labels.responsibilities, items: job.responsibilities },
    { key: "requirements", title: labels.requirements, items: job.requirements },
    { key: "benefits", title: labels.benefits, items: job.benefits },
  ] as const;

  return (
    <>
      <PageHeader
        locale={locale}
        compact
        eyebrow={pick(job.department, locale).toUpperCase()}
        title={title}
        description={pick(job.description, locale)}
        breadcrumbs={[
          { label: t.nav.careers, href: `/${locale}/tuyen-dung` },
          { label: title },
        ]}
      />

      <section className="container-bs py-10 sm:py-14">
        <Link
          href={`/${locale}/tuyen-dung`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-dark transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {labels.back}
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Badge tone="primary">{pick(job.department, locale)}</Badge>
          <span className="inline-flex items-center gap-1.5 text-sm text-neutral-500">
            <MapPin className="h-4 w-4" />
            {pick(job.location, locale)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-neutral-500">
            <Briefcase className="h-4 w-4" />
            {pick(job.type, locale)}
          </span>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_26rem] lg:items-start lg:gap-12">
          <div className="space-y-10">
            {listSections.map((section) => (
              <div key={section.key}>
                <h2 className="font-heading text-xl font-bold text-ink">
                  {section.title}
                </h2>
                <ul className="mt-4 space-y-3">
                  {section.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-neutral-700 sm:text-base"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {pick(item, locale)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            id="ung-tuyen"
            className="scroll-mt-28 rounded-xl border border-neutral-200 bg-white p-6 shadow-card sm:p-8 lg:sticky lg:top-28"
          >
            <h2 className="font-heading text-xl font-bold">{labels.apply}</h2>
            <p className="mt-2 text-sm text-neutral-500">{labels.applyHint}</p>
            <div className="mt-6">
              <CareerApplicationForm locale={locale} jobTitle={title} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
