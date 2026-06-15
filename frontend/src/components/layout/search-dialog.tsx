"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  X,
  FlaskConical,
  Atom,
  FileText,
  CornerDownLeft,
} from "lucide-react";
import type { Locale } from "@/lib/utils";
import { pick, cn } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { ingredients, technologies, posts } from "@/lib/data";

type Kind = "ingredient" | "tech" | "post";
type Item = { label: string; sub: string; href: string; kind: Kind };

const ICONS: Record<Kind, typeof Search> = {
  ingredient: Atom,
  tech: FlaskConical,
  post: FileText,
};

export function SearchDialog({
  locale,
  overDark = false,
}: {
  locale: Locale;
  overDark?: boolean;
}) {
  const t = getDictionary(locale);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const index: Item[] = useMemo(() => {
    const p = (path: string) => `/${locale}${path}`;
    return [
      ...technologies.map((x) => ({
        label: pick(x.name, locale),
        sub: locale === "vi" ? "Công nghệ" : "Technology",
        href: p(`/cong-nghe/${x.slug}`),
        kind: "tech" as const,
      })),
      ...ingredients.map((x) => ({
        label: pick(x.name, locale),
        sub: `${x.brandName} · ${x.originCountry}`,
        href: p(`/nguyen-lieu/${x.slug}`),
        kind: "ingredient" as const,
      })),
      ...posts.map((x) => ({
        label: pick(x.title, locale),
        sub: "Bioneer's Blog",
        href: p(`/blog/${x.slug}`),
        kind: "post" as const,
      })),
    ];
  }, [locale]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index;
    return index.filter(
      (i) =>
        i.label.toLowerCase().includes(q) || i.sub.toLowerCase().includes(q)
    );
  }, [index, query]);

  // Mở: khoá scroll + focus ô nhập. Esc để đóng.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.clearTimeout(id);
    };
  }, [open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={t.common.searchPlaceholder}
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors",
          overDark
            ? "text-white/90 hover:bg-white/10 hover:text-white"
            : "text-neutral-700 hover:bg-primary-tint hover:text-primary-dark"
        )}
      >
        <Search className="h-5 w-5" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.common.searchPlaceholder}
          className="fixed inset-0 z-[70] flex items-start justify-center bg-ink/25 px-4 pt-24 backdrop-blur-md"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            {/* Ô tìm kiếm */}
            <div className="flex items-center gap-3 border-b border-neutral-200 px-4">
              <Search className="h-5 w-5 shrink-0 text-primary" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.common.searchPlaceholder}
                className="h-14 w-full bg-transparent text-base text-neutral-900 outline-none ring-0 placeholder:text-neutral-500 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <button
                onClick={() => setOpen(false)}
                aria-label="Đóng"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Kết quả */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-neutral-500">
                  {t.common.noResult}
                </p>
              ) : (
                <ul>
                  {results.map((item) => {
                    const Icon = ICONS[item.kind];
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-primary-tint"
                        >
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-50 text-primary-dark group-hover:bg-white">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-neutral-900">
                              {item.label}
                            </span>
                            <span className="block truncate text-xs text-neutral-500">
                              {item.sub}
                            </span>
                          </span>
                          <CornerDownLeft className="h-4 w-4 shrink-0 text-neutral-300 opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
