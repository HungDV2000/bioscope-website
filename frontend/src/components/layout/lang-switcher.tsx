"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { locales } from "@/lib/i18n";
import type { Locale } from "@/lib/utils";
import { cn } from "@/lib/utils";

const NAMES: Record<Locale, string> = {
  en: "English",
  vi: "Tiếng Việt",
};

const SHORT: Record<Locale, string> = {
  en: "EN",
  vi: "VI",
};

export function LangSwitcher({
  locale,
  overDark = false,
  compact = false,
}: {
  locale: Locale;
  overDark?: boolean;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const swapLocale = (target: Locale) => {
    const segments = pathname.split("/");
    segments[1] = target;
    return segments.join("/") || "/";
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Language"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-1.5 font-semibold transition-colors",
          compact
            ? "rounded-md border border-neutral-200 px-3.5 py-2 text-[13.5px] text-ink hover:border-neutral-300"
            : cn(
                "h-10 rounded-full px-2.5",
                overDark
                  ? "text-white/90 hover:bg-white/10 hover:text-white"
                  : "text-neutral-700 hover:bg-primary-tint hover:text-primary-dark"
              )
        )}
      >
        {compact ? (
          <>
            {SHORT[locale]}
            <ChevronDown className="h-3 w-3" />
          </>
        ) : (
          SHORT[locale]
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border border-neutral-200 bg-white p-1 shadow-lg"
        >
          {locales.map((loc) => (
            <Link
              key={loc}
              href={swapLocale(loc)}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                locale === loc
                  ? "bg-primary-tint font-medium text-primary-dark"
                  : "text-neutral-700 hover:bg-neutral-50"
              )}
            >
              {NAMES[loc]}
              {locale === loc && <Check className="h-4 w-4 text-primary" />}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
