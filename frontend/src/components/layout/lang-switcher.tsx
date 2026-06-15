"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales } from "@/lib/i18n";
import type { Locale } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function LangSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  const swapLocale = (target: Locale) => {
    const segments = pathname.split("/");
    segments[1] = target;
    return segments.join("/") || "/";
  };

  return (
    <div className="flex items-center rounded-full border border-neutral-200 p-0.5">
      {locales.map((loc) => (
        <Link
          key={loc}
          href={swapLocale(loc)}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition-colors",
            locale === loc
              ? "bg-primary text-white"
              : "text-neutral-500 hover:text-primary-dark"
          )}
        >
          {loc}
        </Link>
      ))}
    </div>
  );
}
