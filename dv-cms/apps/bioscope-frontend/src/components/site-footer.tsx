'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Globe, MessageCircle, Share2, Send, Phone, Mail, MailCheck, MapPin, ChevronRight, FileText } from 'lucide-react'
import { useLocale } from '@/lib/i18n/context'
import { FooterNewsletter } from '@/components/footer-newsletter'
import type { FooterContent } from '@/lib/cms/footer'

/**
 * Icon theo nền tảng. Trước đây danh sách này cứng trong code và mọi link đều
 * href="#" — tức là bốn nút bấm không đi đâu cả. Nay lấy từ CMS.
 */
const SOCIAL_ICON: Record<string, typeof Globe> = {
  website: Globe,
  zalo: MessageCircle,
  linkedin: Share2,
  facebook: Share2,
  instagram: Share2,
  youtube: Send,
  tiktok: Send,
  x: Send,
}

const FOOTER_HREFS = [
  ['/nguyen-lieu', '/nguyen-lieu', '/nguyen-lieu', '/nguyen-lieu'],
  ['/giai-phap/cung-cap-nguyen-lieu', '/giai-phap/phat-trien-cong-thuc-odm', '/giai-phap/dong-kien-tao-toan-hanh-trinh'],
  ['/ve-chung-toi', '/rd', '/case-study', '/tai-nguyen'],
  ['/lien-he', '/lien-he', '/cau-hoi-thuong-gap', '/chinh-sach-bao-mat', '/member/login'],
] as const

type Col = { title: string; links: { label: string; href: string }[] }

/** Section heading with a short accent underline (matches the brand accent). */
function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="relative pb-3 text-[13px] font-bold uppercase tracking-[0.14em] text-ink">
      {children}
      <span aria-hidden className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-accent" />
    </h4>
  )
}

/** A navigation group: title + chevron-marked links. */
function NavGroup({ col }: { col: Col }) {
  return (
    <div>
      <ColTitle>{col.title}</ColTitle>
      <ul className="mt-4 space-y-2.5">
        {col.links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="group flex items-center gap-2 text-[14px] text-ink/65 transition-colors hover:text-primary"
            >
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SiteFooter({ columns, footer }: { columns?: Col[]; footer?: FooterContent | null }) {
  const company = footer?.company
  const { t } = useLocale()
  // Footer columns from the CMS `navigation` global (falls back to static i18n).
  const fallback: Col[] = (['ingredients', 'solutions', 'company', 'support'] as const).map((key, c) => ({
    title: t.footer.cols[key].title,
    links: t.footer.cols[key].links.map((label, i) => ({ label, href: FOOTER_HREFS[c][i] ?? '#' })),
  }))
  const cols = columns && columns.length > 0 ? columns : fallback

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-mist to-primary-tint text-ink">
      {/* Faint corner glow for depth. */}
      <div aria-hidden className="pointer-events-none absolute -right-32 top-10 h-72 w-72 rounded-full bg-primary/[0.08] blur-3xl" />

      <div className="container-bs relative">
        {/* ── 4 columns · company | menu | menu | newsletter ────────────── */}
        <div className="grid gap-x-10 gap-y-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1.4fr]">
          {/* Column 1 — company */}
          <div>
            <Image src="/logo.avif" alt="Bioscope" width={150} height={42} className="h-11 w-auto" />
            <p className="mt-4 max-w-md text-[13.5px] leading-relaxed text-ink/60">
              {company?.companyName && <span className="font-semibold text-ink">{company.companyName} — </span>}
              {company?.tagline || t.footer.tagline}
            </p>

            <div className="mt-5 space-y-3 text-[13px] leading-relaxed text-ink/65">
              {company?.address && (
                <p className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.7} />
                  <span>
                    <span className="font-medium text-ink/80">{t.footer.company.registered}: </span>
                    {company.address}
                  </span>
                </p>
              )}
              {company?.officeAddress && (
                <p className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.7} />
                  <span>
                    <span className="font-medium text-ink/80">{t.footer.company.office}: </span>
                    {company.officeAddress}
                  </span>
                </p>
              )}
              {company?.mst && (
                <p className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.7} />
                  <span>
                    <span className="font-medium text-ink/80">{t.footer.company.taxCode}: </span>
                    {company.mst}
                  </span>
                </p>
              )}
              {company?.phone && (
                <a href={`tel:${company.phone.replace(/\s+/g, '')}`} className="flex items-center gap-2.5 font-semibold text-ink transition-colors hover:text-primary">
                  <Phone className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.8} />
                  {company.phone}
                </a>
              )}
              {company?.email && (
                <a href={`mailto:${company.email}`} className="flex items-center gap-2.5 transition-colors hover:text-primary">
                  <Mail className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.8} />
                  <span>
                    <span className="font-medium text-ink/80">{t.footer.company.email}: </span>
                    {company.email}
                  </span>
                </a>
              )}
              {company?.invoiceEmail && (
                <a href={`mailto:${company.invoiceEmail}`} className="flex items-center gap-2.5 transition-colors hover:text-primary">
                  <MailCheck className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.8} />
                  <span>
                    <span className="font-medium text-ink/80">{t.footer.company.invoiceEmail}: </span>
                    {company.invoiceEmail}
                  </span>
                </a>
              )}
              {company?.website && (
                <a
                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 transition-colors hover:text-primary"
                >
                  <Globe className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.8} />
                  {company.website}
                </a>
              )}
            </div>

            {/* social */}
            <div className="mt-6 flex gap-2.5">
              {(footer?.social ?? []).map(({ platform, url }) => {
                const Icon = SOCIAL_ICON[platform ?? ''] ?? Globe
                return (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={platform ?? 'Liên kết'}
                  className="group grid h-9 w-9 place-items-center rounded-full border border-primary-border bg-white text-ink/55 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-md"
                >
                  <Icon className="h-[17px] w-[17px] transition-transform group-hover:scale-110" strokeWidth={1.6} />
                </a>
                )
              })}
            </div>
          </div>

          {/* Column 2 — menu */}
          {cols[0] && <NavGroup col={cols[0]} />}

          {/* Column 3 — menu */}
          {cols[2] && <NavGroup col={cols[2]} />}

          {/* Column 4 — newsletter */}
          <div>
            <ColTitle>{footer?.newsletter?.title || t.footer.newsletter.title}</ColTitle>
            <p className="mb-4 mt-4 text-[13px] leading-relaxed text-ink/60">{footer?.newsletter?.description || t.footer.newsletter.desc}</p>
            <FooterNewsletter
              placeholder={footer?.newsletter?.placeholder}
              buttonLabel={footer?.newsletter?.buttonLabel}
            />
          </div>
        </div>
      </div>

      {/* ── Copyright + policy (dark anchor bar) ───────────────────────── */}
      <div className="relative bg-primary-dark text-white/70">
        <div className="container-bs flex flex-col items-center justify-between gap-2 py-5 text-[12.5px] sm:flex-row">
          <span>{footer?.copyright || t.footer.copyright}</span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Link href="/chinh-sach-bao-mat" className="transition-colors hover:text-white">
              {t.footer.privacy}
            </Link>
            <span aria-hidden className="text-white/30">·</span>
            <Link href="/dieu-khoan-su-dung" className="transition-colors hover:text-white">
              {t.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
