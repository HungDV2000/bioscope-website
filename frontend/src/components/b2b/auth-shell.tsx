import Link from "next/link";
import { ShieldCheck, FileText, Tag, Headphones } from "lucide-react";
import type { Locale } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";

export function AuthShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const perks =
    locale === "vi"
      ? [
          { icon: FileText, t: "Tài liệu kỹ thuật", d: "COA, spec sheet, MSDS đầy đủ" },
          { icon: Tag, t: "Báo giá ưu đãi", d: "Giá B2B & chính sách riêng" },
          { icon: Headphones, t: "Hỗ trợ chuyên biệt", d: "Đội ngũ kỹ thuật đồng hành" },
        ]
      : [
          { icon: FileText, t: "Technical documents", d: "Full COA, spec sheets, MSDS" },
          { icon: Tag, t: "Preferred pricing", d: "B2B pricing & dedicated terms" },
          { icon: Headphones, t: "Dedicated support", d: "A technical team by your side" },
        ];

  return (
    <section className="grid min-h-[calc(100vh-4.5rem)] lg:grid-cols-2">
      {/* Left — brand panel */}
      <div className="relative hidden overflow-hidden bg-hero-gradient p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-mesh opacity-60" />
        <Link href={`/${locale}`} className="relative">
          <Logo variant="white" />
        </Link>
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase">
            <ShieldCheck className="h-4 w-4" />
            {locale === "vi" ? "Cổng đối tác B2B" : "B2B Partner Portal"}
          </span>
          <h2 className="mt-6 max-w-md font-heading text-3xl font-extrabold leading-tight">
            {locale === "vi"
              ? "Quyền lợi dành riêng cho đối tác doanh nghiệp"
              : "Exclusive benefits for business partners"}
          </h2>
          <ul className="mt-8 space-y-5">
            {perks.map((perk) => {
              const Icon = perk.icon;
              return (
                <li key={perk.t} className="flex gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="font-semibold">{perk.t}</div>
                    <div className="text-sm text-white/75">{perk.d}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="relative text-sm text-white/60">
          © {new Date().getFullYear()} Bioscope Vietnam
        </p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </section>
  );
}
