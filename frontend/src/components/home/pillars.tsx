import { Boxes, FlaskConical, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/lib/utils";

export function Pillars({ locale }: { locale: Locale }) {
  const items =
    locale === "vi"
      ? [
          {
            icon: Boxes,
            title: "Cung cấp nguyên liệu",
            desc: "Nhập khẩu & phân phối nguyên liệu cao cấp cho TPCN và Mỹ phẩm, nguồn gốc minh bạch từ các đối tác hàng đầu thế giới.",
            href: "/nguyen-lieu",
            cta: "Khám phá nguyên liệu",
            tone: "primary",
          },
          {
            icon: FlaskConical,
            title: "Phát triển công thức (ODM)",
            desc: "Nghiên cứu & phát triển công thức độc quyền, gia công sản xuất GMP và tư vấn công bố sản phẩm trọn gói.",
            href: "/dich-vu-odm",
            cta: "Tìm hiểu dịch vụ ODM",
            tone: "accent",
          },
        ]
      : [
          {
            icon: Boxes,
            title: "Ingredient Supply",
            desc: "Importing & distributing premium ingredients for supplements and cosmetics, transparently sourced from world-leading partners.",
            href: "/nguyen-lieu",
            cta: "Explore ingredients",
            tone: "primary",
          },
          {
            icon: FlaskConical,
            title: "Formulation Development (ODM)",
            desc: "Proprietary R&D formulation, GMP manufacturing and end-to-end product registration consultancy.",
            href: "/dich-vu-odm",
            cta: "Discover ODM services",
            tone: "accent",
          },
        ];

  return (
    <section className="container-bs -mt-16 relative z-10">
      <div className="grid gap-6 md:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;
          const accent = item.tone === "accent";
          return (
            <Link
              key={item.title}
              href={`/${locale}${item.href}`}
              className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div
                className={`inline-flex h-14 w-14 items-center justify-center rounded-xl ${
                  accent ? "bg-accent-tint text-accent-dark" : "bg-primary-tint text-primary-dark"
                }`}
              >
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mt-5 font-heading text-xl font-bold text-neutral-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                {item.desc}
              </p>
              <span
                className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold ${
                  accent ? "text-accent-dark" : "text-primary-dark"
                }`}
              >
                {item.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
