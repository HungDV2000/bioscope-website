import type { Metadata } from "next";
import type { Locale } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { technologies } from "@/lib/data";
import { PageHeader } from "@/components/shared/page-header";
import { TechCard } from "@/components/cards/tech-card";
import { Reveal } from "@/components/ui/reveal";
import { CtaBand } from "@/components/shared/cta-band";

export const metadata: Metadata = {
  title: "Công nghệ độc quyền",
  description:
    "Các nền tảng công nghệ nano độc quyền của Bioscope: Novaskin, Phytosome ướt, Lipodisq và Liposome.",
};

export default function TechnologiesPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const { locale } = params;
  const t = getDictionary(locale);
  const techs = [...technologies].sort((a, b) => a.order - b.order);

  return (
    <>
      <PageHeader
        locale={locale}
        title={locale === "vi" ? "Công nghệ độc quyền của" : "Bioscope's proprietary"}
        titleAccent={locale === "vi" ? "Bioscope" : "technologies"}
        description={
          locale === "vi"
            ? "Bốn nền tảng công nghệ nano được nghiên cứu và phát triển nội bộ, giúp tối ưu sinh khả dụng, độ ổn định và hiệu quả của hoạt chất."
            : "Four nano technology platforms researched and developed in-house to optimise active bioavailability, stability and efficacy."
        }
        breadcrumbs={[{ label: t.nav.technologies }]}
      />

      <section className="container-bs py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {techs.map((tech, i) => (
            <Reveal key={tech.slug} delay={i * 80}>
              <TechCard tech={tech} locale={locale} index={i} />
            </Reveal>
          ))}
        </div>
      </section>

      <div className="pb-12">
        <CtaBand locale={locale} />
      </div>
    </>
  );
}
