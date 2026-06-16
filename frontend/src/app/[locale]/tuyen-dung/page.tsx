import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Briefcase, ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/utils";
import { pick } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { jobs } from "@/lib/data";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { CtaBand } from "@/components/shared/cta-band";

export const metadata: Metadata = {
  title: "Tuyển dụng",
  description: "Cơ hội nghề nghiệp tại Công ty Cổ phần Bioscope Việt Nam.",
};

export default function CareersPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const { locale } = params;
  const t = getDictionary(locale);

  return (
    <>
      <PageHeader
        locale={locale}
        title={locale === "vi" ? "Cùng Bioscope kiến tạo" : "Build the future with"}
        titleAccent={locale === "vi" ? "tương lai" : "Bioscope"}
        description={
          locale === "vi"
            ? "Chúng tôi luôn tìm kiếm những con người đam mê khoa học và đổi mới. Khám phá cơ hội nghề nghiệp tại Bioscope."
            : "We are always looking for people passionate about science and innovation. Explore career opportunities at Bioscope."
        }
        breadcrumbs={[{ label: t.nav.careers }]}
      />

      <section className="container-bs py-16">
        <h2 className="font-heading text-2xl font-bold">
          {locale === "vi" ? "Vị trí đang tuyển" : "Open positions"}
        </h2>
        <div className="mt-8 space-y-4">
          {jobs.map((job) => {
            const title = pick(job.title, locale);
            return (
              <div
                key={job.slug}
                className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/${locale}/tuyen-dung/${job.slug}`}
                      className="font-heading text-lg font-bold transition-colors hover:text-primary"
                    >
                      {title}
                    </Link>
                    <Badge tone="primary">{pick(job.department, locale)}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-neutral-500">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {pick(job.location, locale)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4" />
                      {pick(job.type, locale)}
                    </span>
                  </div>
                </div>
                <ButtonLink
                  href={`/${locale}/tuyen-dung/${job.slug}#ung-tuyen`}
                  variant="outline"
                  className="shrink-0"
                >
                  {locale === "vi" ? "Ứng tuyển" : "Apply"}
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              </div>
            );
          })}
        </div>
      </section>

      <div className="pb-12">
        <CtaBand locale={locale} />
      </div>
    </>
  );
}
