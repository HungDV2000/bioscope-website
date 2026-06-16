import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, FlaskConical, Globe2, ShieldCheck, Users } from "lucide-react";
import type { Locale } from "@/lib/utils";
import { pick } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { certifications, partners } from "@/lib/data";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { CountUp } from "@/components/ui/count-up";
import { CtaBand } from "@/components/shared/cta-band";
import { RichContentLayout } from "@/components/shared/rich-content";
import type { ContentSection } from "@/lib/types";

const PRIMARY = "#098F50";
const ACCENT = "#F68C36";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description:
    "Công ty Cổ phần Bioscope Việt Nam — đối tác tin cậy về nguyên liệu và giải pháp công thức cho ngành Dược, TPCN và Mỹ phẩm.",
};

function aboutSections(): ContentSection[] {
  const sections: ContentSection[] = [
    {
      id: "journey",
      level: 2,
      title: { vi: "Hành trình phát triển", en: "Our journey" },
      paragraphs: [
        {
          vi: "Bioscope Việt Nam được thành lập bởi đội ngũ chuyên gia có hơn 15 năm kinh nghiệm trong ngành dược phẩm, thực phẩm chức năng và mỹ phẩm. Xuất phát điểm là nhà phân phối nguyên liệu nhập khẩu, chúng tôi nhanh chóng nhận ra rằng thị trường Việt Nam cần nhiều hơn một nhà cung cấp — cần một đối tác có năng lực khoa học thực sự.",
          en: "Bioscope Vietnam was founded by experts with over 15 years in pharmaceuticals, dietary supplements and cosmetics. Starting as an imported ingredient distributor, we quickly recognised that the Vietnamese market needed more than a supplier — it needed a partner with genuine scientific capability.",
        },
        {
          vi: "Từ năm 2018, Bioscope đầu tư phòng thí nghiệm R&D và phát triển bốn nền tảng công nghệ nano độc quyền. Song song đó, mạng lưới đối tác toàn cầu được mở rộng tại Nhật Bản, Thụy Sĩ, Argentina và châu Âu, mang về hơn 50 nguyên liệu chuẩn hóa phục vụ thị trường nội địa.",
          en: "Since 2018, Bioscope has invested in R&D laboratories and developed four proprietary nano technology platforms. In parallel, our global partner network expanded across Japan, Switzerland, Argentina and Europe, bringing 50+ standardised ingredients to the domestic market.",
        },
      ],
    },
    {
      id: "capabilities",
      level: 2,
      title: { vi: "Năng lực cốt lõi", en: "Core capabilities" },
      paragraphs: [
        {
          vi: "Chúng tôi kết hợp ba trụ cột: (1) tuyển chọn và nhập khẩu nguyên liệu cao cấp có COA đầy đủ; (2) nghiên cứu và ứng dụng công nghệ bào chế nano; (3) dịch vụ ODM trọn gói từ công thức đến công bố sản phẩm. Mô hình này giúp doanh nghiệp Việt rút ngắn thời gian ra mắt sản phẩm và giảm rủi ro kỹ thuật.",
          en: "We combine three pillars: (1) sourcing and importing premium ingredients with full COAs; (2) researching and applying nano formulation technology; (3) end-to-end ODM from formula to product notification. This model helps Vietnamese businesses shorten time-to-market and reduce technical risk.",
        },
      ],
    },
    {
      id: "quality",
      level: 2,
      title: { vi: "Cam kết chất lượng", en: "Quality commitment" },
      paragraphs: [
        {
          vi: "Mọi nguyên liệu đều trải qua quy trình đánh giá nhà cung cấp (vendor qualification), kiểm tra COA và lưu mẫu đối chứng. Đối với công thức ODM, Bioscope làm việc với các nhà máy đạt chuẩn GMP, ISO 22000 và HACCP, đảm bảo chuỗi sản xuất minh bạch từ đầu vào đến thành phẩm.",
          en: "Every ingredient undergoes vendor qualification, COA verification and reference sample retention. For ODM formulas, Bioscope works with GMP, ISO 22000 and HACCP-certified factories, ensuring a transparent chain from input to finished product.",
        },
        {
          vi: "Đội ngũ QA/QC và regulatory hỗ trợ đối tác xây dựng hồ sơ công bố sản phẩm, claim khoa học có căn cứ và tài liệu kỹ thuật cho kênh B2B.",
          en: "Our QA/QC and regulatory team supports partners in building notification dossiers, evidence-based claims and B2B technical documentation.",
        },
      ],
    },
    {
      id: "partners",
      level: 3,
      title: { vi: "Mạng lưới đối tác toàn cầu", en: "Global partner network" },
      paragraphs: [
        {
          vi: `Bioscope hợp tác với các nhà sản xuất hàng đầu như DSM, Rousselot, Yaizu Suisankagaku và nhiều đối tác châu Âu. Danh mục bao gồm ${partners.length}+ thương hiệu nguyên liệu được tin dùng trên thế giới.`,
          en: `Bioscope partners with leading manufacturers including DSM, Rousselot, Yaizu Suisankagaku and many European suppliers. Our portfolio includes ${partners.length}+ globally trusted ingredient brands.`,
        },
      ],
    },
    {
      id: "future",
      level: 2,
      title: { vi: "Định hướng tương lai", en: "Looking ahead" },
      paragraphs: [
        {
          vi: "Chúng tôi tiếp tục đầu tư vào R&D công nghệ vận chuyển hoạt chất, mở rộng danh mục nguyên liệu xanh và bền vững, đồng thời xây dựng cổng thông tin B2B giúp đối tác truy cập COA, spec sheet và báo giá theo thời gian thực.",
          en: "We continue investing in active delivery R&D, expanding our green and sustainable ingredient portfolio, and building a B2B portal for real-time COA, spec sheet and quote access.",
        },
      ],
    },
  ];
  return sections;
}

