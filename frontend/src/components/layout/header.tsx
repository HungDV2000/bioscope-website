"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown, LogIn } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { LangSwitcher } from "./lang-switcher";
import { Logo } from "./logo";

export function Header({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

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

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-neutral-200 bg-white/90 backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <div className="container-bs flex h-18 items-center justify-between gap-4 py-3">
        <Link href={p("")} aria-label="Bioscope Vietnam">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "text-primary-dark"
                  : "text-neutral-700 hover:text-primary-dark"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <LangSwitcher locale={locale} />
          </div>
          <Link
            href={p("/b2b/login")}
            className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-card md:inline-flex"
          >
            <LogIn className="h-4 w-4" />
            {t.cta.login}
          </Link>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-50 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-neutral-200 bg-white transition-all duration-300 lg:hidden",
          open ? "max-h-[28rem]" : "max-h-0 border-t-0"
        )}
      >
        <nav className="container-bs flex flex-col gap-1 py-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2.5 text-sm font-medium",
                isActive(item.href)
                  ? "bg-primary-tint text-primary-dark"
                  : "text-neutral-700"
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-4">
            <LangSwitcher locale={locale} />
            <Link
              href={p("/b2b/login")}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              <LogIn className="h-4 w-4" />
              {t.cta.login}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
