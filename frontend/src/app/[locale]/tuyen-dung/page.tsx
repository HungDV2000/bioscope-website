import type { Metadata } from "next";
import { MapPin, Briefcase, ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { CtaBand } from "@/components/shared/cta-band";

export const metadata: Metadata = {
  title: "Tuyển dụng",
  description: "Cơ hội nghề nghiệp tại Công ty Cổ phần Bioscope Việt Nam.",
};

const jobs = {
  vi: [
    { t: "Chuyên viên R&D Mỹ phẩm", loc: "TP. HCM", type: "Toàn thời gian", dept: "R&D" },
    { t: "Nhân viên Kinh doanh B2B", loc: "TP. HCM", type: "Toàn thời gian", dept: "Kinh doanh" },
    { t: "Chuyên viên Đăng ký công bố", loc: "Hà Nội", type: "Toàn thời gian", dept: "Pháp lý" },
    { t: "Marketing Executive", loc: "TP. HCM", type: "Toàn thời gian", dept: "Marketing" },
  ],
  en: [
    { t: "Cosmetic R&D Specialist", loc: "Ho Chi Minh City", type: "Full-time", dept: "R&D" },
    { t: "B2B Sales Executive", loc: "Ho Chi Minh City", type: "Full-time", dept: "Sales" },
    { t: "Product Registration Specialist", loc: "Hanoi", type: "Full-time", dept: "Legal" },
    { t: "Marketing Executive", loc: "Ho Chi Minh City", type: "Full-time", dept: "Marketing" },
  ],
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
        eyebrow={t.nav.careers}
        title={
          locale === "vi"
            ? "Cùng Bioscope kiến tạo tương lai"
            : "Build the future with Bioscope"
        }
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
          {jobs[locale].map((job) => (
            <div
              key={job.t}
              className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-heading text-lg font-bold">{job.t}</h3>
                  <Badge tone="primary">{job.dept}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-neutral-500">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {job.loc}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4" />
                    {job.type}
                  </span>
                </div>
              </div>
              <ButtonLink
                href={`/${locale}/lien-he`}
                variant="outline"
                className="shrink-0"
              >
                {locale === "vi" ? "Ứng tuyển" : "Apply"}
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          ))}
        </div>
      </section>

      <div className="pb-12">
        <CtaBand locale={locale} />
      </div>
    </>
  );
}
