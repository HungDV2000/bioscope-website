import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { isLocale, locales } from "@/lib/i18n";
import type { Locale } from "@/lib/utils";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;

  return (
    <>
      <NavigationProgress />
      <Header locale={locale} />
      {/* pt-20 chừa chỗ cho header pill cố định; trang có hero tự kéo lên bằng -mt-20 */}
      <main className="min-h-screen pt-[var(--header-h,5.5rem)]">{children}</main>
      <Footer locale={locale} />
      <ScrollToTop locale={locale} />
    </>
  );
}
