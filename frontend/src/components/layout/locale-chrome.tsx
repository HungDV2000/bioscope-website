"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import type { Locale } from "@/lib/utils";

const B2B_AUTH_RE = /\/b2b\/(login|register)\/?$/;

export function LocaleChrome({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const isB2bAuth = B2B_AUTH_RE.test(pathname);

  if (isB2bAuth) {
    return <>{children}</>;
  }

  return (
    <>
      <NavigationProgress />
      <Header locale={locale} />
      <main className="min-h-screen pt-[var(--header-h,5.5rem)]">{children}</main>
      <Footer locale={locale} />
      <ScrollToTop locale={locale} />
    </>
  );
}
