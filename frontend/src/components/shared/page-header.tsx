import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  locale,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  locale: Locale;
}) {
  return (
    <section className="relative overflow-hidden border-b border-neutral-200 bg-neutral-50">
      <div className="absolute inset-0 bg-mesh opacity-60" />
      <div className="container-bs relative py-14 sm:py-20">
        {breadcrumbs && (
          <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-neutral-500">
            <Link href={`/${locale}`} className="hover:text-primary-dark">
              {locale === "vi" ? "Trang chủ" : "Home"}
            </Link>
            {breadcrumbs.map((bc, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5" />
                {bc.href ? (
                  <Link href={bc.href} className="hover:text-primary-dark">
                    {bc.label}
                  </Link>
                ) : (
                  <span className="text-neutral-700">{bc.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <Badge className="mb-4 uppercase">{eyebrow}</Badge>}
        <h1 className="max-w-3xl font-heading text-3xl font-extrabold leading-tight text-balance sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-500 sm:text-lg">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
