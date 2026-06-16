import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText, Tag, Headphones } from "lucide-react";
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

  const backLabel = locale === "vi" ? "Về trang chủ" : "Back to home";

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      {/* Panel trái — brand */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-hero-gradient px-8 py-10 text-white sm:px-12 lg:px-14 lg:py-12">
        <div className="pointer-events-none absolute inset-0 bg-mesh opacity-70" />
        <div
          className="pointer-events-none absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-accent/20 blur-3xl"
          aria-hidden
        />

        <div className="relative flex items-center justify-between gap-4">
          <Link href={`/${locale}`} className="inline-flex">
            <Logo variant="white" />
          </Link>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-medium text-white/90 transition hover:bg-white/20 lg:hidden"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backLabel}
          </Link>
        </div>

        <div className="relative my-10 lg:my-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/95">
            <ShieldCheck className="h-4 w-4" />
            {locale === "vi" ? "Cổng đối tác B2B" : "B2B Partner Portal"}
          </span>
          <h2 className="mt-6 max-w-lg font-heading text-[1.75rem] font-extrabold leading-tight text-white sm:text-3xl lg:text-[2rem]">
            {locale === "vi" ? (
              <>
                Quyền lợi dành riêng cho{" "}
                <span className="text-accent">đối tác doanh nghiệp</span>
              </>
            ) : (
              <>
                Exclusive benefits for{" "}
                <span className="text-accent">business partners</span>
              </>
            )}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 sm:text-[15px]">
            {locale === "vi"
              ? "Đăng nhập để truy cập tài liệu kỹ thuật, báo giá B2B và hỗ trợ từ đội ngũ Bioscope."
              : "Sign in to access technical documents, B2B quotes and support from the Bioscope team."}
          </p>
          <ul className="mt-8 hidden space-y-4 lg:block lg:space-y-5">
            {perks.map((perk) => {
              const Icon = perk.icon;
              return (
                <li
                  key={perk.t}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="font-semibold text-accent">{perk.t}</div>
                    <div className="text-sm text-white/75">{perk.d}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="relative hidden text-sm text-white/55 lg:block">
          © {new Date().getFullYear()} Bioscope Vietnam
        </p>
      </div>

      {/* Panel phải — form */}
      <div className="relative flex flex-col bg-gradient-to-br from-canvas via-white to-primary-tint/25 px-6 py-10 sm:px-10 lg:px-14 lg:py-12">
        <Link
          href={`/${locale}`}
          className="relative mb-8 hidden items-center gap-1.5 self-end text-sm font-medium text-neutral-500 transition hover:text-primary-dark lg:inline-flex"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>

        <div className="relative flex flex-1 flex-col justify-center">
          <div className="mx-auto w-full max-w-[26rem] rounded-2xl border border-neutral-200/80 bg-white p-8 shadow-[0_12px_48px_rgba(9,143,80,0.08)] sm:p-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
