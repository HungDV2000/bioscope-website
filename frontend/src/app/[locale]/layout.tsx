import { notFound } from "next/navigation";
import { LocaleChrome } from "@/components/layout/locale-chrome";
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

  return <LocaleChrome locale={locale}>{children}</LocaleChrome>;
}
