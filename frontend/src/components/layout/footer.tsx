import Link from "next/link";
import { MapPin, Phone, Mail, Globe, Facebook, Linkedin, Youtube } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/utils";
import { company } from "@/lib/company";
import { Logo } from "./logo";

export function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const p = (path: string) => `/${locale}${path}`;
  const year = new Date().getFullYear();

  const columns = [
    {
      title: t.footer.company,
      links: [
        { label: t.nav.about, href: p("/gioi-thieu") },
        { label: t.nav.careers, href: p("/tuyen-dung") },
        { label: t.nav.blog, href: p("/blog") },
        { label: t.nav.contact, href: p("/lien-he") },
      ],
    },
    {
      title: t.footer.products,
      links: [
        { label: t.common.supplement, href: p("/nguyen-lieu?type=supplement") },
        { label: t.common.cosmetic, href: p("/nguyen-lieu?type=cosmetic") },
        { label: t.nav.technologies, href: p("/cong-nghe") },
        { label: t.nav.services, href: p("/dich-vu-odm") },
      ],
    },
    {
      title: t.footer.support,
      links: [
        { label: t.nav.faq, href: p("/cau-hoi-thuong-gap") },
        { label: t.nav.privacy, href: p("/chinh-sach-bao-mat") },
        { label: t.cta.login, href: p("/b2b/login") },
      ],
    },
  ];

  return (
    <footer className="mt-24 bg-neutral-900 text-neutral-200">
      <div className="container-bs grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo variant="white" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-neutral-200/70">
            {t.footer.tagline}
          </p>
          <ul className="mt-6 space-y-3 text-sm text-neutral-200/80">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <span className="font-medium text-neutral-200/90">
                  {locale === "vi" ? "Trụ sở:" : "Head office:"}
                </span>{" "}
                {company.hqAddress}
              </span>
            </li>
            <li className="flex gap-3">
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <a href={company.hotlineHref} className="hover:text-white">
                {company.hotline}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              <a href={company.emailHref} className="hover:text-white">
                {company.email}
              </a>
            </li>
            <li className="flex gap-3">
              <Globe className="h-4 w-4 shrink-0 text-primary" />
              <a
                href={company.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                {company.website}
              </a>
            </li>
          </ul>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              {col.title}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-200/70 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-bs space-y-2 py-6">
          <p className="text-xs leading-relaxed text-neutral-200/60">
            {locale === "vi" ? "ĐKKD tại:" : "Business reg.:"} {company.regAddress}
          </p>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-xs text-neutral-200/60">
              © {year} {company.legalName}. {t.footer.rights} · MST:{" "}
              {company.taxId}
            </p>
            <div className="flex items-center gap-3">
              {[Facebook, Linkedin, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-neutral-200/70 transition-colors hover:bg-primary hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
