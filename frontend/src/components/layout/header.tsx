"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FlaskConical } from "lucide-react";
import type { Locale } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { homeContent, pickL } from "@/lib/home-content";
import { LangSwitcher } from "./lang-switcher";
import { Logo } from "./logo";

const NAV_HREFS = [
  "/nguyen-lieu",
  "/dich-vu-odm",
  "/cong-nghe",
  "/gioi-thieu",
  "/gioi-thieu",
  "/blog",
  "/lien-he",
] as const;

export function Header({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const vi = locale === "vi";
  const nav = homeContent.header.nav;

  useEffect(() => setOpen(false), [pathname]);

  const p = (path: string) => `/${locale}${path}`;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const linkClass = (href: string) =>
    cn(
      "whitespace-nowrap text-[13px] font-medium transition-colors xl:text-[14.5px]",
      isActive(href) ? "text-primary" : "text-neutral-700 hover:text-primary"
    );

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white">
      <div className="container-bs flex h-[72px] items-center justify-between gap-4">
        <Link href={p("")} aria-label="Bioscope home" className="shrink-0">
          <Logo className="h-11" />
        </Link>

        {/* Desktop: links + CTA cùng một flex row (theo example — không đè Contact) */}
        <nav className="hidden min-w-0 flex-1 items-center justify-end gap-3 lg:flex xl:gap-5">
          {nav.map((item, i) => {
            const href = p(NAV_HREFS[i]);
            return (
              <Link key={item.en} href={href} className={linkClass(href)}>
                {vi ? item.vi : item.en}
              </Link>
            );
          })}
          <div className="ml-1 flex shrink-0 items-center gap-2.5 pl-3 xl:ml-2 xl:pl-4">
            <Link
              href={p("/lien-he")}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#0c7344] xl:px-[18px] xl:text-[13.5px]"
            >
              {pickL(homeContent.header.requestSample, locale)}
              <FlaskConical className="h-4 w-4 shrink-0" />
            </Link>
            <LangSwitcher locale={locale} compact />
          </div>
        </nav>

        {/* Mobile */}
        <div className="flex shrink-0 items-center gap-2.5 lg:hidden">
          <LangSwitcher locale={locale} compact />
          <button
            type="button"
            className={cn(
              "relative flex h-8 w-8 shrink-0 flex-col items-center justify-center gap-[5px]",
              open && "is-open"
            )}
            onClick={() => setOpen((v) => !v)}
            aria-label={vi ? "Mở menu" : "Open menu"}
            aria-expanded={open}
          >
            <span
              className={cn(
                "block h-0.5 w-full rounded-sm bg-ink transition-transform",
                open && "translate-y-[7px] rotate-45"
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-full rounded-sm bg-ink transition-opacity",
                open && "opacity-0"
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-full rounded-sm bg-ink transition-transform",
                open && "-translate-y-[7px] -rotate-45"
              )}
            />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-neutral-100 bg-white transition-all duration-300 lg:hidden",
          open ? "max-h-[34rem]" : "max-h-0 border-t-0"
        )}
      >
        <nav className="container-bs flex flex-col gap-1 py-4">
          {nav.map((item, i) => {
            const href = p(NAV_HREFS[i]);
            return (
              <Link
                key={item.en}
                href={href}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm font-medium",
                  isActive(href)
                    ? "bg-primary-tint text-primary"
                    : "text-ink hover:bg-neutral-50"
                )}
              >
                {vi ? item.vi : item.en}
              </Link>
            );
          })}
          <Link
            href={p("/lien-he")}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0c7344]"
          >
            {pickL(homeContent.header.requestSample, locale)}
            <FlaskConical className="h-4 w-4" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
