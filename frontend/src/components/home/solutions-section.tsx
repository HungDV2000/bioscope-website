import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

type SolutionCard = {
  badge: string;
  title: string;
  tags: string[];
  stats: string;
  cta: string;
  href: string;
  image: string;
  overlay: string;
  badgeBg: string;
};

export function SolutionsSection({ locale }: { locale: Locale }) {
  const isVi = locale === "vi";

  const items: SolutionCard[] = isVi
    ? [
        {
          badge: "NGUYÊN LIỆU CAO CẤP",
          title:
            "Tuyển chọn nguyên liệu chuẩn hóa cho TPCN & Mỹ phẩm, nguồn gốc minh bạch.",
          tags: ["TPCN", "Mỹ phẩm", "COA / Spec"],
          stats: "150+ đối tác toàn cầu · Nhật · EU · Mỹ",
          cta: "Khám phá nguyên liệu",
          href: "/nguyen-lieu",
          image: img("photo-1607619056574-7b8d3ee536b2"),
          overlay: "from-primary-deep/95 via-primary-dark/80 to-primary/40",
          badgeBg: "bg-primary-dark",
        },
        {
          badge: "DỊCH VỤ ODM",
          title:
            "Nghiên cứu công thức, gia công GMP và tư vấn công bố sản phẩm trọn gói.",
          tags: ["R&D", "GMP", "Công bố sản phẩm"],
          stats: "23 dự án R&D · Từ ý tưởng đến thị trường",
          cta: "Tìm hiểu dịch vụ ODM",
          href: "/dich-vu-odm",
          image: img("photo-1570172619644-dfd03ed5d881"),
          overlay: "from-[#0A2E4A]/95 via-[#0D4A6E]/75 to-primary-dark/50",
          badgeBg: "bg-[#0D4A6E]",
        },
        {
          badge: "CÔNG NGHỆ NANO",
          title:
            "Nền tảng vận chuyển hoạt chất độc quyền — nâng sinh khả dụng lên nhiều lần.",
          tags: ["Novaskin™", "Phytosome", "Liposome"],
          stats: "4 công nghệ độc quyền · 14 bằng sáng chế",
          cta: "Xem công nghệ",
          href: "/cong-nghe",
          image: img("photo-1532187863486-abf9dbad1b69"),
          overlay: "from-[#2A1A0E]/95 via-accent-dark/70 to-primary-deep/45",
          badgeBg: "bg-accent-dark",
        },
      ]
    : [
        {
          badge: "PREMIUM INGREDIENTS",
          title:
            "Curated, standardised ingredients for supplements & cosmetics with transparent sourcing.",
          tags: ["Supplements", "Cosmetics", "COA / Spec"],
          stats: "150+ global partners · Japan · EU · US",
          cta: "Explore ingredients",
          href: "/nguyen-lieu",
          image: img("photo-1607619056574-7b8d3ee536b2"),
          overlay: "from-primary-deep/95 via-primary-dark/80 to-primary/40",
          badgeBg: "bg-primary-dark",
        },
        {
          badge: "ODM SERVICES",
          title:
            "Formulation R&D, GMP manufacturing and end-to-end product registration consultancy.",
          tags: ["R&D", "GMP", "Registration"],
          stats: "23 R&D projects · From concept to market",
          cta: "Discover ODM services",
          href: "/dich-vu-odm",
          image: img("photo-1570172619644-dfd03ed5d881"),
          overlay: "from-[#0A2E4A]/95 via-[#0D4A6E]/75 to-primary-dark/50",
          badgeBg: "bg-[#0D4A6E]",
        },
        {
          badge: "NANO TECHNOLOGY",
          title:
            "Proprietary active delivery platforms — multiplying bioavailability.",
          tags: ["Novaskin™", "Phytosome", "Liposome"],
          stats: "4 proprietary platforms · 14 patents",
          cta: "View technologies",
          href: "/cong-nghe",
          image: img("photo-1532187863486-abf9dbad1b69"),
          overlay: "from-[#2A1A0E]/95 via-accent-dark/70 to-primary-deep/45",
          badgeBg: "bg-accent-dark",
        },
      ];

  return (
    <section className="pb-section">
      {/* Tiêu đề — nền trắng, không band màu */}
      <div className="container-bs py-12 sm:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <span className="lab-label justify-center">
            {isVi ? "Giải pháp toàn diện" : "End-to-end solutions"}
          </span>
          <h2 className="mt-4 text-2xl font-bold leading-tight text-balance text-ink sm:text-[1.75rem]">
            {isVi
              ? "Mỗi ngành có thách thức riêng về công thức và quy định."
              : "Each industry has its own formulation and regulatory challenges."}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-500 sm:text-base">
            {isVi
              ? "Bioscope đồng hành từ nguyên liệu đến công nghệ và ODM."
              : "Bioscope partners from ingredients through technology to ODM."}
          </p>
        </div>
      </div>

      <div className="container-bs pb-4">
        <div className="grid gap-5 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.href} delay={i * 80}>
              <Link
                href={`/${locale}${item.href}`}
                className="group relative flex min-h-[400px] flex-col overflow-hidden rounded-2xl border border-neutral-200/60 transition-transform duration-300 hover:-translate-y-1"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width:1024px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${item.overlay}`}
                  aria-hidden
                />

                <div className="relative flex flex-1 flex-col p-6 text-white">
                  <span
                    className={`inline-flex w-fit rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white ${item.badgeBg}`}
                  >
                    {item.badge}
                  </span>

                  <h3 className="mt-5 flex-1 font-heading text-lg font-bold leading-snug text-balance text-white sm:text-xl">
                    {item.title}
                  </h3>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded border border-white/30 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="mt-4 text-xs text-white/80">{item.stats}</p>

                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white transition-opacity group-hover:text-white/90">
                    {item.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
