"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ArrowRight, User, Search } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { LangSwitcher } from "./lang-switcher";
import { Logo } from "./logo";

const SearchDialog = dynamic(
  () =>
    import("./search-dialog").then((mod) => ({ default: mod.SearchDialog })),
  {
    ssr: false,
    loading: () => (
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-700">
        <Search className="h-5 w-5" />
      </span>
    ),
  },
);

export function Header({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  /** Đầu trang: header thường chìm trong nền. Scroll xuống mới thành pill nổi. */
  const pillMode = scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  /* Đồng bộ padding main theo chiều cao header */
  useEffect(() => {
    const root = document.documentElement;
    const offset = pillMode ? "5.5rem" : "4rem";
    root.style.setProperty("--header-h", offset);
    return () => {
      root.style.removeProperty("--header-h");
    };
  }, [pillMode]);

  const p = (path: string) => `/${locale}${path}`;
  const nav = [
    { label: t.nav.about, href: p("/gioi-thieu") },
    { label: t.nav.ingredients, href: p("/nguyen-lieu") },
    { label: t.nav.technologies, href: p("/cong-nghe") },
    { label: t.nav.services, href: p("/dich-vu-odm") },
    { label: t.nav.blog, href: p("/blog") },
    { label: t.nav.contact, href: p("/lien-he") },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const iconBtn =
    "text-neutral-900 hover:bg-neutral-100 hover:text-neutral-900";

  const navLink = (active: boolean) =>
    active
      ? "text-primary-dark font-semibold"
      : "text-neutral-900 hover:bg-neutral-100 hover:text-neutral-900";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 w-full transition-all duration-300",
        !pillMode && "bg-transparent"
      )}
    >
      <div
        className={cn(
          "transition-all duration-300",
          pillMode ? "container-bs pt-8 sm:pt-10" : "pt-4 sm:pt-6"
        )}
      >
        <div
          className={cn(
            "relative flex items-center justify-between gap-3 transition-all duration-300",
            pillMode
              ? "h-14 rounded-full border border-neutral-200 bg-white py-1.5 pl-4 pr-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:h-[3.25rem] sm:pl-5 sm:pr-2"
              : "container-bs h-16 bg-transparent"
          )}
        >
          <Link href={p("")} aria-label="Bioscope Vietnam" className="shrink-0">
            <Logo />
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                  navLink(isActive(item.href))
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            <SearchDialog locale={locale} overDark={false} />
            <div className="hidden sm:block">
              <LangSwitcher locale={locale} overDark={false} />
            </div>
            <Link
              href={p("/b2b/login")}
              aria-label={t.cta.login}
              title={t.cta.login}
              className={cn(
                "hidden h-10 w-10 items-center justify-center rounded-full transition-colors sm:inline-flex",
                iconBtn
              )}
            >
              <User className="h-5 w-5" />
            </Link>
            <Link
              href={p("/lien-he")}
              className="ml-1 hidden items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-dark md:inline-flex"
            >
              {t.cta.contact}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors lg:hidden",
                iconBtn
              )}
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={open}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300 lg:hidden",
            pillMode ? "px-0" : "container-bs",
            open ? "mt-2 max-h-[32rem]" : "max-h-0"
          )}
        >
          <nav className="flex flex-col gap-1 rounded-2xl border border-neutral-200 bg-white p-3 shadow-card">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-medium",
                  isActive(item.href)
                    ? "bg-primary-tint text-primary-dark"
                    : "text-neutral-900 hover:bg-neutral-50"
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-neutral-200 px-1 pt-3">
              <LangSwitcher locale={locale} />
              <div className="flex items-center gap-2">
                <Link
                  href={p("/b2b/login")}
                  className="rounded-full px-3 py-2 text-sm font-medium text-neutral-900"
                >
                  {t.cta.login}
                </Link>
                <Link
                  href={p("/lien-he")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
                >
                  {t.cta.contact}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
