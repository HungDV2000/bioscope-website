import type { Metadata } from "next";
import * as Icons from "lucide-react";
import { Check } from "lucide-react";
import type { Locale } from "@/lib/utils";
import { pick } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { services } from "@/lib/data";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { CtaBand } from "@/components/shared/cta-band";

export const metadata: Metadata = {
  title: "Dịch vụ ODM",
  description:
    "Dịch vụ ODM trọn gói: nghiên cứu công thức, gia công GMP, tư vấn công bố pháp lý và thiết kế bao bì.",
};

const steps = {
  vi: [
    { n: "01", t: "Tiếp nhận & tư vấn", d: "Lắng nghe ý tưởng, mục tiêu sản phẩm và thị trường." },
    { n: "02", t: "Phát triển công thức", d: "R&D công thức mẫu, thử nghiệm và tối ưu." },
    { n: "03", t: "Sản xuất GMP", d: "Gia công trên dây chuyền đạt chuẩn, kiểm soát chất lượng." },
    { n: "04", t: "Công bố & ra mắt", d: "Hoàn thiện hồ sơ pháp lý, bàn giao sản phẩm." },
  ],
  en: [
    { n: "01", t: "Briefing & consulting", d: "Understanding your idea, product goals and market." },
    { n: "02", t: "Formulation R&D", d: "Sample formulation, testing and optimisation." },
    { n: "03", t: "GMP manufacturing", d: "Production on certified lines with quality control." },
    { n: "04", t: "Registration & launch", d: "Completing legal dossiers and product handover." },
  ],
};

export default function ServicesPage({
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
        title={locale === "vi" ? "Giải pháp ODM trọn gói" : "End-to-end ODM solutions"}
        titleAccent={locale === "vi" ? "từ ý tưởng đến thị trường" : "from idea to market"}
        description={
          locale === "vi"
            ? "Bioscope đồng hành cùng bạn trong toàn bộ vòng đời sản phẩm — nghiên cứu, sản xuất, pháp lý và bao bì."
            : "Bioscope accompanies you through the entire product lifecycle — R&D, manufacturing, compliance and packaging."
        }
        breadcrumbs={[{ label: t.nav.services }]}
      />

      {/* Services grid */}
      <section className="container-bs py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {services.map((s, i) => {
            const Icon = (Icons as any)[s.icon] ?? Icons.Sparkles;
            return (
              <Reveal key={s.slug} delay={i * 80}>
                <div className="h-full rounded-xl border border-neutral-200 bg-white p-8 shadow-card transition-shadow hover:shadow-card-hover">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary-tint text-primary-dark">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 font-heading text-xl font-bold">
                    {pick(s.title, locale)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                    {pick(s.description, locale)}
                  </p>
                  <ul className="mt-5 space-y-2">
                    {s.features.map((f, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm text-neutral-700"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {pick(f, locale)}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Process */}
      <section className="bg-neutral-50 py-20">
        <div className="container-bs">
          <SectionHeading
            align="center"
            eyebrow={locale === "vi" ? "Quy trình" : "Process"}
            title={locale === "vi" ? "4 bước hợp tác" : "A 4-step partnership"}
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps[locale].map((step, i) => (
              <Reveal key={step.n} delay={i * 80}>
                <div className="relative h-full rounded-xl border border-neutral-200 bg-white p-7">
                  <span className="font-heading text-4xl font-extrabold text-primary">
                    {step.n}
                  </span>
                  <h3 className="mt-3 font-heading text-lg font-bold">{step.t}</h3>
                  <p className="mt-2 text-sm text-neutral-500">{step.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="py-12">
        <CtaBand locale={locale} />
      </div>
    </>
  );
}
