import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Locale } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  titleAccent,
  description,
  breadcrumbs,
  locale,
  compact = false,
}: {
  eyebrow?: string;
  /** Phần tiêu đề màu đậm (ink) */
  title: string;
  /** Phần tiêu đề màu primary — nối tiếp sau title */
  titleAccent?: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  locale: Locale;
  /** Kiểu editorial (trang chi tiết) */
  compact?: boolean;
}) {
  const homeLabel = locale === "vi" ? "Trang chủ" : "Home";

  if (compact) {
    return (
      <section className="border-b border-neutral-200 bg-white">
        <div className="container-bs py-10 sm:py-12 lg:py-14">
          {breadcrumbs && (
            <nav
              className="mb-5 flex flex-wrap items-center gap-1 text-xs text-neutral-400"
              aria-label="Breadcrumb"
            >
              <Link href={`/${locale}`} className="transition-colors hover:text-primary">
                {homeLabel}
              </Link>
              {breadcrumbs.map((bc, i) => (
                <span key={i} className="flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />
                  {bc.href ? (
                    <Link
                      href={bc.href}
                      className="transition-colors hover:text-primary"
                    >
                      {bc.label}
                    </Link>
                  ) : (
                    <span className="text-neutral-500">{bc.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}

          {eyebrow && compact && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary sm:text-xs">
              {eyebrow}
            </p>
          )}

          <h1
            className={cn(
              "max-w-3xl font-heading text-[1.5rem] font-bold leading-[1.25] tracking-tight text-balance sm:text-[1.75rem] lg:text-[2rem]",
              eyebrow && compact ? "mt-3" : "mt-0"
            )}
          >
            <span className="text-ink">{title}</span>
            {titleAccent && (
              <>
                {" "}
                <span className="text-primary">{titleAccent}</span>
              </>
            )}
          </h1>

          {description && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-500 sm:text-[15px]">
              {description}
            </p>
          )}
        </div>
      </section>
    );
  }

  /* Trang danh sách — editorial, cỡ chữ vừa phải */
  return (
    <section className="border-b border-neutral-200 bg-white">
      <div className="container-bs py-10 sm:py-12 lg:py-14">
        {breadcrumbs && (
          <nav
            className="mb-5 flex flex-wrap items-center gap-1 text-xs text-neutral-400"
            aria-label="Breadcrumb"
          >
            <Link href={`/${locale}`} className="transition-colors hover:text-primary">
              {homeLabel}
            </Link>
            {breadcrumbs.map((bc, i) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />
                {bc.href ? (
                  <Link href={bc.href} className="transition-colors hover:text-primary">
                    {bc.label}
                  </Link>
                ) : (
                  <span className="text-neutral-500">{bc.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        <h1 className="mt-0 max-w-3xl font-heading text-[1.5rem] font-bold leading-[1.25] tracking-tight text-balance sm:text-[1.75rem] lg:text-[2rem]">
          <span className="text-ink">{title}</span>
          {titleAccent && (
            <>
              {" "}
              <span className="text-primary">{titleAccent}</span>
            </>
          )}
        </h1>

        {description && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-500 sm:text-[15px]">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}

/** Tách "Tên thương hiệu (phần khoa học)" → lead + accent */
export function splitParenTitle(name: string): {
  title: string;
  titleAccent?: string;
} {
  const match = name.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (match) {
    return { title: match[1].trim(), titleAccent: match[2].trim() };
  }
  return { title: name };
}
