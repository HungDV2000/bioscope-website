import type { Metadata } from "next";
import Image from "next/image";
import { Target, Eye, HeartHandshake, Award } from "lucide-react";
import type { Locale } from "@/lib/utils";
import { pick } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { certifications } from "@/lib/data";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { CountUp } from "@/components/ui/count-up";
import { CtaBand } from "@/components/shared/cta-band";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description:
    "Công ty Cổ phần Bioscope Việt Nam — đối tác tin cậy về nguyên liệu và giải pháp công thức cho ngành Dược, TPCN và Mỹ phẩm.",
};

export default function AboutPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const t = getDictionary(locale);

  const values =
    locale === "vi"
      ? [
          { icon: Target, t: "Sứ mệnh", d: "Mang nguyên liệu và công nghệ tốt nhất thế giới đến doanh nghiệp Việt." },
          { icon: Eye, t: "Tầm nhìn", d: "Trở thành đối tác R&D hàng đầu ngành Dược - Mỹ phẩm Đông Nam Á." },
          { icon: HeartHandshake, t: "Giá trị", d: "Chính trực, khoa học, lấy hiệu quả khách hàng làm trọng tâm." },
          { icon: Award, t: "Cam kết", d: "Chất lượng chuẩn GMP, nguồn gốc minh bạch, hỗ trợ tận tâm." },
        ]
      : [
          { icon: Target, t: "Mission", d: "Bringing the world's best ingredients and technology to Vietnamese businesses." },
          { icon: Eye, t: "Vision", d: "Becoming the leading R&D partner in Southeast Asia's Pharma-Cosmetic industry." },
          { icon: HeartHandshake, t: "Values", d: "Integrity, science, and a relentless focus on customer outcomes." },
          { icon: Award, t: "Commitment", d: "GMP-grade quality, transparent sourcing, dedicated support." },
        ];

  return (
    <>
      <PageHeader
        locale={locale}
        eyebrow={t.nav.about}
        title={
          locale === "vi"
            ? "Khoa học vì những sản phẩm tốt hơn"
            : "Science for better products"
        }
        description={
          locale === "vi"
            ? "Công ty Cổ phần Bioscope Việt Nam là cầu nối giữa nguyên liệu cao cấp toàn cầu và doanh nghiệp sản xuất trong nước, với năng lực R&D công nghệ nano độc quyền."
            : "Bioscope Vietnam JSC bridges premium global ingredients and domestic manufacturers, powered by proprietary nano R&D capability."
        }
        breadcrumbs={[{ label: t.nav.about }]}
      />

      {/* Story */}
      <section className="container-bs py-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="relative aspect-[4/3] overflow-hidden rounded-xl border border-neutral-200 shadow-card">
            <Image
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80"
              alt="Bioscope lab"
              fill
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover"
            />
          </Reveal>
          <Reveal delay={120}>
            <SectionHeading
              eyebrow={locale === "vi" ? "Câu chuyện của chúng tôi" : "Our story"}
              title={
                locale === "vi"
                  ? "Hơn một nhà cung cấp — một đối tác đổi mới"
                  : "More than a supplier — an innovation partner"
              }
            />
            <div className="mt-5 space-y-4 leading-relaxed text-neutral-700">
              <p>
                {locale === "vi"
                  ? "Được thành lập bởi đội ngũ chuyên gia trong ngành dược và công nghệ sinh học, Bioscope không chỉ nhập khẩu và phân phối nguyên liệu, mà còn tự nghiên cứu các nền tảng công nghệ nano độc quyền để nâng cao hiệu quả sản phẩm."
                  : "Founded by experts in pharmaceuticals and biotechnology, Bioscope not only imports and distributes ingredients but also develops proprietary nano technology platforms to enhance product efficacy."}
              </p>
              <p>
                {locale === "vi"
                  ? "Chúng tôi tin rằng một sản phẩm tốt bắt đầu từ nguyên liệu tốt và công thức khoa học. Đó là lý do mỗi nguyên liệu đều được chuẩn hóa, kiểm định và đồng hành cùng giải pháp công thức phù hợp."
                  : "We believe great products start with great ingredients and scientific formulation. That's why every ingredient is standardised, verified and paired with the right formulation solution."}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-hero-gradient">
        <div className="container-bs grid grid-cols-2 gap-8 py-14 lg:grid-cols-4">
          {certifications.map((c) => (
            <div key={c.value} className="text-center text-white">
              <CountUp
                value={c.value}
                className="font-heading text-4xl font-extrabold sm:text-5xl"
              />
              <div className="mt-1 text-sm text-white/80">
                {pick(c.suffix, locale)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="container-bs py-20">
        <SectionHeading
          align="center"
          eyebrow={locale === "vi" ? "Định hướng" : "What drives us"}
          title={
            locale === "vi" ? "Giá trị cốt lõi" : "Our core values"
          }
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <Reveal key={v.t} delay={i * 80}>
                <div className="h-full rounded-xl border border-neutral-200 bg-white p-7 text-center shadow-card">
                  <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary-tint text-primary-dark">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-bold">{v.t}</h3>
                  <p className="mt-2 text-sm text-neutral-500">{v.d}</p>
                </div>
              </Reveal>
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