export default function AboutPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const t = getDictionary(locale);

  const values =
    locale === "vi"
      ? [
          { t: "Sứ mệnh", d: "Mang nguyên liệu và công nghệ tốt nhất thế giới đến doanh nghiệp Việt.", href: "/nguyen-lieu" },
          { t: "Tầm nhìn", d: "Trở thành đối tác R&D hàng đầu ngành Dược - Mỹ phẩm Đông Nam Á.", href: "/cong-nghe" },
          { t: "Giá trị", d: "Chính trực, khoa học, lấy hiệu quả khách hàng làm trọng tâm.", href: "/dich-vu-odm" },
          { t: "Cam kết", d: "Chất lượng chuẩn GMP, nguồn gốc minh bạch, hỗ trợ tận tâm.", href: "/lien-he" },
        ]
      : [
          { t: "Mission", d: "Bringing the world's best ingredients and technology to Vietnamese businesses.", href: "/nguyen-lieu" },
          { t: "Vision", d: "Becoming the leading R&D partner in Southeast Asia's Pharma-Cosmetic industry.", href: "/cong-nghe" },
          { t: "Values", d: "Integrity, science, and a relentless focus on customer outcomes.", href: "/dich-vu-odm" },
          { t: "Commitment", d: "GMP-grade quality, transparent sourcing, dedicated support.", href: "/lien-he" },
        ];

  const capabilities =
    locale === "vi"
      ? [
          { icon: Globe2, t: "Nguyên liệu nhập khẩu", d: "50+ nguyên liệu chuẩn hóa từ đối tác toàn cầu, COA đầy đủ." },
          { icon: FlaskConical, t: "R&D công nghệ nano", d: "4 nền tảng độc quyền: Novaskin, Phytosome, Lipodisq, Liposome." },
          { icon: ShieldCheck, t: "Tuân thủ & QA/QC", d: "Vendor qualification, kiểm nghiệm lô và hỗ trợ công bố." },
          { icon: Users, t: "Dịch vụ ODM", d: "Từ briefing đến sản xuất GMP và ra mắt thị trường." },
        ]
      : [
          { icon: Globe2, t: "Imported ingredients", d: "50+ standardised ingredients from global partners with full COAs." },
          { icon: FlaskConical, t: "Nano R&D", d: "4 proprietary platforms: Novaskin, Phytosome, Lipodisq, Liposome." },
          { icon: ShieldCheck, t: "Compliance & QA/QC", d: "Vendor qualification, batch testing and notification support." },
          { icon: Users, t: "ODM services", d: "From briefing to GMP manufacturing and market launch." },
        ];

  const milestones =
    locale === "vi"
      ? [
          { year: "2015", t: "Thành lập Bioscope Việt Nam" },
          { year: "2018", t: "Khởi động phòng lab R&D" },
          { year: "2020", t: "Ra mắt Novaskin™" },
          { year: "2023", t: "Mở rộng dịch vụ ODM trọn gói" },
          { year: "2026", t: "50+ đối tác nguyên liệu toàn cầu" },
        ]
      : [
          { year: "2015", t: "Bioscope Vietnam founded" },
          { year: "2018", t: "R&D laboratory launched" },
          { year: "2020", t: "Novaskin™ introduced" },
          { year: "2023", t: "Full ODM service expansion" },
          { year: "2026", t: "50+ global ingredient partners" },
        ];

  const qualityPoints =
    locale === "vi"
      ? [
          "Đánh giá & phê duyệt nhà cung cấp (AVL)",
          "Kiểm tra COA mỗi lô nhập",
          "Lưu mẫu đối chứng tối thiểu 24 tháng",
          "Hợp tác nhà máy GMP / ISO 22000",
          "Hỗ trợ hồ sơ công bố TPCN & mỹ phẩm",
          "Tài liệu kỹ thuật song ngữ Việt-Anh",
        ]
      : [
          "Vendor assessment & approval (AVL)",
          "COA verification on every inbound batch",
          "Reference samples retained for 24+ months",
          "GMP / ISO 22000 manufacturing partners",
          "Supplement & cosmetic notification support",
          "Bilingual Vietnamese-English technical docs",
        ];

  const aboutLead = {
    vi: "Bioscope không chỉ cung cấp nguyên liệu — chúng tôi đồng hành cùng doanh nghiệp trong toàn bộ hành trình từ ý tưởng sản phẩm đến ra mắt thị trường, với nền tảng khoa học vững chắc và chuỗi cung ứng minh bạch.",
    en: "Bioscope doesn't just supply ingredients — we partner with businesses through the entire journey from product idea to market launch, with a solid scientific foundation and transparent supply chain.",
  };

  return (
    <>
      <PageHeader
        locale={locale}
        title={locale === "vi" ? "Khoa học vì những" : "Science for"}
        titleAccent={locale === "vi" ? "sản phẩm tốt hơn" : "better products"}
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
              <p>
                {locale === "vi"
                  ? "Với hơn 200 khách hàng doanh nghiệp trên toàn quốc — từ startup mỹ phẩm đến nhà máy TPCN quy mô lớn — Bioscope đã trở thành điểm đến tin cậy cho cả nguyên liệu đầu vào lẫn giải pháp phát triển sản phẩm trọn gói."
                  : "With 200+ corporate clients nationwide — from cosmetic startups to large-scale supplement manufacturers — Bioscope has become a trusted destination for both raw materials and end-to-end product development."}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-y border-neutral-200 bg-neutral-50 py-16 sm:py-20">
        <div className="container-bs">
          <SectionHeading
            align="center"
            eyebrow={locale === "vi" ? "Năng lực" : "Capabilities"}
            title={locale === "vi" ? "Giải pháp toàn diện cho doanh nghiệp" : "End-to-end solutions for business"}
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((c, i) => {
              const Icon = c.icon;
              return (
                <Reveal key={c.t} delay={i * 70}>
                  <div className="h-full rounded-xl border border-neutral-200 bg-white p-6">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary-tint text-primary-dark">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-heading text-base font-bold text-ink">{c.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-500">{c.d}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="border-y border-primary/10 bg-gradient-to-b from-primary-tint/30 via-primary-tint/10 to-white py-20 sm:py-24">
        <div className="container-bs">
          <SectionHeading
            align="center"
            className="max-w-3xl"
            eyebrow={locale === "vi" ? "Cột mốc" : "Milestones"}
            title={locale === "vi" ? "Hành trình 10 năm" : "A decade of growth"}
            description={
              locale === "vi"
                ? "Từ nhà phân phối nguyên liệu đến đối tác R&D và ODM công nghệ nano tại Việt Nam."
                : "From ingredient distribution to nano R&D and ODM partnership in Vietnam."
            }
          />

          <div className="mt-14 lg:mt-16">
            {/* Hàng chấm + đường nối — desktop */}
            <div className="relative mb-5 hidden lg:grid lg:grid-cols-5 lg:gap-5">
              <div
                className="pointer-events-none absolute left-[8%] right-[8%] top-1/2 h-px -translate-y-1/2 bg-primary/25"
                aria-hidden
              />
              {milestones.map((m, i) => {
                const isLast = i === milestones.length - 1;
                return (
                <div key={`dot-${m.year}`} className="flex justify-center">
                  <span
                    className={`relative z-10 h-3.5 w-3.5 rounded-full border-2 bg-white ${
                      isLast
                        ? "border-accent shadow-[0_0_0_4px_rgba(246,140,54,0.15)]"
                        : "border-primary shadow-[0_0_0_4px_rgba(9,143,80,0.1)]"
                    }`}
                    aria-hidden
                  />
                </div>
              );
              })}
            </div>

            <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
              {milestones.map((m, i) => {
                const isLast = i === milestones.length - 1;
                return (
                <Reveal key={m.year} as="li" delay={i * 70} className="h-full">
                  <div
                    className={`group flex h-full min-h-[10.5rem] flex-col rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-[0_8px_32px_rgba(9,143,80,0.06)] transition duration-300 hover:-translate-y-0.5 sm:min-h-[11rem] sm:p-6 lg:text-center ${
                      isLast
                        ? "hover:border-accent/30 hover:shadow-[0_14px_40px_rgba(246,140,54,0.12)]"
                        : "hover:border-primary/25 hover:shadow-[0_14px_40px_rgba(9,143,80,0.1)]"
                    }`}
                  >
                    <span
                      className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-[0.14em] lg:mx-auto ${
                        isLast
                          ? "bg-accent-tint text-accent-dark"
                          : "bg-primary-tint text-primary-dark"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p
                      className={`mt-3 font-heading text-[1.75rem] font-bold leading-none sm:text-3xl ${
                        isLast ? "text-accent" : "text-primary"
                      }`}
                    >
                      {m.year}
                    </p>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-600 sm:text-[15px]">
                      {m.t}
                    </p>
                  </div>
                </Reveal>
              );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* Quality */}
      <section className="bg-primary-tint/25 py-16 sm:py-20">
        <div className="container-bs grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <SectionHeading
              eyebrow={locale === "vi" ? "Chất lượng" : "Quality"}
              title={locale === "vi" ? "Tuân thủ & minh bạch" : "Compliance & transparency"}
              description={
                locale === "vi"
                  ? "Hệ thống quản lý chất lượng của Bioscope được xây dựng theo tinh thần GMP, áp dụng xuyên suốt từ đánh giá nhà cung cấp đến bàn giao sản phẩm."
                  : "Bioscope's quality management system is built on GMP principles, applied from vendor assessment through to product handover."
              }
            />
          </Reveal>
          <Reveal delay={100}>
            <ul className="grid gap-3 sm:grid-cols-2">
              {qualityPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 rounded-lg border border-primary/10 bg-white px-4 py-3 text-sm text-neutral-700"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {point}
                </li>
              ))}
            </ul>
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

      {/* Long-form about + TOC */}
      <RichContentLayout
        lead={aboutLead}
        sections={aboutSections()}
        locale={locale}
        className="border-t-0 bg-white"
        showToc={false}
        wide
      />

      {/* Values */}
      <section className="container-bs py-20">
        <SectionHeading
          align="center"
          eyebrow={locale === "vi" ? "Định hướng" : "What drives us"}
          title={locale === "vi" ? "Giá trị cốt lõi" : "Our core values"}
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => {
            const color = i === 2 ? ACCENT : PRIMARY;
            return (
              <Reveal key={v.t} delay={i * 80}>
                <Link
                  href={`/${locale}${v.href}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-current"
                  style={{ color }}
                >
                  <div
                    className="absolute right-0 top-0 h-32 w-32 -translate-y-12 translate-x-12 rounded-full opacity-[0.08] blur-2xl transition-opacity group-hover:opacity-20"
                    style={{ background: color }}
                  />
                  <span
                    className="font-heading text-5xl font-extrabold leading-none"
                    style={{ color }}
                  >
                    0{i + 1}
                  </span>
                  <h3 className="mt-4 font-heading text-xl font-bold text-neutral-900">
                    {v.t}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-500">
                    {v.d}
                  </p>
                  <div
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color }}
                  >
                    {locale === "vi" ? "Tìm hiểu thêm" : "Learn more"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
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
