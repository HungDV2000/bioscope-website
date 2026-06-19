import Link from "next/link";
import { Phone, Mail, MapPin, Send, Linkedin, Youtube } from "lucide-react";
import type { Locale } from "@/lib/utils";
import { homeContent, pickL } from "@/lib/home-content";
import { Logo } from "./logo";

const COMPANY_HREFS = ["/gioi-thieu", "/gioi-thieu", "/gioi-thieu", "/blog", "/tuyen-dung"] as const;
const INGREDIENT_HREFS = ["/nguyen-lieu", "/nguyen-lieu", "/nguyen-lieu", "/nguyen-lieu", "/nguyen-lieu"] as const;
const SUPPORT_HREFS = ["/lien-he", "/lien-he", "/lien-he", "/cau-hoi-thuong-gap", "/blog"] as const;

export function Footer({ locale }: { locale: Locale }) {
  const vi = locale === "vi";
  const p = (path: string) => `/${locale}${path}`;
  const year = new Date().getFullYear();
  const c = homeContent.footer;

  return (
    <footer className="bg-primary-deep text-white/80">
      <div className="container-bs grid gap-7 py-14 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_1.2fr]">
        <div>
          <Link href={p("")}>
            <Logo variant="white" />
          </Link>
          <p className="mt-3.5 max-w-[240px] text-[13px] leading-relaxed text-white/65">
            {pickL(c.description, locale)}
          </p>
          <div className="mt-4 flex gap-2.5">
            {[
              { Icon: Linkedin, label: "LinkedIn" },
              { Icon: Youtube, label: "YouTube" },
              { Icon: Mail, label: "Email", href: c.emailHref },
            ].map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href ?? "#"}
                aria-label={label}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/12"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <FooterCol
          title={pickL(c.company, locale)}
          links={c.companyLinks.map((item, i) => ({
            label: vi ? item.vi : item.en,
            href: p(COMPANY_HREFS[i]),
          }))}
        />
        <FooterCol
          title={pickL(c.ingredients, locale)}
          links={c.ingredientLinks.map((item, i) => ({
            label: vi ? item.vi : item.en,
            href: p(INGREDIENT_HREFS[i]),
          }))}
        />
        <FooterCol
          title={pickL(c.support, locale)}
          links={c.supportLinks.map((item, i) => ({
            label: vi ? item.vi : item.en,
            href: p(SUPPORT_HREFS[i]),
          }))}
        />

        <div>
          <h4 className="text-[14.5px] font-bold text-white">{pickL(c.contactUs, locale)}</h4>
          <ul className="mt-4 space-y-1 text-[13px] text-white/68">
            <li className="flex gap-2 py-1">
              <Phone className="mt-0.5 h-[15px] w-[15px] shrink-0" />
              <a href={c.phoneHref} className="hover:text-white">
                {c.phone}
              </a>
            </li>
            <li className="flex gap-2 py-1">
              <Mail className="mt-0.5 h-[15px] w-[15px] shrink-0" />
              <a href={c.emailHref} className="hover:text-white">
                {c.email}
              </a>
            </li>
            <li className="flex gap-2 py-1 leading-snug">
              <MapPin className="mt-0.5 h-[15px] w-[15px] shrink-0" />
              <span>{pickL(c.address, locale)}</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[14.5px] font-bold text-white">{pickL(c.stayUpdated, locale)}</h4>
          <form className="mt-4 flex gap-2">
            <input
              type="email"
              placeholder={pickL(c.emailPlaceholder, locale)}
              className="min-w-0 flex-1 rounded-md border border-white/25 bg-white/[0.06] px-3 py-2.5 text-[13px] text-white outline-none placeholder:text-white/50"
            />
            <button
              type="button"
              aria-label={vi ? "Đăng ký" : "Subscribe"}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-dark text-white transition-colors hover:bg-primary-deeper"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-3.5 text-[13px] leading-relaxed text-white/65">
            {pickL(c.newsletterNote, locale)}
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-bs flex flex-col gap-3 py-5 text-[13px] text-white/55 lg:flex-row lg:items-center lg:justify-between">
          <p>
            © {year} Bioscope. {pickL(c.rights, locale)}
          </p>
          <div className="flex flex-wrap gap-5">
            <Link href={p("/chinh-sach-bao-mat")} className="hover:text-white">
              {pickL(c.privacy, locale)}
            </Link>
            <Link href={p("/cau-hoi-thuong-gap")} className="hover:text-white">
              {pickL(c.terms, locale)}
            </Link>
            <Link href="/sitemap.xml" className="hover:text-white">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-[14.5px] font-bold text-white">{title}</h4>
      <ul className="mt-4">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="block py-1.5 text-[13px] text-white/68 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
