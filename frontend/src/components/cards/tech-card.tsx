import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Technology } from "@/lib/types";
import type { Locale } from "@/lib/utils";
import { pick } from "@/lib/utils";

export function TechCard({
  tech,
  locale,
  index,
}: {
  tech: Technology;
  locale: Locale;
  index: number;
}) {
  return (
    <Link
      href={`/${locale}/cong-nghe/${tech.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div
        className="absolute right-0 top-0 h-32 w-32 -translate-y-12 translate-x-12 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20"
        style={{ background: tech.accent }}
      />
      <span
        className="font-heading text-5xl font-extrabold text-neutral-100"
        style={{ WebkitTextStroke: `1px ${tech.accent}33` }}
      >
        0{index + 1}
      </span>
      <h3 className="mt-4 font-heading text-xl font-bold text-neutral-900">
        {pick(tech.name, locale)}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-500">
        {pick(tech.tagline, locale)}
      </p>
      <div
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold"
        style={{ color: tech.accent }}
      >
        {locale === "vi" ? "Tìm hiểu công nghệ" : "Explore technology"}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
